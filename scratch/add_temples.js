const fs = require('fs');
const newCities = [
  {
    id: "srisailam",
    name: "Srisailam",
    state: "Andhra Pradesh",
    description: "Home to the Mallikarjuna Jyotirlinga and Bhramaramba Shakti Peeth, a sacred town on the banks of River Krishna.",
    lat: 16.0735,
    lng: 78.8687,
    tags: ["Spiritual", "Nature", "Forest"]
  },
  {
    id: "omkareshwar",
    name: "Omkareshwar",
    state: "Madhya Pradesh",
    description: "A sacred island on the Narmada river, shaped like the holy 'Om', housing one of the 12 revered Jyotirlingas.",
    lat: 22.2472,
    lng: 76.1517,
    tags: ["Spiritual", "River", "Heritage"]
  },
  {
    id: "bhimashankar",
    name: "Bhimashankar",
    state: "Maharashtra",
    description: "An ancient shrine in the Sahyadri mountains, famous for its Jyotirlinga and the lush Bhimashankar Wildlife Sanctuary.",
    lat: 19.0718,
    lng: 73.5350,
    tags: ["Spiritual", "Nature", "Trekking"]
  },
  {
    id: "nashik",
    name: "Nashik",
    state: "Maharashtra",
    description: "An ancient holy city on the Godavari river, famous for the Kumbh Mela, Trimbakeshwar Jyotirlinga, and vineyards.",
    lat: 20.0033,
    lng: 73.7667,
    tags: ["Spiritual", "Heritage", "Vineyards"]
  },
  {
    id: "deoghar",
    name: "Deoghar",
    state: "Jharkhand",
    description: "A major Hindu pilgrimage site renowned for the Baidyanath Jyotirlinga temple, attracting millions during Shravan.",
    lat: 24.4820,
    lng: 86.6946,
    tags: ["Spiritual", "Culture"]
  },
  {
    id: "tiruchirappalli",
    name: "Tiruchirappalli",
    state: "Tamil Nadu",
    description: "An ancient city centered around the Rock Fort, and home to the massive Sri Ranganathaswamy Temple in Srirangam.",
    lat: 10.7905,
    lng: 78.7047,
    tags: ["Heritage", "Spiritual", "Architecture"]
  },
  {
    id: "thiruvananthapuram",
    name: "Thiruvananthapuram",
    state: "Kerala",
    description: "The capital of Kerala, distinguished by its British colonial architecture, art galleries, and the magnificent Padmanabhaswamy Temple.",
    lat: 8.5241,
    lng: 76.9366,
    tags: ["Heritage", "Coastal", "Spiritual"]
  },
  {
    id: "guruvayur",
    name: "Guruvayur",
    state: "Kerala",
    description: "A bustling temple town in Kerala, home to the revered Guruvayur Sri Krishna Temple, often called the 'Dwarka of the South'.",
    lat: 10.5960,
    lng: 76.0392,
    tags: ["Spiritual", "Culture"]
  },
  {
    id: "pandharpur",
    name: "Pandharpur",
    state: "Maharashtra",
    description: "A major pilgrimage city on the banks of the Chandrabhaga River, dedicated to Lord Vitthal and Rukmini.",
    lat: 17.6775,
    lng: 75.3283,
    tags: ["Spiritual", "Culture", "River"]
  },
  {
    id: "nathdwara",
    name: "Nathdwara",
    state: "Rajasthan",
    description: "A picturesque town in the Aravalli hills, famous for its Shrinathji Temple, dedicated to Lord Krishna.",
    lat: 24.9304,
    lng: 73.8211,
    tags: ["Spiritual", "Art", "Heritage"]
  },
  {
    id: "udupi",
    name: "Udupi",
    state: "Karnataka",
    description: "A coastal city renowned for its Hindu temples, particularly the 13th-century Sri Krishna Matha, and its unique local cuisine.",
    lat: 13.3409,
    lng: 74.7421,
    tags: ["Spiritual", "Coastal", "Culinary"]
  }
];

const txt = fs.readFileSync('C:/Venkatesh/KYT/data/cities.js', 'utf8');
const existingCities = eval(txt.replace('window.KYT_CITIES = ', '').replace(/;\s*$/, ''));

let added = 0;
newCities.forEach(nc => {
  if (!existingCities.find(c => c.id === nc.id)) {
    existingCities.push(nc);
    added++;
  }
});

fs.writeFileSync('C:/Venkatesh/KYT/data/cities.js', `window.KYT_CITIES = ${JSON.stringify(existingCities, null, 2)};\n`, 'utf8');
console.log('Added ' + added + ' cities to cities.js');

