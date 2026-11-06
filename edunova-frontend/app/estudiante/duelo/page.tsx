"use client";

import { useState, useEffect, useRef, type ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { NombreAlumno } from "@/components/estudiante/NombreAlumno";
import { BotonSalir, BotonVoz, Opcion, PuntosAvance } from "@/components/estudiante/shared/kit";
import { JUEGO_ASSETS } from "@/components/estudiante/juego/assets";
import { validateDuelQuestion, getDuelOpponentQuestions, reportDuelResult } from "@/lib/api/client";
import { useSessionUser } from "@/lib/api/use-session";
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BankIcon,
  BookOpenIcon,
  CalculatorIcon,
  CheckIcon,
  DiamondIcon,
  FlaskIcon,
  HandHeartIcon,
  LightningIcon,
  PencilLineIcon,
  SwordIcon,
  TimerIcon,
  TranslateIcon,
  TrophyIcon,
  XIcon,
} from "@/components/ui/icons";

type DuelPhase =
  | "intro"
  | "setup"
  | "challenge_pending"
  | "question_creation"
  | "sync_waiting"
  | "duel_battle"
  | "duel_results";

interface QuestionDraft {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
  isVerified: boolean;
}

interface BattleQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  correctAnswer: string;
  explanation: string;
}

interface CourseItem {
  id: string;
  name: string;
  corto: string;
  icon: ComponentType<{ className?: string; weight?: "duotone"; "aria-hidden"?: boolean }>;
  suggestedTopics: string[];
}

const COURSES: CourseItem[] = [
  {
    id: "matematica",
    name: "Matemática",
    corto: "Matemática",
    icon: CalculatorIcon,
    suggestedTopics: ["Ecuaciones", "Fracciones", "Multiplicación", "Áreas y Perímetros"],
  },
  {
    id: "ciencia",
    name: "Ciencia y Tecnología",
    corto: "Ciencia",
    icon: FlaskIcon,
    suggestedTopics: ["El Sistema Solar", "La Célula", "Animales Vertebrados", "Fotosíntesis"],
  },
  {
    id: "comunicacion",
    name: "Comunicación",
    corto: "Comunicación",
    icon: BookOpenIcon,
    suggestedTopics: ["Sujeto y Predicado", "Reglas de Tildación", "Sinónimos y Antónimos", "Comprensión Lectora"],
  },
  {
    id: "historia",
    name: "Ciencias Sociales",
    corto: "Sociales",
    icon: BankIcon,
    suggestedTopics: ["Imperio Incaico", "Culturas Preincas", "Independencia del Perú", "Geografía del Perú"],
  },
  {
    id: "personal",
    name: "Desarrollo Personal",
    corto: "Personal",
    icon: HandHeartIcon,
    suggestedTopics: ["Emociones", "Convivencia Escolar", "Hábitos Saludables", "Trabajo en Equipo"],
  },
  {
    id: "ingles",
    name: "Inglés",
    corto: "Inglés",
    icon: TranslateIcon,
    suggestedTopics: ["Verbos Irregulares", "Vocabulario de Casa", "Presente Simple", "Animales en Inglés"],
  },
];

const [AVATAR_YO, AVATAR_RIVAL_1, AVATAR_RIVAL_2, AVATAR_RIVAL_3] = JUEGO_ASSETS.avatars.map((a) => a.src);

const SUGGESTED_RIVALS = [
  { name: "Mateo_Pro", avatar: AVATAR_RIVAL_1 },
  { name: "Camila_G", avatar: AVATAR_RIVAL_2 },
  { name: "Luna_23", avatar: AVATAR_YO },
  { name: "Sofia_Nova", avatar: AVATAR_RIVAL_3 },
];

const COMO_SE_JUEGA =
  "Tú creas preguntas para tu compañero. Él crea preguntas para ti. Responden y gana quien acierte más.";
const COMO_SE_ESCRIBE =
  "Escribe tu pregunta arriba. En la línea con el visto verde va la respuesta correcta. En las líneas con la equis van las respuestas falsas.";

const campoCls =
  "w-full rounded-2xl border-2 border-[#E8E0FF] bg-white px-4 py-3.5 text-lg font-semibold text-[#17164F] outline-none transition-colors placeholder:font-normal placeholder:text-[#17164F]/55 focus:border-[#5636D9]";
const chipCls = (on: boolean) =>
  `rounded-xl px-3 py-2 text-sm font-bold transition-colors ${on ? "bg-[#5636D9] text-white" : "bg-white text-[#17164F]"}`;

type Premio = { xp: number; coins: number; estado: "guardando" | "guardado" | "sin-guardar" | "sin-sesion" };

// Los mismos valores de POST /api/duel/result: se muestran al instante y luego se confirman con lo que guardó el servidor.
const premioDelDuelo = (gano: boolean, preguntasCreadas: number) => ({
  xp: (gano ? 100 : 40) + preguntasCreadas * 10,
  coins: gano ? 30 : 10,
});

function formatAnswerText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .replace(/([a-zA-Z0-9])\s*=\s*/g, "$1 = ");
}

function Avatar({ src, grande = false }: { src: string; grande?: boolean }) {
  return (
    <Image
      src={src}
      alt=""
      width={112}
      height={112}
      className={`rounded-full bg-white object-cover ${grande ? "h-24 w-24 sm:h-28 sm:w-28" : "h-12 w-12"}`}
    />
  );
}

export default function DueloPage() {
  const [phase, setPhase] = useState<DuelPhase>("intro");
  // Preparar el duelo son tres decisiones, una por pantalla: curso, tema y rival.
  const [pasoSetup, setPasoSetup] = useState(0);

  const [selectedCourse, setSelectedCourse] = useState<CourseItem>(COURSES[0]);
  const [topic, setTopic] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [alternativesCount, setAlternativesCount] = useState(4); // min 3, max 6
  const [hasTimeLimit, setHasTimeLimit] = useState(true);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(45);
  const [opponentName, setOpponentName] = useState("");
  const [opponentAvatar, setOpponentAvatar] = useState<string>(AVATAR_RIVAL_1);

  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string } | null>(null);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [syncCountdown, setSyncCountdown] = useState(3);

  const [battleQuestions, setBattleQuestions] = useState<BattleQuestion[]>([]);
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [opponentBattleScore, setOpponentBattleScore] = useState(0);

  const usuario = useSessionUser();
  const [premio, setPremio] = useState<Premio | null>(null);
  // Un duelo paga una sola vez, aunque la última respuesta y el reloj lleguen juntos.
  const premioEnviado = useRef(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startQuestionCreation = () => {
    const wrongCount = Math.max(2, Math.min(5, alternativesCount - 1));
    const drafts: QuestionDraft[] = Array.from({ length: totalQuestions }).map(() => ({
      question: "",
      correctAnswer: "",
      wrongAnswers: Array.from({ length: wrongCount }).map(() => ""),
      isVerified: false,
    }));
    setQuestions(drafts);
    setCurrentQIndex(0);
    setPhase("challenge_pending");
  };

  const volverAlInicio = () => {
    setPasoSetup(0);
    setPhase("intro");
  };

  // Simulate opponent accepting the challenge
  useEffect(() => {
    if (phase === "challenge_pending") {
      const timer = setTimeout(() => {
        setPhase("question_creation");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Sync countdown before battle
  useEffect(() => {
    if (phase === "sync_waiting") {
      const interval = setInterval(() => {
        setSyncCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const currentQ = questions[currentQIndex] || {
    question: "",
    correctAnswer: "",
    wrongAnswers: Array.from({ length: alternativesCount - 1 }).map(() => ""),
    isVerified: false,
  };

  const updateCurrentQuestion = (updates: Partial<QuestionDraft>) => {
    setVerificationError(null);
    setQuestions((prev) => {
      const next = [...prev];
      next[currentQIndex] = {
        ...next[currentQIndex],
        ...updates,
        isVerified: updates.isVerified !== undefined ? updates.isVerified : false,
      };
      return next;
    });
  };

  const updateWrongAnswer = (idx: number, value: string) => {
    const updated = [...(currentQ.wrongAnswers || [])];
    updated[idx] = value;
    updateCurrentQuestion({ wrongAnswers: updated });
  };

  const handleVerify = async () => {
    const targetWrongCount = alternativesCount - 1;
    const filledWrong = (currentQ.wrongAnswers || []).filter((w) => w.trim().length > 0);
    if (!currentQ.question.trim() || !currentQ.correctAnswer.trim() || filledWrong.length < targetWrongCount) {
      setVerificationError("Completa todas las líneas.");
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const res = await validateDuelQuestion(currentQ.question.trim(), topic.trim() || selectedCourse.name);

      if (!res.ok) {
        setVerificationError("No se pudo revisar. Prueba otra vez.");
        return;
      }

      const { valid, reason } = res.data;

      if (!valid) {
        setVerificationError(reason);
      } else {
        const finalWrong = filledWrong.slice(0, targetWrongCount).map(formatAnswerText);
        const finalCorrect = formatAnswerText(currentQ.correctAnswer);
        setQuestions((prev) => {
          const next = [...prev];
          next[currentQIndex] = {
            ...next[currentQIndex],
            correctAnswer: finalCorrect,
            wrongAnswers: finalWrong,
            isVerified: true,
          };
          return next;
        });
      }
    } catch (err) {
      console.error(err);
      setVerificationError("No se pudo revisar. Prueba otra vez.");
    } finally {
      setIsVerifying(false);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
      setVerificationError(null);
    }
  };

  const goToNextQuestion = async () => {
    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setVerificationError(null);
    } else {
      await submitDuelAndPrepareBattle();
    }
  };

  // Submit duel and fetch opponent's questions from secure backend API
  const submitDuelAndPrepareBattle = async () => {
    setBattleQuestions([]);
    setPhase("sync_waiting");

    try {
      const res = await getDuelOpponentQuestions({
        course: selectedCourse.name,
        topic: topic.trim() || selectedCourse.name,
        count: totalQuestions,
        alternativesCount,
      });

      if (res.ok && Array.isArray(res.data.questions) && res.data.questions.length > 0) {
        setBattleQuestions(res.data.questions as BattleQuestion[]);
      } else {
        throw new Error("No questions returned");
      }
    } catch {
      const fallbackList: BattleQuestion[] = Array.from({ length: totalQuestions }).map((_, i) => ({
        question: `Pregunta #${i + 1} de ${opponentName || "Compañero"}: ¿Cuál es la idea principal en ${topic || selectedCourse.name}?`,
        options: [
          `Identificar los datos y aplicar la regla correspondiente`,
          `Calcular sin revisar las condiciones iniciales`,
          `Descartar todos los datos negativos de inmediato`,
          `Aproximar únicamente mediante estimación gráfica`,
          `Ignorar el enunciado y elegir al azar`,
          `Esperar a que termine el tiempo de respuesta`,
        ].slice(0, alternativesCount),
        correctIndex: 0,
        correctAnswer: `Identificar los datos y aplicar la regla correspondiente`,
        explanation: `Permite resolver el desafío con pasos claros y seguros.`,
      }));
      setBattleQuestions(fallbackList);
    }

    const simulatedScore = Math.max(1, Math.min(totalQuestions, totalQuestions - Math.floor(Math.random() * 2)));
    setOpponentBattleScore(simulatedScore);
  };

  const startBattle = () => {
    setCurrentBattleIndex(0);
    setUserAnswers([]);
    setPremio(null);
    premioEnviado.current = false;
    setPhase("duel_battle");
  };

  // Calculate final score
  const calculateScore = (respuestas: number[] = userAnswers) => {
    return respuestas.reduce((score, ans, idx) => {
      if (battleQuestions[idx] && ans === battleQuestions[idx].correctIndex) {
        return score + 1;
      }
      return score;
    }, 0);
  };

  const guardarPremio = async (respuestas: number[]) => {
    if (premioEnviado.current) return;
    premioEnviado.current = true;

    const gano = calculateScore(respuestas) > opponentBattleScore;
    const calculado = premioDelDuelo(gano, totalQuestions);
    if (usuario?.role !== "STUDENT") {
      setPremio({ ...calculado, estado: "sin-sesion" });
      return;
    }

    setPremio({ ...calculado, estado: "guardando" });
    const r = await reportDuelResult({ studentId: usuario.id, won: gano, questionsCreated: totalQuestions });
    setPremio(
      r.ok ? { xp: r.data.xp, coins: r.data.coins, estado: "guardado" } : { ...calculado, estado: "sin-guardar" },
    );
  };

  // Tocar una opción ya es responder. Con -1 se agotó el tiempo.
  const handleAnswerConfirm = (answeredIdx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const updatedAnswers = [...userAnswers, answeredIdx];
    setUserAnswers(updatedAnswers);

    if (currentBattleIndex < battleQuestions.length - 1) {
      setCurrentBattleIndex(currentBattleIndex + 1);
    } else {
      setPhase("duel_results");
      void guardarPremio(updatedAnswers);
    }
  };

  // Battle countdown timer
  useEffect(() => {
    if (phase === "duel_battle" && hasTimeLimit) {
      const resetId = setTimeout(() => setTimeLeft(secondsPerQuestion), 0);
      if (timerRef.current) clearInterval(timerRef.current);

      // Se cuenta fuera de setTimeLeft: React puede repetir esa función y aquí se responde y se paga.
      let restante = secondsPerQuestion;
      timerRef.current = setInterval(() => {
        restante -= 1;
        setTimeLeft(Math.max(0, restante));
        if (restante <= 0) handleAnswerConfirm(-1);
      }, 1000);

      return () => {
        clearTimeout(resetId);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentBattleIndex, hasTimeLimit, secondsPerQuestion]);

  // Handle mock file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setAttachedFile({
        name: file.name,
        size: `${sizeMb} MB`,
        type: file.type || "Documento",
      });
    }
  };

  if (phase === "intro") {
    return (
      <EstudianteLayout>
        <div className="mx-auto max-w-xl p-4 sm:p-6 lg:p-8">
          <header className="flex items-center justify-between gap-3">
            <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">Duelo</h1>
            <BotonVoz texto={COMO_SE_JUEGA} etiqueta="Cómo se juega" />
          </header>

          <div className="mt-6 flex items-center justify-center gap-6 rounded-3xl bg-[#FFF6D6] px-6 py-8">
            <div className="text-center">
              <Avatar src={AVATAR_YO} grande />
              <p className="mt-2 truncate font-bold text-[#17164F]">
                <NombreAlumno />
              </p>
            </div>
            <SwordIcon weight="fill" className="h-12 w-12 shrink-0 text-[#C98F00]" aria-label="contra" />
            <div className="text-center">
              <Avatar src={AVATAR_RIVAL_1} grande />
              <p className="mt-2 font-bold text-[#17164F]">Rival</p>
            </div>
          </div>

          <ol className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              { icono: PencilLineIcon, texto: "Crea" },
              { icono: SwordIcon, texto: "Responde" },
              { icono: TrophyIcon, texto: "Gana" },
            ].map(({ icono: Icono, texto }) => (
              <li key={texto} className="flex flex-col items-center gap-1 font-bold text-[#17164F]">
                <Icono weight="duotone" className="h-9 w-9 text-[#C98F00]" aria-hidden />
                {texto}
              </li>
            ))}
          </ol>

          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="btn-tactil tactil-juego mt-6 w-full py-4 text-xl text-[#17164F]"
          >
            ¡Retar!
          </button>
        </div>
      </EstudianteLayout>
    );
  }

  const barra = (actual: number, total: number, onSalir: () => void) => (
    <div className="flex items-center gap-3">
      <PuntosAvance actual={actual} total={total} />
      <BotonSalir onClick={onSalir} etiqueta="Salir del duelo" />
    </div>
  );

  return (
    <EstudianteLayout foco>
      <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col p-4 sm:p-6">
        {phase === "setup" && (
          <>
            {barra(pasoSetup, 3, volverAlInicio)}

            {pasoSetup === 0 && (
              <>
                <h2 className="mb-5 mt-6 font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">
                  ¿Qué curso?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {COURSES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      aria-label={c.name}
                      onClick={() => {
                        setSelectedCourse(c);
                        setTopic("");
                        setPasoSetup(1);
                      }}
                      className="card-tactil tactil-juego-suave min-h-[128px] flex-col items-center justify-center gap-2 p-3 text-center"
                    >
                      <c.icon weight="duotone" className="h-12 w-12 text-[#C98F00]" aria-hidden />
                      <span className="font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">{c.corto}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {pasoSetup === 1 && (
              <>
                <h2 className="mb-5 mt-6 font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">
                  ¿Qué tema?
                </h2>
                <div className="grid gap-3">
                  {selectedCourse.suggestedTopics.map((sug) => (
                    <Opcion
                      key={sug}
                      onClick={() => {
                        setTopic(sug);
                        setPasoSetup(2);
                      }}
                    >
                      {sug}
                    </Opcion>
                  ))}
                </div>
                <label htmlFor="tema-duelo" className="mt-5 block font-bold text-[#17164F]">
                  Otro tema
                </label>
                <input
                  id="tema-duelo"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={`${campoCls} mt-1`}
                />
                <p className="mt-1 text-sm font-semibold text-[#17164F]/75">Solo el tema, sin nombres.</p>
                <div className="mt-auto flex gap-3 pt-5">
                  <button
                    type="button"
                    onClick={() => setPasoSetup(0)}
                    aria-label="Atrás"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#17164F]"
                  >
                    <ArrowLeftIcon weight="bold" className="h-6 w-6" aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={!topic.trim()}
                    onClick={() => setPasoSetup(2)}
                    aria-label="Siguiente"
                    className="btn-tactil tactil-juego flex-1 py-3 text-[#17164F]"
                  >
                    <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
                  </button>
                </div>
              </>
            )}

            {pasoSetup === 2 && (
              <>
                <h2 className="mb-5 mt-6 font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">
                  ¿A quién retas?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {SUGGESTED_RIVALS.map((r) => {
                    const on = opponentName === r.name;
                    return (
                      <button
                        key={r.name}
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setOpponentName(r.name);
                          setOpponentAvatar(r.avatar);
                        }}
                        className={`flex flex-col items-center gap-2 rounded-2xl bg-white p-4 transition-shadow ${
                          on ? "ring-4 ring-[#FFC928]" : "ring-1 ring-[#E8E0FF]"
                        }`}
                      >
                        <Avatar src={r.avatar} />
                        <span className="max-w-full truncate font-bold text-[#17164F]">{r.name}</span>
                      </button>
                    );
                  })}
                </div>

                <details className="mt-4 rounded-2xl bg-[#F2EEFF] p-4">
                  <summary className="cursor-pointer font-bold text-[#17164F]">Más opciones</summary>

                  <label htmlFor="rival-duelo" className="mt-4 block text-sm font-bold text-[#17164F]">
                    Otro compañero
                  </label>
                  <input
                    id="rival-duelo"
                    type="text"
                    value={opponentName}
                    onChange={(e) => setOpponentName(e.target.value)}
                    className={`${campoCls} mt-1`}
                  />

                  <p className="mt-4 text-sm font-bold text-[#17164F]">Preguntas</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {[3, 5, 8, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        aria-pressed={totalQuestions === num}
                        onClick={() => setTotalQuestions(num)}
                        className={chipCls(totalQuestions === num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <p className="mt-4 text-sm font-bold text-[#17164F]">Opciones por pregunta</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {[3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        aria-pressed={alternativesCount === num}
                        onClick={() => setAlternativesCount(num)}
                        className={chipCls(alternativesCount === num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <p className="mt-4 text-sm font-bold text-[#17164F]">Segundos por pregunta</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      aria-pressed={!hasTimeLimit}
                      onClick={() => setHasTimeLimit(false)}
                      className={chipCls(!hasTimeLimit)}
                    >
                      Sin reloj
                    </button>
                    {[30, 45, 60, 90, 120].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        aria-pressed={hasTimeLimit && secondsPerQuestion === sec}
                        onClick={() => {
                          setHasTimeLimit(true);
                          setSecondsPerQuestion(sec);
                        }}
                        className={chipCls(hasTimeLimit && secondsPerQuestion === sec)}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>

                  <p className="mt-4 text-sm font-bold text-[#17164F]">Tus apuntes</p>
                  {attachedFile ? (
                    <div className="mt-1 flex items-center justify-between gap-2 rounded-xl bg-white p-2 text-sm font-semibold text-[#17164F]">
                      <span className="min-w-0 truncate">{attachedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        aria-label="Quitar archivo"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFEDE8] text-[#D9583F]"
                      >
                        <XIcon weight="bold" className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleFileUpload}
                      className="mt-1 w-full text-sm font-semibold text-[#17164F]"
                    />
                  )}
                </details>

                <div className="mt-auto flex gap-3 pt-5">
                  <button
                    type="button"
                    onClick={() => setPasoSetup(1)}
                    aria-label="Atrás"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#17164F]"
                  >
                    <ArrowLeftIcon weight="bold" className="h-6 w-6" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={startQuestionCreation}
                    disabled={!opponentName.trim()}
                    className="btn-tactil tactil-juego flex-1 py-3 text-lg text-[#17164F]"
                  >
                    ¡Retar!
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {phase === "challenge_pending" && (
          <>
            <div className="flex justify-end">
              <BotonSalir onClick={() => setPhase("setup")} etiqueta="Cancelar reto" />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center text-center" role="status">
              <span className="relative inline-flex">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#FFC928] opacity-40 motion-reduce:animate-none" aria-hidden />
                <span className="relative">
                  <Avatar src={opponentAvatar} grande />
                </span>
              </span>
              <p className="mt-5 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F]">
                Esperando a {opponentName}
              </p>
            </div>
          </>
        )}

        {phase === "question_creation" && (
          <>
            <div className="flex items-center gap-3">
              <PuntosAvance
                actual={questions.filter((q) => q.isVerified).length}
                total={totalQuestions}
                etiqueta="Preguntas listas"
              />
              <BotonVoz texto={COMO_SE_ESCRIBE} etiqueta="Cómo se escribe" />
              <BotonSalir onClick={() => setPhase("setup")} etiqueta="Cancelar duelo" />
            </div>

            <div className="mt-5 space-y-3">
              <label htmlFor="pregunta-duelo" className="sr-only">
                Tu pregunta {currentQIndex + 1}
              </label>
              <textarea
                id="pregunta-duelo"
                rows={3}
                value={currentQ.question}
                onChange={(e) => updateCurrentQuestion({ question: e.target.value })}
                placeholder="Tu pregunta"
                className={campoCls}
              />

              <div className="flex items-center gap-2">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2DBE70] text-[#17164F]">
                  <CheckIcon weight="bold" className="h-6 w-6" aria-hidden />
                </span>
                <label htmlFor="correcta-duelo" className="sr-only">
                  Respuesta correcta
                </label>
                <input
                  id="correcta-duelo"
                  type="text"
                  value={currentQ.correctAnswer}
                  onChange={(e) => updateCurrentQuestion({ correctAnswer: e.target.value })}
                  placeholder="Correcta"
                  className={campoCls}
                />
              </div>

              {Array.from({ length: alternativesCount - 1 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFEDE8] text-[#D9583F]">
                    <XIcon weight="bold" className="h-6 w-6" aria-hidden />
                  </span>
                  <label htmlFor={`falsa-duelo-${idx}`} className="sr-only">
                    Respuesta falsa {idx + 1}
                  </label>
                  <input
                    id={`falsa-duelo-${idx}`}
                    type="text"
                    value={currentQ.wrongAnswers[idx] || ""}
                    onChange={(e) => updateWrongAnswer(idx, e.target.value)}
                    placeholder="Falsa"
                    className={campoCls}
                  />
                </div>
              ))}
            </div>

            <p role="status" className="mt-3 min-h-[28px] text-base font-bold text-[#17164F]">
              {isVerifying ? (
                "Revisando..."
              ) : verificationError ? (
                <span className="text-[#D9583F]">{verificationError}</span>
              ) : currentQ.isVerified ? (
                <span className="text-[#1B8A4F]">¡Buena pregunta!</span>
              ) : null}
            </p>

            <div className="mt-auto flex gap-3 pt-3">
              {currentQIndex > 0 ? (
                <button
                  type="button"
                  onClick={goToPreviousQuestion}
                  aria-label="Pregunta anterior"
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#17164F]"
                >
                  <ArrowLeftIcon weight="bold" className="h-6 w-6" aria-hidden />
                </button>
              ) : null}
              {currentQ.isVerified ? (
                <button
                  type="button"
                  onClick={goToNextQuestion}
                  aria-label={currentQIndex === totalQuestions - 1 ? "Enviar duelo" : "Siguiente pregunta"}
                  className="btn-tactil tactil-cooperar flex-1 py-3 text-[#17164F]"
                >
                  <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="btn-tactil tactil-juego flex-1 py-3 text-lg text-[#17164F]"
                >
                  Revisar
                </button>
              )}
            </div>
          </>
        )}

        {phase === "sync_waiting" && (
          <>
            <div className="flex justify-end">
              <BotonSalir onClick={() => setPhase("setup")} etiqueta="Cancelar duelo" />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex items-center gap-4">
                <Avatar src={AVATAR_YO} grande />
                <SwordIcon weight="fill" className="h-10 w-10 text-[#C98F00]" aria-label="contra" />
                <Avatar src={opponentAvatar} grande />
              </div>
              <button
                type="button"
                onClick={startBattle}
                disabled={syncCountdown > 0 || battleQuestions.length === 0}
                className="btn-tactil tactil-juego mt-8 w-full max-w-xs py-4 text-xl text-[#17164F]"
              >
                {syncCountdown > 0 ? syncCountdown : battleQuestions.length === 0 ? "..." : "¡Jugar!"}
              </button>
            </div>
          </>
        )}

        {phase === "duel_battle" && battleQuestions.length > 0 && (
          <>
            <div className="flex items-center gap-3">
              <PuntosAvance actual={currentBattleIndex} total={battleQuestions.length} etiqueta="Preguntas" />
              {hasTimeLimit ? (
                <span
                  role="timer"
                  aria-label={`${timeLeft} segundos`}
                  className={`inline-flex h-12 items-center gap-1.5 rounded-2xl px-3 text-lg font-black text-[#17164F] ${
                    timeLeft <= 10 ? "bg-[#FF8A73]" : "bg-[#FFF6D6]"
                  }`}
                >
                  <TimerIcon weight="fill" className="h-6 w-6" aria-hidden />
                  {timeLeft}
                </span>
              ) : null}
              <BotonSalir onClick={volverAlInicio} etiqueta="Salir del duelo" />
            </div>

            <div className="mt-6 flex items-start gap-3">
              <h2 className="min-w-0 flex-1 font-[family-name:var(--font-fredoka)] text-2xl font-bold leading-snug text-[#17164F] sm:text-3xl">
                {battleQuestions[currentBattleIndex].question}
              </h2>
              <BotonVoz
                key={currentBattleIndex}
                texto={[
                  battleQuestions[currentBattleIndex].question,
                  ...battleQuestions[currentBattleIndex].options,
                ].join(". ")}
              />
            </div>

            <div className="mt-6 grid gap-3">
              {battleQuestions[currentBattleIndex].options.map((opt, optIdx) => (
                <Opcion key={`${currentBattleIndex}-${optIdx}`} onClick={() => handleAnswerConfirm(optIdx)}>
                  {opt}
                </Opcion>
              ))}
            </div>
          </>
        )}

        {phase === "duel_results" &&
          (() => {
            const myScore = calculateScore();
            const rivalScore = opponentBattleScore;
            const isWin = myScore > rivalScore;
            const isTie = myScore === rivalScore;

            return (
              <>
                <div className="flex justify-end">
                  <BotonSalir href="/estudiante/jugar" etiqueta="Volver a juegos" />
                </div>

                <div className="text-center">
                  <h2 className="font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">
                    {isWin ? "¡Ganaste!" : isTie ? "¡Empate!" : "¡Buen duelo!"}
                  </h2>

                  <div className="mt-6 flex items-center justify-center gap-8">
                    <div>
                      <Avatar src={AVATAR_YO} grande />
                      <p className="mt-2 text-4xl font-black text-[#17164F]">{myScore}</p>
                    </div>
                    <SwordIcon weight="fill" className="h-10 w-10 text-[#C98F00]" aria-label="contra" />
                    <div>
                      <Avatar src={opponentAvatar} grande />
                      <p className="mt-2 text-4xl font-black text-[#17164F]">{rivalScore}</p>
                    </div>
                  </div>

                  <div role="status" className="mt-6 min-h-8">
                    {premio?.estado === "guardando" || premio?.estado === "guardado" ? (
                      <p className="flex items-center justify-center gap-5 text-xl font-black text-[#17164F]">
                        <span className="inline-flex items-center gap-1.5" aria-label={`${premio.xp} puntos`}>
                          <LightningIcon weight="fill" className="h-6 w-6 text-[#1B8A4F]" aria-hidden />+{premio.xp}
                        </span>
                        <span className="inline-flex items-center gap-1.5" aria-label={`${premio.coins} monedas`}>
                          <DiamondIcon weight="fill" className="h-6 w-6 text-[#C98F00]" aria-hidden />+{premio.coins}
                        </span>
                      </p>
                    ) : premio?.estado === "sin-guardar" ? (
                      <p className="font-bold text-[#17164F]">No se guardaron tus puntos.</p>
                    ) : premio?.estado === "sin-sesion" ? (
                      <p className="font-bold text-[#17164F]">Entra como estudiante para guardar puntos.</p>
                    ) : null}
                  </div>
                </div>

                <details className="mt-6 rounded-2xl bg-white p-4">
                  <summary className="cursor-pointer font-bold text-[#17164F]">Ver respuestas</summary>
                  <ul className="mt-3 space-y-3">
                    {battleQuestions.map((bq, idx) => {
                      const userAnsIdx = userAnswers[idx];
                      const isCorrect = userAnsIdx === bq.correctIndex;
                      return (
                        <li key={idx} className="flex items-start gap-2 text-[#17164F]">
                          {isCorrect ? (
                            <CheckIcon weight="bold" className="mt-0.5 h-5 w-5 shrink-0 text-[#1B8A4F]" aria-label="Correcta" />
                          ) : (
                            <XIcon weight="bold" className="mt-0.5 h-5 w-5 shrink-0 text-[#D9583F]" aria-label="Incorrecta" />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold">{bq.question}</p>
                            {!isCorrect ? <p className="font-semibold text-[#1B8A4F]">{bq.correctAnswer}</p> : null}
                            <p className="text-sm text-[#17164F]/75">{bq.explanation}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </details>

                <div className="mt-auto grid grid-cols-[auto_1fr] gap-3 pt-5">
                  <Link
                    href="/estudiante/jugar"
                    aria-label="Volver a juegos"
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#17164F]"
                  >
                    <ArrowLeftIcon weight="bold" className="h-6 w-6" aria-hidden />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setPasoSetup(2);
                      setPhase("setup");
                    }}
                    className="btn-tactil tactil-juego gap-2 py-3 text-lg text-[#17164F]"
                  >
                    <ArrowCounterClockwiseIcon weight="bold" className="h-6 w-6" aria-hidden />
                    Otra vez
                  </button>
                </div>
              </>
            );
          })()}
      </div>
    </EstudianteLayout>
  );
}
