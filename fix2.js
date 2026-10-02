const fs = require('fs');

// Fix configure_trip.html
let configContent = fs.readFileSync('configure_trip.html', 'utf8');

// Hide main-view
configContent = configContent.replace(
    /<main id="main-view" class="/g,
    '<main id="main-view" class="hidden '
);

// Make config-view a normal static block
configContent = configContent.replace(
    /<aside id="config-view"[\s\n]*class="fixed inset-0 bg-kyt-bg z-50 flex flex-col w-full max-w-md mx-auto hidden animate-fade-in overflow-hidden"/g,
    '<aside id="config-view"\n         class="flex flex-col w-full max-w-md mx-auto animate-fade-in overflow-hidden flex-1 h-full"'
);

// Remove the pt-12 from the config header since it's no longer at the very top of the screen
configContent = configContent.replace(
    /<div class="px-6 pt-12 pb-6 bg-white/g,
    '<div class="px-6 pt-6 pb-6 bg-white'
);

fs.writeFileSync('configure_trip.html', configContent);

// Fix virtual_trip.html
let vtContent = fs.readFileSync('virtual_trip.html', 'utf8');

vtContent = vtContent.replace(
    /<main id="main-view" class="/g,
    '<main id="main-view" class="hidden '
);

vtContent = vtContent.replace(
    /<aside id="virtual-trips-view" class="fixed inset-0 z-50 flex flex-col w-full max-w-md mx-auto bg-slate-50 text-slate-800 hidden pt-28"/g,
    '<aside id="virtual-trips-view" class="flex flex-col w-full max-w-md mx-auto bg-slate-50 text-slate-800 flex-1 h-full pt-4"'
);

fs.writeFileSync('virtual_trip.html', vtContent);

console.log('Fixed pages to be static layouts instead of fixed overlays.');

