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

  // --- Attraction Details Modal ---
  // --- Attraction Detail Expansion (Inline) ---
  function expandAttractionDetail(cityId, attraction) {
    console.log('[VT-DEBUG] expandAttractionDetail called:', { cityId, attractionTitle: attraction.title, attractionNotes: attraction.notes });

    // Close any other expanded details first
    document.querySelectorAll('.vt-attraction-detail').forEach(detail => {
      detail.classList.add('hidden');
      detail.classList.remove('animate-expand');
    });

    // Find the detail section for this city and populate it
    const cityCard = document.querySelector(`article[data-city-id="${cityId}"]`);
    if (!cityCard) {
      console.error('[VT-DEBUG] City card not found for cityId:', cityId);
      return;
    }

    const detailSection = cityCard.querySelector('.vt-attraction-detail');
    if (!detailSection) {
      console.error('[VT-DEBUG] Detail section not found in city card');
      return;
    }

    // Clear any animation classes before populating
    detailSection.classList.remove('animate-expand');

    // Populate title
    const titleEl = detailSection.querySelector('.vt-detail-title');
    if (titleEl) titleEl.textContent = attraction.title || 'Attraction';

    // Populate location
    const whereEl = detailSection.querySelector('.vt-detail-where');
    if (whereEl) whereEl.textContent = attraction.where || 'Location TBD';

    // Populate time
    const timeEl = detailSection.querySelector('.vt-detail-time');
    if (timeEl) {
      const hour = attraction.hour != null ? String(attraction.hour).padStart(2, '0') : '--';
      timeEl.textContent = hour + ':00';
    }

    // Populate travel style (intent)
    const intentEl = detailSection.querySelector('.vt-detail-intent');
    if (intentEl) {
      const intents = attraction.intent || ['cultural'];
      const iconMap = { spiritual: 'heart', cultural: 'compass', adventure: 'mountain', culinary: 'utensils' };
      const colorMap = { spiritual: 'purple', cultural: 'blue', adventure: 'emerald', culinary: 'orange' };

      intentEl.innerHTML = intents.map(intent => {
        const icon = iconMap[intent] || 'map-pin';
        const color = colorMap[intent] || 'slate';
        const textColor = `text-${color}-700`;
        const bgColor = `bg-${color}-50 border-${color}-200`;
        return `<span class="inline-flex items-center gap-1 ${bgColor} border ${textColor} text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                  <i data-lucide="${icon}" class="w-3 h-3"></i> ${intent.charAt(0).toUpperCase() + intent.slice(1)}
                </span>`;
      }).join('');
    }

    // Populate pace
    const paceEl = detailSection.querySelector('.vt-detail-pace');
    if (paceEl) {
      const paces = attraction.pace || ['standard'];
      paceEl.innerHTML = paces.map(pace => {
        const labels = { short: '⚡ Short (< 1 hour)', standard: '🚶 Standard (1-2 hours)', deep: '🔍 Deep Dive (2+ hours)' };
        return `<span class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                  ${labels[pace] || pace}
                </span>`;
      }).join('');
    }

    // Populate mobility/accessibility
    const mobilityEl = detailSection.querySelector('.vt-detail-mobility');
    if (mobilityEl) {
      const mobilityLabels = { easy: '✅ Easy Access', walk: '🚶 Walking Required', trek: '⛰️ Trek/Strenuous' };
      mobilityEl.textContent = mobilityLabels[attraction.mobility] || (attraction.mobility || 'Easy');
    }

    // Populate dietary (if applicable)
    const dietSection = detailSection.querySelector('.vt-detail-dietary');
    const dietEl = detailSection.querySelector('.vt-detail-diet');
    if (attraction.diet && attraction.diet.length > 0 && !attraction.diet.includes('any')) {
      if (dietSection) dietSection.classList.remove('hidden');
      if (dietEl) {
        dietEl.innerHTML = attraction.diet.map(d => {
          const labels = { veg: '🥬 Vegetarian', jain: '🌾 Jain', satvik: '🧘 Satvik (no onion/garlic)', any: 'All diets' };
          return `<span class="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                    ${labels[d] || d}
                  </span>`;
        }).join('');
      }
    } else {
      if (dietSection) dietSection.classList.add('hidden');
    }

    // Populate notes/description - THIS IS CRITICAL
    const notesEl = detailSection.querySelector('.vt-detail-notes');
    if (notesEl) {
      console.log('[VT-DEBUG] Setting notes:', attraction.notes);
      notesEl.textContent = attraction.notes || 'Explore this attraction and soak in the experience.';
    }

    // Show the detail section with smooth animation
    detailSection.classList.remove('hidden');
    // Trigger reflow to ensure animation plays
    void detailSection.offsetHeight;
    detailSection.classList.add('animate-expand');
    if (window.lucide) lucide.createIcons();

    // Scroll into view on mobile
    setTimeout(() => {
      detailSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  // --- Screens ---
  function showScreen(screen) {
    DOM.screenHub.classList.add('hidden');
    DOM.screenCanvas.classList.add('hidden');
    DOM.screenBuilder.classList.add('hidden');

    if (screen === 'hub') {
      DOM.title.innerHTML = '<i data-lucide="compass" class="w-5 h-5 text-blue-600"></i> My Trips';
      DOM.screenHub.classList.remove('hidden');
    } else if (screen === 'canvas') {
      DOM.title.innerHTML = `<button id="btn-back-hub" class="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"><i data-lucide="chevron-left" class="w-4 h-4"></i> My Trips</button>`;
      document.getElementById('btn-back-hub').addEventListener('click', openHub);
      DOM.screenCanvas.classList.remove('hidden');
      DOM.screenCanvas.classList.add('flex');
    } else if (screen === 'builder') {
      DOM.title.innerHTML = `<button id="btn-back-hub" class="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"><i data-lucide="chevron-left" class="w-4 h-4"></i> Edit Plan</button>`;
      document.getElementById('btn-back-hub').addEventListener('click', openCanvas.bind(null, currentTripId));
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
      DOM.listRoot.innerHTML = `
        <div class="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div class="text-5xl mb-4">🧭</div>
          <h3 class="font-black text-slate-800 text-lg mb-2">Plan Your Dream Trip</h3>
          <p class="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto mb-4">
            Pick cities, set your travel style, and KYT builds your day-by-day itinerary automatically.
          </p>
          <p class="text-xs text-slate-400">Type a trip name above to get started ↑</p>
        </div>`;
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
    
    const query = (DOM.citySearchInput.value || '').toLowerCase().trim();
    
    const available = window.KYT_CITIES.filter(c => {
      if (trip.cities.includes(c.id)) return false;
      if (!query) return true;
      if (c.name.toLowerCase().includes(query)) return true;
      if ((c.notes || '').toLowerCase().includes(query)) return true;
      if (c.aliases && c.aliases.some(a => a.toLowerCase().includes(query))) return true;
      return false;
    });

    if (available.length === 0) {
      DOM.cityListRoot.innerHTML = `<div class="text-center text-slate-400 text-sm py-4">No cities found.</div>`;
      return;
    }

    DOM.cityListRoot.innerHTML = available.map(city => {
      const beats = city.beats || [];
      const beatCount = beats.length;

      // Intent → colour map for pill badges
      const intentColor = { spiritual:'purple', cultural:'blue', adventure:'emerald', culinary:'orange' };
      const iconColor   = { spiritual:'text-purple-500', cultural:'text-blue-500', adventure:'text-emerald-500', culinary:'text-orange-500' };

      const attractionPills = beats.slice(0, 4).map(b => {
        const primaryIntent = (b.intent || ['cultural'])[0];
        const col = iconColor[primaryIntent] || 'text-slate-500';
        return `<button class="vt-attraction-pill inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer" data-city-id="${city.id}" data-attraction-index="${beats.indexOf(b)}" title="${b.notes || b.title}">
                  <i data-lucide="${b.icon || 'map-pin'}" class="w-3 h-3 ${col} shrink-0"></i>${b.title}
                </button>`;
      }).join('');
      const moreCount = beatCount > 4 ? `<span class="text-[10px] text-slate-400 font-bold px-1">+${beatCount - 4} more</span>` : '';

      return `
        <article class="bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all" data-city-id="${city.id}">
          <!-- City Header -->
          <div class="p-4">
            <div class="flex justify-between items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 class="font-black text-slate-800 text-base">${city.name}</h4>
                  ${city.aliases && city.aliases.length ? `<span class="text-xs font-medium text-slate-400">(${city.aliases.join(', ')})</span>` : ''}
                  <span class="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">${beatCount} attraction${beatCount !== 1 ? 's' : ''}</span>
                </div>
                <p class="text-xs text-slate-500 leading-relaxed line-clamp-2">${city.notes || 'Explore this destination'}</p>
              </div>
              <div class="shrink-0 flex items-center gap-2">
                ${city.lat && city.lng ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.name + ', India')}" target="_blank" rel="noopener noreferrer" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View on Google Maps" onclick="event.stopPropagation()">
                  <i data-lucide="map" class="w-4 h-4"></i>
                </a>` : ''}
                <button class="btn-add-city bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-sm" data-id="${city.id}">
                  Add +
                </button>
              </div>
            </div>
            ${beatCount > 0 ? `<div class="mt-3 flex flex-wrap gap-1.5 vt-attraction-list">${attractionPills}${moreCount}</div>` : ''}
          </div>

          <!-- Expandable Attraction Detail Section -->
          <div class="vt-attraction-detail hidden border-t border-slate-100 p-4 space-y-4 bg-slate-50">
            <button class="ml-auto text-slate-400 hover:text-slate-600 transition-colors" onclick="event.stopPropagation(); this.closest('.vt-attraction-detail').classList.add('hidden');">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>

            <!-- Title -->
            <div>
              <h5 class="text-lg font-extrabold text-slate-800 vt-detail-title">Attraction</h5>
            </div>

            <!-- Location -->
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location</p>
              <div class="flex items-start gap-2">
                <i data-lucide="map-pin" class="w-4 h-4 text-slate-400 mt-0.5 shrink-0"></i>
                <p class="text-sm font-bold text-slate-700 vt-detail-where">Location TBD</p>
              </div>
            </div>

            <!-- Time -->
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Suggested Time</p>
              <div class="flex items-start gap-2">
                <i data-lucide="clock" class="w-4 h-4 text-slate-400 mt-0.5 shrink-0"></i>
                <p class="text-sm font-bold text-slate-700 vt-detail-time">09:00</p>
              </div>
            </div>

            <!-- Travel Style -->
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Travel Style</p>
              <div class="flex flex-wrap gap-1.5 vt-detail-intent"></div>
            </div>

            <!-- Travel Pace -->
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Travel Pace</p>
              <div class="flex flex-wrap gap-1.5 vt-detail-pace"></div>
            </div>

            <!-- Accessibility -->
            <div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Accessibility</p>
              <p class="text-sm font-bold text-slate-700 capitalize vt-detail-mobility">Easy</p>
            </div>

            <!-- Dietary (if applicable) -->
            <div class="vt-detail-dietary hidden">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dietary Options</p>
              <div class="flex flex-wrap gap-1.5 vt-detail-diet"></div>
            </div>

            <!-- Notes -->
            <div class="pt-2 border-t border-slate-200">
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">About This Attraction</p>
              <p class="text-sm leading-relaxed text-slate-600 font-medium vt-detail-notes">Explore this attraction and soak in the experience.</p>
            </div>

            <!-- Got It Button -->
            <button class="w-full py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-lg text-sm transition-all" onclick="event.stopPropagation(); this.closest('.vt-attraction-detail').classList.add('hidden');">
              Got It
            </button>
          </div>
        </article>
      `;
    }).join('');
    if (window.lucide) lucide.createIcons();

    // Attach click handlers to attraction pills
    document.querySelectorAll('.vt-attraction-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const cityId = pill.dataset.cityId;
        const attractionIndex = parseInt(pill.dataset.attractionIndex, 10);
        const city = window.KYT_CITIES.find(c => c.id === cityId);
        if (city && city.beats && city.beats[attractionIndex]) {
          const attraction = city.beats[attractionIndex];
          KYT.virtualTrips.expandAttractionDetail(cityId, attraction);
        }
      });
    });
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
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-base font-black text-slate-800">${trip.name}</h3>
        <button onclick="KYT.virtualTrips.editCanvas()" class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 active:scale-95 transition-all">← Edit Cities</button>
      </div>
    `;

    // Group steps by dayId
    const days = {};
    trip.steps.forEach(step => {
        if (!days[step.dayId]) days[step.dayId] = [];
        days[step.dayId].push(step);
    });

    if (Object.keys(days).length === 0) {
        html += `
          <div class="text-center p-6 bg-white rounded-2xl border border-slate-100 mt-4">
            <div class="text-3xl mb-3">🔍</div>
            <p class="text-sm font-bold text-slate-700 mb-1">No matching activities</p>
            <p class="text-xs text-slate-400 mb-4">Your travel style filters out all activities for these cities. Try changing your travel style or adding different cities.</p>
            <button onclick="KYT.virtualTrips.editCanvas()" class="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">← Edit Plan</button>
          </div>`;
    } else {
        Object.keys(days).sort((a,b) => parseInt(a) - parseInt(b)).forEach(dayId => {
            const cityName = days[dayId][0].cityName;

            const stepsHtml = days[dayId].map(beat => {
              const timeLabel = beat.hour != null ? `${String(beat.hour).padStart(2,'0')}:00` : '';
              const mapsLink = beat.mapsUrl ? `<a href="${beat.mapsUrl}" target="_blank" rel="noopener" class="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-500 hover:text-blue-700 mt-0.5"><i data-lucide="map-pin" class="w-2.5 h-2.5"></i> Map</a>` : '';
              const notesText = beat.notes ? `<p class="text-[11px] text-slate-400 leading-relaxed mt-0.5 line-clamp-2">${beat.notes}</p>` : '';
              return `
                <div class="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm mt-2">
                  ${timeLabel ? `<span class="text-[10px] font-black text-slate-400 pt-0.5 w-8 shrink-0 tabular-nums">${timeLabel}</span>` : '<span class="w-8 shrink-0"></span>'}
                  <div class="p-1.5 bg-blue-50 text-blue-500 rounded-lg shrink-0">
                    <i data-lucide="${beat.icon || 'map-pin'}" class="w-4 h-4"></i>
                  </div>
                  <div class="flex-1 min-w-0 pr-7">
                    <p class="text-sm font-bold text-slate-800 leading-tight">${beat.title}</p>
                    ${notesText}
                    ${mapsLink}
                  </div>
                  <button class="absolute right-2 top-3 p-1.5 text-slate-200 hover:text-rose-400 transition-colors" onclick="deleteVirtualTripStep('${beat.id}')">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              `;
            }).join('');

            html += `
              <div class="mb-5">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-widest">Day ${dayId}</span>
                  <span class="text-[11px] font-bold text-slate-500">${cityName}</span>
                </div>
                <div class="relative">${stepsHtml}</div>
              </div>
            `;
        });
    }

    // ── Success footer — always visible at the bottom of builder ─────────────────
    const totalSteps = trip.steps.length;
    const totalDays  = Object.keys(days).length;
    html += `
      <div class="sticky bottom-0 -mx-4 px-4 pb-4 pt-3 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent mt-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-md p-4 flex flex-col gap-3">
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <i data-lucide="check-circle-2" class="w-4 h-4 text-green-500 shrink-0"></i>
            <span><strong class="text-slate-800">${totalSteps} activities</strong> across <strong class="text-slate-800">${totalDays} day${totalDays > 1 ? 's' : ''}</strong> planned for <strong class="text-slate-800">${trip.name}</strong></span>
          </div>
          <a href="configure_trip.html"
             class="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-200">
            <i data-lucide="map" class="w-4 h-4"></i>
            Start Building This Trip
          </a>
        </div>
      </div>
    `;

    DOM.itineraryListRoot.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }

  function editCanvas() {
    openCanvas(currentTripId);
  }

  // ─── Navigation ───────────────────────────────────────────────────────────────
  // Simple page-level navigation. All toolbar buttons use window.location so they
  // work correctly regardless of which HTML page is currently loaded.
  function openView()  { window.location.href = 'virtual_trip.html'; }
  function closeView() { window.location.href = 'index.html'; }

  // ─── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    vtrips = loadVTrips();

    // Wire the Close button inside virtual_trip.html
    if (DOM.btnClose) DOM.btnClose.addEventListener('click', closeView);

    // Wire the toolbar compass icon from *any* page.
    // cloneNode trick removes any stale listeners from prior JS loads.
    const btnOpen = document.getElementById('btn-open-virtual-trips');
    if (btnOpen) {
      const fresh = btnOpen.cloneNode(true);
      btnOpen.replaceWith(fresh);
      fresh.addEventListener('click', openView);
    }

    // ── Hub ──────────────────────────────────────────────────────────────────────
    if (DOM.btnCreate) DOM.btnCreate.addEventListener('click', createNewTrip);
    if (DOM.newNameInput) {
      DOM.newNameInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') createNewTrip();
      });
    }

    if (DOM.listRoot) {
      DOM.listRoot.addEventListener('click', e => {
        const delBtn = e.target.closest('.btn-del-vt');
        if (delBtn) { e.stopPropagation(); deleteTrip(delBtn.dataset.id); return; }
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

    // ── Canvas ───────────────────────────────────────────────────────────────────
    if (DOM.editNameInput) {
      DOM.editNameInput.addEventListener('change', e => {
        const trip = getActiveTrip();
        if (trip) { trip.name = e.target.value.trim() || 'Untitled Trip'; saveVTrips(); }
      });
    }

    if (DOM.tasteRoot) {
      DOM.tasteRoot.addEventListener('click', e => {
        const chip = e.target.closest('.vt-chip');
        if (!chip) return;
        const trip = getActiveTrip();
        if (trip) {
          trip.taste[chip.dataset.field] = chip.dataset.id;
          trip.steps = null;
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
          trip.steps = null;
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
        if (addBtn) {
          e.stopPropagation();
          const trip = getActiveTrip();
          if (trip && !trip.cities.includes(addBtn.dataset.id)) {
            trip.cities.push(addBtn.dataset.id);
            trip.steps = null;
            saveVTrips();
            // Clear search box UX Reset
            if (DOM.citySearchInput) DOM.citySearchInput.value = '';
            renderCanvas();
          }
          return;
        }

        const cityCard = e.target.closest('article[data-city-id]');
        if (cityCard && !e.target.closest('.vt-attraction-pill') && !e.target.closest('.vt-attraction-detail') && !e.target.closest('a')) {
          openCityDetail(cityCard.dataset.cityId);
        }
      });
    }

    // Bind close button for city detail overlay
    const btnCloseCD = document.getElementById('btn-close-city-detail');
    if (btnCloseCD) {
      btnCloseCD.addEventListener('click', closeCityDetail);
    }
    
    // Bind click outside panel to close
    const cdOverlay = document.getElementById('city-detail-overlay');
    if (cdOverlay) {
      cdOverlay.addEventListener('click', (e) => {
        if (e.target === cdOverlay) closeCityDetail();
      });
    }

    if (DOM.btnBuild) {
      DOM.btnBuild.addEventListener('click', () => {
        const trip = getActiveTrip();
        if (trip) { trip.steps = generateSteps(trip); saveVTrips(); openBuilder(); }
      });
    }

    // Share logic for city detail
    const btnShareCity = document.getElementById('btn-share-city');
    if (btnShareCity) {
      btnShareCity.addEventListener('click', () => {
        const titleEl = document.getElementById('cd-title');
        const cityId = titleEl.dataset.cityId;
        if (!cityId) return;

        const url = new URL(window.location.href);
        // Ensure we are pointing to the correct page if shared from somewhere else
        url.pathname = url.pathname.replace(/\/[^\/]*$/, '/virtual_trip.html');
        url.searchParams.set('city', cityId);

        const shareData = {
          title: `Check out ${titleEl.textContent} on KYT`,
          text: `Explore ${titleEl.textContent} and plan your virtual trip!`,
          url: url.toString()
        };

        if (navigator.share) {
          navigator.share(shareData).catch(err => console.log('Error sharing:', err));
        } else {
          navigator.clipboard.writeText(url.toString())
            .then(() => alert('Link copied to clipboard!'))
            .catch(err => console.error('Error copying link:', err));
        }
      });
    }

    // Routing Logic for Deep Links
    const params = new URLSearchParams(window.location.search);
    const sharedCity = params.get('city');
    if (sharedCity) {
      // Clean up URL without reloading
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('city');
      window.history.replaceState({}, document.title, newUrl.toString());

      openHub();
      // Small delay to ensure hub is rendered before opening overlay
      setTimeout(() => {
        openCityDetail(sharedCity);
      }, 100);
    } else if (window.location.pathname.includes('virtual_trip.html')) {
      // If we ARE on virtual_trip.html with no city, auto-launch the hub
      openHub();
    }
  }

  function openCityDetail(cityId) {
    const city = window.KYT_CITIES.find(c => c.id === cityId);
    if (!city) return;

    const overlay = document.getElementById('city-detail-overlay');
    const panel = document.getElementById('city-detail-panel');
    if (!overlay || !panel) return;

    // Populate data
    document.getElementById('cd-title').textContent = city.name;
    document.getElementById('cd-title').dataset.cityId = city.id;
    document.getElementById('cd-state-tag').textContent = city.state || 'India';
    document.getElementById('cd-description').textContent = city.notes || 'A beautiful destination to explore.';

    // YouTube Video Carousel Logic
    const heroPlaceholder = document.getElementById('cd-hero-placeholder');
    const headerDiv = heroPlaceholder.parentElement;
    
    // Cleanup old iframe/controls if exists
    const oldIframe = document.getElementById('cd-hero-yt');
    if (oldIframe) oldIframe.remove();
    const oldControls = document.getElementById('cd-yt-controls');
    if (oldControls) oldControls.remove();

    if (window.KYT_CITY_VIDEOS && window.KYT_CITY_VIDEOS[city.id] && window.KYT_CITY_VIDEOS[city.id].length > 0) {
      heroPlaceholder.classList.add('hidden');
      
      const videos = window.KYT_CITY_VIDEOS[city.id];
      let currentVidIdx = 0;
      
      const iframe = document.createElement('iframe');
      iframe.id = 'cd-hero-yt';
      iframe.className = 'absolute inset-0 w-full h-full object-cover z-0';
      iframe.src = `https://www.youtube.com/embed/${videos[currentVidIdx].id}?rel=0&modestbranding=1`;
      iframe.allowFullscreen = true;
      iframe.style.border = 'none';
      
      headerDiv.insertBefore(iframe, heroPlaceholder);
      
      if (videos.length > 1) {
        const controls = document.createElement('div');
        controls.id = 'cd-yt-controls';
        controls.className = 'absolute inset-0 pointer-events-none flex justify-between items-center px-2 z-10';
        controls.innerHTML = `
          <button class="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full transition-colors" id="btn-yt-prev">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
          </button>
          <button class="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full transition-colors" id="btn-yt-next">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        `;
        headerDiv.appendChild(controls);
        
        document.getElementById('btn-yt-prev').onclick = (e) => {
          e.stopPropagation();
          currentVidIdx = (currentVidIdx - 1 + videos.length) % videos.length;
          iframe.src = `https://www.youtube.com/embed/${videos[currentVidIdx].id}?rel=0&modestbranding=1`;
        };
        document.getElementById('btn-yt-next').onclick = (e) => {
          e.stopPropagation();
          currentVidIdx = (currentVidIdx + 1) % videos.length;
          iframe.src = `https://www.youtube.com/embed/${videos[currentVidIdx].id}?rel=0&modestbranding=1`;
        };
      }
    } else {
      heroPlaceholder.classList.remove('hidden');
    }

    // Populate Attractions
    const attrList = document.getElementById('cd-attractions-list');
    if (city.beats && city.beats.length > 0) {
      attrList.innerHTML = city.beats.map(b => `
        <div class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
          <div class="bg-blue-50 p-2 rounded-lg text-blue-600 shrink-0">
            <i data-lucide="${b.icon || 'map-pin'}" class="w-5 h-5"></i>
          </div>
          <div>
            <h4 class="font-bold text-slate-800 text-sm mb-0.5">${b.title}</h4>
            <p class="text-[11px] text-slate-500 leading-snug">${b.notes || b.where}</p>
          </div>
        </div>
      `).join('');
    } else {
      attrList.innerHTML = `<p class="text-xs text-slate-400 italic">No top attractions listed yet.</p>`;
    }

    // Main Add button logic
    const mainAdd = document.getElementById('cd-btn-add-main');
    const trip = getActiveTrip();
    if (trip && trip.cities.includes(city.id)) {
      mainAdd.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Added`;
      mainAdd.classList.replace('bg-blue-600', 'bg-emerald-600');
      mainAdd.disabled = true;
    } else {
      mainAdd.innerHTML = `<i data-lucide="plus" class="w-4 h-4"></i> Add to Trip`;
      mainAdd.classList.replace('bg-emerald-600', 'bg-blue-600');
      mainAdd.disabled = false;
      mainAdd.onclick = () => {
        if (!trip.cities.includes(city.id)) {
          trip.cities.push(city.id);
          trip.steps = null;
          saveVTrips();
          if (DOM.citySearchInput) DOM.citySearchInput.value = '';
          renderCanvas();
          closeCityDetail();
        }
      };
    }

    // Populate Nearby Cities using Distance Matrix
    const nearbyList = document.getElementById('cd-nearby-list');
    if (window.KYT_DISTANCE_MATRIX && window.KYT_DISTANCE_MATRIX[city.id]) {
      // Get all nearby cities and sort by distance
      const nearby = Object.entries(window.KYT_DISTANCE_MATRIX[city.id])
        .sort((a, b) => a[1] - b[1])
        .slice(0, 8); // top 8 closest
      
      if (nearby.length > 0) {
        nearbyList.innerHTML = nearby.map(([nId, dist]) => {
          const nCity = window.KYT_CITIES.find(c => c.id === nId);
          if (!nCity) return '';
          const isAdded = trip && trip.cities.includes(nId);
          const btnHtml = isAdded 
            ? `<button class="w-full mt-2 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold" disabled>Added</button>`
            : `<button class="w-full mt-2 py-1.5 bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold transition-colors" onclick="KYT.virtualTrips.addNearby('${nId}')">Add +</button>`;
          
          return `
            <div class="shrink-0 w-32 bg-white rounded-xl border border-slate-200 shadow-sm p-3 snap-start cursor-pointer hover:border-blue-300 transition-colors" onclick="KYT.virtualTrips.openCityDetail('${nId}')">
              <div class="h-16 bg-slate-100 rounded-lg mb-2 flex items-center justify-center">
                <i data-lucide="image" class="w-6 h-6 text-slate-300"></i>
              </div>
              <h4 class="font-black text-slate-800 text-xs truncate">${nCity.name}</h4>
              <p class="text-[10px] text-slate-500 font-medium">${dist} km away</p>
              ${btnHtml}
            </div>
          `;
        }).join('');
      } else {
        nearbyList.innerHTML = `<p class="text-xs text-slate-400 italic px-5">No nearby cities found within 600km.</p>`;
      }
    } else {
      nearbyList.innerHTML = `<p class="text-xs text-slate-400 italic px-5">Distance matrix not loaded.</p>`;
    }

    if (window.lucide) lucide.createIcons();

    // Show overlay
    overlay.classList.remove('hidden');
    // small delay to allow display block to take effect before animating opacity and transform
    setTimeout(() => {
      overlay.classList.remove('opacity-0');
      panel.classList.remove('translate-y-full', 'md:translate-x-full');
    }, 10);
  }

  function closeCityDetail() {
    const overlay = document.getElementById('city-detail-overlay');
    const panel = document.getElementById('city-detail-panel');
    if (!overlay || !panel) return;

    overlay.classList.add('opacity-0');
    panel.classList.add('translate-y-full', 'md:translate-x-full');
    
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 300); // match transition duration
  }
  
  function addNearby(cityId) {
    const trip = getActiveTrip();
    if (trip && !trip.cities.includes(cityId)) {
      trip.cities.push(cityId);
      trip.steps = null;
      saveVTrips();
      renderCanvas();
      // Keep it open, just re-render to update the button states
      const currentCityId = document.getElementById('cd-btn-add-main').onclick ? null : 'placeholder'; // slightly hacky to find current city, better to re-open
      // Actually we can just close it for now, or the user can keep browsing.
      // Re-triggering openCityDetail for the current city would refresh UI.
      // We don't have currentCityId stored explicitly, but it's ok to just let it update visually or close.
      // Let's close and let them see the canvas.
      closeCityDetail();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { open: openView, close: closeView, editCanvas, expandAttractionDetail, openCityDetail, addNearby };
})();


