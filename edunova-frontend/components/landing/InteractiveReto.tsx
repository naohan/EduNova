"use client";

import React, { useState } from "react";
import { sounds } from "./SoundFX";
import { TrophyIcon, ArrowRightIcon, CheckCircleIcon, FireIcon } from "@/components/ui/icons";

interface Question {
  id: number;
  stage: string;
  age: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string;
  badge: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    stage: "Exploradores",
    age: "7-9 años",
    question: "Si tienes 3 cofres y cada uno contiene 4 gemas brillantes, ¿cuántas gemas tienes en total?",
    options: ["7 gemas", "12 gemas", "10 gemas", "9 gemas"],
    correctIdx: 1,
    explanation: "¡Exacto! 3 cofres × 4 gemas = 12 gemas. ¡Multiplicación mágica completada!",
    badge: "Mago del Cálculo",
  },
  {
    id: 2,
    stage: "Aventureros",
    age: "10-12 años",
    question: "¿Qué planeta de nuestro sistema solar posee los anillos más espectaculares visibles con telescopio?",
    options: ["Marte", "Júpiter", "Saturno", "Neptuno"],
    correctIdx: 2,
    explanation: "¡Brillante! Saturno tiene anillos formados por millones de fragmentos de hielo y roca.",
    badge: "Astronauta Épico",
  },
  {
    id: 3,
    stage: "Creadores",
    age: "13-15 años",
    question: "¿Qué cámara del corazón humano bombea sangre oxigenada hacia todo el cuerpo a través de la arteria Aorta?",
    options: [
      "Aurícula derecha",
      "Ventrículo derecho",
      "Aurícula izquierda",
      "Ventrículo izquierdo",
    ],
    correctIdx: 3,
    explanation: "¡Excelente! El ventrículo izquierdo tiene las paredes musculares más gruesas para impulsar la sangre con fuerza a todo el cuerpo.",
    badge: "Maestro Bio-Científico",
  },
];

export function InteractiveReto() {
  const [activeQIdx, setActiveQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = QUESTIONS[activeQIdx];

  const handleChoose = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);

    if (idx === currentQ.correctIdx) {
      setIsCorrect(true);
      setScore((s) => s + 100);
      sounds.playPowerUp();
    } else {
      setIsCorrect(false);
      sounds.playClick();
    }
  };

  const handleNext = () => {
    sounds.playClick();
    setSelectedOption(null);
    setAnswered(false);
    setIsCorrect(false);
    setActiveQIdx((prev) => (prev + 1) % QUESTIONS.length);
  };

  return (
    <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border-2 border-[#5636D9]/30 bg-gradient-to-b from-[#18154D] via-[#120F3B] to-[#0A0826] p-6 text-white shadow-2xl sm:p-10">
      {/* Fondo con estrellas animadas */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#5636D9]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#00F0FF]/15 blur-3xl" />

      {/* Cabecera del Reto */}
      <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFC928] text-[#17164F] shadow-lg shadow-[#FFC928]/30">
            <FireIcon weight="fill" className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#00F0FF]">
              RETO RÁPIDO INTERACTIVO
            </span>
            <h3 className="font-[family-name:var(--font-fredoka)] text-xl font-bold sm:text-2xl">
              ¡Demuestra tus poderes en 10 segundos!
            </h3>
          </div>
        </div>

        {/* Marcador de XP en vivo */}
        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-1.5 backdrop-blur-md">
          <TrophyIcon className="h-5 w-5 text-[#FFC928]" />
          <span className="font-mono text-sm font-bold text-[#FFC928]">
            +{score} XP ACUMULADOS
          </span>
        </div>
      </div>

      {/* Selector de Nivel de Pregunta */}
      <div className="relative mt-5 flex gap-2">
        {QUESTIONS.map((q, idx) => (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              setActiveQIdx(idx);
              setSelectedOption(null);
              setAnswered(false);
              setIsCorrect(false);
              sounds.playClick();
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
              activeQIdx === idx
                ? "bg-[#5636D9] text-white shadow-md shadow-[#5636D9]/50 scale-105"
                : "bg-white/5 text-white/60 hover:bg-white/15 hover:text-white"
            }`}
          >
            {q.stage} ({q.age})
          </button>
        ))}
      </div>

      {/* Cuerpo de la Pregunta */}
      <div className="relative mt-6">
        <div className="rounded-2xl bg-white/5 p-4 border border-white/10 sm:p-5">
          <p className="font-[family-name:var(--font-fredoka)] text-lg font-semibold leading-snug sm:text-xl">
            {currentQ.question}
          </p>
        </div>

        {/* Opciones de respuesta táctiles estilo quiz gamer */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {currentQ.options.map((opt, idx) => {
            let optStyle = "bg-white/10 text-white hover:bg-white/20 border-white/10";
            if (answered) {
              if (idx === currentQ.correctIdx) {
                optStyle = "bg-[#2DBE70] text-[#0A2E1A] font-bold border-[#2DBE70] shadow-[0_0_20px_rgba(45,190,112,0.4)] scale-102";
              } else if (selectedOption === idx) {
                optStyle = "bg-[#FF5C5C]/30 text-[#FF8A8A] border-[#FF5C5C]";
              } else {
                optStyle = "opacity-40 bg-white/5 border-transparent";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={answered}
                onClick={() => handleChoose(idx)}
                className={`card-tactil flex items-center justify-between rounded-xl border-2 p-3.5 text-left text-sm font-semibold transition-all duration-150 ${optStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-black/20 font-mono text-xs font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>
                {answered && idx === currentQ.correctIdx && (
                  <CheckCircleIcon weight="fill" className="h-5 w-5 text-white shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Retroalimentación inmediata con botón para continuar o unirse */}
      {answered && (
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{isCorrect ? "🎉" : "💡"}</span>
                <span
                  className={`font-[family-name:var(--font-fredoka)] text-base font-bold ${
                    isCorrect ? "text-[#00FF88]" : "text-[#FFC928]"
                  }`}
                >
                  {isCorrect ? "¡Respuesta Correcta! +100 XP" : "¡Casi lo logras! Aprende del intento:"}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/80">{currentQ.explanation}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-white/20 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-white/30"
              >
                Otro Reto
              </button>
              <a
                href="/login"
                className="btn-tactil inline-flex items-center gap-1.5 rounded-xl bg-[#2DBE70] px-4 py-2 text-xs font-bold text-[#0A2E1A] transition-transform hover:scale-105"
              >
                <span>Guardar mi XP</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
