const fs = require('fs');
const content = fs.readFileSync('data/cities.js', 'utf8');
// Use Function to evaluate in module scope
const fn = new Function(content + '; return window.KYT_CITIES;');
const fakeWindow = {};
global.window = fakeWindow;
eval(content);
const cities = global.window.KYT_CITIES;
console.log('Total cities:', cities.length);
const single = cities.filter(c => c.beats.length === 1);
console.log('Cities with only 1 beat:', single.length);
const multi = cities.filter(c => c.beats.length > 1);
console.log('Cities with 2+ beats:', multi.length);
if (multi.length > 0) {
    multi.slice(0, 3).forEach(c => console.log(' ', c.name, ':', c.beats.length, 'beats'));
}

