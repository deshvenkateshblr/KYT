const fs = require('fs');
const files = ['view_trip.html', 'configure_trip.html', 'virtual_trip.html'];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace Home button with logo in main-toolbar
    const homeRegex = /<a href="index\.html" class="p-3 bg-blue-50 rounded-xl shadow-sm text-blue-600 hover:bg-blue-100 transition-all border border-blue-100" title="Home">\s*<i data-lucide="home" class="w-5 h-5"><\/i>\s*<\/a>/;
    
    const logoLink = `<a href="index.html" class="p-1 shrink-0 bg-white rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-transform border border-slate-100 overflow-hidden" title="Home">
          <img src="icons/KYT.jpg" alt="KYT" class="w-9 h-9 object-cover rounded-lg">
        </a>`;

    content = content.replace(homeRegex, logoLink);
    fs.writeFileSync(file, content);
}

// Update index.html
let idxHtml = fs.readFileSync('index.html', 'utf8');
idxHtml = idxHtml.replace(
    /<div class="mb-8">\s*<h1 class="text-3xl font-extrabold text-blue-600 mb-2">KYT<\/h1>\s*<p class="text-slate-500 font-medium">Know Your Travel<\/p>\s*<\/div>/,
    `<div class="mb-8 flex flex-col items-center">
      <img src="icons/KYT.jpg" alt="KYT Logo" class="w-24 h-24 rounded-3xl shadow-lg mb-4 object-cover border-2 border-white">
      <h1 class="text-3xl font-extrabold text-slate-800 mb-1">KYT</h1>
      <p class="text-slate-500 font-medium">Know Your Travel</p>
    </div>`
);
fs.writeFileSync('index.html', idxHtml);
console.log('Logos injected successfully.');

