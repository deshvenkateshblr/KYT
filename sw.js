/**
 * sw.js — KYT Service Worker
 * Strategy: Network-first with a 3-second timeout, falling back to cache.
 * On install, pre-caches the app shell so KYT works fully offline after the first load.
 */

const CACHE_NAME = 'kyt-v7';

// Files that make up the offline-capable app shell
const APP_SHELL = [
  './',
  './index.html',
  './css/index.css',
  './js/index.js',
  './view_trip.html',
  './configure_trip.html',
  './virtual_trip.html',
  './trip_detail.html',
  './manifest.json',
  './css/base.css',
  './css/animations.css',
  './js/app.js',
  './js/store.js',
  './js/clock.js',
  './js/carousel.js',
  './js/config.js',
  './js/step-form.js',
  './js/file-viewer.js',
  './js/share.js',
  './js/social.js',
  './js/virtual-trips.js',
  './visited.html',
  './js/passport-store.js',
  './data/cities.js',
  './lib/tailwindcss.js',
  './lib/lucide.js',
  './icons/KYT.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// -- Install: pre-cache the app shell --------------------------------------
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_SHELL).catch(err => {
        console.warn('[SW] Some app shell assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// -- Activate: remove stale caches -----------------------------------------
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// -- Fetch: network-first with timeout, fall back to cache -----------------
self.addEventListener('fetch', event => {
  // Non-GET requests bypass the cache
  if (event.request.method !== 'GET') return;

  const fetchWithTimeout = (request, timeoutMs = 2000) => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Network timeout'));
      }, timeoutMs);

      fetch(request).then(response => {
        clearTimeout(timeoutId);
        resolve(response);
      }).catch(err => {
        clearTimeout(timeoutId);
        reject(err);
      });
    });
  };

  event.respondWith(
    fetchWithTimeout(event.request, 2000)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Fall back to cache on timeout or network failure
        return caches.match(event.request);
      })
  );
});
