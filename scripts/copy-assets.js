const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error("Error: dist/ directory does not exist.");
  process.exit(1);
}

function copyFile(srcRelative, destRelative) {
  const srcPath = path.join(rootDir, srcRelative);
  const destPath = path.join(distDir, destRelative);
  
  if (!fs.existsSync(srcPath)) {
    console.error(`Source file not found: ${srcPath}`);
    return;
  }
  
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${srcRelative} -> dist/${destRelative}`);
}

copyFile('src/js/core-tool.js', 'src/js/core-tool.js');
copyFile('tools/shared-tools.js', 'tools/shared-tools.js');
copyFile('tools/tools.json', 'tools/tools.json');
copyFile('interview/topics.json', 'interview/topics.json');
copyFile('AI/studios.json', 'AI/studios.json');

// Sync tools/ to public/tools/ to prevent drift
const root = path.resolve(__dirname, '..');

function syncFile(srcRel, destRel) {
  const src = path.join(root, srcRel);
  const dest = path.join(root, destRel);
  if (fs.existsSync(src)) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`Synced ${srcRel} -> ${destRel}`);
  }
}

syncFile('tools/shared-tools.js', 'public/tools/shared-tools.js');
syncFile('tools/shared-tools.css', 'public/tools/shared-tools.css');

