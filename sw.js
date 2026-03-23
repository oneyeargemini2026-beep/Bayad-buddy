
const CACHE_NAME = 'bayad-buddy-cache-v4';
const OFFLINE_URL = './offline.html';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo.svg',
  OFFLINE_URL
];

// Install Event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  console.log('[Service Worker] Fetching', event.request.url);
  
  // Navigation requests: try network first, fallback to index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        console.log('[Service Worker] Navigation failed, returning index.html');
        return caches.match('./index.html');
      })
    );
    return;
  }

  // Other requests: try cache first, then network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('[Service Worker] Returning cached response', event.request.url);
        return cachedResponse;
      }
      
      console.log('[Service Worker] Fetching from network', event.request.url);
      return fetch(event.request).catch(() => {
        console.log('[Service Worker] Network fetch failed');
        // If network fails, return offline page for document requests
        if (event.request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
        return null;
      });
    })
  );
});
