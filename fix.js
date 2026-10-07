const fs = require('fs');

let content = fs.readFileSync('js/virtual-trips.js', 'utf8');

const regex = /if\s*\(\s*card\s*\)\s*\{\s*const\s*trip\s*=\s*vtrips\.find\(\s*t\s*=>\s*t\.id\s*===\s*card\.dataset\.id\s*\);\s*window\.location\.href\s*=\s*'shared_trip\.html\?id='\s*\+\s*card\.dataset\.id;\s*\}/;

const replacement = `        if (card) {
          const trip = vtrips.find(t => t.id === card.dataset.id);
          window.location.href = 'shared_trip.html?id=' + card.dataset.id;
        }
      });
    }`;

content = content.replace(regex, replacement);
fs.writeFileSync('js/virtual-trips.js', content);

