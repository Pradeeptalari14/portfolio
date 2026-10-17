const fs = require('fs');
const path = require('path');
const rootDir = path.resolve('.');

const mainFiles = [
  'index.html',
  'projects/index.html',
  'studios/index.html',
  'studios/learn/index.html',
  'studios/flow/index.html',
  'tools/index.html',
  'toolbox/index.html',
  'interview/index.html',
  'AI/index.html',
  'architecture/index.html',
  'experience/index.html',
  'finops/index.html',
  'incident/index.html',
  'knowledge/index.html',
  'learning/index.html',
  'resume/index.html',
  'status/index.html'
];

const broken = [];
mainFiles.forEach(rel => {
  const full = path.join(rootDir, rel);
  if (!fs.existsSync(full)) {
    broken.push({ file: rel, error: 'File does not exist' });
    return;
  }
  const content = fs.readFileSync(full, 'utf8');
  const fileDir = path.dirname(full);
  const cleanContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = aRegex.exec(cleanContent)) !== null) {
    const href = match[1];
    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('data:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || href.includes('${')) continue;
    
    let resolved = href.startsWith('/') ? path.join(rootDir, href) : path.join(fileDir, href);
    resolved = resolved.split('?')[0].split('#')[0];
    let exists = fs.existsSync(resolved);
    if (exists && fs.statSync(resolved).isDirectory()) {
      exists = fs.existsSync(path.join(resolved, 'index.html'));
    }
    if (!exists) {
      broken.push({ file: rel, href, resolved: path.relative(rootDir, resolved) });
    }
  }
});

const secDir = path.join(rootDir, 'sections');
const secFiles = fs.readdirSync(secDir).filter(f => f.endsWith('.html'));
secFiles.forEach(sec => {
  const full = path.join(secDir, sec);
  const content = fs.readFileSync(full, 'utf8');
  const cleanContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = aRegex.exec(cleanContent)) !== null) {
    const href = match[1];
    if (href.startsWith('http') || href.startsWith('//') || href.startsWith('data:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || href.includes('${')) continue;
    let resolved = path.join(rootDir, href);
    resolved = resolved.split('?')[0].split('#')[0];
    let exists = fs.existsSync(resolved);
    if (exists && fs.statSync(resolved).isDirectory()) {
      exists = fs.existsSync(path.join(resolved, 'index.html'));
    }
    if (!exists) {
      broken.push({ file: 'sections/' + sec, href, resolved: path.relative(rootDir, resolved) });
    }
  }
});

console.log('Broken links count in main hub pages & sections:', broken.length);
console.log(JSON.stringify(broken, null, 2));
