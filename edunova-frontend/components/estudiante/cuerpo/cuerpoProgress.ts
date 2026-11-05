import type { OrganId } from "./organData";
import { ORGANOS } from "./organData";
import { CUERPO_MISSIONS } from "./organQuizData";

export type CuerpoProgress = {
  discoveredIds: OrganId[];
  quizPassedIds: OrganId[];
  missionsDone: string[];
  xp: number;
  lastId: OrganId;
};

export const CUERPO_STORAGE_KEY = "edunova-cuerpo-lab-progress-v1";

export const DEFAULT_CUERPO_PROGRESS: CuerpoProgress = {
  discoveredIds: [],
  quizPassedIds: [],
  missionsDone: [],
  xp: 0,
  lastId: "corazon",
};

export function loadCuerpoProgress(): CuerpoProgress {
  if (typeof window === "undefined") return DEFAULT_CUERPO_PROGRESS;
  try {
    const raw = localStorage.getItem(CUERPO_STORAGE_KEY);
    if (!raw) return DEFAULT_CUERPO_PROGRESS;
    const p = JSON.parse(raw) as CuerpoProgress;
    if (!Array.isArray(p.discoveredIds)) return DEFAULT_CUERPO_PROGRESS;
    return {
      discoveredIds: p.discoveredIds,
      quizPassedIds: Array.isArray(p.quizPassedIds) ? p.quizPassedIds : [],
      missionsDone: Array.isArray(p.missionsDone) ? p.missionsDone : [],
      xp: typeof p.xp === "number" ? p.xp : 0,
      lastId: p.lastId && ORGANOS.some((o) => o.id === p.lastId) ? p.lastId : "corazon",
    };
  } catch {
    return DEFAULT_CUERPO_PROGRESS;
  }
}

export function saveCuerpoProgress(progress: CuerpoProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUERPO_STORAGE_KEY, JSON.stringify(progress));
}

/** Marca órgano como descubierto (+XP una sola vez) */
export function discoverOrgan(
  id: OrganId,
  progress: CuerpoProgress,
): CuerpoProgress {
  if (progress.discoveredIds.includes(id)) {
    if (progress.lastId === id) return progress;
    return { ...progress, lastId: id };
  }
  let next: CuerpoProgress = {
    ...progress,
    discoveredIds: [...progress.discoveredIds, id],
    lastId: id,
    xp: progress.xp + 10,
  };
  next = checkMissions(next);
  return next;
}

export function passOrganQuiz(
  id: OrganId,
  progress: CuerpoProgress,
  xpGained: number,
): CuerpoProgress {
  if (progress.quizPassedIds.includes(id)) {
    return progress;
  }
  let next: CuerpoProgress = {
    ...progress,
    quizPassedIds: [...progress.quizPassedIds, id],
    xp: progress.xp + xpGained,
  };
  next = checkMissions(next);
  return next;
}

function checkMissions(progress: CuerpoProgress): CuerpoProgress {
  let xp = progress.xp;
  const missionsDone = [...progress.missionsDone];
  for (const m of CUERPO_MISSIONS) {
    if (missionsDone.includes(m.id)) continue;
    const ok = m.organIds.every((id) => progress.discoveredIds.includes(id));
    if (ok) {
      missionsDone.push(m.id);
      xp += m.xpBonus;
    }
  }
  return { ...progress, missionsDone, xp };
}

export function activeMission(progress: CuerpoProgress) {
  return (
    CUERPO_MISSIONS.find((m) => !progress.missionsDone.includes(m.id)) ??
    CUERPO_MISSIONS[0]
  );
}

export function missionProgress(progress: CuerpoProgress) {
  const m = activeMission(progress);
  const done = m.organIds.filter((id) =>
    progress.discoveredIds.includes(id),
  ).length;
  return { mission: m, done, total: m.organIds.length };
}
