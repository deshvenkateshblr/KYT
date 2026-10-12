// index.js
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('options-container');
  const loading = document.getElementById('loading');

  // Check if returning user (has an existing trip in IndexedDB)
  const isReturningUser = await checkExistingTrip();

  loading.style.display = 'none';
  container.classList.remove('hidden');

  let html = '';

  if (isReturningUser) {
    html = `
      <a href="view_trip.html" class="btn btn-primary text-lg flex gap-2"><i data-lucide="map"></i> View Current Trip</a>
      <a href="configure_trip.html" class="btn btn-secondary flex gap-2"><i data-lucide="settings"></i> Edit Itinerary</a>
      <a href="curated_trips.html" class="btn btn-secondary flex gap-2"><i data-lucide="sparkles"></i> AI Curated Trips</a>
      <a href="virtual_trip.html" class="btn btn-secondary flex gap-2"><i data-lucide="compass"></i> My Virtual Trips</a>
      <a href="visited.html" class="btn btn-secondary flex gap-2 mt-4 text-blue-600 bg-blue-50 border-blue-200"><i data-lucide="book-open"></i> My Digital Passport</a>
    `;
  } else {
    html = `
      <h2 class="text-xl font-bold mb-1 text-slate-800">Welcome to KYT!</h2>
      <p class="text-sm text-slate-400 mb-5 leading-relaxed">Plan, track &amp; remember your real trips — or explore destinations virtually.</p>
      <a href="virtual_trip.html" class="btn btn-primary text-lg mb-2 flex gap-2"><i data-lucide="compass"></i> Start a New Virtual Trip</a>
      <a href="curated_trips.html" class="btn btn-secondary flex gap-2"><i data-lucide="sparkles"></i> AI Curated Trips</a>
      <a href="configure_trip.html" class="btn btn-secondary flex gap-2"><i data-lucide="pencil"></i> Build Trip Manually</a>
      <a href="visited.html" class="btn btn-secondary flex gap-2 mt-4 text-blue-600 bg-blue-50 border-blue-200"><i data-lucide="book-open"></i> My Digital Passport</a>
    `;
  }

  container.innerHTML = html;
  lucide.createIcons();
});

function checkExistingTrip() {
  return new Promise((resolve) => {
    let isUpgrade = false;
    // Try to open IndexedDB
    const request = indexedDB.open('kyt_db', 1);

    request.onerror = () => {
      console.error("Could not open IndexedDB");
      resolve(false); // Default to new user on error
    };

    request.onupgradeneeded = (e) => {
      isUpgrade = true;
      const db = e.target.result;
      // Create the kyt_store table so subsequent trip saves succeed
      if (!db.objectStoreNames.contains('kyt_store')) {
        db.createObjectStore('kyt_store');
      }
    };

    request.onsuccess = (e) => {
      const db = e.target.result;
      
      // If store doesn't exist (e.g. database previously created without store),
      // self-heal by bumping version to create kyt_store
      if (!db.objectStoreNames.contains('kyt_store')) {
        const nextVer = (db.version || 1) + 1;
        db.close();
        const fixReq = indexedDB.open('kyt_db', nextVer);
        fixReq.onupgradeneeded = (ev) => {
          const fixDb = ev.target.result;
          if (!fixDb.objectStoreNames.contains('kyt_store')) {
            fixDb.createObjectStore('kyt_store');
          }
        };
        fixReq.onsuccess = () => resolve(false);
        fixReq.onerror = () => resolve(false);
        return;
      }

      if (isUpgrade) {
        // Brand new database with empty store -> new user
        resolve(false);
        return;
      }

      const tx = db.transaction('kyt_store', 'readonly');
      const store = tx.objectStore('kyt_store');
      
      // store.js saves the trip under 'kyt_stepsData' (a JSON string), so look there first.
      const stepsReq = store.get('kyt_stepsData');
      stepsReq.onsuccess = (ev) => {
        let steps = ev.target.result;
        try { if (typeof steps === 'string') steps = JSON.parse(steps); } catch (e) { steps = null; }
        if (Array.isArray(steps) && steps.length > 0) { resolve(true); return; }
        legacyCheck();
      };
      stepsReq.onerror = () => legacyCheck();

      function legacyCheck() {
        const getReq = store.get('kyt_state');
        getReq.onsuccess = (event) => {
          const state = event.target.result;
          // If state exists and has steps, consider them a returning user
          if (state && state.stepsData && state.stepsData.length > 0) {
            resolve(true);
          } else {
            // Alternatively check localStorage as fallback (since migration logic exists)
            try {
              const localSteps = localStorage.getItem('kyt_stepsData');
              if (localSteps && JSON.parse(localSteps).length > 0) {
                resolve(true);
                return;
              }
            } catch (err) {}
            resolve(false);
          }
        };
        
        getReq.onerror = () => {
          resolve(false);
        };
      }
    };
  });
}





