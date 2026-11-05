"use client";

import { useState } from "react";
import { sounds } from "./SoundFX";
import { CheckCircleIcon, LightbulbIcon } from "@/components/ui/icons";

const QUESTIONS = [
  {
    age: "7 a 9",
    question: "Tienes 3 cofres y cada uno guarda 4 gemas. ¿Cuántas gemas tienes?",
    options: ["7 gemas", "12 gemas", "10 gemas", "9 gemas"],
    correctIdx: 1,
    explanation: "3 cofres por 4 gemas son 12 gemas.",
  },
  {
    age: "10 a 12",
    question: "¿Qué planeta tiene los anillos más visibles con un telescopio?",
    options: ["Marte", "Júpiter", "Saturno", "Neptuno"],
    correctIdx: 2,
    explanation: "Saturno. Sus anillos están hechos de hielo y roca.",
  },
  {
    age: "13 a 15",
    question: "¿Qué cámara del corazón envía la sangre oxigenada a todo el cuerpo?",
    options: ["Aurícula derecha", "Ventrículo derecho", "Aurícula izquierda", "Ventrículo izquierdo"],
    correctIdx: 3,
    explanation: "El ventrículo izquierdo, que la impulsa por la arteria aorta.",
  },
];

export function InteractiveReto() {
  const [activeQIdx, setActiveQIdx] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);

  const q = QUESTIONS[activeQIdx];
  const answered = selected !== null;
  const correct = selected === q.correctIdx;

  function choose(idx: number) {
    if (answered) return;
    setSelected(idx);
    if (idx === q.correctIdx) sounds.playPowerUp();
    else sounds.playClick();
  }

  function goTo(idx: number) {
    setActiveQIdx(idx);
    setSelected(null);
    sounds.playClick();
  }

  return (
    <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 sm:p-6">
      <div role="group" aria-label="Elige tu edad" className="flex flex-wrap gap-2">
        {QUESTIONS.map((item, idx) => (
          <button
            key={item.age}
            type="button"
            aria-pressed={activeQIdx === idx}
            onClick={() => goTo(idx)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
              activeQIdx === idx ? "bg-[#5636D9] text-white" : "bg-[#F2EEFF] text-[#17164F] hover:bg-[#E8E0FF]"
            }`}
          >
            {item.age} años
          </button>
        ))}
      </div>

      <p className="mt-5 font-[family-name:var(--font-fredoka)] text-xl font-semibold leading-snug text-[#17164F]">
        {q.question}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {q.options.map((opt, idx) => {
          let tone = "border-[#E8E0FF] bg-white text-[#17164F] hover:border-[#5636D9]";
          if (answered && idx === q.correctIdx) tone = "border-[#1B8A4F] bg-[#E3F8EC] text-[#17164F]";
          else if (answered && idx === selected) tone = "border-[#D9583F] bg-[#FFEDE8] text-[#17164F]";
          else if (answered) tone = "border-[#E8E0FF] bg-white text-[#5B5678]";
          return (
            <button
              key={opt}
              type="button"
              disabled={answered}
              onClick={() => choose(idx)}
              className={`flex items-center justify-between gap-2 rounded-xl border-2 p-3 text-left font-semibold transition-colors ${tone}`}
            >
              {opt}
              {answered && idx === q.correctIdx ? (
                <CheckCircleIcon weight="fill" className="h-5 w-5 shrink-0 text-[#1B8A4F]" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>

      {answered ? (
        <div role="status" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F7F4FF] p-3.5">
          <p className="flex min-w-0 flex-1 items-start gap-2 text-[#17164F]">
            <LightbulbIcon weight="fill" className="mt-0.5 h-5 w-5 shrink-0 text-[#5636D9]" aria-hidden />
            <span>
              <strong>{correct ? "¡Correcto!" : "Casi."}</strong> {q.explanation}
            </span>
          </p>
          <button
            type="button"
            onClick={() => goTo((activeQIdx + 1) % QUESTIONS.length)}
            className="rounded-xl bg-[#5636D9] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#4528b8]"
          >
            Otro reto
          </button>
        </div>
      ) : null}
    </div>
  );
}
