/**
 * config.js — Trip configuration panel: name, notes, cover image, step list, drag-to-reorder
 */

window.KYT = window.KYT || {};

window.KYT.config = (() => {
  const mainView            = document.getElementById('main-view');
  const configView          = document.getElementById('config-view');
  const inputTripName       = document.getElementById('input-trip-name');
  const inputTripNotes      = document.getElementById('input-trip-notes');
  const configStepsList     = document.getElementById('config-steps-list');
  const stepCountBadge      = document.getElementById('step-count-badge');
  const coverImagePreview   = document.getElementById('config-cover-preview');
  const coverImageInput     = document.getElementById('config-cover-input');
  const btnClearCover       = document.getElementById('btn-clear-cover');
  const coverPreviewWrap    = document.getElementById('config-cover-preview-wrap');

  let dragSrcIndex = null;

  // ── Cover image ───────────────────────────────────────────────────────────
  function updateCoverPreview() {
    const { tripCoverImage } = KYT.store.get();
    if (tripCoverImage) {
      coverImagePreview.src = tripCoverImage;
      coverPreviewWrap.classList.remove('hidden');
    } else {
      coverPreviewWrap.classList.add('hidden');
      coverImagePreview.src = '';
    }
  }

  function compressCoverImage(file, maxWidth = 2000, quality = 0.95) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width, height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleCoverFile(file) {
    if (!file) return;
    try {
      const base64 = await compressCoverImage(file);
      KYT.store.setCoverImage(base64);
      updateCoverPreview();
    } catch (err) {
      console.error("Failed to process cover image:", err);
      alert("Failed to process image.");
    }
  }

  coverImageInput.addEventListener('change', e => {
    handleCoverFile(e.target.files[0]);
    e.target.value = '';
  });

  document.addEventListener('paste', e => {
    // Only intercept if the config view is visible and we aren't typing in an input
    if (configView.classList.contains('hidden')) return;
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let imageFile = null;
    for (let index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        imageFile = item.getAsFile();
        break; // just take the first image for the cover
      }
    }

    if (imageFile) {
      e.preventDefault();
      handleCoverFile(imageFile);
    }
  });

  btnClearCover.addEventListener('click', () => { KYT.store.setCoverImage(null); updateCoverPreview(); });

  // ── Render step list ──────────────────────────────────────────────────────
  function renderConfigSteps() {
    const { stepsData } = KYT.store.get();
    stepCountBadge.textContent = `${stepsData.length} item${stepsData.length !== 1 ? 's' : ''}`;

    configStepsList.innerHTML = stepsData.map((step, index) => `
      <div class="config-step-row flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm
                  transition-all hover:border-slate-200"
           draggable="true" data-index="${index}">

        <span class="drag-handle p-1.5 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0"
              title="Drag to reorder">
          <i data-lucide="grip-vertical" class="w-4 h-4"></i>
        </span>

        <div class="p-2.5 bg-slate-50 text-kyt-subtext rounded-xl shrink-0">
          <i data-lucide="${step.icon}" class="w-5 h-5"></i>
        </div>

        <div class="flex-1 overflow-hidden">
          <p class="text-[15px] font-bold text-kyt-text truncate">${step.title}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-[12px] font-semibold text-kyt-subtext">${KYT.clock.formatTimeExact(step.targetTime)}</span>
            <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span class="text-[12px] text-slate-500 truncate">${step.where || '—'}</span>
          </div>
        </div>

        <div class="flex flex-col gap-0.5 shrink-0">
          <button class="p-1 text-slate-300 hover:text-kyt-accent transition-colors ${index === 0 ? 'opacity-0 pointer-events-none' : ''}"
                  onclick="KYT.config.moveStep(${index}, -1)" title="Move up">
            <i data-lucide="chevron-up" class="w-4 h-4"></i>
          </button>
          <button class="p-1 text-slate-300 hover:text-kyt-accent transition-colors ${index === stepsData.length - 1 ? 'opacity-0 pointer-events-none' : ''}"
                  onclick="KYT.config.moveStep(${index}, 1)" title="Move down">
            <i data-lucide="chevron-down" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="flex flex-col gap-0.5 shrink-0 ml-1">
          <button class="p-2 text-slate-300 hover:text-rose-500 transition-colors shrink-0"
                  onclick="KYT.config.deleteStep(${index})" title="Delete step">
            <i data-lucide="trash-2" class="w-5 h-5"></i>
          </button>
          <button class="p-2 text-slate-300 hover:text-kyt-accent transition-colors shrink-0"
                  onclick="KYT.stepForm.open(${step.id})" title="Edit step">
            <i data-lucide="edit-2" class="w-5 h-5"></i>
          </button>
        </div>
      </div>
    `).join('');

    lucide.createIcons();
    attachDragListeners();
  }

  // ── Drag-and-drop reorder ─────────────────────────────────────────────────
  function attachDragListeners() {
    const rows = configStepsList.querySelectorAll('.config-step-row');
    rows.forEach(row => {
      row.addEventListener('dragstart', e => {
        dragSrcIndex = parseInt(row.dataset.index);
        e.dataTransfer.effectAllowed = 'move';
        row.classList.add('opacity-50');
      });
      row.addEventListener('dragend', () => {
        rows.forEach(r => r.classList.remove('opacity-50', 'ring-2', 'ring-kyt-accent'));
        dragSrcIndex = null;
      });
      row.addEventListener('dragover', e => {
        e.preventDefault();
        rows.forEach(r => r.classList.remove('ring-2', 'ring-kyt-accent'));
        row.classList.add('ring-2', 'ring-kyt-accent');
      });
      row.addEventListener('dragleave', () => row.classList.remove('ring-2', 'ring-kyt-accent'));
      row.addEventListener('drop', e => {
        e.preventDefault();
        const dest = parseInt(row.dataset.index);
        if (dragSrcIndex !== null && dragSrcIndex !== dest) reorderSteps(dragSrcIndex, dest);
      });
    });
  }

  function reorderSteps(from, to) {
    const { stepsData, currentIndex } = KYT.store.get();
    const moved = stepsData.splice(from, 1)[0];
    stepsData.splice(to, 0, moved);

    // Keep currentIndex pointing to the same step
    let newIdx = currentIndex;
    if      (from === currentIndex)                               newIdx = to;
    else if (from < currentIndex && to >= currentIndex)           newIdx = currentIndex - 1;
    else if (from > currentIndex && to <= currentIndex)           newIdx = currentIndex + 1;
    KYT.store.setCurrentIndex(newIdx);

    KYT.store.saveData();
    renderConfigSteps();
    KYT.carousel.renderCard();
  }

  function moveStep(index, direction) {
    const dest = index + direction;
    const { stepsData } = KYT.store.get();
    if (dest < 0 || dest >= stepsData.length) return;
    reorderSteps(index, dest);
  }

  function deleteStep(index) {
    if (!confirm("Are you sure you want to delete this step?")) return;
    const { stepsData, currentIndex } = KYT.store.get();
    stepsData.splice(index, 1);
    
    // adjust currentIndex if needed
    let newIdx = currentIndex;
    if (index < currentIndex) {
      newIdx = Math.max(0, currentIndex - 1);
    } else if (index === currentIndex) {
      newIdx = Math.max(0, Math.min(currentIndex, stepsData.length - 1));
    }
    KYT.store.setCurrentIndex(newIdx);
    
    KYT.store.saveData();
    renderConfigSteps();
    KYT.carousel.renderCard();
  }

  // ── Open / close ──────────────────────────────────────────────────────────
  function openConfigView() { window.location.href = "configure_trip.html"; }

  function closeConfigView() {
    const newName  = inputTripName.value.trim();
    const newNotes = inputTripNotes.value.trim();
    if (newName) KYT.store.setTripName(newName);
    KYT.store.setTripNotes(newNotes);
    KYT.store.saveData();

    window.location.href = "index.html";
    KYT.carousel.renderCard();
  }

  
  function endTrip() {
    if (confirm('Are you sure you want to end and delete the current trip?')) {
      KYT.store.setTripName('New Trip');
      KYT.store.setTripNotes('');
      KYT.store.setCoverImage(null);
      KYT.store.setStepsData([]);
      KYT.store.setCurrentIndex(0);
      KYT.store.saveData();
      localStorage.removeItem('kyt_stepsData');
      window.location.href = 'index.html';
    }
  }

  // Wire static buttons
  document.getElementById('btn-edit-trip').addEventListener('click',    openConfigView);
  document.getElementById('btn-close-config').addEventListener('click', closeConfigView);
  document.getElementById('btn-save-config').addEventListener('click',  closeConfigView);
  const btnEndTrip = document.getElementById('btn-end-trip');
  if (btnEndTrip) btnEndTrip.addEventListener('click', endTrip);

  return { openConfigView, closeConfigView, renderConfigSteps, moveStep, deleteStep };
})();

