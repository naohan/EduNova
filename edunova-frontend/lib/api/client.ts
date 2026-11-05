import type {
  BenchmarkResult,
  ClassAnalytics,
  ClassStudent,
  ExplainableAlert,
  GamificationAndBenchmarkProfile,
  HandwrittenAnalysis,
  LabMissionComplete,
  LearningUnit,
  RubricCriterion,
  StudentProfile,
  User,
} from "./edunova-contract";
import { getToken, setToken } from "./session";

// Cliente del backend de EduNova (https://github.com/nilton2005/edunova).
// Nunca lanza errores: devuelve { ok: false } y la pantalla sigue con sus datos fijos de respaldo.
// Next fija NEXT_PUBLIC_* al hacer build, por eso se lee de forma literal.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const TIMEOUT_MS = 4000;

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string }; // status 0 = sin conexión o tiempo agotado

async function request<T>(method: "GET" | "POST" | "PUT", path: string, body?: unknown): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/api${path}`, {
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
export type IngestedUnit = LearningUnit & { usedFallback: boolean };
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
export async function demoLogin(userId: string): Promise<ApiResult<{ user: User; token: string }>> {
  const r = await request<{ user: User; token: string }>("POST", "/auth/login", { userId });
  if (r.ok) setToken(r.data.token);
  return r;
}
export const demoLogout = () => setToken(undefined);

// ---- Unidades y docente ----
export const listUnits = () => request<LearningUnit[]>("GET", "/units");
export const getUnit = (unitId: string) => request<LearningUnit>("GET", `/units/${encodeURIComponent(unitId)}`);
export const ingestDocument = (input: { title?: string; text: string }) =>
  request<IngestedUnit>("POST", "/ai/ingest-document", input);
export const approveRubric = (unitId: string, rubric?: RubricCriterion[]) =>
  request<LearningUnit>("PUT", "/teacher/approve-rubric", { unitId, rubric });

// ---- Estudiante ----
export const getStudentProfile = (studentId: string) =>
  request<StudentProfile>("GET", `/students/${encodeURIComponent(studentId)}/profile`);
export const completeMission = (input: Omit<LabMissionComplete, "type"> & { studentId: string }) =>
  request<GamificationAndBenchmarkProfile>("POST", "/labs/complete-mission", { type: "LAB_MISSION_COMPLETE", ...input });
export const syncProgress = (studentId: string, events: Array<{ xp?: number; coins?: number }>) =>
  request<{ synced: number }>("POST", "/progress/sync", { studentId, events });
export const analyzeHandwrittenPhoto = (input: { imageBase64?: string; explanation?: string }) =>
  request<HandwrittenAnalysis>("POST", "/ai/analyze-handwritten-photo", input);

// ---- Juegos y ligas ----
export const getLeaderboard = (league: "mastery" | "effort" = "mastery") =>
  request<GamificationAndBenchmarkProfile[]>("GET", `/leagues/leaderboard?league=${league}`);
export const validateDuelQuestion = (question: string, topic?: string) =>
  request<{ valid: boolean; reason: string }>("POST", "/ai/validate-duel-question", { question, topic });
export const getGhostOpponent = (ageTier?: string) =>
  request<GhostOpponent>("GET", `/duel/ghost-opponent${ageTier ? `?ageTier=${ageTier}` : ""}`);
export const reportDuelResult = (input: { studentId: string; won: boolean; questionsCreated?: number }) =>
  request<{ xp: number; coins: number; profile: GamificationAndBenchmarkProfile }>("POST", "/duel/result", input);

// ---- Familia y benchmark ----
export const getFamilyExplanation = (topic?: string) =>
  request<{ explanation: string }>("POST", "/ai/family-home-explainer", { topic });
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
