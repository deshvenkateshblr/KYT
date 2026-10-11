const fs = require('fs');
let html = fs.readFileSync('C:/Venkatesh/KYT/curated_trips.html', 'utf8');

const deadSnippet = `          let mapLink = s.mapsUrl;
          if (!mapLink || mapLink.endsWith("=Tirupati") || mapLink.endsWith("=Tirumala") || mapLink.endsWith("=Tiruchanur")) {
            mapLink = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(s.title + (s.where ? ", " + s.where : ""));
          }
          const mapsBtn = mapLink ? \`
            <a href="\${mapLink}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 mt-1">
              <i data-lucide="map-pin" class="w-3 h-3"></i> Google Maps
            </a>
          \` : '';
`;

if (html.includes(deadSnippet)) {
  html = html.replace(deadSnippet, '');
  fs.writeFileSync('C:/Venkatesh/KYT/curated_trips.html', html);
  console.log('Successfully cleaned redundant mapLink snippet');
} else {
  console.log('Snippet not found or already clean');
}

