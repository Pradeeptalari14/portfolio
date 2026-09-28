const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicSitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
const distSitemapPath = path.join(rootDir, 'dist', 'sitemap.xml');
const toolsJsonPath = path.join(rootDir, 'tools', 'tools.json');

const tools = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));
const today = new Date().toISOString().split('T')[0];

const corePages = [
  { url: '', priority: '1.0', changefreq: 'weekly' },
  { url: 'skills/', priority: '0.8', changefreq: 'monthly' },
  { url: 'projects/', priority: '0.8', changefreq: 'monthly' },
  { url: 'experience/', priority: '0.8', changefreq: 'monthly' },
  { url: 'certifications/', priority: '0.8', changefreq: 'monthly' },
  { url: 'resume/', priority: '0.8', changefreq: 'monthly' },
  { url: 'architecture/', priority: '0.8', changefreq: 'monthly' },
  { url: 'studios/', priority: '0.9', changefreq: 'weekly' },
  { url: 'studios/learn/', priority: '0.9', changefreq: 'weekly' },
  { url: 'incident/', priority: '0.8', changefreq: 'monthly' },
  { url: 'toolbox/', priority: '0.8', changefreq: 'monthly' },
  { url: 'finops/', priority: '0.8', changefreq: 'monthly' },
  { url: 'knowledge/', priority: '0.8', changefreq: 'monthly' },
  { url: 'learning/', priority: '0.8', changefreq: 'monthly' },
  { url: 'interview/', priority: '0.8', changefreq: 'monthly' },
  { url: 'status/', priority: '0.8', changefreq: 'daily' },
  { url: 'AI/', priority: '0.8', changefreq: 'weekly' },
  { url: 'tools/', priority: '0.9', changefreq: 'weekly' },
  { url: 'tools/github-provisioning-guide/', priority: '0.8', changefreq: 'monthly' }
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Core Portfolio & Platform Hubs -->
`;

corePages.forEach(p => {
  xml += `  <url>
    <loc>https://talaripradeep.info/${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>
`;
});

xml += `
  <!-- All ${tools.length} Interactive Developer Studios & SRE Tools -->
`;

const addedUrls = new Set(corePages.map(p => p.url));

tools.forEach(tool => {
  let link = (tool.link || '').replace(/^\/+/, '');
  if (!link.endsWith('/')) {
    link += '/';
  }
  const fullRoute = `tools/${link}`;
  if (!addedUrls.has(fullRoute)) {
    addedUrls.add(fullRoute);
    xml += `  <url>
    <loc>https://talaripradeep.info/${fullRoute}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }
});

xml += `
</urlset>
`;

fs.writeFileSync(publicSitemapPath, xml, 'utf8');
console.log(`Generated public/sitemap.xml with ${addedUrls.size} URLs.`);

if (fs.existsSync(path.dirname(distSitemapPath))) {
  fs.writeFileSync(distSitemapPath, xml, 'utf8');
  console.log(`Synced dist/sitemap.xml.`);
}
