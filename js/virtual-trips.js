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

  const POPULAR_ORIGINS = [
    { id: 'bengaluru', name: 'Bengaluru (Bangalore)' },
    { id: 'delhi', name: 'Delhi / NCR' },
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'chennai', name: 'Chennai' },
    { id: 'hyderabad', name: 'Hyderabad' },
    { id: 'kolkata', name: 'Kolkata' },
    { id: 'pune', name: 'Pune' },
    { id: 'ahmedabad', name: 'Ahmedabad' }
  ];

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
    originCitySelect: document.getElementById('vt-origin-city'),
    originDesc: document.getElementById('vt-origin-desc'),
    tasteRoot: document.getElementById('vt-taste'),
    selectedCitiesRoot: document.getElementById('vt-selected-cities'),
    emptyCitiesMsg: document.getElementById('vt-empty-cities'),
    btnBuild: document.getElementById('btn-vt-build'),
    citySearchInput: document.getElementById('vt-city-search'),
    cityListRoot: document.getElementById('vt-city-list'),

    // Stay Modal
    stayModal: document.getElementById('vt-stay-modal'),
    stayModalDialog: document.getElementById('vt-stay-modal-dialog'),
    btnCloseStayModal: document.getElementById('btn-close-stay-modal'),
    btnCancelStayModal: document.getElementById('btn-cancel-stay-modal'),
    btnConfirmStayModal: document.getElementById('btn-modal-confirm-build'),
    modalDurationVal: document.getElementById('vt-modal-duration-val'),
    modalDurationHint: document.getElementById('vt-modal-duration-hint'),
    btnModalDurationMinus: document.getElementById('btn-modal-duration-minus'),
    btnModalDurationPlus: document.getElementById('btn-modal-duration-plus'),
    modalNightStaysList: document.getElementById('vt-modal-night-stays-list'),

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
  function ensureActiveTrip() {
    let trip = getActiveTrip();
    if (!trip) {
      trip = {
        id: Date.now().toString(),
        name: 'My Trip',
        originCity: 'bengaluru',
        cities: [],
        taste: { ...DEFAULT_TASTE },
        steps: null
      };
      vtrips.push(trip);
      currentTripId = trip.id;
      saveVTrips();
    }
    if (!trip.originCity) {
      trip.originCity = 'bengaluru';
    }
    return trip;
  }

  // --- Actions ---
  function createNewTrip() {
    const name = DOM.newNameInput.value.trim();
    if (!name) return;
    const origin = (DOM.originCitySelect && DOM.originCitySelect.value) || 'bengaluru';
    const newTrip = {
      id: Date.now().toString(),
      name,
      originCity: origin,
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

  // --- Share Trip ---
  function shareCurrentTrip() {
    const trip = getActiveTrip();
    if (!trip || !trip.cities.length) return alert('Add some cities to share this trip!');
    
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace(/\/[^\/]*$/, '/trip_detail.html');
    url.search = '';
    url.searchParams.set('trip', trip.name || 'Shared Trip');
    url.searchParams.set('cities', trip.cities.join(','));
    url.searchParams.set('taste', encodeTaste(trip.taste));
    if (trip.curatedId) {
      url.searchParams.set('curated', trip.curatedId);
    }
    
    const shareData = {
      title: `Check out my ${trip.name} on KYT`,
      text: `I planned a trip on KYT! Check out my itinerary for ${trip.cities.length} cities.`,
      url: url.toString()
    };

    if (navigator.share) {
      navigator.share(shareData).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url.toString())
        .then(() => alert('Trip link copied to clipboard!'))
        .catch(err => console.error('Error copying link:', err));
    }
  }

  // --- Screens ---
  function showScreen(screen) {
    DOM.screenHub.classList.add('hidden');
    DOM.screenCanvas.classList.add('hidden');
    DOM.screenBuilder.classList.add('hidden');

    const subnavBar = document.getElementById('vt-subnav-bar');
    const subnavBack = document.getElementById('vt-subnav-back');
    const subnavBackLabel = document.getElementById('vt-subnav-back-label');
    const subnavShare = document.getElementById('vt-subnav-share');

    if (window.KYT && KYT.header) {
      KYT.header.renderMainToolbar('main-toolbar', { active: 'virtual' });
    }

    if (screen === 'hub') {
      DOM.screenHub.classList.remove('hidden');
      if (subnavBar) subnavBar.classList.add('hidden');
    } else if (screen === 'canvas') {
      DOM.screenCanvas.classList.remove('hidden');
      DOM.screenCanvas.classList.add('flex');
      const trip = getActiveTrip();
      const hasPlan = (trip && trip.steps && trip.steps.length > 0);
      const backLabel = hasPlan ? 'View Itinerary' : 'My Trips';
      const backHandler = hasPlan ? openBuilder : openHub;

      if (subnavBar) {
        subnavBar.classList.remove('hidden');
        if (subnavBackLabel) subnavBackLabel.textContent = backLabel;
        if (subnavBack) {
          subnavBack.onclick = (e) => {
            e.preventDefault();
            backHandler();
          };
        }
        if (subnavShare) {
          subnavShare.onclick = (e) => {
            e.preventDefault();
            shareCurrentTrip();
          };
        }
      }
    } else if (screen === 'builder') {
      DOM.screenBuilder.classList.remove('hidden');
      if (subnavBar) {
        subnavBar.classList.remove('hidden');
        if (subnavBackLabel) subnavBackLabel.textContent = 'Edit Cities';
        if (subnavBack) {
          subnavBack.onclick = (e) => {
            e.preventDefault();
            openCanvas(currentTripId);
          };
        }
        if (subnavShare) {
          subnavShare.onclick = (e) => {
            e.preventDefault();
            shareCurrentTrip();
          };
        }
      }
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

  function sanitizeOrRegenerateSteps(trip) {
    if (!trip || !trip.steps || trip.steps.length === 0) return;
    const days = {};
    trip.steps.forEach(s => {
      const d = s.dayId != null ? s.dayId : 1;
      if (!days[d]) days[d] = [];
      days[d].push(s);
    });

    let needsRegen = false;
    Object.keys(days).forEach(dId => {
      if (Number(dId) > 1) {
        // In morning transit or excursion days, the transit leg must always be step 0 of that day
        const travelIdx = days[dId].findIndex(s => s.phase === 'Morning' && s.title && (s.title.startsWith('Travel to ') || s.title.startsWith('Day Excursion:')));
        if (travelIdx > 0) {
          needsRegen = true;
        }
      }
    });

    if (needsRegen) {
      trip.steps = generateSteps(trip);
      saveVTrips();
    }
  }

  window.regenerateVirtualTripSteps = function() {
    const trip = getActiveTrip();
    if (!trip) return;
    trip.steps = generateSteps(trip);
    saveVTrips();
    renderBuilder();
  };

  function openBuilder() {
    const trip = getActiveTrip();
    if (trip) sanitizeOrRegenerateSteps(trip);
    renderBuilder();
    showScreen('builder');
  }

  // --- Duration & Stay Modal ---
  function openStayModal() {
    const trip = getActiveTrip();
    if (!trip || !trip.cities || trip.cities.length === 0) {
      alert("Please add at least one city first.");
      return;
    }
    const modal = document.getElementById('vt-stay-modal');
    const dialog = document.getElementById('vt-stay-modal-dialog');
    if (!modal) return;

    trip.duration = trip.duration || trip.cities.length || 1;
    saveVTrips();

    renderStayModal();

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      if (dialog) {
        dialog.classList.remove('scale-95');
        dialog.classList.add('scale-100');
      }
    });
  }

  function closeStayModal() {
    const modal = document.getElementById('vt-stay-modal');
    const dialog = document.getElementById('vt-stay-modal-dialog');
    if (!modal) return;

    modal.classList.add('opacity-0');
    if (dialog) {
      dialog.classList.add('scale-95');
      dialog.classList.remove('scale-100');
    }
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 200);
  }

  window.openStayModal = openStayModal;
  window.closeStayModal = closeStayModal;

  function renderStayModal() {
    const trip = getActiveTrip();
    if (!trip) return;

    const durationVal = document.getElementById('vt-modal-duration-val');
    const durationHint = document.getElementById('vt-modal-duration-hint');
    const listRoot = document.getElementById('vt-modal-night-stays-list');

    trip.duration = trip.duration || trip.cities.length || 1;
    if (durationVal) durationVal.textContent = trip.duration;

    if (durationHint) {
      if (trip.duration === trip.cities.length) {
        durationHint.textContent = `${trip.duration} days for ${trip.cities.length} cities (1 day / city)`;
      } else if (trip.duration > trip.cities.length) {
        durationHint.textContent = `${trip.duration} days for ${trip.cities.length} cities (relaxed pacing)`;
      } else {
        durationHint.textContent = `${trip.duration} days for ${trip.cities.length} cities (packed pacing)`;
      }
    }

    if (!listRoot) return;

    if (!trip.nightStays) trip.nightStays = {};
    const activeCityObjs = trip.cities.map(cId => window.KYT_CITIES ? window.KYT_CITIES.find(c => c.id === cId) : null).filter(Boolean);

    let nightStaysHtml = '';
    for (let dayIdx = 0; dayIdx < trip.duration; dayIdx++) {
      const dayId = dayIdx + 1;
      const dayCity = activeCityObjs[dayIdx] || activeCityObjs[activeCityObjs.length - 1];
      if (!dayCity) continue;

      // Determine previous stay base
      let prevStayId;
      if (dayIdx === 0) {
        prevStayId = (trip.originCity && trip.originCity !== 'already_there' && activeCityObjs[0] && trip.originCity === activeCityObjs[0].id) ? trip.originCity : (activeCityObjs[0]?.id || 'pune');
      } else {
        prevStayId = trip.nightStays[dayId - 1] || activeCityObjs[Math.min(dayIdx - 1, activeCityObjs.length - 1)]?.id;
      }

      // Default night stay if not yet explicitly selected
      if (!trip.nightStays[dayId]) {
        if (dayIdx === 0) {
          trip.nightStays[dayId] = dayCity.id;
        } else {
          const dist = (window.KYT_DISTANCE_MATRIX && window.KYT_DISTANCE_MATRIX[prevStayId]) ? window.KYT_DISTANCE_MATRIX[prevStayId][dayCity.id] : null;
          if (dist != null && dist <= 130 && prevStayId !== 'overnight_travel') {
            trip.nightStays[dayId] = prevStayId;
          } else {
            trip.nightStays[dayId] = dayCity.id;
          }
        }
      }

      const currentStay = trip.nightStays[dayId];
      const prevCityObj = window.KYT_CITIES ? window.KYT_CITIES.find(c => c.id === prevStayId) : null;
      const stayCityObj = window.KYT_CITIES ? window.KYT_CITIES.find(c => c.id === currentStay) : null;
      const stayCityName = stayCityObj ? stayCityObj.name : currentStay;

      // Status badge - pure Overnight Travel with NO mention of train
      let statusBadge = '';
      if (currentStay === 'overnight_travel') {
        statusBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md mt-1"><i data-lucide="moon" class="w-3 h-3 text-purple-600"></i> Overnight Travel</span>`;
      } else if (currentStay === prevStayId && dayCity.id !== prevStayId) {
        statusBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md mt-1"><i data-lucide="car" class="w-3 h-3 text-amber-600"></i> Day Excursion from ${prevCityObj ? prevCityObj.name : 'base'} (returns to ${prevCityObj ? prevCityObj.name : 'hotel'} for night)</span>`;
      } else if (currentStay === dayCity.id && dayCity.id !== prevStayId) {
        statusBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md mt-1"><i data-lucide="hotel" class="w-3 h-3 text-blue-600"></i> Base Move (Check in & sleep in ${dayCity.name})</span>`;
      } else if (currentStay !== dayCity.id) {
        statusBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md mt-1"><i data-lucide="hotel" class="w-3 h-3 text-indigo-600"></i> Evening Transfer (Explore ${dayCity.name} → Sleep in ${stayCityName})</span>`;
      } else {
        statusBadge = `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1"><i data-lucide="home" class="w-3 h-3 text-emerald-600"></i> Base Stay in ${dayCity.name}</span>`;
      }

      // Build select options - pure Overnight Travel with NO mention of train
      let selectOptions = activeCityObjs.map(c => {
        const selected = currentStay === c.id ? 'selected' : '';
        return `<option value="${c.id}" ${selected}>🏨 Stay in ${c.name}</option>`;
      }).join('');
      selectOptions += `<option value="overnight_travel" ${currentStay === 'overnight_travel' ? 'selected' : ''}>🌙 Overnight Travel</option>`;

      nightStaysHtml += `
        <div class="p-3 bg-white rounded-xl border border-slate-200 transition-all hover:border-slate-300 shadow-xs">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 shrink-0">Day ${dayId}</span>
              <span class="text-xs font-bold text-slate-800 truncate">${dayCity.name}</span>
            </div>
            <div class="relative shrink-0">
              <select data-day-id="${dayId}" class="vt-modal-night-stay-select text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 py-1.5 focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none hover:bg-slate-100 transition-colors">
                ${selectOptions}
              </select>
              <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>
      `;
    }

    listRoot.innerHTML = nightStaysHtml;
    if (window.lucide) lucide.createIcons();
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
            <h3 class="font-black text-slate-800 text-lg flex items-center">${KYT.utils.escapeHTML(vt.name)} ${badge}</h3>
            <button class="btn-del-vt p-1 -m-1 text-slate-300 hover:text-rose-500 transition-colors" data-id="${vt.id}" title="Delete Trip">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
          <p class="text-xs font-bold text-slate-500 mt-1 line-clamp-1"><i data-lucide="map-pin" class="w-3 h-3 inline"></i> ${citiesPreview}</p>
        </article>
      `;
    }).join('');
  }

  function populateOriginSelector(currentOrigin) {
    if (!DOM.originCitySelect) return;
    if (DOM.originCitySelect.children.length === 0) {
      let html = `<option value="already_there">📍 Already in destination (No Day 0 travel)</option>`;
      html += `<optgroup label="Popular Starting Hubs">`;
      POPULAR_ORIGINS.forEach(o => {
        html += `<option value="${o.id}">${o.name}</option>`;
      });
      html += `</optgroup>`;

      // Other catalog cities
      if (window.KYT_CITIES && window.KYT_CITIES.length) {
        const popularIds = new Set(POPULAR_ORIGINS.map(o => o.id));
        const others = window.KYT_CITIES
          .filter(c => !popularIds.has(c.id))
          .sort((a, b) => a.name.localeCompare(b.name));

        html += `<optgroup label="All Cities">`;
        others.forEach(c => {
          html += `<option value="${c.id}">${c.name}</option>`;
        });
        html += `</optgroup>`;
      }

      DOM.originCitySelect.innerHTML = html;
    }

    DOM.originCitySelect.value = currentOrigin || 'bengaluru';
  }

  function updateOriginDesc(trip) {
    if (!DOM.originDesc) return;
    const origin = trip.originCity || 'bengaluru';
    const firstCity = trip.cities && trip.cities.length ? trip.cities[0] : null;
    if (origin === 'already_there' || (firstCity && origin === firstCity)) {
      DOM.originDesc.textContent = 'Day 1 starts directly in destination';
    } else {
      DOM.originDesc.textContent = 'Creates Day 0 transit & arrival';
    }
  }

  // --- Rendering Canvas ---
  function renderCanvas() {
    const trip = getActiveTrip();
    if (!trip) return;

    DOM.editNameInput.value = trip.name;
    populateOriginSelector(trip.originCity || 'bengaluru');
    updateOriginDesc(trip);

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
    const existingRebuild = document.getElementById('btn-vt-rebuild');
    if (trip.cities.length === 0) {
      DOM.selectedCitiesRoot.innerHTML = '';
      DOM.emptyCitiesMsg.classList.remove('hidden');
      DOM.btnBuild.classList.add('hidden');
      if (existingRebuild) existingRebuild.remove();
    } else {
      DOM.emptyCitiesMsg.classList.add('hidden');
      DOM.btnBuild.classList.remove('hidden');

      if (trip.steps && trip.steps.length > 0) {
        DOM.btnBuild.innerHTML = `<i data-lucide="calendar" class="w-4 h-4"></i> View Itinerary (${trip.steps.length} activities)`;
        if (!existingRebuild) {
          const actionGroup = document.createElement('div');
          actionGroup.id = 'btn-vt-rebuild';
          actionGroup.className = 'flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100';
          actionGroup.innerHTML = `
            <button type="button" class="btn-open-stays-config text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors">
              <i data-lucide="moon" class="w-3 h-3 text-indigo-500"></i> Stays & Duration
            </button>
            <button type="button" class="btn-reset-attractions text-[11px] text-slate-400 hover:text-rose-600 font-bold transition-colors">
              Reset Itinerary
            </button>
          `;
          actionGroup.querySelector('.btn-open-stays-config').onclick = () => openStayModal();
          actionGroup.querySelector('.btn-reset-attractions').onclick = () => {
            if (confirm("Reset this itinerary? This will replace your customized activities and timings with default attractions from the city catalog.")) {
              trip.steps = generateSteps(trip);
              saveVTrips();
              openBuilder();
            }
          };
          DOM.btnBuild.insertAdjacentElement('afterend', actionGroup);
        }
      } else {
        DOM.btnBuild.innerHTML = `<i data-lucide="wand-2" class="w-4 h-4"></i> Generate Day Plan`;
        if (existingRebuild) existingRebuild.remove();
      }
      DOM.selectedCitiesRoot.innerHTML = trip.cities.map((cId, idx) => {
        const city = window.KYT_CITIES.find(c => c.id === cId);
        const name = city ? city.name : cId;
        const isFirst = idx === 0;
        const isLast = idx === trip.cities.length - 1;
        return `
          <div class="vt-selected-city-chip inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm animate-pop cursor-pointer hover:bg-blue-100 transition-colors" data-city-id="${cId}">
            <span class="text-xs text-blue-500 font-extrabold">${idx + 1}.</span>
            <span>${name}</span>
            <div class="inline-flex items-center gap-0.5 ml-1">
              ${!isFirst ? `<button type="button" class="btn-move-city-left hover:bg-blue-200 p-0.5 rounded-full transition-colors text-blue-600" data-index="${idx}" title="Move Earlier"><i data-lucide="chevron-left" class="w-3.5 h-3.5"></i></button>` : ''}
              ${!isLast ? `<button type="button" class="btn-move-city-right hover:bg-blue-200 p-0.5 rounded-full transition-colors text-blue-600" data-index="${idx}" title="Move Later"><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></button>` : ''}
              <button type="button" class="btn-del-city hover:bg-rose-100 hover:text-rose-600 p-0.5 rounded-full transition-colors text-slate-400 ml-0.5" data-id="${cId}" title="Remove"><i data-lucide="x" class="w-3 h-3"></i></button>
            </div>
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
      if (!query) return true;
      if (c.name.toLowerCase().includes(query)) return true;
      if ((c.notes || '').toLowerCase().includes(query)) return true;
      if (c.aliases && c.aliases.some(a => a.toLowerCase().includes(query))) return true;
      return false;
    });

    if (query) {
      available.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        if (aName === query && bName !== query) return -1;
        if (aName !== query && bName === query) return 1;
        
        const aStarts = aName.startsWith(query);
        const bStarts = bName.startsWith(query);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return 0;
      });
    }

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
                ${trip.cities.includes(city.id) ? 
                  `<button class="bg-emerald-100 text-emerald-700 font-bold px-4 py-2 rounded-xl text-xs shadow-sm flex items-center gap-1" disabled>
                    <i data-lucide="check" class="w-3 h-3"></i> Added
                  </button>` : 
                  `<button class="btn-add-city bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-sm" data-id="${city.id}">
                    Add +
                  </button>`
                }
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
    let stepCounter = 0;

    // Filter cities active for the selected pace
    const activeCities = trip.cities.map(cId => window.KYT_CITIES.find(c => c.id === cId)).filter(c => {
      if (!c) return false;
      return !(c.skipOnPace && c.skipOnPace.includes(trip.taste.pace));
    });

    if (activeCities.length === 0) return [];

    const dietName = { veg: 'Vegetarian', jain: 'Jain', satvik: 'Satvik', any: 'Local' }[trip.taste?.diet] || 'Local';
    const originCityId = trip.originCity || 'bengaluru';
    const firstCity = activeCities[0];

    const isAlreadyThere = originCityId === 'already_there' || originCityId === firstCity.id;

    const originCityObj = window.KYT_CITIES ? window.KYT_CITIES.find(c => c.id === originCityId) : null;
    const originName = originCityObj ? originCityObj.name : (originCityId === 'delhi' ? 'Delhi' : (originCityId.charAt(0).toUpperCase() + originCityId.slice(1)));

    // ── Day 0: Travel & Arrival from origin city to first city ──
    // "Our days begin with Day 0 to reach first city from origin city, 
    // Day 0 activities are fluid depending on time of arrival so just one block saying exactly that and Day 1 begins in the morning."
    if (!isAlreadyThere) {
      const driveUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originName + ' India')}&destination=${encodeURIComponent(firstCity.name + ' India')}&travelmode=driving`;
      
      steps.push({
        id: Date.now().toString() + '_' + (++stepCounter),
        dayId: 0,
        cityName: firstCity.name,
        title: `Travel from ${originName} to ${firstCity.name} & Arrival`,
        notes: `Travel from ${originName} to ${firstCity.name} and check in to your stay. Activities for today are fluid depending on your time of arrival—take it easy, unpack, and settle in.`,
        where: `${originName} to ${firstCity.name}`,
        mapsUrl: driveUrl,
        icon: 'car',
        phase: 'Arrival',
        suggestedTime: 'Flexible Arrival',
        hour: 16,
        minute: 0
      });
    }

    // ── Day 1 and subsequent days ──
    const numDays = trip.duration || activeCities.length;
    for (let dayIdx = 0; dayIdx < numDays; dayIdx++) {
      let daySteps = [];
      const dayId = dayIdx + 1;
      const isFirstDay = dayIdx === 0;
      const isLastDay = dayIdx === numDays - 1;
      const city = activeCities[dayIdx] || activeCities[activeCities.length - 1];

      // Determine previous night stay base
      let prevStayCityId;
      if (isFirstDay) {
        prevStayCityId = isAlreadyThere ? (trip.originCity !== 'already_there' ? trip.originCity : firstCity.id) : firstCity.id;
      } else {
        prevStayCityId = (trip.nightStays && trip.nightStays[dayId - 1]) || activeCities[Math.min(dayIdx - 1, activeCities.length - 1)]?.id || firstCity.id;
      }

      // Determine tonight's stay
      let tonightStay = (trip.nightStays && trip.nightStays[dayId]);
      if (!tonightStay) {
        if (isFirstDay) {
          tonightStay = city.id;
        } else {
          const dist = (window.KYT_DISTANCE_MATRIX && window.KYT_DISTANCE_MATRIX[prevStayCityId]) ? window.KYT_DISTANCE_MATRIX[prevStayCityId][city.id] : null;
          if (dist != null && dist <= 130 && prevStayCityId !== 'overnight_travel') {
            tonightStay = prevStayCityId; // Excursion default for close cities
          } else {
            tonightStay = city.id;
          }
        }
      }

      const prevStayCityObj = window.KYT_CITIES ? window.KYT_CITIES.find(c => c.id === prevStayCityId) : null;
      const prevBaseName = prevStayCityObj ? prevStayCityObj.name : (prevStayCityId === 'delhi' ? 'Delhi' : (prevStayCityId ? (prevStayCityId.charAt(0).toUpperCase() + prevStayCityId.slice(1)) : 'Base'));

      const stayCityObj = window.KYT_CITIES ? window.KYT_CITIES.find(c => c.id === tonightStay) : null;
      const stayCityName = stayCityObj ? stayCityObj.name : (tonightStay === 'delhi' ? 'Delhi' : (tonightStay ? (tonightStay.charAt(0).toUpperCase() + tonightStay.slice(1)) : city.name));

      const isExcursion = !isFirstDay && (city.id !== prevStayCityId) && (tonightStay === prevStayCityId);
      const isMorningTransfer = !isFirstDay && (city.id !== prevStayCityId) && (tonightStay !== prevStayCityId) && (prevStayCityId !== 'overnight_travel');
      const isOvernightTravel = tonightStay === 'overnight_travel';
      const isEveningTransfer = !isExcursion && !isOvernightTravel && (tonightStay !== city.id);

      // Matched Sightseeing Beats
      const matched = (city.beats || []).filter(b => beatMatches(b, trip.taste)).sort((a, b) => (a.hour || 0) - (b.hour || 0));
      const hasMiddayMeal = matched.some(b => (b.hour >= 12 && b.hour < 15) && (b.icon === 'utensils' || (b.title && /lunch|chaat|thali|food|sweets|petha/i.test(b.title))));
      const hasEveningMeal = matched.some(b => (b.hour >= 18) && (b.icon === 'utensils' || (b.title && /dinner|food|thali|dhabha/i.test(b.title))));

      // ── PHASE 1: MORNING ──
      if (prevStayCityId === 'overnight_travel') {
        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: city.name,
          title: `Morning Arrival in ${city.name}`,
          notes: `Arrive in ${city.name} following overnight travel. Check in to your stay, freshen up, and get ready to explore!`,
          where: `${city.name} Station / Transit Hub`,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Hotels in ' + city.name)}`,
          icon: 'compass',
          phase: 'Morning',
          suggestedTime: 'Morning (~08:00 AM)',
          hour: 8,
          minute: 0
        });

        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: city.name,
          title: `Morning Refreshment & Breakfast`,
          notes: `Enjoy a traditional ${dietName.toLowerCase()} breakfast and freshen up before starting your day.`,
          where: city.name,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Breakfast restaurants in ' + city.name)}`,
          icon: 'coffee',
          phase: 'Morning',
          suggestedTime: 'Morning (~08:45 AM)',
          hour: 8,
          minute: 45
        });
      } else if (isExcursion) {
        const driveUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(prevBaseName + ' India')}&destination=${encodeURIComponent(city.name + ' India')}&travelmode=driving`;
        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: city.name,
          title: `Day Excursion: Drive to ${city.name}`,
          notes: `Morning drive from your stay in ${prevBaseName} to explore ${city.name}. Click Map for driving directions.`,
          where: `${prevBaseName} to ${city.name}`,
          mapsUrl: driveUrl,
          icon: 'car',
          phase: 'Morning',
          suggestedTime: 'Morning Transit (~07:30 AM)',
          hour: 7,
          minute: 30
        });
      } else if (isMorningTransfer) {
        const driveUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(prevBaseName + ' India')}&destination=${encodeURIComponent(city.name + ' India')}&travelmode=driving`;
        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: city.name,
          title: `Travel to ${city.name}`,
          notes: `Journey from ${prevBaseName} to ${city.name}. Click Map for driving directions and routes.`,
          where: `${prevBaseName} to ${city.name}`,
          mapsUrl: driveUrl,
          icon: 'car',
          phase: 'Morning',
          suggestedTime: 'Morning Transit (~07:30 AM)',
          hour: 7,
          minute: 30
        });

        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: city.name,
          title: `Hotel Check-in & Freshen Up in ${city.name}`,
          notes: `Check in to your stay in ${city.name}, drop luggage, and freshen up before exploring.`,
          where: `${city.name} Hotel / Stay`,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Hotels in ' + city.name)}`,
          icon: 'hotel',
          phase: 'Morning',
          suggestedTime: 'Morning (~11:30 AM)',
          hour: 11,
          minute: 30
        });
      } else {
        // Base stay in current city
        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: city.name,
          title: `Morning Refreshment & Breakfast`,
          notes: `Enjoy a traditional ${dietName.toLowerCase()} breakfast and hot filter coffee or chai before starting your day.`,
          where: city.name,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Breakfast restaurants in ' + city.name)}`,
          icon: 'coffee',
          phase: 'Morning',
          suggestedTime: 'Morning (~08:30 AM)',
          hour: 8,
          minute: 30
        });
      }

      // ── PHASE 2: MIDDAY & DAYTIME SIGHTSEEING ──
      const maxSightseeingHour = (isEveningTransfer || isExcursion) ? 17.0 : (isOvernightTravel ? 18.0 : 18.5);
      let currentHour = (isExcursion || isMorningTransfer) ? 13.5 : 10.0;
      let addedLunch = false;

      // If arriving mid-day from morning transfer or excursion, schedule lunch first
      if (isExcursion || isMorningTransfer) {
        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: city.name,
          title: `${dietName} Lunch in ${city.name}`,
          notes: `Savour authentic regional cuisine and thali meals at a popular local eatery in ${city.name}.`,
          where: city.name,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dietName + ' Lunch in ' + city.name)}`,
          icon: 'utensils',
          phase: 'Midday',
          suggestedTime: 'Midday (~12:30 PM)',
          hour: 12,
          minute: 30
        });
        addedLunch = true;
      }

      matched.forEach(beat => {
        let beatHour;
        if (isExcursion || isMorningTransfer) {
          beatHour = Math.min(maxSightseeingHour, Math.max(13.5, currentHour));
          currentHour = beatHour + 1.5;
        } else {
          if (beat.hour != null && beat.hour >= 9) {
            beatHour = Math.min(maxSightseeingHour, Math.max(currentHour, beat.hour));
          } else {
            beatHour = Math.min(maxSightseeingHour, currentHour);
          }
          currentHour = beatHour + 1.5;
        }

        // Add lunch before afternoon beats if not yet added
        if (!addedLunch && !hasMiddayMeal && beatHour >= 13.0) {
          daySteps.push({
            id: Date.now().toString() + '_' + (++stepCounter),
            dayId: dayId,
            cityName: city.name,
            title: `${dietName} Lunch in ${city.name}`,
            notes: `Savour authentic regional cuisine and thali meals at a popular local eatery.`,
            where: city.name,
            mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dietName + ' Lunch in ' + city.name)}`,
            icon: 'utensils',
            phase: 'Midday',
            suggestedTime: 'Midday (~13:00 PM)',
            hour: 13,
            minute: 0
          });
          addedLunch = true;
          if (beatHour < 14.0) beatHour = 14.0;
        }

        const h = Math.floor(beatHour);
        const m = Math.round((beatHour - h) * 60);
        let phase = 'Afternoon';
        if (h < 12) phase = 'Morning';
        else if (h >= 12 && h < 15) phase = 'Midday';
        else if (h >= 15 && h < 18) phase = 'Afternoon';
        else phase = 'Evening';

        const suggested = `${phase} (~${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')})`;

        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: city.name,
          title: beat.title,
          notes: beat.notes || '',
          where: beat.where || city.name,
          mapsUrl: beat.mapsUrl || '',
          icon: beat.icon || 'map-pin',
          phase: phase,
          suggestedTime: suggested,
          hour: h,
          minute: m
        });
      });

      // Ensure lunch is added if still missing
      if (!addedLunch && !hasMiddayMeal) {
        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: city.name,
          title: `${dietName} Lunch in ${city.name}`,
          notes: `Savour authentic regional cuisine and thali meals at a popular local eatery.`,
          where: city.name,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dietName + ' Lunch in ' + city.name)}`,
          icon: 'utensils',
          phase: 'Midday',
          suggestedTime: 'Midday (~13:00 PM)',
          hour: 13,
          minute: 0
        });
        addedLunch = true;
      }

      // ── PHASE 3: EVENING & NIGHT STAY ──
      if (isOvernightTravel) {
        // E1: Overnight Travel (NO mentions of train)
        if (!hasEveningMeal) {
          daySteps.push({
            id: Date.now().toString() + '_' + (++stepCounter),
            dayId: dayId,
            cityName: city.name,
            title: `Early Dinner & Refreshment in ${city.name}`,
            notes: `Early dinner and freshen up before heading to your departure hub.`,
            where: city.name,
            mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Dinner restaurants in ' + city.name)}`,
            icon: 'utensils',
            phase: 'Evening',
            suggestedTime: 'Evening (~19:30 PM)',
            hour: 19,
            minute: 30
          });
        }

        const nextCityObj = activeCities[dayIdx + 1];
        const destTitle = nextCityObj ? nextCityObj.name : originName;
        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: city.name,
          title: `Overnight Travel to ${destTitle}`,
          notes: `Check out, head to your transit departure hub, and begin your overnight travel to ${destTitle}. Rest comfortably on the journey!`,
          where: `${city.name} to ${destTitle}`,
          mapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(city.name + ' India')}&destination=${encodeURIComponent(destTitle + ' India')}`,
          icon: 'moon',
          phase: 'Evening',
          suggestedTime: 'Night Travel (~21:30 PM)',
          hour: 21,
          minute: 30
        });

      } else if (isExcursion) {
        // E2: Return to Excursion Base
        const returnDriveUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(city.name + ' India')}&destination=${encodeURIComponent(prevBaseName + ' India')}&travelmode=driving`;
        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: prevBaseName,
          title: `Return Drive to ${prevBaseName} Stay Base`,
          notes: `Wrap up your excursion in ${city.name} and return to your hotel base in ${prevBaseName}.`,
          where: `${city.name} to ${prevBaseName}`,
          mapsUrl: returnDriveUrl,
          icon: 'car',
          phase: 'Evening',
          suggestedTime: 'Evening Transit (~18:00 PM)',
          hour: 18,
          minute: 0
        });

        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: prevBaseName,
          title: `Dinner & Night Stay in ${prevBaseName}`,
          notes: `Wind down after your excursion with dinner in ${prevBaseName} and rest at your hotel.`,
          where: prevBaseName,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Dinner restaurants in ' + prevBaseName)}`,
          icon: 'utensils',
          phase: 'Evening',
          suggestedTime: 'Evening (~20:00 PM)',
          hour: 20,
          minute: 0
        });

      } else if (isEveningTransfer) {
        // E3: Evening Transfer to Another Base (Explores current city, moves to stay base in evening)
        const transferUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(city.name + ' India')}&destination=${encodeURIComponent(stayCityName + ' India')}&travelmode=driving`;
        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: stayCityName,
          title: `Travel to ${stayCityName}`,
          notes: `Wrap up sightseeing in ${city.name} and journey to ${stayCityName} where you will be staying tonight. Click Map for driving directions.`,
          where: `${city.name} to ${stayCityName}`,
          mapsUrl: transferUrl,
          icon: 'car',
          phase: 'Evening',
          suggestedTime: 'Evening Transit (~18:00 PM)',
          hour: 18,
          minute: 0
        });

        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: stayCityName,
          title: `Hotel Check-in, Dinner & Overnight Stay in ${stayCityName}`,
          notes: `Check in to your hotel in ${stayCityName}, enjoy dinner, and rest for the night.`,
          where: `${stayCityName} Hotel / Stay`,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Hotels in ' + stayCityName)}`,
          icon: 'hotel',
          phase: 'Evening',
          suggestedTime: 'Evening (~20:30 PM)',
          hour: 20,
          minute: 30
        });

      } else {
        // E4: Base Stay in Current City
        if (!hasEveningMeal) {
          daySteps.push({
            id: Date.now().toString() + '_' + (++stepCounter),
            dayId: dayId,
            cityName: city.name,
            title: `Dinner & Overnight Stay in ${city.name}`,
            notes: `Wind down with dinner and soak in the evening atmosphere of ${city.name}.`,
            where: city.name,
            mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Dinner restaurants in ' + city.name)}`,
            icon: 'utensils',
            phase: 'Evening',
            suggestedTime: 'Evening (~20:00 PM)',
            hour: 20,
            minute: 0
          });
        }
      }

      // ── PHASE 4: RETURN JOURNEY ON FINAL DAY ──
      if (isLastDay && !isAlreadyThere && !isOvernightTravel) {
        const returnOriginCityName = isExcursion ? prevBaseName : (isEveningTransfer ? stayCityName : city.name);
        daySteps.push({
          id: Date.now().toString() + '_' + (++stepCounter),
          dayId: dayId,
          cityName: returnOriginCityName,
          title: `Return Journey to ${originName}`,
          notes: `Wrap up your trip from ${returnOriginCityName} and begin your journey back to ${originName}. Safe travels and pack your memories!`,
          where: `${returnOriginCityName} to ${originName}`,
          mapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(returnOriginCityName + ' India')}&destination=${encodeURIComponent(originName + ' India')}&travelmode=driving`,
          icon: 'car',
          phase: 'Evening',
          suggestedTime: 'Evening (~21:00 PM)',
          hour: 21,
          minute: 0
        });
      }

      // Sort daySteps chronologically by hour/minute
      daySteps.sort((a, b) => ((a.hour || 0) * 60 + (a.minute || 0)) - ((b.hour || 0) * 60 + (b.minute || 0)));

      steps = steps.concat(daySteps);
    }

    return steps;
  }

  function appendCitySteps(trip, cityId) {
    if (!trip.steps) trip.steps = [];
    trip.duration = Math.max(trip.duration || 0, trip.cities.length);
    trip.steps = generateSteps(trip);
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
      <div class="flex justify-between items-center mb-3">
        <div>
          <h2 class="text-xl font-black text-slate-800 tracking-tight">${KYT.utils.escapeHTML(trip.name)}</h2>
          <p class="text-xs text-slate-500 font-medium">Customized Day-by-Day Itinerary</p>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="btn-builder-stays-modal inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors shadow-xs" title="Adjust Duration & Stays" onclick="window.openStayModal ? window.openStayModal() : (window.KYT && window.KYT.virtualTrips && window.KYT.virtualTrips.openStayModal && window.KYT.virtualTrips.openStayModal())">
            <i data-lucide="moon" class="w-3.5 h-3.5 text-indigo-500"></i>
            <span>Stays & Days</span>
          </button>
          <button type="button" onclick="KYT.virtualTrips.regenerateSteps()" class="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors shadow-xs" title="Reset itinerary to recommended order">
            <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
            <span>Reset Order</span>
          </button>
        </div>
      </div>
    `;

    // Group steps by dayId
    const days = {};
    trip.steps.forEach(step => {
      const dId = step.dayId != null ? step.dayId : 1;
      if (!days[dId]) days[dId] = [];
      days[dId].push(step);
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
      Object.keys(days).map(Number).sort((a, b) => a - b).forEach(dayId => {
        const cityName = days[dayId][0].cityName;
        const isDay0 = dayId === 0;

        const stepsHtml = days[dayId].map(beat => {
          const mapsLink = beat.mapsUrl ? `<a href="${beat.mapsUrl}" target="_blank" rel="noopener" class="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-500 hover:text-blue-700 mt-1"><i data-lucide="map-pin" class="w-2.5 h-2.5"></i> Map</a>` : '';
          const notesText = beat.notes ? `<p class="text-[11px] text-slate-500 leading-relaxed mt-1">${beat.notes}</p>` : '';

          const phaseStyles = {
            'Arrival': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'Morning': 'bg-amber-50 text-amber-700 border-amber-200',
            'Midday': 'bg-sky-50 text-sky-700 border-sky-200',
            'Afternoon': 'bg-indigo-50 text-indigo-700 border-indigo-200',
            'Evening': 'bg-purple-50 text-purple-700 border-purple-200'
          };
          const pStyle = phaseStyles[beat.phase] || 'bg-slate-100 text-slate-600 border-slate-200';
          const phaseBadge = beat.phase ? `<span class="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${pStyle}">${beat.phase}</span>` : '';
          const suggestiveText = (beat.suggestedTime && beat.suggestedTime !== beat.phase) ? `<span class="text-[10px] text-slate-400 font-medium">· ${beat.suggestedTime}</span>` : '';

          return `
            <div class="relative flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm mt-2 group hover:border-slate-200 transition-colors">
              <div class="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                <i data-lucide="${beat.icon || 'map-pin'}" class="w-4 h-4"></i>
              </div>
              <div class="flex-1 min-w-0 pr-8">
                <div class="flex items-center gap-1.5 flex-wrap mb-1">
                  ${phaseBadge}
                  ${suggestiveText}
                </div>
                <p class="text-sm font-bold text-slate-800 leading-tight">${beat.title}</p>
                ${notesText}
                ${mapsLink}
              </div>
              <button type="button" class="absolute right-2 top-2.5 p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" onclick="deleteVirtualTripStep('${beat.id}')" title="Delete step">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          `;
        }).join('');

        const dayBadge = isDay0 
          ? `<span class="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full uppercase tracking-widest">Day 0: Travel & Arrival</span>`
          : `<span class="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-widest">Day ${dayId}</span>`;

        html += `
          <div class="mb-5">
            <div class="flex items-center gap-2 mb-2">
              ${dayBadge}
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
          <div class="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <i data-lucide="calendar" class="w-4 h-4 shrink-0"></i>
            <label class="font-bold text-slate-700" for="vt-start-date">Start Date:</label>
            <input type="date" id="vt-start-date" class="ml-auto bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </div>
          <button onclick="KYT.virtualTrips.useAsMyTrip('${trip.id}')"
             class="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-200">
            <i data-lucide="map" class="w-4 h-4"></i>
            Use as my trip
          </button>
        </div>
      </div>
    `;

    DOM.itineraryListRoot.innerHTML = html;
    const btnStays = DOM.itineraryListRoot.querySelector('.btn-builder-stays-modal');
    if (btnStays) {
      btnStays.addEventListener('click', (e) => {
        e.preventDefault();
        openStayModal();
      });
    }
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
          window.location.href = 'trip_detail.html?id=' + card.dataset.id;
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

    if (DOM.originCitySelect) {
      DOM.originCitySelect.addEventListener('change', e => {
        const trip = getActiveTrip();
        if (trip) {
          trip.originCity = e.target.value;
          if (trip.steps && trip.steps.length > 0) {
            trip.steps = generateSteps(trip);
          }
          saveVTrips();
          updateOriginDesc(trip);
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
          if (!trip.steps || trip.steps.length === 0) {
            trip.steps = null;
          }
          saveVTrips();
          renderCanvas();
        }
      });
    }

    if (DOM.selectedCitiesRoot) {
      DOM.selectedCitiesRoot.addEventListener('click', e => {
        const leftBtn = e.target.closest('.btn-move-city-left');
        if (leftBtn) {
          e.stopPropagation();
          const idx = parseInt(leftBtn.dataset.index, 10);
          const trip = getActiveTrip();
          if (trip && idx > 0) {
            const temp = trip.cities[idx - 1];
            trip.cities[idx - 1] = trip.cities[idx];
            trip.cities[idx] = temp;
            trip.steps = generateSteps(trip);
            saveVTrips();
            renderCanvas();
          }
          return;
        }

        const rightBtn = e.target.closest('.btn-move-city-right');
        if (rightBtn) {
          e.stopPropagation();
          const idx = parseInt(rightBtn.dataset.index, 10);
          const trip = getActiveTrip();
          if (trip && idx < trip.cities.length - 1) {
            const temp = trip.cities[idx + 1];
            trip.cities[idx + 1] = trip.cities[idx];
            trip.cities[idx] = temp;
            trip.steps = generateSteps(trip);
            saveVTrips();
            renderCanvas();
          }
          return;
        }

        const delBtn = e.target.closest('.btn-del-city');
        if (delBtn) {
          e.stopPropagation();
          const trip = getActiveTrip();
          if (trip) {
            trip.cities = trip.cities.filter(c => c !== delBtn.dataset.id);
            if (trip.steps && trip.steps.length > 0) {
              trip.steps = generateSteps(trip);
            } else {
              trip.steps = null;
            }
            saveVTrips();
            renderCanvas();
          }
          return;
        }

        const cityChip = e.target.closest('.vt-selected-city-chip');
        if (cityChip) {
          openCityDetail(cityChip.dataset.cityId);
        }
      });
    }

    // ── Stay Modal Controls ──────────────────────────────────────────────────────
    const stayModalEl = document.getElementById('vt-stay-modal');
    if (stayModalEl) {
      stayModalEl.addEventListener('click', (e) => {
        if (e.target === stayModalEl) closeStayModal();
      });
    }

    const btnCloseStay = document.getElementById('btn-close-stay-modal');
    if (btnCloseStay) btnCloseStay.addEventListener('click', closeStayModal);

    const btnCancelStay = document.getElementById('btn-cancel-stay-modal');
    if (btnCancelStay) btnCancelStay.addEventListener('click', closeStayModal);

    const btnMinusModal = document.getElementById('btn-modal-duration-minus');
    if (btnMinusModal) {
      btnMinusModal.addEventListener('click', () => {
        const trip = getActiveTrip();
        if (trip && (trip.duration || trip.cities.length) > 1) {
          trip.duration = (trip.duration || trip.cities.length) - 1;
          if (trip.nightStays) delete trip.nightStays[trip.duration + 1];
          saveVTrips();
          renderStayModal();
        }
      });
    }

    const btnPlusModal = document.getElementById('btn-modal-duration-plus');
    if (btnPlusModal) {
      btnPlusModal.addEventListener('click', () => {
        const trip = getActiveTrip();
        if (trip) {
          trip.duration = Math.min(30, (trip.duration || trip.cities.length || 1) + 1);
          saveVTrips();
          renderStayModal();
        }
      });
    }

    const modalStaysList = document.getElementById('vt-modal-night-stays-list');
    if (modalStaysList) {
      modalStaysList.addEventListener('change', e => {
        const select = e.target.closest('.vt-modal-night-stay-select');
        if (select) {
          const dayId = parseInt(select.dataset.dayId, 10);
          const trip = getActiveTrip();
          if (trip) {
            if (!trip.nightStays) trip.nightStays = {};
            trip.nightStays[dayId] = select.value;
            saveVTrips();
            renderStayModal();
          }
        }
      });
    }

    const btnConfirmStay = document.getElementById('btn-modal-confirm-build');
    if (btnConfirmStay) {
      btnConfirmStay.addEventListener('click', () => {
        const trip = getActiveTrip();
        if (trip) {
          closeStayModal();
          trip.steps = generateSteps(trip);
          saveVTrips();
          openBuilder();
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
            if (trip.steps && trip.steps.length > 0) {
              appendCitySteps(trip, addBtn.dataset.id);
            } else {
              trip.steps = null;
            }
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
    
    // Bind back button for city detail overlay
    const btnBackCD = document.getElementById('btn-back-city-detail');
    if (btnBackCD) {
      btnBackCD.addEventListener('click', () => window.history.back());
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
        if (trip) {
          if (trip.steps && trip.steps.length > 0) {
            openBuilder();
          } else {
            openStayModal();
          }
        }
      });
    }

    const btnShareTrip = document.getElementById('btn-share-trip');
    if (btnShareTrip) {
      btnShareTrip.addEventListener('click', () => {
        const trip = getActiveTrip();
        if (!trip || !trip.cities.length) return alert('Add some cities to share this trip!');
        
        const url = new URL(window.location.href);
        url.pathname = url.pathname.replace(/\/[^\/]*$/, '/trip_detail.html');
        url.search = '';
        url.searchParams.set('trip', trip.name || 'Shared Trip');
        url.searchParams.set('cities', trip.cities.join(','));
        url.searchParams.set('taste', encodeTaste(trip.taste));
        if (trip.curatedId) {
          url.searchParams.set('curated', trip.curatedId);
        }
        
        const shareData = {
          title: `Check out my ${trip.name} on KYT`,
          text: `I planned a trip on KYT! Check out my itinerary for ${trip.cities.length} cities.`,
          url: url.toString()
        };

        if (navigator.share) {
          navigator.share(shareData).catch(err => console.log('Error sharing:', err));
        } else {
          navigator.clipboard.writeText(url.toString())
            .then(() => alert('Trip link copied to clipboard!'))
            .catch(err => console.error('Error copying link:', err));
        }
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

    // Routing Logic for Deep Links & History
    window.addEventListener('popstate', (e) => {
      const p = new URLSearchParams(window.location.search);
      const cId = p.get('city');
      if (cId) {
        openCityDetail(cId, false);
      } else {
        closeCityDetail(false);
      }
    });

    
    const tasteCodeMap = {
      intent: { mixed: 'm', spiritual: 's', nature: 'n', cultural: 'c', adventure: 'a', culinary: 'u' },
      diet: { any: 'a', veg: 'v', jain: 'j', satvik: 'k' },
      pace: { short: 'h', standard: 's', deep: 'd', relaxed: 'r', fast: 'f' }
    };
    const reverseTasteCodeMap = {
      intent: { m: 'mixed', s: 'spiritual', n: 'nature', c: 'cultural', a: 'adventure', u: 'culinary' },
      diet: { a: 'any', v: 'veg', j: 'jain', k: 'satvik' },
      pace: { h: 'short', s: 'standard', d: 'deep', r: 'relaxed', f: 'fast' }
    };

    function encodeTaste(taste) {
      return (tasteCodeMap.intent[taste.intent] || 'm') +
             (tasteCodeMap.diet[taste.diet] || 'a') +
             (tasteCodeMap.pace[taste.pace] || 's');
    }
    
    function decodeTaste(code) {
      if (!code || code.length !== 3) return ['mixed', 'any', 'standard'];
      return [
        reverseTasteCodeMap.intent[code[0]] || 'mixed',
        reverseTasteCodeMap.diet[code[1]] || 'any',
        reverseTasteCodeMap.pace[code[2]] || 'standard'
      ];
    }

    const params = new URLSearchParams(window.location.search);
    const sharedCity = params.get('city');
    const sharedCities = params.get('cities');
    const sharedTripName = params.get('trip');
    const sharedTaste = params.get('taste');
    const localTripId = params.get('id');
    
    // Always launch hub first in virtual_trip.html
    if (window.location.pathname.includes('virtual_trip.html')) {
      openHub();
      
      if (localTripId && vtrips.some(t => t.id === localTripId)) {
        // Clean URL
        const url = new URL(window.location.href);
        url.searchParams.delete('id');
        window.history.replaceState({}, '', url.toString());
        
        // Slight delay to ensure DOM is ready
        setTimeout(() => {
            currentTripId = localTripId;
            const targetTrip = vtrips.find(t => t.id === localTripId);
            if (targetTrip && targetTrip.steps && targetTrip.steps.length > 0) {
              openBuilder();
            } else {
              openCanvas(localTripId);
            }
        }, 50);
      } else if (sharedCities) {
        try {
          if (!confirm(`Do you want to import the shared trip: "${sharedTripName || 'Shared Trip'}"?`)) {
            const url = new URL(window.location.href);
            url.searchParams.delete('trip');
            url.searchParams.delete('cities');
            url.searchParams.delete('taste');
            url.searchParams.delete('curated');
            window.history.replaceState({}, '', url.toString());
            return;
          }
          const sharedCurated = params.get('curated');
          const tasteParts = sharedTaste && sharedTaste.length === 3 ? decodeTaste(sharedTaste) : (sharedTaste ? sharedTaste.split('|') : ['mixed', 'any', 'standard']);
          const fullCities = sharedCities.split(',').map(code => {
            const c = window.KYT_CITIES ? window.KYT_CITIES.find(x => x.code === code || x.id === code) : null;
            return c ? c.id : code;
          });

          // Check if it's a curated trip and populate curated steps
          let curatedSteps = null;
          let curatedObj = null;
          if (sharedCurated && window.KYT_CURATED_TRIPS) {
            curatedObj = window.KYT_CURATED_TRIPS.find(t => t.id === sharedCurated);
            if (curatedObj && curatedObj.days) {
              curatedSteps = [];
              let stepCounter = 0;
              curatedObj.days.forEach(d => {
                (d.steps || []).forEach(s => {
                  curatedSteps.push({
                    id: Date.now().toString() + '_' + (++stepCounter),
                    dayId: d.day,
                    cityName: d.cityName || 'Destination',
                    title: s.title,
                    notes: s.notes || '',
                    where: s.where || d.cityName || 'Destination',
                    mapsUrl: s.mapsUrl || '',
                    hour: s.hour != null ? s.hour : 9,
                    minute: s.minute || 0,
                    icon: s.icon || 'map-pin'
                  });
                });
              });
            }
          }

          const newTrip = {
            id: Date.now().toString(),
            name: sharedTripName || (curatedObj ? curatedObj.title : 'Shared Trip'),
            cities: fullCities,
            taste: {
              intent: tasteParts[0] || (curatedObj?.taste?.intent || 'mixed'),
              diet: tasteParts[1] || (curatedObj?.taste?.diet || 'any'),
              pace: tasteParts[2] || (curatedObj?.taste?.pace || 'standard')
            },
            steps: curatedSteps,
            curatedId: sharedCurated || ''
          };

          // If extra cities were added on top of curated cities, append steps for them
          if (curatedSteps && curatedObj && Array.isArray(curatedObj.cities)) {
            const extraCities = fullCities.filter(c => !curatedObj.cities.includes(c));
            extraCities.forEach(extraC => {
              appendCitySteps(newTrip, extraC);
            });
          }

          vtrips.push(newTrip);
          saveVTrips();
          
          // Clean URL so refresh doesn't duplicate
          const url = new URL(window.location.href);
          url.searchParams.delete('trip');
          url.searchParams.delete('cities');
          url.searchParams.delete('taste');
          url.searchParams.delete('curated');
          window.history.replaceState({}, '', url.toString());
          
          currentTripId = newTrip.id;
          if (newTrip.steps && newTrip.steps.length > 0) {
            openBuilder();
          } else {
            openCanvas(newTrip.id);
          }
        } catch (e) {
          console.error("Failed to parse shared trip", e);
        }
      }
    }
    
    if (sharedCity) {
      setTimeout(() => {
        openCityDetail(sharedCity, false);
      }, 100);
    }
  }

  function openCityDetail(cityId, pushHistory = true) {
    const city = window.KYT_CITIES.find(c => c.id === cityId);
    if (!city) return;

    if (pushHistory) {
      const url = new URL(window.location.href);
      url.searchParams.set('city', cityId);
      window.history.pushState({ cityId }, '', url.toString());
    }

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

    const allVideos = window.KYT_CITY_VIDEOS ? (window.KYT_CITY_VIDEOS[city.id] || []) : [];
    
    // Use all available videos (ignoring strict language constraints) to increase relevance
    // and fallback to Hindi/local language videos if they are more appropriate.
    let videos = allVideos;

    if (videos.length > 0) {
      heroPlaceholder.classList.add('hidden');
      
      let currentVidIdx = 0;
      
      const iframe = document.createElement('iframe');
      iframe.id = 'cd-hero-yt';
      iframe.className = 'absolute inset-0 w-full h-full object-cover z-0';
      iframe.src = `https://www.youtube-nocookie.com/embed/${videos[currentVidIdx].id}?rel=0&modestbranding=1`;
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
          iframe.src = `https://www.youtube-nocookie.com/embed/${videos[currentVidIdx].id}?rel=0&modestbranding=1`;
        };
        document.getElementById('btn-yt-next').onclick = (e) => {
          e.stopPropagation();
          currentVidIdx = (currentVidIdx + 1) % videos.length;
          iframe.src = `https://www.youtube-nocookie.com/embed/${videos[currentVidIdx].id}?rel=0&modestbranding=1`;
        };
      }
    } else {
      heroPlaceholder.classList.remove('hidden');
    }

    // Populate Attractions
    const attrList = document.getElementById('cd-attractions-list');
    if (city.beats && city.beats.length > 0) {
      attrList.innerHTML = city.beats.map(b => {
        const intentMap = {
          spiritual: { icon: "om", color: "purple" },
          cultural: { icon: "compass", color: "blue" },
          heritage: { icon: "landmark", color: "amber" },
          nature: { icon: "tree-pine", color: "emerald" },
          leisure: { icon: "coffee", color: "orange" },
          adventure: { icon: "mountain", color: "red" }
        };
        const intents = (b.intent || []).map(intent => {
          const map = intentMap[intent] || { icon: "star", color: "slate" };
          return `<span class="inline-flex items-center gap-1 bg-${map.color}-50 border border-${map.color}-200 text-${map.color}-700 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                    <i data-lucide="${map.icon}" class="w-3 h-3"></i> ${intent.charAt(0).toUpperCase() + intent.slice(1)}
                  </span>`;
        }).join('');

        const paceLabels = { short: '⚡ Short (< 1 hour)', standard: '🚶 Standard (1-2 hours)', deep: '🔍 Deep Dive (2+ hours)' };
        const paces = (b.pace || ['standard']).map(pace => {
          return `<span class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold px-2.5 py-1 rounded-lg">
                    ${paceLabels[pace] || pace}
                  </span>`;
        }).join('');

        const mobilityLabels = { easy: '♿ Easy Access', walk: '🚶 Walking Required', trek: '🧗 Trek/Strenuous' };
        const mobility = mobilityLabels[b.mobility] || (b.mobility || 'Easy');
        const formattedHour = b.hour ? (b.hour.toString().padStart(2, '0') + ':00') : 'N/A';

        return `
        <details class="group bg-white rounded-xl border border-slate-100 shadow-sm mb-3">
          <summary class="flex items-center justify-between p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <div class="flex items-center gap-3">
              <div class="bg-blue-50 p-2 rounded-lg text-blue-600 shrink-0">
                <i data-lucide="${b.icon || 'map-pin'}" class="w-5 h-5"></i>
              </div>
              <h4 class="font-bold text-slate-800 text-base m-0">${b.title}</h4>
            </div>
            <div class="text-slate-400 group-open:rotate-180 transition-transform">
              <i data-lucide="chevron-down" class="w-5 h-5"></i>
            </div>
          </summary>
          
          <div class="p-4 pt-0 border-t border-slate-50">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Location</p>
                <div class="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <i data-lucide="map-pin" class="w-4 h-4 text-slate-400 shrink-0"></i> <span class="truncate">${b.where || 'Various'}</span>
                </div>
              </div>
              <div>
                <p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Suggested Time</p>
                <div class="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <i data-lucide="clock" class="w-4 h-4 text-slate-400 shrink-0"></i> ${formattedHour}
                </div>
              </div>
            </div>

            <div class="mt-4 space-y-3">
              ${intents ? `<div>
                <p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Travel Style</p>
                <div class="flex flex-wrap gap-1.5">${intents}</div>
              </div>` : ''}
              
              ${paces ? `<div>
                <p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">Travel Pace</p>
                <div class="flex flex-wrap gap-1.5">${paces}</div>
              </div>` : ''}
            </div>

            <div class="mt-4">
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Accessibility</p>
              <p class="text-sm font-medium text-slate-700 flex items-center gap-1.5"><i data-lucide="footprints" class="w-4 h-4 text-slate-400 shrink-0"></i> ${mobility}</p>
            </div>

            ${b.notes ? `
            <div class="mt-4 pt-3 border-t border-slate-50">
              <p class="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1.5">About this attraction</p>
              <p class="text-sm text-slate-600 leading-relaxed">${b.notes}</p>
            </div>` : ''}
          </div>
        </details>
        `;
      }).join('');
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
        const tripToUse = ensureActiveTrip();
        if (!tripToUse.cities.includes(city.id)) {
          tripToUse.cities.push(city.id);
          if (tripToUse.steps && tripToUse.steps.length > 0) {
            appendCitySteps(tripToUse, city.id);
          } else {
            tripToUse.steps = null;
          }
          saveVTrips();
          if (DOM.citySearchInput) DOM.citySearchInput.value = '';
          renderCanvas();
          // Update button state immediately without closing the panel
          mainAdd.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Added`;
          mainAdd.classList.replace('bg-blue-600', 'bg-emerald-600');
          mainAdd.disabled = true;
          lucide.createIcons();
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
        const CITY_ALIASES = { bangalore: 'bengaluru', mangalore: 'udupi', mangaluru: 'udupi', hubballi: 'hubli' };
        nearbyList.innerHTML = nearby.map(([nId, dist]) => {
          const targetId = CITY_ALIASES[nId] || nId;
          const nCity = window.KYT_CITIES.find(c => c.id === targetId);
          if (!nCity) return '';
          const isAdded = trip && trip.cities.includes(targetId);
          const btnHtml = isAdded 
            ? `<button class="w-full mt-2 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold" disabled>Added</button>`
            : `<button class="w-full mt-2 py-1.5 bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white rounded-lg text-[10px] font-bold transition-colors" onclick="KYT.virtualTrips.addNearby('${targetId}')">Add +</button>`;
          
          return `
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-3 cursor-pointer hover:border-blue-300 transition-colors flex flex-col h-full" onclick="KYT.virtualTrips.openCityDetail('${targetId}')">
              <h4 class="font-black text-slate-800 text-xs truncate">${nCity.name}</h4>
              <p class="text-[10px] text-slate-500 font-medium mb-1.5">${dist} km away</p>
              <p class="text-[10px] text-slate-500 leading-tight line-clamp-3 mb-2 flex-1">${nCity.notes || 'Explore this nearby destination.'}</p>
              <div class="mt-auto">
                ${btnHtml}
              </div>
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

  function closeCityDetail(pushHistory = true) {
    const overlay = document.getElementById('city-detail-overlay');
    const panel = document.getElementById('city-detail-panel');
    if (!overlay || !panel) return;

    if (pushHistory) {
      const url = new URL(window.location.href);
      if (url.searchParams.has('city')) {
        url.searchParams.delete('city');
        window.history.pushState({ cityId: null }, '', url.toString());
      }
    }

    overlay.classList.add('opacity-0');
    panel.classList.add('translate-y-full', 'md:translate-x-full');
    
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 300); // match transition duration
  }
  
  function addNearby(cityId) {
    const trip = ensureActiveTrip();
    if (!trip.cities.includes(cityId)) {
      trip.cities.push(cityId);
      if (trip.steps && trip.steps.length > 0) {
        appendCitySteps(trip, cityId);
      } else {
        trip.steps = null;
      }
      saveVTrips();
      renderCanvas();
      
      // Refresh the currently open city detail to update the nearby buttons
      const currentCityId = document.getElementById('cd-title').dataset.cityId;
      if (currentCityId) {
        openCityDetail(currentCityId, false);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function useAsMyTrip(tripId) {
    const trip = vtrips.find(t => t.id === tripId);
    if (!trip || !trip.steps || trip.steps.length === 0) return;
    
    const currentStore = KYT.store.get();
    if (currentStore && currentStore.stepsData && currentStore.stepsData.length > 0) {
      if (!confirm(`This will overwrite your current active trip ("${currentStore.tripName}"). Do you want to proceed?`)) {
        return;
      }
    }
    const dateInput = document.getElementById('vt-start-date');
    let startDate = new Date(); // default today
    if (dateInput && dateInput.value) {
      startDate = new Date(dateInput.value);
    }
    
    // Set time to start of day for base calculation
    startDate.setHours(0, 0, 0, 0);

    // Group steps by dayId to eliminate time collisions and ensure sequential ordering
    const stepsByDay = {};
    trip.steps.forEach(s => {
      const dId = s.dayId != null ? s.dayId : 1;
      if (!stepsByDay[dId]) stepsByDay[dId] = [];
      stepsByDay[dId].push(s);
    });

    const sortedDayIds = Object.keys(stepsByDay).map(Number).sort((a, b) => a - b);
    const minDayId = sortedDayIds.length > 0 ? sortedDayIds[0] : 0;

    const storeSteps = [];
    let globalIdx = 0;

    sortedDayIds.forEach(dayId => {
      const daySteps = stepsByDay[dayId];
      const targetDay = new Date(startDate);
      const dayOffset = dayId - minDayId;
      targetDay.setDate(targetDay.getDate() + dayOffset);

      let prevTimeForDay = 0;

      daySteps.forEach((s, stepInDayIdx) => {
        const stepDate = new Date(targetDay);
        
        if (dayId === 0) {
          // Day 0: Travel & Arrival in late afternoon
          stepDate.setHours(16, 0, 0, 0);
        } else {
          // Indicative hour & minute
          let h = s.hour != null ? s.hour : 9;
          let m = s.minute != null ? s.minute : 0;
          stepDate.setHours(h, m, 0, 0);

          // Guarantee strictly increasing times to prevent any collisions or unstable sorting
          if (stepInDayIdx > 0 && stepDate.getTime() <= prevTimeForDay) {
            const nextTime = new Date(prevTimeForDay + 45 * 60 * 1000); // 45 minute buffer
            stepDate.setTime(nextTime.getTime());
          }
        }

        prevTimeForDay = stepDate.getTime();

        storeSteps.push({
          id: Date.now() + (++globalIdx),
          title: s.title,
          icon: s.icon || 'map-pin',
          where: s.where || s.cityName,
          mapUrl: s.mapsUrl || '',
          notes: s.notes || '',
          targetTime: stepDate,
          status: 'todo',
          attachments: []
        });
      });
    });

    KYT.store.setTripName(trip.name);
    KYT.store.setStepsData(storeSteps);
    KYT.store.setCurrentIndex(0);
    await KYT.store.saveData();

    // Redirect to view_trip.html (Now cards)
    window.location.href = 'view_trip.html';
  }

  const api = {
    open: openView,
    close: closeView,
    editCanvas,
    expandAttractionDetail,
    openCityDetail,
    addNearby,
    useAsMyTrip,
    regenerateSteps: window.regenerateVirtualTripSteps,
    generateSteps,
    openStayModal,
    closeStayModal
  };

  window.openStayModal = openStayModal;
  window.closeStayModal = closeStayModal;
  if (window.KYT) window.KYT.virtualTrips = api;

  return api;
})();




