const { execSync } = require('child_process');

function fetchVideos(city) {
  console.log(`\nSearching top 5 videos for ${city}...`);
  try {
    // Run yt-dlp to search for top 5 videos and output JSON
    const query = `${city} travel guide vlog`;
    // Using --no-update to suppress the update warning, and --dump-json to get metadata
    const cmd = `yt-dlp "ytsearch5:${query}" --no-update --dump-json`;
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 });
    
    // yt-dlp outputs one JSON object per line for multiple results
    const lines = output.trim().split('\n');
    const validVideos = [];
    
    lines.forEach(line => {
      if (!line.trim()) return;
      try {
        const data = JSON.parse(line);
        
        // Apply Filters
        const subs = data.channel_follower_count || 0;
        const views = data.view_count || 0;
        const year = data.upload_date ? parseInt(data.upload_date.substring(0, 4)) : 0;
        
        // Filters: >50k subs, >50k views, >= 2021
        const isReputable = subs > 50000;
        const isPopular = views > 50000;
        const isRecent = year >= 2021;
        
        console.log(`- Checking: "${data.title}" by ${data.channel} (Subs: ${subs}, Views: ${views}, Year: ${year})`);
        if (isReputable && isPopular && isRecent) {
          console.log(`  -> PASSED!`);
          validVideos.push({
            id: data.id,
            title: data.title,
            channel: data.channel,
            views: views,
            subs: subs
          });
        } else {
          let reasons = [];
          if (!isReputable) reasons.push("Low Subs");
          if (!isPopular) reasons.push("Low Views");
          if (!isRecent) reasons.push("Too Old");
          console.log(`  -> FAILED: ${reasons.join(', ')}`);
        }
      } catch (e) {
        // ignore parse error
      }
    });
    
    return validVideos;
  } catch (err) {
    console.error(`Error fetching for ${city}:`, err.message);
    return [];
  }
}

const ayodhyaVideos = fetchVideos("Ayodhya");
const ujjainVideos = fetchVideos("Ujjain");

console.log("\n=== FINAL CURATED RESULTS ===");
console.log(JSON.stringify({
  ayodhya: ayodhyaVideos,
  ujjain: ujjainVideos
}, null, 2));
