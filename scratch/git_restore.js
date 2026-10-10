const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const repoPath = 'C:/Venkatesh/KYT/.git';

function getObjectPath(hash) {
  return path.join(repoPath, 'objects', hash.substring(0, 2), hash.substring(2));
}

function readObject(hash) {
  const p = getObjectPath(hash);
  if (!fs.existsSync(p)) return null;
  const compressed = fs.readFileSync(p);
  const uncompressed = zlib.inflateSync(compressed);
  
  // Format: [type] [size]\0[content]
  const nullIdx = uncompressed.indexOf(0);
  const header = uncompressed.slice(0, nullIdx).toString('utf8');
  const type = header.split(' ')[0];
  const content = uncompressed.slice(nullIdx + 1);
  return { type, content };
}

function parseTree(buffer) {
  const entries = [];
  let i = 0;
  while (i < buffer.length) {
    const spaceIdx = buffer.indexOf(32, i);
    const mode = buffer.slice(i, spaceIdx).toString('utf8');
    const nullIdx = buffer.indexOf(0, spaceIdx);
    const name = buffer.slice(spaceIdx + 1, nullIdx).toString('utf8');
    const hash = buffer.slice(nullIdx + 1, nullIdx + 21).toString('hex');
    entries.push({ mode, name, hash });
    i = nullIdx + 21;
  }
  return entries;
}

// 1. Get HEAD
const headRef = fs.readFileSync(path.join(repoPath, 'HEAD'), 'utf8').trim();
let commitHash;
if (headRef.startsWith('ref: ')) {
  const refPath = path.join(repoPath, headRef.split(' ')[1]);
  commitHash = fs.readFileSync(refPath, 'utf8').trim();
} else {
  commitHash = headRef;
}

// 2. Read Commit
const commitObj = readObject(commitHash);
const commitContent = commitObj.content.toString('utf8');
const treeHash = commitContent.match(/tree ([0-9a-f]{40})/)[1];

// 3. Read Root Tree
const rootTreeObj = readObject(treeHash);
const rootEntries = parseTree(rootTreeObj.content);
const jsEntry = rootEntries.find(e => e.name === 'js');

// 4. Read js Tree
const jsTreeObj = readObject(jsEntry.hash);
const jsEntries = parseTree(jsTreeObj.content);
const vtEntry = jsEntries.find(e => e.name === 'virtual-trips.js');

// 5. Read virtual-trips.js Blob
const vtObj = readObject(vtEntry.hash);
fs.writeFileSync('C:/Venkatesh/KYT/js/virtual-trips.js', vtObj.content.toString('utf8'));
console.log("Restored virtual-trips.js from git!");

