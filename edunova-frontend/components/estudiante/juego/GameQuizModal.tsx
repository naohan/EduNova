"use client";

import { useMemo, useState } from "react";
import type { QuizQuestion } from "@/components/estudiante/shared/quizTypes";
import { BotonSalir, BotonVoz, Opcion } from "@/components/estudiante/shared/kit";
import type { CharacterProfile, PlayerState } from "./gameTypes";
import { iconoHabilidad } from "./CharacterCard";
import { soundManager } from "./soundEffects";
import { ArrowRightIcon, FireIcon, HeartIcon, ShieldCheckIcon, UsersIcon } from "@/components/ui/icons";

type Props = {
  question: QuizQuestion;
  tileTitle: string;
  tileKind: string;
  player: PlayerState;
  character: CharacterProfile;
  combo: number;
  onResolve: (result: {
    correct: boolean;
    xp: number;
    coins: number;
    lives: number;
    combo: number;
    usedAbility?: boolean;
  }) => void;
  onClose: () => void;
};

const mismaRespuesta = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

export function GameQuizModal({ question, tileTitle, tileKind, player, character, combo, onResolve, onClose }: Props) {
  const [currentLives, setCurrentLives] = useState<number>(player.lives ?? 3);
  const [hasShield, setHasShield] = useState<boolean>((player.shields ?? 0) > 0);
  const [abilityUsed, setAbilityUsed] = useState<boolean>(player.usedAbility ?? false);
  // Opciones que ya no se pueden elegir: falladas o quitadas por una habilidad.
  const [fuera, setFuera] = useState<string[]>([]);
  const [fallada, setFallada] = useState<string | null>(null);
  const [correcta, setCorrecta] = useState(false);
  const [orderDraft, setOrderDraft] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const shuffledOrder = useMemo(() => {
    if (question.type !== "order" || !question.orden) return [];
    return [...question.orden].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  // Se calcula una sola vez para que lo que se anuncia sea lo que se paga.
  const comboMultiplier = combo >= 2 ? (character.id === "gamer" ? 3 : 2) : 1;
  const monedas = (40 + (character.id === "aventurera" ? 30 : 0)) * comboMultiplier;

  // Turbo se usa en el tablero, antes de lanzar; aquí no haría nada.
  const habilidadDisponible = !abilityUsed && !correcta && character.id !== "gamer";
  const IconoHabilidad = iconoHabilidad[character.id];

  function handleUseAbility() {
    soundManager.init();
    soundManager.playAbility();
    setAbilityUsed(true);

    if (character.id === "cientifico") {
      const incorrectas = (question.opciones ?? []).filter(
        (o) => !mismaRespuesta(o, question.respuesta) && !fuera.includes(o),
      );
      if (incorrectas.length) {
        const quitada = incorrectas[Math.floor(Math.random() * incorrectas.length)];
        setFuera((prev) => [...prev, quitada]);
      }
      setAviso("Quitaste una opción");
    } else if (character.id === "aventurera") {
      setHasShield(true);
      setAviso("Escudo listo");
    } else if (character.id === "explorador") {
      setAviso(question.pista ?? "Confía en lo que sabes");
    }
  }

  function handleAnswer(choice: string) {
    if (correcta) return;
    soundManager.init();

    const isCorrect =
      question.type === "order" ? choice === (question.orden ?? []).join("|") : mismaRespuesta(choice, question.respuesta);

    if (isCorrect) {
      soundManager.playCorrect();
      soundManager.playCoin();
      setCorrecta(true);
      setFallada(null);
      setAviso(null);
      return;
    }

    setShake(true);
    setTimeout(() => setShake(false), 500);
    soundManager.playWrong();
    if (question.type === "order") setOrderDraft([]);
    else {
      setFallada(choice);
      setFuera((prev) => [...prev, choice]);
    }

    if (hasShield) {
      setHasShield(false);
      setAviso("El escudo te cuidó");
      return;
    }

    soundManager.playHeartLost();
    const nextLives = currentLives - 1;
    if (nextLives <= 0) {
      // Nadie se queda sin jugar: el corazón vuelve y la pregunta sigue abierta.
      setCurrentLives(1);
      soundManager.playHeartGain();
      setAviso("Te regalamos un corazón");
    } else {
      setCurrentLives(nextLives);
      setAviso(question.pista ?? "Casi. Prueba otra.");
    }
  }

  function handleFinish() {
    onResolve({
      correct: true,
      xp: question.xp,
      coins: monedas,
      lives: currentLives,
      combo: combo + 1,
      usedAbility: abilityUsed,
    });
  }

  function toggleOrderItem(item: string) {
    if (correcta) return;
    setOrderDraft((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  }

  const estadoDe = (opt: string) => {
    if (correcta && mismaRespuesta(opt, question.respuesta)) return "bien" as const;
    if (opt === fallada) return "mal" as const;
    if (fuera.includes(opt)) return "fuera" as const;
    return "normal" as const;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#17164F]/80 p-3 backdrop-blur-sm sm:p-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tileTitle}
        className={`flex max-h-[94dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-[#F7F4FF] p-4 shadow-2xl sm:p-6 ${
          shake ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1" role="img" aria-label={`${currentLives} corazones`}>
            {Array.from({ length: player.maxLives ?? 3 }).map((_, i) => (
              <HeartIcon
                key={i}
                weight="fill"
                className={`h-6 w-6 ${i < currentLives ? "text-[#FF8A73]" : "text-[#17164F]/15"}`}
                aria-hidden
              />
            ))}
            {hasShield ? <ShieldCheckIcon weight="fill" className="ml-1 h-6 w-6 text-[#C98F00]" aria-label="Escudo" /> : null}
          </div>

          {combo > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFC928] px-2.5 py-1 text-sm font-black text-[#17164F]">
              <FireIcon weight="fill" className="h-4 w-4 text-[#C98F00]" aria-hidden />x{combo + 1}
            </span>
          ) : null}

          {tileKind === "cooperacion" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E3F8EC] px-2.5 py-1 text-sm font-bold text-[#17164F]">
              <UsersIcon weight="fill" className="h-4 w-4 text-[#1B8A4F]" aria-hidden />
              En equipo
            </span>
          ) : null}

          <div className="ml-auto">
            <BotonSalir onClick={onClose} etiqueta="Saltar turno" />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <h2 className="min-w-0 flex-1 font-[family-name:var(--font-fredoka)] text-2xl font-bold leading-snug text-[#17164F] sm:text-3xl">
            {question.enunciado}
          </h2>
          <BotonVoz texto={[question.enunciado, ...(question.opciones ?? [])].join(". ")} />
        </div>

        <div className="mt-5 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-1">
          {question.type !== "order" &&
            (question.opciones ?? []).map((opt) => (
              <Opcion key={opt} estado={estadoDe(opt)} disabled={correcta || fuera.includes(opt)} onClick={() => handleAnswer(opt)}>
                {opt}
              </Opcion>
            ))}

          {question.type === "order" && (
            <>
              <ol
                aria-label="Tu orden"
                className="flex min-h-[64px] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-[#CFC4F5] p-2"
              >
                {orderDraft.map((item, i) => (
                  <li key={item}>
                    <button
                      type="button"
                      disabled={correcta}
                      onClick={() => toggleOrderItem(item)}
                      className="rounded-xl bg-[#5636D9] px-3 py-2 font-bold text-white"
                    >
                      {i + 1}. {item}
                    </button>
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
              {!correcta && orderDraft.length === (question.orden ?? []).length ? (
                <button
                  type="button"
                  onClick={() => handleAnswer(orderDraft.join("|"))}
                  aria-label="Comprobar"
                  className="btn-tactil tactil-magia w-full py-3.5 text-white"
                >
                  <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
                </button>
              ) : null}
            </>
          )}
        </div>

        <div className="mt-3 flex min-h-[60px] items-center gap-3">
          <p role="status" className="min-w-0 flex-1 text-base font-bold text-[#17164F]">
            {correcta ? (
              <span className="text-[#1B8A4F]">
                ¡Bien! +{question.xp} XP, +{monedas} monedas
              </span>
            ) : (
              aviso
            )}
          </p>

          {correcta ? (
            <button
              type="button"
              onClick={handleFinish}
              aria-label="Continuar"
              className="btn-tactil tactil-cooperar px-8 py-3 text-[#17164F]"
            >
              <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
            </button>
          ) : habilidadDisponible ? (
            <button
              type="button"
              onClick={handleUseAbility}
              aria-label={`Usar habilidad: ${character.activeName}. ${character.activeDesc}`}
              title={character.activeShort}
              className="btn-tactil tactil-juego gap-2 px-4 py-2.5 text-base text-[#17164F]"
            >
              <IconoHabilidad weight="fill" className="h-6 w-6" aria-hidden />
              {character.activeShort}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
