const fs = require('fs');
let content = fs.readFileSync('data/cities.js', 'utf8');

content = content.replace(
    /"Expect crowds at the Ram temple\. Book stays ahead in peak season\."/g,
    '"A deeply spiritual city renowned as the birthplace of Lord Rama."'
);
content = content.replace(
    /"Narrow lanes\. A sunrise boat is the classic first morning\."/g,
    '"The spiritual heart of India, famous for its ancient temples and sacred ghats."'
);
content = content.replace(
    /"Sangam is the reason to stop\. Anand Bhavan if you have extra time\."/g,
    '"A holy city marking the magnificent confluence of three sacred rivers."'
);
content = content.replace(
    /"Awadhi food and Nawabi architecture\. Skip on a short run\."/g,
    '"A vibrant city known for its rich Nawabi heritage, culture, and Awadhi cuisine."'
);

fs.writeFileSync('data/cities.js', content);
console.log('City notes updated successfully!');

