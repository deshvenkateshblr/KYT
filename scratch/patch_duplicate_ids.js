const fs = require('fs');
let content = fs.readFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', 'utf8');

content = content.replace(/let dayCounter = 1;/, "let dayCounter = 1;\n    let stepCounter = 0;");
content = content.replace(/id: Date\.now\(\)\.toString\(\) \+ Math\.floor\(Math\.random\(\)\*1000\),/g, "id: Date.now().toString() + '_' + (++stepCounter),");

fs.writeFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', content);
console.log("Fixed duplicate IDs in generateSteps");

