"use client";

import { useEffect } from "react";

/** Activa el modo offline. Solo en producción: en `next dev` la caché taparía los cambios. */
export function RegistrarServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // Sin service worker la app sigue funcionando con conexión.
    });
  }, []);

  return null;
}
