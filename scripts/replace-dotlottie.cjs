const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const importOld = "import { DotLottiePlayer } from '@dotlottie/react-player';";
  const importNew = "import { DotLottiePlayer } from '@lottiefiles/dotlottie-react';";
  const cssImport = "import '@dotlottie/react-player/dist/index.css';";

  let changed = false;
  if (content.includes(importOld)) {
    content = content.replace(importOld, importNew);
    changed = true;
  }
  if (content.includes(cssImport)) {
    // Remove the CSS import line entirely
    const lines = content.split('\n');
    const filtered = lines.filter(line => line.trim() !== cssImport);
    content = filtered.join('\n');
    changed = true;
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walk(srcDir);
console.log('DotLottie imports replacement completed.');
