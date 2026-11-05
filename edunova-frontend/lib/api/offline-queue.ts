import { completeMission, syncProgress } from "./client";

// Cola de progreso sin conexión (HU-08). Lo que el estudiante gana sin red se guarda en este
// dispositivo y se envía al volver internet. Solo se encola si el navegador está sin red: tras un
// tiempo agotado con red el servidor pudo haber guardado, y reenviar duplicaría los puntos.

type Mision = Parameters<typeof completeMission>[0];
type Eventos = Parameters<typeof syncProgress>[1];
type Pendiente =
  | { tipo: "mision"; input: Mision }
  | { tipo: "progreso"; studentId: string; eventos: Eventos };

export type ResultadoGuardado = "guardado" | "enCola" | "error";

const KEY = "edunova-cola-offline";
export const COLA_EVENT = "edunova-cola-change";

let enMemoria: Pendiente[] = [];
let sincronizando = false;

function leer(): Pendiente[] {
  try {
    const guardado: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(guardado) ? (guardado as Pendiente[]) : [];
  } catch {
    return enMemoria;
  }
}

function escribir(cola: Pendiente[]) {
  enMemoria = cola;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cola));
  } catch {
    // ya quedó en memoria
  }
  window.dispatchEvent(new Event(COLA_EVENT));
}

const sinRed = () => typeof navigator !== "undefined" && !navigator.onLine;
const encolar = (item: Pendiente) => escribir([...leer(), item]);

export function contarPendientes() {
  return leer().length;
}

async function guardar(item: Pendiente, enviar: () => Promise<{ ok: boolean }>): Promise<ResultadoGuardado> {
  if (sinRed()) {
    encolar(item);
    return "enCola";
  }
  const r = await enviar();
  if (r.ok) return "guardado";
  if (sinRed()) {
    encolar(item);
    return "enCola";
  }
  return "error";
}

export const guardarMision = (input: Mision) =>
  guardar({ tipo: "mision", input }, () => completeMission(input));

export const guardarProgreso = (studentId: string, eventos: Eventos) =>
  guardar({ tipo: "progreso", studentId, eventos }, () => syncProgress(studentId, eventos));

/** Envía la cola en orden. Si se corta la red, lo que falta queda para la próxima vez. */
export async function sincronizarCola() {
  if (sincronizando) return;
  sincronizando = true;
  try {
    for (;;) {
      const [item, ...resto] = leer();
      if (!item || sinRed()) return;
      const r =
        item.tipo === "mision" ? await completeMission(item.input) : await syncProgress(item.studentId, item.eventos);
      if (!r.ok && r.status === 0) return;
      // Un rechazo del servidor (4xx) no se arregla reintentando: se descarta para no bloquear la cola.
      escribir(resto);
    }
  } finally {
    sincronizando = false;
  }
}
