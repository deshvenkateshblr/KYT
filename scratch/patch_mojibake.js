const fs = require('fs');
const files = [
  'C:/Venkatesh/KYT/configure_trip.html',
  'C:/Venkatesh/KYT/view_trip.html',
  'C:/Venkatesh/KYT/virtual_trip.html'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/contacts[\s\S]*?"/g, 'contacts..."');
  fs.writeFileSync(file, content);
});
console.log("Fixed mojibake");

