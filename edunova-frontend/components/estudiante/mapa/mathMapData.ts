export type StationStatus = "locked" | "available" | "completed" | "current";

export type StageId = "exploradores" | "aventureros" | "creadores";

export type StationKind = "teoria" | "juego" | "explorar3d" | "reto";

export type MathStation = {
  id: string;
  stageId: StageId;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  kind: StationKind;
  /** Posición en el mapa 3D [x, y, z] */
  position: [number, number, number];
  /** Modelo geométrico asociado (si aplica) */
  geometry?: "cube" | "sphere" | "cone" | "cylinder" | "pyramid" | "prism";
  /** Icono llamativo en /public/assets/matematica */
  icon: string;
};

/** Assets de geometría (public/assets/matematica) */
export const MATH_ASSETS = {
  matematica: "/assets/matematica/matematica.png",
  compas: "/assets/matematica/compas.png",
  regla: "/assets/matematica/regla.png",
  figura3d: "/assets/matematica/figura3d.png",
  libro: "/assets/matematica/libro.png",
  tesoro: "/assets/matematica/busqueda-tesoro.png",
  avatar: "/assets/usuario.png",
} as const;

export type MathStage = {
  id: StageId;
  nombre: string;
  nivel: string;
  subtitle: string;
  color: string;
  islandCenter: [number, number, number];
};

export const MATH_COURSE = {
  id: "matematica",
  titulo: "Matemática",
  nivelLabel: "Nivel 1: Geometría divertida",
  storageKey: "edunova-math-map-progress-v1",
};

export const MATH_STAGES: MathStage[] = [
  {
    id: "exploradores",
    nombre: "Exploradores",
    nivel: "Nivel 1",
    subtitle: "Geometría básica",
    color: "#2DBE70",
    islandCenter: [-8, 0, 2],
  },
  {
    id: "aventureros",
    nombre: "Aventureros",
    nivel: "Nivel 2",
    subtitle: "Geometría y problemas",
    color: "#4C9EFF",
    islandCenter: [0, 0.4, -1],
  },
  {
    id: "creadores",
    nombre: "Creadores",
    nivel: "Nivel 3",
    subtitle: "Geometría avanzada",
    color: "#5636D9",
    islandCenter: [9, 0.8, 1],
  },
];

/** 6 estaciones en un camino continuo a través de las 3 islas */
export const MATH_STATIONS: MathStation[] = [
  {
    id: "e1",
    stageId: "exploradores",
    order: 1,
    title: "Lección 1: Figuras planas",
    shortTitle: "Figuras planas",
    description:
      "Reconoce círculos, cuadrados y triángulos. Cuenta lados y vértices.",
    kind: "teoria",
    position: [-10.5, 0.55, 3.2],
    icon: MATH_ASSETS.libro,
  },
  {
    id: "e2",
    stageId: "exploradores",
    order: 2,
    title: "Lección 2: El cubo",
    shortTitle: "El cubo",
    description:
      "Explora caras, aristas y vértices del cubo en un modelo 3D interactivo.",
    kind: "explorar3d",
    position: [-8.2, 0.55, 1.4],
    geometry: "cube",
    icon: MATH_ASSETS.compas,
  },
  {
    id: "a1",
    stageId: "aventureros",
    order: 3,
    title: "Lección 3: Figuras 3D",
    shortTitle: "Figuras 3D",
    description:
      "Compara esferas, conos y cilindros. Compón y descompón cuerpos.",
    kind: "juego",
    position: [-1.5, 0.85, -0.2],
    geometry: "sphere",
    icon: MATH_ASSETS.figura3d,
  },
  {
    id: "a2",
    stageId: "aventureros",
    order: 4,
    title: "Lección 4: Perímetro y área",
    shortTitle: "Perímetro y área",
    description:
      "Resuelve retos de medición sobre figuras planas y caras de cuerpos.",
    kind: "reto",
    position: [1.8, 0.85, -2.2],
    geometry: "cone",
    icon: MATH_ASSETS.regla,
  },
  {
    id: "c1",
    stageId: "creadores",
    order: 5,
    title: "Lección 5: Volumen",
    shortTitle: "Volumen",
    description:
      "Calcula volumen y superficie. Construye modelos con restricciones.",
    kind: "explorar3d",
    position: [7.5, 1.25, 0.4],
    geometry: "pyramid",
    icon: MATH_ASSETS.matematica,
  },
  {
    id: "c2",
    stageId: "creadores",
    order: 6,
    title: "Lección 6: Diseño 3D",
    shortTitle: "Diseño 3D",
    description:
      "Diseña una estructura con prismas y cilindros. ¡Abre el cofre final!",
    kind: "reto",
    position: [10.5, 1.25, 2.2],
    geometry: "cylinder",
    icon: MATH_ASSETS.tesoro,
  },
];

export type MathProgress = {
  completedIds: string[];
  currentId: string;
};

export const DEFAULT_PROGRESS: MathProgress = {
  completedIds: [],
  currentId: "e1",
};

export function loadMathProgress(): MathProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(MATH_COURSE.storageKey);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as MathProgress;
    if (!parsed.currentId || !Array.isArray(parsed.completedIds)) {
      return DEFAULT_PROGRESS;
    }
    return parsed;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveMathProgress(progress: MathProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MATH_COURSE.storageKey, JSON.stringify(progress));
}

export function getStationStatus(
  station: MathStation,
  progress: MathProgress,
): StationStatus {
  if (progress.completedIds.includes(station.id)) return "completed";
  if (station.id === progress.currentId) return "current";
  const idx = MATH_STATIONS.findIndex((s) => s.id === station.id);
  const currentIdx = MATH_STATIONS.findIndex((s) => s.id === progress.currentId);
  if (idx < currentIdx) return "available";
  // available if previous is completed or this is first unlocked
  if (idx === 0) return "available";
  const prev = MATH_STATIONS[idx - 1];
  if (progress.completedIds.includes(prev.id)) return "available";
  return "locked";
}

export function completeStation(
  stationId: string,
  progress: MathProgress,
): MathProgress {
  const completedIds = progress.completedIds.includes(stationId)
    ? progress.completedIds
    : [...progress.completedIds, stationId];
  const idx = MATH_STATIONS.findIndex((s) => s.id === stationId);
  const next = MATH_STATIONS[idx + 1];
  return {
    completedIds,
    currentId: next?.id ?? stationId,
  };
}

export function completedCount(progress: MathProgress) {
  return progress.completedIds.length;
}
