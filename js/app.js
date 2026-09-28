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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

