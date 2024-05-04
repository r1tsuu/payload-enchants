import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);

const type = args[0] as 'major' | 'minor' | 'patch';

if (!['major', 'minor', 'patch'].includes(type)) {
  console.error('Type should be major | minor | patch');
  process.exit(1);
}

const bump = (version: string, type: 'major' | 'minor' | 'patch'): string => {
  const parts = version.split('.');

  const major = parseInt(parts[0]);

  const minor = parseInt(parts[1]);

  const patch = parseInt(parts[2]);

  let bumpedMajor = major;

  let bumpedMinor = minor;

  let bumpedPatch = patch;

  switch (type) {
    case 'major':
      bumpedMajor++;
      bumpedMinor = 0;
      bumpedPatch = 0;
      break;
    case 'minor':
      bumpedMinor++;
      bumpedPatch = 0;
      break;
    case 'patch':
      bumpedPatch++;
      break;
  }

  // Reassemble the version string
  return `${bumpedMajor}.${bumpedMinor}.${bumpedPatch}`;
};

const packageJsonPaths = [
  './package.json',
  './packages/docs-reorder/package.json',
  './packages/translator/package.json',
  './packages/better-localized-fields/package.json',
  './test/package.json',
];

const bumpVersion = () => {
  for (const packageFile of packageJsonPaths) {
    const packageJsonPath = path.resolve(import.meta.dirname, '../', packageFile);

    const packageJson = fs.readFileSync(packageJsonPath, 'utf-8');

    if (!packageJson) {
      console.error('package.json was not found');
      process.exit(1);
    }

    const packageJsonObject = JSON.parse(packageJson) as {
      version: string;
    };

    packageJsonObject.version = bump(packageJsonObject.version, type);

    console.log(`Bumped to ${packageJsonObject.version}`);

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJsonObject), {
      encoding: 'utf-8',
      flag: 'w',
    });

    execSync(`npx prettier ${packageJsonPath} --write`);

    console.log(
      `Successfully bumped version of ${path.dirname(packageFile)} to ${packageJsonObject.version}`,
    );
  }
};

bumpVersion();
