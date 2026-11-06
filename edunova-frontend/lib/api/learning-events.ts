import type { EventsBatchResponse, LearningEvent } from "./edunova-contract";
import { guardarEventos } from "./offline-queue";
import { getSessionUserRaw, type SessionUser } from "./session";

// Datos de proceso: cada respuesta deja un evento con acierto, intento, pistas y tiempo. De aquí salen
// el dominio (BKT), las alertas y los talentos. Solo se registra actividad de estudiantes con sesión.

function sesionDeEstudiante() {
  try {
    const raw = getSessionUserRaw();
    return raw ? (JSON.parse(raw) as SessionUser).role === "STUDENT" : false;
  } catch {
    return false;
  }
}

// randomUUID solo existe en https o localhost; un celular en la red local entra por http.
const nuevoId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

/** Milisegundos desde una marca de tiempo; 0 si todavía no hay marca. */
export const msDesde = (inicio: number) => (inicio ? Date.now() - inicio : 0);
export const marcaDeTiempo = () => Date.now();

export async function registrarEvento(
  datos: Omit<LearningEvent, "id" | "occurredAt">
): Promise<EventsBatchResponse | undefined> {
  if (!sesionDeEstudiante()) return undefined;
  return guardarEventos([{ ...datos, id: nuevoId(), occurredAt: new Date().toISOString() }]);
}
