export type QuizType =
  | "multiple"
  | "truefalse"
  | "associate"
  | "order"
  | "complete";

export type QuizQuestion = {
  id: string;
  type: QuizType;
  enunciado: string;
  opciones?: string[];
  /** Respuesta correcta (texto o índice string) */
  respuesta: string;
  /** Para type "order": orden correcto separado por | */
  orden?: string[];
  explicacion: string;
  pista?: string;
  xp: number;
};

export type CourseProgress = {
  completedIds: string[];
  currentId: string;
  /** XP acumulado del curso (sin repetir estaciones) */
  xp: number;
  rewardedIds: string[];
};

export function loadCourseProgress(
  key: string,
  defaults: CourseProgress,
): CourseProgress {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    const p = JSON.parse(raw) as CourseProgress;
    if (!p.currentId || !Array.isArray(p.completedIds)) return defaults;
    return {
      completedIds: p.completedIds,
      currentId: p.currentId,
      xp: typeof p.xp === "number" ? p.xp : 0,
      rewardedIds: Array.isArray(p.rewardedIds) ? p.rewardedIds : [],
    };
  } catch {
    return defaults;
  }
}

export function saveCourseProgress(key: string, progress: CourseProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(progress));
}
