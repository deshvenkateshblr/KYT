const fs = require('fs');
let content = fs.readFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', 'utf8');

// I will just redefine generateSteps completely.
content = content.replace(/function generateSteps[\s\S]*?return steps;\s*\}/, `function generateSteps(trip) {
    let steps = [];
    let dayCounter = 1;

    trip.cities.forEach(cityId => {
      const city = window.KYT_CITIES.find(c => c.id === cityId);
      if (!city) return;
      
      const active = !(city.skipOnPace && city.skipOnPace.includes(trip.taste.pace));
      if (!active) return;
      
      let daySteps = [];
      if (city.beats) {
        const matched = city.beats.filter(b => beatMatches(b, trip.taste)).sort((a,b)=>(a.hour||0)-(b.hour||0));
        matched.forEach(beat => {
            daySteps.push({
                id: Date.now().toString() + Math.floor(Math.random()*1000),
                dayId: dayCounter,
                cityName: city.name,
                title: beat.title,
                notes: beat.notes || '',
                where: beat.where || city.name,
                mapsUrl: beat.mapsUrl || '',
                hour: beat.hour || 9,
                icon: beat.icon || 'map-pin'
            });
        });
      }
      
      // If we found steps for this city, add them and increment day
      if (daySteps.length > 0) {
          steps = steps.concat(daySteps);
          dayCounter++;
      }
    });
    return steps;
  }`);

fs.writeFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', content);
console.log("Fixed generateSteps");

