/**
 * virtual-trips.js — Manage Planned / Virtual Trips & Taste Profile
 * Stage 1: Hub (Trip List)
 * Stage 2: Canvas (Select Cities & Taste)
 * Stage 3: Builder (Auto-bucket into days, save state)
 */

window.KYT = window.KYT || {};

KYT.virtualTrips = (function() {
  const STORAGE_KEY_VTRIPS = 'kyt_virtual_trips';
  const MOBILITY_RANK = { easy: 1, walk: 2, trek: 3 };

  const TASTE_FIELDS = {
    intent: [
      { id: 'mixed', label: 'Mixed' },
      { id: 'spiritual', label: 'Spiritual' },
      { id: 'cultural', label: 'Cultural' },
      { id: 'adventure', label: 'Adventure' },
      { id: 'culinary', label: 'Culinary' }
    ],
    diet: [
      { id: 'any', label: 'Any food' },
      { id: 'veg', label: 'Vegetarian' },
      { id: 'jain', label: 'Jain' },
      { id: 'satvik', label: 'No onion-garlic' }
    ],
    pace: [
      { id: 'short', label: 'Short' },
      { id: 'standard', label: 'Standard' },
      { id: 'deep', label: 'Deep' }
    ]
  };

  const DEFAULT_TASTE = { intent: 'mixed', diet: 'any', pace: 'standard' };

  let vtrips = [];
  let currentTripId = null;

  const DOM = {
    view: document.getElementById('virtual-trips-view'),
    title: document.getElementById('vt-header-title'),
    btnClose: document.getElementById('btn-close-virtual-trips'),
    
    // Screens
    screenHub: document.getElementById('vt-screen-hub'),
    screenCanvas: document.getElementById('vt-screen-canvas'),
    screenBuilder: document.getElementById('vt-screen-builder'),
    
    // Hub
    newNameInput: document.getElementById('vt-new-name'),
    btnCreate: document.getElementById('btn-vt-create'),
    listRoot: document.getElementById('vt-list'),
    
    // Canvas
    editNameInput: document.getElementById('vt-edit-name'),
    tasteRoot: document.getElementById('vt-taste'),
    selectedCitiesRoot: document.getElementById('vt-selected-cities'),
    emptyCitiesMsg: document.getElementById('vt-empty-cities'),
    btnBuild: document.getElementById('btn-vt-build'),
    citySearchInput: document.getElementById('vt-city-search'),
    cityListRoot: document.getElementById('vt-city-list'),

    // Builder
    itineraryListRoot: document.getElementById('vt-itinerary-list')
  };

  function init() {
    vtrips = loadVTrips();
    
    if (DOM.btnClose) DOM.btnClose.addEventListener('click', closeView);
    const btnOpen = document.getElementById('btn-open-virtual-trips');
    if (btnOpen) btnOpen.addEventListener('click', openView);

    // Hub events
    if (DOM.btnCreate) DOM.btnCreate.addEventListener('click', createNewTrip);
    if (DOM.newNameInput) {
      DOM.newNameInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') createNewTrip();
      });
    }

    if (DOM.listRoot) {
      DOM.listRoot.addEventListener('click', e => {
        const delBtn = e.target.closest('.btn-del-vt');
        if (delBtn) {
           e.stopPropagation();
           deleteTrip(delBtn.dataset.id);
           return;
        }
        const card = e.target.closest('.vt-card');
        if (card) {
          const trip = vtrips.find(t => t.id === card.dataset.id);
          if (trip && trip.steps && trip.steps.length > 0) {
             currentTripId = trip.id;
             openBuilder();
          } else {
             openCanvas(card.dataset.id);
          }
        }
      });
    }

    // Canvas events
    if (DOM.editNameInput) {
      DOM.editNameInput.addEventListener('change', e => {
        const trip = getActiveTrip();
        if (trip) {
          trip.name = e.target.value.trim() || 'Untitled Trip';
          saveVTrips();
        }
      });
    }

    if (DOM.tasteRoot) {
      DOM.tasteRoot.addEventListener('click', e => {
        const chip = e.target.closest('.vt-chip');
        if (!chip) return;
        const trip = getActiveTrip();
        if (trip) {
          trip.taste[chip.dataset.field] = chip.dataset.id;
          trip.steps = null; // Reset built steps if taste changes
          saveVTrips();
          renderCanvas();
        }
      });
    }

    if (DOM.selectedCitiesRoot) {
      DOM.selectedCitiesRoot.addEventListener('click', e => {
        const delBtn = e.target.closest('.btn-del-city');
        if (!delBtn) return;
        const trip = getActiveTrip();
        if (trip) {
          trip.cities = trip.cities.filter(c => c !== delBtn.dataset.id);
          trip.steps = null; // Reset built steps if cities change
          saveVTrips();
          renderCanvas();
        }
      });
    }

    if (DOM.citySearchInput) {
      DOM.citySearchInput.addEventListener('input', () => renderCityLibrary());
    }

    if (DOM.cityListRoot) {
      DOM.cityListRoot.addEventListener('click', e => {
        const addBtn = e.target.closest('.btn-add-city');
        if (!addBtn) return;
        const trip = getActiveTrip();
        if (trip) {
          if (!trip.cities.includes(addBtn.dataset.id)) {
            trip.cities.push(addBtn.dataset.id);
            trip.steps = null;
            saveVTrips();
            renderCanvas();
          }
        }
      });
    }

    if (DOM.btnBuild) {
      DOM.btnBuild.addEventListener('click', () => {
        const trip = getActiveTrip();
        if (trip) {
            trip.steps = generateSteps(trip);
            saveVTrips();
            openBuilder();
        }
      });
    }
  }

  // --- Storage ---
  function loadVTrips() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_VTRIPS) || '[]');
    } catch(e) { return []; }
  }
  function saveVTrips() { localStorage.setItem(STORAGE_KEY_VTRIPS, JSON.stringify(vtrips)); }
  function getActiveTrip() { return vtrips.find(t => t.id === currentTripId); }

  // --- Actions ---
  function createNewTrip() {
    const name = DOM.newNameInput.value.trim();
    if (!name) return;
    const newTrip = {
      id: Date.now().toString(),
      name,
      cities: [],
      taste: { ...DEFAULT_TASTE },
      steps: null
    };
    vtrips.push(newTrip);
    saveVTrips();
    DOM.newNameInput.value = '';
    openCanvas(newTrip.id);
  }

  function deleteTrip(id) {
    vtrips = vtrips.filter(t => t.id !== id);
    saveVTrips();
    renderHub();
  }

  // --- Screens ---
  function showScreen(screen) {
    DOM.screenHub.classList.add('hidden');
    DOM.screenCanvas.classList.add('hidden');
    DOM.screenBuilder.classList.add('hidden');
    
    if (screen === 'hub') {
      DOM.title.innerHTML = '<i data-lucide="compass" class="w-6 h-6 text-blue-600"></i> Virtual Trips';
      DOM.screenHub.classList.remove('hidden');
    } else if (screen === 'canvas') {
      DOM.title.innerHTML = '<button id="btn-back-hub" class="flex items-center gap-1 text-slate-500 hover:text-blue-600"><i data-lucide="chevron-left" class="w-6 h-6"></i> Canvas</button>';
      document.getElementById('btn-back-hub').addEventListener('click', openHub);
      DOM.screenCanvas.classList.remove('hidden');
      DOM.screenCanvas.classList.add('flex'); // It's a flex-col container
    } else if (screen === 'builder') {
      DOM.title.innerHTML = '<button id="btn-back-hub" class="flex items-center gap-1 text-slate-500 hover:text-blue-600"><i data-lucide="chevron-left" class="w-6 h-6"></i> Builder</button>';
      document.getElementById('btn-back-hub').addEventListener('click', openHub);
      DOM.screenBuilder.classList.remove('hidden');
    }
    
    if (window.lucide) lucide.createIcons();
  }

  function openHub() {
    currentTripId = null;
    renderHub();
    showScreen('hub');
  }

  function openCanvas(id) {
    currentTripId = id;
    renderCanvas();
    showScreen('canvas');
  }

  function openBuilder() {
    renderBuilder();
    showScreen('builder');
  }

  // --- Rendering Hub ---
  function renderHub() {
    if (vtrips.length === 0) {
      DOM.listRoot.innerHTML = `<div class="text-center text-slate-500 mt-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">No virtual trips yet.<br><br>Type a name above to start planning!</div>`;
      return;
    }

    DOM.listRoot.innerHTML = vtrips.map(vt => {
      let citiesPreview = vt.cities.map(cId => {
        const city = window.KYT_CITIES.find(c => c.id === cId);
        return city ? city.name : 'Unknown';
      }).join(', ');
      if (!citiesPreview) citiesPreview = 'No cities added yet.';
      
      const badge = vt.steps && vt.steps.length > 0 ? `<span class="bg-green-100 text-green-700 text-[9px] px-2 py-0.5 rounded uppercase font-bold ml-2 shrink-0">Built</span>` : '';

      return `
        <article class="vt-card cursor-pointer bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-blue-300 transition-colors" data-id="${vt.id}">
          <div class="flex justify-between items-start mb-1">
            <h3 class="font-black text-slate-800 text-lg flex items-center">${vt.name} ${badge}</h3>
            <button class="btn-del-vt p-1 -m-1 text-slate-300 hover:text-rose-500 transition-colors" data-id="${vt.id}" title="Delete Trip">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
          <p class="text-xs font-bold text-slate-500 mt-1 line-clamp-1"><i data-lucide="map-pin" class="w-3 h-3 inline"></i> ${citiesPreview}</p>
        </article>
      `;
    }).join('');
  }

  // --- Rendering Canvas ---
  function renderCanvas() {
    const trip = getActiveTrip();
    if (!trip) return;

    DOM.editNameInput.value = trip.name;

    // Taste Chips
    DOM.tasteRoot.innerHTML = Object.keys(TASTE_FIELDS).map(key => {
      const chips = TASTE_FIELDS[key].map(opt => {
        const isOn = trip.taste[key] === opt.id;
        const classes = isOn 
          ? "vt-chip bg-blue-600 text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-sm whitespace-nowrap"
          : "vt-chip bg-white text-slate-600 border border-slate-200 font-medium px-3 py-1.5 rounded-full text-xs hover:bg-slate-50 whitespace-nowrap";
        return `<button type="button" class="${classes}" data-field="${key}" data-id="${opt.id}">${opt.label}</button>`;
      }).join('');
      return `<div class="flex gap-2">${chips}</div>`;
    }).join('');

    // Selected Cities
    if (trip.cities.length === 0) {
      DOM.selectedCitiesRoot.innerHTML = '';
      DOM.emptyCitiesMsg.classList.remove('hidden');
      DOM.btnBuild.classList.add('hidden');
    } else {
      DOM.emptyCitiesMsg.classList.add('hidden');
      DOM.btnBuild.classList.remove('hidden');
      DOM.selectedCitiesRoot.innerHTML = trip.cities.map(cId => {
        const city = window.KYT_CITIES.find(c => c.id === cId);
        const name = city ? city.name : cId;
        return `
          <div class="flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm animate-pop">
            ${name}
            <button class="btn-del-city hover:bg-blue-200 p-0.5 rounded-full transition-colors ml-1" data-id="${cId}">
              <i data-lucide="x" class="w-3 h-3"></i>
            </button>
          </div>
        `;
      }).join('');
    }

    renderCityLibrary();
  }

  function renderCityLibrary() {
    const trip = getActiveTrip();
    if (!trip) return;
    
    const query = (DOM.citySearchInput.value || '').toLowerCase();
    
    const available = window.KYT_CITIES.filter(c => {
      if (trip.cities.includes(c.id)) return false;
      if (query && !c.name.toLowerCase().includes(query) && !(c.notes||'').toLowerCase().includes(query)) return false;
      return true;
    });

    if (available.length === 0) {
      DOM.cityListRoot.innerHTML = `<div class="text-center text-slate-400 text-sm py-4">No cities found.</div>`;
      return;
    }

    DOM.cityListRoot.innerHTML = available.map(city => {
      const topBeats = (city.beats || []).slice(0, 3).map(b => `<span class="inline-block bg-slate-100 text-slate-600 font-medium text-[10px] px-2 py-1 rounded mr-1 mt-1 border border-slate-200">${b.title}</span>`).join('');
      const more = (city.beats || []).length > 3 ? `<span class="inline-block text-slate-400 font-bold text-[10px] px-1 py-1 mt-1">+${city.beats.length - 3} more</span>` : '';
      return `
        <article class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col hover:border-blue-300 transition-colors">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-black text-slate-800 text-lg">${city.name}</h4>
              <p class="text-xs font-medium text-slate-500 mt-0.5 line-clamp-2">${city.notes || 'Explore this destination'}</p>
            </div>
            <button class="btn-add-city shrink-0 ml-3 bg-blue-600 text-white shadow-sm font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95" data-id="${city.id}">
              Add
            </button>
          </div>
          <div class="mt-3 flex flex-wrap gap-1">
            ${topBeats}${more}
          </div>
        </article>
      `;
    }).join('');
  }

  // --- Logic Matching ---
  function dietAllows(beatDiet, selected) {
    if (!beatDiet || !beatDiet.length) return true;
    if (selected === 'any') return true;
    if (selected === 'jain') return beatDiet.includes('jain');
    if (selected === 'satvik') return beatDiet.includes('satvik') || beatDiet.includes('jain');
    if (selected === 'veg') return beatDiet.includes('veg') || beatDiet.includes('jain') || beatDiet.includes('satvik');
    return true;
  }

  function beatMatches(beat, t) {
    if (t.intent !== 'mixed') {
      const intents = beat.intent || ['any'];
      if (!intents.includes('any') && !intents.includes(t.intent)) return false;
    }
    if (!dietAllows(beat.diet, t.diet)) return false;
    const paces = beat.pace || ['short', 'standard', 'deep'];
    if (!paces.includes(t.pace)) return false;
    return true;
  }

  function generateSteps(trip) {
    let steps = [];
    let dayCounter = 1;

    trip.cities.forEach(cityId => {
      const city = window.KYT_CITIES.find(c => c.id === cityId);
      if (!city) return;
      
      const active = !(city.skipOnPace && city.skipOnPace.includes(trip.taste.pace));
      if (!active) return;
      
      let daySteps = [];
      if (city.beats) {
        const matched = city.beats.filter(b => beatMatches(b, trip.taste)).sort((a,b)=>(a.hour||0)-(b.hour||0));
        matched.forEach(beat => {
            daySteps.push({
                id: Date.now().toString() + Math.floor(Math.random()*1000),
                dayId: dayCounter,
                cityName: city.name,
                title: beat.title,
                notes: beat.notes || beat.where,
                icon: beat.icon || 'map-pin'
            });
        });
      }
      
      // If we found steps for this city, add them and increment day
      if (daySteps.length > 0) {
          steps = steps.concat(daySteps);
          dayCounter++;
      }
    });
    return steps;
  }

  // --- Rendering Builder ---
  window.deleteVirtualTripStep = function(stepId) {
    const trip = getActiveTrip();
    if (!trip || !trip.steps) return;
    trip.steps = trip.steps.filter(s => s.id !== stepId);
    saveVTrips();
    renderBuilder();
  };

  function renderBuilder() {
    const trip = getActiveTrip();
    if (!trip || !trip.steps) return;

    let html = `
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-black text-slate-800">${trip.name}</h3>
        <button onclick="KYT.virtualTrips.editCanvas()" class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">Edit Settings</button>
      </div>
    `;

    // Group steps by dayId
    const days = {};
    trip.steps.forEach(step => {
        if (!days[step.dayId]) days[step.dayId] = [];
        days[step.dayId].push(step);
    });

    if (Object.keys(days).length === 0) {
        html += `<p class="text-sm text-slate-500 italic mt-6">No matching activities found for your taste. Try editing your settings.</p>`;
    } else {
        Object.keys(days).sort((a,b) => parseInt(a) - parseInt(b)).forEach(dayId => {
            const stepsHtml = days[dayId].map(beat => `
              <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm mt-2 relative animate-pop">
                <span class="p-1.5 text-slate-300"><i data-lucide="grip-vertical" class="w-4 h-4"></i></span>
                <div class="p-2 bg-slate-50 text-slate-500 rounded-lg shrink-0">
                  <i data-lucide="${beat.icon || 'map-pin'}" class="w-4 h-4"></i>
                </div>
                <div class="flex-1 overflow-hidden pr-8">
                  <p class="text-sm font-bold text-slate-700 truncate">${beat.title}</p>
                  <p class="text-[10px] text-slate-400 truncate">${beat.notes || ''}</p>
                </div>
                <button class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 transition-colors" onclick="deleteVirtualTripStep('${beat.id}')">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            `).join('');

            const cityName = days[dayId][0].cityName;
            html += `
              <div class="mb-6">
                <div class="flex items-baseline gap-2 mb-3 border-b border-slate-200 pb-2">
                  <h3 class="text-lg font-black text-slate-800">Day ${dayId}</h3>
                  <span class="text-sm font-bold text-blue-600">— ${cityName}</span>
                </div>
                ${stepsHtml}
              </div>
            `;
        });
    }

    DOM.itineraryListRoot.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }

  function editCanvas() {
    openCanvas(currentTripId);
  }

  function openView() {
    const mainView = document.getElementById('main-view');
    if (mainView) {
      mainView.classList.add('opacity-0');
      setTimeout(() => {
        mainView.classList.add('hidden');
        if (DOM.view) DOM.view.classList.remove('hidden');
        openHub();
      }, 200);
    } else {
      if (DOM.view) DOM.view.classList.remove('hidden');
      openHub();
    }
  }

  function closeView() { window.location.href = "index.html"; }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { open: openView, close: closeView, editCanvas };
})();

