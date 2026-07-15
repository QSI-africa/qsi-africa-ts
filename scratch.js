const fs = require('fs');

const file = fs.readFileSync('client/src/pages/EcosystemPage.tsx', 'utf-8');

const startStr = "filteredPosts.map(post => {";
const endStr = "                  );\\n                })";

const startIndex = file.indexOf(startStr);
// Find the exact end string
let endIndex = -1;
const lines = file.split('\n');
let sIdx = -1;
let eIdx = -1;
for (let i=0; i<lines.length; i++) {
    if (lines[i].includes('filteredPosts.map(post => {')) sIdx = i;
    if (sIdx !== -1 && i > sIdx && lines[i].includes('})') && lines[i-1].includes(');')) {
        eIdx = i;
        break;
    }
}
console.log(sIdx, eIdx);
