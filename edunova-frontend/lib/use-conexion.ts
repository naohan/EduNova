"use client";

import { useEffect, useSyncExternalStore } from "react";
import { COLA_EVENT, contarPendientes, sincronizarCola } from "./api/offline-queue";

function suscribirRed(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function suscribirCola(onChange: () => void) {
  window.addEventListener(COLA_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COLA_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Estado de la red y progreso por enviar. Al volver internet, envía lo pendiente. */
export function useConexion() {
  const online = useSyncExternalStore(suscribirRed, () => navigator.onLine, () => true);
  const pendientes = useSyncExternalStore(suscribirCola, contarPendientes, () => 0);

  useEffect(() => {
    if (online) void sincronizarCola();
  }, [online]);

  return { online, pendientes };
}
