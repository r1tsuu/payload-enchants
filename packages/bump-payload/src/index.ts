import PackageJson from '@npmcli/package-json';
import path from 'path';

const updateDeps = ({
  countRef,
  deps,
  latest,
  logPrefix,
}: {
  countRef: { count: number };
  deps: Partial<Record<string, string>>;
  latest: string;
  logPrefix: string;
}) => {
  return Object.entries(deps)
    .filter(
      ([name, currentVersion]) =>
        (name === 'payload' || name.startsWith('@payloadcms/')) &&
        !currentVersion?.includes(latest),
    )
    .reduce(
      (acc, [packageName, currentVersion]) => {
        const updatedVersion = currentVersion?.includes('^') ? `^${latest}` : latest;

        countRef.count++;
        console.log(`Updated ${logPrefix}: ${packageName}: ${currentVersion} -> ${updatedVersion}`);
        acc[packageName] = updatedVersion;

        return acc;
      },
      {} as Partial<Record<string, string>>,
    );
};

export const bin = async () => {
  const pkgJson = await PackageJson.load(path.resolve(process.cwd()));

  const releases = await fetch(`https://api.github.com/repos/payloadcms/payload/releases`).then(
    (res) =>
      res.json() as Promise<
        {
          tag_name: string;
        }[]
      >,
  );

  const latest = releases.find((release) => release.tag_name.includes('3.0.0'))?.tag_name;

  if (!latest) {
    console.error('Release was not found');
    process.exit(1);
  }

  console.log(`Found a latest Payload 3.0 version - ${latest}`);

  const { content } = pkgJson;

  const updatedPackageJson: typeof content = {};

  const countRef = {
    count: 0,
  };

  if (content.dependencies)
    updatedPackageJson.dependencies = {
      ...content.dependencies,
      ...updateDeps({
        countRef,
        deps: content.dependencies,
        latest,
        logPrefix: 'dependency',
      }),
    };

  if (content.peerDependencies)
    updatedPackageJson.peerDependencies = {
      ...content.peerDependencies,
      ...updateDeps({
        countRef,
        deps: content.peerDependencies,
        latest,
        logPrefix: 'peerDependency',
      }),
    };

  if (content.devDependencies)
    updatedPackageJson.devDependencies = {
      ...content.devDependencies,
      ...updateDeps({
        countRef,
        deps: content.devDependencies,
        latest,
        logPrefix: 'devDependency',
      }),
    };

  if (!countRef.count) {
    console.log('All packages are already up to date with the latest version.');
    process.exit(0);
  }

  pkgJson.update(updatedPackageJson);
  await pkgJson.save();

  console.log(`${countRef.count} packages have been updated.`);

  process.exit(0);
};

bin();
