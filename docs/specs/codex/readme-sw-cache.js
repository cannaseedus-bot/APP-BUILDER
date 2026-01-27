// Service Worker Cache Strategy (from README.md)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('atomic-v1').then((cache) => cache.addAll(['/atomic.css']))
  );
});
