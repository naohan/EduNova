import type { AgeTier, SubtopicNode } from "./edunova-contract";

// Edad en años -> modo Camaleón (7-9, 10-12, 13-15).
export function ageTierFromAge(age: number): AgeTier {
  if (age <= 9) return "EXPLORADOR_7_9";
  if (age <= 12) return "AVENTURERO_10_12";
  return "CREADOR_13_15";
}

export const ageTierLabel: Record<AgeTier, string> = {
  EXPLORADOR_7_9: "Explorador",
  AVENTURERO_10_12: "Aventurero",
  CREADOR_13_15: "Creador",
};

// El backend devuelve el texto de las tres edades; la pantalla elige el suyo.
export const storyFor = (subtopic: SubtopicNode, tier: AgeTier) => subtopic.stages.discover.storyTextByAge[tier];
