"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getGhostOpponent, reportDuelResult, validateDuelQuestion } from "@/lib/api/client";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";
import { useAgeTier } from "@/lib/age-tier";
import { JUEGO_ASSETS } from "./assets";
import { CHARACTER_PROFILES } from "./boardData";
import { soundManager } from "./soundEffects";
import type { CharacterClass } from "./gameTypes";

type DuelStep = "setup" | "battle" | "creator" | "result";

const RONDAS = 3;
const ACIERTOS_PARA_GANAR = 2;
// Lo mismo que suma POST /api/duel/result, para mostrarlo también sin sesión.
const PREMIO = { ganar: { xp: 100, coins: 30 }, participar: { xp: 40, coins: 10 } };
const XP_POR_PREGUNTA = 10;

type Resultado = { gano: boolean; aciertos: number; xp: number; coins: number; aviso: string };

const GHOST_OPPONENTS = [
  {
    id: "ghost-1",
    name: "Lucas (Fantasma)",
    school: "Colegio San Martín",
    avatarSrc: JUEGO_ASSETS.avatars[1].src,
    division: "ORO",
    rating: 770,
  },
  {
    id: "ghost-2",
    name: "Valentina (Fantasma)",
    school: "Estudiante en Casa (Independiente)",
    avatarSrc: JUEGO_ASSETS.avatars[0].src,
    division: "ORO",
    rating: 700,
  },
  {
    id: "ghost-3",
    name: "Mateo (Fantasma)",
    school: "Colegio San Martín",
    avatarSrc: JUEGO_ASSETS.avatars[3].src,
    division: "SUPERNOVA",
    rating: 910,
  },
];

const DUEL_QUESTIONS = [
  {
    id: "dq1",
    enunciado: "¿Cuál de las siguientes fracciones es equivalente a 2/4?",
    opciones: ["1/2", "3/4", "1/4", "2/3"],
    respuesta: "1/2",
    explicacion: "Al simplificar 2/4 dividiendo entre 2 obtenemos 1/2.",
  },
  {
    id: "dq2",
    enunciado: "¿Cuántos cuartos (1/4) forman una unidad completa?",
    opciones: ["2 cuartos", "3 cuartos", "4 cuartos", "8 cuartos"],
    respuesta: "4 cuartos",
    explicacion: "Cuatro partes de 1/4 equivalen a 4/4 = 1 unidad.",
  },
  {
    id: "dq3",
    enunciado: "Si un pastel se divide en 8 partes y tomamos 6, ¿cuál es la fracción?",
    opciones: ["6/8 (tres cuartos)", "2/8 (un cuarto)", "8/6", "4/8"],
    respuesta: "6/8 (tres cuartos)",
    explicacion: "El numerador indica las partes tomadas (6) y el denominador el total (8).",
  },
];

export function DueloExperience() {
  const [step, setStep] = useState<DuelStep>("setup");
  const usuario = useSessionUser();
  const [tier] = useAgeTier();
  const fantasma = useApi(() => getGhostOpponent(tier), [tier]);
  const fantasmas = useMemo(() => {
    if (fantasma.status !== "ok") return GHOST_OPPONENTS;
    const { alias, institutionName, score } = fantasma.data;
    const delServidor = {
      id: "ghost-red",
      name: `${alias} (Fantasma)`,
      school: institutionName,
      avatarSrc: JUEGO_ASSETS.avatars[2].src,
      division: "ORO",
      rating: score * 100,
    };
    return [delServidor, ...GHOST_OPPONENTS.filter((g) => !g.name.startsWith(alias))];
  }, [fantasma]);
  const [ghostId, setGhostId] = useState<string | null>(null);
  const selectedGhost = fantasmas.find((g) => g.id === ghostId) ?? fantasmas[0];
  const [myClass, setMyClass] = useState<CharacterClass>("cientifico");
  const [round, setRound] = useState(0);
  const [myLives, setMyLives] = useState(3);
  const [rivalLives, setRivalLives] = useState(3);
  const [score, setScore] = useState({ me: 0, rival: 0 });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] = useState({
    enunciado: "",
    respuesta: "",
    opcionFalsa: "",
  });
  const [aiValidating, setAiValidating] = useState(false);
  const [aiValidationResult, setAiValidationResult] = useState<{ ok: boolean; texto: string } | null>(null);
  const [preguntasCreadas, setPreguntasCreadas] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [bgmActive, setBgmActive] = useState(!soundManager.isBgmMuted());

  function handleToggleBgm() {
    const active = soundManager.toggleBGM();
    setBgmActive(active);
  }

  const myProfile = CHARACTER_PROFILES[myClass];
  const q = DUEL_QUESTIONS[round % DUEL_QUESTIONS.length];

  function startBattle() {
    soundManager.init();
    soundManager.playCorrect();
    setMyLives(3);
    setRivalLives(3);
    setScore({ me: 0, rival: 0 });
    setRound(0);
    setFeedback(null);
    setResultado(null);
    setStep("battle");
  }

  async function terminarDuelo(aciertos: number) {
    const gano = aciertos >= ACIERTOS_PARA_GANAR;
    const premio = gano ? PREMIO.ganar : PREMIO.participar;
    const xp = premio.xp + preguntasCreadas * XP_POR_PREGUNTA;
    setResultado({ gano, aciertos, xp, coins: premio.coins, aviso: "Guardando tus puntos…" });
    setStep("result");
    if (usuario?.role !== "STUDENT") {
      setResultado({ gano, aciertos, xp, coins: premio.coins, aviso: "Inicia sesión como estudiante para guardar tus puntos." });
      return;
    }
    const r = await reportDuelResult({ studentId: usuario.id, won: gano, questionsCreated: preguntasCreadas });
    if (r.ok) setPreguntasCreadas(0);
    setResultado({
      gano,
      aciertos,
      xp: r.ok ? r.data.xp : xp,
      coins: r.ok ? r.data.coins : premio.coins,
      aviso: r.ok ? "Tus puntos ya se guardaron." : "No se pudieron guardar tus puntos.",
    });
  }

  function siguienteRonda(aciertos: number) {
    if (round + 1 >= RONDAS) {
      void terminarDuelo(aciertos);
      return;
    }
    setRound((r) => r + 1);
    setFeedback(null);
  }

  function handleSelectAnswer(choice: string) {
    if (feedback !== null) return;
    soundManager.init();

    const isCorrect = choice.trim().toLowerCase() === q.respuesta.trim().toLowerCase();

    const aciertos = score.me + (isCorrect ? 1 : 0);
    if (isCorrect) {
      soundManager.playCorrect();
      soundManager.playCoin();
      setScore((s) => ({ ...s, me: s.me + 1 }));
      setRivalLives((v) => v - 1);
      setFeedback("¡Acierto! Le quitaste 1 vida a tu oponente.");
    } else {
      soundManager.playWrong();
      soundManager.playHeartLost();
      setScore((s) => ({ ...s, rival: s.rival + 1 }));
      setMyLives((v) => Math.max(1, v - 1)); // No punitivo
      setFeedback(`Casi. ${q.explicacion}`);
    }
    setTimeout(() => siguienteRonda(aciertos), 1800);
  }

  async function handleValidateQuestion() {
    if (!questionDraft.enunciado || !questionDraft.respuesta) return;
    setAiValidating(true);
    setAiValidationResult(null);
    const r = await validateDuelQuestion(questionDraft.enunciado, "Fracciones");
    setAiValidating(false);
    if (!r.ok) {
      setAiValidationResult({ ok: false, texto: "No se pudo revisar tu pregunta. Inténtalo otra vez." });
      return;
    }
    if (r.data.valid) {
      soundManager.playCorrect();
      setPreguntasCreadas((n) => n + 1);
      setQuestionDraft({ enunciado: "", respuesta: "", opcionFalsa: "" });
    } else {
      soundManager.playWrong();
    }
    setAiValidationResult({
      ok: r.data.valid,
      texto: r.data.valid ? `${r.data.reason} Ganarás +${XP_POR_PREGUNTA} XP en tu próximo duelo.` : r.data.reason,
    });
  }

  return (
    <div className="mx-auto max-w-3xl p-3 sm:p-6 text-[#17164F]">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#FFC928]/20 border border-[#FFC928]/50 px-2.5 py-0.5 text-[11px] font-black text-[#92400E]">
              Reto 14 & 20 • Arena Competitiva Sana
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl sm:text-3xl font-bold mt-1 text-[#17164F]">
            Duelo de Conocimiento 1v1
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleBgm}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black shadow transition-all ${
              bgmActive
                ? "bg-gradient-to-r from-[#FFC928] to-[#FF8A3D] text-[#17164F] animate-pulse"
                : "bg-white text-[#5B5678] border border-[#E8E0FF]"
            }`}
          >
            <span>{bgmActive ? "🎵" : "🔇"}</span>
            <span className="hidden sm:inline">{bgmActive ? "Música: ON" : "Música: OFF"}</span>
          </button>
          <Link
            href="/estudiante/juegos"
            className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#5636D9] shadow border border-[#E8E0FF] hover:bg-[#F2EEFF]"
          >
            🎲 Volver al Tablero
          </Link>
        </div>
      </header>

      {/* STEP: SETUP */}
      {step === "setup" && (
        <div className="space-y-4">
          {/* Character selection row */}
          <div className="rounded-3xl bg-white p-5 shadow-lg border border-[#E8E0FF]">
            <p className="text-xs font-bold text-[#5636D9] uppercase tracking-wider mb-2">
              Tu Personaje de Duelo
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CHARACTER_PROFILES) as CharacterClass[]).map((cls) => {
                const prof = CHARACTER_PROFILES[cls];
                const on = myClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      soundManager.playCoin();
                      setMyClass(cls);
                    }}
                    className={`flex flex-col items-center rounded-2xl p-2.5 transition-all ${
                      on
                        ? "bg-[#F2EEFF] ring-2 ring-[#5636D9] shadow-md scale-[1.02]"
                        : "bg-[#F7F4FF] hover:bg-[#EDE7FF]"
                    }`}
                  >
                    <Image
                      src={prof.avatarSrc}
                      alt={prof.name}
                      width={44}
                      height={44}
                      className="h-11 w-11 object-contain drop-shadow"
                    />
                    <span className="mt-1 text-xs font-bold text-[#17164F]">{prof.name.split(" ")[0]}</span>
                    <span className="text-[10px] text-[#5636D9]">{prof.archetype}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opponent Selection (Modo Fantasma Asíncrono) */}
          <div className="rounded-3xl bg-white p-5 shadow-lg border border-[#E8E0FF]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-[#5636D9] uppercase tracking-wider">
                Oponente Guardado en la Red (Modo Fantasma)
              </p>
              <span className="text-[10px] font-bold text-[#127A43] bg-[#D1FAE5] px-2 py-0.5 rounded-full">
                Sin esperar conexión
              </span>
            </div>
            <p className="text-xs text-[#5B5678] mb-3">
              Compite contra registros reales de otros colegios para sumar puntos en la Copa Intercolegial:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {fantasmas.map((g) => {
                const on = selectedGhost.id === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      soundManager.playStep();
                      setGhostId(g.id);
                    }}
                    className={`flex items-center gap-2.5 rounded-2xl p-3 text-left transition-all ${
                      on
                        ? "bg-[#FFF6D6] ring-2 ring-[#FFC928] shadow-md scale-[1.02]"
                        : "bg-[#F7F4FF] hover:bg-[#EDE7FF]"
                    }`}
                  >
                    <Image
                      src={g.avatarSrc}
                      alt={g.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-[#17164F]">{g.name}</p>
                      <p className="truncate text-[10px] text-[#5B5678]">{g.school}</p>
                      <span className="text-[9px] font-black text-[#92400E] bg-[#FEF3C7] px-1.5 py-0.2 rounded">
                        División {g.division}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={startBattle}
                className="flex-1 rounded-full bg-gradient-to-r from-[#FFC928] via-[#FF8A3D] to-[#E85D5D] py-3.5 text-sm font-black text-[#17164F] shadow-lg hover:brightness-110 active:scale-95"
              >
                ⚔️ ¡Comenzar Duelo! (3 Vidas)
              </button>
              <button
                type="button"
                onClick={() => setStep("creator")}
                className="rounded-full bg-[#F2EEFF] border border-[#5636D9]/30 px-4 py-3.5 text-xs font-bold text-[#5636D9] hover:bg-[#E8E0FF]"
                title="Crear pregunta con validador IA"
              >
                ✍️ Crear Pregunta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP: BATTLE (JUEGO CON VIDAS 1v1) */}
      {step === "battle" && (
        <div className="rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-[#E8E0FF]">
          {/* Battle Versus Banner */}
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#17164F] via-[#2E2870] to-[#17164F] p-4 text-white shadow-md">
            {/* Player */}
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0">
                <Image
                  src={myProfile.avatarSrc}
                  alt="Tú"
                  fill
                  className="rounded-full object-cover ring-2 ring-[#FFC928]"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-[#FFC928]">Tú ({myProfile.name.split(" ")[0]})</p>
                <div className="flex gap-0.5 text-xs">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={i < myLives ? "opacity-100" : "opacity-30 grayscale"}>
                      ❤️
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <span className="rounded-full bg-[#FFC928] px-3 py-1 font-black text-sm text-[#17164F] shadow animate-pulse">
              VS
            </span>

            {/* Opponent */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-xs font-bold text-[#25CFE0]">{selectedGhost.name}</p>
                <div className="flex gap-0.5 text-xs justify-end">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} className={i < rivalLives ? "opacity-100" : "opacity-30 grayscale"}>
                      ❤️
                    </span>
                  ))}
                </div>
              </div>
              <div className="relative h-12 w-12 shrink-0">
                <Image
                  src={selectedGhost.avatarSrc}
                  alt={selectedGhost.name}
                  fill
                  className="rounded-full object-cover ring-2 ring-[#25CFE0]"
                />
              </div>
            </div>
          </div>

          {/* Question Round Card */}
          <div className="mt-5 rounded-2xl bg-[#F7F4FF] p-4 sm:p-5 border border-[#E8E0FF]">
            <div className="flex items-center justify-between text-xs font-bold text-[#5636D9] mb-2">
              <span>Ronda {round + 1} de {RONDAS}</span>
              <span className="text-[#92400E]">Acierta {ACIERTOS_PARA_GANAR} para ganar</span>
            </div>
            <h2 className="font-[family-name:var(--font-fredoka)] text-base sm:text-xl font-bold text-[#17164F]">
              {q.enunciado}
            </h2>
          </div>

          {/* Options */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {q.opciones.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={feedback !== null}
                onClick={() => handleSelectAnswer(opt)}
                className="rounded-2xl border-2 border-[#E8E0FF] bg-white p-3.5 text-left text-sm font-bold text-[#17164F] hover:border-[#5636D9] hover:bg-[#F2EEFF] hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-70"
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div role="status" className="mt-4 rounded-2xl bg-[#D1FAE5] border border-[#2DBE70] p-3 text-sm font-bold text-[#065F46]">
              {feedback}
            </div>
          )}

          {/* Cosmo Bot Coach */}
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#FFF6E8] p-3 border border-[#FDE68A]">
            <Image
              src={JUEGO_ASSETS.robot}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 object-contain animate-bounce"
            />
            <p className="text-xs text-[#92400E]">
              <strong>Cosmo-Bot: </strong>¡Tu precisión en este duelo suma directamente a la <strong>Liga de Maestría</strong>!
            </p>
          </div>
        </div>
      )}

      {/* STEP: CREATOR MODE (Validador IA de Preguntas) */}
      {step === "creator" && (
        <div className="rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-[#E8E0FF]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-bold text-[#17164F]">
              Estudio de Creación de Preguntas con IA
            </h2>
            <button
              type="button"
              onClick={() => setStep("setup")}
              className="text-xs font-bold text-[#5636D9] hover:underline"
            >
              ← Volver al Duelo
            </button>
          </div>
          <p className="text-xs text-[#5B5678] mb-4">
            Inventa un reto para tus compañeros. La IA validará que tenga sustento pedagógico en el tema estudiado (HU-05).
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-[#5B5678]">Enunciado de la Pregunta</label>
              <input
                value={questionDraft.enunciado}
                onChange={(e) => setQuestionDraft({ ...questionDraft, enunciado: e.target.value })}
                placeholder="Ej. ¿Qué sucede si multiplicamos una fracción por 1?"
                className="mt-1 w-full rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] px-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#5636D9]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#127A43]">Respuesta Correcta</label>
              <input
                value={questionDraft.respuesta}
                onChange={(e) => setQuestionDraft({ ...questionDraft, respuesta: e.target.value })}
                placeholder="Ej. La fracción mantiene el mismo valor"
                className="mt-1 w-full rounded-2xl border border-[#A7F3D0] bg-[#F0FDF4] px-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#2DBE70]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#E85D5D]">Opción Trampa (Incorrecta)</label>
              <input
                value={questionDraft.opcionFalsa}
                onChange={(e) => setQuestionDraft({ ...questionDraft, opcionFalsa: e.target.value })}
                placeholder="Ej. El numerador se divide entre 2"
                className="mt-1 w-full rounded-2xl border border-[#FECDD3] bg-[#FFF1F2] px-3 py-2.5 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-[#E85D5D]"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={aiValidating || !questionDraft.enunciado || !questionDraft.respuesta}
            onClick={() => void handleValidateQuestion()}
            className="mt-5 w-full rounded-full bg-[#5636D9] py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-[#4323c4] disabled:opacity-50"
          >
            {aiValidating ? "Revisando tu pregunta…" : "Validar pregunta con IA"}
          </button>

          {aiValidationResult && (
            <div
              role="status"
              className={`mt-4 rounded-2xl border p-3 text-sm font-bold ${
                aiValidationResult.ok
                  ? "bg-[#D1FAE5] border-[#2DBE70] text-[#065F46]"
                  : "bg-[#FEF3C7] border-[#F59E0B] text-[#92400E]"
              }`}
            >
              {aiValidationResult.texto}
            </div>
          )}
        </div>
      )}

      {/* STEP: RESULT */}
      {step === "result" && resultado && (
        <div className="rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-[#E8E0FF]">
          <div className="text-5xl mb-2" aria-hidden>
            {resultado.gano ? "🏆" : "💪"}
          </div>
          <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F]">
            {resultado.gano ? "¡Ganaste el duelo!" : "¡Buen intento!"}
          </h2>
          <p className="mt-1 text-sm text-[#5B5678]">
            {resultado.gano
              ? `Demostraste lo que sabes frente a ${selectedGhost.name}.`
              : `${selectedGhost.name} ganó esta vez. Cada duelo te hace más fuerte: pide la revancha.`}
          </p>

          <div className="my-5 grid grid-cols-3 gap-2 rounded-2xl bg-[#F2EEFF] p-4 text-center">
            <div>
              <span className="block text-xl font-black text-[#5636D9]">+{resultado.xp}</span>
              <span className="text-[10px] text-[#5B5678] font-bold">XP de Maestría</span>
            </div>
            <div>
              <span className="block text-xl font-black text-[#92400E]">+{resultado.coins}</span>
              <span className="text-[10px] text-[#5B5678] font-bold">NovaCoins</span>
            </div>
            <div>
              <span className="block text-xl font-black text-[#127A43]">
                {resultado.aciertos}/{RONDAS}
              </span>
              <span className="text-[10px] text-[#5B5678] font-bold">Aciertos</span>
            </div>
          </div>
          <p className="mb-4 text-xs text-[#5B5678]">{resultado.aviso}</p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={startBattle}
              className="flex-1 rounded-full bg-[#5636D9] py-3 text-xs sm:text-sm font-bold text-white shadow hover:bg-[#4323c4]"
            >
              Jugar la Revancha
            </button>
            <Link
              href="/estudiante/ligas"
              className="flex-1 rounded-full bg-[#FFC928] py-3 text-xs sm:text-sm font-black text-[#17164F] shadow hover:brightness-110 flex items-center justify-center"
            >
              Ver mi Puesto en la Liga 🏅
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

