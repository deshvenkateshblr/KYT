// scripts/prune_unembeddable_videos.js
// Scans window.KYT_CITY_VIDEOS against YouTube oEmbed endpoint to detect and prune
// videos where embedding has been disabled (HTTP 401) or deleted/made private (HTTP 404).

const https = require('https');
const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../data/city_videos_data.js');
const rawContent = fs.readFileSync(targetPath, 'utf8');
const match = rawContent.match(/window\.KYT_CITY_VIDEOS\s*=\s*(\{[\s\S]*\});/);

if (!match) {
  console.error('Could not parse window.KYT_CITY_VIDEOS in', targetPath);
  process.exit(1);
}

const data = eval('(' + match[1] + ')');
const isDryRun = process.argv.includes('--dry-run');

const allVideos = [];
for (const city in data) {
  for (const v of data[city]) {
    allVideos.push({ city, video: v });
  }
}

console.log(`Starting scan of ${allVideos.length} videos across ${Object.keys(data).length} cities...`);

function checkVideo(item) {
  return new Promise(resolve => {
    const req = https.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(item.video.id)}&format=json`, (res) => {
      res.resume();
      resolve({ ...item, status: res.statusCode, ok: res.statusCode === 200 });
    });
    req.on('error', err => resolve({ ...item, status: 0, ok: false, error: err.message }));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ ...item, status: 408, ok: false, error: 'timeout' });
    });
  });
}

async function run() {
  const batchSize = 25;
  const bad = [];
  const start = Date.now();

  for (let i = 0; i < allVideos.length; i += batchSize) {
    const batch = allVideos.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(checkVideo));
    for (const r of results) {
      if (!r.ok) {
        bad.push(r);
        console.log(`  [${r.status}] Unembeddable: ${r.city} | ${r.video.id} | ${r.video.title}`);
      }
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nScan complete in ${duration}s. Found ${bad.length} unavailable/unembeddable videos.`);

  if (bad.length === 0) {
    console.log('All videos in catalog are embeddable and valid!');
    return;
  }

  const badIdSet = new Set(bad.map(b => b.video.id));
  const cleanedData = {};
  let totalRemaining = 0;

  for (const city in data) {
    cleanedData[city] = data[city].filter(v => !badIdSet.has(v.id));
    totalRemaining += cleanedData[city].length;
  }

  if (isDryRun) {
    console.log(`Dry-run mode: ${bad.length} videos would be removed. ${totalRemaining} videos remaining.`);
    return;
  }

  const outputJs = `window.KYT_CITY_VIDEOS = ${JSON.stringify(cleanedData, null, 2)};\n`;
  fs.writeFileSync(targetPath, outputJs, 'utf8');
  console.log(`Successfully updated ${targetPath}! Pruned ${bad.length} videos. ${totalRemaining} valid videos remain.`);
}

run().catch(err => {
  console.error('Error running video check:', err);
  process.exit(1);
});
