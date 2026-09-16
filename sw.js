/**
 * Service worker — existe para que Android/Chromium consideren la app
 * "instalable" (uno de los requisitos técnicos de un PWA) y para que la
 * propia página cargue sin conexión una vez visitada la primera vez.
 * Tus datos NO se guardan aquí — eso lo hace IndexedDB dentro de index.html.
 *
 * Estrategia: "red primero, caché de respaldo". Cada vez que hay
 * conexión, se trae la versión más reciente de internet y se actualiza
 * la copia guardada. Solo si no hay conexión (modo offline real) se usa
 * la última copia que se pudo guardar. Así, subir cambios a GitHub Pages
 * se refleja solo, sin tener que borrar caché a mano.
 */
const CACHE_NAME = 'libro-shell-v2';
const SHELL_FILES = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting(); // activa la versión nueva del service worker de inmediato
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim(); // toma control de las pestañas ya abiertas, sin esperar a que las cierren
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
