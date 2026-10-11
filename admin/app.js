/* KYT Admin UI. All AI-supplied text is placed with textContent / value (never innerHTML). */
(function () {
  'use strict';
  var K = window.KYTAdmin;
  var CATALOG = Array.isArray(window.KYT_CITIES) ? window.KYT_CITIES.map(function (c) { return { id: c.id, name: c.name, aliases: c.aliases, lat: c.lat, lng: c.lng }; }) : [];
  var CTX = { catalog: CATALOG, catalogIndex: K.buildCatalogIndex(CATALOG) };
  var LS_IDEAS = 'kyt_admin_ideas_v1', LS_TRIPS = 'kyt_admin_trips_v1', LS_BRIEF = 'kyt_admin_brief_v1', LS_SET = 'kyt_admin_settings_v1';
  var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';

  // ------------------------------------------------------------ storage (always guarded)
  function load(key, fallback) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  var storageOk = true;
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { storageOk = false; renderStatus(); } }

  var state = {
    tab: 'plan',
    trips: [],
    selected: null,
    ideas: [], devMsg: null, ideaMsg: null,
    brief: Object.assign({ originCity: '', originName: '', days: 0, months: [], intents: [], faiths: [], notes: '', target: 'gemini', includeCatalog: true }, load(LS_BRIEF, {})),
    settings: Object.assign({ model: 'gemini-3.8-flash', useMaps: true, lat: '', lng: '', rememberKey: false, apiKey: '' }, load(LS_SET, {})),
    importNotes: {}, paste: '', pasteMsg: null, gemini: { busy: false, msg: null },
    includeDrafts: false, exportMsg: null, importPolicy: 'skip'
  };
  (function init() {
    var saved = load(LS_TRIPS, []);
    if (Array.isArray(saved)) saved.forEach(function (t) { var v = K.validateTrip(t, CTX); if (v.trip && t && t.id) { v.trip.id = String(t.id); state.trips.push(v.trip); } });
    var savedIdeas = load(LS_IDEAS, []);
    if (Array.isArray(savedIdeas)) savedIdeas.forEach(function (i) { var p = K.parseIdeas([i], CTX)[0]; if (p) { p.id = i.id || p.id; if (i.dismissed) p.dismissed = true; state.ideas.push(p); } });
    ['months', 'intents', 'faiths'].forEach(function (k) { if (!Array.isArray(state.brief[k])) state.brief[k] = []; });
    if (!state.settings.rememberKey) state.settings.apiKey = '';
  })();

  function persistTrips() { save(LS_TRIPS, state.trips); }
  function persistBrief() { save(LS_BRIEF, state.brief); }
  function persistSettings() {
    var s = Object.assign({}, state.settings);
    if (!s.rememberKey) s.apiKey = '';
    save(LS_SET, s);
  }

  // ------------------------------------------------------------ tiny DOM helper
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else if (k === 'checked' || k === 'disabled' || k === 'selected') el[k] = !!v;
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { append(el, x); }); return; }
    el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  var seq = 0;
  function field(label, control, hint) {
    var id = 'f' + (++seq);
    control.id = id;
    return h('div', { class: 'field' }, h('label', { class: 'label', for: id, text: label }), control, hint ? h('span', { class: 'hint', text: hint }) : null);
  }
  function select(opts, value, onchange) {
    var s = h('select', { onchange: function () { onchange(s.value); } });
    opts.forEach(function (o) {
      var v = typeof o === 'string' ? o : o[0], l = typeof o === 'string' ? o : o[1];
      s.appendChild(h('option', { value: v, text: l, selected: v === value }));
    });
    return s;
  }
  function chips(list, selected, onchange, labels) {
    var wrap = h('div', { class: 'chips' });
    list.forEach(function (v) {
      var cb = h('input', { type: 'checkbox', checked: selected.indexOf(v) >= 0 });
      var lab = h('label', { class: 'chip' + (cb.checked ? ' on' : '') }, cb, (labels && labels[v]) || String(v));
      cb.addEventListener('change', function () { lab.classList.toggle('on', cb.checked); onchange(v, cb.checked); });
      wrap.appendChild(lab);
    });
    return wrap;
  }
  function toggleIn(arr, v, on) { var i = arr.indexOf(v); if (on && i < 0) arr.push(v); if (!on && i >= 0) arr.splice(i, 1); }
  function btn(text, cls, fn, extra) { return h('button', Object.assign({ type: 'button', class: 'btn ' + (cls || ''), onclick: fn, text: text }, extra || {})); }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 3500);
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { toast('Copied.'); }, function () { toast('Copy was blocked. Select the text and copy it by hand.'); });
    toast('Copy is not available here. Select the text and copy it by hand.');
  }
  function download(name, text) {
    var blob = new Blob([text], { type: 'text/javascript;charset=utf-8' });
    var a = h('a', { href: URL.createObjectURL(blob), download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function issueList(issues) {
    if (!issues.length) return h('p', { class: 'notice ok', text: 'No problems found.' });
    var ul = h('ul', { class: 'issues' });
    issues.forEach(function (i) { ul.appendChild(h('li', { class: i.level }, h('span', { class: 'lvl', text: i.level }), (i.path ? i.path + ': ' : '') + i.msg)); });
    return ul;
  }

  // ------------------------------------------------------------ trips
  function rawForEdit(t) {
    var c = JSON.parse(JSON.stringify(t));
    c.days.forEach(function (d) { d.steps.forEach(function (s) { s.time = K.pad(s.hour) + ':' + K.pad(s.minute); }); });
    return c;
  }
  function validateTrip(t) { return K.validateTrip(t, CTX); }
  function addTrips(rawList, meta, policy) {
    var added = 0, replaced = 0, skipped = 0, firstId = null, reports = [];
    rawList.forEach(function (raw, i) {
      if (raw && typeof raw === 'object') {
        raw = JSON.parse(JSON.stringify(raw));
        if (meta) { raw.generated = Object.assign({}, raw.generated, meta.generated); if (meta.sources && meta.sources.length && !(raw.sources && raw.sources.length)) raw.sources = meta.sources; raw.status = 'draft'; }
      }
      var v = validateTrip(raw);
      if (!v.trip) { reports.push('Item ' + (i + 1) + ': not a trip.'); return; }
      var t = v.trip, ids = state.trips.map(function (x) { return x.id; });
      var existing = t.id ? state.trips.filter(function (x) { return x.id === t.id; })[0] : null;
      if (existing && policy === 'skip') { skipped++; return; }
      if (existing && policy === 'replace') {
        state.trips[state.trips.indexOf(existing)] = t; replaced++; firstId = firstId || t.id; return;
      }
      if (!t.id) t.id = K.makeId(t, ids);
      else if (ids.indexOf(t.id) >= 0) t.id = K.makeId(t, ids);
      if (meta) state.importNotes[t.id] = v.issues.filter(function (x) { return x.level !== 'error'; });
      t.updatedAt = new Date().toISOString();
      state.trips.push(t); added++; firstId = firstId || t.id;
    });
    persistTrips();
    return { added: added, replaced: replaced, skipped: skipped, firstId: firstId, reports: reports };
  }
  function tripById(id) { return state.trips.filter(function (t) { return t.id === id; })[0]; }
  function replaceTrip(id, raw) {
    var v = validateTrip(raw);
    if (!v.trip) return;
    v.trip.id = id; v.trip.updatedAt = new Date().toISOString();
    var i = state.trips.map(function (t) { return t.id; }).indexOf(id);
    if (i >= 0) state.trips[i] = v.trip;
    persistTrips();
  }
  /** Apply an edit to a trip: an approved trip goes back to draft so it has to be looked at again. */
  function edit(id, fn, rerender) {
    var t = tripById(id); if (!t) return;
    var raw = rawForEdit(t); fn(raw);
    if (raw.status === 'approved') raw.status = 'draft';
    replaceTrip(id, raw);
    if (rerender !== false) render();
  }

  // ------------------------------------------------------------ views
  // ---- Gemini (shared by ideas, itineraries and variations)
  async function callGemini(prompt) {
    var s = state.settings;
    if (!s.apiKey.trim()) throw new Error('Add a Gemini API key under "AI connection" first.');
    var body = { model: s.model.trim() || 'gemini-3.8-flash', input: prompt };
    if (s.useMaps) {
      var tool = { type: 'google_maps' }, o = CTX.catalogIndex.byId[state.brief.originCity];
      var la = parseFloat(s.lat !== '' ? s.lat : (o && o.lat)), lo = parseFloat(s.lng !== '' ? s.lng : (o && o.lng));
      if (isFinite(la) && isFinite(lo)) { tool.latitude = la; tool.longitude = lo; }
      body.tools = [tool];
    }
    var ctl = new AbortController(), timer = setTimeout(function () { ctl.abort(); }, 240000);
    try {
      var res = await fetch(GEMINI_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': s.apiKey.trim() }, body: JSON.stringify(body), signal: ctl.signal });
      var data = null, raw = '';
      try { raw = await res.text(); data = JSON.parse(raw); } catch (e) { /* non-JSON body */ }
      if (!res.ok) {
        var em = data && data.error && data.error.message ? String(data.error.message) : raw.slice(0, 200);
        throw new Error('Gemini returned ' + res.status + (em ? ': ' + K.cleanTo(em, 300) : '') + '.');
      }
      var text = K.extractGeminiText(data);
      if (!text) throw new Error('Gemini answered but no text could be found in the response. Check the model name, or use copy and paste.');
      return { text: text, model: body.model, sources: K.extractSources(data) };
    } catch (e) {
      if (e && e.name === 'AbortError') throw new Error('Timed out after 4 minutes.');
      if (e instanceof TypeError) throw new Error('Could not reach Gemini (network, blocked request, or an invalid key format).');
      throw e;
    } finally { clearTimeout(timer); }
  }

  function ingest(text, meta, tweak) {
    var parsed = K.extractJson(text);
    var list = K.toTripList(parsed.value);
    if (!list.length) throw new Error('The JSON had no trips in it.');
    if (tweak) list = list.map(function (t) { return t && typeof t === 'object' ? tweak(Object.assign({}, t)) : t; });
    var r = addTrips(list, meta, 'rename');
    r.notes = parsed.notes;
    return r;
  }
  function summaryMsg(r) {
    var parts = [];
    if (r.added) parts.push(r.added + ' added as draft');
    if (r.replaced) parts.push(r.replaced + ' replaced');
    if (r.skipped) parts.push(r.skipped + ' skipped (already in library)');
    var m = parts.join(', ') || 'Nothing was added';
    if (r.notes && r.notes.length) m += '. Cleanup: ' + r.notes.join(' ').replace(/\.+$/, '');
    if (r.reports && r.reports.length) m += '. ' + r.reports.join(' ');
    return m.replace(/\.+$/, '') + '.';
  }
  function geminiMeta(g) { return { generated: { via: 'gemini-api', model: g.model, at: new Date().toISOString() }, sources: g.sources }; }
  function developed(idea) { return state.trips.some(function (t) { return t.ideaId === idea.id; }); }
  function promptBrief(extra) { return Object.assign({}, state.brief, { variant: state.brief.target === 'other' ? 'generic' : 'gemini' }, extra || {}); }

  function aiCard() {
    var s = state.settings, origin = CTX.catalogIndex.byId[state.brief.originCity];
    return h('details', { class: 'card', open: !s.apiKey }, h('summary', { text: 'AI connection (only needed to call Gemini from this page)' }),
      h('p', { class: 'hint', text: 'The request goes from your browser straight to Google. The key is kept in memory only unless you tick the box.' }),
      h('div', { class: 'grid cols-3' },
        field('API key', h('input', { type: 'password', autocomplete: 'off', value: s.apiKey, oninput: function (e) { s.apiKey = e.target.value; persistSettingsDeferred(); } })),
        field('Model', h('input', { type: 'text', value: s.model, oninput: function (e) { s.model = e.target.value; persistSettingsDeferred(); } }), 'Use any Gemini model your key can access.'),
        h('div', { class: 'field' }, h('span', { class: 'label', text: 'Key storage' }),
          h('label', { class: 'chip' + (s.rememberKey ? ' on' : '') }, h('input', { type: 'checkbox', checked: s.rememberKey, onchange: function (e) { s.rememberKey = e.target.checked; persistSettings(); render(); } }), 'Remember key in this browser'))),
      s.rememberKey ? h('p', { class: 'notice', text: 'The key is stored unencrypted in this browser. Only tick this on a machine you trust.' }) : null,
      h('label', { class: 'chip' + (s.useMaps ? ' on' : '') }, h('input', { type: 'checkbox', checked: s.useMaps, onchange: function (e) { s.useMaps = e.target.checked; persistSettings(); render(); } }), 'Ground answers with Google Maps' + (origin && origin.lat != null ? ' (centred on ' + origin.name + ')' : '')),
      h('p', { class: 'hint', text: 'Maps-grounded output has attribution rules. Check Google\'s current terms before publishing trips built from it.' }));
  }

  function viewPlan() {
    var b = state.brief, root = h('div');
    function refresh() {
      persistBrief();
      if (!menuTa) return;
      menuText = K.buildMenuPrompt(promptBrief(), CTX); menuTa.value = menuText; menuInfo.textContent = 'A menu of about 12 short ideas with tags, no itineraries yet. ' + menuText.length + ' characters.';
    }
    function set(k, v) { b[k] = v; refresh(); }
    root.appendChild(h('h2', { text: 'Plan' }));
    root.appendChild(h('p', { class: 'lead', text: 'Two steps. First ask the AI for a menu of ideas, already tagged so KYT can filter them. Then develop only the ideas you like, one itinerary at a time. One trip per answer keeps the detail high.' }));

    var originOpts = [['', 'Choose a city']].concat(CATALOG.map(function (c) { return [c.id, c.name]; }));
    var showFaith = b.intents.indexOf('spiritual') >= 0;
    root.appendChild(h('div', { class: 'card' }, h('h3', { text: 'Brief' }),
      h('div', { class: 'grid cols-3' },
        field('Starting city', CATALOG.length ? select(originOpts, b.originCity, function (v) { set('originCity', v); render(); }) : h('input', { type: 'text', value: b.originName || '', oninput: function (e) { set('originName', e.target.value); } }), 'The trips start and end here.'),
        field('Trip length', select([['0', 'Mix of weekend and long weekend'], ['2', '2 days (weekend)'], ['3', '3 days'], ['4', '4 days'], ['5', '5 days']], String(b.days || 0), function (v) { set('days', parseInt(v, 10) || 0); }), 'Weekend is 2 days, long weekend is 3 or more. KYT labels each trip from its real length.'),
        field('I will paste into', select([['gemini', 'Gemini (with Google Maps)'], ['other', 'Another AI']], b.target || 'gemini', function (v) { set('target', v); render(); }), 'Changes the wording of the prompt. Calling Gemini from this page always uses the Gemini wording.')),
      h('div', { class: 'field' }, h('span', { class: 'label', text: 'Months (optional)' }), chips([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], b.months, function (v, on) { toggleIn(b.months, v, on); refresh(); }, K.MONTH_NAMES.reduce(function (o, n, i) { o[i + 1] = n.slice(0, 3); return o; }, {})), h('span', { class: 'hint', text: 'Leave empty and the AI gives the best months for each idea.' })),
      h('div', { class: 'field' }, h('span', { class: 'label', text: 'Focus (optional)' }), chips(['spiritual', 'cultural', 'adventure', 'culinary'], b.intents, function (v, on) { toggleIn(b.intents, v, on); refresh(); if (v === 'spiritual') render(); }), h('span', { class: 'hint', text: 'Leave empty for a varied menu. The AI tags every idea with its own interest either way.' })),
      showFaith ? h('div', { class: 'field' }, h('span', { class: 'label', text: 'Faith' }), chips(K.FAITHS, b.faiths, function (v, on) { toggleIn(b.faiths, v, on); refresh(); }), h('span', { class: 'hint', text: 'Choose the faiths whose places to centre the spiritual trips on. Leave empty to include all.' })) : null,
      field('Anything else', h('textarea', { rows: 3, oninput: function (e) { set('notes', e.target.value); } }, b.notes), 'Free text for the AI: travellers, budget, food, how far, places to include or avoid.'),
      h('details', null, h('summary', { text: 'Prompt options' }),
        h('label', { class: 'chip' + (b.includeCatalog ? ' on' : '') }, h('input', { type: 'checkbox', checked: b.includeCatalog, onchange: function (e) { set('includeCatalog', e.target.checked); render(); } }), 'Include the KYT city id list in prompts (longer, but cities match KYT)'))));

    root.appendChild(aiCard());

    // step 1
    var menuText = K.buildMenuPrompt(promptBrief(), CTX), menuTa = null, menuInfo = null;
    var imsg = h('div'), ig = h('div');
    function showMsg(el, m) { el.textContent = ''; if (m) el.appendChild(h('p', { class: 'notice ' + m.kind, text: m.text })); }
    showMsg(imsg, state.ideaMsg); state.ideaMsg = null;
    function takeIdeas(text) {
      var parsed = K.extractJson(text), ideas = K.parseIdeas(parsed.value, CTX);
      if (!ideas.length) throw new Error('No ideas found in that answer. The ideas answer is a JSON object with an "ideas" list.');
      var have = state.ideas.map(function (i) { return i.id; }), titles = state.ideas.map(function (i) { return i.title.toLowerCase(); }), added = 0;
      ideas.forEach(function (i) { if (titles.indexOf(i.title.toLowerCase()) >= 0) return; titles.push(i.title.toLowerCase()); var base = i.id, n = 2; while (have.indexOf(i.id) >= 0) i.id = base + '-' + (n++); have.push(i.id); state.ideas.push(i); added++; });
      save(LS_IDEAS, state.ideas);
      if (!added) throw new Error('Those ideas are already in the list.');
      return added;
    }
    var pasteArea = h('textarea', { class: 'mono', rows: 6, placeholder: 'Paste the ideas answer here.' });
    var geminiIdeas = btn('Get ideas with Gemini', 'primary', async function () {
      geminiIdeas.disabled = true; showMsg(imsg, { kind: '', text: 'Asking Gemini. This can take a minute.' });
      try {
        var g = await callGemini(K.buildMenuPrompt(promptBrief({ variant: 'gemini' }), CTX));
        var n = takeIdeas(g.text); state.ideaMsg = { kind: 'ok', text: n + ' ideas added.' };
      } catch (e) { state.ideaMsg = { kind: 'err', text: e.message }; }
      render();
    });
    root.appendChild(h('div', { class: 'card' }, h('h3', { text: 'Step 1: ask for ideas' }),
      (menuInfo = h('p', { class: 'hint', text: 'A menu of about 12 short ideas with tags, no itineraries yet. ' + menuText.length + ' characters.' })),
      (menuTa = h('textarea', { class: 'mono', readonly: true, rows: 6, 'aria-label': 'Ideas prompt' }, menuText)),
      h('div', { class: 'row', style: 'margin:8px 0' }, btn('Copy prompt', 'primary', function () { copyText(menuTa.value); }), geminiIdeas),
      h('h4', { text: 'Paste the answer' }), pasteArea, imsg,
      h('div', { class: 'row', style: 'margin-top:8px' }, btn('Read ideas', '', function () {
        try { var n = takeIdeas(pasteArea.value); state.ideaMsg = { kind: 'ok', text: n + ' ideas added.' }; render(); }
        catch (e) { state.ideaMsg = { kind: 'err', text: e.message }; showMsg(imsg, state.ideaMsg); }
      }))));

    // step 2
    var live = state.ideas.filter(function (i) { return !i.dismissed; });
    var gmsg = h('div');
    showMsg(gmsg, state.devMsg); state.devMsg = null;
    var list = h('div', { class: 'list' });
    live.forEach(function (idea) {
      var tags = [idea.track, idea.days + ' days', idea.intent, idea.faiths.join('/'), idea.pace, idea.budget, idea.mode, idea.approxTravelHours ? '~' + idea.approxTravelHours + ' h' : '',
        idea.bestMonths.length ? idea.bestMonths.map(function (m) { return K.MONTH_NAMES[m - 1].slice(0, 3); }).join(' ') : ''].filter(Boolean).join(' · ');
      var prompt = function () { return K.buildPrompt(promptBrief({ idea: idea }), CTX); };
      var done = developed(idea), run = btn('Develop with Gemini', 'small primary', async function () {
        run.disabled = true; showMsg(gmsg, { kind: '', text: 'Developing "' + idea.title + '" with Gemini. This can take a minute.' });
        try {
          var g = await callGemini(K.buildPrompt(promptBrief({ idea: idea, variant: 'gemini' }), CTX));
          var r = ingest(g.text, geminiMeta(g), function (t) { t.ideaId = idea.id; return t; });
          state.selected = r.firstId || state.selected; state.devMsg = { kind: 'ok', text: '"' + idea.title + '": ' + summaryMsg(r) };
        } catch (e) { state.devMsg = { kind: 'err', text: '"' + idea.title + '": ' + e.message }; }
        render();
      });
      list.appendChild(h('div', { class: 'step' },
        h('div', { class: 'row', style: 'justify-content:space-between' }, h('strong', { text: idea.title }), done ? h('span', { class: 'pill approved', text: 'in library' }) : null),
        h('p', { style: 'margin:4px 0', text: idea.pitch }), h('p', { class: 'hint', style: 'margin:0 0 8px', text: tags }),
        h('div', { class: 'row' }, btn('Copy itinerary prompt', 'small', function () { copyText(prompt()); }), run,
          btn('Dismiss', 'small danger', function () { idea.dismissed = true; save(LS_IDEAS, state.ideas); render(); }))));
    });
    root.appendChild(h('div', { class: 'card' }, h('h3', { text: 'Step 2: develop the ideas you like' }),
      live.length ? h('p', { class: 'hint', text: 'Copy the itinerary prompt for an idea into your AI, then paste the answer in "Bring in AI output". Or let Gemini do it here.' }) : h('p', { class: 'empty', text: 'No ideas yet. Do step 1 first.' }),
      gmsg, list,
      live.length < state.ideas.length ? h('p', { class: 'hint' }, (state.ideas.length - live.length) + ' dismissed. ', btn('Restore all', 'small', function () { state.ideas.forEach(function (i) { delete i.dismissed; }); save(LS_IDEAS, state.ideas); render(); })) : null,
      state.ideas.length ? h('div', { class: 'row right' }, btn('Clear all ideas', 'small danger', function () { if (confirm('Remove all ideas? Trips already in the library are kept.')) { state.ideas = []; save(LS_IDEAS, state.ideas); render(); } })) : null));
    return root;
  }

  function viewImport() {
    var root = h('div');
    root.appendChild(h('h2', { text: 'Bring in AI output' }));
    root.appendChild(h('p', { class: 'lead', text: 'Paste an itinerary answer from the AI. Everything that comes in is a draft; nothing reaches KYT until you review and approve it.' }));
    var ta = h('textarea', { class: 'mono', rows: 14, placeholder: 'Paste the AI answer here. Code fences and extra text around the JSON are fine.', oninput: function (e) { state.paste = e.target.value; } }, state.paste);
    var msg = h('div', { id: 'paste-msg' });
    function showPasteMsg() { msg.textContent = ''; if (state.pasteMsg) msg.appendChild(h('p', { class: 'notice ' + state.pasteMsg.kind, text: state.pasteMsg.text })); }
    showPasteMsg();
    root.appendChild(h('div', { class: 'card' }, ta, msg,
      h('div', { class: 'row', style: 'margin-top:8px' }, btn('Read and check', 'primary', function () {
        try {
          var r = ingest(state.paste, { generated: { via: 'paste', at: new Date().toISOString() } });
          state.pasteMsg = { kind: 'ok', text: summaryMsg(r) }; state.paste = ''; state.selected = r.firstId || state.selected; showPasteMsg(); ta.value = '';
          toast('Added to review.'); renderTabs();
        } catch (e) { state.pasteMsg = { kind: 'err', text: e.message }; showPasteMsg(); }
      }), btn('Review drafts', '', function () { go('review'); }))));
    return root;
  }
  var settingsTimer;
  function persistSettingsDeferred() { clearTimeout(settingsTimer); settingsTimer = setTimeout(persistSettings, 400); }

  // ---- review
  function tripPill(t, v) {
    return h('span', { class: 'pill ' + (v.errors ? 'err' : t.status === 'approved' ? 'approved' : 'draft'), text: v.errors ? v.errors + ' error' + (v.errors > 1 ? 's' : '') : t.status });
  }
  function viewReview() {
    var root = h('div');
    root.appendChild(h('h2', { text: 'Review and edit' }));
    root.appendChild(h('p', { class: 'lead', text: 'Check every place, time and map link. Anything under "verify" is something the AI was unsure about. Approve a trip only when you have checked it. Editing an approved trip returns it to draft.' }));
    if (!state.trips.length) { root.appendChild(h('div', { class: 'card empty', text: 'No trips yet. Generate a prompt, then bring in the AI answer.' })); return root; }
    if (!tripById(state.selected)) state.selected = state.trips[0].id;
    var list = h('div', { class: 'list', role: 'list' });
    state.trips.forEach(function (t) {
      var v = validateTrip(t);
      list.appendChild(h('button', { type: 'button', class: 'item', 'aria-current': t.id === state.selected ? 'true' : 'false', onclick: function () { state.selected = t.id; render(); } },
        h('span', { class: 't', text: t.title || '(untitled)' }), h('span', { class: 'm' }, (t.originName || '?') + ' · ' + t.kind + ' · ' + t.durationDays + 'd ', tripPill(t, v))));
    });
    root.appendChild(h('div', { class: 'split' }, list, editor(tripById(state.selected))));
    return root;
  }

  function editor(t) {
    var v = validateTrip(t), id = t.id, wrap = h('div');
    function txt(label, get, setf, opts) {
      opts = opts || {};
      var el = opts.area ? h('textarea', { rows: opts.rows || 2 }, get()) : h('input', { type: 'text', value: get() });
      el.addEventListener('change', function () { edit(id, function (r) { setf(r, el.value); }); });
      return field(label, el, opts.hint);
    }
    // header card
    var head = h('div', { class: 'card' },
      h('div', { class: 'row', style: 'justify-content:space-between' }, h('h3', { text: 'Trip' }), h('div', { class: 'row' }, tripPill(t, v),
        t.generated && t.generated.via ? h('span', { class: 'hint', text: 'via ' + t.generated.via + (t.generated.model ? ' (' + t.generated.model + ')' : '') }) : null)),
      h('div', { class: 'grid cols-2' },
        txt('Title', function () { return t.title; }, function (r, x) { r.title = x; }),
        txt('Tagline', function () { return t.tagline; }, function (r, x) { r.tagline = x; })),
      h('div', { class: 'grid cols-4' },
        field('Type', select(K.KINDS, t.kind, function (x) { edit(id, function (r) { r.kind = x; }); })),
        field('Starting city', CATALOG.length ? select([['', '(not in catalog)']].concat(CATALOG.map(function (c) { return [c.id, c.name]; })), t.originCity, function (x) { edit(id, function (r) { r.originCity = x; if (!x) r.originName = t.originName; }); }) : h('input', { type: 'text', value: t.originName, disabled: true })),
        txt('Best months', function () { return t.bestMonths.map(function (m) { return K.MONTH_NAMES[m - 1].slice(0, 3); }).join(', '); }, function (r, x) { r.bestMonths = x; }, { hint: 'For example: Oct, Nov, Dec, Jan' }),
        field('Budget', select(K.BUDGETS, t.budget, function (x) { edit(id, function (r) { r.budget = x; }); }))),
      h('div', { class: 'grid cols-3' },
        field('Interest', select(K.INTENTS, t.taste.intent, function (x) { edit(id, function (r) { r.taste.intent = x; }); })),
        field('Food', select(K.DIETS, t.taste.diet, function (x) { edit(id, function (r) { r.taste.diet = x; }); })),
        field('Pace', select(K.PACES, t.taste.pace, function (x) { edit(id, function (r) { r.taste.pace = x; }); }))),
      h('div', { class: 'grid cols-3' },
        field('Getting there', select(K.MODES, t.transport.mode, function (x) { edit(id, function (r) { r.transport.mode = x; }); })),
        txt('Travel hours one way', function () { return t.transport.approxTravelHours == null ? '' : String(t.transport.approxTravelHours); }, function (r, x) { r.transport.approxTravelHours = x; }),
        txt('Transport note', function () { return t.transport.note; }, function (r, x) { r.transport.note = x; })),
      h('div', { class: 'grid cols-3' },
        txt('Track (theme label)', function () { return t.track; }, function (r, x) { r.track = x; }, { hint: 'For example: Hill escape, Temple trail' }),
        h('div', { class: 'field' }, h('span', { class: 'label', text: 'Faiths' }), chips(K.FAITHS, t.faiths, function (v, on) { edit(id, function (r) { r.faiths = (r.faiths || []).slice(); toggleIn(r.faiths, v, on); }); })),
        h('div', { class: 'field' }, h('span', { class: 'label', text: 'Suits' }), chips(K.AUDIENCES, t.audience, function (v, on) { edit(id, function (r) { r.audience = (r.audience || []).slice(); toggleIn(r.audience, v, on); }); }))),
      txt('Highlights (one per line)', function () { return t.highlights.join('\n'); }, function (r, x) { r.highlights = x; }, { area: true, rows: 3 }),
      txt('Tips (one per line)', function () { return t.tips.join('\n'); }, function (r, x) { r.tips = x; }, { area: true, rows: 3 }),
      t.sources.length ? h('details', null, h('summary', { text: 'Sources reported by the AI (' + t.sources.length + ')' }),
        h('ul', null, t.sources.map(function (s) { return h('li', null, h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.name })); }))) : null);
    wrap.appendChild(head);

    // issues
    wrap.appendChild(h('div', { class: 'card' }, h('h3', { text: 'Checks' }), issueList(v.issues)));
    var twist = h('input', { type: 'text', list: 'twists', placeholder: 'What should change? Pick a suggestion or type your own', maxlength: 400 });
    var vmsg = h('div'), twistList = h('datalist', { id: 'twists' }, ['Slower pace, fewer stops', 'Vegetarian and Jain friendly', 'Budget version', 'With young children', 'For a couple', 'More adventure', 'Same place in a different season'].map(function (x) { return h('option', { value: x }); }));
    var vrun = btn('Make with Gemini', 'primary', async function () {
      vrun.disabled = true; vmsg.textContent = ''; vmsg.appendChild(h('p', { class: 'notice', text: 'Asking Gemini. This can take a minute.' }));
      try {
        var g = await callGemini(K.buildVariationPrompt(t, twist.value, promptBrief({ originCity: t.originCity, originName: t.originName, variant: 'gemini' }), CTX));
        var r = ingest(g.text, geminiMeta(g), function (x) { x.variantOf = t.id; x.ideaId = t.ideaId || t.id; return x; });
        state.selected = r.firstId || state.selected; toast('Variation added as draft.'); render();
      } catch (e) { vmsg.textContent = ''; vmsg.appendChild(h('p', { class: 'notice err', text: e.message })); vrun.disabled = false; }
    });
    wrap.appendChild(h('details', { class: 'card' }, h('summary', { text: 'Make a variation of this trip' }),
      h('p', { class: 'hint', text: 'Writes a prompt that keeps this trip as the starting point and changes only what you ask. The answer comes back as a new draft.' }),
      twist, twistList, vmsg,
      h('div', { class: 'row', style: 'margin-top:8px' }, btn('Copy prompt', '', function () { copyText(K.buildVariationPrompt(t, twist.value, promptBrief({ originCity: t.originCity, originName: t.originName }), CTX)); }), vrun)));
    var notes = state.importNotes[id];
    if (notes && notes.length) wrap.appendChild(h('details', { class: 'card' }, h('summary', { text: 'What the tool changed when this was imported (' + notes.length + ')' }), issueList(notes)));

    // Before you go / Special days
    function rowList(title, hint, items, makeRow, addLabel, blank, field) {
      var box = h('div', { class: 'card' }, h('div', { class: 'row', style: 'justify-content:space-between' }, h('h3', { text: title }), btn(addLabel, 'small', function () { edit(id, function (r) { r[field] = (r[field] || []).concat([blank]); }); })), h('p', { class: 'hint', text: hint }));
      if (!items.length) box.appendChild(h('p', { class: 'hint', text: 'None yet.' }));
      items.forEach(function (it, i) { box.appendChild(makeRow(it, i)); });
      return box;
    }
    function bind(el, field, i, key) { el.addEventListener('change', function () { edit(id, function (r) { r[field][i][key] = el.value; }); }); return el; }
    function remove(field, i) { return btn('Remove', 'small danger', function () { edit(id, function (r) { r[field].splice(i, 1); }); }); }
    wrap.appendChild(rowList('Before you go', 'Things a traveller must sort out first: bookings, ID, dress code, phone and camera rules, permits.', t.beforeYouGo, function (it, i) {
      return h('div', { class: 'step' }, h('div', { class: 'step-grid', style: 'grid-template-columns:150px 1fr' }, field('Type', bind(select(K.BYG_TYPES, it.type, function () {}), 'beforeYouGo', i, 'type')), field('What to do', bind(h('input', { type: 'text', value: it.text }), 'beforeYouGo', i, 'text'))), h('div', { class: 'row right' }, remove('beforeYouGo', i)));
    }, 'Add item', { type: 'other', text: 'New item' }, 'beforeYouGo'));
    wrap.appendChild(rowList('Special days', 'Festivals, special darshan or seva days, weekly specials, closures and crowd peaks. Many follow the lunar calendar: give the occasion and usual months, and confirm with the temple.', t.specialDays, function (it, i) {
      return h('div', { class: 'step' }, h('div', { class: 'step-grid', style: 'grid-template-columns:1fr 1fr 150px' },
        field('Occasion', bind(h('input', { type: 'text', value: it.name }), 'specialDays', i, 'name')), field('When', bind(h('input', { type: 'text', value: it.when }), 'specialDays', i, 'when')),
        field('Effect', bind(select(K.DAY_EFFECTS, it.effect, function () {}), 'specialDays', i, 'effect'))),
        field('What it means for a visitor', bind(h('input', { type: 'text', value: it.note }), 'specialDays', i, 'note')), h('div', { class: 'row right' }, remove('specialDays', i)));
    }, 'Add special day', { name: 'New special day', when: '', effect: 'other', note: '' }, 'specialDays'));

    // days
    t.days.forEach(function (d, di) {
      var day = h('div', { class: 'day' }, h('div', { class: 'row', style: 'justify-content:space-between' }, h('h4', { text: 'Day ' + d.day + (d.cityName ? ' · ' + d.cityName : '') }),
        btn('Add step', 'small', function () { edit(id, function (r) { r.days[di].steps.push({ time: '12:00', title: 'New step', where: '', icon: 'map-pin', notes: '', verify: [] }); }); })));
      day.appendChild(txt('Day title', function () { return d.title; }, function (r, x) { r.days[di].title = x; }));
      d.steps.forEach(function (s, si) {
        var ic = select(K.ICONS.concat(K.TRAVEL_ICONS.filter(function (x) { return K.ICONS.indexOf(x) < 0; })), s.icon, function (x) { edit(id, function (r) { r.days[di].steps[si].icon = x; }); });
        var time = h('input', { type: 'time', value: K.pad(s.hour) + ':' + K.pad(s.minute) });
        time.addEventListener('change', function () { if (time.value) edit(id, function (r) { r.days[di].steps[si].time = time.value; }); });
        var title = h('input', { type: 'text', value: s.title }), where = h('input', { type: 'text', value: s.where });
        title.addEventListener('change', function () { edit(id, function (r) { var st = r.days[di].steps[si]; st.title = title.value; if (st.mapsAuto) { st.mapsUrl = ''; delete st.mapsAuto; } }); });
        where.addEventListener('change', function () { edit(id, function (r) { var st = r.days[di].steps[si]; st.where = where.value; if (st.mapsAuto) { st.mapsUrl = ''; delete st.mapsAuto; } }); });
        var map = h('input', { type: 'text', value: s.mapsUrl });
        map.addEventListener('change', function () { edit(id, function (r) { var st = r.days[di].steps[si]; st.mapsUrl = map.value; delete st.mapsAuto; }); });
        var notes = h('textarea', { rows: 2 }, s.notes), verify = h('textarea', { rows: 2 }, s.verify.join('\n'));
        notes.addEventListener('change', function () { edit(id, function (r) { r.days[di].steps[si].notes = notes.value; }); });
        verify.addEventListener('change', function () { edit(id, function (r) { r.days[di].steps[si].verify = verify.value; }); });
        var st = h('div', { class: 'step' },
          h('div', { class: 'step-grid' }, field('Time', time), field('Title', title), field('Place', where), field('Icon', ic)),
          field('Map link' + (s.mapsAuto ? ' (search link made by this tool)' : ''), map),
          h('div', { class: 'grid cols-2' }, field('Notes', notes), field('Verify before publishing (one per line)', verify)),
          h('div', { class: 'row right' },
            s.mapsUrl ? h('a', { class: 'hint', href: s.mapsUrl, target: '_blank', rel: 'noopener noreferrer', text: 'Open map link' }) : null,
            btn('Remove step', 'small danger', function () { edit(id, function (r) { r.days[di].steps.splice(si, 1); }); })));
        day.appendChild(st);
      });
      wrap.appendChild(day);
    });

    // KYT preview
    var kyt = K.toKytSteps(t, new Date(), 1);
    wrap.appendChild(h('details', { class: 'card' }, h('summary', { text: 'How KYT will see the steps (preview)' }),
      h('table', null, h('thead', null, h('tr', null, ['When', 'Title', 'Where', 'Icon'].map(function (x) { return h('th', { text: x }); }))),
        h('tbody', null, kyt.map(function (s) { return h('tr', null, h('td', { text: s.targetTime.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' }) }), h('td', { text: s.title }), h('td', { text: s.where }), h('td', { text: s.icon })); })))));

    // actions
    var approve = t.status === 'approved'
      ? btn('Return to draft', '', function () { edit(id, function (r) { r.status = 'draft'; }); })
      : btn('Approve for export', 'primary', function () {
        var cur = validateTrip(t); if (cur.errors) { toast('Fix the errors first.'); return; }
        var raw = rawForEdit(t); raw.status = 'approved'; raw.rev = (t.rev || 1) + 1;
        replaceTrip(id, raw); render(); toast('Approved.');
      }, { disabled: v.errors > 0 });
    wrap.appendChild(h('div', { class: 'card row', style: 'justify-content:space-between' }, approve,
      btn('Delete trip', 'danger', function () {
        if (!confirm('Delete "' + (t.title || 'this trip') + '" from the library? This cannot be undone.')) return;
        state.trips = state.trips.filter(function (x) { return x.id !== id; }); state.selected = null; persistTrips(); render();
      })));
    return wrap;
  }

  // ---- library / export
  function viewLibrary() {
    var root = h('div'), approved = state.trips.filter(function (t) { return t.status === 'approved'; });
    root.appendChild(h('h2', { text: 'Library and export' }));
    root.appendChild(h('p', { class: 'lead', text: 'Export writes curated_trips.js, the file KYT loads. Only approved trips go in unless you include drafts for a test build.' }));

    var rows = state.trips.map(function (t) {
      var v = validateTrip(t);
      return h('tr', null, h('td', { text: t.title }), h('td', { text: t.originName }), h('td', { text: t.kind + ' · ' + t.durationDays + 'd' }), h('td', { text: [t.track, t.taste.intent, t.faiths.join('/')].filter(Boolean).join(' · ') }), h('td', { text: String(v.stats ? v.stats.steps : 0) }), h('td', null, tripPill(t, v)), h('td', { text: String(v.warnings) }));
    });
    root.appendChild(h('div', { class: 'card' }, state.trips.length ? h('table', null, h('thead', null, h('tr', null, ['Title', 'From', 'Type', 'Track', 'Steps', 'Status', 'Warnings'].map(function (x) { return h('th', { text: x }); }))), h('tbody', null, rows)) : h('p', { class: 'empty', text: 'The library is empty.' })));

    var msg = h('div');
    function showE() { msg.textContent = ''; if (state.exportMsg) msg.appendChild(h('p', { class: 'notice ' + state.exportMsg.kind, text: state.exportMsg.text })); }
    showE();
    function build() {
      try {
        var text = K.exportJs(state.trips, { includeDrafts: state.includeDrafts, ctx: CTX });
        if (!/window\.KYT_CURATED_TRIPS = \[/.test(text)) throw new Error('Nothing to export.');
        return text;
      } catch (e) { state.exportMsg = { kind: 'err', text: e.message }; showE(); return null; }
    }
    var count = state.includeDrafts ? state.trips.length : approved.length;
    root.appendChild(h('div', { class: 'card' }, h('h3', { text: 'Export' }),
      h('label', { class: 'chip' + (state.includeDrafts ? ' on' : '') }, h('input', { type: 'checkbox', checked: state.includeDrafts, onchange: function (e) { state.includeDrafts = e.target.checked; render(); } }), 'Include drafts (test builds only)'),
      h('p', { class: 'hint', text: count + ' trip(s) will be exported.' }), msg,
      h('div', { class: 'row' },
        btn('Download curated_trips.js', 'primary', function () {
          var t = build(); if (t == null) return;
          if (!count) { state.exportMsg = { kind: 'err', text: 'No approved trips yet. Approve at least one in Review.' }; showE(); return; }
          download('curated_trips.js', t); state.exportMsg = { kind: 'ok', text: 'Downloaded ' + count + ' trip(s). Replace data/curated_trips.js in the KYT repo with this file.' }; showE();
        }),
        btn('Copy as text', '', function () { var t = build(); if (t != null && count) copyText(t); }))));

    // load existing
    var imsg = h('div'), file = h('input', { type: 'file', accept: '.js,.json,.txt', 'aria-label': 'Choose a file' });
    function showI(m) { imsg.textContent = ''; if (m) imsg.appendChild(h('p', { class: 'notice ' + m.kind, text: m.text })); }
    file.addEventListener('change', function () {
      var f = file.files && file.files[0]; if (!f) return;
      if (f.size > 8 * 1024 * 1024) { showI({ kind: 'err', text: 'That file is larger than 8 MB.' }); return; }
      var rd = new FileReader();
      rd.onload = function () {
        try {
          var text = String(rd.result), list;
          if (/window\.KYT_CURATED_TRIPS\s*=/.test(text)) list = K.parseExport(text);
          else list = K.toTripList(JSON.parse(text).trips ? JSON.parse(text) : JSON.parse(text));
          if (!Array.isArray(list)) throw new Error('No trip list found.');
          var raws = list.map(function (t) { return t && typeof t === 'object' ? Object.assign({}, t) : t; });
          // loaded trips keep their status (they came from an export or a backup)
          var before = state.trips.length, r = addTrips(raws, null, state.importPolicy);
          showI({ kind: 'ok', text: 'Loaded: ' + r.added + ' added, ' + r.replaced + ' replaced, ' + r.skipped + ' skipped (library had ' + before + ').' });
          renderTabs();
        } catch (e) { showI({ kind: 'err', text: 'Could not load this file: ' + e.message }); }
      };
      rd.readAsText(f);
    });
    root.appendChild(h('div', { class: 'card' }, h('h3', { text: 'Load an existing curated_trips.js or backup' }),
      h('p', { class: 'hint', text: 'The file is read as data, never run. Trips with the same id as one already here follow the rule below.' }),
      field('If a trip id already exists', select([['skip', 'Keep the one in the library'], ['replace', 'Replace it with the loaded one']], state.importPolicy, function (v) { state.importPolicy = v; })),
      file, imsg));

    // backup
    root.appendChild(h('div', { class: 'card' }, h('h3', { text: 'Backup' }),
      h('p', { class: 'hint', text: 'The library lives in this browser only. Clearing site data erases it. Download a backup now and then.' }),
      h('div', { class: 'row' }, btn('Download backup (all trips, including drafts)', '', function () {
        try { download('kyt_admin_backup.json', JSON.stringify(state.trips, null, 2)); } catch (e) { toast('Could not create the backup.'); }
      }), btn('Clear the library', 'danger', function () {
        if (!state.trips.length) return;
        if (!confirm('Delete all ' + state.trips.length + ' trips from this browser? Download a backup first if you need them.')) return;
        state.trips = []; state.selected = null; persistTrips(); render();
      }))));
    return root;
  }

  // ------------------------------------------------------------ shell
  var TABS = [['plan', '1. Plan'], ['import', '2. Bring in AI output'], ['review', '3. Review and edit'], ['library', '4. Library and export']];
  function go(tab) { state.tab = tab; render(); window.scrollTo(0, 0); }
  function renderStatus() {
    var el = document.getElementById('status'); if (!el) return;
    var ap = state.trips.filter(function (t) { return t.status === 'approved'; }).length;
    el.textContent = state.trips.length + ' trips, ' + ap + ' approved' + (CATALOG.length ? '' : ' · city catalog missing') + (storageOk ? '' : ' · browser storage unavailable, changes will be lost on reload');
  }
  function renderTabs() {
    var nav = document.getElementById('tabs'); nav.textContent = '';
    TABS.forEach(function (t) {
      var b = h('button', { type: 'button', class: 'tab', role: 'tab', 'aria-selected': state.tab === t[0] ? 'true' : 'false', onclick: function () { go(t[0]); } }, t[1]);
      if (t[0] === 'review' && state.trips.length) b.appendChild(h('span', { class: 'badge', text: String(state.trips.length) }));
      nav.appendChild(b);
    });
    renderStatus();
  }
  function render() {
    var y = window.scrollY, view = document.getElementById('view'); view.textContent = '';
    var v = state.tab === 'plan' ? viewPlan : state.tab === 'import' ? viewImport : state.tab === 'review' ? viewReview : viewLibrary;
    view.appendChild(v()); renderTabs(); window.scrollTo(0, y);
  }
  render();
  window.KYTAdminApp = { state: state }; // handy for tests and debugging
})();
