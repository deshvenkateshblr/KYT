const fs = require('fs');

let code = fs.readFileSync('virtual_trip.html', 'utf8');
code = code.replace(
  'class="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none',
  'class="flex-1 min-w-0 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none'
);

// Any other flex inputs?
code = code.replace(
  'class="flex-1 text-sm font-medium text-slate-700 bg-white border-2 border-slate-200 rounded-xl px-3',
  'class="flex-1 min-w-0 text-sm font-medium text-slate-700 bg-white border-2 border-slate-200 rounded-xl px-3'
);

fs.writeFileSync('virtual_trip.html', code);

