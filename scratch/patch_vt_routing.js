const fs = require('fs');

let vt = fs.readFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', 'utf8');

const oldRouting = `        // Slight delay to ensure DOM is ready
        setTimeout(() => {
            openCanvas(localTripId);
        }, 50);`;

const newRouting = `        // Slight delay to ensure DOM is ready
        setTimeout(() => {
            currentTripId = localTripId;
            const targetTrip = vtrips.find(t => t.id === localTripId);
            if (targetTrip && targetTrip.steps && targetTrip.steps.length > 0) {
              openBuilder();
            } else {
              openCanvas(localTripId);
            }
        }, 50);`;

if (vt.includes(oldRouting)) {
  vt = vt.replace(oldRouting, newRouting);
  fs.writeFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', vt);
  console.log('Successfully updated virtual-trips.js id routing');
} else {
  console.log('Routing snippet not found or already updated');
}

