// Service Worker pour Bistro Rive - PWA
const CACHE_NAME = 'bistro-rive-v1.0.0';
const STATIC_CACHE = 'bistro-rive-static-v1.0.0';
const DYNAMIC_CACHE = 'bistro-rive-dynamic-v1.0.0';

// Fichiers à mettre en cache pour le fonctionnement hors-ligne
const STATIC_ASSETS = [
  './',
  './index.html',
  './Style.css',
  './Script.js',
  './manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🍽️ Service Worker: Installation en cours...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('🍽️ Service Worker: Mise en cache des fichiers statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('🍽️ Service Worker: Erreur lors de l\'installation:', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🍽️ Service Worker: Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Supprimer les anciens caches
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('🍽️ Service Worker: Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Stratégie de cache: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes vers d'autres domaines (comme Unsplash)
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Retourner le cache s'il existe
        if (cachedResponse) {
          // Mettre à jour le cache en arrière-plan
          fetchAndCache(request);
          return cachedResponse;
        }

        // Sinon, faire la requête réseau
        return fetchAndCache(request);
      })
      .catch(() => {
        // Retourner une page离线 si disponible
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});

function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      // Vérifier si la réponse est valide
      if (!response || response.status !== 200 || response.type !== 'basic') {
        return response;
      }

      // Cloner la réponse pour la mettre en cache
      const responseToCache = response.clone();

      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          cache.put(request, responseToCache);
        });

      return response;
    })
    .catch((error) => {
      console.error('🍽️ Service Worker: Erreur de fetch:', error);
    });
}

// Gestion des mises à jour du cache
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Background sync pour les commandes (si nécessaire dans le futur)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    console.log('🍽️ Service Worker: Synchronisation des commandes en arrière-plan');
  }
});

// Notifications push (si nécessaire dans le futur)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification de Bistro Rive',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍽️</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍽️</text></svg>',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Bistro Rive', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

console.log('🍽️ Service Worker: Bistro Rive PWA chargé avec succès');
