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
  // Replace the common mojibake strings
  content = content.replace(/â€¦/g, '...');
  content = content.replace(/â€”/g, '-'); // em dash
  content = content.replace(/â”€/g, '-'); // box drawing horizontal
  content = content.replace(/â€™/g, "'"); // smart single quote right
  content = content.replace(/â€˜/g, "'"); // smart single quote left
  content = content.replace(/â€œ/g, '"'); // smart double quote left
  content = content.replace(/â€/g, '"'); // smart double quote right
  
  // Replace actual literal unicode characters that might also be causing issues
  content = content.replace(/…/g, '...');
  content = content.replace(/—/g, '-');
  content = content.replace(/─/g, '-');

  // Also replace some of the things that showed up as question marks in output if they are weird chars
  content = content.replace(/Loadingâ€¦/g, 'Loading...');
  content = content.replace(/Loading…/g, 'Loading...');
  
  // The script comment separators were box drawings:
  content = content.replace(/[\u2500-\u257F]+/g, function(match) {
    return '-'.repeat(match.length);
  });
  
  // also fix some lingering question mark or corrupted dots
  content = content.replace(/Loading\?/g, 'Loading...');
  content = content.replace(/Loading/g, 'Loading...');

  fs.writeFileSync(file, content);
});
console.log("Fixed mojibake across files");

