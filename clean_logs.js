const fs = require('fs');
const path = require('path');

function getAllTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.includes('node_modules')) {
      getAllTsFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function cleanConsoleStatements(content) {
  // Remove various console patterns, keep specific functions  
  content = content.replace(/\s*console\.(log|warn|error|info|debug|trace)\([^;]*?\);?\s*/g, '');
  content = content.replace(/\s*console\.(log|warn|error|info|debug|trace)\([^}]*?\)\s*$/gm, '');
  
  // Handle event handlers with console statements
  content = content.replace(/onMouseEnter=\{\(\) => console\.log\([^}]*?\)\}/g, 'onMouseEnter={() => {}}');
  content = content.replace(/onMouseLeave=\{\(\) => console\.log\([^}]*?\)\}/g, 'onMouseLeave={() => {}}');  
  content = content.replace(/onStart=\{\(\) => console\.log\([^}]*?\)\}/g, 'onStart={() => {}}');
  content = content.replace(/onEnd=\{\(\) => console\.log\([^}]*?\)\}/g, 'onEnd={() => {}}');
  content = content.replace(/onChange=\{\(\) => console\.log\([^}]*?\)\}/g, 'onChange={() => {}}');
  
  // Clean up empty lines (but preserve meaningful spacing)
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return content;
}

// Find all TypeScript files
const srcFiles = getAllTsFiles('./src');

let totalFilesProcessed = 0;
let totalLogsRemoved = 0;

srcFiles.forEach(filePath => {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const cleanedContent = cleanConsoleStatements(originalContent);
    
    if (originalContent !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent);
      const logsRemoved = (originalContent.match(/console\./g) || []).length;
      totalLogsRemoved += logsRemoved;
      console.log(`✅ Cleaned ${filePath} - removed ${logsRemoved} console statements`);
    }
    
    totalFilesProcessed++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Processing complete!`);
console.log(`📁 Files processed: ${totalFilesProcessed}`);
console.log(`🧹 Total console statements removed: ${totalLogsRemoved}`);
