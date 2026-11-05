"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getSessionUserRaw, SESSION_EVENT, type SessionUser } from "./session";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SESSION_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SESSION_EVENT, onChange);
  };
}

/** `undefined` mientras se hidrata, `null` si no hay sesión. */
export function useSessionUser(): SessionUser | null | undefined {
  const raw = useSyncExternalStore<string | null | undefined>(subscribe, getSessionUserRaw, () => undefined);
  return useMemo(() => {
    if (raw === undefined) return undefined;
    try {
      return raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      return null;
    }
  }, [raw]);
}
