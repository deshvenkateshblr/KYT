const fs = require('fs');

// Curated beats for cities that currently have only one beat
// Sourced from official tourism portals and well-known travel info
const additionalBeats = {

  "gaya": [
    { title: "Vishnupad Temple", icon: "landmark", where: "Vishnupad Temple, Gaya", hour: 6,
      notes: "The most revered temple of Gaya, marking the footprint of Lord Vishnu on a rock. Ancient pilgrimage site for Pind Daan rituals on the Falgu river bank.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Mahabodhi Temple, Bodh Gaya", icon: "landmark", where: "Mahabodhi Temple, Bodh Gaya", hour: 9,
      notes: "UNESCO World Heritage Site where the Buddha attained enlightenment under the Bodhi tree. One of the holiest Buddhist sites in the world.",
      intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Mangala Gauri Temple", icon: "landmark", where: "Mangala Gauri, Gaya", hour: 7,
      notes: "One of the 18 Shakti Peethas, dedicated to Goddess Mangala Gauri. Perched on a hillock with beautiful views of the city.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Bodhi Tree & meditation walk", icon: "tree-pine", where: "Bodh Gaya, Gaya", hour: 8,
      notes: "Sit beneath the sacred Bodhi Tree, a direct descendant of the original tree under which the Buddha meditated. Deeply peaceful morning ritual.",
      intent: ["spiritual","adventure"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Baba Koteshwar Nath Temple", icon: "landmark", where: "Koteshwar, Gaya", hour: 11,
      notes: "A revered Shiva temple on the banks of the Falgu river, integral to the Gaya Shraddha pilgrimage circuit.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Dungeswari Cave Temples", icon: "camera", where: "Dungeswari Hill, Gaya", hour: 14,
      notes: "Ancient cave shrines where the Buddha meditated before his enlightenment. A quiet, atmospheric site on a rocky hillside.",
      intent: ["spiritual","adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "trek" }
  ],

  "tirupati": [
    { title: "Tirumala Venkateswara Temple", icon: "landmark", where: "Tirumala, Tirupati", hour: 5,
      notes: "One of the world's most visited pilgrimage sites, dedicated to Lord Venkateswara on the sacred Tirumala hills. Darshan with special tickets.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Sri Padmavathi Ammavari Temple", icon: "landmark", where: "Tiruchanur, Tirupati", hour: 8,
      notes: "Temple dedicated to Goddess Padmavathi, consort of Lord Venkateswara. An essential stop on the Tirupati pilgrimage circuit.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Kapila Theertham waterfall", icon: "waves", where: "Kapila Theertham, Tirupati", hour: 10,
      notes: "Sacred waterfall with a Shiva temple at its base — one of the few places where Lord Shiva is worshipped at the foot of the Tirumala hills.",
      intent: ["spiritual","adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Chandragiri Fort", icon: "landmark", where: "Chandragiri, Tirupati", hour: 14,
      notes: "16th-century fort of the Vijayanagara Empire with a beautiful palace museum and light & sound show in the evenings.",
      intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" }
  ],

  "madurai": [
    { title: "Meenakshi Amman Temple", icon: "landmark", where: "Meenakshi Amman Temple, Madurai", hour: 7,
      notes: "One of the greatest temples in India, dedicated to Goddess Meenakshi. The towering gopurams covered in thousands of colourful sculptures are spectacular.",
      intent: ["spiritual","cultural"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Thirumalai Nayakar Palace", icon: "landmark", where: "Nayakar Palace, Madurai", hour: 10,
      notes: "Magnificent 17th-century palace built by Thirumalai Nayakar, blending Dravidian and Islamic architectural styles.",
      intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Madurai night market walk", icon: "shopping-bag", where: "Town Hall Road, Madurai", hour: 19,
      notes: "Explore Madurai's vibrant evening market scene — jasmine flowers, silk sarees, street snacks and the sound of temple bells.",
      intent: ["cultural","culinary"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Jigarthanda & parotta dinner", icon: "utensils", where: "Madurai town", hour: 20,
      notes: "Try Madurai's iconic Jigarthanda (milk-based cold drink) and the famous layered parotta with salna — a local culinary institution.",
      intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["any"] }
  ],

  "puri": [
    { title: "Jagannath Temple", icon: "landmark", where: "Bada Danda, Puri", hour: 6,
      notes: "One of the four sacred dhams of Hinduism, housing the iconic deity of Lord Jagannath. The Rath Yatra chariot festival is world-famous.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Puri Beach sunrise", icon: "waves", where: "Swargadwar Beach, Puri", hour: 5,
      notes: "Watch the sunrise at Puri's golden beach. The meeting of orange sky and rolling Bay of Bengal waves is unforgettable.",
      intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Konark Sun Temple", icon: "landmark", where: "Konark, Puri", hour: 10,
      notes: "UNESCO World Heritage Site — a 13th-century chariot-shaped temple to the Sun God, one of India's greatest architectural marvels.",
      intent: ["cultural","spiritual"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Chilika Lake bird watching", icon: "tree-pine", where: "Chilika Lake, Puri", hour: 9,
      notes: "Asia's largest coastal lagoon, a haven for migratory birds including flamingos and Irrawaddy dolphins. Boat rides available.",
      intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" }
  ],

  "vrindavan": [
    { title: "Banke Bihari Temple", icon: "landmark", where: "Banke Bihari Temple, Vrindavan", hour: 8,
      notes: "The most beloved temple of Vrindavan, dedicated to Lord Krishna. The unique curtain-based darshan and vibrant atmosphere is deeply moving.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "ISKCON Vrindavan", icon: "landmark", where: "ISKCON, Vrindavan", hour: 10,
      notes: "Grand Krishna-Balaram Mandir with exquisite marble work. The evening aarti with mridanga and kirtan is spiritually uplifting.",
      intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Nidhivan sacred grove", icon: "tree-pine", where: "Nidhivan, Vrindavan", hour: 11,
      notes: "A mysterious, dense grove of intertwined trees considered sacred to Krishna. Closes at dusk and is steeped in devotional legend.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Prem Mandir light show", icon: "camera", where: "Prem Mandir, Vrindavan", hour: 19,
      notes: "The stunning white marble Prem Mandir is illuminated beautifully at night. Musical fountains and detailed sculpted panels of Krishna's life.",
      intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Govardhan Hill parikrama", icon: "tree-pine", where: "Govardhan, Vrindavan", hour: 7,
      notes: "The sacred 21 km circumambulation of Govardhan Hill, lifted by Lord Krishna. Devotees walk barefoot or perform dandavat parikrama.",
      intent: ["spiritual","adventure"], faith: ["hindu","any"], party: ["any"], pace: ["deep"], mobility: "walk" }
  ],

  "shirdi": [
    { title: "Sai Baba Temple Darshan", icon: "landmark", where: "Shirdi Sai Baba Samadhi Mandir, Shirdi", hour: 5,
      notes: "The main shrine housing the marble idol and samadhi of Sai Baba of Shirdi. Millions visit annually; early morning darshan is the most serene.",
      intent: ["spiritual"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Dwarkamai Mosque", icon: "landmark", where: "Dwarkamai, Shirdi", hour: 9,
      notes: "The mosque where Sai Baba lived for 60 years. The sacred dhuni fire has been burning continuously since his time.",
      intent: ["spiritual"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Chavadi & Gurusthan", icon: "landmark", where: "Chavadi, Shirdi", hour: 10,
      notes: "Chavadi is where Sai Baba slept on alternate nights; Gurusthan marks the spot of a neem tree under which he was first seen as a young man.",
      intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Lendibaug garden", icon: "tree-pine", where: "Lendibaug, Shirdi", hour: 11,
      notes: "The serene garden developed by Sai Baba himself. He would meditate here daily under a neem tree near an oil lamp he maintained.",
      intent: ["spiritual"], faith: ["any"], party: ["any"], pace: ["short","standard"], mobility: "easy" }
  ],

  "dwarka": [
    { title: "Dwarkadhish Temple", icon: "landmark", where: "Dwarkadhish Temple, Dwarka", hour: 6,
      notes: "The main shrine of Dwarka — one of the four sacred dhams — dedicated to Lord Krishna as Dwarkadhish (King of Dwarka). The 5-storey spire is iconic.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Bet Dwarka island ferry", icon: "waves", where: "Bet Dwarka, Dwarka", hour: 8,
      notes: "Take a ferry to Bet Dwarka island, believed to be the original dwelling of Lord Krishna. The temple here is especially revered.",
      intent: ["spiritual","adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Rukmini Devi Temple", icon: "landmark", where: "Rukmini Temple, Dwarka", hour: 10,
      notes: "A beautifully carved 12th-century temple dedicated to Rukmini, Krishna's principal consort, situated 2km from the main Dwarkadhish temple.",
      intent: ["spiritual","cultural"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Gomti Ghat sunset aarti", icon: "camera", where: "Gomti Ghat, Dwarka", hour: 18,
      notes: "Watch the evening aarti on the banks of the sacred Gomti river where it meets the sea. The sky turns golden over ancient spires.",
      intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" }
  ],

  "mathura": [
    { title: "Krishna Janmabhoomi Temple", icon: "landmark", where: "Krishna Janmabhoomi, Mathura", hour: 7,
      notes: "The birth site of Lord Krishna — a complex of temples and the prison cell where he was born. One of the most sacred sites in Hinduism.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Vishram Ghat Yamuna aarti", icon: "waves", where: "Vishram Ghat, Mathura", hour: 6,
      notes: "The most sacred ghat of Mathura where Krishna rested after slaying Kansa. The daily sunrise and sunset aartis on the Yamuna are beautiful.",
      intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Dwarkadhish Temple Mathura", icon: "landmark", where: "Dwarkadhish Temple, Mathura", hour: 9,
      notes: "A magnificent 19th-century temple with exquisite carvings and a vibrant morning aarti, dedicated to Lord Krishna as Dwarkadhish.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard"], mobility: "easy" },
    { title: "Kansa Qila fort view", icon: "camera", where: "Kansa Qila, Mathura", hour: 11,
      notes: "The ruins of the fort of Kansa, the tyrant king slain by Krishna. Offers sweeping views of the Yamuna ghats.",
      intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" }
  ],

  "pushkar": [
    { title: "Brahma Temple darshan", icon: "landmark", where: "Brahma Temple, Pushkar", hour: 7,
      notes: "One of the very few temples in the world dedicated to Lord Brahma, the creator. The vermilion red spire is iconic against the Pushkar sky.",
      intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Pushkar Lake holy dip", icon: "waves", where: "Pushkar Lake, Pushkar", hour: 6,
      notes: "The sacred Pushkar lake with 52 ghats. A holy dip here is said to cleanse all sins. The lakeside atmosphere at dawn is incredibly serene.",
      intent: ["spiritual"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Savitri Mata Temple hike", icon: "tree-pine", where: "Savitri Mata Temple, Pushkar", hour: 8,
      notes: "A sunrise trek up the hill to the Savitri Mata temple. The panoramic view of Pushkar town, lake, and desert is breathtaking.",
      intent: ["adventure","spiritual"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "trek" },
    { title: "Pushkar Bazaar & camel fair", icon: "shopping-bag", where: "Sadar Bazaar, Pushkar", hour: 11,
      notes: "Browse the colourful bazaar for handicrafts, silver jewellery, tie-dye fabrics, and rose products. During November, the famous camel fair adds camels to the mix!",
      intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" }
  ]
};

// Load and patch cities
global.window = {};
eval(fs.readFileSync('data/cities.js', 'utf8'));
const cities = window.KYT_CITIES;

let patchedCount = 0;
const updated = cities.map(city => {
  if (additionalBeats[city.id]) {
    patchedCount++;
    const newBeats = additionalBeats[city.id].map(b => ({
      ...b,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.where)}`
    }));
    return { ...city, beats: newBeats };
  }
  return city;
});

fs.writeFileSync('data/cities.js', 'window.KYT_CITIES = ' + JSON.stringify(updated, null, 2) + ';');

const totalBeats = updated.reduce((s, c) => s + c.beats.length, 0);
console.log(`Patched ${patchedCount} cities. Total beats: ${totalBeats}.`);
patchedCount > 0 && Object.keys(additionalBeats).forEach(id => {
  const c = updated.find(x => x.id === id);
  if (c) console.log(` ${c.name}: ${c.beats.length} beats — ${c.beats.map(b=>b.title).join(' | ')}`);
});

