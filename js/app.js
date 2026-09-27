/**
 * app.js — KYT bootstrap
 * Runs after all module scripts have been loaded by index.html.
 * Load order in index.html must be:
 *   store.js → clock.js → carousel.js → config.js → step-form.js → file-viewer.js → share.js → app.js
 */

window.KYT = window.KYT || {};

(function () {
  // Load persisted state
  KYT.store.loadData();

  // Boot clock and initial card render
  document.addEventListener('DOMContentLoaded', () => {
    KYT.clock.start();
    KYT.carousel.renderCard();
    lucide.createIcons();
  });
})();

