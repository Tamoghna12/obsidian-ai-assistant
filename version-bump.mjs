import fs from 'fs';
import { execSync } from 'child_process';

// Get version bump type from command line arguments
const versionBump = process.argv[2] || 'patch';

// Read package.json
const packageJsonPath = './package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const oldVersion = packageJson.version;

// Bump version using npm
console.log(`Bumping version from ${oldVersion} to ${versionBump}...`);
execSync(`npm version ${versionBump} --no-git-tag-version`, { stdio: 'inherit' });

// Read updated package.json
const updatedPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const newVersion = updatedPackageJson.version;

console.log(`Version bumped from ${oldVersion} to ${newVersion}`);

// Update manifest.json
const manifestJsonPath = './manifest.json';
const manifestJson = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf-8'));
manifestJson.version = newVersion;
fs.writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 2));

console.log('Updated manifest.json with new version');

// Update versions.json
const versionsJsonPath = './versions.json';
let versionsJson = {};
if (fs.existsSync(versionsJsonPath)) {
  versionsJson = JSON.parse(fs.readFileSync(versionsJsonPath, 'utf-8'));
}

versionsJson[newVersion] = manifestJson.minAppVersion;
fs.writeFileSync(versionsJsonPath, JSON.stringify(versionsJson, null, 2));

console.log('Updated versions.json with new version');

// Commit changes
console.log('Committing changes...');
execSync(`git add ${packageJsonPath} ${manifestJsonPath} ${versionsJsonPath}`, { stdio: 'inherit' });
execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });

console.log(`Version bump complete! New version: ${newVersion}`);