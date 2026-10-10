const fs = require('fs');
let content = fs.readFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', 'utf8');

const matchStr = `const dateInput = document.getElementById('vt-start-date');`;
const replacementStr = `const currentStore = KYT.store.get();
    if (currentStore && currentStore.stepsData && currentStore.stepsData.length > 0) {
      if (!confirm(\`This will overwrite your current active trip ("\${currentStore.tripName}"). Do you want to proceed?\`)) {
        return;
      }
    }
    const dateInput = document.getElementById('vt-start-date');`;

content = content.replace(matchStr, replacementStr);
fs.writeFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', content);
console.log("Added confirm to useAsMyTrip");

