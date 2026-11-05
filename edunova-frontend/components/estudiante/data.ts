export const estudiante = {
  nombre: "usuario",
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
    imagen: "/assets/matematica.png",
    href: "/estudiante/curso/matematica",
    tint: "bg-[#F2EEFF]",
    tagline: "Explora números, formas y problemas del día a día.",
    iconoCurso: "/assets/matematica.png",
    ctaHref: "/estudiante/matematica/mapa",
  },
  {
    id: "comunicacion",
    nombre: "Comunicación",
    desc: "Comprensión lectora, vocabulario y producción de textos.",
    imagen: "/assets/comunicacion.png",
    href: "/estudiante/curso/comunicacion",
    tint: "bg-[#FFEAF2]",
    tagline: "Lee, escribe y comparte ideas con creatividad.",
    iconoCurso: "/assets/comunicacion.png",
    ctaHref: "/estudiante/leccion",
  },
  {
    id: "ciencia",
    nombre: "Ciencia y Tecnología",
    desc: "Cuerpo humano, ecosistemas, materia y energía.",
    imagen: "/assets/cienciatecnologia.png",
    href: "/estudiante/curso/ciencia",
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
    href: "/estudiante/curso/sociales",
    tint: "bg-[#FFF6E0]",
    tagline: "Conoce tu historia, tu territorio y tu comunidad.",
    iconoCurso: "/assets/cienciasociales.png",
    ctaHref: "/estudiante/explorar",
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
  { icon: "❓", nombre: "Pregunta", desc: "Resuelve un ejercicio del tema" },
  { icon: "🏆", nombre: "Desafío", desc: "Aplica el concepto en una situación nueva" },
  { icon: "🤝", nombre: "Cooperación", desc: "Ayuda a otro jugador con una pista" },
  { icon: "⚡", nombre: "Evento", desc: "Resuelve una situación inesperada" },
  { icon: "📘", nombre: "Descanso", desc: "Revisa una tarjeta de teoría" },
  { icon: "🚩", nombre: "Meta", desc: "El grupo demuestra lo aprendido" },
];

export const habilidades = [
  { id: "razonamiento", nombre: "Razonamiento", pct: 85, emoji: "🧠" },
  { id: "espacial", nombre: "Espacial", pct: 80, emoji: "🧊" },
  { id: "comunicacion", nombre: "Comunicación", pct: 75, emoji: "💬" },
  { id: "colaboracion", nombre: "Colaboración", pct: 90, emoji: "👥" },
  { id: "creatividad", nombre: "Creatividad", pct: 78, emoji: "💡" },
  { id: "autonomia", nombre: "Autonomía", pct: 82, emoji: "🎯" },
];

export const tiposEvaluacion = [
  { id: "opcion", nombre: "Selección múltiple", desc: "Evalúa conceptos básicos", icon: "☑️" },
  { id: "abierta", nombre: "Respuesta abierta", desc: "Explica con tus propias palabras", icon: "✍️" },
  { id: "pasos", nombre: "Resolución paso a paso", desc: "Muestra cómo llegaste a la respuesta", icon: "🔢" },
  { id: "foto", nombre: "Foto de ejercicio", desc: "Sube una imagen de tu procedimiento", icon: "📷" },
  { id: "practica", nombre: "Evaluación práctica", desc: "Resuelve un desafío o simulación", icon: "🔬" },
  { id: "pares", nombre: "Evaluación entre pares", desc: "Un compañero revisa con rúbrica", icon: "🤝" },
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

export const planetas = [
  { id: "sol", nombre: "Sol", emoji: "☀️" },
  { id: "mercurio", nombre: "Mercurio", emoji: "🌑" },
  { id: "venus", nombre: "Venus", emoji: "🟠" },
  { id: "tierra", nombre: "Tierra", emoji: "🌍", activo: true },
  { id: "marte", nombre: "Marte", emoji: "🔴" },
  { id: "jupiter", nombre: "Júpiter", emoji: "🪐" },
  { id: "saturno", nombre: "Saturno", emoji: "💍" },
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
    { id: "a", label: "Tierra", emoji: "🌍", correcta: false },
    { id: "b", label: "Júpiter", emoji: "🪐", correcta: true },
    { id: "c", label: "Marte", emoji: "🔴", correcta: false },
    { id: "d", label: "Saturno", emoji: "💍", correcta: false },
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
  { id: "1", nombre: "Cohete", emoji: "🚀", obtenida: true },
  { id: "2", nombre: "Planeta", emoji: "🪐", obtenida: true },
  { id: "3", nombre: "Estrella", emoji: "⭐", obtenida: true },
  { id: "4", nombre: "Órbita", emoji: "🌌", obtenida: false },
  { id: "5", nombre: "Explorador", emoji: "🧭", obtenida: false },
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
