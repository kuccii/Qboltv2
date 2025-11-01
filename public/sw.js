// Service Worker for Qivook PWA
const CACHE_NAME = 'qivook-v1';
const STATIC_CACHE = 'qivook-static-v1';
const DYNAMIC_CACHE = 'qivook-dynamic-v1';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/prices/,
  /\/api\/suppliers/,
  /\/api\/demand/,
  /\/api\/logistics/,
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Serving from cache:', request.url);
          return cachedResponse;
        }

        // Try to fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Check if response is valid
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response
            const responseToCache = networkResponse.clone();

            // Cache API responses
            if (isApiRequest(url)) {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }

            return networkResponse;
          })
          .catch((error) => {
            console.log('Network request failed:', request.url, error);
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }

            // Return cached API response if available
            if (isApiRequest(url)) {
              return caches.match(request);
            }

            // Return a generic offline response
            return new Response(
              JSON.stringify({
                error: 'Offline',
                message: 'This content is not available offline',
                timestamp: new Date().toISOString()
              }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'price-report-sync') {
    event.waitUntil(syncPriceReports());
  } else if (event.tag === 'supplier-review-sync') {
    event.waitUntil(syncSupplierReviews());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'New update available',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('Qivook Update', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/app')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/app')
    );
  }
});

// Helper functions
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Sync functions for background sync
async function syncPriceReports() {
  try {
    const offlineReports = await getOfflineData('price-reports');
    if (offlineReports && offlineReports.length > 0) {
      console.log('Syncing price reports:', offlineReports.length);
      
      for (const report of offlineReports) {
        try {
          await fetch('/api/prices/reports', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(report)
          });
          
          // Remove from offline storage after successful sync
          await removeOfflineData('price-reports', report.id);
        } catch (error) {
          console.error('Failed to sync price report:', error);
        }
      }
    }
  } catch (error) {
    console.error('Price report sync failed:', error);
  }
}

async function syncSupplierReviews() {
  try {
    const offlineReviews = await getOfflineData('supplier-reviews');
    if (offlineReviews && offlineReviews.length > 0) {
      console.log('Syncing supplier reviews:', offlineReviews.length);
      
      for (const review of offlineReviews) {
        try {
          await fetch(`/api/suppliers/${review.supplierId}/reviews`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(review)
          });
          
          // Remove from offline storage after successful sync
          await removeOfflineData('supplier-reviews', review.id);
        } catch (error) {
          console.error('Failed to sync supplier review:', error);
        }
      }
    }
  } catch (error) {
    console.error('Supplier review sync failed:', error);
  }
}

// Offline storage helpers
async function getOfflineData(key) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = await cache.match(`/offline-data/${key}`);
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to get offline data:', error);
  }
  return null;
}

async function removeOfflineData(key, id) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.delete(`/offline-data/${key}/${id}`);
  } catch (error) {
    console.error('Failed to remove offline data:', error);
  }
}

