const fs = require('fs');

function extractAndRemove(html, pattern) {
    const match = html.match(pattern);
    if (match) {
        const extracted = match[0];
        html = html.replace(extracted, '');
        return [html, extracted];
    }
    return [html, null];
}

let html = fs.readFileSync('index.html', 'utf-8');

// Fix headers
html = html.replace(/(<header[^>]*>[\s\S]*?)(<\/button>\s*)(<\/div>)/g, '$1$2</header>');

let exploreHtml, virtualTripsHtml, configHtml, stepFormHtml, socialModalHtml, memoryCardHtml, fileViewerHtml;

[html, exploreHtml] = extractAndRemove(html, /<!-- EXPLORE VIEW \([^)]+\) -->\s*<aside id="explore-view"[\s\S]*?<\/aside>/);
[html, virtualTripsHtml] = extractAndRemove(html, /<!-- VIRTUAL TRIPS VIEW -->\s*<aside id="virtual-trips-view"[\s\S]*?<\/aside>/);
[html, configHtml] = extractAndRemove(html, /<!-- \S+\s+CONFIG VIEW.*?-->\s*<aside id="config-view"[\s\S]*?<\/aside>/);
[html, stepFormHtml] = extractAndRemove(html, /<!-- \S+\s+STEP FORM VIEW.*?-->\s*<aside id="step-form-view"[\s\S]*?<\/aside>/);
[html, socialModalHtml] = extractAndRemove(html, /<!-- \S+\s+PHASE 2: SOCIAL.*?-->\s*<input type="file" id="memory-upload-input"[\s\S]*?<\/div>\s*<\/div>/);
[html, memoryCardHtml] = extractAndRemove(html, /<!-- Memory Card Render View -->\s*<div id="memory-card-view"[\s\S]*?<\/div>\s*<\/div>/);
[html, fileViewerHtml] = extractAndRemove(html, /<!-- \S+\s+FILE VIEWER VIEW.*?-->\s*<aside id="file-viewer-view"[\s\S]*?<\/aside>/);

const templates = {
    explore: exploreHtml,
    virtualTrips: virtualTripsHtml,
    config: configHtml,
    stepForm: stepFormHtml,
    socialModal: socialModalHtml,
    memoryCard: memoryCardHtml,
    fileViewer: fileViewerHtml
};

let jsCode = "window.KYT_TEMPLATES = {};\n\n";
for (const [k, v] of Object.entries(templates)) {
    if (v) {
        jsCode += `window.KYT_TEMPLATES['${k}'] = \`${v.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;\n\n`;
    }
}

fs.writeFileSync('js/templates.js', jsCode, 'utf-8');

html = html.replace('<script src="./js/app.js?v=4"></script>', '<script src="./js/templates.js"></script>\n  <script src="./js/app.js?v=4"></script>');

const welcomeScreenHtml = `
  <!-- WELCOME SCREEN -->
  <aside id="welcome-view" class="fixed inset-0 bg-white z-[100] flex flex-col justify-center items-center p-6 hidden">
    <div class="text-center mb-8">
      <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
        <i data-lucide="plane-takeoff" class="w-10 h-10"></i>
      </div>
      <h1 class="text-3xl font-black text-slate-800 mb-2">Welcome to KYT</h1>
      <p class="text-slate-500 font-medium">How would you like to get started today?</p>
    </div>
    
    <div class="space-y-4 w-full max-w-sm">
      <button id="btn-welcome-virtual" class="w-full py-4 bg-blue-600 text-white font-extrabold rounded-2xl shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
        <i data-lucide="compass" class="w-6 h-6"></i>
        Build Virtual Trip
      </button>
      
      <button id="btn-welcome-config" class="w-full py-4 bg-white text-slate-800 border-2 border-slate-200 font-extrabold rounded-2xl shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
        <i data-lucide="settings-2" class="w-6 h-6 text-slate-500"></i>
        Configure Upcoming Trip
      </button>
    </div>
  </aside>
`;

html = html.replace('</main>', '</main>\n' + welcomeScreenHtml);

fs.writeFileSync('index.html', html, 'utf-8');
