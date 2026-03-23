
const CACHE_NAME = 'bayad-buddy-cache-v3';
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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
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
  // Navigation requests: try network first, fallback to index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Other requests: try cache first, then network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        // If network fails, return offline page for document requests
        if (event.request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
        return null;
      });
    })
  );
});
