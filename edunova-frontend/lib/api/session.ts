import type { User } from "./edunova-contract";

// Sesión de demostración: guarda el token y el usuario que devuelve POST /api/auth/login.
// No es seguridad real, solo ordena qué ve cada rol en el demo.

export type SessionUser = User & { linkedStudentId?: string };

const KEY = "edunova-demo-token";
const USER_KEY = "edunova-demo-user";
export const SESSION_EVENT = "edunova-session-change";

let memoryToken: string | undefined;
let memoryUser: string | null = null;

export function getToken(): string | undefined {
  if (memoryToken) return memoryToken;
  try {
    return window.localStorage.getItem(KEY) ?? undefined;
  } catch {
    return undefined; // sin localStorage (servidor, modo privado): la sesión vive en memoria
  }
}

export function setToken(token: string | undefined) {
  memoryToken = token;
  try {
    if (token) window.localStorage.setItem(KEY, token);
    else window.localStorage.removeItem(KEY);
  } catch {
    // ignorar: ya quedó en memoria
  }
}

/** Texto crudo: useSyncExternalStore necesita un valor estable entre lecturas. */
export function getSessionUserRaw(): string | null {
  try {
    return window.localStorage.getItem(USER_KEY);
  } catch {
    return memoryUser;
  }
}

export function setSessionUser(user: SessionUser | undefined) {
  memoryUser = user ? JSON.stringify(user) : null;
  try {
    if (memoryUser) window.localStorage.setItem(USER_KEY, memoryUser);
    else window.localStorage.removeItem(USER_KEY);
  } catch {
    // ignorar: ya quedó en memoria
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EVENT));
}
