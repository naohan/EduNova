// Contrato de datos unificado de EduNova.
// Fuente única de verdad: front, back y agentes de IA importan SOLO de aquí.
// Si necesitas cambiar un tipo, avisa al líder y haz PR pequeño solo de este archivo.

export type AgeTier = 'EXPLORADOR_7_9' | 'AVENTURERO_10_12' | 'CREADOR_13_15';
export type UserRole = 'STUDENT' | 'TEACHER' | 'FAMILY_TUTOR';
export type LearningContext = 'SCHOOL_CLASSROOM' | 'INDEPENDENT_HOME' | 'EXTERNAL_INSTITUTION';
export type FamilyCategory =
  | 'CAMPO_Y_LUGAR'
  | 'SALUD_Y_PLANTAS'
  | 'COCINA'
  | 'OFICIOS_Y_HOGAR'
  | 'AHORRO'
  | 'IDIOMAS'
  | 'OTRO';
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

export interface UnitQuestion {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  hint: string;
  rubricCriterionId: string;
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
    discover: {
      storyTextByAge: Record<AgeTier, string>;
      audioUrl: string;
      easyReadText?: string;
      pictograms?: Array<{ word: string; id: number }>;
    };
    practice: { flashcards: Flashcard[]; gameMode: string };
    demonstrate: {
      questions: UnitQuestion[];
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
  familyStudentId?: string;
  familyCategory?: FamilyCategory;
  safetyNote?: string;
  sharedWithFamilies?: boolean;
  sourceUnitId?: string;
}

export interface SharedFamilyRoute {
  id: string;
  title: string;
  familyCategory?: FamilyCategory;
  topicsCount: number;
  subtopicsCount: number;
}

export interface FamilyDraftResponse {
  unit: LearningUnit;
  usedFallback: boolean;
  aiNotice?: string;
  safetyNotice?: string; // el servidor quitó cantidades o promesas de cura
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
  ownedItems?: string[]; // ids de accesorios comprados
  diagnosticTier?: AgeTier;
  diagnosedAt?: string;
  dailyBonusDate?: string;
  dailyBonusPoints?: number;
  effortStreak?: number;
}

// Fila pública de una liga. Safe-Play: nada de saldo, racha ni vínculos familiares de otros niños.
export interface LeaderboardEntry {
  studentId: string;
  alias: string;
  institutionName?: string;
  masteryPoints: number;
  effortPoints: number;
  division: GamificationAndBenchmarkProfile['leagues']['division'];
}

export interface LeaderboardAroundMeResponse {
  rows: LeaderboardEntry[];
  myPosition: number;
  total: number;
}

export interface EventsBatchResponse {
  accepted: number;
  duplicates: number;
  rejected: number;
  effortBonus: number;
}

// ---- Tienda del avatar (HU-06) ----
export type AvatarSlot = 'CABEZA' | 'CARA' | 'CUELLO' | 'ESPALDA';

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  slot: AvatarSlot;
}

export interface Inventory {
  novaCoins: number;
  ownedItems: string[];
  equippedItems: string[];
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

// ---- Evaluación de procedimiento (RF-04) ----
// La nota de la IA nunca es definitiva: el docente puede reemplazarla con teacherOverrideScore.
export interface AssessmentRecord {
  id: string;
  studentId: string;
  alias: string;
  classroomCode?: string;
  source: 'HANDWRITTEN_PHOTO';
  aiScore: number; // sobre 20
  teacherOverrideScore: number | null; // null mientras el docente no la cambie
  stepsToReview: number;
  firstErrorFeedback?: string;
  reasoning?: string;
  reasoningBonusXP: number;
  createdAt: string; // ISO 8601
}

// ---- Hipótesis en laboratorios 3D (HU-03, modo Creador) ----
export interface HypothesisReview {
  valid: boolean;
  feedback: string;
  bonusXP: number;
}

// ---- Alertas explicables (RF-04) ----
export interface ExplainableAlert {
  id: string;
  classId: string;
  kind: 'TOPIC' | 'INACTIVITY';
  message: string; // "34% del aula comprende el numerador pero falla al hallar el denominador común"
  affectedPercent: number;
  rubricCriterionId?: string;
  suggestedAction: string;
  affectedAliases: string[];
  attendedAt?: string;
}

// ---- Datos de proceso: de aquí salen el dominio (BKT), las alertas y los talentos ----
export type EventActivity = 'FLASHCARD' | 'QUIZ' | 'LAB_3D';

export interface LearningEvent {
  id: string; // lo genera el cliente: reenviar sin conexión no duplica la evidencia
  activity: EventActivity;
  correct: boolean;
  subtopicId?: string; // define a qué criterios de la rúbrica aporta evidencia
  questionId?: string;
  attempt: number; // 1 = primer intento; solo este mide dominio
  hintsUsed: number;
  timeMs: number;
  occurredAt: string;
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
  diagnosticTier?: AgeTier;
  streakDays: number;
  division: GamificationAndBenchmarkProfile['leagues']['division'];
  overallMasteryPercent: number;
  needsSupport: boolean;
  mastery: CriterionMastery[];
}

export interface DiagnosticQuestion {
  id: string;
  tier: AgeTier;
  prompt: string;
  options: string[];
}

export interface DiagnosticResult {
  diagnosticTier: AgeTier;
  correctCount: number;
  total: number;
}

// Radar de Talentos (RF-04): sugerencias exploratorias, nunca etiquetas clínicas.
export interface TalentSignal {
  studentId: string;
  alias: string;
  logic?: number; // sin misiones 3D no hay evidencia
  perseverance?: number; // sin fallos no hay de qué sobreponerse
  autonomy: number;
  evidenceCount: number;
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
// POST /api/ai/ingest-document           -> LearningUnit (status DRAFT), solo docente
// POST /api/events  body: { events }     -> EventsBatchResponse ({ accepted, duplicates, rejected, effortBonus }), solo estudiante
// PUT  /api/teacher/approve-rubric       -> LearningUnit (status PUBLISHED)
// POST /api/ai/analyze-handwritten-photo -> HandwrittenAnalysis
// POST /api/ai/validate-duel-question    -> { valid: boolean; reason: string }
// POST /api/ai/family-home-explainer     -> { explanation: string }
// GET  /api/leagues/leaderboard          -> LeaderboardEntry[] o LeaderboardAroundMeResponse (con around=me)
// GET  /api/shop/items                   -> ShopItem[]
// POST /api/shop/buy    body: { itemId } -> Inventory  (estudiante con sesión)
// POST /api/shop/equip  body: { itemId } -> Inventory  (estudiante con sesión; alterna puesto/quitado)
// GET  /api/benchmark/external/:studentId-> BenchmarkResult
// GET  /api/analytics/explainable-alerts -> ExplainableAlert[]
// GET  /api/students/:id/profile         -> StudentProfile   (estudiante, su tutor o su docente)
// GET  /api/classes/:code/students       -> ClassStudent[]   (solo docente del aula)
// GET  /api/classes/:code/analytics      -> ClassAnalytics   (solo docente del aula)
// GET  /api/classes/:code/assessments    -> AssessmentRecord[] (solo docente del aula)
// PUT  /api/teacher/assessments/:id/override  body: { score: number | null } -> AssessmentRecord (solo docente del aula)
// POST /api/assess/submit-reasoning      body: { studentId, analysis, reasoning? } -> AssessmentRecord (el propio estudiante)
// POST /api/ai/validate-hypothesis       body: { hypothesis, labType? } -> HypothesisReview
// Los de perfil, aula y evaluación piden: Authorization: Bearer <token de /api/auth/login>
