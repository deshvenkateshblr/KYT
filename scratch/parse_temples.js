const fs = require('fs');
const txt = fs.readFileSync('C:/Users/deshv/.gemini/antigravity/brain/1e1f7a1e-0846-4f09-b666-aa13d5aea1b0/.system_generated/steps/601/content.md', 'utf8');

const regex = /<span style="font-size: 14pt;"><b><span style="font-family: &quot;Noto Serif Tamil&quot;, serif;">(.*?)<\/span><\/b><\/span>/gi;
let m;
while(m = regex.exec(txt)) {
  console.log(m[1].replace(/<[^>]+>/g, '').trim());
}

// Alternatively just grab text blocks that look like numbered lists
const text = txt.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n');
const lines = text.split('\n');
const temples = lines.filter(l => /^\d+\.\s+.*Temple/.test(l));
console.log(temples);

