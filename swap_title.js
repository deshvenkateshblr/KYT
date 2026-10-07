const fs = require('fs');

let code = fs.readFileSync('trip_detail.html', 'utf8');

// 1. Remove id="trip-title" from the header and make it static "Virtual Trip"
const headerTarget = '<h1 class="text-lg font-black text-slate-800" id="trip-title">Virtual Trip</h1>';
const headerReplacement = '<h1 class="text-lg font-black text-slate-800">Virtual Trip</h1>';
code = code.replace(headerTarget, headerReplacement);

// 2. Add id="trip-title" to the Hero Banner h2
const heroTarget = '<h2 class="text-2xl font-black text-blue-900 mb-2">Explore your curated journey</h2>';
const heroReplacement = '<h2 class="text-3xl font-black text-blue-900 mb-2" id="trip-title">Explore your curated journey</h2>';
code = code.replace(heroTarget, heroReplacement);

fs.writeFileSync('trip_detail.html', code);

