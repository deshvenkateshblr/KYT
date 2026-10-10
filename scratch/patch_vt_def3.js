const fs = require('fs');
let vtContent = fs.readFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', 'utf8');
vtContent = vtContent.replace(/sharedTripName \|\| 'Shared Trip'/g, "KYT.utils.escapeHTML(sharedTripName) || 'Shared Trip'");
if (!vtContent.includes('confirm(`Do you want to import')) {
  const orig = `const tasteParts = sharedTaste && sharedTaste.length === 3`;
  const rep = `if (!confirm(\`Do you want to import the shared trip: "\${KYT.utils.escapeHTML(sharedTripName) || 'Shared Trip'}"?\`)) {
          const url = new URL(window.location.href);
          url.searchParams.delete('trip');
          url.searchParams.delete('cities');
          url.searchParams.delete('taste');
          window.history.replaceState({}, '', url.toString());
          return;
        }
        const tasteParts = sharedTaste && sharedTaste.length === 3`;
  vtContent = vtContent.replace(orig, rep);
}
fs.writeFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', vtContent);
console.log('Defect 3 patched in vt');

