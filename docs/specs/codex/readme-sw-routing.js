// Service Worker Routing (from README.md)
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('atomic.css')) {
    event.respondWith(caches.match(event.request));
  }
});
