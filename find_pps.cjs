const fs = require('fs');

const appContent = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = appContent.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('pps.whatsapp')) {
    console.log(`src/App.tsx Line ${idx + 1}: ${line.trim()}`);
  }
});

const serverContent = fs.readFileSync('server.ts', 'utf-8');
const sLines = serverContent.split('\n');
sLines.forEach((line, idx) => {
  if (line.includes('pps.whatsapp')) {
    console.log(`server.ts Line ${idx + 1}: ${line.trim()}`);
  }
});
