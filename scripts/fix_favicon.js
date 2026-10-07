const fs = require('fs');
const files = ['view_trip.html', 'configure_trip.html', 'virtual_trip.html', 'index.html'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<link rel="icon" type="image\/svg\+xml" href="\.\/icons\/icon\.svg">/g, '<link rel="icon" type="image/jpeg" href="./icons/KYT.jpg">');
    content = content.replace(/<link rel="apple-touch-icon" href="\.\/icons\/icon-192\.png">/g, '<link rel="apple-touch-icon" href="./icons/KYT.jpg">');
    fs.writeFileSync(file, content);
}
console.log('Fixed favicons');

