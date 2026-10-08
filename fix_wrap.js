const fs = require('fs');
let code = fs.readFileSync('trip_detail.html', 'utf8');
code = code.replace(
  '<div class="flex items-center justify-center gap-3">',
  '<div class="flex flex-wrap items-center justify-center gap-3">'
);
fs.writeFileSync('trip_detail.html', code);

