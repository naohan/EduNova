import type { Flashcard } from "@/lib/api/edunova-contract";

// RF-03: una tarjeta con error o duda vuelve pronto en esta sesión y queda primera en la siguiente.
// Nunca resta puntos.

/** Cuántas tarjetas pasan antes de que reaparezca la que falló. */
export const POSICION_REPASO = 2;

const CLAVE_REPASO = "edunova-flashcards-repaso";

export const TARJETAS_RESPALDO: Flashcard[] = [
  { id: "fc-local-1", front: "¿Cuál es el planeta más grande?", back: "Júpiter" },
  { id: "fc-local-2", front: "¿Qué planeta se ve rojo?", back: "Marte" },
  { id: "fc-local-3", front: "¿Qué estrella está en el centro del Sistema Solar?", back: "El Sol" },
  { id: "fc-local-4", front: "¿Cuál es el planeta más cercano al Sol?", back: "Mercurio" },
  { id: "fc-local-5", front: "¿Cuántos planetas tiene el Sistema Solar?", back: "Ocho" },
  { id: "fc-local-6", front: "¿Qué planeta tiene los anillos más visibles?", back: "Saturno" },
  { id: "fc-local-7", front: "¿Qué fuerza mantiene a los planetas en órbita?", back: "La gravedad" },
];

/** Une las tarjetas del servidor con las locales, sin repetir la misma pregunta. */
export function unirTarjetas(delServidor: Flashcard[]) {
  const porPregunta = new Map<string, Flashcard>();
  for (const tarjeta of [...delServidor, ...TARJETAS_RESPALDO]) {
    if (!porPregunta.has(tarjeta.front)) porPregunta.set(tarjeta.front, tarjeta);
  }
  return [...porPregunta.values()];
}

/** Las preguntas pendientes de repaso van primero. */
export function armarCola(tarjetas: Flashcard[], repaso: string[]) {
  const pendiente = (t: Flashcard) => repaso.includes(t.front);
  return [...tarjetas.filter(pendiente), ...tarjetas.filter((t) => !pendiente(t))];
}

/** Saca la primera tarjeta; si el estudiante no la sabía, la devuelve unas posiciones más atrás. */
export function avanzarCola(cola: Flashcard[], laSabia: boolean) {
  const [actual, ...resto] = cola;
  if (laSabia || !actual) return resto;
  const posicion = Math.min(POSICION_REPASO, resto.length);
  return [...resto.slice(0, posicion), actual, ...resto.slice(posicion)];
}

export function leerRepaso(): string[] {
  try {
    const guardado: unknown = JSON.parse(window.localStorage.getItem(CLAVE_REPASO) ?? "[]");
    return Array.isArray(guardado) ? guardado.filter((p): p is string => typeof p === "string") : [];
  } catch {
    return [];
  }
}

export function guardarRepaso(preguntas: string[]) {
  try {
    window.localStorage.setItem(CLAVE_REPASO, JSON.stringify(preguntas));
  } catch {
    // sin almacenamiento, el repaso solo dura esta sesión
  }
}
