const { execSync } = require('child_process');
const fs = require('fs');

const content = fs.readFileSync('C:/Venkatesh/KYT/data/cities.js', 'utf8');
const jsonStr = content.replace('window.KYT_CITIES = ', '').replace(/;\s*$/, '').trim();
let cities;
try {
  cities = eval(jsonStr);
} catch(e) {
  console.error("Failed to parse cities.js", e);
  process.exit(1);
}

const finalData = {};

console.log(`Starting video fetch for ${cities.length} cities...`);

for (let i = 0; i < cities.length; i++) {
  const city = cities[i];
  console.log(`\n[${i+1}/${cities.length}] Searching top 5 English videos for ${city.name}...`);
  
  try {
    const query = `${city.name} travel guide vlog in english`;
    const cmd = `yt-dlp "ytsearch5:${query}" --no-update --dump-json`;
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10, stdio: ['ignore', 'pipe', 'ignore'] });
    
    const lines = output.trim().split('\n');
    const validVideos = [];
    
    lines.forEach(line => {
      if (!line.trim()) return;
      try {
        const data = JSON.parse(line);
        const subs = data.channel_follower_count || 0;
        const views = data.view_count || 0;
        const year = data.upload_date ? parseInt(data.upload_date.substring(0, 4)) : 0;
        
        // Relaxing the rules slightly so we don't end up with 0 videos for smaller cities
        const isReputable = subs > 20000;
        const isPopular = views > 20000;
        const isRecent = year >= 2018;
        
        if (isReputable && isPopular && isRecent) {
          validVideos.push({
            id: data.id,
            title: data.title,
            channel: data.channel,
            views: views,
            subs: subs
          });
        }
      } catch (e) {}
    });
    
    finalData[city.id] = validVideos;
    console.log(`  -> Found ${validVideos.length} valid videos.`);
    
  } catch (err) {
    console.error(`  -> Error fetching for ${city.name}`);
    finalData[city.id] = [];
  }
}

console.log('\nFinished all cities. Writing to data/city_videos_data.js...');
const outputJs = `window.KYT_CITY_VIDEOS = ${JSON.stringify(finalData, null, 2)};\n`;
fs.writeFileSync('C:/Venkatesh/KYT/data/city_videos_data.js', outputJs, 'utf8');
console.log('Successfully saved city_videos_data.js');

