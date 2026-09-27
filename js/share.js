/**
 * share.js — Export trip as JSON, import trip from JSON
 */

window.KYT = window.KYT || {};

window.KYT.share = (() => {
  const btnExportTrip   = document.getElementById('btn-export-trip');
  const inputImportFile = document.getElementById('input-import-file');

  // ── Export ────────────────────────────────────────────────────────────────
  btnExportTrip.addEventListener('click', () => {
    const { tripName, stepsData } = KYT.store.get();
    if (stepsData.length === 0) { alert('Add some steps before exporting!'); return; }

    const exportData = {
      kytVersion: 1,
      tripName,
      exportedAt: new Date().toISOString(),
      steps: stepsData.map(s => ({
        id: s.id, title: s.title, icon: s.icon, where: s.where,
        mapUrl: s.mapUrl, targetTime: s.targetTime.toISOString(),
        notes: s.notes, status: s.status
        // Attachments intentionally omitted to keep file small
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${tripName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_kyt.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ── Import ────────────────────────────────────────────────────────────────
  inputImportFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const imported = JSON.parse(event.target.result);
        if (!imported.tripName || !Array.isArray(imported.steps)) { alert('Invalid trip file format.'); return; }

        KYT.store.setTripName(imported.tripName);
        KYT.store.setStepsData(imported.steps.map(s => ({
          ...s, targetTime: new Date(s.targetTime), attachments: []
        })));

        const { stepsData } = KYT.store.get();
        let idx = stepsData.findIndex(s => s.status === 'on' || s.status === 'todo');
        KYT.store.setCurrentIndex(idx === -1 ? Math.max(0, stepsData.length - 1) : idx);

        KYT.store.saveData();
        document.getElementById('input-trip-name').value = imported.tripName;
        KYT.config.renderConfigSteps();
        KYT.carousel.renderCard();
        alert('Trip imported successfully!');
      } catch (err) { alert('Error reading file. Make sure it is a valid .json exported from KYT.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  return {};
})();

