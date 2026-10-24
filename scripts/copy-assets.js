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
  
  try {
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcRelative} -> dist/${destRelative}`);
  } catch (err) {
    console.warn(`Warning: failed to copy ${srcRelative} -> ${destRelative}: ${err.message}`);
  }
}

function syncFile(srcRel, destRel) {
  const src = path.join(rootDir, srcRel);
  const dest = path.join(rootDir, destRel);
  if (fs.existsSync(src)) {
    try {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(src, dest);
      console.log(`Synced ${srcRel} -> ${destRel}`);
    } catch (err) {
      console.warn(`Warning: failed to sync ${srcRel} -> ${destRel}: ${err.message}`);
    }
  }
}

copyFile('src/js/core-tool.js', 'src/js/core-tool.js');
copyFile('src/js/studio-sdk.js', 'src/js/studio-sdk.js');
copyFile('academy/academy.js', 'academy/academy.js');
copyFile('academy/academy.css', 'academy/academy.css');
copyFile('js/nav.js', 'js/nav.js');
copyFile('tools/shared-tools.js', 'tools/shared-tools.js');
copyFile('tools/visual-flow-canvas.js', 'tools/visual-flow-canvas.js');
copyFile('tools/visual-flow-canvas.css', 'tools/visual-flow-canvas.css');
copyFile('tools/tools.json', 'tools/tools.json');
copyFile('interview/topics.json', 'interview/topics.json');
copyFile('AI/studios.json', 'AI/studios.json');
copyFile('studios/learn/studios-learning.json', 'studios/learn/studios-learning.json');
copyFile('studios/flow/index.html', 'studios/flow/index.html');
copyFile('Talari_Pradeep.pdf', 'Talari_Pradeep.pdf');
copyFile('Talari_Pradeep.docx', 'Talari_Pradeep.docx');
copyFile('devsecops_architecture_flow.png', 'devsecops_architecture_flow.png');

// Sync all JS generators
const genSrcDir = path.join(rootDir, 'src', 'js', 'generators');
if (fs.existsSync(genSrcDir)) {
  const genFiles = fs.readdirSync(genSrcDir);
  genFiles.forEach(file => {
    if (file.endsWith('.js')) {
      copyFile(`src/js/generators/${file}`, `src/js/generators/${file}`);
      syncFile(`src/js/generators/${file}`, `public/src/js/generators/${file}`);
    }
  });
}

syncFile('tools/shared-tools.js', 'public/tools/shared-tools.js');
syncFile('tools/shared-tools.css', 'public/tools/shared-tools.css');
syncFile('tools/visual-flow-canvas.js', 'public/tools/visual-flow-canvas.js');
syncFile('tools/visual-flow-canvas.css', 'public/tools/visual-flow-canvas.css');
syncFile('studios/learn/studios-learning.json', 'public/studios/learn/studios-learning.json');

copyFile('404.html', '404.html');

// Sync all architecture flow diagrams, media, and learn.html across all tools to public and dist
const toolsBaseDir = path.join(rootDir, 'tools');
if (fs.existsSync(toolsBaseDir)) {
  const allToolEntries = fs.readdirSync(toolsBaseDir);
  allToolEntries.forEach(entry => {
    const dirPath = path.join(toolsBaseDir, entry);
    if (fs.statSync(dirPath).isDirectory()) {
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.svg') || file.endsWith('.webp')) {
          syncFile(`tools/${entry}/${file}`, `public/tools/${entry}/${file}`);
          copyFile(`tools/${entry}/${file}`, `tools/${entry}/${file}`);
          copyFile(`tools/${entry}/${file}`, file);
        }
        if (file === 'learn.html') {
          syncFile(`tools/${entry}/${file}`, `public/tools/${entry}/${file}`);
          copyFile(`tools/${entry}/${file}`, `tools/${entry}/${file}`);

          // Ensure learn.docx exists for every studio
          const specificDocx = path.join(rootDir, 'pradeep', 'all_studios', `${entry}.docx`);
          const defaultDocx = path.join(rootDir, 'pradeep', '5_Days_To_Learn_Any_Tool_Course_Roadmap.docx');
          const sourceDocx = fs.existsSync(specificDocx) ? specificDocx : defaultDocx;
          if (fs.existsSync(sourceDocx)) {
            const docxRel = `tools/${entry}/learn.docx`;
            const destPathDist = path.join(distDir, docxRel);
            const destPathPublic = path.join(rootDir, 'public', docxRel);
            const destPathTools = path.join(rootDir, docxRel);
            [destPathDist, destPathPublic, destPathTools].forEach(dp => {
              try {
                const d = path.dirname(dp);
                if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
                fs.copyFileSync(sourceDocx, dp);
              } catch (e) {
                // Ignore transient copy locks
              }
            });
          }
        }
      });
    }
  });
}

// Plugin marketplace: ship the plugin sources (markdown + JSON manifests + licence) and the
// marketplace manifest. HTML and scripts from vendored third-party plugins are deliberately
// not published; plugins/index.html and its assets are emitted by Vite.
function copyTree(srcRel, destRel, accept) {
  const srcDir = path.join(rootDir, srcRel);
  if (!fs.existsSync(srcDir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const rel = `${srcRel}/${entry.name}`;
    const destRelPath = `${destRel}/${entry.name}`;
    if (entry.isDirectory()) {
      count += copyTree(rel, destRelPath, accept);
    } else if (accept(entry.name, rel)) {
      const destPath = path.join(distDir, destRelPath);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(path.join(rootDir, rel), destPath);
      count += 1;
    }
  }
  return count;
}

const pluginFilesCopied = copyTree('plugins', 'plugins', (name, rel) =>
  rel !== 'plugins/index.html' && rel !== 'plugins/plugins.js' && rel !== 'plugins/plugins.css' &&
  (/\.(md|json)$/i.test(name) || name === 'LICENSE')
);
console.log(`Copied ${pluginFilesCopied} plugin files -> dist/plugins/`);
copyFile('.claude-plugin/marketplace.json', '.claude-plugin/marketplace.json');

// Copy standalone studio suites to dist/studios/
const studiosBaseDir = path.join(rootDir, 'studios');
if (fs.existsSync(studiosBaseDir)) {
  const allStudioEntries = fs.readdirSync(studiosBaseDir);
  allStudioEntries.forEach(entry => {
    const dirPath = path.join(studiosBaseDir, entry);
    if (fs.statSync(dirPath).isDirectory() && !['ai', 'asi', 'si', 'learn', 'flow'].includes(entry)) {
      const count = copyTree(`studios/${entry}`, `studios/${entry}`, () => true);
      console.log(`Copied ${count} studio files for ${entry} -> dist/studios/${entry}/`);
    }
  });
}

