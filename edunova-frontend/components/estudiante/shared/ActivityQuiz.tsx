"use client";

import { useMemo, useState } from "react";
import type { QuizQuestion } from "./quizTypes";

type Props = {
  questions: QuizQuestion[];
  title: string;
  intro?: string;
  onPass: (xpGained: number) => void;
  onClose: () => void;
};

export function ActivityQuiz({
  questions,
  title,
  intro,
  onPass,
  onClose,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [hint, setHint] = useState(false);
  const [xpTotal, setXpTotal] = useState(0);
  const [orderDraft, setOrderDraft] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];

  const shuffledOrder = useMemo(() => {
    if (q?.type !== "order" || !q.orden) return [];
    return [...q.orden].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id]);

  function check(answer: string) {
    if (!q || feedback === "ok") return;
    const correct =
      q.type === "order"
        ? answer === (q.orden ?? []).join("|")
        : answer.trim().toLowerCase() === q.respuesta.trim().toLowerCase();

    if (correct) {
      setFeedback("ok");
      setXpTotal((x) => x + q.xp);
    } else {
      setFeedback("bad");
    }
  }

  function continueAfterCorrect() {
    if (feedback !== "ok" || !q) return;
    const nextXp = xpTotal;
    setFeedback(null);
    setHint(false);
    setOrderDraft([]);
    if (idx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIdx((i) => i + 1);
    }
    void nextXp;
  }

  function toggleOrderItem(item: string) {
    if (feedback === "ok") return;
    setOrderDraft((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  }

  if (finished) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#17164F]/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
          <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            ¡Actividad completada!
          </h2>
          <p className="mt-1 text-sm text-[#5B5678]">+{xpTotal} XP</p>
          <div className="mx-auto mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E8E0FF]">
            <div className="h-full w-full rounded-full bg-[#2DBE70]" />
          </div>
          <button
            type="button"
            onClick={() => onPass(xpTotal)}
            className="mt-4 w-full rounded-full bg-[#5636D9] py-3 text-sm font-bold text-white"
          >
            Continuar →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#17164F]/55 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Pregunta {idx + 1}/{questions.length}
            </p>
            <h2 className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-white">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white"
          >
            Cerrar
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] bg-white p-4 shadow-xl sm:p-5">
          {intro && idx === 0 && feedback === null && (
            <p className="mb-3 rounded-2xl bg-[#F2EEFF] p-3 text-xs text-[#17164F]">
              {intro}
            </p>
          )}

          <p className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
            {q.enunciado}
          </p>

          <div className="mt-4 flex flex-1 flex-col gap-2 overflow-y-auto">
            {(q.type === "multiple" ||
              q.type === "truefalse" ||
              q.type === "complete" ||
              q.type === "associate") &&
              (q.opciones ?? []).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={feedback === "ok"}
                  onClick={() => check(opt)}
                  className="rounded-2xl bg-[#F2EEFF] px-4 py-3 text-left text-sm font-bold text-[#17164F] hover:bg-[#5636D9] hover:text-white disabled:opacity-60"
                >
                  {opt}
                </button>
              ))}

            {q.type === "order" && (
              <>
                <p className="text-xs text-[#6B7280]">Toca en el orden correcto:</p>
                <div className="flex flex-wrap gap-2">
                  {shuffledOrder.map((item) => (
                    <button
                      key={item}
                      type="button"
                      disabled={feedback === "ok"}
                      onClick={() => toggleOrderItem(item)}
                      className={`rounded-full px-3 py-2 text-xs font-bold ${
                        orderDraft.includes(item)
                          ? "bg-[#5636D9] text-white"
                          : "bg-[#F2EEFF] text-[#17164F]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#5B5678]">
                  Orden: {orderDraft.join(" → ") || "—"}
                </p>
                <button
                  type="button"
                  disabled={feedback === "ok"}
                  onClick={() => check(orderDraft.join("|"))}
                  className="mt-2 rounded-full bg-[#5636D9] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  Comprobar orden
                </button>
              </>
            )}
          </div>

          {q.pista && feedback !== "ok" && (
            <button
              type="button"
              onClick={() => setHint(true)}
              className="mt-2 self-start text-xs font-semibold text-[#5636D9]"
            >
              {hint ? `💡 ${q.pista}` : "Ver pista"}
            </button>
          )}

          {feedback === "ok" && (
            <div className="mt-3 rounded-2xl bg-[#D1FAE5] p-3 text-sm font-semibold text-[#065F46]">
              ¡Correcto! +{q.xp} XP
              <p className="mt-1 text-xs font-normal">{q.explicacion}</p>
              <button
                type="button"
                onClick={continueAfterCorrect}
                className="mt-3 w-full rounded-full bg-[#2DBE70] py-2.5 text-sm font-bold text-white"
              >
                Continuar →
              </button>
            </div>
          )}
          {feedback === "bad" && (
            <div className="mt-3 rounded-2xl bg-[#FEF3C7] p-3 text-sm font-semibold text-[#92400E]">
              Casi… inténtalo de nuevo.
              <p className="mt-1 text-xs font-normal">{q.explicacion}</p>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="mt-2 text-xs font-bold underline"
              >
                Reintentar
              </button>
            </div>
          )}

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8E0FF]">
            <div
              className="h-full rounded-full bg-[#5636D9] transition-all"
              style={{
                width: `${((idx + (feedback === "ok" ? 1 : 0)) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
