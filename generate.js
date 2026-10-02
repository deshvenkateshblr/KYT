const fs = require('fs');
const original = fs.readFileSync('original_index.html', 'utf8');

const injectBackButton = (html, viewId) => {
    let modified = html;
    
    if (viewId === 'main-view') {
        modified = modified.replace(
            '<div class="flex items-center gap-2">',
            '<div class="flex items-center gap-2"><a href="index.html" class="p-3 bg-blue-50 rounded-xl shadow-sm text-blue-600 hover:bg-blue-100 transition-all border border-blue-100" title="Home"><i data-lucide="home" class="w-5 h-5"></i></a>'
        );
    }
    
    if (viewId === 'config-view') {
        modified = modified.replace(
            '<h2 class="text-xl font-extrabold text-kyt-text">Configure Trip</h2>',
            '<div class="flex items-center gap-3"><a href="index.html" class="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all"><i data-lucide="home" class="w-5 h-5"></i></a><h2 class="text-xl font-extrabold text-kyt-text">Configure Trip</h2></div>'
        );
    }

    if (viewId === 'virtual-trips-view') {
        modified = modified.replace(
            '<h2 id="vt-header-title"',
            '<a href="index.html" class="p-2 mr-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all"><i data-lucide="home" class="w-5 h-5"></i></a><h2 id="vt-header-title"'
        );
    }

    const autoOpenScript = `
    <script>
      window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
          if ('${viewId}' === 'config-view') {
            const el = document.getElementById('config-view');
            if (el) el.classList.remove('hidden');
          } else if ('${viewId}' === 'virtual-trips-view') {
            const el = document.getElementById('virtual-trips-view');
            if (el) el.classList.remove('hidden');
          }
        }, 100);
      });
    </script>
    </body>
    </html>`;
    
    modified = modified.replace(/<\/body>\s*<\/html>/i, autoOpenScript);
    return modified;
};

fs.writeFileSync('view_trip.html', injectBackButton(original, 'main-view'));
fs.writeFileSync('configure_trip.html', injectBackButton(original, 'config-view'));
fs.writeFileSync('virtual_trip.html', injectBackButton(original, 'virtual-trips-view'));

console.log('Generated 3 HTML files');

