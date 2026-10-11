const fs = require('fs');
let code = fs.readFileSync('C:/Venkatesh/KYT/admin/admin/core.js', 'utf8');

// 1. Add isNoMapStep helper
const helper = `  function isNoMapStep(title, where, icon) {
    if (TRAVEL_ICONS.indexOf(icon) >= 0) return true;
    if (icon === 'hotel' || icon === 'bed') return true;
    var t = ((title || '') + ' ' + (where || '')).toLowerCase();
    if (/hotel|check[- ]?in|checkout|check[- ]?out|stay|lodge|resort|accommodation/i.test(t)) return true;
    if (/train to|flight to|bus to|drive to|head to|return to|journey back/i.test(t)) return true;
    if (/^lunch|^dinner|^breakfast|thali/i.test(t) && !/annaprasadam|iskcon|temple/i.test(t)) return true;
    return false;
  }

`;

code = code.replace('  // ---------------------------------------------------------------- guessing and normalising', helper + '  // ---------------------------------------------------------------- guessing and normalising');

// 2. Update sanitizeStep map generation
const oldSanitizeMap = `      if (raw.mapsAuto === true && url.indexOf(searchUrl('')) === 0 && TRAVEL_ICONS.indexOf(icon) < 0) { step.mapsAuto = true; step.mapsUrl = searchUrl(placeQuery(title, where, cityName)); }
      else if (raw.mapsAuto === true && url.indexOf(searchUrl('')) === 0) step.mapsAuto = true;
    } else {
      if (raw.mapsUrl || raw.mapUrl) issues.push({ level: 'info', path: path + '.mapsUrl', msg: 'Map link was not a Google Maps link and was replaced by a search link.' });
      if (TRAVEL_ICONS.indexOf(icon) < 0) {
        step.mapsUrl = searchUrl(placeQuery(title, where, cityName));
        step.mapsAuto = true;
      }
    }`;

const newSanitizeMap = `      if (raw.mapsAuto === true && url.indexOf(searchUrl('')) === 0 && !isNoMapStep(title, where, icon)) { step.mapsAuto = true; step.mapsUrl = searchUrl(placeQuery(title, where, cityName)); }
      else if (raw.mapsAuto === true && isNoMapStep(title, where, icon)) { step.mapsUrl = ''; delete step.mapsAuto; }
      else if (raw.mapsAuto === true && url.indexOf(searchUrl('')) === 0) step.mapsAuto = true;
    } else {
      if (raw.mapsUrl || raw.mapUrl) issues.push({ level: 'info', path: path + '.mapsUrl', msg: 'Map link was not a Google Maps link and was replaced by a search link.' });
      if (!isNoMapStep(title, where, icon)) {
        step.mapsUrl = searchUrl(placeQuery(title, where, cityName));
        step.mapsAuto = true;
      }
    }`;

code = code.replace(oldSanitizeMap, newSanitizeMap);

// 3. Update itineraryRules prompt
const oldRules = `    L.push('3. Pace it realistically, with travel time between places and proper meal breaks.');
    L.push('4. "mapsUrl": include only a Google Maps link you are sure of; otherwise leave the field out. Never invent links.');`;

const newRules = `    L.push('3. Travel options: Day 1 departure and final day return steps must offer clear travel options in "notes" (e.g. By Express Train: ~X hrs; By Road/Cab: ~Y hrs; By Flight/Bus: ~Z hrs) so travellers can choose. Do NOT include a mapsUrl on transit steps.');
    L.push('4. Stay options: Stay steps must be open placeholders (title: "Hotel Check-in & Freshen up", icon: "hotel"). In "notes", recommend the best neighborhood to stay in, and explicitly add: "Placeholder: Place your hotel Google Maps link here when you have reservations." Leave "mapsUrl" empty.');
    L.push('5. Meals: In "notes", recommend 2-3 genuine local spots or regional specialties. Leave "mapsUrl" empty unless it is an iconic, non-negotiable landmark dining hall (like temple Annaprasadam).');
    L.push('6. Google Maps links: "mapsUrl" must ONLY be included for specific, fixed destinations (temples, monuments, viewpoints, museums, shrines). Never invent links; if unsure, omit mapsUrl.');
    L.push('7. Pace it realistically, with travel time between places and proper meal breaks.');`;

code = code.replace(oldRules, newRules);

fs.writeFileSync('C:/Venkatesh/KYT/admin/admin/core.js', code);
console.log('Successfully updated core.js');

