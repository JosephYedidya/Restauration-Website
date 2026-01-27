// Service Worker pour Bistro Rive - PWA
const CACHE_NAME = 'bistro-rive-v2.0.0';
const STATIC_CACHE = 'bistro-rive-static-v2.0.0';
const DYNAMIC_CACHE = 'bistro-rive-dynamic-v2.0.0';
const IMAGE_CACHE = 'bistro-rive-images-v2.0.0';

// URLs externes autorisées pour le cache
const ALLOWED_EXTERNAL_URLS = [
  'images.unsplash.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

// Fichiers à mettre en cache pour le fonctionnement hors-ligne
const STATIC_ASSETS = [
  './',
  './index.html',
  './Style.css',
  './additional-styles.css',
  './Script.js',
  './features.js',
  './reviews-carousel.js',
  './pwa-install.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
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
      .then(() => {
        console.log('🍽️ Service Worker: Tous les fichiers sont mis en cache');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('🍽️ Service Worker: Erreur lors de l\'installation:', error);
      })
  );
});

// Activation du Service Worker avec nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  console.log('🍽️ Service Worker: Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Supprimer les anciens caches
        const cachesToDelete = cacheNames.filter((cacheName) => {
          return cacheName.startsWith('bistro-rive') && 
                 cacheName !== STATIC_CACHE && 
                 cacheName !== DYNAMIC_CACHE &&
                 cacheName !== IMAGE_CACHE;
        });
        
        if (cachesToDelete.length > 0) {
          console.log('🍽️ Service Worker: Suppression des anciens caches:', cachesToDelete);
        }
        
        return Promise.all(
          cachesToDelete.map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        console.log('🍽️ Service Worker: Activation terminée');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('🍽️ Service Worker: Erreur lors de l\'activation:', error);
      })
  );
});

// Stratégie de cache intelligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Gestion des images - Stratégie: Cache First avec Network Fallback
  if (request.destination === 'image') {
    event.respondWith(cacheFirstForImages(request));
    return;
  }

  // Gestion des requêtes locales - Stratégie: Stale While Revalidate
  if (url.origin === location.origin) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Gestion des ressources externes autorisées - Stratégie: Network First
  if (ALLOWED_EXTERNAL_URLS.some(domain => url.hostname.includes(domain))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Toutes les autres requêtes - Stratégie: Network Only
  event.respondWith(fetch(request).catch(() => {
    // Retourner une réponse offline générique pour les navigations
    if (request.mode === 'navigate') {
      return caches.match('./index.html');
    }
    return new Response('Offline', { status: 503 });
  }));
});

// Stratégie Cache First pour les images
function cacheFirstForImages(request) {
  return caches.match(request)
    .then((cachedResponse) => {
      if (cachedResponse) {
        // Retourner le cache et mettre à jour en arrière-plan
        fetchAndCacheImage(request);
        return cachedResponse;
      }

      // Pas de cache, faire la requête réseau
      return fetchAndCacheImage(request);
    })
    .catch((error) => {
      console.error('🍽️ Service Worker: Erreur image:', error);
      return null;
    });
}

function fetchAndCacheImage(request) {
  return fetch(request)
    .then((response) => {
      if (!response || response.status !== 200 || response.type !== 'opaque') {
        return response;
      }

      // Cloner pour ne pas bloquer la réponse
      const responseToCache = response.clone();

      caches.open(IMAGE_CACHE)
        .then((cache) => {
          cache.put(request, responseToCache);
        });

      return response;
    });
}

// Stratégie Stale While Revalidate pour les ressources locales
function staleWhileRevalidate(request) {
  return caches.match(request)
    .then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });

          return response;
        })
        .catch((error) => {
          console.error('🍽️ Service Worker: Erreur de fetch:', error);
          return null;
        });

      return cachedResponse || fetchPromise;
    })
    .catch((error) => {
      console.error('🍽️ Service Worker: Erreur dans staleWhileRevalidate:', error);
      
      if (request.mode === 'navigate') {
        return caches.match('./index.html');
      }
      
      return new Response('Erreur réseau', { status: 503, statusText: 'Service Unavailable' });
    });
}

// Stratégie Network First pour les ressources externes
function networkFirstStrategy(request) {
  return fetch(request)
    .then((response) => {
      if (!response || response.status !== 200) {
        return caches.match(request);
      }

      const responseToCache = response.clone();
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          cache.put(request, responseToCache);
        });

      return response;
    })
    .catch(() => {
      return caches.match(request);
    });
}

// Gestion des messages depuis les clients
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearAllCaches') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync pour les commandes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-orders') {
    console.log('🍽️ Service Worker: Synchronisation des commandes en arrière-plan');
    // Implémenter la synchronisation des commandes si nécessaire
  }
});

// Notifications push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {
    title: 'Bistro Rive',
    body: 'Nouvelle notification de Bistro Rive',
    icon: 'icon-192.png'
  };
  
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: data.icon || 'icon-192.png',
    badge: 'icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || 1,
      url: data.url || './'
    },
    actions: [
      {
        action: 'view',
        title: 'Voir'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ],
    tag: data.tag || 'bistro-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Bistro Rive', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || './')
    );
  }
});

// Gestion des erreurs non gérées
self.addEventListener('error', (event) => {
  console.error('🍽️ Service Worker: Erreur non gérée:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('🍽️ Service Worker: Promesse rejetée non gérée:', event.reason);
});

console.log('🍽️ Service Worker: Bistro Rive PWA v2.0 chargé avec succès');

