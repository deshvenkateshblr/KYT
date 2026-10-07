const fs = require('fs');

let code = fs.readFileSync('trip_detail.html', 'utf8');

const target = '<img src="./icons/KYT.jpg" alt="KYT Logo" class="h-8 w-auto rounded-lg shadow-sm object-contain">';
const replacement = '<a href="index.html" title="Back to Home" class="shrink-0 hover:scale-105 transition-transform"><img src="./icons/KYT.jpg" alt="KYT Logo" class="h-8 w-auto rounded-lg shadow-sm object-contain"></a>';

code = code.replace(target, replacement);

fs.writeFileSync('trip_detail.html', code);

