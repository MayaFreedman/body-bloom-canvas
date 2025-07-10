// Temporary script to batch remove console statements
const fs = require('fs');
const path = require('path');

function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove various console patterns
    content = content.replace(/\s*console\.(log|warn|error|info|debug)\([^;]*\);?\s*/g, '');
    content = content.replace(/\s*console\.(log|warn|error|info|debug)\([^}]*\}\s*\)/g, '');
    content = content.replace(/onMouseEnter=\{\(\) => console\.log\([^}]*\}\)/g, 'onMouseEnter={() => {}}');
    content = content.replace(/onMouseLeave=\{\(\) => console\.log\([^}]*\}\)/g, 'onMouseLeave={() => {}}');
    content = content.replace(/onStart=\{\(\) => console\.log\([^}]*\}\)/g, 'onStart={() => {}}');
    content = content.replace(/onEnd=\{\(\) => console\.log\([^}]*\}\)/g, 'onEnd={() => {}}');
    content = content.replace(/onChange=\{\(\) => console\.log\([^}]*\}\)/g, 'onChange={() => {}}');
    
    // Clean up empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    fs.writeFileSync(filePath, content);
    console.log(`Cleaned: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// List of files to clean based on search results
const filesToClean = [
  'src/components/HumanModel.tsx',
  'src/components/SensationParticles.tsx', 
  'src/components/bodyMapper/ControlButtons.tsx',
  'src/components/bodyMapper/CustomCursor.tsx',
  'src/components/bodyMapper/CustomEffectDialog.tsx',
  'src/components/bodyMapper/EraserHandler.tsx',
  'src/components/bodyMapper/MultiplayerMessageHandler.tsx'
];

filesToClean.forEach(removeConsoleLogs);