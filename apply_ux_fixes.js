const fs = require('fs');

// ─── FIX 1: Homepage — returning user label + new user tagline ─────────────────
let idx = fs.readFileSync('index.js', 'utf8');

// Returning user: "Start a New Virtual Trip" → "My Virtual Trips"
idx = idx.replace(
  `<a href="virtual_trip.html" class="btn btn-secondary flex gap-2"><i data-lucide="compass"></i> Start a New Virtual Trip</a>`,
  `<a href="virtual_trip.html" class="btn btn-secondary flex gap-2"><i data-lucide="compass"></i> My Virtual Trips</a>`
);

// Rename "Configure Current Trip" → "Edit Itinerary"
idx = idx.replace(
  `<a href="configure_trip.html" class="btn btn-secondary flex gap-2"><i data-lucide="settings"></i> Configure Current Trip</a>`,
  `<a href="configure_trip.html" class="btn btn-secondary flex gap-2"><i data-lucide="settings"></i> Edit Itinerary</a>`
);

// New user: rename "Configure Upcoming Trip" → "Build Trip Manually"
idx = idx.replace(
  `<a href="configure_trip.html" class="btn btn-secondary flex gap-2"><i data-lucide="settings"></i> Configure Upcoming Trip</a>`,
  `<a href="configure_trip.html" class="btn btn-secondary flex gap-2"><i data-lucide="pencil"></i> Build Trip Manually</a>`
);

// Add tagline for new user under Welcome heading
idx = idx.replace(
  `<h2 class="text-xl font-bold mb-4 text-slate-800">Welcome to KYT!</h2>`,
  `<h2 class="text-xl font-bold mb-1 text-slate-800">Welcome to KYT!</h2>
      <p class="text-sm text-slate-400 mb-5 leading-relaxed">Plan, track &amp; remember your real trips — or explore destinations virtually.</p>`
);

fs.writeFileSync('index.js', idx);
console.log('✓ index.js patched');

// ─── FIX 2: view_trip.html toolbar — labels + hide bucket-list btn ─────────────
const toolbarBtn = (id, icon, label, extra = '') =>
  `<button ${id ? `id="${id}"` : ''} class="flex flex-col items-center gap-0.5 px-2 py-1.5 bg-white rounded-xl shadow-sm text-kyt-accent hover:text-blue-600 active:scale-90 transition-all border border-slate-100 min-w-[44px]" ${extra}>
          <i data-lucide="${icon}" class="w-4 h-4"></i>
          <span class="text-[9px] font-bold text-slate-400 leading-none">${label}</span>
        </button>`;

const editBtn = `<button id="btn-edit-trip" class="flex flex-col items-center gap-0.5 px-2 py-1.5 bg-white rounded-xl shadow-sm text-kyt-subtext hover:text-kyt-text active:scale-90 transition-all border border-slate-100 min-w-[44px]" title="Edit Itinerary">
        <i data-lucide="settings-2" class="w-4 h-4"></i>
        <span class="text-[9px] font-bold text-slate-400 leading-none">Edit</span>
      </button>`;

const files = ['view_trip.html', 'configure_trip.html', 'virtual_trip.html'];
for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');

  // Replace Virtual Trips button (unlabelled)
  html = html.replace(
    /<button id="btn-open-virtual-trips" class="p-3 bg-white rounded-xl shadow-sm text-kyt-accent hover:text-blue-600 active:scale-90 transition-all border border-slate-100" title="Virtual Trips">\s*<i data-lucide="compass" class="w-5 h-5"><\/i>\s*<\/button>/,
    toolbarBtn('btn-open-virtual-trips', 'compass', 'Trips', 'title="My Virtual Trips"')
  );

  // Hide the bucket-list (Explore Destinations) button — not ready
  html = html.replace(
    /<button id="btn-open-bucket-list" class="p-3 bg-white rounded-xl shadow-sm text-kyt-accent hover:text-blue-600 active:scale-90 transition-all border border-slate-100" title="Explore Destinations">\s*<i data-lucide="map" class="w-5 h-5"><\/i>\s*<\/button>/,
    `<!-- btn-open-bucket-list: hidden until Explore Destinations feature is ready -->`
  );

  // Replace Album button (unlabelled)
  html = html.replace(
    /<button id="btn-open-album" onclick="KYT\.social\.openAlbum\(\)" class="p-3 bg-white rounded-xl shadow-sm text-kyt-accent hover:text-blue-600 active:scale-90 transition-all border border-slate-100" title="View Story Album">\s*<i data-lucide="images" class="w-5 h-5"><\/i>\s*<\/button>/,
    `<button id="btn-open-album" onclick="KYT.social.openAlbum()" class="flex flex-col items-center gap-0.5 px-2 py-1.5 bg-white rounded-xl shadow-sm text-kyt-accent hover:text-blue-600 active:scale-90 transition-all border border-slate-100 min-w-[44px]" title="Memory Book">
          <i data-lucide="images" class="w-4 h-4"></i>
          <span class="text-[9px] font-bold text-slate-400 leading-none">Album</span>
        </button>`
  );

  fs.writeFileSync(file, html);
}

// Replace unlabelled edit button on view_trip only
let viewHtml = fs.readFileSync('view_trip.html', 'utf8');
viewHtml = viewHtml.replace(
  /<button id="btn-edit-trip" class="p-3 bg-white rounded-xl shadow-sm text-kyt-subtext hover:text-kyt-text active:scale-90 transition-all border border-slate-100" title="Configure Trip">\s*<i data-lucide="settings-2" class="w-5 h-5"><\/i>\s*<\/button>/,
  editBtn
);
fs.writeFileSync('view_trip.html', viewHtml);
console.log('✓ toolbar labels patched in all pages');

// ─── FIX 3: configure_trip.html — remove duplicate X close button ──────────────
let cfgHtml = fs.readFileSync('configure_trip.html', 'utf8');
cfgHtml = cfgHtml.replace(
  /<button id="btn-close-config"\s+class="p-2 -mr-2 text-kyt-subtext hover:text-kyt-text bg-slate-50 rounded-full active:scale-90 transition-transform">\s*<i data-lucide="x" class="w-5 h-5"><\/i>\s*<\/button>/,
  `<!-- btn-close-config removed: Save & Close at bottom is the primary exit -->`
);

// Move End Current Trip out of the main action area into a subtle danger zone
cfgHtml = cfgHtml.replace(
  /<button type="button" id="btn-end-trip"\s+class="w-full py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 font-bold hover:bg-rose-100 active:scale-\[0\.98\] transition-all flex items-center justify-center gap-2 text-\[13px\] shadow-sm">\s*<i data-lucide="trash-2" class="w-4 h-4"><\/i> End Current Trip\s*<\/button>/,
  `<div class="border-t border-slate-100 pt-4 mt-2 flex justify-center">
          <button type="button" id="btn-end-trip" class="text-[12px] text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors underline underline-offset-2 decoration-dotted">
            <i data-lucide="trash-2" class="w-3 h-3"></i> End &amp; delete this trip
          </button>
        </div>`
);
fs.writeFileSync('configure_trip.html', cfgHtml);
console.log('✓ configure_trip.html cleaned up');

console.log('\nAll UX fixes applied!');

