const fs = require('fs');
let content = fs.readFileSync('js/social.js', 'utf8');

// Update icon.svg to KYT.jpg
content = content.replace(
    /<img src="\.\/icons\/icon\.svg" class="([^"]+)" alt="KYT Logo">/g,
    '<img src="./icons/KYT.jpg" class="$1 object-contain" alt="KYT Logo">'
);

// Update PDF fetch
content = content.replace(
    /await fetch\('\.\/icons\/icon-192\.png'\)/g,
    "await fetch('./icons/KYT.jpg')"
);

fs.writeFileSync('js/social.js', content);
console.log('Fixed social.js');

