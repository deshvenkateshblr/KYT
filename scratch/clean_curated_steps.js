const fs = require('fs');

function updateTripsFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const marker = 'window.KYT_CURATED_TRIPS =';
  const at = content.indexOf(marker);
  if (at < 0) return;
  const open = content.indexOf('[', at);
  const jsonStr = content.slice(open, content.lastIndexOf('];') + 1);
  const data = JSON.parse(jsonStr);

  data.forEach(trip => {
    (trip.days || []).forEach(d => {
      (d.steps || []).forEach(s => {
        // Morning travel
        if (/Morning Train/i.test(s.title)) {
          s.title = "Travel to Tirupati (Options)";
          s.mapsUrl = "";
          delete s.mapsAuto;
          s.notes = "Travel options: (1) Express Train: Vande Bharat / Intercity from KSR Bengaluru or Yesvantpur (~4.5 hrs); (2) By Road/Cab: Via NH75/Kolar (~4.5 hrs); (3) Electric/Sleeper buses via APSRTC/KSRTC. Choose your preferred mode in Virtual Trips.";
        }
        // Hotel check-in
        if (/Hotel Check-in/i.test(s.title)) {
          s.title = "Hotel Check-in & Freshen Up";
          s.mapsUrl = "";
          delete s.mapsAuto;
          s.notes = "Recommended stay area: Lower Tirupati near the railway station or Alipiri for easy transit to city temples and the morning hill ascent. Placeholder: Place your hotel Google Maps link here once you make reservations.";
        }
        // Generic thali lunch
        if (/Satvik South Indian Thali/i.test(s.title)) {
          s.mapsUrl = "";
          delete s.mapsAuto;
          s.notes = "Enjoy an authentic pure-vegetarian, onion-and-garlic-free Andhra thali. Top recommendations: Priyadarshini (PS4) near RTC bus stand, or Bhimas Deluxe. [Choose your preferred spot in Virtual Trips].";
        }
        // Ascent
        if (/Ascent to Tirumala/i.test(s.title)) {
          s.mapsUrl = "";
          delete s.mapsAuto;
          s.notes = "Transit up the Alipiri Ghat road: Frequent APSRTC electric buses (every 10 mins from central station) or pre-booked local cab.";
        }
        // Descent
        if (/Descent to Tirupati/i.test(s.title)) {
          s.mapsUrl = "";
          delete s.mapsAuto;
          s.notes = "Transit back down to the lower city. The downward ghat road offers stunning panoramic views.";
        }
        // Return journey
        if (/Journey Back/i.test(s.title)) {
          s.title = "Return Journey to Bangalore (Options)";
          s.mapsUrl = "";
          delete s.mapsAuto;
          s.notes = "Return options: Evening express train back to Bangalore, or self-drive/cab via NH75 (~4.5-5 hrs). Carrying divine blessings and sweet prasadam.";
        }
      });
    });
  });

  const updated = content.slice(0, open) + JSON.stringify(data, null, 2) + ';\n';
  fs.writeFileSync(filePath, updated);
  console.log('Cleaned up trip in:', filePath);
}

updateTripsFile('C:/Venkatesh/KYT/admin/curated_trips.js');
updateTripsFile('C:/Venkatesh/KYT/data/curated_trips.js');

