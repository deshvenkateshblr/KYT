const fs = require('fs');
const https = require('https');

async function fetchStateDistrict(lat, lng) {
  return new Promise((resolve, reject) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
    https.get(url, { headers: { 'User-Agent': 'KYT-App/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.address) {
            resolve({
              state: json.address.state || '',
              district: json.address.state_district || json.address.county || json.address.city || ''
            });
          } else {
            resolve(null);
          }
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', (e) => {
      resolve(null);
    });
  });
}

async function run() {
  console.log("Reading cities.js...");
  const content = fs.readFileSync('C:/Venkatesh/KYT/data/cities.js', 'utf8');
  const jsonStr = content.replace('window.KYT_CITIES = ', '').replace(/;\s*$/, '').trim();
  
  let cities;
  try {
    cities = eval(jsonStr);
  } catch(e) {
    console.error("Failed to parse cities.js", e);
    return;
  }

  console.log(`Found ${cities.length} cities. Fetching state & district...`);
  
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    if (!city.lat || !city.lng) continue;
    if (city.state && city.district) {
      console.log(`[${i+1}/${cities.length}] ${city.name} already has state/district.`);
      continue;
    }
    
    console.log(`[${i+1}/${cities.length}] Fetching state/district for ${city.name}...`);
    const info = await fetchStateDistrict(city.lat, city.lng);
    if (info) {
      city.state = info.state;
      city.district = info.district.replace(/ district$/i, '').trim();
      console.log(`  -> ${city.state}, ${city.district}`);
    } else {
      console.log(`  -> Not found!`);
    }
    
    // Sleep for 1.1 seconds to respect Nominatim rate limits (1 req/sec)
    await new Promise(r => setTimeout(r, 1100));
  }

  // Write back
  const newContent = `window.KYT_CITIES = ${JSON.stringify(cities, null, 2)};\n`;
  fs.writeFileSync('C:/Venkatesh/KYT/data/cities.js', newContent, 'utf8');
  console.log("Done updating cities.js with state and district!");
}

run();

