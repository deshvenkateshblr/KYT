/**
 * app.js — KYT bootstrap
 * Runs after all module scripts have been loaded by index.html.
 * Load order in index.html must be:
 *   store.js → clock.js → carousel.js → config.js → step-form.js → file-viewer.js → share.js → app.js
 */

window.KYT = window.KYT || {};

(async function () {
  // Load persisted state (now Async via IndexedDB)
  await KYT.store.loadData();

  // Boot clock and initial card render
  
  function boot() {
    KYT.clock.start();
    KYT.carousel.renderCard();
    if (window.lucide) lucide.createIcons();

    // Multi-page routing initialization
    const path = window.location.pathname;
    if (path.includes('configure_trip.html')) {
        const inputTripName = document.getElementById('input-trip-name');
        const inputTripNotes = document.getElementById('input-trip-notes');
        if (inputTripName) inputTripName.value = KYT.store.get().tripName || '';
        if (inputTripNotes) inputTripNotes.value = KYT.store.get().tripNotes || '';
        if (KYT.config && KYT.config.renderConfigSteps) {
            KYT.config.renderConfigSteps();
        }
    }
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

