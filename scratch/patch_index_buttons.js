const fs = require('fs');

let code = fs.readFileSync('C:/Venkatesh/KYT/js/index.js', 'utf8');

// Replace in returning user
code = code.replace(/<a href="curated_trips\.html"[^>]*>.*?Curated.*?<\/a>/s, '<a href="curated_trips.html" class="btn btn-secondary flex gap-2"><i data-lucide="sparkles"></i> AI Curated Trips</a>');

// Replace in new user
code = code.replace(/<a href="curated_trips\.html"[^>]*>.*?Explore.*?<\/a>/s, '<a href="curated_trips.html" class="btn btn-secondary flex gap-2"><i data-lucide="sparkles"></i> AI Curated Trips</a>');

fs.writeFileSync('C:/Venkatesh/KYT/js/index.js', code);
console.log('Updated index.js buttons');

