const fs = require('fs');
const files = ['view_trip.html', 'configure_trip.html', 'virtual_trip.html'];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Fix memory-card-view header
    content = content.replace(
        /<button id="btn-close-card"[\s\S]*?<\/button>\s*<\/div>/g,
        (match) => match.replace(/<\/div>$/, '</header>')
    );

    // Fix explore-view header
    content = content.replace(
        /<button type="button" id="btn-close-explore"[\s\S]*?<\/button>\s*<\/div>/g,
        (match) => match.replace(/<\/div>$/, '</header>')
    );

    // Fix virtual-trips-view header
    content = content.replace(
        /<button type="button" id="btn-close-virtual-trips"[\s\S]*?<\/button>\s*<\/div>/g,
        (match) => match.replace(/<\/div>$/, '</header>')
    );

    fs.writeFileSync(file, content);
}
console.log('Fixed headers in all files');

