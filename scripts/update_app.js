const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

const initLogic = `
  function boot() {
    KYT.clock.start();
    KYT.carousel.renderCard();
    if (window.lucide) lucide.createIcons();

    // Multi-page routing initialization
    const path = window.location.pathname;
    if (path.includes('configure_trip.html')) {
        const inputTripName = document.getElementById('input-trip-name');
        const inputTripNotes = document.getElementById('input-trip-notes');
        if (inputTripName) inputTripName.value = KYT.store.getTripName() || '';
        if (inputTripNotes) inputTripNotes.value = KYT.store.getTripNotes() || '';
        if (KYT.config && KYT.config.renderConfigSteps) {
            KYT.config.renderConfigSteps();
        }
    }
  }
`;

appJs = appJs.replace(/function boot\(\) \{[\s\S]*?if \(window\.lucide\) lucide\.createIcons\(\);\s*\}/, initLogic);
fs.writeFileSync('js/app.js', appJs);
console.log('Updated app.js');

