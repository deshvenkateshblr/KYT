const fs = require('fs');
let c = fs.readFileSync('js/virtual-trips.js', 'utf8');
c = c.replace(/window\.location\.href = shared_trip\.html\?id=\\\;/, 'window.location.href = `shared_trip.html?id=${card.dataset.id}`;');
fs.writeFileSync('js/virtual-trips.js', c);
console.log('Fixed');

