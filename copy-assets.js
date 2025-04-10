const fs = require('fs');
const path = require('path');

// Ensure dist directories exist
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Copy HTML files
const copyHtmlFiles = () => {
  console.log('Copying HTML files...');
  const srcFile = path.join(__dirname, 'src', 'renderer', 'index.html');
  const destFile = path.join(__dirname, 'dist', 'renderer', 'index.html');
  
  ensureDirExists(path.join(__dirname, 'dist', 'renderer'));
  
  fs.copyFileSync(srcFile, destFile);
  console.log(`Copied: ${srcFile} -> ${destFile}`);
};

// Copy CSS files
const copyCssFiles = () => {
  console.log('Copying CSS files...');
  const srcDir = path.join(__dirname, 'src', 'renderer', 'styles');
  const destDir = path.join(__dirname, 'dist', 'renderer', 'styles');
  
  ensureDirExists(destDir);
  
  fs.readdirSync(srcDir).forEach(file => {
    if (file.endsWith('.css')) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      fs.copyFileSync(srcFile, destFile);
      console.log(`Copied: ${srcFile} -> ${destFile}`);
    }
  });
};

// Main
const main = () => {
  copyHtmlFiles();
  copyCssFiles();
  console.log('Assets copied successfully!');
};

main(); 