const fs = require('fs');
const file = '/home/dnai/Documents/personal/projetcs/antigravity/qsi-africa-ts/client/src/pages/EcosystemPage.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const rightColStart = lines.findIndex(l => l.includes('{/* Right Column: Concepts & Demos Sidebars'));
const modalStart = lines.findIndex((l, i) => i > rightColStart && l.includes('<Modal'));

let endOfLeftCol = -1;
for (let i = rightColStart - 1; i >= 0; i--) {
  if (lines[i].trim() === ')}' || lines[i].trim() === ')} /* End of left column */') {
    endOfLeftCol = i;
    break;
  }
}

const drawerStart = lines.findIndex(l => l.includes('{/* Mobile Navigation Drawer */}'));
const exportEcosystem = lines.findIndex(l => l.includes('export default EcosystemPage;'));

const btnStart = lines.findIndex(l => l.includes('{!isDesktop && ('));
let btnEnd = -1;
if (btnStart !== -1) {
    btnEnd = lines.findIndex((l, i) => i > btnStart && l.includes('<Menu size={18} />')) + 3;
}

const leftColCond = lines.findIndex(l => l.includes('{(isDesktop || activeMobileTab === \'feed\') && ('));

let newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (btnStart !== -1 && i >= btnStart && i <= btnEnd) continue;
  if (i === leftColCond) continue;
  if (i === endOfLeftCol) continue;
  if (i >= rightColStart && i < modalStart - 1) continue;
  if (i >= drawerStart && i < exportEcosystem - 2) continue;
  
  newLines.push(lines[i]);
}

fs.writeFileSync(file, newLines.join('\n'));
console.log("Modifications complete.");
