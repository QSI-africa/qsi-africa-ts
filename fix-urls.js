const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'client', 'src', 'pages');

const robustGetServerUrl = `  const getServerUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    try {
      const origin = new URL(baseURL).origin;
      return \`\${origin}\${path.startsWith('/') ? '' : '/'}\${path}\`;
    } catch {
      return path;
    }
  };`;

const robustGetMediaUrl = `  const getMediaUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.qsi.africa/api';
    try {
      const origin = new URL(baseURL).origin;
      return \`\${origin}\${url.startsWith('/') ? '' : '/'}\${url}\`;
    } catch {
      return url;
    }
  };`;

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace getServerUrl block
  const getServerUrlRegex = /(?:const|function)\s+getServerUrl\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?(?=\n\s*(?:const|function|useEffect|return|try|if|\/\/|export|const \[))/;
  if (content.match(getServerUrlRegex)) {
    // A bit tricky because of how regex matches block ends. We will do a manual bracket matching replacement if regex fails or is unsafe.
  }
});
