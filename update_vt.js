const fs = require('fs');
let vtJs = fs.readFileSync('js/virtual-trips.js', 'utf8');

const initReplacement = `
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

    if (window.location.pathname.includes('virtual_trip.html')) {
        openHub();
    }
`;

vtJs = vtJs.replace(/function init\(\) \{[\s\S]*?if \(e\.key === 'Enter'\) createNewTrip\(\);\s*\}\);\s*\}/, initReplacement);
fs.writeFileSync('js/virtual-trips.js', vtJs);
console.log('Updated virtual-trips.js');

