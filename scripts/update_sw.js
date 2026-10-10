const fs = require('fs');
let content = fs.readFileSync('sw.js', 'utf8');

const updatedShell = `const APP_SHELL = [
  './',
  './index.html',
  './index.css',
  './index.js',
  './view_trip.html',
  './configure_trip.html',
  './virtual_trip.html',
  './manifest.json',
  './css/base.css',
  './css/animations.css',
  './css/circuits.css',
  './js/app.js',
  './js/store.js',
  './js/clock.js',
  './js/carousel.js',
  './js/config.js',
  './js/step-form.js',
  './js/file-viewer.js',
  './js/share.js',
  './js/social.js',
  './js/virtual-trips.js',
  './passport.html',
  './js/passport.js',
  './data/cities.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];`;

content = content.replace(/const APP_SHELL = \[[^\]]*\];/, updatedShell);
content = content.replace(/const CACHE_NAME = 'kyt-v4';/, "const CACHE_NAME = 'kyt-v5';"); 

fs.writeFileSync('sw.js', content);
console.log('sw.js updated');



