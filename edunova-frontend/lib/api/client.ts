import type {
  AssessmentRecord,
  BenchmarkResult,
  ClassAnalytics,
  ClassStudent,
  DiagnosticQuestion,
  DiagnosticResult,
  EventsBatchResponse,
  ExplainableAlert,
  GamificationAndBenchmarkProfile,
  HandwrittenAnalysis,
  HypothesisReview,
  Inventory,
  LabMissionComplete,
  LeaderboardAroundMeResponse,
  LeaderboardEntry,
  LearningEvent,
  LearningUnit,
  RubricCriterion,
  ShopItem,
  StudentProfile,
  User,
} from "./edunova-contract";
import { getToken, setSessionUser, setToken } from "./session";

// Cliente del backend de EduNova (https://github.com/nilton2005/edunova).
// Nunca lanza errores: devuelve { ok: false } y la pantalla sigue con sus datos fijos de respaldo.
// Next fija NEXT_PUBLIC_* al hacer build, por eso se lee de forma literal.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
// En el navegador se llama a /backend, que Next reenvía a API_URL (ver rewrites en next.config.ts).
const BASE_URL = typeof window === "undefined" ? API_URL : "/backend";

const TIMEOUT_MS = 4000;
// Las escrituras tardan más: con la base en Render una ingesta toma unos 3,5 s. Si se cortara a los 4 s,
// la pantalla daría por fallida una operación que el servidor sí completa.
const WRITE_TIMEOUT_MS = 10000;
// La IA lee el material completo: el servidor corta a los 45 s y responde con el respaldo.
const AI_TIMEOUT_MS = 50000;

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string }; // status 0 = sin conexión o tiempo agotado

async function request<T>(
  method: "GET" | "POST" | "PUT",
  path: string,
  body?: unknown,
  timeoutMs = TIMEOUT_MS,
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const error = (json as { error?: string } | null)?.error ?? res.statusText;
      return { ok: false, status: res.status, error };
    }
    // 200 con un cuerpo que no es JSON: no es un éxito, y `data: null` rompería a quien lo use.
    if (json === null) return { ok: false, status: res.status, error: "respuesta inválida del servidor" };
    return { ok: true, data: json as T };
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === "AbortError";
    return { ok: false, status: 0, error: aborted ? "tiempo agotado" : "sin conexión con el servidor" };
  } finally {
    clearTimeout(timer);
  }
}

// ---- Tipos de respuesta que el contrato compartido no define ----
export type IngestedUnit = LearningUnit & { usedFallback: boolean; aiModel?: string; aiNotice?: string };
export type IngestInput = { title?: string; text: string; fileBase64?: string; mimeType?: string };
export interface GhostOpponent {
  alias: string;
  institutionName: string;
  ageRange: string;
  timeSeconds: number;
  score: number;
}
export interface PassportResponse {
  alias: string;
  division: string;
  masteryPoints: number;
  badges: string[];
  competencies: Array<{ unit: string; level: string }>;
  issuedAt: string;
  payload: string; // el JSON que lleva el QR
  qrSvg: string; // QR ya dibujado, listo para mostrar
}

// ---- Sesión ----
// Usuarios de prueba: u-teacher-1, u-student-1 (Gloria), u-student-2 (Mateo), u-student-3 (Sofía), u-family-1.
export type LoginResponse = { user: User; token: string; redirectUrl?: string; linkedStudentId?: string };

export async function login(credentials: { userId?: string; alias?: string; classroomCode?: string }) {
  const r = await request<LoginResponse>("POST", "/auth/login", credentials);
  if (r.ok) {
    setToken(r.data.token);
    setSessionUser({ ...r.data.user, linkedStudentId: r.data.linkedStudentId });
  }
  return r;
}
export const demoLogin = (userId: string) => login({ userId });
export function demoLogout() {
  setToken(undefined);
  setSessionUser(undefined);
}

// ---- Unidades y docente ----
export const listUnits = () => request<LearningUnit[]>("GET", "/units");
export const getUnit = (unitId: string) => request<LearningUnit>("GET", `/units/${encodeURIComponent(unitId)}`);
export const ingestDocument = (input: IngestInput) =>
  request<IngestedUnit>("POST", "/ai/ingest-document", input, AI_TIMEOUT_MS);
export const approveRubric = (unitId: string, rubric?: RubricCriterion[]) =>
  request<LearningUnit>("PUT", "/teacher/approve-rubric", { unitId, rubric }, WRITE_TIMEOUT_MS);

// ---- Estudiante ----
export const getStudentProfile = (studentId: string) =>
  request<StudentProfile>("GET", `/students/${encodeURIComponent(studentId)}/profile`);
export const completeMission = (input: Omit<LabMissionComplete, "type"> & { studentId: string; firstTry?: boolean }) =>
  request<GamificationAndBenchmarkProfile>("POST", "/labs/complete-mission", { type: "LAB_MISSION_COMPLETE", ...input }, WRITE_TIMEOUT_MS);
export const sendEvents = (events: LearningEvent[]) =>
  request<EventsBatchResponse>("POST", "/events", { events }, WRITE_TIMEOUT_MS);
export const syncProgress = (studentId: string, events: Array<{ xp?: number; coins?: number }>) =>
  request<{ synced: number }>("POST", "/progress/sync", { studentId, events }, WRITE_TIMEOUT_MS);
export const analyzeHandwrittenPhoto = (input: { imageBase64?: string; explanation?: string }) =>
  request<HandwrittenAnalysis>("POST", "/ai/analyze-handwritten-photo", input);

export const submitReasoning = (input: { studentId: string; analysis: HandwrittenAnalysis; reasoning?: string }) =>
  request<AssessmentRecord>("POST", "/assess/submit-reasoning", input, WRITE_TIMEOUT_MS);
export const validateHypothesis = (hypothesis: string, labType?: string) =>
  request<HypothesisReview>("POST", "/ai/validate-hypothesis", { hypothesis, labType });
export const getDiagnosticQuestions = () =>
  request<DiagnosticQuestion[]>("GET", "/diagnostic/questions");
export const submitDiagnostic = (answers: Array<{ questionId: string; optionIndex: number }>) =>
  request<DiagnosticResult>("POST", "/diagnostic/submit", { answers }, WRITE_TIMEOUT_MS);

// ---- Juegos y ligas ----
export const getLeaderboard = (league: "mastery" | "effort" = "mastery") =>
  request<LeaderboardEntry[]>("GET", `/leagues/leaderboard?league=${league}`);
export const getLeaderboardAroundMe = (league: "mastery" | "effort" = "mastery") =>
  request<LeaderboardAroundMeResponse>("GET", `/leagues/leaderboard?league=${league}&around=me`);
export const getShopItems = () => request<ShopItem[]>("GET", "/shop/items");
export const buyItem = (itemId: string) => request<Inventory>("POST", "/shop/buy", { itemId }, WRITE_TIMEOUT_MS);
export const toggleItem = (itemId: string) => request<Inventory>("POST", "/shop/equip", { itemId }, WRITE_TIMEOUT_MS);
export interface DuelOpponentQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  correctAnswer: string;
  explanation?: string;
}
export interface DuelOpponentQuestionsResponse {
  questions: DuelOpponentQuestion[];
  usedFallback: boolean;
}
export const getDuelOpponentQuestions = (params: {
  course: string;
  topic: string;
  count?: number;
  alternativesCount?: number;
}) =>
  request<DuelOpponentQuestionsResponse>("POST", "/ai/duel-opponent-questions", params, 20000);
export const validateDuelQuestion = (question: string, topic?: string) =>
  request<{ valid: boolean; reason: string }>("POST", "/ai/validate-duel-question", { question, topic });
export const getGhostOpponent = (ageTier?: string) =>
  request<GhostOpponent>("GET", `/duel/ghost-opponent${ageTier ? `?ageTier=${ageTier}` : ""}`);
export const reportDuelResult = (input: { studentId: string; won: boolean; questionsCreated?: number }) =>
  request<{ xp: number; coins: number; profile: GamificationAndBenchmarkProfile }>("POST", "/duel/result", input);

// ---- Familia y benchmark ----
export const getFamilyExplanation = (topic?: string) =>
  request<{ explanation: string }>("POST", "/ai/family-home-explainer", { topic }, 15000);
export const getBenchmark = (studentId: string) =>
  request<BenchmarkResult>("GET", `/benchmark/external/${encodeURIComponent(studentId)}`);
export const getPassport = (studentId: string) =>
  request<PassportResponse>("GET", `/passport/${encodeURIComponent(studentId)}`);

// ---- Panel del docente (requieren sesión de docente de esa aula) ----
export const getClassStudents = (classCode: string) =>
  request<ClassStudent[]>("GET", `/classes/${encodeURIComponent(classCode)}/students`);
export const getClassAnalytics = (classCode: string) =>
  request<ClassAnalytics>("GET", `/classes/${encodeURIComponent(classCode)}/analytics`);
export const getExplainableAlerts = (classId: string) =>
  request<ExplainableAlert[]>("GET", `/analytics/explainable-alerts?classId=${encodeURIComponent(classId)}`);
export const getClassAssessments = (classCode: string) =>
  request<AssessmentRecord[]>("GET", `/classes/${encodeURIComponent(classCode)}/assessments`);
export const overrideAssessment = (assessmentId: string, score: number | null) =>
  request<AssessmentRecord>("PUT", `/teacher/assessments/${encodeURIComponent(assessmentId)}/override`, { score }, WRITE_TIMEOUT_MS);
export const markAlertAttended = (alertId: string) =>
  request<{ ok: boolean; alertId: string; attendedAt: string }>(
    "PUT",
    `/teacher/alerts/${encodeURIComponent(alertId)}/attended`,
    undefined,
    WRITE_TIMEOUT_MS,
  );
