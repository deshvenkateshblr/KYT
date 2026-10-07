const fs = require('fs');
const path = require('path');

const files = ['index.html', 'virtual_trip.html', 'trip_detail.html'];
const version = Date.now().toString().slice(0, 10); // current timestamp as version

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // Replace CDN links with local lib
    content = content.replace(/https:\/\/cdn\.tailwindcss\.com/g, `./lib/tailwindcss.js?v=${version}`);
    content = content.replace(/https:\/\/unpkg\.com\/lucide@latest/g, `./lib/lucide.js?v=${version}`);

    // Add version to local css and js files, handling existing versions if any
    content = content.replace(/(href|src)=(['"])((\.\/)?(css|js|data)\/[^'"]+\.(css|js))(\?v=[^'"]+)?(['"])/g, `$1=$2$3?v=${version}$8`);

    fs.writeFileSync(file, content);
    console.log(`Updated ${file} with version ${version}`);
});

