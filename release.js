const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const version = packageJson.version;

console.log(`Creating release for version ${version}...`);

try {
  // Build the plugin
  console.log('Building plugin...');
  execSync('npm run build', { stdio: 'inherit' });

  // Create releases directory if it doesn't exist
  const releasesDir = path.join(__dirname, 'releases');
  if (!fs.existsSync(releasesDir)) {
    fs.mkdirSync(releasesDir);
  }

  // Copy files to releases directory
  const filesToCopy = ['main.js', 'manifest.json', 'styles.css'];
  filesToCopy.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(releasesDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${file} to releases directory`);
    } else {
      console.warn(`Warning: ${file} not found`);
    }
  });

  // Create zip file
  const zipFileName = `obsidian-ai-assistant-${version}.zip`;
  const zipFilePath = path.join(releasesDir, zipFileName);
  
  console.log(`Creating ${zipFileName}...`);
  execSync(`cd ${releasesDir} && zip -r ${zipFileName} main.js manifest.json styles.css`, { stdio: 'inherit' });

  console.log(`Release ${version} created successfully!`);
  console.log(`Files are located in: ${releasesDir}`);
  console.log(`Zip file: ${zipFilePath}`);
} catch (error) {
  console.error('Error creating release:', error.message);
  process.exit(1);
}