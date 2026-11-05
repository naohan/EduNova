"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { QuizQuestion } from "@/components/estudiante/shared/quizTypes";
import type { CharacterProfile, PlayerState } from "./gameTypes";
import { soundManager } from "./soundEffects";
import { JUEGO_ASSETS } from "./assets";
import {
  FireIcon,
  HeartIcon,
  LockIcon,
  SpeakerHighIcon,
  TrophyIcon,
} from "@/components/ui/icons";

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

export function GameQuizModal({
  question,
  tileTitle,
  tileKind,
  player,
  character,
  combo,
  onResolve,
  onClose,
}: Props) {
  const [currentLives, setCurrentLives] = useState<number>(player.lives ?? 3);
  const [hasShield, setHasShield] = useState<boolean>((player.shields ?? 0) > 0);
  const [abilityUsed, setAbilityUsed] = useState<boolean>(player.usedAbility ?? false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "revived" | null>(null);
  const [orderDraft, setOrderDraft] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [robotDialog, setRobotDialog] = useState<string>(
    tileKind === "cooperacion"
      ? "¡Esta es una casilla de cooperación! Consulten en equipo antes de responder."
      : tileKind === "desafio"
        ? "¡Un desafío épico! Tómate tu tiempo y analiza bien cada opción."
        : `¡Adelante, ${player.name}! Tienes el conocimiento necesario.`
  );
  const [ttsSpeaking, setTtsSpeaking] = useState(false);

  const shuffledOrder = useMemo(() => {
    if (question.type !== "order" || !question.orden) return [];
    return [...question.orden].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  function speakText(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      utterance.rate = 0.95;
      utterance.onstart = () => setTtsSpeaking(true);
      utterance.onend = () => setTtsSpeaking(false);
      utterance.onerror = () => setTtsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setTtsSpeaking(false);
    }
  }

  // Activar Habilidad del Personaje
  function handleUseAbility() {
    if (abilityUsed) return;
    soundManager.init();
    setAbilityUsed(true);
    soundManager.playAbility();

    if (character.id === "cientifico") {
      // Elimina una opción incorrecta
      if (question.opciones && question.opciones.length > 2) {
        const wrongOpts = question.opciones.filter(
          (o) => o.trim().toLowerCase() !== question.respuesta.trim().toLowerCase()
        );
        const toDisable = wrongOpts[Math.floor(Math.random() * wrongOpts.length)];
        setDisabledOptions((prev) => [...prev, toDisable]);
        setRobotDialog(`¡Hipótesis Cuántica activada! Se ha descartado la opción errónea: "${toDisable}".`);
      }
    } else if (character.id === "aventurera") {
      setHasShield(true);
      setRobotDialog("¡Escudo Guardián desplegado! El próximo error no te restará vidas.");
    } else if (character.id === "explorador") {
      if (question.pista) {
        setRobotDialog(`Brújula de la Suerte: ${question.pista}`);
      } else {
        setRobotDialog("Brújula de la Suerte: ¡Confía en tu primer instinto!");
      }
    } else if (character.id === "gamer") {
      setRobotDialog("Turbo Boost: ¡Si aciertas esta pregunta ganarás triple bono de NovaCoins!");
    }
  }

  function handleAnswer(choice: string) {
    if (feedback === "correct" || feedback === "revived") return;
    soundManager.init();

    const isCorrect =
      question.type === "order"
        ? choice === (question.orden ?? []).join("|")
        : choice.trim().toLowerCase() === question.respuesta.trim().toLowerCase();

    if (isCorrect) {
      soundManager.playCorrect();
      soundManager.playCoin();
      setFeedback("correct");

      const comboMultiplier = combo >= 2 ? (character.id === "gamer" ? 3 : 2) : 1;
      const baseCoins = 40 + (character.id === "aventurera" ? 30 : 0);
      const totalCoins = baseCoins * comboMultiplier;

      setRobotDialog(
        comboMultiplier > 1
          ? `¡Excelente! Combo x${comboMultiplier} activo. Ganaste +${question.xp} XP y +${totalCoins} NovaCoins.`
          : `¡Respuesta correcta! Buen razonamiento. +${question.xp} XP y +${totalCoins} NovaCoins.`
      );
    } else {
      // Manejo de fallo no punitivo con vidas
      setShake(true);
      setTimeout(() => setShake(false), 500);

      if (hasShield) {
        soundManager.playWrong();
        setHasShield(false);
        setFeedback("wrong");
        setRobotDialog("¡Tu escudo absorbió el impacto! No perdiste vidas. Revisa la pista y reintenta.");
      } else {
        const nextLives = currentLives - 1;
        soundManager.playWrong();
        soundManager.playHeartLost();

        if (nextLives <= 0) {
          // NO PUNITIVO: Rescate de Emergencia del Robot / Cooperación
          setCurrentLives(1);
          setFeedback("revived");
          soundManager.playHeartGain();
          setRobotDialog(
            "❤️ ¡RESCATE DE EMERGENCIA! El robot Cosmo te transfiere una batería de reserva. Recuerda: en la ciencia, equivocarse es el primer paso para descubrir la verdad. ¡Continúa!"
          );
        } else {
          setCurrentLives(nextLives);
          setFeedback("wrong");
          setRobotDialog(
            `¡Casi! Perdiste 1 vida (te quedan ${nextLives} ❤️). Pista: ${question.pista ?? question.explicacion ?? "Intenta leer detenidamente"}.`
          );
        }
      }
    }
  }

  function handleFinish() {
    const isSuccess = feedback === "correct";
    const comboMultiplier = isSuccess && combo >= 2 ? 2 : 1;
    const baseCoins = isSuccess ? 40 + (character.id === "aventurera" ? 30 : 0) : 10;
    const totalCoins = baseCoins * comboMultiplier;

    onResolve({
      correct: isSuccess,
      xp: isSuccess ? question.xp : 15, // Puntos de esfuerzo según el Plan Maestro
      coins: totalCoins,
      lives: currentLives,
      combo: isSuccess ? combo + 1 : 0,
      usedAbility: abilityUsed,
    });
  }

  function toggleOrderItem(item: string) {
    if (feedback === "correct") return;
    setOrderDraft((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#17164F]/75 p-3 sm:p-5 backdrop-blur-md">
      <div
        className={`relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl transition-transform ${
          shake ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
      >
        {/* Top Arena Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-[#17164F] to-[#2E2870] px-4 py-3 text-white sm:px-6">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl text-base shadow"
              style={{ backgroundColor: character.color }}
            >
              {character.activeIcon}
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#FFC928]">
                {tileKind === "desafio"
                  ? "Desafío Especial"
                  : tileKind === "cooperacion"
                    ? "Casilla Cooperativa"
                    : "Casilla de Sabiduría"}
              </p>
              <h3 className="font-[family-name:var(--font-fredoka)] text-sm sm:text-base font-bold">
                {tileTitle}
              </h3>
            </div>
          </div>

          {/* HUD: Hearts / Shield / Combo */}
          <div className="flex items-center gap-3">
            {/* Lives */}
            <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1">
              {Array.from({ length: player.maxLives ?? 3 }).map((_, i) => (
                <HeartIcon
                  key={i}
                  weight="fill"
                  className={`h-4 w-4 ${
                    i < currentLives ? "text-[#FF8A73]" : "text-white/20"
                  }`}
                  aria-hidden
                />
              ))}
              {hasShield && (
                <span title="Escudo activo" className="ml-1 inline-flex items-center">
                  <LockIcon weight="bold" className="h-4 w-4 text-[#FFC928]" aria-hidden />
                </span>
              )}
            </div>

            {/* Combo */}
            {combo > 0 && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#FFC928] px-2.5 py-0.5 text-xs font-black text-[#17164F]">
                <FireIcon weight="fill" className="h-3.5 w-3.5 text-[#C98F00]" aria-hidden />
                <span>x{combo + 1}</span>
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white hover:bg-white/30"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-6">
          {/* Question Enunciado */}
          <div className="rounded-2xl bg-[#F7F4FF] p-4 text-[#17164F] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5636D9] uppercase tracking-wide">
                Pregunta del Módulo
              </span>
              <button
                type="button"
                onClick={() => speakText(question.enunciado)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  ttsSpeaking
                    ? "bg-[#5636D9] text-white"
                    : "bg-white text-[#5636D9] hover:bg-[#E8E0FF]"
                }`}
                title="Escuchar pregunta en voz alta"
              >
                <SpeakerHighIcon weight="bold" className="h-3.5 w-3.5" aria-hidden />
                <span>{ttsSpeaking ? "Leyendo..." : "Escuchar"}</span>
              </button>
            </div>
            <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-base sm:text-xl font-bold leading-snug">
              {question.enunciado}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="mt-4 flex flex-1 flex-col gap-2.5">
            {(question.type === "multiple" ||
              question.type === "truefalse" ||
              question.type === "complete" ||
              question.type === "associate") &&
              (question.opciones ?? []).map((opt) => {
                const isItemDisabled = disabledOptions.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={feedback === "correct" || isItemDisabled}
                    onClick={() => handleAnswer(opt)}
                    className={`group relative flex items-center justify-between rounded-2xl border-2 p-3.5 text-left text-sm font-bold transition-all active:scale-[0.99] ${
                      isItemDisabled
                        ? "border-slate-200 bg-slate-100 text-slate-400 line-through cursor-not-allowed opacity-50"
                        : feedback === "correct" && opt.trim().toLowerCase() === question.respuesta.trim().toLowerCase()
                          ? "border-[#2DBE70] bg-[#D1FAE5] text-[#065F46] ring-2 ring-[#2DBE70]"
                          : "border-[#E8E0FF] bg-white text-[#17164F] hover:border-[#5636D9] hover:bg-[#F2EEFF] hover:shadow-md"
                    }`}
                  >
                    <span>{opt}</span>
                    <span className="text-xs text-[#5636D9] opacity-0 group-hover:opacity-100 transition-opacity">
                      Seleccionar →
                    </span>
                  </button>
                );
              })}

            {/* Ordering question type */}
            {question.type === "order" && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#5B5678]">
                  Toca las opciones en el orden correcto de izquierda a derecha:
                </p>
                <div className="flex flex-wrap gap-2">
                  {shuffledOrder.map((item) => (
                    <button
                      key={item}
                      type="button"
                      disabled={feedback === "correct"}
                      onClick={() => toggleOrderItem(item)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                        orderDraft.includes(item)
                          ? "bg-[#5636D9] text-white shadow-md scale-105"
                          : "bg-[#F2EEFF] text-[#17164F] hover:bg-[#E8E0FF]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-dashed border-[#5636D9] p-3 text-xs text-[#17164F]">
                  <strong>Tu orden: </strong>
                  {orderDraft.join(" → ") || "Aún no has seleccionado ningún elemento"}
                </div>
                <button
                  type="button"
                  disabled={feedback === "correct" || orderDraft.length === 0}
                  onClick={() => handleAnswer(orderDraft.join("|"))}
                  className="w-full rounded-full bg-[#5636D9] py-3 text-sm font-bold text-white shadow-md hover:bg-[#4323c4] disabled:opacity-50"
                >
                  Verificar Orden
                </button>
              </div>
            )}
          </div>

          {/* Character Skill Activation Bar */}
          {!abilityUsed && feedback !== "correct" && (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#FFC928]/40 bg-[#FFFBEB] p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{character.activeIcon}</span>
                <div>
                  <p className="text-xs font-bold text-[#92400E]">
                    Habilidad: {character.activeName}
                  </p>
                  <p className="text-[10px] text-[#B45309]">{character.activeDesc}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUseAbility}
                className="shrink-0 rounded-full bg-[#FF8A3D] px-3.5 py-1.5 text-xs font-black text-white shadow hover:brightness-110 active:scale-95"
              >
                Usar Habilidad
              </button>
            </div>
          )}

          {/* Mascot Robot Assistant Box */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] p-3">
            <div className="relative h-12 w-12 shrink-0">
              <Image
                src={JUEGO_ASSETS.robot}
                alt="Cosmo Bot"
                fill
                className="object-contain animate-bounce"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#5636D9] uppercase">
                  Cosmo-Bot (Guía IA)
                </span>
                {question.pista && feedback !== "correct" && (
                  <button
                    type="button"
                    onClick={() => setRobotDialog(`Pista clave: ${question.pista}`)}
                    className="text-[10px] font-bold text-[#5636D9] underline hover:text-[#4323c4]"
                  >
                    Pedir pista
                  </button>
                )}
              </div>
              <p className="text-xs text-[#17164F]">{robotDialog}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 bg-slate-50 p-4 sm:px-6">
          {feedback === "correct" ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1B8A4F]">
                <TrophyIcon weight="bold" className="h-5 w-5 text-[#1B8A4F]" aria-hidden />
                <span>¡Reto superado! +{question.xp} XP acumulados</span>
              </div>
              <button
                type="button"
                onClick={handleFinish}
                className="btn-tactil tactil-cooperar px-6 py-2.5 text-xs sm:text-sm font-black text-[#17164F]"
              >
                Continuar
              </button>
            </div>
          ) : feedback === "wrong" ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#B45309]">
                ¡No pasa nada! Corrige tu respuesta para avanzar.
              </span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="rounded-full bg-[#5636D9] px-5 py-2 text-xs font-bold text-white hover:bg-[#4323c4]"
              >
                Reintentar Ahora
              </button>
            </div>
          ) : feedback === "revived" ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#047857]">
                ❤️ Energía restaurada gracias a la ayuda no punitiva.
              </span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="rounded-full bg-[#17164F] px-5 py-2 text-xs font-bold text-[#FFC928]"
              >
                Volver a Intentar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-[#5B5678]">
              <span>Elige la opción que consideres correcta.</span>
              <button
                type="button"
                onClick={onClose}
                className="font-bold text-[#5636D9] hover:underline"
              >
                Omitir turno (sin penalización)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

