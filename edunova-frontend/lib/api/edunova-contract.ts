// Contrato de datos unificado de EduNova.
// Fuente única de verdad: front, back y agentes de IA importan SOLO de aquí.
// Si necesitas cambiar un tipo, avisa al líder y haz PR pequeño solo de este archivo.

export type AgeTier = 'EXPLORADOR_7_9' | 'AVENTURERO_10_12' | 'CREADOR_13_15';
export type UserRole = 'STUDENT' | 'TEACHER' | 'FAMILY_TUTOR';
export type LearningContext = 'SCHOOL_CLASSROOM' | 'INDEPENDENT_HOME' | 'EXTERNAL_INSTITUTION';
export type Lab3DType =
  | 'SOLAR_SYSTEM'
  | 'HUMAN_BODY'
  | 'MOLECULAR_LAB'
  | 'STUDYFI_PHYSICS'
  | 'EARTH_OS'
  | 'NONE';

export type UnitStatus = 'DRAFT' | 'PUBLISHED';
export type SubtopicStatus = 'LOCKED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type StepVerdict = 'CORRECT' | 'CONCEPT_ERROR' | 'ARITHMETIC_ERROR';

export interface User {
  id: string;
  role: UserRole;
  alias: string; // Safe-Play: nunca apellidos completos, teléfonos ni geolocalización
  ageTier?: AgeTier; // solo STUDENT
  classroomCode?: string;
}

export interface RubricCriterion {
  id: string;
  subtopicId: string;
  topicName: string; // Ej: "Suma de fracciones" o "Sistema Solar"
  evaluationCriterion: string; // Ej: "Resolver problema contextualizado / procedimiento"
  suggestedActivity: string; // Ej: "Explorar modelo 3D"
  approvedByTeacher: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  image?: string;
}

export interface SubtopicNode {
  id: string;
  order: number;
  title: string; // Ej: "1. ¿Qué es el Sistema Solar?"
  status: SubtopicStatus;
  offlineCached: boolean;
  lab3DIntegration: {
    type: Lab3DType;
    repoUrl: string;
    missionPrompt: string; // Reto guiado dentro del visor 3D
    rewardXP: number;
    rewardCoins: number;
  };
  stages: {
    discover: { storyTextByAge: Record<AgeTier, string>; audioUrl: string };
    practice: { flashcards: Flashcard[]; gameMode: string };
    demonstrate: {
      questions: unknown[];
      acceptsHandwrittenPhoto: boolean;
      reasoningBonusXP: number;
    };
  };
}

export interface LearningUnit {
  id: string;
  title: string;
  status: UnitStatus; // DRAFT hasta que el docente pulsa "Aprobar y Publicar"
  teacherId: string;
  classroomCode: string;
  subtopics: SubtopicNode[];
  rubric: RubricCriterion[];
}

export interface GamificationAndBenchmarkProfile {
  studentId: string;
  alias?: string; // se rellena en /api/leagues/leaderboard
  learningContext: LearningContext;
  institutionName?: string;
  familyTutorLinkedId?: string;
  streakDays: number;
  novaCoins: number;
  leagues: {
    masteryPoints: number; // Precisión, laboratorios 3D y calidad de preguntas creadas
    effortPoints: number; // Racha, reintentos y cooperación
    division: 'BRONCE' | 'PLATA' | 'ORO' | 'SUPERNOVA';
  };
  badges: string[];
  equippedItems: string[]; // ids de accesorios del avatar
}

// ---- Evaluación por foto (HU-04) ----
export interface HandwrittenStep {
  line: number;
  text: string;
  verdict: StepVerdict;
  feedback: string;
}

export interface HandwrittenAnalysis {
  steps: HandwrittenStep[];
  reasoningBonusXP: number;
  teacherOverrideScore?: number; // RF-03: el docente siempre puede modificar la nota de la IA
  usedFallback: boolean; // RNF-03: true si respondió el modo determinista
}

// ---- Alertas explicables (RF-04) ----
export interface ExplainableAlert {
  id: string;
  classId: string;
  message: string; // "34% del aula comprende el numerador pero falla al hallar el denominador común"
  affectedPercent: number;
  rubricCriterionId: string;
}

// ---- Dominio por criterio de rúbrica (RF-02) ----
export interface CriterionMastery {
  rubricCriterionId: string;
  topicName: string;
  masteryPercent: number; // 0-100
}

// Lo que ve el propio estudiante, su tutor o su docente.
// Sin detalle por criterio: la rúbrica es oculta para el estudiante.
export interface StudentProfile extends GamificationAndBenchmarkProfile {
  alias: string;
  ageTier?: AgeTier;
  classroomCode?: string;
  overallProgressPercent: number;
  topicToReinforce?: string; // solo para tutor y docente
}

// Solo docente del aula. Safe-Play: alias, nunca apellidos.
export interface ClassStudent {
  studentId: string;
  alias: string;
  ageTier?: AgeTier;
  streakDays: number;
  division: GamificationAndBenchmarkProfile['leagues']['division'];
  overallMasteryPercent: number;
  needsSupport: boolean;
  mastery: CriterionMastery[];
}

// Radar de Talentos (RF-04): sugerencias exploratorias, nunca etiquetas clínicas.
export interface TalentSignal {
  studentId: string;
  alias: string;
  creativity: number; // calidad de preguntas creadas en Duelo
  collaboration: number; // ayudas en Tablero
  logic: number; // Labs 3D
}

export interface ClassAnalytics {
  classId: string;
  studentCount: number;
  averageMasteryPercent: number;
  criteria: Array<CriterionMastery & { studentsNeedingSupport: number }>;
  alerts: ExplainableAlert[];
  talents: TalentSignal[];
  talentDisclaimer: string;
}

// ---- Benchmark (RF-05) ----
export interface BenchmarkResult {
  studentId: string;
  ageRange: string;
  percentile: number; // 0-100
  vsClassroom: number;
  vsOtherInstitutions: number;
  vsIndependentLearners: number;
}

// ---- Eventos de laboratorio 3D ----
export interface LabMissionComplete {
  type: 'LAB_MISSION_COMPLETE';
  labType: Lab3DType;
  subtopicId: string;
  rewardXP: number;
  rewardCoins: number;
}

// ---- Endpoints (referencia: PDF sección 10) ----
// GET  /api/units/:id?ageTier=...        -> LearningUnit
// POST /api/progress/sync                -> { synced: number }
// POST /api/labs/complete-mission        body: LabMissionComplete
// POST /api/ai/ingest-document           -> LearningUnit (status DRAFT)
// PUT  /api/teacher/approve-rubric       -> LearningUnit (status PUBLISHED)
// POST /api/ai/analyze-handwritten-photo -> HandwrittenAnalysis
// POST /api/ai/validate-duel-question    -> { valid: boolean; reason: string }
// POST /api/ai/family-home-explainer     -> { explanation: string }
// GET  /api/leagues/leaderboard          -> GamificationAndBenchmarkProfile[]
// GET  /api/benchmark/external/:studentId-> BenchmarkResult
// GET  /api/analytics/explainable-alerts -> ExplainableAlert[]
// GET  /api/students/:id/profile         -> StudentProfile   (estudiante, su tutor o su docente)
// GET  /api/classes/:code/students       -> ClassStudent[]   (solo docente del aula)
// GET  /api/classes/:code/analytics      -> ClassAnalytics   (solo docente del aula)
// Estos tres piden: Authorization: Bearer <token de /api/auth/login>
