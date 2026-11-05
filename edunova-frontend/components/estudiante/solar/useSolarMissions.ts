"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { completeMission, getUnit } from "@/lib/api/client";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";
import { SOLAR_BODIES, type PlanetId } from "./planetData";

// Misiones del Lab 3D Sistema Solar (HU-03). El texto y la recompensa salen del backend
// (`lab3DIntegration` de cada subtema); estos valores copian la semilla y son el respaldo.

export type Mision = {
  subtopicId: string;
  objetivo: PlanetId;
  texto: string;
  pista: string;
  xp: number;
  coins: number;
};

const MISIONES: Mision[] = [
  {
    subtopicId: "st-solar-1",
    objetivo: "mercurio",
    texto: "Encuentra el Sol y toca el planeta más cercano.",
    pista: "es el primer planeta desde el Sol.",
    xp: 150,
    coins: 50,
  },
  {
    subtopicId: "st-solar-2",
    objetivo: "marte",
    texto: "Viaja a Marte y descubre por qué se ve rojo.",
    pista: "es el planeta que sigue a la Tierra.",
    xp: 150,
    coins: 50,
  },
  {
    subtopicId: "st-solar-3",
    objetivo: "jupiter",
    texto: "Encuentra el planeta más grande: Júpiter.",
    pista: "es el gigante que sigue a Marte.",
    xp: 150,
    coins: 50,
  },
];

export type EstadoPuntos = "guardando" | "guardado" | "sinSesion" | "error";
export type Logro = { mision: Mision; dato: string; puntos: EstadoPuntos };

// El backend suma puntos en cada llamada, así que se recuerda aquí qué misiones ya se cobraron.
const PREFIJO = "edunova-misiones-solar-";
const EVENTO = "edunova-misiones-change";
const enMemoria = new Map<string, string>();

function leer(clave: string) {
  try {
    return window.localStorage.getItem(clave) ?? "[]";
  } catch {
    return enMemoria.get(clave) ?? "[]";
  }
}

function escribir(clave: string, ids: string[]) {
  const valor = JSON.stringify(ids);
  enMemoria.set(clave, valor);
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    // ya quedó en memoria
  }
  window.dispatchEvent(new Event(EVENTO));
}

function suscribir(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENTO, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENTO, onChange);
  };
}

function aLista(raw: string): string[] {
  try {
    const ids: unknown = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function useSolarMissions() {
  const usuario = useSessionUser();
  const estudianteId = usuario?.role === "STUDENT" ? usuario.id : undefined;
  const clave = `${PREFIJO}${estudianteId ?? "invitado"}`;
  const raw = useSyncExternalStore(suscribir, () => leer(clave), () => "[]");
  const hechas = useMemo(() => aLista(raw), [raw]);
  const unidad = useApi(() => getUnit("unit-solar-system"), []);
  const [logro, setLogro] = useState<Logro | null>(null);
  const [pista, setPista] = useState<string | null>(null);

  const misiones = MISIONES.map((m) => {
    const subtemas = unidad.status === "ok" ? unidad.data?.subtopics : undefined;
    const lab = subtemas?.find?.((s) => s.id === m.subtopicId)?.lab3DIntegration;
    return {
      ...m,
      texto: lab?.missionPrompt || m.texto,
      xp: lab?.rewardXP ?? m.xp,
      coins: lab?.rewardCoins ?? m.coins,
    };
  });
  const actual = misiones.find((m) => !hechas.includes(m.subtopicId));

  async function guardar(mision: Mision) {
    const cambiar = (puntos: EstadoPuntos) =>
      setLogro((l) => (l?.mision.subtopicId === mision.subtopicId ? { ...l, puntos } : l));
    if (!estudianteId) {
      cambiar("sinSesion");
      return;
    }
    cambiar("guardando");
    const r = await completeMission({
      studentId: estudianteId,
      labType: "SOLAR_SYSTEM",
      subtopicId: mision.subtopicId,
      rewardXP: mision.xp,
      rewardCoins: mision.coins,
    });
    cambiar(r.ok ? "guardado" : "error");
  }

  /** Se llama cuando el estudiante toca un planeta, en el modelo 3D o en la barra. */
  function seleccionar(id: PlanetId) {
    if (!actual || logro) return;
    if (id !== actual.objetivo) {
      const nombre = SOLAR_BODIES.find((p) => p.id === id)?.name ?? id;
      setPista(`${nombre} no es. Pista: ${actual.pista}`);
      return;
    }
    setPista(null);
    escribir(clave, [...hechas, actual.subtopicId]);
    const dato = SOLAR_BODIES.find((p) => p.id === actual.objetivo)?.info.dato ?? "";
    setLogro({ mision: actual, dato, puntos: "guardando" });
    void guardar(actual);
  }

  return {
    actual,
    numero: hechas.length + 1,
    total: misiones.length,
    pista,
    logro,
    seleccionar,
    reintentar: () => logro && guardar(logro.mision),
    cerrar: () => setLogro(null),
    repetir: () => escribir(clave, []),
  };
}
