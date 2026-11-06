"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { hasSpeech, noopSubscribe, speak, stopSpeech } from "@/lib/speech";

/**
 * Lee el texto en voz alta con la Web Speech API. Con `prominent` (modo Explorador 7–9)
 * el botón es grande y la voz más lenta.
 *
 * Usar con `key` distinto cuando cambie el texto: al desmontarse se corta la voz.
 */
export function StoryPlayer({ text, prominent = false }: { text: string; prominent?: boolean }) {
  const supported = useSyncExternalStore(noopSubscribe, hasSpeech, () => false);
  const [speaking, setSpeaking] = useState(false);

  // speechSynthesis es global: si el componente se desmonta (otra pantalla u otra edad), hay que cortarla.
  useEffect(() => () => stopSpeech(), []);

  function toggle() {
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }
    const ok = speak(text, {
      rate: prominent ? 0.85 : 1,
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
    if (ok) setSpeaking(true);
  }

  if (!supported) {
    return (
      <p className="rounded-2xl bg-[#FFF6E8] p-3 text-xs text-[#17164F]/70">
        Tu navegador no puede leer en voz alta. Pídele a un adulto que te lea el texto.
      </p>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-[#E8E0FF] bg-white ${
        prominent ? "p-5" : "p-4"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={speaking ? "Detener la lectura" : "Escuchar la explicación"}
        className={`flex shrink-0 items-center justify-center rounded-full bg-[#5636D9] text-white ${
          prominent ? "h-16 w-16 text-2xl" : "h-12 w-12"
        }`}
      >
        {speaking ? "■" : "▶"}
      </button>
      <div className="min-w-0 flex-1">
        <div className={`font-semibold text-[#17164F] ${prominent ? "text-lg" : "text-sm"}`}>
          {speaking ? "Escuchando…" : "Escuchar explicación"}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E8E0FF]">
          <div
            className={`h-full rounded-full bg-[#4C9EFF] transition-all ${
              speaking ? "w-full animate-pulse" : "w-0"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
