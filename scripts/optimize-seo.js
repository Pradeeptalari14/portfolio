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
console.log(`Processing SEO optimizations for ${htmlFiles.length} HTML files...`);

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  const relativeFile = path.relative(distDir, file).replace(/\\/g, '/');
  
  // 1. Calculate canonical URL route
  let routePath = relativeFile;
  if (routePath.endsWith('index.html')) {
    routePath = routePath.substring(0, routePath.length - 10);
  }
  const canonicalUrl = `https://talaripradeep.info/${routePath}`;
  
  // Clean existing canonical link if present to avoid duplication
  content = content.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '');
  
  // Inject canonical URL into head
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
  if (content.includes('</head>')) {
    content = content.replace('</head>', `  ${canonicalTag}\n</head>`);
  } else if (content.includes('</HEAD>')) {
    content = content.replace('</HEAD>', `  ${canonicalTag}\n</HEAD>`);
  }

  // 2. Add rel="noopener noreferrer" to external blank links
  content = content.replace(/<a\s+([^>]*href=["']https?:\/\/[^"']+["'][^>]*target=["']_blank["'])/gi, (m, p1) => {
    if (!p1.includes('rel=')) {
      return `<a ${p1} rel="noopener noreferrer"`;
    }
    return m;
  });
  content = content.replace(/<a\s+([^>]*target=["']_blank["'][^>]*href=["']https?:\/\/[^"']+["'])/gi, (m, p1) => {
    if (!p1.includes('rel=')) {
      return `<a ${p1} rel="noopener noreferrer"`;
    }
    return m;
  });

  // 3. Ensure all image tags have alt attributes
  content = content.replace(/<img\s+([^>]*)/gi, (m, p1) => {
    if (!p1.includes('alt=')) {
      // Generate clean description from src filename
      const srcMatch = p1.match(/src=["']([^"']+)["']/i);
      let desc = "Talari Pradeep Portfolio Asset";
      if (srcMatch) {
        const filename = path.basename(srcMatch[1], path.extname(srcMatch[1]));
        desc = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }
      return `<img ${p1} alt="${desc}"`;
    }
    return m;
  });

  // 4. Clean duplicate/multiple H1 tags
  let h1Count = 0;
  content = content.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/gi, (m, p1, p2) => {
    h1Count++;
    if (h1Count > 1) {
      console.log(`[SEO - Downgraded H1] in ${relativeFile}`);
      return `<h2${p1}>${p2}</h2>`;
    }
    return m;
  });

  // 5. Trim titles over 60 characters
  content = content.replace(/<title>([\s\S]*?)<\/title>/gi, (m, titleText) => {
    let cleanedText = titleText.trim();
    if (cleanedText.length > 60) {
      console.log(`[SEO - Trimmed Title] in ${relativeFile}: "${cleanedText}"`);
      const parts = cleanedText.split('|');
      if (parts.length > 1) {
        let leftPart = parts[0].trim();
        let rightPart = parts.slice(1).join('|').trim();
        if (leftPart.length + rightPart.length + 3 > 60) {
          leftPart = leftPart.substring(0, 57 - rightPart.length - 3) + '...';
        }
        cleanedText = `${leftPart} | ${rightPart}`;
      } else {
        cleanedText = cleanedText.substring(0, 57) + '...';
      }
    }
    return `<title>${cleanedText}</title>`;
  });

  // 6. Enforce meta descriptions constraints
  content = content.replace(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/gi, (m, descText) => {
    let cleanedDesc = descText.trim();
    if (cleanedDesc.length > 155) {
      console.log(`[SEO - Trimmed Meta Description] in ${relativeFile}`);
      cleanedDesc = cleanedDesc.substring(0, 152) + '...';
    }
    return `<meta name="description" content="${cleanedDesc}"`;
  });

  fs.writeFileSync(file, content, 'utf8');
}

console.log("SEO post-processor successfully completed operations on all build outputs!");
