// Sesión de demostración: guarda el token que devuelve POST /api/auth/login.
// No es seguridad real, solo ordena qué ve cada rol en el demo.

const KEY = "edunova-demo-token";
let memoryToken: string | undefined;

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
