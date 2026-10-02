const fs = require('fs');
let cfg = fs.readFileSync('js/config.js', 'utf8');

const endTripLogic = `
  function endTrip() {
    if (confirm('Are you sure you want to end and delete the current trip?')) {
      KYT.store.setTripName('New Trip');
      KYT.store.setTripNotes('');
      KYT.store.setCoverImage(null);
      KYT.store.setStepsData([]);
      KYT.store.setCurrentIndex(0);
      KYT.store.saveData();
      localStorage.removeItem('kyt_stepsData');
      window.location.href = 'index.html';
    }
  }

  // Wire static buttons`;

cfg = cfg.replace(/\/\/ Wire static buttons/, endTripLogic);

const wireEndTrip = `document.getElementById('btn-save-config').addEventListener('click',  closeConfigView);
  const btnEndTrip = document.getElementById('btn-end-trip');
  if (btnEndTrip) btnEndTrip.addEventListener('click', endTrip);`;

cfg = cfg.replace(/document\.getElementById\('btn-save-config'\)\.addEventListener\('click',\s*closeConfigView\);/, wireEndTrip);

fs.writeFileSync('js/config.js', cfg);
console.log('Added endTrip logic to config.js');

