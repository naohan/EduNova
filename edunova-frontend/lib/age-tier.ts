"use client";

import { useSyncExternalStore } from "react";
import type { AgeTier } from "@/lib/api/edunova-contract";

// Modo Camaleón por edad (HU-02): el estudiante cambia entre 7-9, 10-12 y 13-15 en vivo.
// La elección se guarda en localStorage y se comparte entre todas las pantallas y pestañas.
// useSyncExternalStore evita desajustes de hidratación: el servidor siempre pinta el modo por defecto.

export const AGE_TIERS: AgeTier[] = ["EXPLORADOR_7_9", "AVENTURERO_10_12", "CREADOR_13_15"];
export const DEFAULT_AGE_TIER: AgeTier = "AVENTURERO_10_12";

export const ageTierRange: Record<AgeTier, string> = {
  EXPLORADOR_7_9: "7–9 años",
  AVENTURERO_10_12: "10–12 años",
  CREADOR_13_15: "13–15 años",
};

const KEY = "edunova-age-tier";
const EVENT = "edunova-age-tier-change";

// Si localStorage no está disponible (modo privado), la elección vive en memoria.
let memoryTier: AgeTier | undefined;

function isAgeTier(value: unknown): value is AgeTier {
  return AGE_TIERS.includes(value as AgeTier);
}

function getSnapshot(): AgeTier {
  try {
    const stored = window.localStorage.getItem(KEY);
    return isAgeTier(stored) ? stored : DEFAULT_AGE_TIER;
  } catch {
    return memoryTier ?? DEFAULT_AGE_TIER;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange); // otra pestaña
  window.addEventListener(EVENT, onChange); // esta pestaña
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function setAgeTier(tier: AgeTier) {
  memoryTier = tier;
  try {
    window.localStorage.setItem(KEY, tier);
  } catch {
    // ya quedó en memoria
  }
  window.dispatchEvent(new Event(EVENT));
}

export function useAgeTier(): [AgeTier, (tier: AgeTier) => void] {
  const tier = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_AGE_TIER);
  return [tier, setAgeTier];
}
