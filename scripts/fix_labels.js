const fs = require('fs');
let idx = fs.readFileSync('index.js', 'utf8');

// For returning users, change "Configure Upcoming Trip" to "Configure Current Trip"
// I will split the string around `if (isReturningUser) {` and only replace it in the first block
const parts = idx.split('if (isReturningUser) {');
if (parts.length > 1) {
    const returningBlock = parts[1].split('} else {');
    returningBlock[0] = returningBlock[0].replace(/Configure[\s\S]*?Upcoming Trip/g, 'Configure Current Trip');
    parts[1] = returningBlock.join('} else {');
    idx = parts.join('if (isReturningUser) {');
}

fs.writeFileSync('index.js', idx);
console.log('Fixed index.js labels');

