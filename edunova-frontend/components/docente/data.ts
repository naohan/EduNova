// Mock data for the EduNova Docente panel.
// Hardcoded TypeScript constants (no fetch/API). Plain module — no "use client" —
// so it can be imported by both server and client components.

export type Estado = "Logrado" | "En proceso" | "En inicio";

export interface Estudiante {
  id: string;
  nombre: string;
  nota: number; // sobre 20
  progreso: number; // %
  estado: Estado;
  competencias?: CompetenciaNota[]; // solo con datos reales del aula
}

export interface CompetenciaNota {
  nombre: string;
  nota: number; // sobre 20
  estado: Estado;
}

export interface HabilidadTransversal {
  nombre: string;
  nivel: number; // sobre 3
}

export interface EstudianteDetalle {
  id: string;
  nombre: string;
  nota: number; // sobre 20
  actividades: { completadas: number; total: number };
  progreso: number; // variación vs bimestre anterior (puntos)
  estado: Estado;
  competencias: CompetenciaNota[];
  habilidades: HabilidadTransversal[];
  evolucion: number[]; // 6 semanas
  bimestres: number[]; // 3 bimestres
  observacion: string;
}

export interface CompetenciaMastery {
  nombre: string;
  logrado: number; // %
  proceso: number; // %
  inicio: number; // %
}

export interface TopicComparison {
  tema: string;
  aula: number;
  meta: number;
}

export interface PredictiveAlert {
  estudiante: string;
  tendencia: string;
  accion: string;
}

// ── Aula ────────────────────────────────────────────────────────────────────
// Ids del aula de demostración en el backend: la ficha del estudiante se genera para ellos.
export const idsAulaDemo = ["u-student-1", "u-student-2", "u-student-3", "u-student-seed-5", "u-student-seed-6", "u-student-seed-9"];

export const classInfo = {
  curso: "Matemática 1B",
  grado: "1.° de Secundaria",
  seccion: "B",
  nivel: "Secundaria",
  docente: "Prof. Ana Torres",
};

export const classStats = {
  totalEstudiantes: 20,
  promedio: 15.8, // /20
  actividadesCompletadas: 82, // %
  apoyo: 4,
  apoyoPct: 20, // %
  mejora: 2.4, // puntos vs bimestre anterior
};

// 20-student roster. Notas sum to 316.0 → average exactly 15.8.
// Exactly 4 students are "En inicio" (ids 4, 8, 10, 15).
export const estudiantes: Estudiante[] = [
  { id: "1", nombre: "Gloria Hancco", nota: 19.2, progreso: 95, estado: "Logrado" },
  { id: "2", nombre: "Luis Mamani", nota: 17.6, progreso: 85, estado: "Logrado" },
  { id: "3", nombre: "Rosa Quispe", nota: 12.4, progreso: 60, estado: "En proceso" },
  { id: "4", nombre: "Pedro Salas", nota: 10.8, progreso: 50, estado: "En inicio" },
  { id: "5", nombre: "Ana Vargas", nota: 15.9, progreso: 80, estado: "Logrado" },
  { id: "6", nombre: "Carlos Rojas", nota: 16.5, progreso: 78, estado: "Logrado" },
  { id: "7", nombre: "Lucía Torres", nota: 17.0, progreso: 85, estado: "Logrado" },
  { id: "8", nombre: "José Fernández", nota: 11.6, progreso: 48, estado: "En inicio" },
  { id: "9", nombre: "Sofía García", nota: 16.8, progreso: 82, estado: "Logrado" },
  { id: "10", nombre: "Diego Ramírez", nota: 11.2, progreso: 45, estado: "En inicio" },
  { id: "11", nombre: "Andrés Medina", nota: 17.4, progreso: 80, estado: "Logrado" },
  { id: "12", nombre: "Manuel Ríos", nota: 17.2, progreso: 76, estado: "Logrado" },
  { id: "13", nombre: "Valeria Cruz", nota: 16.6, progreso: 74, estado: "Logrado" },
  { id: "14", nombre: "Sebastián Vera", nota: 18.0, progreso: 88, estado: "Logrado" },
  { id: "15", nombre: "Camila Núñez", nota: 11.0, progreso: 42, estado: "En inicio" },
  { id: "16", nombre: "Gabriela Soto", nota: 18.2, progreso: 86, estado: "Logrado" },
  { id: "17", nombre: "Eduardo Mendoza", nota: 16.4, progreso: 72, estado: "Logrado" },
  { id: "18", nombre: "Daniela Paredes", nota: 17.6, progreso: 81, estado: "Logrado" },
  { id: "19", nombre: "Tomás Herrera", nota: 17.8, progreso: 84, estado: "Logrado" },
  { id: "20", nombre: "María López", nota: 16.8, progreso: 79, estado: "Logrado" },
];

// ── Ficha individual (Rosa Quispe) ──────────────────────────────────────────
export const rosaRecord: EstudianteDetalle = {
  id: "3",
  nombre: "Rosa Quispe",
  nota: 12.4,
  actividades: { completadas: 8, total: 10 },
  progreso: 3.6,
  estado: "En proceso",
  competencias: [
    { nombre: "Cantidad", nota: 12.4, estado: "En proceso" },
    { nombre: "Regularidad", nota: 11.8, estado: "En inicio" },
    { nombre: "Forma y movimiento", nota: 13.2, estado: "En proceso" },
    { nombre: "Gestión de datos", nota: 12.0, estado: "En proceso" },
  ],
  habilidades: [
    { nombre: "Trabajo en equipo", nivel: 3 },
    { nombre: "Comunicación", nivel: 3 },
    { nombre: "Gestión del tiempo", nivel: 2 },
  ],
  evolucion: [10.8, 11.2, 11.6, 11.9, 12.1, 12.4],
  bimestres: [10.5, 11.2, 12.0],
  observacion:
    "Rosa muestra mejora sostenida en resolución de problemas. Reforzar fracciones y trabajo colaborativo.",
};

// ── Analítica del aula ──────────────────────────────────────────────────────
export const classroomWeekly: number[] = [13.8, 14.2, 14.9, 15.2, 15.6, 15.8];

export const competenciaMastery: CompetenciaMastery[] = [
  { nombre: "Cantidad", logrado: 70, proceso: 20, inicio: 10 },
  { nombre: "Regularidad", logrado: 65, proceso: 20, inicio: 15 },
  { nombre: "Forma y movimiento", logrado: 65, proceso: 25, inicio: 10 },
  { nombre: "Gestión de datos", logrado: 60, proceso: 30, inicio: 10 },
];

export const topicComparison: TopicComparison[] = [
  { tema: "Fracciones", aula: 15.8, meta: 16.0 },
  { tema: "Decimales", aula: 16.2, meta: 16.5 },
  { tema: "Proporciones", aula: 14.0, meta: 16.5 },
  { tema: "Porcentajes", aula: 15.6, meta: 16.0 },
];

export const strategyAnalysis = {
  titulo: "Taller de resolución de problemas",
  antes: 13.4,
  antesPct: 68, // %
  despues: 15.8,
  despuesPct: 82, // %
  variacion: 2.4, // puntos
  variacionPct: 17.9, // %
};

export const causalidadDisclaimer =
  "La correlación no demuestra causalidad. Los resultados pueden deberse a múltiples factores.";

// ── Alertas predictivas (recomendación para revisión docente) ────────────────
export const predictiveAlerts: PredictiveAlert[] = [
  { estudiante: "Pedro Salas", tendencia: "Tendencia a la baja", accion: "Requiere seguimiento" },
  { estudiante: "Rosa Quispe", tendencia: "Mejora sostenida", accion: "Monitorear progreso" },
];

export const predictiveDisclaimer =
  "No es una decisión automatizada ni una evaluación definitiva.";
