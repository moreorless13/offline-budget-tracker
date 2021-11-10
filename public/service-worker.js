const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/index.js",
  "/db.js",
  "/manifest.webmanifest"
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {

      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// fetch
self.addEventListener("fetch", function(e) {
 
  if (e.req.url.includes("/api/")) {
    e.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(e.req)
          .then(response => {
          
            if (response.status === 200) {
              cache.put(e.req.url, response.clone());
            }

            return response;
          })
          .catch(err => {
           
            return cache.match(e.req);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

    e.respondWith(
      fetch(e.req).catch(() => {
        return caches.match(e.req).then((response) => {
            if (response) {
                return response;
            } else if (e.req.headers.get('accept').includes('text/html')) {
                return caches.match('/');
            }
        });
    })
    )
});