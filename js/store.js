/**
 * store.js — KYT central state and IndexedDB persistence
 * All mutable state lives here; other modules read from window.KYT.store
 */

window.KYT = window.KYT || {};


window.KYT.utils = {
  escapeHTML: (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
};

window.KYT.store = (() => {
  // ── State ─────────────────────────────────────────────────────────────────
  let tripName       = 'New Trip';
  let tripNotes      = '';
  let tripCoverImage = null;
  let stepsData      = [];
  let currentIndex   = 0;

  // ── IndexedDB Wrapper ─────────────────────────────────────────────────────
  const DB_NAME = 'kyt_db';
  const STORE_NAME = 'kyt_store';
  let dbPromise = null;

  function getDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        e.target.result.createObjectStore(STORE_NAME);
      };
    });
    return dbPromise;
  }

  async function setItem(key, val) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getItem(key) {
    const db = await getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(tx.error);
    });
  }

  // ── Getters (read-only snapshots) ─────────────────────────────────────────
  const get = () => ({ tripName, tripNotes, tripCoverImage, stepsData, currentIndex });

  // ── Setters ───────────────────────────────────────────────────────────────
  const setTripName       = v => { tripName       = v; };
  const setTripNotes      = v => { tripNotes      = v; };
  const setCoverImage     = v => { tripCoverImage = v; };
  const setStepsData      = v => { stepsData      = v; };
  const setCurrentIndex   = v => { currentIndex   = v; };

  // ── Convenience mutators on stepsData ─────────────────────────────────────
  const getStep     = i  => stepsData[i];
  const updateStep  = (i, patch) => { stepsData[i] = { ...stepsData[i], ...patch }; };

  // ── Persistence ───────────────────────────────────────────────────────────
  async function saveData() {
    try {
      await setItem('kyt_tripName', tripName);
      await setItem('kyt_tripNotes', tripNotes);
      await setItem('kyt_tripCoverImage', tripCoverImage || '');
      await setItem('kyt_stepsData', JSON.stringify(stepsData));
    } catch (e) {
      console.error('IndexedDB save failed:', e);
      alert('Failed to save to database. You might be out of disk space.');
    }
  }

  async function loadData() {
    try {
      let savedName  = await getItem('kyt_tripName');
      let savedNotes = await getItem('kyt_tripNotes');
      let savedImage = await getItem('kyt_tripCoverImage');
      let savedSteps = await getItem('kyt_stepsData');

      // Seamless migration from localStorage if IDB is empty
      if (savedName === undefined) {
        savedName = localStorage.getItem('kyt_tripName');
        savedNotes = localStorage.getItem('kyt_tripNotes');
        savedImage = localStorage.getItem('kyt_tripCoverImage');
        savedSteps = localStorage.getItem('kyt_stepsData');
        
        if (savedName) await setItem('kyt_tripName', savedName);
        if (savedNotes) await setItem('kyt_tripNotes', savedNotes);
        if (savedImage) await setItem('kyt_tripCoverImage', savedImage);
        if (savedSteps) await setItem('kyt_stepsData', savedSteps);
      }

      if (savedName)  tripName       = savedName;
      if (savedNotes) tripNotes      = savedNotes;
      if (savedImage) tripCoverImage = savedImage || null;

      if (savedSteps) {
        try {
          const parsed = JSON.parse(savedSteps);
          stepsData = parsed.map(step => ({ ...step, targetTime: new Date(step.targetTime) }));
        } catch (e) { console.error('Failed to parse saved steps:', e); }
      }

      // Auto-focus most relevant step
      if (stepsData.length > 0) {
        const idx = stepsData.findIndex(s => s.status === 'on' || s.status === 'todo');
        currentIndex = idx === -1 ? Math.max(0, stepsData.length - 1) : idx;
      }
    } catch (e) {
      console.error('Failed to load from IndexedDB:', e);
    }
  }

  return {
    get, setTripName, setTripNotes, setCoverImage, setStepsData, setCurrentIndex,
    getStep, updateStep, saveData, loadData
  };
})();

