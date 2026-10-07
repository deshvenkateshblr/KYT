const { execSync } = require('child_process');
const fs = require('fs');

const content = fs.readFileSync('C:/Venkatesh/KYT/data/cities.js', 'utf8');
const jsonStr = content.replace('window.KYT_CITIES = ', '').replace(/;\s*$/, '').trim();
let cities = eval(jsonStr);

let videoDataRaw = fs.readFileSync('C:/Venkatesh/KYT/data/city_videos_data.js', 'utf8');
global.window = {};
eval(videoDataRaw);
let finalData = window.KYT_CITY_VIDEOS;

let missingCities = cities.filter(c => !finalData[c.id] || finalData[c.id].length === 0);
console.log(`Found ${missingCities.length} cities lacking videos.`);

for (let i = 0; i < missingCities.length; i++) {
  const city = missingCities[i];
  console.log(`\n[${i+1}/${missingCities.length}] Retrying video fetch for ${city.name} with relaxed rules...`);
  
  let validVideos = [];
  
  // Try 1: Remove "in english", slightly lower thresholds
  try {
    const query = `${city.name} travel guide`;
    const cmd = `yt-dlp "ytsearch10:${query}" --no-update --dump-json`;
    let output = '';
    try {
      output = execSync(cmd, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch (err) {
      if (err.stdout) output = err.stdout;
    }
    
    const lines = output.trim().split('\n');
    
    lines.forEach(line => {
      if (!line.trim()) return;
      try {
        const data = JSON.parse(line);
        const subs = data.channel_follower_count || 0;
        const views = data.view_count || 0;
        
        // Relaxed rules:
        const isReputable = subs > 5000;
        const isPopular = views > 10000;
        
        if (isReputable && isPopular) {
          validVideos.push({
            id: data.id,
            title: data.title,
            channel: data.channel,
            views: views,
            subs: subs,
            language: data.language || 'unknown'
          });
        }
      } catch (e) {}
    });
  } catch (err) {}

  // Try 2: Very loose if still 0
  if (validVideos.length === 0) {
    console.log(`  -> Still 0 videos. Trying very loose rules for ${city.name}...`);
    try {
      const query = `${city.name} tourism tour`;
      const cmd = `yt-dlp "ytsearch5:${query}" --no-update --dump-json`;
      let output = '';
      try {
        output = execSync(cmd, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10, stdio: ['ignore', 'pipe', 'ignore'] });
      } catch (err) {
        if (err.stdout) output = err.stdout;
      }
      
      const lines = output.trim().split('\n');
      
      lines.forEach(line => {
        if (!line.trim()) return;
        try {
          const data = JSON.parse(line);
          const subs = data.channel_follower_count || 0;
          const views = data.view_count || 0;
          
          if (subs > 500 && views > 2000) {
            validVideos.push({
              id: data.id,
              title: data.title,
              channel: data.channel,
              views: views,
              subs: subs,
              language: data.language || 'unknown'
            });
          }
        } catch (e) {}
      });
    } catch (err) {}
  }
  
  finalData[city.id] = validVideos;
  console.log(`  -> Found ${validVideos.length} valid videos.`);
}

console.log('\nFinished missing cities. Updating data/city_videos_data.js...');
const outputJs = `window.KYT_CITY_VIDEOS = ${JSON.stringify(finalData, null, 2)};\n`;
fs.writeFileSync('C:/Venkatesh/KYT/data/city_videos_data.js', outputJs, 'utf8');
console.log('Successfully saved city_videos_data.js');

