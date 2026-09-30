/**
 * bucket-list-ui.js — KYT Bucket List UI
 */

window.KYT = window.KYT || {};

KYT.bucketList = (function() {
  const DOM = {
    view: document.getElementById('bucket-list-view'),
    btnOpen: document.getElementById('btn-open-bucket-list'),
    btnClose: document.getElementById('btn-close-bucket-list'),
    filters: document.querySelectorAll('#bucket-list-filters button'),
    content: document.getElementById('bucket-list-content')
  };

  let currentFilter = 'All';
  let wishlist = [];

  function init() {
    // Load wishlist from local storage
    try {
      wishlist = JSON.parse(localStorage.getItem('kyt_bucket_wishlist') || '[]');
    } catch(e) {
      wishlist = [];
    }

    if (DOM.btnOpen) {
      DOM.btnOpen.addEventListener('click', openView);
    }
    if (DOM.btnClose) {
      DOM.btnClose.addEventListener('click', closeView);
    }

    DOM.filters.forEach(btn => {
      btn.addEventListener('click', (e) => {
        let category = e.target.dataset.filter;
        // In case they clicked the icon inside the button
        if (!category && e.target.closest('button')) {
            category = e.target.closest('button').dataset.filter;
        }
        if (category) setFilter(category);
      });
    });
    
    renderList();
  }

  function openView() {
    DOM.view.classList.remove('hidden');
    renderList();
  }

  function closeView() {
    DOM.view.classList.add('hidden');
  }

  function setFilter(category) {
    currentFilter = category;
    
    // Update button styles
    DOM.filters.forEach(btn => {
      if (btn.dataset.filter === category) {
        btn.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
        btn.classList.add('bg-blue-600', 'text-white');
      } else {
        btn.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
        btn.classList.remove('bg-blue-600', 'text-white');
      }
    });

    renderList();
  }

  function toggleWishlist(id) {
    const index = wishlist.indexOf(id);
    if (index === -1) {
      wishlist.push(id);
    } else {
      wishlist.splice(index, 1);
    }
    localStorage.setItem('kyt_bucket_wishlist', JSON.stringify(wishlist));
    renderList();
  }

  function renderList() {
    const list = window.KYT_BUCKET_LIST || [];
    DOM.content.innerHTML = '';

    let filtered = list;
    if (currentFilter === 'Wishlist') {
      filtered = list.filter(item => wishlist.includes(item.id));
    } else if (currentFilter !== 'All') {
      filtered = list.filter(item => item.category === currentFilter);
    }

    if (filtered.length === 0) {
      if (currentFilter === 'Wishlist') {
         DOM.content.innerHTML = `<div class="text-center text-slate-500 mt-10">Your saved wishlist is empty.<br><br>Tap the heart icon on any destination to save it here.</div>`;
      } else {
         DOM.content.innerHTML = `<div class="text-center text-slate-500 mt-10">No destinations found in this category.</div>`;
      }
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('article');
      card.className = 'bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4 animate-pop';
      
      const isSaved = wishlist.includes(item.id);
      const heartClass = isSaved ? 'text-rose-500 fill-rose-500' : 'text-slate-300 hover:text-rose-400';

      const attrs = [];
      if (item.estimatedDays) attrs.push(`<span class="flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> ${item.estimatedDays} Days</span>`);
      if (item.bestSeason) attrs.push(`<span class="flex items-center gap-1"><i data-lucide="sun" class="w-3 h-3"></i> ${item.bestSeason}</span>`);
      
      let modesHtml = '';
      if (item.travelModes && item.travelModes.length) {
         modesHtml = `<div class="mt-2 text-[10px] uppercase font-bold text-slate-400 flex flex-wrap gap-2">
            ${item.travelModes.map(m => `<span class="bg-slate-100 px-2 py-1 rounded-md">${m}</span>`).join('')}
         </div>`;
      }

      let attractionsHtml = '';
      if (item.attractions && item.attractions.length) {
        attractionsHtml = `<div class="mt-3">
          <p class="text-[10px] uppercase font-bold text-slate-400 mb-1">
            Top Attractions
          </p>
          <ul class="text-sm text-slate-600 space-y-1">
            ${item.attractions.map(a => `
              <li class="bg-slate-50 border border-slate-100 p-2 rounded-lg font-medium text-slate-700">
                ${a}
              </li>
            `).join('')}
          </ul>
        </div>`;
      }

      card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <span class="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">${item.category}</span>
          <button class="btn-toggle-wishlist p-1 -m-1 transition-colors ${heartClass}" data-id="${item.id}">
             <i data-lucide="heart" class="w-5 h-5"></i>
          </button>
        </div>
        <h3 class="text-xl font-extrabold text-slate-800 leading-tight">${item.destination}</h3>
        <p class="text-sm font-medium text-slate-500 mt-1 leading-snug">${item.tagline}</p>
        
        <div class="flex flex-wrap gap-3 mt-3 text-xs font-bold text-slate-600">
          ${attrs.join('')}
        </div>
        
        ${modesHtml}
        ${attractionsHtml}
        
        ${item.notes ? `<p class="mt-3 text-xs italic text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">Note: ${item.notes}</p>` : ''}
        
        <div class="mt-4 flex gap-2">
          <a href="${item.mapsUrl}" target="_blank" class="flex-1 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-100 transition-colors">
            <i data-lucide="map-pin" class="w-3.5 h-3.5"></i> Map
          </a>
          <a href="${item.youtubeUrl}" target="_blank" class="flex-1 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-100 transition-colors">
            <i data-lucide="play-circle" class="w-3.5 h-3.5"></i> YouTube
          </a>
        </div>
      `;
      DOM.content.appendChild(card);
    });

    // Attach wishlist toggle events
    const wishBtns = DOM.content.querySelectorAll('.btn-toggle-wishlist');
    wishBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        toggleWishlist(id);
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  // Auto-init once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { open: openView, close: closeView };
})();
