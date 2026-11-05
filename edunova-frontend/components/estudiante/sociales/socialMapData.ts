import type { PlanetId } from "@/components/estudiante/solar/planetData";
import type { QuizQuestion, CourseProgress } from "@/components/estudiante/shared/quizTypes";

export type StageId = "exploradores" | "aventureros" | "creadores";
export type StationStatus = "locked" | "available" | "completed" | "current";

export type SocialStation = {
  id: string;
  stageId: StageId;
  order: number;
  title: string;
  description: string;
  /** Reutiliza el cuerpo del Sistema Solar 3D */
  planetId: PlanetId;
  questions: QuizQuestion[];
};

export const SOCIAL_COURSE = {
  id: "sociales",
  titulo: "Ciencias Sociales",
  nivelLabel: "Exploradores del tiempo y el mundo",
  storageKey: "edunova-social-map-progress-v1",
};

export const SOCIAL_STAGES = [
  {
    id: "exploradores" as const,
    nombre: "Exploradores",
    subtitle: "Descubre nuestro planeta",
    color: "#2DBE70",
  },
  {
    id: "aventureros" as const,
    nombre: "Aventureros",
    subtitle: "Mapas, tiempo y culturas",
    color: "#4C9EFF",
  },
  {
    id: "creadores" as const,
    nombre: "Creadores",
    subtitle: "Historia y ciudadanía",
    color: "#5636D9",
  },
];

export const SOCIAL_STATIONS: SocialStation[] = [
  {
    id: "s1",
    stageId: "exploradores",
    order: 1,
    title: "Lección 1: Nuestro planeta",
    description: "Reconoce la Tierra en el Sistema Solar y por qué es especial.",
    planetId: "tierra",
    questions: [
      {
        id: "s1q1",
        type: "multiple",
        enunciado: "¿En qué planeta vivimos?",
        opciones: ["Marte", "Tierra", "Júpiter"],
        respuesta: "Tierra",
        explicacion:
          "La Tierra es el planeta donde vivimos y tiene agua líquida en su superficie.",
        pista: "Es el tercer planeta desde el Sol.",
        xp: 20,
      },
      {
        id: "s1q2",
        type: "truefalse",
        enunciado: "La Tierra es el único planeta con vida conocida.",
        opciones: ["Verdadero", "Falso"],
        respuesta: "Verdadero",
        explicacion: "Hasta ahora, la Tierra es el único lugar donde conocemos vida.",
        xp: 15,
      },
      {
        id: "s1q3",
        type: "associate",
        enunciado: "Asocia: gran masa de agua salada que separa continentes",
        opciones: ["Continente", "Océano", "Ciudad"],
        respuesta: "Océano",
        explicacion: "Los océanos cubren gran parte del planeta y conectan los continentes.",
        xp: 15,
      },
    ],
  },
  {
    id: "s2",
    stageId: "exploradores",
    order: 2,
    title: "Lección 2: Sol, Luna y mapas",
    description: "Identifica el Sol y reconoce elementos básicos de un mapa.",
    planetId: "sol",
    questions: [
      {
        id: "s2q1",
        type: "multiple",
        enunciado: "¿Qué es el Sol?",
        opciones: ["Un planeta", "Una estrella", "Una luna"],
        respuesta: "Una estrella",
        explicacion: "El Sol es una estrella: da luz y calor al Sistema Solar.",
        xp: 20,
      },
      {
        id: "s2q2",
        type: "multiple",
        enunciado: "En un mapa sencillo, ¿qué suele indicar la rosa de los vientos?",
        opciones: ["Los colores", "Los puntos cardinales", "Las ciudades"],
        respuesta: "Los puntos cardinales",
        explicacion: "Norte, sur, este y oeste ayudan a orientarnos en el mapa.",
        xp: 20,
      },
      {
        id: "s2q3",
        type: "associate",
        enunciado: "Asocia: ¿Qué nos da calor y luz durante el día?",
        opciones: ["La Luna", "El Sol", "Marte"],
        respuesta: "El Sol",
        explicacion: "El Sol es la fuente principal de luz y energía de la Tierra.",
        xp: 15,
      },
    ],
  },
  {
    id: "s3",
    stageId: "aventureros",
    order: 3,
    title: "Lección 3: Movimientos y continentes",
    description: "Comprende rotación, traslación y ubica continentes.",
    planetId: "tierra",
    questions: [
      {
        id: "s3q1",
        type: "multiple",
        enunciado: "¿Qué movimiento causa el día y la noche?",
        opciones: ["Traslación", "Rotación", "Revolución lunar"],
        respuesta: "Rotación",
        explicacion:
          "La rotación es el giro de la Tierra sobre su eje y produce el día y la noche.",
        pista: "Es el giro sobre sí misma.",
        xp: 25,
      },
      {
        id: "s3q2",
        type: "truefalse",
        enunciado: "La traslación es el viaje de la Tierra alrededor del Sol.",
        opciones: ["Verdadero", "Falso"],
        respuesta: "Verdadero",
        explicacion: "La traslación dura aproximadamente un año.",
        xp: 20,
      },
      {
        id: "s3q3",
        type: "multiple",
        enunciado: "¿Cuántos continentes se suelen reconocer en la escuela?",
        opciones: ["Tres", "Cinco", "Seis o siete"],
        respuesta: "Seis o siete",
        explicacion:
          "Según el criterio, se hablan de seis o siete continentes (América a veces se cuenta como uno o dos).",
        xp: 25,
      },
    ],
  },
  {
    id: "s4",
    stageId: "aventureros",
    order: 4,
    title: "Lección 4: Cultura y vecinos del cielo",
    description: "Compara planetas y explora diversidad cultural.",
    planetId: "marte",
    questions: [
      {
        id: "s4q1",
        type: "multiple",
        enunciado: "¿Cómo se conoce popularmente a Marte?",
        opciones: ["Planeta azul", "Planeta rojo", "Gigante gaseoso"],
        respuesta: "Planeta rojo",
        explicacion: "Marte se ve rojizo por el óxido de hierro en su superficie.",
        xp: 20,
      },
      {
        id: "s4q2",
        type: "order",
        enunciado: "Ordena desde el Sol: Mercurio → … → Tierra",
        orden: ["Mercurio", "Venus", "Tierra"],
        respuesta: "Mercurio|Venus|Tierra",
        explicacion: "Después de Mercurio viene Venus y luego la Tierra.",
        xp: 30,
      },
      {
        id: "s4q3",
        type: "complete",
        enunciado: "Completa: Las tradiciones de un pueblo forman parte de su…",
        opciones: ["cultura", "clima", "órbita"],
        respuesta: "cultura",
        explicacion: "La cultura incluye lenguas, fiestas, comidas y costumbres.",
        xp: 20,
      },
    ],
  },
  {
    id: "s5",
    stageId: "creadores",
    order: 5,
    title: "Lección 5: Escalas e historia",
    description: "Analiza Júpiter y relaciona pasado con consecuencias.",
    planetId: "jupiter",
    questions: [
      {
        id: "s5q1",
        type: "multiple",
        enunciado: "¿Cuál es el planeta más grande del Sistema Solar?",
        opciones: ["Tierra", "Saturno", "Júpiter"],
        respuesta: "Júpiter",
        explicacion: "Júpiter es un gigante gaseoso y el más grande.",
        xp: 25,
      },
      {
        id: "s5q2",
        type: "complete",
        enunciado: "Completa: Júpiter es un planeta de tipo…",
        opciones: ["terrestre", "gaseoso", "enano"],
        respuesta: "gaseoso",
        explicacion: "Los gigantes gaseosos no tienen superficie sólida como la Tierra.",
        xp: 20,
      },
      {
        id: "s5q3",
        type: "multiple",
        enunciado: "¿Para qué sirve una línea de tiempo histórica?",
        opciones: [
          "Solo para dibujar",
          "Para ordenar hechos en el tiempo",
          "Para medir la órbita",
        ],
        respuesta: "Para ordenar hechos en el tiempo",
        explicacion:
          "Las líneas de tiempo ayudan a ver causas, orden y consecuencias de los hechos.",
        xp: 25,
      },
    ],
  },
  {
    id: "s6",
    stageId: "creadores",
    order: 6,
    title: "Lección 6: Ciudadanía y patrimonio",
    description: "Cuida la Tierra, valora la diversidad y actúa como ciudadano.",
    planetId: "tierra",
    questions: [
      {
        id: "s6q1",
        type: "multiple",
        enunciado: "¿Por qué debemos cuidar el agua y el aire de la Tierra?",
        opciones: [
          "Porque no son importantes",
          "Porque hacen posible la vida",
          "Solo por estética",
        ],
        respuesta: "Porque hacen posible la vida",
        explicacion:
          "El agua y el aire limpios son esenciales para las personas, plantas y animales.",
        xp: 30,
      },
      {
        id: "s6q2",
        type: "truefalse",
        enunciado: "Cuidar el planeta es también un acto de ciudadanía.",
        opciones: ["Verdadero", "Falso"],
        respuesta: "Verdadero",
        explicacion:
          "La ciudadanía incluye responsabilidades hacia la comunidad y el entorno.",
        xp: 25,
      },
      {
        id: "s6q3",
        type: "associate",
        enunciado: "Asocia: monumentos, lenguas y fiestas de un país son…",
        opciones: ["Solo turismo", "Patrimonio cultural", "Clima"],
        respuesta: "Patrimonio cultural",
        explicacion:
          "El patrimonio cultural expresa la identidad y la historia de los pueblos.",
        xp: 25,
      },
    ],
  },
];

export const DEFAULT_SOCIAL_PROGRESS: CourseProgress = {
  completedIds: [],
  currentId: "s1",
  xp: 0,
  rewardedIds: [],
};

export function getSocialStatus(
  station: SocialStation,
  progress: CourseProgress,
): StationStatus {
  if (progress.completedIds.includes(station.id)) return "completed";
  if (station.id === progress.currentId) return "current";
  const idx = SOCIAL_STATIONS.findIndex((s) => s.id === station.id);
  if (idx === 0) return "available";
  const prev = SOCIAL_STATIONS[idx - 1];
  if (progress.completedIds.includes(prev.id)) return "available";
  return "locked";
}

export function completeSocialStation(
  stationId: string,
  progress: CourseProgress,
  xpGained: number,
): CourseProgress {
  const already = progress.rewardedIds.includes(stationId);
  const completedIds = progress.completedIds.includes(stationId)
    ? progress.completedIds
    : [...progress.completedIds, stationId];
  const rewardedIds = already
    ? progress.rewardedIds
    : [...progress.rewardedIds, stationId];
  const idx = SOCIAL_STATIONS.findIndex((s) => s.id === stationId);
  const next = SOCIAL_STATIONS[idx + 1];
  return {
    completedIds,
    currentId: next?.id ?? stationId,
    xp: already ? progress.xp : progress.xp + xpGained,
    rewardedIds,
  };
}
