const fs = require('fs');

// config.js
let cfg = fs.readFileSync('js/config.js', 'utf8');
cfg = cfg.replace(
    /function openConfigView\(\) \{[\s\S]*?configView\.classList\.remove\('hidden'\);\s*\}, 300\);\s*\}/,
    'function openConfigView() { window.location.href = "configure_trip.html"; }'
);
cfg = cfg.replace(
    /configView\.classList\.add\('hidden'\);\s*mainView\.classList\.remove\('hidden'\);\s*void mainView\.offsetWidth;\s*mainView\.classList\.remove\('opacity-0'\);/,
    'window.location.href = "index.html";'
);
fs.writeFileSync('js/config.js', cfg);

// virtual-trips.js
let vt = fs.readFileSync('js/virtual-trips.js', 'utf8');
vt = vt.replace(
    /function openView\(\) \{[\s\S]*?DOM\.view\.classList\.remove\('hidden'\);\s*\}/,
    'function openView() { window.location.href = "virtual_trip.html"; }'
);
vt = vt.replace(
    /function closeView\(\) \{[\s\S]*?mainView\.classList\.remove\('opacity-0'\);\s*\}\s*\}/,
    'function closeView() { window.location.href = "index.html"; }'
);
fs.writeFileSync('js/virtual-trips.js', vt);
console.log('Fixed routing in JS files');

