const fs = require('fs');
const path = require('path');

const toolsDir = path.resolve('tools');
const dirs = fs.readdirSync(toolsDir).filter(f => fs.statSync(path.join(toolsDir, f)).isDirectory());

const stats = {
  totalDirs: dirs.length,
  usingCoreTool: 0,
  usingSharedTools: 0,
  usingCustomScript: 0,
  hasLearnHtml: 0,
  hasLearnDocx: 0,
  hasLearnWord: 0,
  hasManifestMap: 0,
  hasMermaidDiagram: 0,
  scriptSizeBuckets: {
    small_under_100: 0,
    medium_100_500: 0,
    large_over_500: 0
  }
};

const anomalies = [];

dirs.forEach(d => {
  const dirPath = path.join(toolsDir, d);
  const indexPath = path.join(dirPath, 'index.html');
  const learnPath = path.join(dirPath, 'learn.html');
  const docxPath = path.join(dirPath, 'learn.docx');
  const wordPath = path.join(dirPath, 'learn.word');

  if (fs.existsSync(learnPath)) stats.hasLearnHtml++;
  if (fs.existsSync(docxPath)) stats.hasLearnDocx++;
  if (fs.existsSync(wordPath)) stats.hasLearnWord++;

  if (!fs.existsSync(indexPath)) {
    anomalies.push({ dir: d, issue: 'Missing index.html' });
    return;
  }

  const content = fs.readFileSync(indexPath, 'utf8');
  const lines = content.split('\n').length;
  
  if (lines < 100) stats.scriptSizeBuckets.small_under_100++;
  else if (lines <= 500) stats.scriptSizeBuckets.medium_100_500++;
  else stats.scriptSizeBuckets.large_over_500++;

  if (content.includes('core-tool.js')) stats.usingCoreTool++;
  if (content.includes('shared-tools.js')) stats.usingSharedTools++;
  if (!content.includes('core-tool.js') && !content.includes('shared-tools.js')) stats.usingCustomScript++;

  if (content.includes('manifestMap') || content.includes('renderManifests') || content.includes('compileConfig')) {
    stats.hasManifestMap++;
  }

  if (content.includes('mermaid') || content.includes('class=\"mermaid\"')) {
    stats.hasMermaidDiagram++;
  }
});

console.log('Studio Implementations Audit:');
console.log(JSON.stringify(stats, null, 2));
if (anomalies.length > 0) {
  console.log('Anomalies:', anomalies);
}
