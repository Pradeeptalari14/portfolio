const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
  console.error("Error: dist directory does not exist.");
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
console.log(`Auditing ${htmlFiles.length} HTML files in dist/`);

const broken = [];

for (const file of htmlFiles) {
  const relativeFile = path.relative(distDir, file).split(path.sep).join('/');
  let content = fs.readFileSync(file, 'utf8');
  // Strip inline script bodies (without src) and style blocks to avoid matching internal regex strings
  content = content.replace(/<script\b(?![^>]*\bsrc=)[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  const regex = /(?:href|src)="([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    let link = match[1];

    if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('mailto:') || link.startsWith('tel:') || link.startsWith('javascript:')) {
      continue;
    }
    if (link.includes('${') || link === '' || link.startsWith('#')) {
      continue;
    }

    const queryIdx = link.indexOf('?');
    if (queryIdx !== -1) link = link.substring(0, queryIdx);
    const hashIdx = link.indexOf('#');
    if (hashIdx !== -1) link = link.substring(0, hashIdx);
    if (link === '') continue;

    let targetPath;
    if (link.startsWith('/')) {
      targetPath = path.join(distDir, ...link.split('/'));
    } else {
      targetPath = path.resolve(path.dirname(file), ...link.split('/'));
    }

    const exists = fs.existsSync(targetPath) ||
                   fs.existsSync(targetPath + '.html') ||
                   fs.existsSync(path.join(targetPath, 'index.html'));

    if (!exists) {
      broken.push({
        file: relativeFile,
        attr: match[0],
        link,
        target: path.relative(distDir, targetPath).split(path.sep).join('/')
      });
    }
  }
}

console.log(`Total broken references found: ${broken.length}`);

const grouped = {};
for (const b of broken) {
  const ext = path.extname(b.link) || 'no-extension';
  if (!grouped[ext]) grouped[ext] = [];
  grouped[ext].push(b);
}

for (const [ext, list] of Object.entries(grouped)) {
  console.log(`\n--- Extension: ${ext} (${list.length} occurrences) ---`);
  list.forEach(i => console.log(`  [${i.file}] ${i.attr} -> ${i.target}`));
}

