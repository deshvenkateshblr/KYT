const fs = require('fs');
let code = fs.readFileSync('data/city_videos_data.js', 'utf8');

// The Hubli videos block looks like:
// "hubli": [ { "id": "jU7ZyViNu2U", "title": "Hubli City Tour..." }, { "id": "jU7ZyViNu2U", "title": "Hubballi Dharwad Street Food..." } ]

// Let's replace the first jU7ZyViNu2U for Hubli with n2CjxMyIFi4
// And the second one with -iSMIBwAPBA

code = code.replace(
  /"id":\s*"jU7ZyViNu2U",\s*"title":\s*"Hubli City Tour/,
  '"id": "n2CjxMyIFi4",\n        "title": "Hubli City Tour'
);

code = code.replace(
  /"id":\s*"jU7ZyViNu2U",\s*"title":\s*"Hubballi Dharwad Street Food/,
  '"id": "-iSMIBwAPBA",\n        "title": "Hubballi Dharwad Street Food'
);

// add version bump
code = code.replace(/window\.KYT_CITY_VIDEOS/, 'window.KYT_CITY_VIDEOS'); // noop

fs.writeFileSync('data/city_videos_data.js', code);

