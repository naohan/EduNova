// lib/speech.ts
// Guía por voz para lectura accesible de preguntas y contenidos con Web Speech API.

const noopSubscribe = () => () => {};

export { noopSubscribe };

// Quita emojis: algunos lectores de voz los leen como "cara sonriente".
export const speakable = (text: string): string =>
  text.replace(/\p{Extended_Pictographic}/gu, "").replace(/\s+/g, " ").trim();

export function hasSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export interface SpeakOptions {
  rate?: number;
  onEnd?: () => void;
  onError?: () => void;
}

export function speak(text: string, options?: SpeakOptions): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const clean = speakable(text);
  if (!clean) return false;
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "es-ES";
  if (options?.rate !== undefined) utterance.rate = options.rate;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;
  window.speechSynthesis.speak(utterance);
  return true;
}
