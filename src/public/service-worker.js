self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then((cacheKeys) =>
      Promise.all(
        cacheKeys
          .map((key) => caches.delete(key))
      )
    ).then(() => self.registration.unregister())
  );
  self.clients.claim();
});
