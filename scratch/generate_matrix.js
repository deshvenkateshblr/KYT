const fs = require('fs');

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return Math.round(d);
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

const content = fs.readFileSync('C:/Venkatesh/KYT/data/cities.js', 'utf8');
const jsonStr = content.replace('window.KYT_CITIES = ', '').replace(/;\s*$/, '').trim();
const cities = eval(jsonStr);

const matrix = {};

for (let i = 0; i < cities.length; i++) {
  const cityA = cities[i];
  if (!cityA.lat || !cityA.lng) continue;
  
  matrix[cityA.id] = {};
  
  for (let j = 0; j < cities.length; j++) {
    if (i === j) continue;
    const cityB = cities[j];
    if (!cityB.lat || !cityB.lng) continue;
    
    const dist = getDistanceFromLatLonInKm(cityA.lat, cityA.lng, cityB.lat, cityB.lng);
    
    // Only store if distance is less than 600km to keep file small and relevant
    if (dist <= 600) {
      matrix[cityA.id][cityB.id] = dist;
    }
  }
}

const outputContent = `window.KYT_DISTANCE_MATRIX = ${JSON.stringify(matrix, null, 2)};\n`;
fs.writeFileSync('C:/Venkatesh/KYT/data/distance_matrix.js', outputContent, 'utf8');
console.log('distance_matrix.js generated successfully!');

