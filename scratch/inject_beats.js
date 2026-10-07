const fs = require('fs');

const beatsData = {
  srisailam: [
    { title: "Mallikarjuna Jyotirlinga", icon: "landmark", where: "Srisailam Temple Road", hour: 7, intent: ["spiritual"], faith: ["hindu", "any"], party: ["any"], pace: ["standard", "deep"], mobility: "walk", notes: "One of the 12 Jyotirlingas, dedicated to Lord Shiva." },
    { title: "Bhramaramba Devi Temple", icon: "landmark", where: "Inside Mallikarjuna Temple Complex", hour: 9, intent: ["spiritual"], faith: ["hindu", "any"], party: ["any"], pace: ["short"], mobility: "walk", notes: "One of the 18 Maha Shakti Peethas." },
    { title: "Srisailam Dam", icon: "mountain", where: "Krishna River", hour: 16, intent: ["nature", "leisure"], faith: ["any"], party: ["any"], pace: ["standard"], mobility: "easy", notes: "One of the largest dams in India, offering scenic views." }
  ],
  omkareshwar: [
    { title: "Omkareshwar Jyotirlinga", icon: "landmark", where: "Mandhata Island", hour: 6, intent: ["spiritual"], faith: ["hindu", "any"], party: ["any"], pace: ["standard", "deep"], mobility: "walk", notes: "A revered Jyotirlinga temple situated on an island shaped like 'Om'." },
    { title: "Mamleshwar Temple", icon: "landmark", where: "South Bank of Narmada", hour: 10, intent: ["spiritual", "cultural"], faith: ["hindu", "any"], party: ["any"], pace: ["standard"], mobility: "walk", notes: "The sister temple to Omkareshwar, also considered part of the Jyotirlinga." },
    { title: "Narmada Ghat", icon: "water", where: "Banks of Narmada River", hour: 18, intent: ["spiritual", "leisure"], faith: ["any"], party: ["any"], pace: ["short"], mobility: "easy", notes: "Peaceful ghats for evening aarti and holy dips." }
  ],
  bhimashankar: [
    { title: "Bhimashankar Jyotirlinga", icon: "landmark", where: "Sahyadri Hills", hour: 6, intent: ["spiritual"], faith: ["hindu", "any"], party: ["any"], pace: ["standard"], mobility: "walk", notes: "Ancient Shiva temple built in the Nagara style of architecture." },
    { title: "Bhimashankar Wildlife Sanctuary", icon: "tree", where: "Surrounding Forest", hour: 11, intent: ["nature", "adventure"], faith: ["any"], party: ["any"], pace: ["deep"], mobility: "walk", notes: "Lush green forest known for the Indian Giant Squirrel and rich flora." },
    { title: "Gupt Bhimashankar", icon: "map-pin", where: "Near the main temple", hour: 15, intent: ["spiritual", "nature"], faith: ["hindu", "any"], party: ["any"], pace: ["standard"], mobility: "trek", notes: "The spot where the river Bhima originates." }
  ],
  nashik: [
    { title: "Trimbakeshwar Temple", icon: "landmark", where: "Trimbak", hour: 6, intent: ["spiritual"], faith: ["hindu", "any"], party: ["any"], pace: ["standard", "deep"], mobility: "walk", notes: "An ancient Jyotirlinga temple known for its three-faced Linga representing Brahma, Vishnu, and Shiva." },
    { title: "Panchavati", icon: "map-pin", where: "Northern Nashik", hour: 10, intent: ["spiritual", "cultural"], faith: ["hindu", "any"], party: ["any"], pace: ["standard"], mobility: "walk", notes: "Sacred area associated with the Ramayana, featuring the Kalaram Temple and Sita Gufa." },
    { title: "Sula Vineyards", icon: "wine", where: "Gangapur-Savargaon Road", hour: 16, intent: ["leisure", "cultural"], faith: ["any"], party: ["adults"], pace: ["deep"], mobility: "easy", notes: "Famous vineyard offering wine tasting tours and beautiful sunset views." }
  ],
  deoghar: [
    { title: "Baidyanath Jyotirlinga", icon: "landmark", where: "Deoghar Center", hour: 5, intent: ["spiritual"], faith: ["hindu", "any"], party: ["any"], pace: ["standard", "deep"], mobility: "walk", notes: "A highly revered Jyotirlinga where Ravana is said to have worshipped Shiva." },
    { title: "Naulakha Mandir", icon: "landmark", where: "1.5 km from Baidyanath", hour: 10, intent: ["spiritual", "architecture"], faith: ["hindu", "any"], party: ["any"], pace: ["short"], mobility: "easy", notes: "Beautiful temple dedicated to Radha-Krishna, built with a donation of 9 lakh rupees." },
    { title: "Tapovan", icon: "mountain", where: "10 km from Deoghar", hour: 15, intent: ["nature", "spiritual"], faith: ["hindu", "any"], party: ["any"], pace: ["standard"], mobility: "trek", notes: "A hill featuring caves where Sage Valmiki reportedly meditated." }
  ],
  tiruchirappalli: [
    { title: "Sri Ranganathaswamy Temple", icon: "landmark", where: "Srirangam", hour: 7, intent: ["spiritual", "heritage"], faith: ["hindu", "any"], party: ["any"], pace: ["deep"], mobility: "walk", notes: "One of the most illustrious Vaishnava temples, boasting the tallest temple tower in Asia." },
    { title: "Rockfort Temple", icon: "mountain", where: "Heart of Trichy", hour: 16, intent: ["spiritual", "adventure"], faith: ["hindu", "any"], party: ["any"], pace: ["standard"], mobility: "stairs", notes: "An ancient fort and temple complex built on a 83m high rock, offering panoramic city views." },
    { title: "Jambukeshwarar Temple", icon: "landmark", where: "Thiruvanaikaval", hour: 11, intent: ["spiritual", "heritage"], faith: ["hindu", "any"], party: ["any"], pace: ["standard"], mobility: "walk", notes: "A Pancha Bhoota Stalam representing the element of Water (Appu)." }
  ],
  thiruvananthapuram: [
    { title: "Padmanabhaswamy Temple", icon: "landmark", where: "Fort Pazhavangadi", hour: 6, intent: ["spiritual", "heritage"], faith: ["hindu"], party: ["any"], pace: ["standard", "deep"], mobility: "walk", notes: "Iconic Vishnu temple known for its immense wealth and strict dress code." },
    { title: "Napier Museum", icon: "museum", where: "Museum Compound", hour: 11, intent: ["cultural", "heritage"], faith: ["any"], party: ["any"], pace: ["standard"], mobility: "easy", notes: "An art and natural history museum housed in a beautiful Indo-Saracenic structure." },
    { title: "Kovalam Beach", icon: "sun", where: "16 km from City", hour: 16, intent: ["leisure", "nature"], faith: ["any"], party: ["any"], pace: ["deep"], mobility: "easy", notes: "Internationally renowned beach with three crescent-shaped beaches." }
  ],
  guruvayur: [
    { title: "Guruvayur Temple", icon: "landmark", where: "Guruvayur Town", hour: 5, intent: ["spiritual"], faith: ["hindu"], party: ["any"], pace: ["deep"], mobility: "walk", notes: "One of the most important pilgrimage centers in Kerala, dedicated to Lord Krishna." },
    { title: "Elephant Camp (Punnathur Kotta)", icon: "tree", where: "3 km from Temple", hour: 10, intent: ["leisure", "nature"], faith: ["any"], party: ["family"], pace: ["standard"], mobility: "walk", notes: "A sanctuary housing over 50 captive elephants belonging to the temple." },
    { title: "Mammiyoor Temple", icon: "landmark", where: "Near Guruvayur Temple", hour: 15, intent: ["spiritual"], faith: ["hindu"], party: ["any"], pace: ["short"], mobility: "walk", notes: "A prominent Shiva temple; a visit to Guruvayur is considered incomplete without visiting here." }
  ],
  pandharpur: [
    { title: "Vitthal Rukmini Temple", icon: "landmark", where: "Chandrabhaga River Bank", hour: 6, intent: ["spiritual"], faith: ["hindu", "any"], party: ["any"], pace: ["deep"], mobility: "walk", notes: "The most visited temple in Maharashtra, dedicated to Lord Vitthal (a form of Krishna)." },
    { title: "Chandrabhaga River Ghats", icon: "water", where: "Pandharpur", hour: 17, intent: ["spiritual", "leisure"], faith: ["any"], party: ["any"], pace: ["standard"], mobility: "easy", notes: "Holy river banks where pilgrims take a dip before visiting the temple." },
    { title: "Kaivalya Math", icon: "map-pin", where: "Pandharpur City", hour: 11, intent: ["spiritual", "cultural"], faith: ["hindu", "any"], party: ["any"], pace: ["short"], mobility: "walk", notes: "A serene ashram associated with the Warkari sect's traditions." }
  ],
  nathdwara: [
    { title: "Shrinathji Temple", icon: "landmark", where: "Nathdwara Town", hour: 7, intent: ["spiritual", "culture"], faith: ["hindu", "any"], party: ["any"], pace: ["standard"], mobility: "walk", notes: "Famous temple dedicated to a 7-year-old incarnation of Lord Krishna, renowned for its daily 'darshans'." },
    { title: "Statue of Belief (Vishwas Swaroopam)", icon: "monument", where: "Ganesh Tekri", hour: 11, intent: ["cultural", "architecture"], faith: ["any"], party: ["any"], pace: ["standard"], mobility: "easy", notes: "The tallest statue of Lord Shiva in the world, standing at 369 feet." },
    { title: "Haldighati", icon: "mountain", where: "18 km from Nathdwara", hour: 15, intent: ["heritage", "nature"], faith: ["any"], party: ["any"], pace: ["standard"], mobility: "walk", notes: "Historic mountain pass famous for the Battle of Haldighati in 1576." }
  ],
  udupi: [
    { title: "Sri Krishna Matha", icon: "landmark", where: "Car Street, Udupi", hour: 7, intent: ["spiritual", "culture"], faith: ["hindu", "any"], party: ["any"], pace: ["standard"], mobility: "walk", notes: "A famous Hindu temple dedicated to Lord Krishna, known for the 'Kanakana Kindi' window." },
    { title: "Malpe Beach", icon: "sun", where: "6 km from Udupi", hour: 16, intent: ["leisure", "nature"], faith: ["any"], party: ["any"], pace: ["standard", "deep"], mobility: "easy", notes: "A pristine beach offering water sports and ferries to St. Mary's Island." },
    { title: "St. Mary's Island", icon: "island", where: "Off Malpe Coast", hour: 10, intent: ["nature", "adventure"], faith: ["any"], party: ["any"], pace: ["deep"], mobility: "boat", notes: "Known for its distinctive hexagonal basalt rock formations." }
  ]
};

const txt = fs.readFileSync('C:/Venkatesh/KYT/data/cities.js', 'utf8');
const cities = eval(txt.replace('window.KYT_CITIES = ', '').replace(/;\s*$/, ''));

let count = 0;
cities.forEach(c => {
  if (beatsData[c.id]) {
    c.beats = beatsData[c.id];
    count++;
  }
});

fs.writeFileSync('C:/Venkatesh/KYT/data/cities.js', `window.KYT_CITIES = ${JSON.stringify(cities, null, 2)};\n`, 'utf8');
console.log('Successfully injected beats for ' + count + ' cities.');

