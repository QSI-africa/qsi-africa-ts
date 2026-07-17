const fs = require('fs');
const file = '/home/dnai/Documents/personal/projetcs/antigravity/qsi-africa-ts/client/src/pages/EcosystemPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Previous Fixes
content = content.replace(/visible=\{!!fullscreenMedia\}/, 'open={!!fullscreenMedia}');
content = content.replace(/bodyStyle=\{\{\s*padding:\s*0,\s*background:\s*'black',\s*height:\s*'100vh',\s*width:\s*'100vw',\s*display:\s*'flex',\s*alignItems:\s*'center',\s*justifyContent:\s*'center',\s*overflow:\s*'hidden'\s*\}\}/, 
"styles={{ body: { padding: 0, background: 'black', height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } }}");
content = content.replace('const filteredPosts = posts.filter(post => {', 'const filteredPosts = (Array.isArray(posts) ? posts : []).filter(post => {');
content = content.replace("setConcepts(conceptsRes.data);", "setConcepts(Array.isArray(conceptsRes.data) ? conceptsRes.data : []);");
content = content.replace("setDemos(demosRes.data);", "setDemos(Array.isArray(demosRes.data) ? demosRes.data : []);");

// Remove Drawer
let drawerRegex = /\{\/\* Mobile Navigation Drawer \*\/\}[\s\S]*?(?=<\/div>\s*<\/div>\s*\);\s*\};\s*export default EcosystemPage;)/;
content = content.replace(drawerRegex, '');

// Remove Mobile button
let btnRegex = /\{!isDesktop && \([\s\S]*?<Menu size=\{18\} \/>\s*<\/button>\s*\)\}/;
content = content.replace(btnRegex, '');

// Remove left column condition
content = content.replace(/\{\(isDesktop \|\| activeMobileTab === 'feed'\) && \(/, '');

// Remove right column and the closing brace of left col condition
let rightColRegex = /\)\}\s*\{\/\* Right Column: Concepts & Demos Sidebars[\s\S]*?(?=<Modal)/;
content = content.replace(rightColRegex, '');

fs.writeFileSync(file, content);
console.log("Done");
