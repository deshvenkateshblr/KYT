const fs = require('fs');

let html = fs.readFileSync('C:/Venkatesh/KYT/curated_trips.html', 'utf8');

// 1. Update Card Action buttons
const oldCardBtn = `<button onclick="openTripDetail('\${trip.id}')" class="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 active:scale-98 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-xs">
                <span>View Full Itinerary</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </button>`;

const newCardBtn = `<div class="flex items-center gap-2 pt-1">
                <button onclick="customizeTrip('\${trip.id}')" class="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20">
                  <i data-lucide="compass" class="w-3.5 h-3.5"></i>
                  <span>Customize &amp; Plan</span>
                </button>
                <button onclick="openTripDetail('\${trip.id}')" class="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1" title="View details & highlights">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  <span>Preview</span>
                </button>
              </div>`;

html = html.replace(oldCardBtn, newCardBtn);

// 2. Update Drawer Footer to prioritize "Customize in Virtual Trips"
const oldDrawerFooter = `<div class="p-4 bg-white border-t border-slate-200 shrink-0 flex flex-col sm:flex-row items-center gap-3">
        <div class="w-full sm:w-auto flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <i data-lucide="calendar" class="w-4 h-4 text-slate-500 shrink-0"></i>
          <label for="trip-start-date" class="text-[11px] font-bold text-slate-600 whitespace-nowrap">Start Date:</label>
          <input type="date" id="trip-start-date" class="bg-transparent text-xs font-bold text-slate-800 border-none p-0 focus:ring-0 w-full cursor-pointer">
        </div>
        
        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button id="btn-adopt-trip" class="flex-1 sm:flex-none px-5 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5">
            <i data-lucide="play" class="w-4 h-4 fill-current"></i>
            <span>Use As My Trip</span>
          </button>
          <button id="btn-customize-trip" class="px-4 py-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5" title="Customize in Virtual Trips">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
            <span class="hidden xs:inline">Customize</span>
          </button>
        </div>
      </div>`;

const newDrawerFooter = `<div class="p-4 bg-white border-t border-slate-200 shrink-0 flex flex-col gap-2.5">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button id="btn-customize-trip" class="flex-1 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
            <i data-lucide="compass" class="w-4 h-4"></i>
            <span>Customize &amp; Plan in Virtual Trips</span>
          </button>
          
          <details class="sm:relative group">
            <summary class="list-none cursor-pointer py-2 px-3 text-center sm:text-left text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1">
              <span>More Options</span> <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
            </summary>
            <div class="sm:absolute bottom-full right-0 mb-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl w-64 space-y-2 z-50">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Direct Adoption</span>
              <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs">
                <label for="trip-start-date" class="text-[10px] font-bold text-slate-500">Date:</label>
                <input type="date" id="trip-start-date" class="bg-transparent text-xs font-bold text-slate-800 border-none p-0 focus:ring-0 w-full cursor-pointer">
              </div>
              <button id="btn-adopt-trip" class="w-full py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
                <i data-lucide="play" class="w-3 h-3"></i> Make Active Now
              </button>
            </div>
          </details>
        </div>
        <p class="text-[11px] text-slate-400 text-center leading-tight">
          💡 Opens in Virtual Trips first so you can select travel options, link your hotel reservation, adjust stops, and share before activating.
        </p>
      </div>`;

html = html.replace(oldDrawerFooter, newDrawerFooter);

// 3. Update Step Badges Rendering in Modal
const oldStepBadge = `          const verifyTags = (s.verify || []).map(v => \`
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold mt-1.5">
              <i data-lucide="alert-circle" class="w-2.5 h-2.5 text-amber-600"></i> \${v}
            </span>
          \`).join('');

          return \`
            <div class="relative pl-7 pb-5 border-l-2 border-slate-100 last:border-transparent last:pb-0">
              <div class="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center">
                <i data-lucide="\${s.icon || 'map-pin'}" class="w-2.5 h-2.5 text-blue-600"></i>
              </div>

              <div class="flex items-baseline justify-between gap-2">
                <span class="text-xs font-black text-slate-800">\${s.title}</span>
                <span class="text-[11px] font-bold text-slate-400 tabular-nums">\${timeStr}</span>
              </div>

              <div class="text-[11px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
                <span>\${s.where || 'Location'}</span>
                \${s.durationMin ? \`<span class="opacity-40">•</span><span>~\${s.durationMin} mins</span>\` : ''}
              </div>

              \${s.notes ? \`<p class="text-xs text-slate-600 mt-1 leading-relaxed">\${s.notes}</p>\` : ''}
              \${verifyTags ? \`<div class="flex flex-wrap gap-1">\${verifyTags}</div>\` : ''}
              \${mapsBtn ? \`<div>\${mapsBtn}</div>\` : ''}
            </div>
          \`;`;

const newStepBadge = `          const verifyTags = (s.verify || []).map(v => \`
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold mt-1.5">
              <i data-lucide="alert-circle" class="w-2.5 h-2.5 text-amber-600"></i> \${v}
            </span>
          \`).join('');

          const isHotel = /hotel|check[- ]?in|stay|lodge/i.test(s.title) || s.icon === 'hotel' || s.icon === 'bed';
          const isTravel = /options|train to|flight to|bus to|drive to|return to|journey back/i.test(s.title) || ['plane', 'train-front', 'bus', 'car'].includes(s.icon);

          let actionBadgeHtml = '';
          if (s.mapsUrl) {
            actionBadgeHtml = \`
              <a href="\${s.mapsUrl}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 mt-1.5 transition-colors">
                <i data-lucide="map-pin" class="w-3 h-3 text-blue-500"></i> Google Maps
              </a>
            \`;
          } else if (isHotel) {
            actionBadgeHtml = \`
              <span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-50/80 border border-dashed border-amber-300 rounded-md px-2 py-0.5 mt-1.5">
                <i data-lucide="bed" class="w-3 h-3 text-amber-600"></i> Stay Placeholder (Add hotel link in Virtual Trips)
              </span>
            \`;
          } else if (isTravel) {
            actionBadgeHtml = \`
              <span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md px-2 py-0.5 mt-1.5">
                <i data-lucide="shuffle" class="w-3 h-3 text-indigo-500"></i> Multi-Mode Travel Options
              </span>
            \`;
          }

          return \`
            <div class="relative pl-7 pb-5 border-l-2 border-slate-100 last:border-transparent last:pb-0">
              <div class="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center">
                <i data-lucide="\${s.icon || 'map-pin'}" class="w-2.5 h-2.5 text-blue-600"></i>
              </div>

              <div class="flex items-baseline justify-between gap-2">
                <span class="text-xs font-black text-slate-800">\${s.title}</span>
                <span class="text-[11px] font-bold text-slate-400 tabular-nums">\${timeStr}</span>
              </div>

              <div class="text-[11px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
                <span>\${s.where || 'Location'}</span>
                \${s.durationMin ? \`<span class="opacity-40">•</span><span>~\${s.durationMin} mins</span>\` : ''}
              </div>

              \${s.notes ? \`<p class="text-xs text-slate-600 mt-1 leading-relaxed">\${s.notes}</p>\` : ''}
              \${verifyTags ? \`<div class="flex flex-wrap gap-1">\${verifyTags}</div>\` : ''}
              \${actionBadgeHtml ? \`<div>\${actionBadgeHtml}</div>\` : ''}
            </div>
          \`;`;

// Replace steps rendering
html = html.replace(html.substring(html.indexOf('const verifyTags = (s.verify || []).map'), html.indexOf('return `\n          <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">')), newStepBadge + '\n        }).join(\'\');\n');

// 4. Expose customizeTrip function globally
const custFunc = `    window.customizeTrip = function(tripId) {
      const trips = window.KYT_CURATED_TRIPS || [];
      const trip = trips.find(t => t.id === tripId);
      if (!trip) return;

      try {
        const vtrips = JSON.parse(localStorage.getItem('kyt_virtual_trips') || '[]');
        const baseId = Date.now().toString(36);
        const steps = [];
        let n = 0;

        (trip.days || []).forEach(d => {
          (d.steps || []).forEach(s => {
            steps.push({
              id: \`\${baseId}_\${++n}\`,
              dayId: d.day,
              cityName: s.where || d.title,
              title: s.title,
              notes: s.notes || '',
              icon: s.icon || 'map-pin',
              hour: s.hour,
              minute: s.minute,
              where: s.where,
              mapsUrl: s.mapsUrl || ''
            });
          });
        });

        const newVTrip = {
          id: baseId,
          name: trip.title,
          cities: trip.cities || [],
          taste: trip.taste || { intent: 'spiritual', diet: 'satvik', pace: 'standard' },
          steps: steps,
          curatedId: trip.id
        };

        vtrips.push(newVTrip);
        localStorage.setItem('kyt_virtual_trips', JSON.stringify(vtrips));

        window.location.href = \`virtual_trip.html?id=\${baseId}\`;
      } catch (err) {
        console.error("Could not customize trip", err);
        window.location.href = 'virtual_trip.html';
      }
    };
`;

html = html.replace('// Modal Interaction', custFunc + '\n    // Modal Interaction');

// 5. Update btn-customize-trip listener to call customizeTrip
const oldCustListener = `    // "Customize Plan" button handler
    document.getElementById('btn-customize-trip').addEventListener('click', () => {
      if (!currentSelectedTrip) return;

      try {
        const vtrips = JSON.parse(localStorage.getItem('kyt_virtual_trips') || '[]');
        const baseId = Date.now().toString(36);
        const steps = [];
        let n = 0;

        (currentSelectedTrip.days || []).forEach(d => {
          (d.steps || []).forEach(s => {
            steps.push({
              id: \`\${baseId}_\${++n}\`,
              dayId: d.day,
              cityName: s.where || d.title,
              title: s.title,
              notes: s.notes || '',
              icon: s.icon || 'map-pin',
              hour: s.hour,
              minute: s.minute,
              where: s.where,
              mapsUrl: s.mapsUrl
            });
          });
        });

        const newVTrip = {
          id: baseId,
          name: currentSelectedTrip.title,
          cities: currentSelectedTrip.cities || [],
          taste: currentSelectedTrip.taste || { intent: 'spiritual', diet: 'satvik', pace: 'standard' },
          steps: steps,
          curatedId: currentSelectedTrip.id
        };

        vtrips.push(newVTrip);
        localStorage.setItem('kyt_virtual_trips', JSON.stringify(vtrips));

        // Open in virtual trips builder
        window.location.href = \`virtual_trip.html?id=\${baseId}\`;
      } catch (err) {
        console.error("Could not customize trip", err);
        window.location.href = 'virtual_trip.html';
      }
    });`;

const newCustListener = `    // "Customize Plan" button handler in drawer
    document.getElementById('btn-customize-trip').addEventListener('click', () => {
      if (!currentSelectedTrip) return;
      window.customizeTrip(currentSelectedTrip.id);
    });`;

html = html.replace(oldCustListener, newCustListener);

fs.writeFileSync('C:/Venkatesh/KYT/curated_trips.html', html);
console.log('Successfully updated curated_trips.html');

