const fs = require('fs');

let code = fs.readFileSync('trip_detail.html', 'utf8');

const btnTarget = `<button id="btn-edit-plan" class="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow hover:bg-blue-700 transition-colors flex items-center gap-1.5">
      <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Customize
    </button>`;
const btnReplace = `<div class="flex items-center gap-2">
      <button id="btn-share-trip" class="bg-white text-blue-600 border border-blue-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-1.5">
        <i data-lucide="share-2" class="w-3.5 h-3.5"></i> Share
      </button>
      <button id="btn-edit-plan" class="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow hover:bg-blue-700 transition-colors flex items-center gap-1.5">
        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Customize
      </button>
    </div>`;

code = code.replace(btnTarget, btnReplace);

const jsTarget = `document.getElementById('btn-edit-plan').addEventListener('click', () => {`;
const jsReplace = `const btnShare = document.getElementById('btn-share-trip');
      if (btnShare) {
        btnShare.addEventListener('click', () => {
          const url = window.location.href;
          const shareData = {
            title: \`Check out \${tripName} on KYT\`,
            text: \`Explore this curated journey featuring amazing cities and rich cultural experiences!\`,
            url: url
          };
          if (navigator.share) {
            navigator.share(shareData).catch(err => console.log('Error sharing:', err));
          } else {
            navigator.clipboard.writeText(url)
              .then(() => alert('Trip link copied to clipboard!'))
              .catch(err => console.error('Error copying link:', err));
          }
        });
      }

      document.getElementById('btn-edit-plan').addEventListener('click', () => {`;

code = code.replace(jsTarget, jsReplace);

fs.writeFileSync('trip_detail.html', code);

