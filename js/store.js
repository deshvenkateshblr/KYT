/**
 * store.js — KYT central state and localStorage persistence
 * All mutable state lives here; other modules read from window.KYT.store
 */

window.KYT = window.KYT || {};

window.KYT.store = (() => {
  // ── State ────────────────────────────────────────────────────────────────
  let tripName       = 'New Trip';
  let tripNotes      = '';
  let tripCoverImage = null;
  let stepsData      = [];
  let currentIndex   = 0;

  // ── Getters (read-only snapshots) ────────────────────────────────────────
  const get = () => ({ tripName, tripNotes, tripCoverImage, stepsData, currentIndex });

  // ── Setters ───────────────────────────────────────────────────────────────
  const setTripName       = v => { tripName       = v; };
  const setTripNotes      = v => { tripNotes      = v; };
  const setCoverImage     = v => { tripCoverImage = v; };
  const setStepsData      = v => { stepsData      = v; };
  const setCurrentIndex   = v => { currentIndex   = v; };

  // ── Convenience mutators on stepsData ────────────────────────────────────
  const getStep     = i  => stepsData[i];
  const updateStep  = (i, patch) => { stepsData[i] = { ...stepsData[i], ...patch }; };

  // ── Persistence ───────────────────────────────────────────────────────────
  function saveData() {
    try {
      localStorage.setItem('kyt_tripName',       tripName);
      localStorage.setItem('kyt_tripNotes',      tripNotes);
      localStorage.setItem('kyt_tripCoverImage', tripCoverImage || '');
      localStorage.setItem('kyt_stepsData',      JSON.stringify(stepsData));
    } catch (e) {
      console.error('localStorage save failed:', e);
      alert('Storage is full! Remove a large file attachment and use a link instead.');
    }
  }

  function loadData() {
    const savedName  = localStorage.getItem('kyt_tripName');
    const savedNotes = localStorage.getItem('kyt_tripNotes');
    const savedImage = localStorage.getItem('kyt_tripCoverImage');
    const savedSteps = localStorage.getItem('kyt_stepsData');

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
  }

  return {
    get, setTripName, setTripNotes, setCoverImage, setStepsData, setCurrentIndex,
    getStep, updateStep, saveData, loadData
  };
})();

