// Service Worker de EduNova (HU-08, RNF-01): una lección y las flashcards funcionan sin internet.
// Al cambiar la lógica o el paquete, sube VERSION para descartar las cachés anteriores.
const VERSION = "edunova-v3";
const CACHE_PAGINAS = `${VERSION}-paginas`;
const CACHE_ESTATICOS = `${VERSION}-estaticos`;
const CACHE_API = `${VERSION}-api`;

const PAQUETE_OFFLINE = ["/estudiante", "/estudiante/leccion", "/estudiante/flashcards", "/estudiante/practica"];
const PAGINA_RESPALDO = "/estudiante";
const ESPERA_RED_MS = 3000;

// La caché es opcional: con el almacenamiento lleno o bloqueado, abrirla falla, pero la red sigue
// sirviendo. Por eso un error aquí nunca debe tumbar la página.
async function guardarEnCache(nombreCache, clave, respuesta) {
  try {
    await (await caches.open(nombreCache)).put(clave, respuesta);
  } catch {
    // sin caché la app sigue funcionando con conexión
  }
}

async function buscarEnCache(clave) {
  try {
    return await caches.match(clave);
  } catch {
    return undefined;
  }
}

// Baja la página y los JS y CSS que nombra, para que también funcione sin red al abrirla por primera vez.
async function guardarPagina(ruta) {
  const respuesta = await fetch(ruta, { cache: "reload" });
  if (!respuesta.ok) return;
  const paginas = await caches.open(CACHE_PAGINAS);
  await paginas.put(ruta, respuesta.clone());

  const html = await respuesta.text();
  const archivos = new Set(html.match(/\/_next\/static\/[^"'\\\s)]+/g) ?? []);
  const estaticos = await caches.open(CACHE_ESTATICOS);
  await Promise.allSettled([...archivos].map((archivo) => estaticos.add(archivo)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(Promise.allSettled(PAQUETE_OFFLINE.map(guardarPagina)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(nombres.filter((n) => !n.startsWith(`${VERSION}-`)).map((n) => caches.delete(n))),
      )
      .then(() => self.clients.claim()),
  );
});

async function primeroCache(request, nombreCache) {
  const guardada = await buscarEnCache(request);
  if (guardada) return guardada;
  const respuesta = await fetch(request);
  if (respuesta.ok) await guardarEnCache(nombreCache, request, respuesta.clone());
  return respuesta;
}

async function cacheYActualiza(request, nombreCache) {
  const guardada = await buscarEnCache(request);
  const red = fetch(request)
    .then(async (respuesta) => {
      if (respuesta.ok) await guardarEnCache(nombreCache, request, respuesta.clone());
      return respuesta;
    })
    .catch(() => undefined);
  return guardada ?? (await red) ?? Response.error();
}

async function primeroRed(request, nombreCache) {
  try {
    const respuesta = await fetch(request);
    if (respuesta.ok) await guardarEnCache(nombreCache, request, respuesta.clone());
    return respuesta;
  } catch {
    return (await buscarEnCache(request)) ?? Response.error();
  }
}

// Con red lenta no se deja esperando al estudiante: pasado un momento se sirve la copia guardada.
// Sin copia de esa página no hay a qué volver, así que se espera a la red aunque tarde.
async function pagina(request) {
  const ruta = new URL(request.url).pathname;
  const guardada = await buscarEnCache(ruta);
  const control = new AbortController();
  const espera = guardada ? setTimeout(() => control.abort(), ESPERA_RED_MS) : undefined;
  try {
    const respuesta = await fetch(request, { signal: control.signal });
    if (respuesta.ok && !respuesta.redirected) await guardarEnCache(CACHE_PAGINAS, ruta, respuesta.clone());
    return respuesta;
  } catch {
    return guardada ?? (await buscarEnCache(PAGINA_RESPALDO)) ?? Response.error();
  } finally {
    clearTimeout(espera);
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    if (/\/api\/units(\/|$)/.test(url.pathname)) event.respondWith(primeroRed(request, CACHE_API));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(primeroCache(request, CACHE_ESTATICOS));
  } else if (url.pathname.startsWith("/_next/image") || /^\/assets\/.+\.(png|jpe?g|webp|svg)$/i.test(url.pathname)) {
    // Los modelos 3D quedan fuera: son pesados y se cargan bajo demanda (RNF-01).
    event.respondWith(cacheYActualiza(request, CACHE_ESTATICOS));
  } else if (/^\/backend\/api\/units(\/|$)/.test(url.pathname)) {
    // El API llega por el proxy de Next (mismo origen): se guarda igual que antes para el modo offline.
    event.respondWith(primeroRed(request, CACHE_API));
  } else if (request.mode === "navigate") {
    event.respondWith(pagina(request));
  }
});
