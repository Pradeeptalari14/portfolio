const fs = require('fs');
const path = require('path');

// 1. tools.json count and categories
const toolsJsonPath = path.resolve('tools/tools.json');
const toolsData = JSON.parse(fs.readFileSync(toolsJsonPath, 'utf8'));
console.log('--- tools/tools.json ---');
console.log('Total tools count in tools.json:', toolsData.length);

const categories = {};
toolsData.forEach(t => {
  categories[t.category] = (categories[t.category] || 0) + 1;
});
console.log('Categories breakdown in tools.json:', categories);

// 2. studios-learning.json count
const studiosJsonPath = path.resolve('studios/learn/studios-learning.json');
let studiosLearnData = [];
if (fs.existsSync(studiosJsonPath)) {
  studiosLearnData = JSON.parse(fs.readFileSync(studiosJsonPath, 'utf8'));
}
console.log('\n--- studios/learn/studios-learning.json ---');
console.log('Total entries in studios-learning.json:', Array.isArray(studiosLearnData) ? studiosLearnData.length : Object.keys(studiosLearnData).length);

// 3. Stated numbers in HTML pages
console.log('\n--- Stated Numbers in UI ---');
const pages = [
  'index.html',
  'sections/hero.html',
  'sections/destinations.html',
  'studios/index.html',
  'studios/learn/index.html',
  'projects/index.html',
  'tools/index.html'
];

pages.forEach(p => {
  if (fs.existsSync(p)) {
    const text = fs.readFileSync(p, 'utf8');
    const matches = text.match(/\b\d+\+?\s*(studios|tools|repositories|repos)\b/gi) || [];
    console.log(p + ':', matches.slice(0, 10));
  }
});
