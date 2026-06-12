const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error("Error: dist directory does not exist. Please run npm run build first.");
  process.exit(1);
}

function getHtmlFiles(dir, files_ = []) {
  const files = fs.readdirSync(dir);
  for (const i in files) {
    const name = path.join(dir, files[i]);
    if (fs.statSync(name).isDirectory()) {
      getHtmlFiles(name, files_);
    } else if (name.endsWith('.html')) {
      files_.push(name);
    }
  }
  return files_;
}

const htmlFiles = getHtmlFiles(distDir);
console.log(`Scanning ${htmlFiles.length} production HTML files in dist/`);

let brokenLinksCount = 0;

for (const file of htmlFiles) {
  const relativeFile = path.relative(distDir, file);
  const content = fs.readFileSync(file, 'utf8');

  const regex = /(?:href|src)="([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let link = match[1];

    if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('mailto:') || link.startsWith('javascript:')) {
      continue;
    }

    if (link.includes('${')) {
      continue;
    }

    const queryIdx = link.indexOf('?');
    if (queryIdx !== -1) {
      link = link.substring(0, queryIdx);
    }
    const hashIdx = link.indexOf('#');
    if (hashIdx !== -1) {
      link = link.substring(0, hashIdx);
    }

    if (link === '') {
      continue;
    }

    let targetPath;
    let exists = false;

    if (link.startsWith('/')) {
      targetPath = path.join(distDir, link);
    } else {
      const fileDir = path.dirname(file);
      targetPath = path.resolve(fileDir, link);
    }

    if (fs.existsSync(targetPath)) {
      exists = true;
    } else if (fs.existsSync(targetPath + '.html')) {
      exists = true;
    } else if (fs.existsSync(path.join(targetPath, 'index.html'))) {
      exists = true;
    }

    if (!exists) {
      console.log(`[BROKEN] in ${relativeFile}: "${match[0]}" resolves to non-existent path: ${targetPath}`);
      brokenLinksCount++;
    }
  }
}

console.log(`Scanning finished. Found ${brokenLinksCount} broken links in production build.`);
if (brokenLinksCount > 0) {
  process.exit(1);
} else {
  console.log("SUCCESS: All internal links are valid!");
}
