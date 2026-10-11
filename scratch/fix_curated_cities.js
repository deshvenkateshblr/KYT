const fs = require('fs');

function fixCities(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const marker = 'window.KYT_CURATED_TRIPS =';
  const at = content.indexOf(marker);
  if (at < 0) return;
  const open = content.indexOf('[', at);
  const jsonStr = content.slice(open, content.lastIndexOf('];') + 1);
  const data = JSON.parse(jsonStr);

  data.forEach(trip => {
    trip.originCity = trip.originCity || 'bengaluru';
    trip.originName = trip.originName || 'blr';
    if (!trip.cities || trip.cities.length === 0) {
      trip.cities = ['tirupati'];
    }
    (trip.days || []).forEach(d => {
      d.cityId = d.cityId || 'tirupati';
      d.cityName = d.cityName || 'Tirupati';
      (d.steps || []).forEach(s => {
        if (!s.where) s.where = d.cityName;
      });
    });
  });

  const updated = content.slice(0, open) + JSON.stringify(data, null, 2) + ';\n';
  fs.writeFileSync(filePath, updated);
  console.log('Fixed cities in:', filePath);
}

fixCities('C:/Venkatesh/KYT/admin/curated_trips.js');
fixCities('C:/Venkatesh/KYT/data/curated_trips.js');

