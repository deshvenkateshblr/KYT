const fs = require('fs');
const content = fs.readFileSync('C:/Venkatesh/KYT/data/cities.js', 'utf8');
const jsonStr = content.replace('window.KYT_CITIES = ', '').replace(/;\s*$/, '').trim();
const cities = eval(jsonStr);

const stateCounts = {};
cities.forEach(city => {
  if (!city.state) return;
  if (!stateCounts[city.state]) {
    stateCounts[city.state] = [];
  }
  stateCounts[city.state].push(city.name);
});

const sorted = Object.entries(stateCounts)
  .sort((a, b) => b[1].length - a[1].length);

console.log('--- CITIES PER STATE ---');
sorted.forEach(([state, cityList]) => {
  console.log(`${state} (${cityList.length} cities):`);
  console.log('  ' + cityList.join(', '));
  console.log('');
});

