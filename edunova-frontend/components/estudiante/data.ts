import { ListChecksIcon, BookOpenIcon, BrainIcon, CameraIcon, ChatCircleIcon, CubeIcon, FlagIcon, HandshakeIcon, LightbulbIcon, LightningIcon, ListNumbersIcon, MicroscopeIcon, PencilLineIcon, QuestionIcon, TargetIcon, TrophyIcon, UsersIcon } from "@/components/ui/icons";

export const estudiante = {
  nombre: "Gloria",
  apellido: "",
  nivel: "Aventurero",
  edad: 11,
  racha: 5,
  puntos: 1240,
  progresoGeneral: 65,
  progresoTotal: 72,
};

export type CursoId = "matematica" | "comunicacion" | "ciencia" | "sociales";

export type CursoAprender = {
  id: CursoId;
  nombre: string;
  desc: string;
  imagen: string;
  href: string;
  tint: string;
  tagline: string;
  iconoCurso: string;
  ctaHref: string;
};

export const cursosAprender: CursoAprender[] = [
  {
    id: "matematica",
    nombre: "Matemática",
    desc: "Operaciones, geometría, patrones y resolución de problemas.",
    imagen: "/assets/matematica/matematica.png",
    /** Enlace directo a la aventura 3D */
    href: "/estudiante/matematica/mapa",
    tint: "bg-[#F2EEFF]",
    tagline: "Explora números, formas y problemas del día a día.",
    iconoCurso: "/assets/matematica/matematica.png",
    ctaHref: "/estudiante/matematica/mapa",
  },
  {
    id: "comunicacion",
    nombre: "Comunicación",
    desc: "Comprensión lectora, vocabulario y producción de textos.",
    imagen: "/assets/comunicacion.png",
    href: "/estudiante/comunicacion/mapa",
    tint: "bg-[#FFEAF2]",
    tagline: "Lee, escribe y comparte ideas con creatividad.",
    iconoCurso: "/assets/comu/libro.png",
    ctaHref: "/estudiante/comunicacion/mapa",
  },
  {
    id: "ciencia",
    nombre: "Ciencia y Tecnología",
    desc: "Cuerpo humano, ecosistemas, materia y energía.",
    imagen: "/assets/cienciatecnologia.png",
    href: "/estudiante/cuerpo",
    tint: "bg-[#EAF6FF]",
    tagline: "Explora, experimenta y descubre cómo funciona el mundo que te rodea.",
    iconoCurso: "/assets/aprender/frasco_ciencia.png",
    ctaHref: "/estudiante/cuerpo",
  },
  {
    id: "sociales",
    nombre: "Ciencias Sociales",
    desc: "Historia, geografía, ciudadanía y cultura.",
    imagen: "/assets/cienciasociales.png",
    href: "/estudiante/sociales/mapa",
    tint: "bg-[#FFF6E0]",
    tagline: "Conoce tu historia, tu territorio y tu comunidad.",
    iconoCurso: "/assets/cienciasociales.png",
    ctaHref: "/estudiante/sociales/mapa",
  },
];

export function getCurso(id: string): CursoAprender | undefined {
  return cursosAprender.find((c) => c.id === id);
}

export const tiposAventura = [
  {
    id: "exploradores",
    nombre: "Exploradores",
    desc: "Descubre conceptos con juegos, cuentos y experimentos simples.",
    imagen: "/assets/aprender/exploradora.png",
    href: "/estudiante/leccion",
    /** Fondo de tarjeta (no blanco) */
    cardBg: "bg-[linear-gradient(165deg,#B8F0C8_0%,#7ED9A0_45%,#E8FFF0_100%)]",
    accent: "#2DBE70",
  },
  {
    id: "aventureros",
    nombre: "Aventureros",
    desc: "Resuelve retos, realiza experimentos y trabaja en misiones por etapas.",
    imagen: "/assets/aprender/aventurera.png",
    href: "/estudiante/practica",
    cardBg: "bg-[linear-gradient(165deg,#B8E4FF_0%,#7EC8F5_45%,#E8F6FF_100%)]",
    accent: "#4C9EFF",
  },
  {
    id: "creadores",
    nombre: "Creadores",
    desc: "Diseña proyectos, simula ideas y resuelve problemas del mundo real.",
    imagen: "/assets/aprender/creadora.png",
    href: "/estudiante/desafio",
    cardBg: "bg-[linear-gradient(165deg,#E0D4FF_0%,#C4B0F5_45%,#F5F0FF_100%)]",
    accent: "#5636D9",
  },
] as const;

export const unidadActual = {
  id: "sistema-solar",
  titulo: "El sistema solar",
  leccion: "Lección 1: ¿Qué es el Sistema Solar?",
  progreso: 60,
  proxima: "Practica",
};

export const casillasTablero = [
  { icon: QuestionIcon, nombre: "Pregunta", desc: "Resuelve un ejercicio del tema" },
  { icon: TrophyIcon, nombre: "Desafío", desc: "Aplica el concepto en una situación nueva" },
  { icon: HandshakeIcon, nombre: "Cooperación", desc: "Ayuda a otro jugador con una pista" },
  { icon: LightningIcon, nombre: "Evento", desc: "Resuelve una situación inesperada" },
  { icon: BookOpenIcon, nombre: "Descanso", desc: "Revisa una tarjeta de teoría" },
  { icon: FlagIcon, nombre: "Meta", desc: "El grupo demuestra lo aprendido" },
];

export const habilidades = [
  { id: "razonamiento", nombre: "Razonamiento", pct: 85, emoji: "🧠" },
  { id: "espacial", nombre: "Espacial", pct: 80, emoji: "🧊" },
  { id: "verbal", nombre: "Verbal", pct: 75, emoji: "💬" },
  { id: "matematica", nombre: "Lógico-Matemática", pct: 82, emoji: "🧮" },
];

export const tiposEvaluacion = [
  { id: "opcion", nombre: "Selección múltiple", desc: "Evalúa conceptos básicos", icon: ListChecksIcon },
  { id: "abierta", nombre: "Respuesta abierta", desc: "Explica con tus propias palabras", icon: PencilLineIcon },
  { id: "pasos", nombre: "Resolución paso a paso", desc: "Muestra cómo llegaste a la respuesta", icon: ListNumbersIcon },
  { id: "foto", nombre: "Foto de ejercicio", desc: "Sube una imagen de tu procedimiento", icon: CameraIcon },
  { id: "practica", nombre: "Evaluación práctica", desc: "Resuelve un desafío o simulación", icon: MicroscopeIcon },
  { id: "pares", nombre: "Evaluación entre pares", desc: "Un compañero revisa con rúbrica", icon: HandshakeIcon },
];

export const rutaPasos = [
  {
    id: "descubre",
    titulo: "Descubre",
    desc: "Lee y escucha la teoría",
    estado: "completado" as const,
    href: "/estudiante/leccion",
  },
  {
    id: "practica",
    titulo: "Practica",
    desc: "Resuelve retos del tema",
    estado: "actual" as const,
    href: "/estudiante/practica",
  },
  {
    id: "demuestra",
    titulo: "Demuestra",
    desc: "Desafío final evaluado",
    estado: "bloqueado" as const,
    href: "/estudiante/desafio",
  },
];

export const teoria = {
  titulo: "¿Qué es el Sistema Solar?",
  audioLabel: "Escuchar explicación",
  parrafos: [
    "El Sistema Solar es el conjunto formado por el Sol y todos los cuerpos que giran a su alrededor: planetas, lunas, asteroides y cometas.",
    "La Tierra es el tercer planeta desde el Sol y el único donde conocemos vida. Gira sobre su eje y también alrededor del Sol.",
    "Explorar en 3D te ayuda a ver tamaños, órbitas y distancias de una forma más clara.",
  ],
};

export const preguntaPractica = {
  enunciado: "¿Cuál es el planeta más grande del sistema solar?",
  opciones: [
    { id: "a", label: "Tierra", color: "#2F7BD1", correcta: false },
    { id: "b", label: "Júpiter", color: "#C9A27A", correcta: true },
    { id: "c", label: "Marte", color: "#C4512D", correcta: false },
    { id: "d", label: "Saturno", color: "#D8BC7A", correcta: false },
  ],
  puntos: 50,
  feedbackCorrecto: "¡Correcto! Júpiter es el gigante gaseoso más grande.",
  feedbackIncorrecto: "Casi… piensa en el planeta con muchas lunas.",
};

export const desafio = {
  titulo: "Desafío final",
  preguntas: 10,
  minutos: 12,
  puntos: 200,
};

export const logro = {
  titulo: "¡Misión completada!",
  puntaje: "9/10",
  insignia: "Explorador espacial",
  puntosGanados: 180,
};

export const insignias = [
  { id: "1", nombre: "Cohete", img: "/assets/cohete.png", obtenida: true },
  { id: "2", nombre: "Planeta", img: "/assets/juego ludico/icon_planeta.png", obtenida: true },
  { id: "3", nombre: "Estrella", img: "/assets/juego ludico/icon_estrella.png", obtenida: true },
  { id: "4", nombre: "Órbita", img: "/assets/aprender/holograma_tierra.png", obtenida: false },
  { id: "5", nombre: "Explorador", img: "/assets/matematica/compas.png", obtenida: false },
];

export const unidadesProgreso = [
  { nombre: "Sistema Solar", pct: 100 },
  { nombre: "Cuerpo humano", pct: 20 },
  { nombre: "La Tierra", pct: 80 },
  { nombre: "El Universo", pct: 50 },
  { nombre: "Energía", pct: 35 },
];

export const competencias = [
  { nombre: "Indaga y explica el mundo", pct: 78 },
  { nombre: "Resuelve problemas", pct: 65 },
  { nombre: "Comunica ideas científicas", pct: 70 },
];

export const reforzar = [
  "Analizar la relación entre los movimientos de la Tierra",
  "Comparar tamaños relativos de los planetas",
];
