const fs = require('fs');

let code = fs.readFileSync('trip_detail.html', 'utf8');

// 1. Move buttons from Header to Hero Banner
const headerButtonsTarget = `<div class="flex items-center gap-2">
      <button id="btn-share-trip" class="bg-white text-blue-600 border border-blue-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-1.5">
        <i data-lucide="share-2" class="w-3.5 h-3.5"></i> Share
      </button>
      <button id="btn-edit-plan" class="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow hover:bg-blue-700 transition-colors flex items-center gap-1.5">
        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Customize
      </button>
    </div>`;

code = code.replace(headerButtonsTarget, ''); // Remove from header

const heroTarget = `<p class="text-sm text-blue-700 max-w-md mx-auto" id="trip-desc">Check out this curated journey featuring amazing cities and rich cultural experiences.</p>`;
const heroReplacement = `<p class="text-sm text-blue-700 max-w-md mx-auto mb-5" id="trip-desc">Check out this curated journey featuring amazing cities and rich cultural experiences.</p>
      <div class="flex items-center justify-center gap-3">
        <button id="btn-share-trip" class="bg-white text-blue-600 border border-blue-200 px-5 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
          <i data-lucide="share-2" class="w-4 h-4"></i> Share
        </button>
        <button id="btn-edit-plan" class="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow hover:bg-blue-700 transition-colors flex items-center gap-2">
          <i data-lucide="edit-3" class="w-4 h-4"></i> Customize
        </button>
      </div>`;

code = code.replace(heroTarget, heroReplacement);

// 2. Fix the tripName decode issue
const textContentTarget = `document.getElementById('trip-title').textContent = tripName;`;
const textContentReplacement = `
      try {
          tripName = decodeURIComponent(tripName.replace(/\\+/g, ' '));
      } catch(e) {}
      document.getElementById('trip-title').textContent = tripName;
`;

code = code.replace(textContentTarget, textContentReplacement);

fs.writeFileSync('trip_detail.html', code);

