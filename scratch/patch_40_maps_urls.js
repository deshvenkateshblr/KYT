const fs = require('fs');

const directMapUrls = {
  // Ujjain
  "Mahakaleshwar Jyotirlinga": "https://www.google.com/maps/search/?api=1&query=Mahakaleshwar%20Jyotirlinga%2C%20Ujjain",
  "Kal Bhairav Temple": "https://www.google.com/maps/search/?api=1&query=Kal%20Bhairav%20Temple%2C%20Ujjain",
  "Ram Ghat": "https://www.google.com/maps/search/?api=1&query=Ram%20Ghat%2C%20Ujjain",

  // Srisailam
  "Mallikarjuna Jyotirlinga": "https://www.google.com/maps/search/?api=1&query=Mallikarjuna%20Jyotirlinga%2C%20Srisailam",
  "Bhramaramba Devi Temple": "https://www.google.com/maps/search/?api=1&query=Bhramaramba%20Devi%20Temple%2C%20Srisailam",
  "Srisailam Dam": "https://www.google.com/maps/search/?api=1&query=Srisailam%20Dam%2C%20Andhra%20Pradesh",

  // Omkareshwar
  "Omkareshwar Jyotirlinga": "https://www.google.com/maps/search/?api=1&query=Omkareshwar%20Jyotirlinga%2C%20Mandhata",
  "Mamleshwar Temple": "https://www.google.com/maps/search/?api=1&query=Mamleshwar%20Temple%2C%20Omkareshwar",
  "Narmada Ghat": "https://www.google.com/maps/search/?api=1&query=Narmada%20Ghat%2C%20Omkareshwar",

  // Bhimashankar
  "Bhimashankar Jyotirlinga": "https://www.google.com/maps/search/?api=1&query=Bhimashankar%20Jyotirlinga%2C%20Maharashtra",
  "Bhimashankar Wildlife Sanctuary": "https://www.google.com/maps/search/?api=1&query=Bhimashankar%20Wildlife%20Sanctuary%2C%20Maharashtra",
  "Gupt Bhimashankar": "https://www.google.com/maps/search/?api=1&query=Gupt%20Bhimashankar%2C%20Maharashtra",

  // Nashik
  "Trimbakeshwar Temple": "https://www.google.com/maps/search/?api=1&query=Trimbakeshwar%20Shiva%20Temple%2C%20Nashik",
  "Panchavati": "https://www.google.com/maps/search/?api=1&query=Panchavati%2C%20Nashik",
  "Sula Vineyards": "https://www.google.com/maps/search/?api=1&query=Sula%20Vineyards%2C%20Nashik",

  // Deoghar
  "Baidyanath Jyotirlinga": "https://www.google.com/maps/search/?api=1&query=Baba%20Baidyanath%20Dham%2C%20Deoghar",
  "Naulakha Mandir": "https://www.google.com/maps/search/?api=1&query=Naulakha%20Mandir%2C%20Deoghar",
  "Tapovan": "https://www.google.com/maps/search/?api=1&query=Tapovan%20Caves%2C%20Deoghar",

  // Tiruchirappalli
  "Sri Ranganathaswamy Temple": "https://www.google.com/maps/search/?api=1&query=Sri%20Ranganathaswamy%20Temple%2C%20Srirangam%2C%20Tiruchirappalli",
  "Rockfort Temple": "https://www.google.com/maps/search/?api=1&query=Tiruchirappalli%20Rock%20Fort%2C%20Tiruchirappalli",
  "Jambukeshwarar Temple": "https://www.google.com/maps/search/?api=1&query=Jambukeswarar%20Temple%2C%20Thiruvanaikaval%2C%20Tiruchirappalli",

  // Thiruvananthapuram
  "Padmanabhaswamy Temple": "https://www.google.com/maps/search/?api=1&query=Padmanabhaswamy%20Temple%2C%20Thiruvananthapuram",
  "Napier Museum": "https://www.google.com/maps/search/?api=1&query=Napier%20Museum%2C%20Thiruvananthapuram",
  "Kovalam Beach": "https://www.google.com/maps/search/?api=1&query=Kovalam%20Beach%2C%20Kerala",

  // Guruvayur
  "Guruvayur Temple": "https://www.google.com/maps/search/?api=1&query=Guruvayur%20Temple%2C%20Guruvayur",
  "Elephant Camp (Punnathur Kotta)": "https://www.google.com/maps/search/?api=1&query=Punnathur%20Kotta%20Elephant%20Camp%2C%20Guruvayur",
  "Mammiyoor Temple": "https://www.google.com/maps/search/?api=1&query=Mammiyoor%20Temple%2C%20Guruvayur",

  // Pandharpur
  "Vitthal Rukmini Temple": "https://www.google.com/maps/search/?api=1&query=Shree%20Vitthal%20Rukmini%20Mandir%2C%20Pandharpur",
  "Chandrabhaga River Ghats": "https://www.google.com/maps/search/?api=1&query=Chandrabhaga%20Ghat%2C%20Pandharpur",
  "Kaivalya Math": "https://www.google.com/maps/search/?api=1&query=Kaivalya%20Dham%2C%20Pandharpur",

  // Nathdwara
  "Shrinathji Temple": "https://www.google.com/maps/search/?api=1&query=Shrinathji%20Temple%2C%20Nathdwara",
  "Statue of Belief (Vishwas Swaroopam)": "https://www.google.com/maps/search/?api=1&query=Statue%20of%20Belief%2C%20Nathdwara",
  "Haldighati": "https://www.google.com/maps/search/?api=1&query=Haldighati%2C%20Rajasthan",

  // Udupi
  "Sri Krishna Matha": "https://www.google.com/maps/search/?api=1&query=Sri%20Krishna%20Matha%2C%20Udupi",
  "Malpe Beach": "https://www.google.com/maps/search/?api=1&query=Malpe%20Beach%2C%20Udupi",
  "St. Mary's Island": "https://www.google.com/maps/search/?api=1&query=St.%20Mary%27s%20Island%2C%20Malpe%2C%20Udupi",

  // Hubballi (Hubli)
  "Siddharoodha Math": "https://www.google.com/maps/search/?api=1&query=Shree%20Siddharoodha%20Swamy%20Math%2C%20Hubballi",
  "Unkal Lake": "https://www.google.com/maps/search/?api=1&query=Unkal%20Lake%2C%20Hubballi",
  "Chandramouleshwara Temple": "https://www.google.com/maps/search/?api=1&query=Chandramouleshwara%20Temple%2C%20Hubballi",
  "Nrupatunga Hill": "https://www.google.com/maps/search/?api=1&query=Nrupatunga%20Betta%2C%20Hubballi"
};

global.window = {};
require('../data/cities.js');
const cities = window.KYT_CITIES;

let updatedCount = 0;
for (const city of cities) {
  for (const beat of (city.beats || [])) {
    if (!beat.mapsUrl && directMapUrls[beat.title]) {
      beat.mapsUrl = directMapUrls[beat.title];
      updatedCount++;
    }
  }
}

console.log(`Updated ${updatedCount} attractions with direct Google Maps URLs.`);

// Verify remaining missing
let remainingMissing = 0;
for (const city of cities) {
  for (const beat of (city.beats || [])) {
    if (!beat.mapsUrl) {
      remainingMissing++;
      console.log(`Still missing: ${city.name} - ${beat.title}`);
    }
  }
}
console.log(`Remaining missing in entire dataset: ${remainingMissing}`);

if (remainingMissing === 0) {
  const content = 'window.KYT_CITIES = ' + JSON.stringify(cities, null, 2) + ';\n';
  fs.writeFileSync('data/cities.js', content, 'utf8');
  console.log('Successfully wrote data/cities.js!');
} else {
  console.error('Did not write data/cities.js because some are still missing!');
}

