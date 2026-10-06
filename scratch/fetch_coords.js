const fs = require('fs');
const https = require('https');

async function fetchCoords(city) {
  return new Promise((resolve, reject) => {
    // Add "India" to ensure we get the right city
    const query = encodeURIComponent(`${city}, India`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
    
    https.get(url, { headers: { 'User-Agent': 'KYT-App/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0) {
            resolve({ lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) });
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

  console.log(`Found ${cities.length} cities. Fetching coordinates...`);
  
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    if (city.lat && city.lng) {
      console.log(`[${i+1}/${cities.length}] ${city.name} already has coords.`);
      continue;
    }
    
    console.log(`[${i+1}/${cities.length}] Fetching coords for ${city.name}...`);
    const coords = await fetchCoords(city.name);
    if (coords) {
      city.lat = coords.lat;
      city.lng = coords.lng;
      console.log(`  -> ${coords.lat}, ${coords.lng}`);
    } else {
      console.log(`  -> Not found!`);
    }
    
    // Sleep for 1 second to respect Nominatim rate limits (1 req/sec)
    await new Promise(r => setTimeout(r, 1000));
  }

  // Write back
  const newContent = `window.KYT_CITIES = ${JSON.stringify(cities, null, 2)};\n`;
  fs.writeFileSync('C:/Venkatesh/KYT/data/cities.js', newContent, 'utf8');
  console.log("Done updating cities.js!");
}

run();

