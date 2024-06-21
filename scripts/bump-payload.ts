/**
 * Place this to ./src/scripts/bump-payload.ts
 * Then in your package.json add script:
 * "bump-payload": "tsx ./src/scripts/bump-payload.ts ./package.json"
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const packageJsonPaths = [
  './package.json',
  './packages/docs-reorder/package.json',
  './packages/translator/package.json',
  './packages/better-localized-fields/package.json',
  './packages/better-use-as-title/package.json',
  './packages/cached-local-api/package.json',
  './packages/seo/package.json',
  './packages/fields-select/package.json',
  './test/package.json',
];

const bumpDeps = ({
  deps,
  shouldMatchVersion,
  version,
}: {
  deps: Record<string, string>;
  /** whatever use "^" or not */
  shouldMatchVersion?: boolean;
  version: string;
}) => {
  Object.keys(deps).forEach((packageName) => {
    if (packageName === 'payload' || packageName.startsWith('@payloadcms/')) {
      deps[packageName] = shouldMatchVersion ? version : `^${version}`;
      if (deps[packageName].startsWith('v')) {
        deps[packageName] = deps[packageName].substring(1);
      }
    }
  });
};

const start = async () => {
  const releases = await fetch(`https://api.github.com/repos/payloadcms/payload/releases`).then(
    (res) =>
      res.json() as Promise<
        {
          tag_name: string;
        }[]
      >,
  );

  let latest = releases.find((release) => release.tag_name.includes('3.0.0'))?.tag_name;

  if (!latest) {
    console.error('Release was not found');
    process.exit(1);
  }

  if (latest.startsWith('v')) latest = latest.substring(1);

  console.log(`Found latest payload 3.0 version - ${latest}`);

  for (const relativePath of packageJsonPaths) {
    console.log(`Resolving ${relativePath}`);
    const packageJsonPath = path.resolve(import.meta.dirname, '../', relativePath);

    const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');

    if (!packageJson) {
      console.error('package.json was not found');
      process.exit(1);
    }

    const packageJsonObject = JSON.parse(packageJson) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      peerDependencies?: Record<string, string>;
    };

    if (packageJsonObject.dependencies)
      bumpDeps({ deps: packageJsonObject.dependencies, version: latest });
    if (packageJsonObject.devDependencies)
      bumpDeps({
        deps: packageJsonObject.devDependencies,
        shouldMatchVersion: true,
        version: latest,
      });
    if (packageJsonObject.peerDependencies)
      bumpDeps({ deps: packageJsonObject.peerDependencies, version: latest });

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonObject), {
      encoding: 'utf-8',
      flag: 'w',
    });

    execSync(`npx prettier ${packageJsonPath} --write`);
  }

  console.log(`Successfully bumped versions to ${latest}`);
};

start();
