import type { QuizQuestion } from "@/components/estudiante/shared/quizTypes";

export type StationStatus = "locked" | "available" | "completed" | "current";
export type StageId = "exploradores" | "aventureros" | "creadores";
export type ComuKind = "lectura" | "audio" | "vocabulario" | "escritura" | "reto";

export type ComuStation = {
  id: string;
  stageId: StageId;
  order: number;
  title: string;
  shortTitle: string;
  description: string;
  kind: ComuKind;
  position: [number, number, number];
  icon: string;
  activityId: string;
};

export type ComuStage = {
  id: StageId;
  nombre: string;
  nivel: string;
  subtitle: string;
  color: string;
  islandCenter: [number, number, number];
};

export const COMU_ASSETS = {
  libro: "/assets/comu/libro.png",
  lectura: "/assets/comu/lectura.png",
  audio: "/assets/comu/audicular.png",
  estrella: "/assets/comu/estrella.png",
  pegatinas: "/assets/comu/pegatinas.png",
  curso: "/assets/comunicacion.png",
} as const;

export const COMU_COURSE = {
  id: "comunicacion",
  titulo: "Comunicación",
  nivelLabel: "El Reino de las Palabras",
  storageKey: "edunova-comu-map-progress-v1",
};

export const COMU_STAGES: ComuStage[] = [
  {
    id: "exploradores",
    nombre: "Exploradores",
    nivel: "Nivel 1",
    subtitle: "Descubre las palabras",
    color: "#E85D9A",
    islandCenter: [-8, 0, 2],
  },
  {
    id: "aventureros",
    nombre: "Aventureros",
    nivel: "Nivel 2",
    subtitle: "Viaja entre historias",
    color: "#5636D9",
    islandCenter: [0, 0.5, -0.5],
  },
  {
    id: "creadores",
    nombre: "Creadores",
    nivel: "Nivel 3",
    subtitle: "Construye tus historias",
    color: "#4C9EFF",
    islandCenter: [9, 0.9, 1],
  },
];

export const COMU_STATIONS: ComuStation[] = [
  {
    id: "c1",
    stageId: "exploradores",
    order: 1,
    title: "Lección 1: Conozcamos los textos",
    shortTitle: "Conozcamos los textos",
    description: "Lee y escucha un cuento corto. Reconoce letras, palabras e ideas simples.",
    kind: "lectura",
    position: [-10.4, 0.55, 3.3],
    icon: COMU_ASSETS.libro,
    activityId: "cuento-luna",
  },
  {
    id: "c2",
    stageId: "exploradores",
    order: 2,
    title: "Lección 2: Palabras que suenan",
    shortTitle: "Palabras que suenan",
    description: "Asocia palabras con imágenes y practica sílabas escuchando audio.",
    kind: "audio",
    position: [-7.8, 0.55, 1.2],
    icon: COMU_ASSETS.audio,
    activityId: "cuento-luna",
  },
  {
    id: "c3",
    stageId: "aventureros",
    order: 3,
    title: "Lección 3: Viaje en la biblioteca",
    shortTitle: "Viaje en la biblioteca",
    description: "Comprende personajes, idea principal y detalles de un relato.",
    kind: "lectura",
    position: [-1.4, 0.95, -0.1],
    icon: COMU_ASSETS.lectura,
    activityId: "cuento-biblioteca",
  },
  {
    id: "c4",
    stageId: "aventureros",
    order: 4,
    title: "Lección 4: Sinónimos mágicos",
    shortTitle: "Sinónimos mágicos",
    description: "Amplía vocabulario: elige sinónimos y completa oraciones.",
    kind: "vocabulario",
    position: [2.0, 0.95, -2.3],
    icon: COMU_ASSETS.estrella,
    activityId: "cuento-biblioteca",
  },
  {
    id: "c5",
    stageId: "creadores",
    order: 5,
    title: "Lección 5: Elige el final",
    shortTitle: "Elige el final",
    description: "Construye una historia ramificada y justifica tu decisión narrativa.",
    kind: "escritura",
    position: [7.6, 1.4, 0.3],
    icon: COMU_ASSETS.pegatinas,
    activityId: "cuento-final",
  },
  {
    id: "c6",
    stageId: "creadores",
    order: 6,
    title: "Lección 6: Publica tu relato",
    shortTitle: "Publica tu relato",
    description: "Revisa, mejora y cierra tu producción escrita. ¡Abre el cofre de las palabras!",
    kind: "reto",
    position: [10.6, 1.4, 2.3],
    icon: COMU_ASSETS.libro,
    activityId: "cuento-final",
  },
];

export type ComuProgress = {
  completedIds: string[];
  currentId: string;
  xp: number;
  rewardedIds: string[];
};

export const DEFAULT_COMU_PROGRESS: ComuProgress = {
  completedIds: [],
  currentId: "c1",
  xp: 0,
  rewardedIds: [],
};

export function loadComuProgress(): ComuProgress {
  if (typeof window === "undefined") return DEFAULT_COMU_PROGRESS;
  try {
    const raw = localStorage.getItem(COMU_COURSE.storageKey);
    if (!raw) return DEFAULT_COMU_PROGRESS;
    const parsed = JSON.parse(raw) as ComuProgress;
    if (!parsed.currentId || !Array.isArray(parsed.completedIds)) {
      return DEFAULT_COMU_PROGRESS;
    }
    return {
      completedIds: parsed.completedIds,
      currentId: parsed.currentId,
      xp: typeof parsed.xp === "number" ? parsed.xp : 0,
      rewardedIds: Array.isArray(parsed.rewardedIds) ? parsed.rewardedIds : [],
    };
  } catch {
    return DEFAULT_COMU_PROGRESS;
  }
}

export function saveComuProgress(progress: ComuProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMU_COURSE.storageKey, JSON.stringify(progress));
}

export function getComuStationStatus(
  station: ComuStation,
  progress: ComuProgress,
): StationStatus {
  if (progress.completedIds.includes(station.id)) return "completed";
  if (station.id === progress.currentId) return "current";
  const idx = COMU_STATIONS.findIndex((s) => s.id === station.id);
  if (idx === 0) return "available";
  const prev = COMU_STATIONS[idx - 1];
  if (progress.completedIds.includes(prev.id)) return "available";
  return "locked";
}

export function completeComuStation(
  stationId: string,
  progress: ComuProgress,
  xpGained = 0,
): ComuProgress {
  const already = progress.rewardedIds.includes(stationId);
  const completedIds = progress.completedIds.includes(stationId)
    ? progress.completedIds
    : [...progress.completedIds, stationId];
  const rewardedIds = already
    ? progress.rewardedIds
    : [...progress.rewardedIds, stationId];
  const idx = COMU_STATIONS.findIndex((s) => s.id === stationId);
  const next = COMU_STATIONS[idx + 1];
  return {
    completedIds,
    currentId: next?.id ?? stationId,
    xp: already ? progress.xp : progress.xp + xpGained,
    rewardedIds,
  };
}

export function comuCompletedCount(progress: ComuProgress) {
  return progress.completedIds.length;
}

/** Contenido de actividades de lectura / comprensión */
export type StoryActivity = {
  id: string;
  title: string;
  paragraphs: string[];
  questions: QuizQuestion[];
};

export const COMU_ACTIVITIES: Record<string, StoryActivity> = {
  "cuento-luna": {
    id: "cuento-luna",
    title: "La luna que aprendió a leer",
    paragraphs: [
      "Había una vez una luna curiosa que quería leer los cuentos de los niños.",
      "Cada noche bajaba un poquito más cerca de la Tierra para mirar las letras brillantes.",
      "Un hada le regaló un libro de estrellas. La luna aprendió su primera palabra: ¡amigo!",
      "Desde entonces, cuando alguien lee en voz alta, la luna sonríe en el cielo.",
    ],
    questions: [
      {
        id: "cl1",
        type: "multiple",
        enunciado: "¿Qué elemento de un cuento nos dice quién participa en la historia?",
        opciones: ["Los personajes", "El título", "El punto final"],
        respuesta: "Los personajes",
        explicacion:
          "Los personajes son quienes participan en los acontecimientos de una historia.",
        pista: "Piensa en quién actúa en el cuento.",
        xp: 20,
      },
      {
        id: "cl2",
        type: "multiple",
        enunciado: "¿Qué quería hacer la luna?",
        opciones: ["Dormir", "Leer cuentos", "Volar al sol"],
        respuesta: "Leer cuentos",
        explicacion: "La luna quería leer los cuentos de los niños.",
        xp: 15,
      },
      {
        id: "cl3",
        type: "truefalse",
        enunciado: "La primera palabra que aprendió la luna fue «amigo».",
        opciones: ["Verdadero", "Falso"],
        respuesta: "Verdadero",
        explicacion: "Así lo cuenta el cuento: su primera palabra fue amigo.",
        xp: 15,
      },
    ],
  },
  "cuento-biblioteca": {
    id: "cuento-biblioteca",
    title: "El secreto de la biblioteca flotante",
    paragraphs: [
      "En el Reino de las Palabras hay una biblioteca que flota entre nubes rosadas.",
      "Lía buscaba un libro perdido: el de las ideas principales.",
      "Siguiendo pistas en los estantes, descubrió que cada párrafo guarda un secreto.",
      "Al final entendió: la idea principal es lo más importante que el autor quiere contar.",
    ],
    questions: [
      {
        id: "cb1",
        type: "multiple",
        enunciado: "¿Qué es la idea principal de un texto?",
        opciones: [
          "Un detalle menor",
          "Lo más importante que el autor quiere contar",
          "Solo el título",
        ],
        respuesta: "Lo más importante que el autor quiere contar",
        explicacion:
          "La idea principal resume el mensaje central del texto.",
        xp: 25,
      },
      {
        id: "cb2",
        type: "associate",
        enunciado: "Asocia: sinónimo de «buscar»",
        opciones: ["Dormir", "Procurar / indagar", "Cerrar"],
        respuesta: "Procurar / indagar",
        explicacion: "Buscar se relaciona con procurar o indagar.",
        xp: 20,
      },
      {
        id: "cb3",
        type: "order",
        enunciado: "Ordena el inicio de una historia simple",
        orden: ["Había una vez", "un personaje", "que vivía una aventura"],
        respuesta: "Había una vez|un personaje|que vivía una aventura",
        explicacion: "Así suele comenzar un cuento tradicional.",
        xp: 30,
      },
    ],
  },
  "cuento-final": {
    id: "cuento-final",
    title: "Tú decides el final",
    paragraphs: [
      "El castillo de libros abrió sus puertas. Dentro había dos caminos de palabras.",
      "Uno llevaba a un final feliz con una carta de amistad.",
      "El otro a un final misterioso con una pregunta sin respuesta.",
      "Como creador o creadora, eliges cómo termina la historia… y por qué.",
    ],
    questions: [
      {
        id: "cf1",
        type: "multiple",
        enunciado: "¿Quién elige el final en una historia ramificada?",
        opciones: ["Solo el rey", "El lector o creador", "Nadie"],
        respuesta: "El lector o creador",
        explicacion:
          "En historias interactivas, quien lee o crea decide el camino.",
        xp: 25,
      },
      {
        id: "cf2",
        type: "truefalse",
        enunciado: "Revisar y mejorar un texto forma parte de la escritura.",
        opciones: ["Verdadero", "Falso"],
        respuesta: "Verdadero",
        explicacion: "Escribir también es corregir, mejorar y justificar ideas.",
        xp: 20,
      },
      {
        id: "cf3",
        type: "complete",
        enunciado: "Completa: Un texto de opinión expresa un…",
        opciones: ["punto de vista", "solo un título", "número"],
        respuesta: "punto de vista",
        explicacion: "Los textos de opinión argumentan un punto de vista.",
        xp: 25,
      },
    ],
  },
};
