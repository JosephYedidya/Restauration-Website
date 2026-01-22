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

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🍽️ Service Worker: Activation en cours...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Supprimer les anciens caches qui ne sont plus utilisés
        const cachesToDelete = cacheNames.filter((cacheName) => {
          return cacheName !== STATIC_CACHE && 
                 cacheName !== DYNAMIC_CACHE;
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

// Stratégie de cache: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non HTTP/HTTPS (comme les données de chrome extension)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorer les requêtes vers d'autres domaines (comme Unsplash) sauf pour les images
  if (url.origin !== location.origin) {
    // Permettre les images de Unsplash pour le moment
    if (request.destination === 'image') {
      event.respondWith(networkFirstStrategy(request));
    }
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

// Stratégie Stale-While-Revalidate pour les ressources locales
function staleWhileRevalidate(request) {
  return caches.match(request)
    .then((cachedResponse) => {
      // Faire la requête réseau en arrière-plan
      const fetchPromise = fetch(request)
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
          return null;
        });

      // Retourner le cache s'il existe, sinon attendre la réponse réseau
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetchPromise;
    })
    .catch((error) => {
      console.error('🍽️ Service Worker: Erreur dans staleWhileRevalidate:', error);
      
      // Retourner une page offline si disponible et si c'est une navigation
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
      // Vérifier si la réponse est valide
      if (!response || response.status !== 200) {
        // Retourner le cache si disponible
        return caches.match(request);
      }

      // Cloner la réponse pour la mettre en cache
      const responseToCache = response.clone();

      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          cache.put(request, responseToCache);
        });

      return response;
    })
    .catch(() => {
      // Retourner le cache en cas d'erreur réseau
      return caches.match(request);
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
  // Vérifier si event.data existe
  const data = event.data ? event.data.text() : 'Nouvelle notification de Bistro Rive';
  
  const options = {
    body: data,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
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

// Gestion des erreurs non gérées
self.addEventListener('error', (event) => {
  console.error('🍽️ Service Worker: Erreur non gérée:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('🍽️ Service Worker: Promesse rejetée non gérée:', event.reason);
});

console.log('🍽️ Service Worker: Bistro Rive PWA chargé avec succès');

