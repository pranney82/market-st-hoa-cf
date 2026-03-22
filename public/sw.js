const CACHE = "hoa-v4";
const OFFLINE = "/offline.html";

// Critical shell to precache
const PRECACHE = [
  "/offline.html",
  "/manifest.json",
  "/favicon.png",
];

// Cache size limits
const MAX_PAGES = 30;
const MAX_ASSETS = 100;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and API requests
  if (request.method !== "GET" || url.pathname.startsWith("/api/")) return;

  // Static assets: cache first with bounded cache
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE).then(async (cache) => {
              cache.put(request, clone);
              // Trim cache
              const keys = await cache.keys();
              const assetKeys = keys.filter(k => new URL(k.url).pathname.match(/\.(js|css|png|jpg|svg|woff2?|ico)$/));
              if (assetKeys.length > MAX_ASSETS) {
                for (let i = 0; i < assetKeys.length - MAX_ASSETS; i++) {
                  cache.delete(assetKeys[i]);
                }
              }
            });
          }
          return response;
        })
      )
    );
    return;
  }

  // Pages: stale-while-revalidate for snappy navigation
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(async (cache) => {
            cache.put(request, clone);
            // Trim page cache
            const keys = await cache.keys();
            const pageKeys = keys.filter(k => !new URL(k.url).pathname.match(/\.(js|css|png|jpg|svg|woff2?|ico)$/));
            if (pageKeys.length > MAX_PAGES) {
              for (let i = 0; i < pageKeys.length - MAX_PAGES; i++) {
                cache.delete(pageKeys[i]);
              }
            }
          });
        }
        return response;
      }).catch(() => {
        // Offline: return cached page or offline fallback
        return cached || caches.match(OFFLINE);
      });

      // Return cached immediately if available, update in background
      return cached || networkFetch;
    })
  );
});

// Background sync for failed form submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "retry-form") {
    event.waitUntil(retryFailedForms());
  }
});

async function retryFailedForms() {
  // Read queued submissions from IndexedDB
  // This gets populated by the form enhancement script when offline
  try {
    const db = await openFormDB();
    const tx = db.transaction("pending", "readonly");
    const store = tx.objectStore("pending");
    const all = await new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
    });

    for (const item of all) {
      try {
        const res = await fetch(item.url, {
          method: "POST",
          headers: item.headers,
          body: item.body,
        });
        if (res.ok) {
          const delTx = db.transaction("pending", "readwrite");
          delTx.objectStore("pending").delete(item.id);
        }
      } catch {
        // Will retry on next sync
      }
    }
  } catch {
    // IndexedDB not available
  }
}

function openFormDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("hoa-forms", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("pending", { keyPath: "id", autoIncrement: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "Market St HOA";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    data: { url: data.url || "/dashboard" },
    tag: data.tag || "hoa-notification",
    renotify: true,
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";

  // Handle action buttons
  if (event.action === "pay") {
    event.waitUntil(self.clients.openWindow("/payments"));
    return;
  }
  if (event.action === "view") {
    event.waitUntil(self.clients.openWindow(url));
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
