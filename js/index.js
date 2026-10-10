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
      <a href="virtual_trip.html" class="btn btn-secondary flex gap-2"><i data-lucide="compass"></i> My Virtual Trips</a>
      <a href="visited.html" class="btn btn-secondary flex gap-2 mt-4 text-blue-600 bg-blue-50 border-blue-200"><i data-lucide="book-open"></i> My Digital Passport</a>
    `;
  } else {
    html = `
      <h2 class="text-xl font-bold mb-1 text-slate-800">Welcome to KYT!</h2>
      <p class="text-sm text-slate-400 mb-5 leading-relaxed">Plan, track &amp; remember your real trips — or explore destinations virtually.</p>
      <a href="virtual_trip.html" class="btn btn-primary text-lg mb-2 flex gap-2"><i data-lucide="compass"></i> Start a New Virtual Trip</a>
      <a href="configure_trip.html" class="btn btn-secondary flex gap-2"><i data-lucide="pencil"></i> Build Trip Manually</a>
      <a href="visited.html" class="btn btn-secondary flex gap-2 mt-4 text-blue-600 bg-blue-50 border-blue-200"><i data-lucide="book-open"></i> My Digital Passport</a>
    `;
  }

  container.innerHTML = html;
  lucide.createIcons();
});

function checkExistingTrip() {
  return new Promise((resolve) => {
    // Try to open IndexedDB
    const request = indexedDB.open('kyt_db', 1);

    request.onerror = () => {
      console.error("Could not open IndexedDB");
      resolve(false); // Default to new user on error
    };

    request.onsuccess = (e) => {
      const db = e.target.result;
      
      // If store doesn't exist, it's a new user
      if (!db.objectStoreNames.contains('kyt_store')) {
        resolve(false);
        return;
      }

      const tx = db.transaction('kyt_store', 'readonly');
      const store = tx.objectStore('kyt_store');
      
      const getReq = store.get('kyt_state');
      getReq.onsuccess = (event) => {
        const state = event.target.result;
        // If state exists and has steps, consider them a returning user
        if (state && state.stepsData && state.stepsData.length > 0) {
          resolve(true);
        } else {
          // Alternatively check localStorage as fallback (since migration logic exists)
          const localSteps = localStorage.getItem('kyt_stepsData');
          if (localSteps && JSON.parse(localSteps).length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      };
      
      getReq.onerror = () => {
        resolve(false);
      };
    };
    
    request.onupgradeneeded = (e) => {
      // If upgrade needed, it means DB didn't exist or version was lower.
      // We don't need to create the store here since we're just checking.
      resolve(false);
    }
  });
}





