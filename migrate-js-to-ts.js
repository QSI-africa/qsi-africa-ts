// migrate-js-to-ts.js
// Automated JavaScript to TypeScript converter
const fs = require('fs');
const path = require('path');

// Conversion rules
const conversions = {
  // Import/Export patterns
  requireToImport: (code) => {
    // const prisma = require('../config/prisma') → import prisma from '../config/prisma'
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
    
    return code;
  },

  // Add Express types
  addExpressTypes: (code) => {
    // Add imports at top if they contain express
    if (code.includes("import express")) {
      code = code.replace(
        /import express from ['"]express['"]/,
        "import express, { Request, Response, Router, NextFunction } from 'express'"
      );
    }
    
    // router.METHOD("/path", async (req, res) => {
    // → router.METHOD("/path", async (req: Request, res: Response): Promise<void> => {
    code = code.replace(
      /async\s*\(\s*req\s*,\s*res\s*\)\s*(?:=>|:)\s*{/g,
      'async (req: Request, res: Response): Promise<void> => {'
    );
    
    // For middleware: (req, res, next)
    code = code.replace(
      /\(\s*req\s*,\s*res\s*,\s*next\s*\)\s*(?:=>|:)\s*{/g,
      '(req: Request, res: Response, next: NextFunction) => {'
    );
    
    return code;
  },

  // Add basic return type annotations
  addReturnTypes: (code) => {
    // async function name() { → async function name(): Promise<void> {
    code = code.replace(
      /async\s+function\s+(\w+)\s*\([^)]*\)\s*{/g,
      'async function $1(): Promise<void> {'
    );
    
    return code;
  },

  // Fix file extensions in imports
  fixImportExtensions: (code) => {
    // Change .js to .ts in relative imports, but keep node_modules as-is
    code = code.replace(
      /from\s+['"](\.\/.+?)\.js['"]/g,
      "from '$1'"
    );
    code = code.replace(
      /from\s+['"](\.\.\/.+?)\.js['"]/g,
      "from '$1'"
    );
    
    return code;
  },

  // Add error typing
  addErrorTypes: (code) => {
    // catch (error) → catch (error: any)
    code = code.replace(/catch\s*\(\s*(\w+)\s*\)/g, 'catch ($1: any)');
    
    return code;
  },

  // Router typing
  addRouterTypes: (code) => {
    // const router = express.Router() → const router: Router = express.Router()
    code = code.replace(
      /const\s+router\s*=\s*express\.Router\(\)/g,
      'const router: Router = express.Router()'
    );
    
    // For router from require
    code = code.replace(
      /const\s+router\s*=\s*Router\(\)/g,
      'const router: Router = Router()'
    );
    
    return code;
  }
};

function convertFile(jsPath, tsPath) {
  console.log(`Converting: ${path.basename(jsPath)}`);
  
  let code = fs.readFileSync(jsPath, 'utf8');
  
  // Apply all conversions
  code = conversions.requireToImport(code);
  code = conversions.addExpressTypes(code);
  code = conversions.addRouterTypes(code);
  code = conversions.addReturnTypes(code);
  code = conversions.fixImportExtensions(code);
  code = conversions.addErrorTypes(code);
  
  // Write TypeScript file
  fs.writeFileSync(tsPath, code, 'utf8');
  console.log(`✓ Created: ${path.basename(tsPath)}`);
}

function convertDirectory(sourceDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // Recursively convert subdirectories
      convertDirectory(sourcePath, path.join(targetDir, file));
    } else if (file.endsWith('.js')) {
      // Convert .js to .ts
      const tsFile = file.replace(/\.js$/, '.ts');
      const targetPath = path.join(targetDir, tsFile);
      convertFile(sourcePath, targetPath);
    } else {
      // Copy other files as-is
      fs.copyFileSync(sourcePath, path.join(targetDir, file));
    }
  });
}

// Main execution
const sourceRoot = 'c:\\Users\\Admin\\Documents\\qsi-interactive-solution\\server\\src';
const targetRoot = 'c:\\Users\\Admin\\Documents\\qsi-africa-ts\\server\\src';

console.log('🚀 Starting automated JS → TS migration...\n');

// Convert all directories
const dirsToConvert = ['api', 'services', 'controllers', 'utils'];

dirsToConvert.forEach(dir => {
  const sourceDir = path.join(sourceRoot, dir);
  const targetDir = path.join(targetRoot, dir);
  
  if (fs.existsSync(sourceDir)) {
    console.log(`\n📁 Converting ${dir}/...`);
    convertDirectory(sourceDir, targetDir);
  }
});

console.log('\n✅ Automated conversion complete!');
console.log('\n⚠️  Next steps:');
console.log('1. Review generated files for accuracy');
console.log('2. Add specific type interfaces where needed');
console.log('3. Fix any TypeScript errors: npm run type-check');
console.log('4. Test the server: npm run dev');
