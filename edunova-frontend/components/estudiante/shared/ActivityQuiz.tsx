"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRightIcon, LightbulbIcon, StarIcon } from "@/components/ui/icons";
import { BotonSalir, BotonVoz, Opcion, PuntosAvance } from "./kit";
import type { QuizQuestion } from "./quizTypes";

type Props = {
  questions: QuizQuestion[];
  title: string;
  intro?: string;
  onPass: (xpGained: number) => void;
  onClose: () => void;
};

export function ActivityQuiz({ questions, title, intro, onPass, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [hint, setHint] = useState(false);
  const [xpTotal, setXpTotal] = useState(0);
  const [orderDraft, setOrderDraft] = useState<string[]>([]);
  const [elegida, setElegida] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];

  const shuffledOrder = useMemo(() => {
    if (q?.type !== "order" || !q.orden) return [];
    return [...q.orden].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id]);

  function check(answer: string) {
    if (!q || feedback === "ok") return;
    setElegida(answer);
    const correct =
      q.type === "order"
        ? answer === (q.orden ?? []).join("|")
        : answer.trim().toLowerCase() === q.respuesta.trim().toLowerCase();

    if (correct) {
      setFeedback("ok");
      setXpTotal((x) => x + q.xp);
    } else {
      setFeedback("bad");
      if (q.type === "order") setOrderDraft([]);
    }
  }

  function continueAfterCorrect() {
    if (feedback !== "ok" || !q) return;
    setFeedback(null);
    setHint(false);
    setOrderDraft([]);
    setElegida(null);
    if (idx + 1 >= questions.length) setFinished(true);
    else setIdx((i) => i + 1);
  }

  function toggleOrderItem(item: string) {
    if (feedback === "ok") return;
    setFeedback(null);
    setOrderDraft((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  }

  if (finished) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#F7F4FF] p-4">
        <div className="w-full max-w-sm text-center">
          <Image src="/assets/woebling.png" alt="" width={140} height={128} className="mx-auto h-auto w-32" />
          <h2 className="mt-4 font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">¡Lo lograste!</h2>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xl font-bold text-[#17164F]">
            <StarIcon weight="fill" className="h-6 w-6 text-[#FFC928]" aria-hidden />+{xpTotal} XP
          </p>
          <button
            type="button"
            onClick={() => onPass(xpTotal)}
            aria-label="Continuar"
            className="btn-tactil tactil-cooperar mt-6 w-full py-4 text-lg text-[#17164F]"
          >
            <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  const estadoDe = (opt: string) => {
    if (feedback === "ok" && opt === elegida) return "bien" as const;
    if (feedback === "bad" && opt === elegida) return "mal" as const;
    return "normal" as const;
  };
  const textoVoz = [idx === 0 ? intro : undefined, q.enunciado, ...(q.opciones ?? [])].filter(Boolean).join(". ");

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[60] flex flex-col bg-[#F7F4FF]">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <PuntosAvance actual={idx + (feedback === "ok" ? 1 : 0)} total={questions.length} etiqueta="Preguntas" />
          <BotonSalir onClick={onClose} etiqueta="Cerrar" />
        </div>

        <div className="mt-6 flex items-start gap-3">
          <p className="min-w-0 flex-1 font-[family-name:var(--font-fredoka)] text-2xl font-bold leading-snug text-[#17164F] sm:text-3xl">
            {q.enunciado}
          </p>
          <BotonVoz texto={textoVoz} />
        </div>

        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-1">
          {q.type !== "order" &&
            (q.opciones ?? []).map((opt) => (
              <Opcion key={opt} estado={estadoDe(opt)} disabled={feedback === "ok"} onClick={() => check(opt)}>
                {opt}
              </Opcion>
            ))}

          {q.type === "order" && (
            <>
              <ol className="flex min-h-[64px] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-[#CFC4F5] p-2" aria-label="Tu orden">
                {orderDraft.map((item, i) => (
                  <li key={item} className="rounded-xl bg-[#5636D9] px-3 py-2 font-bold text-white">
                    {i + 1}. {item}
                  </li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2">
                {shuffledOrder
                  .filter((item) => !orderDraft.includes(item))
                  .map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleOrderItem(item)}
                      className="btn-tactil tactil-blanco border-2 border-b-4 border-[#E8E0FF] px-4 py-3 text-base text-[#17164F]"
                    >
                      {item}
                    </button>
                  ))}
              </div>
              {feedback !== "ok" && orderDraft.length === (q.orden ?? []).length ? (
                <button
                  type="button"
                  onClick={() => check(orderDraft.join("|"))}
                  aria-label="Comprobar"
                  className="btn-tactil tactil-magia w-full py-3.5 text-white"
                >
                  <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
                </button>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-3 flex min-h-[64px] items-center gap-3">
          {feedback === "ok" ? (
            <>
              <p role="status" className="min-w-0 flex-1 text-lg font-bold text-[#1B8A4F]">
                ¡Bien! +{q.xp} XP
              </p>
              <button
                type="button"
                onClick={continueAfterCorrect}
                aria-label="Siguiente"
                className="btn-tactil tactil-cooperar px-8 py-3 text-[#17164F]"
              >
                <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
              </button>
            </>
          ) : (
            <>
              <p role="status" className="min-w-0 flex-1 text-base font-bold text-[#17164F]">
                {hint ? q.pista : feedback === "bad" ? "Casi. Prueba otra." : null}
              </p>
              {q.pista && !hint ? (
                <button
                  type="button"
                  onClick={() => setHint(true)}
                  aria-label="Ver pista"
                  title="Ver pista"
                  className="btn-tactil tactil-juego h-12 w-12 text-[#17164F]"
                >
                  <LightbulbIcon weight="fill" className="h-6 w-6" aria-hidden />
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
