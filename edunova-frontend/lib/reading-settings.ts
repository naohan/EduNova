// lib/reading-settings.ts
// Ajustes visuales de lectura accesibles para estudiantes (P12).

export type ReadingSize = "normal" | "grande" | "muy-grande";
export type ReadingSpacing = "normal" | "amplio";
export type ReadingContrast = "normal" | "alto";
export type ReadingFont = "normal" | "clara";

export interface ReadingSettings {
  size: ReadingSize;
  spacing: ReadingSpacing;
  contrast: ReadingContrast;
  font: ReadingFont;
}

export const DEFAULT_READING_SETTINGS: ReadingSettings = {
  size: "normal",
  spacing: "normal",
  contrast: "normal",
  font: "normal",
};

const STORAGE_KEY = "edunova_reading_settings";
let inMemorySettings: ReadingSettings = { ...DEFAULT_READING_SETTINGS };

export function loadReadingSettings(): ReadingSettings {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ReadingSettings>;
        inMemorySettings = {
          size: parsed.size === "grande" || parsed.size === "muy-grande" ? parsed.size : "normal",
          spacing: parsed.spacing === "amplio" ? "amplio" : "normal",
          contrast: parsed.contrast === "alto" ? "alto" : "normal",
          font: parsed.font === "clara" ? "clara" : "normal",
        };
      }
    }
  } catch {
    // Si localStorage falla o no está disponible, conserva en memoria
  }
  return inMemorySettings;
}

export function applyReadingSettings(settings: ReadingSettings): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-reading-size", settings.size);
  root.setAttribute("data-reading-spacing", settings.spacing);
  root.setAttribute("data-reading-contrast", settings.contrast);
  root.setAttribute("data-reading-font", settings.font);
}

export function saveReadingSettings(settings: ReadingSettings): void {
  inMemorySettings = { ...settings };
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  } catch {
    // Si localStorage falla o no está disponible, conserva en memoria
  }
  applyReadingSettings(settings);
}
