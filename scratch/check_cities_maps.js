const fs = require('fs');

global.window = {};
require('../data/cities.js');
const cities = window.KYT_CITIES;

const c13 = ['ujjain','srisailam','omkareshwar','bhimashankar','nashik','deoghar','tiruchirappalli','thiruvananthapuram','guruvayur','pandharpur','nathdwara','udupi','hubli'];

console.log('Total cities:', cities.length);
let count = 0;
for (const id of c13) {
  const c = cities.find(x => x.id === id);
  if (c) {
    console.log(`\nCity: ${c.name} (${c.id})`);
    c.beats.forEach((b, i) => {
      count++;
      console.log(`  Beat ${i+1}: ${b.title} | where: ${b.where} | mapsUrl: ${b.mapsUrl || 'MISSING'}`);
    });
  }
}
console.log('\nTotal beats in these 13 cities:', count);

