const fs = require('fs');

// 1. Undo in share.js
let shareContent = fs.readFileSync('C:/Venkatesh/KYT/js/share.js', 'utf8');
shareContent = shareContent.replace(/KYT\.utils\.escapeHTML\(([^)]+)\)/g, '$1');
fs.writeFileSync('C:/Venkatesh/KYT/js/share.js', shareContent);

// 2. Undo in step-form.js
let formContent = fs.readFileSync('C:/Venkatesh/KYT/js/step-form.js', 'utf8');
formContent = formContent.replace(/KYT\.utils\.escapeHTML\(([^)]+)\)/g, '$1');
fs.writeFileSync('C:/Venkatesh/KYT/js/step-form.js', formContent);

// 3. Fix in virtual-trips.js
let vtContent = fs.readFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', 'utf8');
// Fix the confirm dialog:
vtContent = vtContent.replace(/KYT\.utils\.escapeHTML\(sharedTripName\)/g, 'sharedTripName');
// Now apply escaping when rendering in virtual-trips.js
vtContent = vtContent.replace(/\$\{vt\.name\}/g, '${KYT.utils.escapeHTML(vt.name)}');
fs.writeFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', vtContent);

// 4. Apply escaping in carousel.js
let carouselContent = fs.readFileSync('C:/Venkatesh/KYT/js/carousel.js', 'utf8');
// Escape title in card render
carouselContent = carouselContent.replace(/\$\{step\.title\}/g, '${KYT.utils.escapeHTML(step.title)}');
// Escape where, notes, etc.
carouselContent = carouselContent.replace(/\$\{step\.where\}/g, '${KYT.utils.escapeHTML(step.where)}');
carouselContent = carouselContent.replace(/\$\{step\.notes\}/g, '${KYT.utils.escapeHTML(step.notes)}');
fs.writeFileSync('C:/Venkatesh/KYT/js/carousel.js', carouselContent);

console.log("Fixed escaping logic.");

