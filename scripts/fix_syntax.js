const fs = require('fs');
let cfg = fs.readFileSync('js/config.js', 'utf8');

cfg = cfg.replace(/<\/div>`;\)\.join\(''\);/, '</div>`).join(\'\');');

fs.writeFileSync('js/config.js', cfg);
console.log('Fixed syntax error');

