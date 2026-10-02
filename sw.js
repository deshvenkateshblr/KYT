/**
 * sw.js — KYT Service Worker
 * Strategy: Cache-first for app shell; network-first for CDN resources.
 * On install, pre-caches the app shell so KYT works fully offline after the first load.
 */

const CACHE_NAME = 'kyt-v3';

// Files that make up the offline-capable app shell
const APP_SHELL = [
  './',
  './index.html',
  './index.css',
  './index.js',
  './view_trip.html',
  './configure_trip.html',
  './virtual_trip.html',
  './manifest.json',
  './css/base.css',
  './css/animations.css',
  './css/circuits.css',
  './js/app.js',
  './js/store.js',
  './js/clock.js',
  './js/carousel.js',
  './js/config.js',
  './js/step-form.js',
  './js/file-viewer.js',
  './js/share.js',
  './js/social.js',
  './js/explore.js',
  './js/virtual-trips.js',
  './data/cities.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// CDN assets — cache on first use (network-first with cache fallback)
const CDN_HOSTS = [
  'cdn.tailwindcss.com',
  'unpkg.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// ── Install: pre-cache the app shell ──────────────────────────────────────
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

// ── Activate: remove stale caches ─────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: serve from cache, fall back to network ─────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Non-GET requests bypass the cache
  if (event.request.method !== 'GET') return;

  const isCDN = CDN_HOSTS.some(host => url.hostname.includes(host));

  if (isCDN) {
    // Network-first for CDN (fonts, Tailwind, Lucide) — cache as fallback
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Network-first for everything else (app shell), fallback to cache
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

