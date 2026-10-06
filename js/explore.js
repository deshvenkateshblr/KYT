/**
 * explore.js — KYT Explore (Wishlist) View
 */

window.KYT = window.KYT || {};

KYT.explore = (function() {
  const DOM = {
    view: document.getElementById('explore-view'),
    btnOpen: document.getElementById('btn-open-bucket-list'),
    btnClose: document.getElementById('btn-close-explore'),
    filters: document.querySelectorAll('#explore-filters button'),
    content: document.getElementById('explore-content')
  };

  let currentFilter = 'All';
  let wishlist = [];

  function init() {
    try {
      wishlist = JSON.parse(localStorage.getItem('kyt_wishlist_cities') || '[]');
    } catch(e) { wishlist = []; }

    if (DOM.btnOpen) DOM.btnOpen.addEventListener('click', openView);
    if (DOM.btnClose) DOM.btnClose.addEventListener('click', closeView);

    DOM.filters.forEach(btn => {
      btn.addEventListener('click', (e) => {
        let category = e.target.dataset.filter;
        if (!category && e.target.closest('button')) {
            category = e.target.closest('button').dataset.filter;
        }
        if (category) setFilter(category);
      });
    });
    
    // Auto render if open
    if (!DOM.view.classList.contains('hidden')) renderList();
  }

  function openView() {
    const mainView = document.getElementById('main-view');
    if (mainView) {
      mainView.classList.add('opacity-0');
      setTimeout(() => {
        mainView.classList.add('hidden');
        DOM.view.classList.remove('hidden');
        renderList();
      }, 200);
    } else {
      DOM.view.classList.remove('hidden');
      renderList();
    }
  }

  function closeView() {
    DOM.view.classList.add('hidden');
    const mainView = document.getElementById('main-view');
    if (mainView) {
      mainView.classList.remove('hidden');
      void mainView.offsetWidth;
      mainView.classList.remove('opacity-0');
    }
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
    localStorage.setItem('kyt_wishlist_cities', JSON.stringify(wishlist));
    renderList();
  }

  function renderList() {
    if (!DOM.content) return;
    const list = window.KYT_CITIES || [];
    DOM.content.innerHTML = '';

    let filtered = list;
    if (currentFilter === 'Wishlist') {
      filtered = list.filter(item => wishlist.includes(item.id));
    }

    if (filtered.length === 0) {
      if (currentFilter === 'Wishlist') {
         DOM.content.innerHTML = `<div class="text-center text-slate-500 mt-10">Your saved wishlist is empty.<br><br>Tap the heart icon on any city to save it here.</div>`;
      } else {
         DOM.content.innerHTML = `<div class="text-center text-slate-500 mt-10">No cities found.</div>`;
      }
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('article');
      card.className = 'bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mb-4 animate-pop';
      
      const isSaved = wishlist.includes(item.id);
      const heartClass = isSaved ? 'text-rose-500 fill-rose-500' : 'text-slate-300 hover:text-rose-400';

      const beatCount = (item.beats || []).length;

      card.innerHTML = `
        <div class="flex justify-between items-start mb-2">
          <span class="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg">City</span>
          <button class="btn-toggle-wishlist p-1 -m-1 transition-colors ${heartClass}" data-id="${item.id}">
             <i data-lucide="heart" class="w-5 h-5"></i>
          </button>
        </div>
        <h3 class="text-xl font-extrabold text-slate-800 leading-tight">${item.name}${item.aliases && item.aliases.length ? ` <span class="text-sm font-semibold text-slate-400">(${item.aliases.join(', ')})</span>` : ''}</h3>
        <p class="text-sm font-medium text-slate-500 mt-1 leading-snug">${item.notes || 'Explore this destination.'}</p>
        
        <div class="flex flex-wrap gap-3 mt-3 text-xs font-bold text-slate-600">
          <span class="flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${beatCount} attractions</span>
        </div>
        
        <div class="mt-4 flex gap-2">
          <button class="btn-add-to-vt flex-1 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors" data-id="${item.id}">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add to Virtual Trip
          </button>
        </div>
      `;
      DOM.content.appendChild(card);
    });

    // Attach wishlist toggle events
    DOM.content.querySelectorAll('.btn-toggle-wishlist').forEach(btn => {
      btn.addEventListener('click', (e) => {
        toggleWishlist(e.currentTarget.dataset.id);
      });
    });

    // Attach add to Virtual Trip events
    DOM.content.querySelectorAll('.btn-add-to-vt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (KYT.virtualTrips) {
          KYT.virtualTrips.promptAddCity(e.currentTarget.dataset.id);
        } else {
          alert('Virtual Trips module not loaded.');
        }
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { open: openView, close: closeView };
})();

