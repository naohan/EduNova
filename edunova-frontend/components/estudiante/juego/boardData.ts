import type { CursoId } from "@/components/estudiante/data";
import type { QuizQuestion } from "@/components/estudiante/shared/quizTypes";
import { JUEGO_ASSETS } from "./assets";
import type { BoardTile, CharacterClass, CharacterProfile, GameLevel, Territory } from "./gameTypes";

export const CHARACTER_PROFILES: Record<CharacterClass, CharacterProfile> = {
  aventurera: {
    id: "aventurera",
    avatarId: "reina",
    name: "Aventurera Valiente",
    archetype: "Líder de Expedición",
    avatarSrc: JUEGO_ASSETS.avatars[0].src,
    color: "#E85D9A",
    accent: "#FFF0F5",
    stats: {
      vida: 3,
      logica: 4,
      energia: 4,
      cooperacion: 5,
    },
    passiveName: "Aura de Liderazgo",
    passiveDesc: "Gana +50 NovaCoins extras en casillas de Recompensa y Cooperación.",
    activeName: "Escudo Guardián",
    activeDesc: "Activa un escudo que absorbe el siguiente error sin perder vidas.",
    activeIcon: "🛡️",
  },
  explorador: {
    id: "explorador",
    avatarId: "nino",
    name: "Explorador Curioso",
    archetype: "Pionero Veloz",
    avatarSrc: JUEGO_ASSETS.avatars[1].src,
    color: "#FF8A3D",
    accent: "#FFF7ED",
    stats: {
      vida: 4,
      logica: 3,
      energia: 5,
      cooperacion: 4,
    },
    passiveName: "Paso Firme",
    passiveDesc: "Comienza con 4 corazones de vida máxima y recupera energía rápido.",
    activeName: "Brújula de la Suerte",
    activeDesc: "Permite volver a tirar el dado si no te gusta el número obtenido.",
    activeIcon: "🧭",
  },
  cientifico: {
    id: "cientifico",
    avatarId: "estudiante",
    name: "Científico Prodigio",
    archetype: "Genio Analítico",
    avatarSrc: JUEGO_ASSETS.avatars[2].src,
    color: "#5636D9",
    accent: "#F2EEFF",
    stats: {
      vida: 3,
      logica: 5,
      energia: 3,
      cooperacion: 4,
    },
    passiveName: "Mente Maestra",
    passiveDesc: "Otorga +50% de XP adicional y revela pistas de la Mascota Robot.",
    activeName: "Hipótesis Cuántica",
    activeDesc: "Elimina una opción incorrecta en la pregunta actual para asegurar el acierto.",
    activeIcon: "🧪",
  },
  gamer: {
    id: "gamer",
    avatarId: "auriculares",
    name: "Cibernauta Audaz",
    archetype: "Estratega Veloz",
    avatarSrc: JUEGO_ASSETS.avatars[3].src,
    color: "#25CFE0",
    accent: "#ECFEFF",
    stats: {
      vida: 3,
      logica: 4,
      energia: 5,
      cooperacion: 3,
    },
    passiveName: "Combo Supernova",
    passiveDesc: "Cada 2 aciertos consecutivos duplica las NovaCoins ganadas (x2 Combo).",
    activeName: "Turbo Boost",
    activeDesc: "Añade +2 casillas a tu tirada de dados para llegar a la casilla deseada.",
    activeIcon: "⚡",
  },
};

export const GAME_LEVELS: GameLevel[] = [
  {
    level: 1,
    name: "Nivel 1: Bosque de los Fundamentos",
    subtitle: "Tier Explorador (7–9 años) • Conceptos iniciales y descubrimiento",
    theme: "bosque",
    skyGradient: "linear-gradient(180deg,#C4B5FD 0%,#9BB8FF 25%,#7EC8F0 50%,#6BCB77 78%,#4CAF50 100%)",
    islandGradient: "radial-gradient(ellipse at 50% 35%, #93E06E 0%, #5CBF4E 60%, #388E3C 100%)",
    starsOpacity: 0,
    requiredTerritories: 1,
    rewardCoins: 150,
    rewardXP: 200,
    badge: "🌱 Brote del Saber",
  },
  {
    level: 2,
    name: "Nivel 2: Valle de los Cristales Cuánticos",
    subtitle: "Tier Aventurero (10–12 años) • Retos interactivos y enigmas",
    theme: "cristal",
    skyGradient: "linear-gradient(180deg,#F59E0B 0%,#EC4899 35%,#8B5CF6 65%,#3B82F6 100%)",
    islandGradient: "radial-gradient(ellipse at 50% 35%, #A78BFA 0%, #7C3AED 60%, #4C1D95 100%)",
    starsOpacity: 0.35,
    requiredTerritories: 3,
    rewardCoins: 250,
    rewardXP: 350,
    badge: "💎 Cristal del Conocimiento",
  },
  {
    level: 3,
    name: "Nivel 3: Montaña de las Ecuaciones de Fuego",
    subtitle: "Tier Creador (13–15 años) • Cooperación y razonamiento profundo",
    theme: "volcan",
    skyGradient: "linear-gradient(180deg,#1E1B4B 0%,#4C1D95 30%,#BE185D 70%,#EA580C 100%)",
    islandGradient: "radial-gradient(ellipse at 50% 35%, #F97316 0%, #C2410C 60%, #7C2D12 100%)",
    starsOpacity: 0.65,
    requiredTerritories: 5,
    rewardCoins: 400,
    rewardXP: 500,
    badge: "🔥 Llama de la Ciencia",
  },
  {
    level: 4,
    name: "Nivel 4: Castillo del Saber Supremo (Jefe Final)",
    subtitle: "Desafío Maestro • Copa Intercolegial Supernova",
    theme: "castillo",
    skyGradient: "linear-gradient(180deg,#0B0A26 0%,#1E1B4B 35%,#312E81 65%,#4338CA 100%)",
    islandGradient: "radial-gradient(ellipse at 50% 35%, #FDE047 0%, #CA8A04 50%, #4338CA 100%)",
    starsOpacity: 0.95,
    requiredTerritories: 6,
    rewardCoins: 600,
    rewardXP: 800,
    badge: "👑 Copa Supernova EduNova",
  },
];

export function getCharacterProfileByAvatar(avatarId: string): CharacterProfile {
  const found = Object.values(CHARACTER_PROFILES).find((p) => p.avatarId === avatarId);
  return found ?? CHARACTER_PROFILES.explorador;
}

export const COURSE_OPTIONS: {
  id: CursoId;
  nombre: string;
  desc: string;
  icon: string;
  topics: string[];
  mission: string;
}[] = [
  {
    id: "matematica",
    nombre: "Matemática",
    desc: "Fracciones, operaciones y geometría en equipo.",
    icon: JUEGO_ASSETS.calculadora,
    topics: ["Fracciones", "Operaciones", "Geometría"],
    mission: "Construir la Ciudad del Conocimiento",
  },
  {
    id: "comunicacion",
    nombre: "Comunicación",
    desc: "Lectura, vocabulario e historias colaborativas.",
    icon: JUEGO_ASSETS.libroAbierto,
    topics: ["Comprensión lectora", "Vocabulario", "Escritura"],
    mission: "Recuperar los tesoros de la biblioteca",
  },
  {
    id: "ciencia",
    nombre: "Ciencia y Tecnología",
    desc: "Cuerpo humano, energía y experimentos.",
    icon: JUEGO_ASSETS.ciencia,
    topics: ["Cuerpo humano", "Ecosistemas", "Energía"],
    mission: "Completar la expedición científica",
  },
  {
    id: "sociales",
    nombre: "Ciencias Sociales",
    desc: "Geografía, historia y ciudadanía.",
    icon: JUEGO_ASSETS.globo,
    topics: ["Geografía", "Historia", "Ciudadanía"],
    mission: "Restaurar el museo educativo",
  },
];

/** Recorrido tipo Monopoly (16 casillas, como el mockup) */
export const BOARD_TILES: BoardTile[] = [
  { id: 0, kind: "salida", label: "SALIDA +50 XP", color: "#E85D5D", icon: JUEGO_ASSETS.estrella },
  { id: 1, kind: "pregunta", label: "Pregunta", color: "#7C4DFF", icon: JUEGO_ASSETS.pregunta },
  { id: 2, kind: "desafio", label: "Desafío", color: "#FFC928", icon: JUEGO_ASSETS.estrella },
  { id: 3, kind: "recompensa", label: "Premio", color: "#FF8A3D", icon: JUEGO_ASSETS.regalo },
  { id: 4, kind: "cooperacion", label: "Cooperar", color: "#4C9EFF", icon: JUEGO_ASSETS.libroAzul },
  { id: 5, kind: "pregunta", label: "Pregunta", color: "#E85D9A", icon: JUEGO_ASSETS.pregunta },
  { id: 6, kind: "evento", label: "Sorpresa", color: "#25CFE0", icon: JUEGO_ASSETS.trofeo },
  { id: 7, kind: "desafio", label: "Desafío", color: "#FFC928", icon: JUEGO_ASSETS.estrella },
  { id: 8, kind: "pregunta", label: "Pregunta", color: "#7C4DFF", icon: JUEGO_ASSETS.pregunta },
  { id: 9, kind: "recompensa", label: "Premio", color: "#FF8A3D", icon: JUEGO_ASSETS.regalo },
  { id: 10, kind: "descanso", label: "Descanso", color: "#A78BFA", icon: JUEGO_ASSETS.libroAzul },
  { id: 11, kind: "pregunta", label: "Pregunta", color: "#E85D9A", icon: JUEGO_ASSETS.pregunta },
  { id: 12, kind: "cooperacion", label: "Cooperar", color: "#4C9EFF", icon: JUEGO_ASSETS.libroAzul },
  { id: 13, kind: "desafio", label: "Desafío", color: "#FFC928", icon: JUEGO_ASSETS.estrella },
  { id: 14, kind: "evento", label: "Sorpresa", color: "#25CFE0", icon: JUEGO_ASSETS.trofeo },
  { id: 15, kind: "pregunta", label: "Pregunta", color: "#7C4DFF", icon: JUEGO_ASSETS.pregunta },
];

export const TERRITORIES: Territory[] = [
  { id: "bosque", nombre: "Bosque de Fracciones", image: JUEGO_ASSETS.territorioBosque, unlocked: false },
  { id: "valle", nombre: "Valle de Números", image: JUEGO_ASSETS.territorioCristales, unlocked: false },
  { id: "montana", nombre: "Montaña de Operaciones", image: JUEGO_ASSETS.territorioMontana, unlocked: false },
  { id: "rio", nombre: "Río de Problemas", image: JUEGO_ASSETS.territorioCascada, unlocked: false },
  { id: "isla", nombre: "Isla del Saber", image: JUEGO_ASSETS.castillo, unlocked: false },
  { id: "cumbre", nombre: "Cumbre Colaborativa", image: JUEGO_ASSETS.territorioMontana, unlocked: false },
];

const Q = (
  partial: Omit<QuizQuestion, "id"> & { id?: string },
  id: string,
): QuizQuestion => ({ id, ...partial });

export const QUESTIONS_BY_COURSE: Record<CursoId, QuizQuestion[]> = {
  matematica: [
    Q(
      {
        type: "multiple",
        enunciado: "¿Qué fracción representa la mitad de un pastel?",
        opciones: ["1/4", "1/2", "1/3", "2/2"],
        respuesta: "1/2",
        explicacion: "La mitad se escribe como 1/2.",
        pista: "Corta el pastel en 2 partes iguales.",
        xp: 50,
      },
      "m1",
    ),
    Q(
      {
        type: "truefalse",
        enunciado: "3/4 es mayor que 1/2.",
        opciones: ["Verdadero", "Falso"],
        respuesta: "Verdadero",
        explicacion: "3/4 = 0,75 y 1/2 = 0,5.",
        xp: 40,
      },
      "m2",
    ),
    Q(
      {
        type: "multiple",
        enunciado: "¿Cuánto es 7 + 5?",
        opciones: ["10", "12", "13", "11"],
        respuesta: "12",
        explicacion: "7 + 5 = 12.",
        xp: 30,
      },
      "m3",
    ),
    Q(
      {
        type: "order",
        enunciado: "Ordena de menor a mayor",
        orden: ["1/4", "1/2", "3/4"],
        respuesta: "1/4|1/2|3/4",
        explicacion: "Así van creciendo las fracciones con mismo denominador relativo.",
        xp: 55,
      },
      "m4",
    ),
    Q(
      {
        type: "associate",
        enunciado: "Asocia: un triángulo tiene…",
        opciones: ["3 lados", "4 lados", "5 lados"],
        respuesta: "3 lados",
        explicacion: "Tri = tres.",
        xp: 35,
      },
      "m5",
    ),
  ],
  comunicacion: [
    Q(
      {
        type: "multiple",
        enunciado: "¿Quiénes participan en un cuento?",
        opciones: ["Los personajes", "Solo el título", "El punto final"],
        respuesta: "Los personajes",
        explicacion: "Los personajes viven la historia.",
        xp: 40,
      },
      "c1",
    ),
    Q(
      {
        type: "truefalse",
        enunciado: "Un sinónimo de «feliz» puede ser «contento».",
        opciones: ["Verdadero", "Falso"],
        respuesta: "Verdadero",
        explicacion: "Significan algo parecido.",
        xp: 35,
      },
      "c2",
    ),
    Q(
      {
        type: "complete",
        enunciado: "Completa: la idea principal es lo más… del texto",
        opciones: ["importante", "pequeño", "oscuro"],
        respuesta: "importante",
        explicacion: "Resume el mensaje central.",
        xp: 45,
      },
      "c3",
    ),
  ],
  ciencia: [
    Q(
      {
        type: "multiple",
        enunciado: "¿Qué órgano bombea la sangre?",
        opciones: ["Pulmones", "Corazón", "Estómago"],
        respuesta: "Corazón",
        explicacion: "El corazón impulsa la sangre.",
        xp: 40,
      },
      "s1",
    ),
    Q(
      {
        type: "truefalse",
        enunciado: "Los pulmones intercambian oxígeno y CO₂.",
        opciones: ["Verdadero", "Falso"],
        respuesta: "Verdadero",
        explicacion: "Así respiramos.",
        xp: 35,
      },
      "s2",
    ),
    Q(
      {
        type: "associate",
        enunciado: "Asocia: el cerebro pertenece al sistema…",
        opciones: ["Nervioso", "Digestivo", "Urinario"],
        respuesta: "Nervioso",
        explicacion: "Controla el cuerpo.",
        xp: 40,
      },
      "s3",
    ),
  ],
  sociales: [
    Q(
      {
        type: "multiple",
        enunciado: "¿En qué planeta vivimos?",
        opciones: ["Marte", "Tierra", "Júpiter"],
        respuesta: "Tierra",
        explicacion: "Nuestro hogar es la Tierra.",
        xp: 40,
      },
      "so1",
    ),
    Q(
      {
        type: "truefalse",
        enunciado: "La rotación de la Tierra causa el día y la noche.",
        opciones: ["Verdadero", "Falso"],
        respuesta: "Verdadero",
        explicacion: "Gira sobre su eje.",
        xp: 35,
      },
      "so2",
    ),
    Q(
      {
        type: "complete",
        enunciado: "Completa: los océanos son grandes masas de…",
        opciones: ["agua salada", "arena", "hielo solo"],
        respuesta: "agua salada",
        explicacion: "Cubren gran parte del planeta.",
        xp: 40,
      },
      "so3",
    ),
  ],
};

export function pickQuestion(courseId: CursoId): QuizQuestion {
  const list = QUESTIONS_BY_COURSE[courseId];
  return list[Math.floor(Math.random() * list.length)];
}

/** Posiciones en % para tablero cuadrado (sentido horario desde abajo-izquierda) */
export function tilePosition(index: number, total = BOARD_TILES.length) {
  const side = Math.max(1, Math.floor(total / 4));
  const i = index % total;
  const inset = 9;
  const span = 100 - inset * 2;
  const den = Math.max(side - 1, 1);

  if (i < side) {
    return { left: `${inset + (i / den) * span}%`, top: `${100 - inset}%` };
  }
  if (i < side * 2) {
    const t = i - side;
    return { left: `${100 - inset}%`, top: `${100 - inset - (t / den) * span}%` };
  }
  if (i < side * 3) {
    const t = i - side * 2;
    return { left: `${100 - inset - (t / den) * span}%`, top: `${inset}%` };
  }
  const t = i - side * 3;
  return { left: `${inset}%`, top: `${inset + (t / den) * span}%` };
}

export function codeGenerator() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
