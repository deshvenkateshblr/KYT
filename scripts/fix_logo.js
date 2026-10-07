const fs = require('fs');
const files = ['view_trip.html', 'configure_trip.html', 'virtual_trip.html'];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /<img src="icons\/KYT\.jpg" alt="KYT" class="w-9 h-9 object-cover rounded-lg">/,
        '<img src="icons/KYT.jpg" alt="KYT" class="w-9 h-9 object-contain rounded-md">'
    );
    fs.writeFileSync(file, content);
}

let idxHtml = fs.readFileSync('index.html', 'utf8');
const oldHeaderRegex = /<div class="mb-8 flex flex-col items-center">[\s\S]*?<\/div>/;
const newHeader = `<div class="mb-8 flex flex-col items-center">
      <div class="p-2 bg-white rounded-2xl shadow-sm border border-slate-100 mb-3">
        <img src="icons/KYT.jpg" alt="KYT Logo" class="w-24 h-24 object-contain rounded-xl">
      </div>
      <p class="text-slate-500 font-medium">Know Your Travel</p>
    </div>`;

idxHtml = idxHtml.replace(oldHeaderRegex, newHeader);
fs.writeFileSync('index.html', idxHtml);
console.log('Fixed logos');

