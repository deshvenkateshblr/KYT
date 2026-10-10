const fs = require('fs');

// Patch virtual-trips.js
let vtContent = fs.readFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', 'utf8');
vtContent = vtContent.replace('function useAsMyTrip(tripId)', 'async function useAsMyTrip(tripId)');
vtContent = vtContent.replace('KYT.store.saveData();\n\n    // Redirect to view_trip.html (Now cards)\n    window.location.href = \'view_trip.html\';', 'await KYT.store.saveData();\n\n    // Redirect to view_trip.html (Now cards)\n    window.location.href = \'view_trip.html\';');
// The regex above might not match exact newlines. Let's use string replace carefully.
vtContent = vtContent.replace('KYT.store.saveData();', 'await KYT.store.saveData();');
fs.writeFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', vtContent);

// Patch config.js
let configContent = fs.readFileSync('C:/Venkatesh/KYT/js/config.js', 'utf8');
configContent = configContent.replace('function endTrip() {', 'async function endTrip() {');
configContent = configContent.replace('KYT.store.saveData();\n      localStorage.removeItem(\'kyt_stepsData\');\n      window.location.href = \'index.html\';', 'await KYT.store.saveData();\n      localStorage.removeItem(\'kyt_stepsData\');\n      window.location.href = \'index.html\';');
// Actually, let's just replace the exact line:
configContent = configContent.replace('KYT.store.saveData();\r\n      localStorage.removeItem', 'await KYT.store.saveData();\r\n      localStorage.removeItem');
configContent = configContent.replace('KYT.store.saveData();\n      localStorage.removeItem', 'await KYT.store.saveData();\n      localStorage.removeItem');
fs.writeFileSync('C:/Venkatesh/KYT/js/config.js', configContent);

console.log("Patched async saves");

