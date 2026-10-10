const fs = require('fs');
const files = [
  'C:/Venkatesh/KYT/index.html',
  'C:/Venkatesh/KYT/configure_trip.html',
  'C:/Venkatesh/KYT/view_trip.html',
  'C:/Venkatesh/KYT/virtual_trip.html',
  'C:/Venkatesh/KYT/visited.html'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/Loading\.\.\.\.\.\./g, 'Loading...');
  fs.writeFileSync(file, content);
});
console.log("Fixed Loading text");

