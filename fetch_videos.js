const https = require('https');
https.get('https://www.youtube.com/results?search_query=Hubli+City+Tour', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const matches = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
        if (matches) {
            const ids = [...new Set(matches.map(m => m.split(':')[1].replace(/"/g, '')))];
            console.log("Tour IDs:", ids.slice(0, 3));
        }
    });
});

https.get('https://www.youtube.com/results?search_query=Hubli+Street+Food', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const matches = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
        if (matches) {
            const ids = [...new Set(matches.map(m => m.split(':')[1].replace(/"/g, '')))];
            console.log("Food IDs:", ids.slice(0, 3));
        }
    });
});

