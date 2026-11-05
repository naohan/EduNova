"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ActivityQuiz } from "@/components/estudiante/shared/ActivityQuiz";
import {
  COMU_ACTIVITIES,
  COMU_ASSETS,
  type ComuStation,
} from "./comuMapData";

type Props = {
  station: ComuStation;
  onComplete: (xpGained: number) => void;
  onClose: () => void;
};

export function ReadingActivity({ station, onComplete, onClose }: Props) {
  const activity =
    COMU_ACTIVITIES[station.activityId] ?? COMU_ACTIVITIES["cuento-luna"];
  const [paraIdx, setParaIdx] = useState(0);
  const [step, setStep] = useState<"leer" | "quiz">("leer");
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speak(text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 0.95;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  function stopAudio() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  if (step === "quiz") {
    return (
      <ActivityQuiz
        title={activity.title}
        intro="Responde según lo que leíste. ¡Cada acierto da XP!"
        questions={activity.questions}
        onClose={onClose}
        onPass={onComplete}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#17164F]/55 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Image
              src={station.icon}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {station.shortTitle}
              </p>
              <h2 className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-white sm:text-xl">
                {activity.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-[28px] bg-white p-4 shadow-xl sm:p-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => speak(activity.paragraphs[paraIdx])}
              className="inline-flex items-center gap-2 rounded-full bg-[#F2EEFF] px-3 py-2 text-xs font-bold text-[#5636D9]"
            >
              <Image
                src={COMU_ASSETS.audio}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5"
              />
              {speaking ? "Leyendo…" : "Escuchar párrafo"}
            </button>
            <button
              type="button"
              onClick={() => speak(activity.paragraphs.join(" "))}
              className="rounded-full bg-[#FFEAF2] px-3 py-2 text-xs font-bold text-[#E85D9A]"
            >
              Escuchar cuento completo
            </button>
            <button
              type="button"
              onClick={stopAudio}
              className="rounded-full border border-[#E8E0FF] px-3 py-2 text-xs font-bold text-[#6B7280]"
            >
              Detener
            </button>
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl bg-[#F7F4FF] p-4">
            {activity.paragraphs.map((p, i) => (
              <p
                key={i}
                className={`mb-3 text-sm leading-relaxed sm:text-base ${
                  i === paraIdx
                    ? "rounded-xl bg-[#EDE7FF] px-3 py-2 font-semibold text-[#17164F] ring-2 ring-[#5636D9]/30"
                    : "text-[#5B5678]"
                }`}
              >
                {p}
              </p>
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={paraIdx === 0}
              onClick={() => setParaIdx((i) => Math.max(0, i - 1))}
              className="rounded-full bg-[#F2EEFF] px-4 py-2 text-sm font-bold text-[#17164F] disabled:opacity-40"
            >
              ← Anterior
            </button>
            {paraIdx < activity.paragraphs.length - 1 ? (
              <button
                type="button"
                onClick={() => setParaIdx((i) => i + 1)}
                className="rounded-full bg-[#5636D9] px-4 py-2 text-sm font-bold text-white"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  stopAudio();
                  setStep("quiz");
                }}
                className="rounded-full bg-[#5636D9] px-4 py-2 text-sm font-bold text-white"
              >
                Ir a preguntas →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
