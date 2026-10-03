const fs = require('fs');


// Rich beats per city - multiple attractions with intent/diet/pace/mobility tags
// so the taste profile filter in virtual-trips.js can actually do its job
const cityBeats = {
  "agra": [
    { title: "Taj Mahal", icon: "landmark", where: "Taj Ganj, Agra", hour: 7, intent: ["cultural","spiritual"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Agra Fort", icon: "landmark", where: "Rakabganj, Agra", hour: 10, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Mehtab Bagh sunset", icon: "camera", where: "Mehtab Bagh, Agra", hour: 17, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard"], mobility: "easy" },
    { title: "Petha & chaat at Kinari Bazaar", icon: "utensils", where: "Kinari Bazaar, Agra", hour: 13, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy", diet: ["veg","satvik","jain","any"] },
    { title: "Fatehpur Sikri", icon: "landmark", where: "Fatehpur Sikri, Agra", hour: 14, intent: ["cultural","adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" }
  ],
  "jaipur": [
    { title: "Amber Fort", icon: "landmark", where: "Devisinghpura, Jaipur", hour: 9, intent: ["cultural","adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "City Palace", icon: "landmark", where: "Tulsi Marg, Jaipur", hour: 11, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Hawa Mahal", icon: "camera", where: "Badi Choupad, Jaipur", hour: 8, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard"], mobility: "easy" },
    { title: "Jantar Mantar observatory", icon: "landmark", where: "Connaught Place, Jaipur", hour: 10, intent: ["cultural","adventure"], faith: ["any"], party: ["any"], pace: ["standard"], mobility: "easy" },
    { title: "Dal baati churma dinner", icon: "utensils", where: "MI Road, Jaipur", hour: 19, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy", diet: ["veg","satvik","jain","any"] },
    { title: "Nahargarh Fort at sunset", icon: "camera", where: "Nahargarh, Jaipur", hour: 17, intent: ["cultural","adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" }
  ],
  "goa": [
    { title: "Baga Beach morning", icon: "waves", where: "Baga, North Goa", hour: 8, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Basilica of Bom Jesus", icon: "landmark", where: "Old Goa", hour: 10, intent: ["cultural","spiritual"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Dudhsagar Falls trek", icon: "tree-pine", where: "Dudhsagar, South Goa", hour: 9, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "trek" },
    { title: "Anjuna Flea Market", icon: "shopping-bag", where: "Anjuna, North Goa", hour: 11, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Seafood thali at a beach shack", icon: "utensils", where: "Calangute, Goa", hour: 13, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["any"] }
  ],
  "varanasi": [
    { title: "Dashashwamedh Ghat morning aarti", icon: "landmark", where: "Dashashwamedh Ghat, Varanasi", hour: 5, intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Sunrise boat ride on the Ganges", icon: "waves", where: "Assi Ghat, Varanasi", hour: 6, intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Kashi Vishwanath Temple", icon: "landmark", where: "Vishwanath Gali, Varanasi", hour: 8, intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Sarnath Buddhist ruins", icon: "landmark", where: "Sarnath, Varanasi", hour: 11, intent: ["cultural","spiritual"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Banarasi thandai & chaat", icon: "utensils", where: "Godowlia, Varanasi", hour: 14, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["veg","satvik","any"] },
    { title: "Ganga Aarti at dusk", icon: "camera", where: "Dashashwamedh Ghat, Varanasi", hour: 19, intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" }
  ],
  "delhi": [
    { title: "Red Fort", icon: "landmark", where: "Lal Qila, Delhi", hour: 9, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Qutub Minar complex", icon: "landmark", where: "Mehrauli, Delhi", hour: 11, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Humayun's Tomb gardens", icon: "tree-pine", where: "Nizamuddin East, Delhi", hour: 10, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Jama Masjid sunrise", icon: "landmark", where: "Chandni Chowk, Delhi", hour: 7, intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard"], mobility: "easy" },
    { title: "Chandni Chowk street food walk", icon: "utensils", where: "Chandni Chowk, Delhi", hour: 8, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk", diet: ["veg","any"] },
    { title: "India Gate & Rajpath", icon: "camera", where: "Rajpath, Delhi", hour: 17, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard"], mobility: "easy" },
    { title: "Lodhi Garden walk", icon: "tree-pine", where: "Lodhi Road, Delhi", hour: 7, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "walk" }
  ],
  "mumbai": [
    { title: "Gateway of India", icon: "landmark", where: "Apollo Bunder, Mumbai", hour: 8, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard"], mobility: "easy" },
    { title: "Marine Drive sunset walk", icon: "waves", where: "Marine Drive, Mumbai", hour: 18, intent: ["adventure","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "walk" },
    { title: "Elephanta Caves ferry", icon: "landmark", where: "Elephanta Island, Mumbai", hour: 9, intent: ["cultural","adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Dharavi neighbourhood walk", icon: "camera", where: "Dharavi, Mumbai", hour: 10, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["deep"], mobility: "walk" },
    { title: "Vada pav at Dadar market", icon: "utensils", where: "Dadar, Mumbai", hour: 8, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["veg","any"] },
    { title: "Haji Ali Dargah", icon: "landmark", where: "Worli, Mumbai", hour: 9, intent: ["spiritual"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" }
  ],
  "udaipur": [
    { title: "City Palace", icon: "landmark", where: "City Palace Rd, Udaipur", hour: 9, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Lake Pichola boat ride", icon: "waves", where: "Bansi Ghat, Udaipur", hour: 17, intent: ["adventure","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Jagdish Temple", icon: "landmark", where: "Temple Rd, Udaipur", hour: 8, intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard"], mobility: "easy" },
    { title: "Sajjangarh Monsoon Palace", icon: "camera", where: "Sajjangarh, Udaipur", hour: 16, intent: ["cultural","adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Dal baati churma dinner", icon: "utensils", where: "Old City, Udaipur", hour: 19, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy", diet: ["veg","satvik","jain","any"] }
  ],
  "ayodhya": [
    { title: "Ram Janmabhoomi Temple", icon: "landmark", where: "Ram Janmabhoomi, Ayodhya", hour: 8, intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Hanuman Garhi", icon: "landmark", where: "Hanuman Garhi, Ayodhya", hour: 10, intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "walk" },
    { title: "Saryu Ghat evening aarti", icon: "waves", where: "Saryu Ghat, Ayodhya", hour: 18, intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Kanak Bhawan palace-temple", icon: "landmark", where: "Kanak Bhawan, Ayodhya", hour: 11, intent: ["cultural","spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Sattvic thali near temple", icon: "utensils", where: "Ayodhya", hour: 13, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["veg","satvik","jain","any"] }
  ],
  "prayagraj": [
    { title: "Triveni Sangam", icon: "waves", where: "Sangam, Prayagraj", hour: 6, intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Anand Bhavan museum", icon: "landmark", where: "Anand Bhavan, Prayagraj", hour: 10, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Allahabad Fort", icon: "landmark", where: "Allahabad Fort, Prayagraj", hour: 12, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Chaat at Civil Lines", icon: "utensils", where: "Civil Lines, Prayagraj", hour: 16, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["veg","any"] }
  ],
  "lucknow": [
    { title: "Bara Imambara", icon: "landmark", where: "Hussainabad, Lucknow", hour: 9, intent: ["cultural","spiritual"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Rumi Darwaza", icon: "camera", where: "Hussainabad, Lucknow", hour: 10, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard"], mobility: "easy" },
    { title: "Hazratganj walk", icon: "shopping-bag", where: "Hazratganj, Lucknow", hour: 11, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Awadhi biryani lunch", icon: "utensils", where: "Chowk, Lucknow", hour: 13, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["any"] },
    { title: "Tunday Kababi", icon: "utensils", where: "Aminabad, Lucknow", hour: 19, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["any"] }
  ],
  "munnar": [
    { title: "Eravikulam National Park", icon: "tree-pine", where: "Eravikulam, Munnar", hour: 8, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Tea Garden walk", icon: "tree-pine", where: "Rajamala, Munnar", hour: 9, intent: ["adventure","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "walk" },
    { title: "Tea Museum", icon: "camera", where: "Nallathanni, Munnar", hour: 11, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard"], mobility: "easy" },
    { title: "Mattupetty Dam & boat", icon: "waves", where: "Mattupetty, Munnar", hour: 14, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Kerala sadya lunch", icon: "utensils", where: "Munnar town", hour: 13, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["veg","satvik","any"] }
  ],
  "manali": [
    { title: "Solang Valley snow/ski", icon: "tree-pine", where: "Solang Valley, Manali", hour: 9, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Hadimba Devi Temple", icon: "landmark", where: "Dungri, Manali", hour: 8, intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Rohtang Pass excursion", icon: "tree-pine", where: "Rohtang Pass, Manali", hour: 7, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Vashisht hot spring temple", icon: "landmark", where: "Vashisht, Manali", hour: 10, intent: ["spiritual","adventure"], faith: ["any"], party: ["any"], pace: ["short","standard"], mobility: "easy" },
    { title: "Tibetan monastery visit", icon: "landmark", where: "The Mall, Manali", hour: 11, intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Rajma chawal at a dhaba", icon: "utensils", where: "Old Manali", hour: 13, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["veg","any"] }
  ],
  "rishikesh": [
    { title: "Triveni Ghat aarti", icon: "landmark", where: "Triveni Ghat, Rishikesh", hour: 6, intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Lakshman Jhula walk", icon: "waves", where: "Lakshman Jhula, Rishikesh", hour: 8, intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "walk" },
    { title: "White water rafting", icon: "waves", where: "Shivpuri, Rishikesh", hour: 10, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Yoga/meditation session", icon: "coffee", where: "Rishikesh ashrams", hour: 7, intent: ["spiritual"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Beatles Ashram", icon: "landmark", where: "Rajaji National Park, Rishikesh", hour: 11, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" }
  ],
  "leh": [
    { title: "Pangong Lake", icon: "waves", where: "Pangong, Leh", hour: 9, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Thiksey Monastery", icon: "landmark", where: "Thiksey, Leh", hour: 8, intent: ["spiritual","cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Magnetic Hill", icon: "camera", where: "Leh-Kargil Hwy, Leh", hour: 10, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["short","standard"], mobility: "easy" },
    { title: "Leh Palace", icon: "landmark", where: "Leh Old Town", hour: 9, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Nubra Valley camel safari", icon: "tree-pine", where: "Hunder, Nubra Valley", hour: 14, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" }
  ],
  "srinagar": [
    { title: "Dal Lake shikara ride", icon: "waves", where: "Dal Lake, Srinagar", hour: 7, intent: ["adventure","cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Shalimar Bagh", icon: "tree-pine", where: "Shalimar, Srinagar", hour: 9, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Nishat Bagh", icon: "tree-pine", where: "Nishat, Srinagar", hour: 10, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Hazratbal Shrine", icon: "landmark", where: "Hazratbal, Srinagar", hour: 8, intent: ["spiritual"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Wazwan feast", icon: "utensils", where: "Srinagar old city", hour: 13, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["any"] }
  ],
  "amritsar": [
    { title: "Golden Temple", icon: "landmark", where: "Golden Temple, Amritsar", hour: 5, intent: ["spiritual"], faith: ["sikh","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Wagah Border ceremony", icon: "camera", where: "Wagah, Amritsar", hour: 17, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Jallianwala Bagh", icon: "landmark", where: "Jallianwala Bagh, Amritsar", hour: 10, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Amritsari kulcha breakfast", icon: "utensils", where: "Lawrence Road, Amritsar", hour: 8, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["veg","any"] },
    { title: "Langar at Golden Temple", icon: "utensils", where: "Golden Temple, Amritsar", hour: 12, intent: ["spiritual","culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["veg","satvik","jain","any"] }
  ],
  "jaisalmer": [
    { title: "Jaisalmer Fort", icon: "landmark", where: "Jaisalmer Fort", hour: 9, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "walk" },
    { title: "Sam Sand Dunes camel safari", icon: "tree-pine", where: "Sam, Jaisalmer", hour: 16, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Patwon ki Haveli", icon: "camera", where: "Patwa Para, Jaisalmer", hour: 10, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Gadisar Lake sunrise", icon: "waves", where: "Gadisar, Jaisalmer", hour: 7, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Dal baati & folk music dinner", icon: "utensils", where: "Desert Camp, Jaisalmer", hour: 19, intent: ["culinary","cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy", diet: ["veg","any"] }
  ],
  "kolkata": [
    { title: "Victoria Memorial", icon: "landmark", where: "Queens Way, Kolkata", hour: 10, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Howrah Bridge walk", icon: "camera", where: "Howrah Bridge, Kolkata", hour: 7, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard"], mobility: "walk" },
    { title: "Dakshineswar Kali Temple", icon: "landmark", where: "Dakshineswar, Kolkata", hour: 8, intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Kalighat Temple", icon: "landmark", where: "Kalighat, Kolkata", hour: 9, intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Kati roll & mishti doi", icon: "utensils", where: "College Street, Kolkata", hour: 13, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["any"] }
  ],
  "mysore": [
    { title: "Mysore Palace light show", icon: "landmark", where: "Mysore Palace, Mysore", hour: 19, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Chamundeshwari Temple", icon: "landmark", where: "Chamundi Hill, Mysore", hour: 7, intent: ["spiritual"], faith: ["hindu","any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Brindavan Gardens", icon: "tree-pine", where: "Brindavan, Mysore", hour: 18, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Devaraja Market walk", icon: "shopping-bag", where: "Sayyaji Rao Rd, Mysore", hour: 10, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Mysore pak & filter coffee", icon: "utensils", where: "Mysore town", hour: 9, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["veg","satvik","any"] }
  ],
  "kochi": [
    { title: "Chinese Fishing Nets at dawn", icon: "camera", where: "Fort Kochi, Kochi", hour: 6, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Mattancherry Palace Museum", icon: "landmark", where: "Mattancherry, Kochi", hour: 9, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Paradesi Synagogue", icon: "landmark", where: "Jew Town, Kochi", hour: 10, intent: ["cultural","spiritual"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Kerala backwater boat cruise", icon: "waves", where: "Vypeen, Kochi", hour: 14, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Kerala seafood thali", icon: "utensils", where: "Fort Kochi", hour: 13, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["any"] }
  ],
  "hampi": [
    { title: "Virupaksha Temple", icon: "landmark", where: "Hampi Bazaar, Hampi", hour: 8, intent: ["spiritual","cultural"], faith: ["hindu","any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Vittala Temple with stone chariot", icon: "landmark", where: "Vittala Temple, Hampi", hour: 9, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Matanga Hill sunrise", icon: "tree-pine", where: "Matanga Hill, Hampi", hour: 6, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "trek" },
    { title: "Hemakuta Hill temples", icon: "camera", where: "Hemakuta Hill, Hampi", hour: 17, intent: ["cultural","adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Coracle ride on Tungabhadra", icon: "waves", where: "Hampi ghat", hour: 7, intent: ["adventure"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" }
  ],
  "hyderabad": [
    { title: "Charminar", icon: "landmark", where: "Charminar, Hyderabad", hour: 9, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy" },
    { title: "Golconda Fort", icon: "landmark", where: "Ibrahim Bagh, Hyderabad", hour: 10, intent: ["cultural","adventure"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" },
    { title: "Ramoji Film City", icon: "camera", where: "Ramoji Film City, Hyderabad", hour: 9, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "easy" },
    { title: "Hyderabadi dum biryani lunch", icon: "utensils", where: "Paradise, Hyderabad", hour: 13, intent: ["culinary"], faith: ["any"], party: ["any"], pace: ["short","standard","deep"], mobility: "easy", diet: ["any"] },
    { title: "Laad Bazaar pearl shopping", icon: "shopping-bag", where: "Laad Bazaar, Hyderabad", hour: 11, intent: ["cultural"], faith: ["any"], party: ["any"], pace: ["standard","deep"], mobility: "walk" }
  ]
};

// Default beats for cities not in the above map (use the single beat that exists)
const content = fs.readFileSync('data/cities.js', 'utf8');
eval(content.replace('window.KYT_CITIES = ', 'globalThis.KYT_CITIES = '));

const updated = KYT_CITIES.map(city => {
  if (cityBeats[city.id]) {
    // Enrich beats with notes from where field
    const enriched = cityBeats[city.id].map(b => ({
      ...b,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.where)}`,
      notes: b.notes || `Visit ${b.title} in ${city.name}.`
    }));
    return { ...city, beats: enriched };
  }
  // For cities without custom beats, ensure existing single beat has full intent array
  return {
    ...city,
    beats: city.beats.map(b => ({
      ...b,
      intent: b.intent || ['spiritual','cultural','adventure','culinary'],
      faith: b.faith || ['any'],
      party: b.party || ['any'],
      pace: b.pace || ['short','standard','deep'],
      mobility: b.mobility || 'easy'
    }))
  };
});

const output = 'window.KYT_CITIES = ' + JSON.stringify(updated, null, 2) + ';';
fs.writeFileSync('data/cities.js', output);

const multibeat = updated.filter(c => c.beats.length > 1);
console.log(`Updated. ${updated.length} cities total. ${multibeat.length} with rich beats. ${updated.length - multibeat.length} with single beat.`);
