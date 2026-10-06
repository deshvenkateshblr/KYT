// scripts/build_cities_database.js
const fs = require('fs');
const path = require('path');

const part1 = require('./cities_part1.js');
const part2 = require('./cities_part2.js');
const part3 = require('./cities_part3.js');
const cityAliases = require('./city_aliases.js');

const rawCities = [...part1, ...part2, ...part3];

const allCities = rawCities.map(city => {
  return {
    ...city,
    aliases: cityAliases[city.id] || city.aliases || []
  };
});

console.log(`Loaded ${allCities.length} total cities.`);

// Validation
const seenIds = new Set();
const seenNames = new Set();
let totalBeats = 0;
let errors = [];

allCities.forEach((city, cIdx) => {
  if (!city.id) errors.push(`City at index ${cIdx} has no id`);
  if (!city.name) errors.push(`City at index ${cIdx} has no name`);
  
  if (seenIds.has(city.id)) {
    errors.push(`Duplicate city id: ${city.id}`);
  }
  seenIds.add(city.id);

  if (seenNames.has(city.name)) {
    errors.push(`Duplicate city name: ${city.name}`);
  }
  seenNames.add(city.name);

  if (!city.beats || city.beats.length < 4) {
    errors.push(`City ${city.name} has fewer than 4 beats (${city.beats ? city.beats.length : 0})`);
  }

  (city.beats || []).forEach((b, bIdx) => {
    totalBeats++;
    if (!b.title) errors.push(`City ${city.name} beat ${bIdx} missing title`);
    if (!b.icon) errors.push(`City ${city.name} beat ${bIdx} missing icon`);
    if (!b.where) errors.push(`City ${city.name} beat ${bIdx} missing where`);
    if (typeof b.hour !== 'number' || b.hour < 4 || b.hour > 23) {
      errors.push(`City ${city.name} beat ${bIdx} invalid hour: ${b.hour}`);
    }
    if (!b.intent || !Array.isArray(b.intent) || b.intent.length === 0) {
      errors.push(`City ${city.name} beat ${bIdx} invalid intent`);
    }
    if (!b.mobility) errors.push(`City ${city.name} beat ${bIdx} missing mobility`);
    if (!b.mapsUrl) errors.push(`City ${city.name} beat ${bIdx} missing mapsUrl`);
    if (!b.notes || b.notes.length < 15) {
      errors.push(`City ${city.name} beat ${bIdx} notes too short: "${b.notes}"`);
    }
    if (/^Must-visit spot in\s+\w+|^Visit\s+[\w\s&,/-]+\s+in\s+[\w\s]+\.?$/i.test(b.notes)) {
      errors.push(`City ${city.name} beat ${bIdx} has placeholder notes: "${b.notes}"`);
    }
    if (b.intent.includes('culinary') && !b.diet) {
      errors.push(`City ${city.name} beat ${b.title} has culinary intent but missing diet tag`);
    }
  });
});

if (errors.length > 0) {
  console.error(`Found ${errors.length} validation errors:`);
  errors.slice(0, 20).forEach(e => console.error(' -', e));
  process.exit(1);
}

console.log(`Validation passed! Total unique cities: ${allCities.length}, Total beats: ${totalBeats}`);

const targetPath = path.resolve(__dirname, '../data/cities.js');
const outputContent = 'window.KYT_CITIES = ' + JSON.stringify(allCities, null, 2) + ';\n';
fs.writeFileSync(targetPath, outputContent, 'utf8');

console.log(`Successfully wrote ${outputContent.length} bytes to ${targetPath}`);
