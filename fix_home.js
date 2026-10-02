const fs = require('fs');
const files = ['view_trip.html', 'configure_trip.html', 'virtual_trip.html'];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Clean up any previously injected Home buttons from the main-toolbar
    content = content.replace(
        /<div class="flex items-center gap-2"><a href="index\.html"[\s\S]*?<\/a>/g,
        '<div class="flex items-center gap-2">'
    );

    // Inject Home button into main-toolbar for ALL files
    content = content.replace(
        /<div class="flex items-center gap-2">/g,
        '<div class="flex items-center gap-2">\n      <a href="index.html" class="p-3 bg-blue-50 rounded-xl shadow-sm text-blue-600 hover:bg-blue-100 transition-all border border-blue-100" title="Home">\n        <i data-lucide="home" class="w-5 h-5"></i>\n      </a>'
    );

    // Remove the redundant home buttons from config header and virtual trips header, if they exist
    content = content.replace(
        /<div class="flex items-center gap-3"><a href="index\.html"[^>]+><i data-lucide="home"[^>]+><\/i><\/a><h2 class="text-xl font-extrabold text-kyt-text">Configure Trip<\/h2><\/div>/g,
        '<h2 class="text-xl font-extrabold text-kyt-text">Configure Trip</h2>'
    );

    content = content.replace(
        /<a href="index\.html"[^>]+><i data-lucide="home"[^>]+><\/i><\/a><h2 id="vt-header-title"/g,
        '<h2 id="vt-header-title"'
    );

    fs.writeFileSync(file, content);
}
console.log('Added universal home button to main-toolbar in all files');

