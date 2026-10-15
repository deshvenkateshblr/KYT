'use strict';
/** Virtual trips: hub, city picking, taste filtering, itinerary build, "Use as my trip", share link. */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { launch, newPhone, seedTrip, iso } = require('./helpers');

let env;
before(async () => { env = await launch(); });
after(async () => { await env.browser.close(); env.server.close(); });

async function openHub(page) {
  await page.goto(env.base + '/virtual_trip.html');
  await page.waitForSelector('#vt-new-name');
}
async function createTrip(page, name) {
  await page.fill('#vt-new-name', name);
  await page.click('#btn-vt-create');
  await page.waitForSelector('#vt-screen-canvas:not(.hidden)');
}
async function addCity(page, query, id) {
  await page.fill('#vt-city-search', query);
  await page.click(`.btn-add-city[data-id="${id}"]`);
}
const stored = page => page.evaluate(() => JSON.parse(localStorage.getItem('kyt_virtual_trips') || '[]'));

test('empty hub invites the user to name a trip; blank names are ignored', async () => {
  const { context, page } = await newPhone(env.browser);
  await openHub(page);
  assert.match(await page.locator('#vt-list').innerText(), /Plan Your Dream Trip/);
  await page.click('#btn-vt-create');                   // blank name
  assert.equal((await stored(page)).length, 0);
  await context.close();
});

test('create a trip, add and remove cities; "Generate Day Plan" only appears once a city is chosen', async () => {
  const { context, page } = await newPhone(env.browser);
  await openHub(page);
  await createTrip(page, 'Golden Triangle');
  assert.equal(await page.locator('#btn-vt-build').isHidden(), true);

  await addCity(page, 'Agra', 'agra');
  assert.equal(await page.locator('.vt-selected-city-chip').count(), 1);
  assert.equal(await page.locator('#btn-vt-build').isVisible(), true);
  assert.match(await page.locator('#btn-vt-build').innerText(), /Generate Day Plan/);

  await page.fill('#vt-city-search', '');
  await addCity(page, 'Jaipur', 'jaipur');
  assert.equal(await page.locator('.vt-selected-city-chip').count(), 2);

  await page.locator('.vt-selected-city-chip .btn-del-city').first().click();
  assert.equal(await page.locator('.vt-selected-city-chip').count(), 1);
  const t = (await stored(page))[0];
  assert.equal(t.name, 'Golden Triangle');
  assert.deepEqual(t.cities, ['jaipur']);
  await context.close();
});

test('city search matches alternate names (Kashi finds Varanasi) and an unknown term finds nothing', async () => {
  const { context, page } = await newPhone(env.browser);
  await openHub(page);
  await createTrip(page, 'Search test');
  await page.fill('#vt-city-search', 'kashi');
  assert.equal(await page.locator('#vt-city-list .btn-add-city[data-id="varanasi"]').count(), 1);
  await page.fill('#vt-city-search', 'zzzzqqq');
  assert.equal(await page.locator('#vt-city-list .btn-add-city').count(), 0);
  await context.close();
});

test('exact city name sorts first in search results', async () => {
  const { context, page } = await newPhone(env.browser);
  await openHub(page);
  await createTrip(page, 'Sort test');
  await page.fill('#vt-city-search', 'goa');
  const first = await page.locator('#vt-city-list article[data-city-id]').first().getAttribute('data-city-id');
  assert.equal(first, 'goa');
  await context.close();
});

test('building a plan groups attractions into one Day per city, in the order the cities were added', async () => {
  const { context, page } = await newPhone(env.browser);
  await openHub(page);
  await createTrip(page, 'Two cities');
  await addCity(page, 'Agra', 'agra');
  await page.fill('#vt-city-search', '');
  await addCity(page, 'Jaipur', 'jaipur');
  await page.click('#btn-vt-build');
  await page.waitForSelector('#vt-screen-builder:not(.hidden)');
  const text = await page.locator('#vt-itinerary-list').innerText();
  assert.match(text, /day 0/i); assert.match(text, /day 1/i); assert.match(text, /day 2/i);
  assert.ok(text.indexOf('Agra') < text.indexOf('Jaipur'));
  const trip = (await stored(page))[0];
  assert.ok(trip.steps.length >= 2);
  assert.deepEqual([...new Set(trip.steps.map(s => s.dayId))], [0, 1, 2]);
  assert.equal(trip.steps.filter(s => s.dayId === 1).every(s => s.cityName === 'Agra'), true);
  await context.close();
});

test('taste: Culinary intent keeps food stops and drops sightseeing-only stops', async () => {
  const { context, page } = await newPhone(env.browser);
  await openHub(page);
  await createTrip(page, 'Foodie Agra');
  await page.click('.vt-chip[data-field="intent"][data-id="culinary"]');
  await addCity(page, 'Agra', 'agra');
  await page.click('#btn-vt-build');
  await page.waitForSelector('#vt-screen-builder:not(.hidden)');
  const titles = (await stored(page))[0].steps.map(s => s.title);
  assert.ok(titles.includes('Petha & chaat at Kinari Bazaar'), `got: ${titles.join(' | ')}`);
  assert.ok(!titles.includes('Taj Mahal'), 'Taj Mahal is cultural/spiritual, not culinary');
  await context.close();
});

test('taste: Jain diet never includes a stop that is tagged for other diets only', async () => {
  const { context, page } = await newPhone(env.browser);
  await openHub(page);
  await createTrip(page, 'Jain trip');
  await page.click('.vt-chip[data-field="diet"][data-id="jain"]');
  for (const [q, id] of [['Jaipur', 'jaipur'], ['Varanasi', 'varanasi'], ['Goa', 'goa'], ['Delhi', 'delhi']]) {
    await addCity(page, q, id); await page.fill('#vt-city-search', '');
  }
  await page.click('#btn-vt-build');
  await page.waitForSelector('#vt-screen-builder:not(.hidden)');
  const offenders = await page.evaluate(() => {
    const trip = JSON.parse(localStorage.getItem('kyt_virtual_trips'))[0];
    const bad = [];
    trip.steps.forEach(s => {
      const city = KYT_CITIES.find(c => c.name === s.cityName);
      const beat = city.beats.find(b => b.title === s.title);
      if (beat && beat.diet && beat.diet.length && !beat.diet.includes('jain')) bad.push(s.title);
    });
    return bad;
  });
  assert.deepEqual(offenders, []);
  await context.close();
});

test('"Use as my trip" turns the plan into the live trip, honouring the chosen start date', async () => {
  const { context, page } = await newPhone(env.browser);
  await openHub(page);
  await createTrip(page, 'Agra and Jaipur');
  await addCity(page, 'Agra', 'agra');
  await page.fill('#vt-city-search', '');
  await addCity(page, 'Jaipur', 'jaipur');
  await page.click('#btn-vt-build');
  await page.waitForSelector('#vt-start-date');
  await page.fill('#vt-start-date', '2027-03-15');
  const planned = (await stored(page))[0].steps;
  await page.getByRole('button', { name: /Use as my trip/ }).click();
  await page.waitForURL('**/view_trip.html');
  await page.waitForFunction(() => window.KYT && KYT.store.get().stepsData.length > 0);

  const live = await page.evaluate(() => {
    const s = KYT.store.get();
    return { name: s.tripName, n: s.stepsData.length, steps: s.stepsData.map(x => ({ t: x.title, d: new Date(x.targetTime), st: x.status })) };
  });
  assert.equal(live.name, 'Agra and Jaipur');
  assert.equal(live.n, planned.length);
  const ymd = d => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  assert.equal(ymd(live.steps[0].d), '2027-03-15', 'Day 0 lands on the start date');
  assert.equal(ymd(live.steps.at(-1).d), '2027-03-17', 'Day 2 lands on the subsequent day');
  assert.ok(live.steps.every(s => s.st === 'todo'));
  for (let i = 1; i < live.steps.length; i++) {
    assert.ok(live.steps[i].d > live.steps[i - 1].d, 'steps have strictly increasing timestamps without overlap');
  }
  assert.match(await page.locator('#hero-card').innerText(), new RegExp(planned[0].title.slice(0, 8)));
  await context.close();
});

test('"Use as my trip" with no date defaults to today', async () => {
  const { context, page } = await newPhone(env.browser);
  await openHub(page);
  await createTrip(page, 'Quick');
  await addCity(page, 'Agra', 'agra');
  await page.click('#btn-vt-build');
  await page.waitForSelector('#vt-start-date');
  await page.getByRole('button', { name: /Use as my trip/ }).click();
  await page.waitForURL('**/view_trip.html');
  await page.waitForFunction(() => window.KYT && KYT.store.get().stepsData.length > 0);
  const sameDay = await page.evaluate(() => {
    const d = new Date(KYT.store.get().stepsData[0].targetTime), n = new Date();
    return d.toDateString() === n.toDateString();
  });
  assert.equal(sameDay, true);
  await context.close();
});

test('"Use as my trip" asks before overwriting an existing active trip, and Cancel keeps it', async () => {
  const { context, page } = await newPhone(env.browser);
  await seedTrip(page, env.base, { name: 'Existing Trip', steps: [{ title: 'Keep me', targetTime: iso(2, 9) }] });
  await openHub(page);
  await createTrip(page, 'New plan');
  await addCity(page, 'Agra', 'agra');
  await page.click('#btn-vt-build');
  await page.waitForSelector('#vt-start-date');
  page.removeAllListeners('dialog');
  let asked = '';
  page.on('dialog', d => { asked = d.message(); d.dismiss(); });
  await page.getByRole('button', { name: /Use as my trip/ }).click();
  await page.waitForTimeout(400);
  assert.match(asked, /overwrite your current active trip \("Existing Trip"\)/);
  assert.match(page.url(), /virtual_trip\.html/);
  const name = await page.evaluate(async () => { await KYT.store.loadData(); return KYT.store.get().tripName; });
  assert.equal(name, 'Existing Trip');
  await context.close();
});

test('delete a step in the builder; the edit persists across reload and the trip is marked Built', async () => {
  const { context, page } = await newPhone(env.browser);
  await openHub(page);
  await createTrip(page, 'Edit me');
  await addCity(page, 'Agra', 'agra');
  await page.click('#btn-vt-build');
  await page.waitForSelector('#vt-screen-builder:not(.hidden)');
  const before = (await stored(page))[0].steps.length;
  const firstId = (await stored(page))[0].steps[0].id;
  await page.evaluate(id => window.deleteVirtualTripStep(id), firstId);
  assert.equal((await stored(page))[0].steps.length, before - 1);

  await page.reload();
  await page.waitForSelector('.vt-card');
  assert.match(await page.locator('.vt-card').first().innerText(), /built/i);
  assert.equal((await stored(page))[0].steps.length, before - 1);
  await context.close();
});

test('deleting a trip from the hub removes it for good', async () => {
  const { context, page } = await newPhone(env.browser);
  await openHub(page);
  await createTrip(page, 'Temp');
  await page.goto(env.base + '/virtual_trip.html');
  await page.waitForSelector('.vt-card');
  await page.click('.btn-del-vt');
  assert.equal((await stored(page)).length, 0);
  await context.close();
});

test('opening a shared trip link offers an import, then saves the trip with its cities and taste', async () => {
  const { context, page } = await newPhone(env.browser);
  await page.goto(env.base + '/virtual_trip.html?trip=Friends%20Trip&cities=agr,jai&taste=cvs');
  await page.waitForFunction(() => (JSON.parse(localStorage.getItem('kyt_virtual_trips') || '[]')).length === 1);
  assert.ok(page.dialogs.some(d => /import the shared trip: "Friends Trip"/.test(d)));
  const t = (await stored(page))[0];
  assert.equal(t.name, 'Friends Trip');
  assert.deepEqual(t.cities, ['agra', 'jaipur']);
  assert.deepEqual(t.taste, { intent: 'cultural', diet: 'veg', pace: 'standard' });
  assert.ok(!page.url().includes('cities='), 'share params are cleaned from the URL');
  await context.close();
});

test('declining a shared trip import saves nothing', async () => {
  const { context, page } = await newPhone(env.browser);
  page.removeAllListeners('dialog');
  page.on('dialog', d => d.dismiss());
  await page.goto(env.base + '/virtual_trip.html?trip=No&cities=agr&taste=mas');
  await page.waitForTimeout(500);
  assert.equal((await stored(page)).length, 0);
  await context.close();
});

test('city detail opens from a deep link and shows attractions', async () => {
  const { context, page } = await newPhone(env.browser);
  await page.goto(env.base + '/virtual_trip.html?city=agra');
  await page.waitForFunction(() => /Agra/.test(document.getElementById('cd-title')?.textContent || ''));
  assert.match(await page.locator('#city-detail-panel').innerText(), /Taj Mahal/);
  await context.close();
});
