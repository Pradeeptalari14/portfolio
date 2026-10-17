const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('.');
const htmlFiles = [];

function findHtml(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(entry.name)) {
        findHtml(full);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlFiles.push(full);
    }
  }
}

findHtml(rootDir);
console.log('Total HTML files scanned:', htmlFiles.length);

const brokenAssets = [];
const brokenLinks = [];

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const fileDir = path.dirname(file);

  // Check script src
  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const src = match[1];
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//') || src.startsWith('data:')) continue;
    
    let resolved;
    if (src.startsWith('/')) {
      resolved = path.join(rootDir, src);
    } else {
      resolved = path.join(fileDir, src);
    }
    resolved = resolved.split('?')[0].split('#')[0];
    if (!fs.existsSync(resolved)) {
      brokenAssets.push({ file: path.relative(rootDir, file), tag: 'script', src, resolved: path.relative(rootDir, resolved) });
    }
  }

  // Check link href (stylesheets, icons, manifests)
  const linkRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  while ((match = linkRegex.exec(content)) !== null) {
    const tag = match[0];
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('data:') || href.startsWith('mailto:') || href.startsWith('#')) continue;
    if (tag.includes('rel="canonical"') || tag.includes("rel='canonical'")) continue;
    
    let resolved;
    if (href.startsWith('/')) {
      resolved = path.join(rootDir, href);
    } else {
      resolved = path.join(fileDir, href);
    }
    resolved = resolved.split('?')[0].split('#')[0];
    if (!fs.existsSync(resolved)) {
      brokenAssets.push({ file: path.relative(rootDir, file), tag: 'link', src: href, resolved: path.relative(rootDir, resolved) });
    }
  }

  // Strip <script> and <style> and <template> tags before checking <a> links
  const noScriptContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                 .replace(/<template\b[^<]*(?:(?!<\/template>)<[^<]*)*<\/template>/gi, '');

  // Check <a> href internal links
  const aRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  while ((match = aRegex.exec(noScriptContent)) !== null) {
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('data:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('#')) continue;
    if (href.includes('${')) continue; // Skip JS template literals
    
    let resolved;
    if (href.startsWith('/')) {
      resolved = path.join(rootDir, href);
    } else {
      resolved = path.join(fileDir, href);
    }
    resolved = resolved.split('?')[0].split('#')[0];
    
    // If it's a directory, check for index.html inside
    let exists = fs.existsSync(resolved);
    if (exists && fs.statSync(resolved).isDirectory()) {
      exists = fs.existsSync(path.join(resolved, 'index.html'));
    }
    if (!exists) {
      brokenLinks.push({ file: path.relative(rootDir, file), href, resolved: path.relative(rootDir, resolved) });
    }
  }
});

fs.mkdirSync('scratch', { recursive: true });
fs.writeFileSync('scratch/crawler_results.json', JSON.stringify({
  brokenAssets,
  brokenLinksCount: brokenLinks.length,
  brokenLinksSample: brokenLinks.slice(0, 30),
  uniqueBrokenLinks: Array.from(new Set(brokenLinks.map(b => b.href)))
}, null, 2));
console.log('Results saved to scratch/crawler_results.json');
console.log('Broken assets count:', brokenAssets.length);
console.log('Broken assets list:', JSON.stringify(brokenAssets, null, 2));

