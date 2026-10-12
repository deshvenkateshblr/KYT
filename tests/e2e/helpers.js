'use strict';
/**
 * Shared harness for KYT functional tests.
 *  - serves the repo root over http://127.0.0.1:<port> (service workers need a secure origin)
 *  - launches headless Chromium with a phone-sized viewport and touch
 *  - blocks every non-local request (Google Fonts, pdfmake CDN) so tests are hermetic
 *
 * Env: KYT_CHROMIUM=/path/to/chrome to use a specific browser binary.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('not found'); return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, base: `http://127.0.0.1:${server.address().port}` }));
  });
}

async function launch() {
  const { server, base } = await startServer();
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.KYT_CHROMIUM || undefined
  });
  return { server, browser, base };
}

/** A fresh, isolated phone-sized browser context (empty IndexedDB / localStorage). */
async function newPhone(browser, opts = {}) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    acceptDownloads: true, ...opts
  });
  await context.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith('http://127.0.0.1') || u.startsWith('data:') || u.startsWith('blob:')) return route.continue();
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.errors = errors;
  // Default: accept every confirm()/alert() and remember the text.
  page.dialogs = [];
  page.on('dialog', d => { page.dialogs.push(d.message()); d.accept(); });
  return { context, page };
}

/** Seed the active trip exactly the way store.js persists it (IndexedDB kyt_db/kyt_store). */
async function seedTrip(page, base, { name = 'Seed Trip', notes = '', steps }) {
  await page.goto(base + '/view_trip.html');
  await page.waitForFunction(() => window.KYT && KYT.store && KYT.carousel);
  await page.evaluate(async ({ name, notes, steps }) => {
    KYT.store.setTripName(name);
    KYT.store.setTripNotes(notes);
    KYT.store.setStepsData(steps.map((s, i) => ({
      id: 1000 + i, icon: 'map-pin', where: '', mapUrl: '', notes: '', attachments: [], status: 'todo',
      ...s, targetTime: new Date(s.targetTime)
    })));
    KYT.store.setCurrentIndex(0);
    await KYT.store.saveData();
  }, { name, notes, steps });
  await page.reload();
  await page.waitForFunction(() => window.KYT && KYT.store.get().stepsData.length > 0);
}

const iso = (daysFromNow, hour = 9) => {
  const d = new Date(); d.setDate(d.getDate() + daysFromNow); d.setHours(hour, 0, 0, 0); return d.toISOString();
};

module.exports = { launch, newPhone, seedTrip, iso, ROOT };
