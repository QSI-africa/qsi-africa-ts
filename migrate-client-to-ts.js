// migrate-client-to-ts.js
// Automated React JavaScript to TypeScript converter
const fs = require('fs');
const path = require('path');

const conversions = {
  // React specific conversions
  reactImports: (code) => {
    // Add React import if using JSX
    if (code.includes('</') && !code.includes("import React")) {
      code = "import React from 'react';\n" + code;
    }
    
    // import React, { useState } from 'react'
    code = code.replace(
      /import\s+React,\s*{\s*([^}]+)\s*}\s*from\s*['"]react['"]/g,
      "import React, { $1 } from 'react'"
    );
    
    return code;
  },

  requireToImport: (code) => {
    // const x = require('module') → import x from 'module'
    code = code.replace(
      /const\s+(\w+)\s*=\s*require\(['"](.+?)['"]\);?/g,
      "import $1 from '$2';"
    );
    
    // const { x, y } = require('module') → import { x, y } from 'module'
    code = code.replace(
      /const\s+\{([^}]+)\}\s*=\s*require\(['"](.+?)['"]\);?/g,
      "import { $1 } from '$2';"
    );
    
    // module.exports = x → export default x
    code = code.replace(/module\.exports\s*=\s*/g, 'export default ');
    code = code.replace(/export\s+{\s*(\w+)\s*};?/g, 'export { $1 };');
    
    return code;
  },

  // Add React.FC types
  addComponentTypes: (code) => {
    // Find function components and add FC type
    // function ComponentName() { → const ComponentName: React.FC = () => {
    code = code.replace(
      /function\s+([A-Z]\w+)\s*\(\s*\)\s*{/g,
      'const $1: React.FC = () => {'
    );
    
    // const Component = () => { → const Component: React.FC = () => {
    code = code.replace(
      /const\s+([A-Z]\w+)\s*=\s*\(\s*\)\s*=>\s*{/g,
      'const $1: React.FC = () => {'
    );
    
    return code;
  },

  // Add props interface
  addPropsInterface: (code) => {
    // Look for destructured props and create interface
    const propsMatch = code.match(/const\s+\w+:\s*React\.FC\s*=\s*\(\s*{\s*([^}]+)\s*}\s*\)/);
    if (propsMatch) {
      const props = propsMatch[1].split(',').map(p => p.trim());
      const interfaceDef = `interface Props {\n  ${props.map(p => `${p}: any;`).join('\n  ')}\n}\n\n`;
      code = code.replace(
        /(const\s+\w+:\s*React\.FC)/,
        `${interfaceDef}$1<Props>`
      );
    }
    return code;
  },

  // Fix useState types
  fixUseState: (code) => {
    // useState(null) → useState<any>(null)
    // useState([]) → useState<any[]>([])
    // useState({}) → useState<any>({})
    code = code.replace(/useState\(null\)/g, 'useState<any>(null)');
    code = code.replace(/useState\(\[\]\)/g, 'useState<any[]>([])');
    code = code.replace(/useState\({}\)/g, 'useState<any>({})');
    code = code.replace(/useState\(false\)/g, 'useState<boolean>(false)');
    code = code.replace(/useState\(true\)/g, 'useState<boolean>(true)');
    code = code.replace(/useState\(0\)/g, 'useState<number>(0)');
    code = code.replace(/useState\(['"]/g, 'useState<string>("');
    
    return code;
  },

  fixEventHandlers: (code) => {
    // (e) => → (e: React.FormEvent) =>
    code = code.replace(
      /\(e\)\s*=>\s*{/g,
      '(e: React.FormEvent) => {'
    );
    
    return code;
  },

  fixImportExtensions: (code) => {
    // Remove .js/.jsx extensions from imports
    code = code.replace(/from\s+['"](\.\/.+?)\.jsx?['"]/g, "from '$1'");
    code = code.replace(/from\s+['"](\.\.\/.+?)\.jsx?['"]/g, "from '$1'");
    
    return code;
  }
};

function convertFile(jsPath, tsPath) {
  console.log(`Converting: ${path.basename(jsPath)}`);
  
  let code = fs.readFileSync(jsPath, 'utf8');
  
  // Apply conversions
  code = conversions.requireToImport(code);
  code = conversions.reactImports(code);
  code = conversions.addComponentTypes(code);
  code = conversions.fixUseState(code);
  code = conversions.fixEventHandlers(code);
  code = conversions.fixImportExtensions(code);
  
  fs.writeFileSync(tsPath, code, 'utf8');
  console.log(`✓ Created: ${path.basename(tsPath)}`);
}

function convertDirectory(sourceDir, targetDir, depth = 0) {
  if (!fs.existsSync(sourceDir)) {
    console.log(`⚠️  Directory not found: ${sourceDir}`);
    return;
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    // Skip node_modules and build directories
    if (file === 'node_modules' || file === 'dist' || file === 'build') {
      return;
    }

    const sourcePath = path.join(sourceDir, file);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      convertDirectory(sourcePath, path.join(targetDir, file), depth + 1);
    } else if (file.endsWith('.jsx')) {
      const tsFile = file.replace(/\.jsx$/, '.tsx');
      convertFile(sourcePath, path.join(targetDir, tsFile));
    } else if (file.endsWith('.js') && !file.includes('vite.config') && !file.includes('eslint')) {
      const tsFile = file.replace(/\.js$/, '.ts');
      convertFile(sourcePath, path.join(targetDir, tsFile));
    } else {
      // Copy other files as-is
      fs.copyFileSync(sourcePath, path.join(targetDir, file));
    }
  });
}

// Convert both client apps
const apps = ['client', 'admin-client'];

console.log('🚀 Starting React apps JS → TS migration...\n');

apps.forEach(app => {
  console.log(`\n📦 Converting ${app}...`);
  
  const sourceRoot = `c:\\Users\\Admin\\Documents\\qsi-interactive-solution\\${app}`;
  const targetRoot = `c:\\Users\\Admin\\Documents\\qsi-africa-ts\\${app}`;
  
  // Convert src directory
  const srcSource = path.join(sourceRoot, 'src');
  const srcTarget = path.join(targetRoot, 'src');
  
  if (fs.existsSync(srcSource)) {
    console.log(`  Converting src/...`);
    convertDirectory(srcSource, srcTarget);
  }
  
  // Copy public directory
  const publicSource = path.join(sourceRoot, 'public');
  const publicTarget = path.join(targetRoot, 'public');
  if (fs.existsSync(publicSource)) {
    console.log(`  Copying public/...`);
    if (!fs.existsSync(publicTarget)) {
      fs.mkdirSync(publicTarget, { recursive: true });
    }
    const files = fs.readdirSync(publicSource);
    files.forEach(file => {
      fs.copyFileSync(
        path.join(publicSource, file),
        path.join(publicTarget, file)
      );
    });
  }
  
  // Copy other root files
  ['index.html', '.env', 'vite.config.js', 'eslint.config.js'].forEach(file => {
    const src = path.join(sourceRoot, file);
    if (fs.existsSync(src)) {
      const dest = path.join(targetRoot, file);
      fs.copyFileSync(src, dest);
      console.log(`  ✓ Copied ${file}`);
    }
  });
  
  // Rename vite.config.js to .ts
  const viteConfigJs = path.join(targetRoot, 'vite.config.js');
  const viteConfigTs = path.join(targetRoot, 'vite.config.ts');
  if (fs.existsSync(viteConfigJs)) {
    fs.renameSync(viteConfigJs, viteConfigTs);
    console.log(`  ✓ Renamed vite.config.js → vite.config.ts`);
  }
});

console.log('\n✅ Client apps migration complete!');
console.log('\n⚠️  Next steps:');
console.log('1. cd client && npm install');
console.log('2. cd admin-client && npm install');
console.log('3. Fix remaining TypeScript errors');
console.log('4. Test: npm run dev');
