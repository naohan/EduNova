"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { validateDuelQuestion, getDuelOpponentQuestions } from "@/lib/api/client";

// Types
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
  status?: "APPROVED" | "MODIFIED" | "REJECTED";
  feedback?: string;
  recommendation?: string;
  improvedQuestion?: string;
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
  icon: string;
  suggestedTopics: string[];
}

const COURSES: CourseItem[] = [
  {
    id: "matematica",
    name: "Matemática",
    icon: "📐",
    suggestedTopics: ["Ecuaciones", "Fracciones", "Multiplicación", "Áreas y Perímetros"],
  },
  {
    id: "ciencia",
    name: "Ciencia y Tecnología",
    icon: "🔬",
    suggestedTopics: ["El Sistema Solar", "La Célula", "Animales Vertebrados", "Fotosíntesis"],
  },
  {
    id: "comunicacion",
    name: "Comunicación",
    icon: "📚",
    suggestedTopics: ["Sujeto y Predicado", "Reglas de Tildación", "Sinónimos y Antónimos", "Comprensión Lectora"],
  },
  {
    id: "historia",
    name: "Ciencias Sociales",
    icon: "🏛️",
    suggestedTopics: ["Imperio Incaico", "Culturas Preincas", "Independencia del Perú", "Geografía del Perú"],
  },
  {
    id: "personal",
    name: "Desarrollo Personal",
    icon: "🤝",
    suggestedTopics: ["Emociones", "Convivencia Escolar", "Hábitos Saludables", "Trabajo en Equipo"],
  },
  {
    id: "ingles",
    name: "Inglés",
    icon: "🇬🇧",
    suggestedTopics: ["Verbos Irregulares", "Vocabulario de Casa", "Presente Simple", "Animales en Inglés"],
  },
];

const SUGGESTED_RIVALS = [
  { name: "Mateo_Pro", avatar: "👦", level: "Nivel 6 · Aventurero" },
  { name: "Camila_G", avatar: "👧", level: "Nivel 7 · Calculadora" },
  { name: "Lucas_23", avatar: "🧑", level: "Nivel 5 · Explorador" },
  { name: "Sofia_Nova", avatar: "👩", level: "Nivel 8 · Maestra" },
];

function formatAnswerText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .replace(/([a-zA-Z0-9])\s*=\s*/g, "$1 = ");
}

export default function DueloPage() {
  // Navigation & phase state
  const [phase, setPhase] = useState<DuelPhase>("intro");

  // Setup form state - NO DEFAULT TEXT VALUES, purely placeholders
  const [selectedCourse, setSelectedCourse] = useState<CourseItem>(COURSES[0]);
  const [topic, setTopic] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [alternativesCount, setAlternativesCount] = useState(4); // min 3, max 6
  const [hasTimeLimit, setHasTimeLimit] = useState(true);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(45);
  const [opponentName, setOpponentName] = useState("");
  const [opponentAvatar, setOpponentAvatar] = useState("👦");

  // Uploaded file
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: string;
  } | null>(null);

  // Question creation state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [simulatedOpponentStep, setSimulatedOpponentStep] = useState(1);

  // Sync waiting state
  const [syncCountdown, setSyncCountdown] = useState(3);

  // Battle state
  const [battleQuestions, setBattleQuestions] = useState<BattleQuestion[]>([]);
  const [currentBattleIndex, setCurrentBattleIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [opponentBattleScore, setOpponentBattleScore] = useState(0);

  // Ref for timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize questions array when starting question creation
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
    setSimulatedOpponentStep(1);
    setPhase("challenge_pending");
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

  // Simulate opponent creating questions concurrently
  useEffect(() => {
    if (phase === "question_creation") {
      const interval = setInterval(() => {
        setSimulatedOpponentStep((prev) => {
          if (prev < totalQuestions) return prev + 1;
          return prev;
        });
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [phase, totalQuestions]);

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

  // Current question draft
  const currentQ = questions[currentQIndex] || {
    question: "",
    correctAnswer: "",
    wrongAnswers: Array.from({ length: alternativesCount - 1 }).map(() => ""),
    isVerified: false,
  };

  // Update question draft field
  const updateCurrentQuestion = (updates: Partial<QuestionDraft>) => {
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

  // Verify question with simulated local verification (no third-party data sending)
  const handleVerify = async () => {
    if (!currentQ.question.trim() || !currentQ.correctAnswer.trim()) {
      setVerificationError("Por favor escribe la pregunta y la respuesta correcta antes de verificar.");
      return;
    }

    const targetWrongCount = alternativesCount - 1;
    const filledWrong = (currentQ.wrongAnswers || []).filter((w) => w.trim().length > 0);
    if (filledWrong.length < targetWrongCount) {
      setVerificationError(
        "Escribe todas las alternativas incorrectas para poder verificar tu pregunta."
      );
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const res = await validateDuelQuestion(
        currentQ.question.trim(),
        topic.trim() || selectedCourse.name
      );

      if (!res.ok) {
        setVerificationError("No pudimos conectar con el Verificador. Intenta de nuevo.");
        return;
      }

      const { valid, reason } = res.data;

      if (!valid) {
        setQuestions((prev) => {
          const next = [...prev];
          next[currentQIndex] = {
            ...next[currentQIndex],
            status: "REJECTED",
            feedback: reason,
            recommendation: "Agrega más detalle del tema para que tu pregunta sea clara y retadora.",
            isVerified: false,
          };
          return next;
        });
        setVerificationError(reason);
      } else {
        const finalWrong = filledWrong.slice(0, targetWrongCount).map(formatAnswerText);
        const finalCorrect = formatAnswerText(currentQ.correctAnswer);

        setQuestions((prev) => {
          const next = [...prev];
          next[currentQIndex] = {
            ...next[currentQIndex],
            status: "APPROVED",
            feedback: reason,
            recommendation: "¡Buena formulación! Tus alternativas desafiarán la agudeza de tu oponente.",
            correctAnswer: finalCorrect,
            wrongAnswers: finalWrong,
            isVerified: true,
          };
          return next;
        });
      }
    } catch (err) {
      console.error(err);
      setVerificationError("No pudimos conectar con el Verificador. Intenta de nuevo.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Apply suggested improved text from AI
  const applyImprovedQuestion = () => {
    if (currentQ.improvedQuestion) {
      updateCurrentQuestion({
        question: currentQ.improvedQuestion,
        status: "APPROVED",
        isVerified: true,
      });
    }
  };

  // Navigation between questions
  const goToPreviousQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
      setVerificationError(null);
    }
  };

  const goToNextQuestion = async () => {
    if (!currentQ.isVerified) {
      setVerificationError("Verifica tu pregunta con el botón morado antes de continuar.");
      return;
    }

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

  // Start the battle phase
  const startBattle = () => {
    setCurrentBattleIndex(0);
    setSelectedAnswerIndex(null);
    setUserAnswers([]);
    setPhase("duel_battle");
  };

  // Confirm user's answer in the battle
  const handleAnswerConfirm = (forcedIndex?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const answeredIdx = forcedIndex !== undefined ? forcedIndex : selectedAnswerIndex;
    const finalAnswer = answeredIdx !== null ? answeredIdx : -1;
    const updatedAnswers = [...userAnswers, finalAnswer];
    setUserAnswers(updatedAnswers);

    if (currentBattleIndex < battleQuestions.length - 1) {
      setCurrentBattleIndex(currentBattleIndex + 1);
      setSelectedAnswerIndex(null);
    } else {
      setPhase("duel_results");
    }
  };

  // Battle countdown timer
  useEffect(() => {
    if (phase === "duel_battle" && hasTimeLimit) {
      const resetId = setTimeout(() => setTimeLeft(secondsPerQuestion), 0);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAnswerConfirm(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(resetId);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentBattleIndex, hasTimeLimit, secondsPerQuestion]);

  // Calculate final score
  const calculateScore = () => {
    return userAnswers.reduce((score, ans, idx) => {
      if (battleQuestions[idx] && ans === battleQuestions[idx].correctIndex) {
        return score + 1;
      }
      return score;
    }, 0);
  };

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

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        {/* Header Breadcrumb */}
        <header className="mb-6">
          <p className="text-sm font-semibold text-[#6B7280]">Aula colaborativa</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F] sm:text-3xl">
              Duelo de conocimiento ⚔️
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F2EEFF] px-3.5 py-1 text-xs font-bold text-[#5636D9]">
              <span>🏆</span>
              <span>1 vs 1 con Árbitro</span>
            </span>
          </div>
        </header>

        {/* ======================================================== */}
        {/* PHASE 1: INTRO SCREEN (Matching original + Kid Friendly) */}
        {/* ======================================================== */}
        {phase === "intro" && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-[#E8E0FF] bg-white shadow-sm">
              {/* VS Banner */}
              <div className="flex items-center justify-center gap-6 bg-gradient-to-r from-[#F2EEFF] via-[#EAF6FF] to-[#F2EEFF] px-6 py-7">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5636D9] text-3xl text-white shadow-md">
                    👧
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#17164F]">Tú (Gloria)</div>
                  <div className="text-[10px] text-[#6B7280]">Aventurera</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-[#17164F] px-3.5 py-1 text-xs font-black tracking-widest text-[#FFC928]">
                    VS
                  </div>
                  <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
                    Desafío
                  </span>
                </div>

                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4C9EFF] text-3xl text-white shadow-md">
                    👦
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#17164F]">Compañero</div>
                  <div className="text-[10px] text-[#6B7280]">Rival de aula</div>
                </div>
              </div>

              {/* 4 Steps timeline using Ruta de Aprendizaje design */}
              <div className="p-6">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  ¿Cómo funciona el duelo?
                </h3>
                <ol className="relative space-y-4 before:absolute before:left-[19px] before:top-3 before:h-[calc(100%-1.5rem)] before:w-0.5 before:bg-[#E8E0FF]">
                  {[
                    {
                      num: "1",
                      title: "Eliges el tema y formulas tus preguntas",
                      desc: "Tú creas preguntas con sus alternativas para retar a tu compañero.",
                    },
                    {
                      num: "2",
                      title: "El Verificador valida tu pregunta",
                      desc: "Revisa que sea clara, que no se repita y crea opciones incorrectas justas.",
                    },
                    {
                      num: "3",
                      title: "Ambos intercambian sus desafíos",
                      desc: "Tu rival también prepara sus preguntas y se enfrentan en la batalla con reloj.",
                    },
                    {
                      num: "4",
                      title: "¡Reciben puntaje, informe y NovaCoins!",
                      desc: "Se revelan las respuestas correctas y ambos ganan XP para subir de división.",
                    },
                  ].map((p, idx) => (
                    <li key={p.num} className="relative pl-12">
                      <span className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#5636D9] text-xs font-bold text-white shadow-sm">
                        {idx + 1}
                      </span>
                      <div className="rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] p-3.5">
                        <h4 className="text-xs font-bold text-[#17164F]">{p.title}</h4>
                        <p className="mt-0.5 text-xs text-[#6B7280]">{p.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Woebling Mascot Callout */}
            <div className="flex items-center gap-3 rounded-2xl border border-[#FED7AA] bg-[#FFF6E8] p-4 text-[#92400E]">
              <Image
                src="/assets/woebling.png"
                alt="Woebling"
                width={48}
                height={48}
                className="h-auto w-11 shrink-0"
              />
              <p className="text-xs font-medium sm:text-sm">
                <strong>¡Hola explorador!</strong> En los duelos matemáticos del Renacimiento los sabios se retaban con preguntas. ¡Hoy tú serás el creador de desafíos!
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPhase("setup")}
                className="w-full rounded-2xl bg-[#5636D9] py-4 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.01] hover:bg-[#4829be]"
              >
                Crear duelo y retar compañero ⚔️
              </button>
              <Link
                href="/estudiante/aula"
                className="block text-center text-sm font-semibold text-[#5636D9] hover:underline"
              >
                Volver al aula
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 2: SETUP SCREEN (Playful, Child-Friendly Path Inspired by Ruta)     */}
        {/* ========================================================================= */}
        {phase === "setup" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#E8E0FF] bg-white p-5 sm:p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b border-[#F2EEFF] pb-4">
                <div>
                  <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-bold text-[#17164F]">
                    Prepara tu Duelo Académico
                  </h2>
                  <p className="text-xs text-[#6B7280]">
                    Sigue los 3 pasos para elegir el tema y las reglas del combate
                  </p>
                </div>
                <span className="rounded-full bg-[#F2EEFF] px-3 py-1 text-xs font-bold text-[#5636D9]">
                  Configuración
                </span>
              </div>

              {/* Connected Path for Children (like Ruta de Aprendizaje) */}
              <ol className="relative space-y-6 before:absolute before:left-[23px] before:top-4 before:h-[calc(100%-2rem)] before:w-0.5 before:bg-[#E8E0FF]">
                {/* ---------------------------------------------------- */}
                {/* STEP 1: MATERIA Y TEMA                               */}
                {/* ---------------------------------------------------- */}
                <li className="relative pl-14">
                  <span className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-[#5636D9] text-base font-bold text-white shadow-sm ring-4 ring-[#5636D9]/20">
                    1
                  </span>

                  <div className="rounded-2xl border border-[#5636D9] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-[#17164F]">¿De qué tratará el Duelo?</h3>
                        <p className="text-xs text-[#6B7280]">
                          Elige tu curso favorito y escribe el tema que quieres desafiar
                        </p>
                      </div>
                      <span className="rounded-full bg-[#F2EEFF] px-2.5 py-1 text-xs font-bold text-[#5636D9]">
                        Paso 1
                      </span>
                    </div>

                    {/* Curso: Bubbly buttons with emojis */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#17164F]">
                        Elige tu curso:
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {COURSES.map((c) => {
                          const isSel = selectedCourse.id === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSelectedCourse(c)}
                              className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-bold transition-all ${isSel
                                  ? "border-[#5636D9] bg-[#5636D9] text-white shadow-sm"
                                  : "border-[#E8E0FF] bg-[#F7F4FF] text-[#17164F] hover:bg-[#F2EEFF]"
                                }`}
                            >
                              <span className="text-lg">{c.icon}</span>
                              <span className="truncate">{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Campo Tema: EMPTY by default with gray placeholder */}
                    <div className="mt-4 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#17164F]">
                        Escribe el tema del reto:
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Escribe aquí el tema (ej: El Sistema Solar, Ecuaciones, La Célula...)"
                        className="w-full rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] px-4 py-3.5 text-sm font-semibold text-[#17164F] outline-none transition-all placeholder:font-normal placeholder:text-gray-400 focus:border-[#5636D9] focus:bg-white"
                      />

                      <p className="text-xs text-[#5B5678]">
                        Escribe solo el tema, sin nombres ni datos personales.
                      </p>
                      {/* Quick topic suggestion pills for kids */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-[#6B7280]">Ideas rápidas:</span>
                        {selectedCourse.suggestedTopics.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setTopic(sug)}
                            className="rounded-full border border-[#E8E0FF] bg-white px-2.5 py-1 text-[11px] font-bold text-[#5636D9] hover:bg-[#F2EEFF]"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>

                {/* ---------------------------------------------------- */}
                {/* STEP 2: REGLAS DEL DESAFÍO                           */}
                {/* ---------------------------------------------------- */}
                <li className="relative pl-14">
                  <span className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-[#5636D9] text-base font-bold text-white shadow-sm ring-4 ring-[#5636D9]/20">
                    2
                  </span>

                  <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-[#17164F]">Las Reglas del Combate</h3>
                        <p className="text-xs text-[#6B7280]">
                          ¿Cuántas preguntas y opciones quieres en el duelo?
                        </p>
                      </div>
                      <span className="rounded-full bg-[#F2EEFF] px-2.5 py-1 text-xs font-bold text-[#5636D9]">
                        Paso 2
                      </span>
                    </div>

                    {/* Cantidad de preguntas (3 a 20) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#17164F]">
                          Cantidad de preguntas:
                        </label>
                        <span className="rounded-lg bg-[#5636D9] px-2.5 py-0.5 text-xs font-bold text-white">
                          {totalQuestions} preguntas
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={3}
                          max={20}
                          value={totalQuestions}
                          onChange={(e) => setTotalQuestions(Number(e.target.value))}
                          className="h-2 w-full cursor-pointer accent-[#5636D9]"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[3, 5, 8, 10, 15, 20].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setTotalQuestions(num)}
                            className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${totalQuestions === num
                                ? "bg-[#5636D9] text-white"
                                : "bg-[#F7F4FF] text-[#5636D9] hover:bg-[#F2EEFF]"
                              }`}
                          >
                            {num} preguntas
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cantidad de alternativas (Mínimo 3, Máximo 6 incluyendo la correcta) */}
                    <div className="mt-5 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#17164F]">
                        Cantidad de opciones por pregunta (Mínimo 3, Máximo 6):
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[3, 4, 5, 6].map((num) => {
                          const isSel = alternativesCount === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setAlternativesCount(num)}
                              className={`rounded-2xl border p-3 text-center transition-all ${isSel
                                  ? "border-[#5636D9] bg-[#5636D9] text-white shadow-sm"
                                  : "border-[#E8E0FF] bg-[#F7F4FF] text-[#17164F] hover:bg-[#F2EEFF]"
                                }`}
                            >
                              <p className="text-base font-black">{num} opciones</p>
                              <p className={`text-[10px] ${isSel ? "text-white/80" : "text-[#6B7280]"}`}>
                                1 correcta + {num - 1} distractores
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reloj de tiempo */}
                    <div className="mt-5 rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[#17164F]">
                            ⏱️ ¿Jugar con reloj de tiempo?
                          </p>
                          <p className="text-[11px] text-[#6B7280]">
                            Contador regresivo por pregunta para más emoción
                          </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={hasTimeLimit}
                            onChange={(e) => setHasTimeLimit(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#5636D9] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                        </label>
                      </div>

                      {hasTimeLimit && (
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-[#E8E0FF] pt-3">
                          {[30, 45, 60, 90, 120].map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() => setSecondsPerQuestion(sec)}
                              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${secondsPerQuestion === sec
                                  ? "bg-[#5636D9] text-white"
                                  : "bg-white text-[#17164F] border border-[#E8E0FF]"
                                }`}
                            >
                              ⚡ {sec} seg
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>

                {/* ---------------------------------------------------- */}
                {/* STEP 3: RIVAL Y MATERIAL                             */}
                {/* ---------------------------------------------------- */}
                <li className="relative pl-14">
                  <span className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-[#5636D9] text-base font-bold text-white shadow-sm ring-4 ring-[#5636D9]/20">
                    3
                  </span>

                  <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-[#17164F]">¿A quién retarás?</h3>
                        <p className="text-xs text-[#6B7280]">
                          Elige o escribe el nombre de tu compañero de aula
                        </p>
                      </div>
                      <span className="rounded-full bg-[#F2EEFF] px-2.5 py-1 text-xs font-bold text-[#5636D9]">
                        Paso 3
                      </span>
                    </div>

                    {/* Campo Rival: EMPTY by default with placeholder */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#17164F]">
                        Nombre o alias de tu compañero:
                      </label>
                      <input
                        type="text"
                        value={opponentName}
                        onChange={(e) => setOpponentName(e.target.value)}
                        placeholder="Escribe el nombre de tu amigo o elige uno abajo..."
                        className="w-full rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] px-4 py-3.5 text-sm font-semibold text-[#17164F] outline-none transition-all placeholder:font-normal placeholder:text-gray-400 focus:border-[#5636D9] focus:bg-white"
                      />

                      {/* Companion quick-select cards */}
                      <p className="pt-1 text-[11px] font-semibold text-[#6B7280]">
                        Compañeros conectados en tu aula:
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {SUGGESTED_RIVALS.map((r) => {
                          const isSel = opponentName === r.name;
                          return (
                            <button
                              key={r.name}
                              type="button"
                              onClick={() => {
                                setOpponentName(r.name);
                                setOpponentAvatar(r.avatar);
                              }}
                              className={`flex items-center gap-2 rounded-2xl border p-2.5 text-left transition-all ${isSel
                                  ? "border-[#5636D9] bg-[#5636D9] text-white shadow-sm"
                                  : "border-[#E8E0FF] bg-white text-[#17164F] hover:bg-[#F7F4FF]"
                                }`}
                            >
                              <span className="text-2xl">{r.avatar}</span>
                              <div className="truncate">
                                <p className="text-xs font-bold">{r.name}</p>
                                <p className={`truncate text-[10px] ${isSel ? "text-white/80" : "text-[#6B7280]"}`}>
                                  {r.level}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Subir archivo opcional */}
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#17164F]">
                          📸 Foto o PDF de tus apuntes (Opcional):
                        </label>
                        <span className="rounded-full bg-[#EAF6FF] px-2 py-0.5 text-[10px] font-bold text-[#4C9EFF]">
                          Opcional
                        </span>
                      </div>

                      {!attachedFile ? (
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3 text-center transition-colors hover:border-[#5636D9] hover:bg-[#F2EEFF]/30">
                          <span className="text-2xl">📄</span>
                          <p className="mt-1 text-xs font-semibold text-[#17164F]">
                            Haz clic aquí si quieres subir una foto o PDF
                          </p>
                          <p className="text-[10px] text-[#6B7280]">
                            El Verificador se basará en este material para revisar tus preguntas
                          </p>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between rounded-2xl border border-[#2DBE70]/30 bg-[#ECFDF5] p-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📄</span>
                            <div>
                              <p className="font-bold text-[#065F46]">{attachedFile.name}</p>
                              <p className="text-[10px] text-[#047857]">
                                {attachedFile.size} · Listo para el Verificador
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAttachedFile(null)}
                            className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-[#EF4444] shadow-sm hover:bg-[#FEF2F2]"
                          >
                            Quitar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              </ol>

              {/* Botones de acción */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setPhase("intro")}
                  className="rounded-2xl border border-[#E8E0FF] bg-white px-5 py-4 text-center text-sm font-semibold text-[#6B7280] shadow-sm hover:bg-[#F7F4FF]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={startQuestionCreation}
                  disabled={!topic.trim() || !opponentName.trim()}
                  className="flex-1 rounded-2xl bg-[#5636D9] py-4 text-sm font-bold text-white shadow-md transition-all hover:bg-[#4829be] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {!topic.trim()
                    ? "Escribe un tema arriba para continuar ✍️"
                    : !opponentName.trim()
                      ? "Elige o escribe a tu rival arriba 👦"
                      : `¡Lanzar Desafío a @${opponentName}! ⚔️`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 3: CHALLENGE PENDING (Lobby de Aceptación)         */}
        {/* ======================================================== */}
        {phase === "challenge_pending" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#E8E0FF] bg-white p-8 text-center shadow-sm">
              <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#F2EEFF]">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-3xl bg-[#5636D9] opacity-20"></span>
                <span className="text-4xl">{opponentAvatar}</span>
              </div>

              <div className="inline-block rounded-full bg-[#FEF3C7] px-3.5 py-1 text-xs font-bold text-[#92400E]">
                📡 Solicitud de Duelo enviada
              </div>

              <h2 className="mt-3 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F]">
                Esperando a que @{opponentName} acepte el desafío...
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs text-[#6B7280]">
                Tu compañero ha recibido el reto sobre <strong>{topic}</strong> ({selectedCourse.name}). En cuanto acepte, ambos comenzarán a redactar sus preguntas.
              </p>

              {/* Summary pill */}
              <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-3 rounded-2xl bg-[#F7F4FF] p-3 text-xs font-bold text-[#17164F]">
                <span>{selectedCourse.icon} {selectedCourse.name}</span>
                <span>•</span>
                <span>❓ {totalQuestions} preguntas</span>
                <span>•</span>
                <span>🔢 {alternativesCount} opciones</span>
                <span>•</span>
                <span>⏱️ {hasTimeLimit ? `${secondsPerQuestion}s` : "Sin límite"}</span>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPhase("question_creation")}
                  className="rounded-xl bg-[#10B981] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#059669]"
                >
                  Simular rival aceptó (Continuar de inmediato)
                </button>
                <button
                  type="button"
                  onClick={() => setPhase("setup")}
                  className="rounded-xl border border-[#E8E0FF] px-4 py-2 text-xs font-bold text-[#6B7280] hover:bg-[#F7F4FF]"
                >
                  Cancelar desafío
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 4: QUESTION CREATION (Clean, Child-Friendly Form Without Prefills) */}
        {/* ========================================================================= */}
        {phase === "question_creation" && (
          <div className="space-y-6">
            {/* Botón para volver atrás o cancelar duelo */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPhase("setup")}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-[#E8E0FF] bg-white px-4 py-2 text-xs font-bold text-[#6B7280] shadow-sm transition-all hover:border-[#FECACA] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
              >
                <span>←</span>
                <span>Volver a configurar / Cancelar duelo</span>
              </button>
            </div>

            {/* Top status bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                  {selectedCourse.icon} {selectedCourse.name}
                </p>
                <h2 className="font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">
                  Tema: {topic}
                </h2>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-[#17164F]">
                    Pregunta {currentQIndex + 1} de {totalQuestions}
                  </p>
                  <p className="text-[10px] text-[#6B7280]">
                    {questions.filter((q) => q.isVerified).length} verificadas
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5636D9] text-sm font-bold text-white">
                  {currentQIndex + 1}/{totalQuestions}
                </div>
              </div>
            </div>

            {/* Opponent live status banner */}
            <div className="flex items-center justify-between rounded-2xl border border-[#C7D2FE] bg-[#EEF2FF] px-4 py-2.5 text-xs text-[#3730A3]">
              <div className="flex items-center gap-2">
                <span className="text-base">{opponentAvatar}</span>
                <span>
                  <strong>@{opponentName}</strong> está redactando la pregunta{" "}
                  <strong>{simulatedOpponentStep} de {totalQuestions}</strong>...
                </span>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#4338CA]">
                En vivo
              </span>
            </div>

            {/* Stepper pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {questions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentQIndex(idx);
                    setVerificationError(null);
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${currentQIndex === idx
                      ? "bg-[#5636D9] text-white shadow-sm ring-2 ring-[#5636D9]/30"
                      : q.isVerified
                        ? "bg-[#D1FAE5] text-[#065F46]"
                        : "bg-white border border-[#E8E0FF] text-[#6B7280]"
                    }`}
                >
                  <span>P{idx + 1}</span>
                  {q.isVerified && <span>✓</span>}
                </button>
              ))}
            </div>

            {/* Question Editor Card */}
            <div className="rounded-3xl border border-[#E8E0FF] bg-white p-6 shadow-sm">
              <div className="space-y-4">
                {/* Pregunta: NO prefilled value, gray placeholder */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#17164F]">
                      Pregunta #{currentQIndex + 1}:
                    </label>
                    <span className="text-[11px] text-[#6B7280]">
                      Escribe tu reto sobre {topic}
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={currentQ.question}
                    onChange={(e) => updateCurrentQuestion({ question: e.target.value })}
                    placeholder="¿Qué quieres preguntarle a tu compañero? (Escribe aquí tu pregunta...)"
                    className="w-full rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] p-4 text-sm font-semibold text-[#17164F] outline-none transition-all placeholder:font-normal placeholder:text-gray-400 focus:border-[#5636D9] focus:bg-white"
                  />
                </div>

                {/* Alternativa correcta: NO prefilled value, gray placeholder */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#065F46]">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#10B981] text-[10px] text-white">
                      ✓
                    </span>
                    Alternativa correcta:
                  </label>
                  <input
                    type="text"
                    value={currentQ.correctAnswer}
                    onChange={(e) => updateCurrentQuestion({ correctAnswer: e.target.value })}
                    placeholder="Escribe aquí la respuesta que da el punto..."
                    className="w-full rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3.5 text-sm font-semibold text-[#065F46] outline-none transition-all placeholder:font-normal placeholder:text-emerald-700/50 focus:border-[#10B981] focus:bg-white"
                  />
                </div>

                {/* Alternativas incorrectas (min 2, max 5 according to alternativesCount) */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#991B1B]">
                    Alternativas incorrectas (Distractores):
                  </label>

                  {Array.from({ length: alternativesCount - 1 }).map((_, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute left-3.5 top-3.5 text-xs font-bold text-[#9CA3AF]">
                        Opción {idx + 2}:
                      </span>
                      <input
                        type="text"
                        value={currentQ.wrongAnswers[idx] || ""}
                        onChange={(e) => updateWrongAnswer(idx, e.target.value)}
                        placeholder={`Escribe una opción incorrecta #${idx + 1}...`}
                        className="w-full rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] py-3 pl-24 pr-4 text-sm font-semibold text-[#17164F] outline-none transition-all placeholder:font-normal placeholder:text-gray-400 focus:border-[#5636D9] focus:bg-white"
                      />
                    </div>
                  ))}
                </div>

                {/* Verification result feedback box */}
                {isVerifying && (
                  <div className="flex items-center gap-3 rounded-2xl border border-[#C7D2FE] bg-[#EEF2FF] p-4 text-xs font-bold text-[#3730A3]">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#5636D9] border-t-transparent"></div>
                    <span>
                      El Verificador está evaluando tu pregunta y alternativas...
                    </span>
                  </div>
                )}

                {verificationError && !isVerifying && (
                  <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-xs text-[#991B1B]">
                    <p className="font-bold">⚠️ Atención:</p>
                    <p className="mt-1">{verificationError}</p>
                  </div>
                )}

                {currentQ.status === "MODIFIED" && currentQ.improvedQuestion && !isVerifying && (
                  <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-xs text-[#92400E]">
                    <div className="flex items-center justify-between">
                      <p className="font-bold">✍️ Mejora sugerida:</p>
                      <button
                        type="button"
                        onClick={applyImprovedQuestion}
                        className="rounded-xl bg-[#5636D9] px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-[#4829be]"
                      >
                        Aplicar mejora
                      </button>
                    </div>
                    <p className="mt-1.5 font-medium italic text-[#17164F]">
                      &quot;{currentQ.improvedQuestion}&quot;
                    </p>
                    <p className="mt-1 text-[11px] text-[#78350F]">{currentQ.feedback}</p>
                  </div>
                )}

                {currentQ.isVerified && currentQ.status === "APPROVED" && !isVerifying && (
                  <div className="rounded-2xl border border-[#A7F3D0] bg-[#ECFDF5] p-4 text-xs text-[#065F46]">
                    <p className="font-bold">✓ ¡Pregunta verificada y aprobada!</p>
                    <p className="mt-0.5">{currentQ.feedback}</p>
                    {currentQ.recommendation && (
                      <p className="mt-1.5 text-[11px] text-[#047857]">
                        💡 <strong>Consejo:</strong> {currentQ.recommendation}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Botones de acción: Verificar, Siguiente y Cancelar */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#F2EEFF] pt-4">
                <div className="flex items-center gap-2">
                  {currentQIndex === 0 ? (
                    <button
                      type="button"
                      onClick={() => setPhase("setup")}
                      className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-xs font-bold text-[#DC2626] transition-colors hover:bg-[#FEE2E2]"
                    >
                      ← Cancelar duelo
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goToPreviousQuestion}
                      className="rounded-2xl border border-[#E8E0FF] px-4 py-3 text-xs font-bold text-[#6B7280] transition-colors hover:bg-[#F7F4FF]"
                    >
                      ← Pregunta anterior
                    </button>
                  )}

                  {currentQIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => setPhase("setup")}
                      className="rounded-2xl px-3 py-3 text-xs font-bold text-[#9CA3AF] transition-colors hover:text-[#DC2626]"
                    >
                      Cancelar duelo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="rounded-2xl border-2 border-[#5636D9] bg-[#F2EEFF] px-4 py-3 text-xs font-bold text-[#5636D9] transition-all hover:bg-[#5636D9] hover:text-white disabled:opacity-50"
                  >
                    {isVerifying ? "Verificando..." : "Verificar"}
                  </button>

                  <button
                    type="button"
                    onClick={goToNextQuestion}
                    disabled={!currentQ.isVerified}
                    className="rounded-2xl bg-[#5636D9] px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#4829be] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {currentQIndex === totalQuestions - 1 ? "Enviar Duelo ⚔️" : "Siguiente pregunta →"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 5: SYNC WAITING (Sellando preguntas y esperando)   */}
        {/* ======================================================== */}
        {phase === "sync_waiting" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#E8E0FF] bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#5636D9] text-4xl text-white shadow-lg">
                ⚔️
              </div>

              <div className="inline-block rounded-full bg-[#D1FAE5] px-3.5 py-1 text-xs font-bold text-[#065F46]">
                ✓ Tus {totalQuestions} preguntas han sido selladas por el Árbitro
              </div>

              <h2 className="mt-3 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F]">
                {syncCountdown > 0
                  ? `Sincronizando con @${opponentName}...`
                  : "¡Ambos compañeros están listos!"}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-xs text-[#6B7280]">
                {syncCountdown > 0
                  ? `@${opponentName} acaba de enviar sus ${totalQuestions} preguntas validadas. Preparando el tablero.`
                  : "El duelo puede comenzar en cuanto tú decidas. Si hay tiempo límite, el contador comenzará a correr."}
              </p>

              {/* Opponent ready card */}
              <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-[#F7F4FF] p-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{opponentAvatar}</span>
                    <div className="text-left">
                      <p className="font-bold text-[#17164F]">@{opponentName}</p>
                      <p className="text-[10px] text-[#6B7280]">Reto listo</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#10B981] px-2.5 py-1 text-[10px] font-bold text-white">
                    Preguntas listas ✓
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={startBattle}
                  disabled={syncCountdown > 0 || battleQuestions.length === 0}
                  className="rounded-2xl bg-[#5636D9] px-8 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#4829be] disabled:opacity-50"
                >
                  {syncCountdown === 0 && battleQuestions.length === 0
                    ? "Preparando preguntas…"
                    : "¡Comenzar Duelo Ahora! ⚔️"}
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => setPhase("setup")}
                    className="text-xs font-semibold text-[#6B7280] hover:text-[#DC2626] transition-colors"
                  >
                    Cancelar duelo y volver a configurar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 6: DUEL BATTLE (Respondiendo Preguntas del Rival)  */}
        {/* ======================================================== */}
        {phase === "duel_battle" && battleQuestions.length > 0 && (
          <div className="space-y-6">
            {/* Battle Header with timer */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{opponentAvatar}</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    Desafío formulado por @{opponentName}
                  </p>
                  <h3 className="font-[family-name:var(--font-fredoka)] text-base font-bold text-[#17164F]">
                    Pregunta {currentBattleIndex + 1} de {battleQuestions.length}
                  </h3>
                </div>
              </div>

              {hasTimeLimit && (
                <div
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 font-mono text-sm font-black shadow-sm ${timeLeft <= 10
                      ? "bg-[#FEE2E2] text-[#DC2626] animate-pulse"
                      : "bg-[#F2EEFF] text-[#5636D9]"
                    }`}
                >
                  <span>⏱️</span>
                  <span>{timeLeft}s</span>
                </div>
              )}
            </div>

            {/* Time progress bar */}
            {hasTimeLimit && (
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8E0FF]">
                <div
                  className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-[#EF4444]" : "bg-[#5636D9]"
                    }`}
                  style={{ width: `${(timeLeft / secondsPerQuestion) * 100}%` }}
                ></div>
              </div>
            )}

            {/* Question card */}
            <div className="rounded-3xl border border-[#E8E0FF] bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#17164F] sm:text-lg">
                {battleQuestions[currentBattleIndex].question}
              </h2>

              {/* Dynamic options (3, 4, 5, or 6 options A, B, C, D, E, F) */}
              <div className="mt-6 space-y-3">
                {battleQuestions[currentBattleIndex].options.map((opt, optIdx) => {
                  const isSelected = selectedAnswerIndex === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => setSelectedAnswerIndex(optIdx)}
                      className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${isSelected
                          ? "border-[#5636D9] bg-[#F2EEFF] text-[#17164F] shadow-sm ring-2 ring-[#5636D9]"
                          : "border-[#E8E0FF] bg-[#F7F4FF] text-[#374151] hover:border-[#CBD5E1]"
                        }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${isSelected
                            ? "bg-[#5636D9] text-white"
                            : "bg-white border border-[#E8E0FF] text-[#17164F]"
                          }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Confirm button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleAnswerConfirm()}
                  disabled={selectedAnswerIndex === null}
                  className="rounded-2xl bg-[#5636D9] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#4829be] disabled:opacity-40"
                >
                  {currentBattleIndex === battleQuestions.length - 1
                    ? "Finalizar Duelo 🏁"
                    : "Confirmar respuesta →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PHASE 7: DUEL RESULTS (Veredicto y Retroalimentación)    */}
        {/* ======================================================== */}
        {phase === "duel_results" && (
          <div className="space-y-6">
            {(() => {
              const myScore = calculateScore();
              const rivalScore = opponentBattleScore;
              const isWin = myScore > rivalScore;
              const isTie = myScore === rivalScore;

              return (
                <div className="overflow-hidden rounded-3xl border border-[#E8E0FF] bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-[#F2EEFF] via-[#E8E0FF]/70 to-[#EAF6FF] p-6 text-center">
                    <div className="inline-block rounded-full bg-white/90 px-4 py-1 text-xs font-bold text-[#5636D9] shadow-sm">
                      📜 Veredicto del Duelo · {topic}
                    </div>

                    <h2 className="mt-3 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F] sm:text-3xl">
                      {isWin
                        ? "¡Victoria en el Duelo! 🏆"
                        : isTie
                          ? "¡Empate entre Grandes Mentes! 🤝"
                          : "¡Gran Batalla de Conocimiento! 🛡️"}
                    </h2>

                    {/* Scores layout */}
                    <div className="mt-6 flex items-center justify-center gap-8">
                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5636D9] text-3xl text-white shadow-md">
                          👧
                        </div>
                        <p className="mt-1.5 text-xs font-bold text-[#17164F]">Tú (Gloria)</p>
                        <p className="text-2xl font-black text-[#5636D9]">
                          {myScore}/{battleQuestions.length}
                        </p>
                        <p className="text-[10px] text-[#6B7280]">aciertos</p>
                      </div>

                      <div className="text-center">
                        <span className="rounded-full bg-[#17164F] px-3.5 py-1 text-sm font-black text-[#FFC928]">
                          VS
                        </span>
                      </div>

                      <div className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4C9EFF] text-3xl text-white shadow-md">
                          {opponentAvatar}
                        </div>
                        <p className="mt-1.5 text-xs font-bold text-[#17164F]">@{opponentName}</p>
                        <p className="text-2xl font-black text-[#4C9EFF]">
                          {rivalScore}/{battleQuestions.length}
                        </p>
                        <p className="text-[10px] text-[#6B7280]">aciertos</p>
                      </div>
                    </div>

                    {/* Rewards pill */}
                    <div className="mx-auto mt-6 flex max-w-sm items-center justify-around rounded-2xl bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        <div className="text-left">
                          <p className="text-xs font-black text-[#17164F]">+{isWin ? 180 : 120} XP</p>
                          <p className="text-[9px] text-[#6B7280]">Liga Maestría</p>
                        </div>
                      </div>
                      <div className="h-6 w-[1px] bg-[#E8E0FF]"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🪙</span>
                        <div className="text-left">
                          <p className="text-xs font-black text-[#17164F]">+{isWin ? 60 : 40} NovaCoins</p>
                          <p className="text-[9px] text-[#6B7280]">Para tu avatar 3D</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed question review */}
                  <div className="p-6">
                    <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                      Revisión de respuestas y alternativas correctas:
                    </h3>

                    <div className="space-y-4">
                      {battleQuestions.map((bq, idx) => {
                        const userAnsIdx = userAnswers[idx];
                        const isCorrect = userAnsIdx === bq.correctIndex;

                        return (
                          <div
                            key={idx}
                            className={`rounded-2xl border p-4 text-xs ${isCorrect
                                ? "border-[#A7F3D0] bg-[#ECFDF5]"
                                : "border-[#FECACA] bg-[#FEF2F2]"
                              }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-[#17164F]">
                                #{idx + 1}: {bq.question}
                              </h4>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isCorrect
                                    ? "bg-[#10B981] text-white"
                                    : "bg-[#EF4444] text-white"
                                  }`}
                              >
                                {isCorrect ? "Correcta ✓" : "Incorrecta ✗"}
                              </span>
                            </div>

                            <div className="mt-2 space-y-1">
                              <p className="text-[#374151]">
                                <strong>Tu respuesta:</strong>{" "}
                                {userAnsIdx >= 0 && bq.options[userAnsIdx]
                                  ? bq.options[userAnsIdx]
                                  : "Sin respuesta / Tiempo agotado"}
                              </p>
                              {!isCorrect && (
                                <p className="font-bold text-[#065F46]">
                                  <strong>Alternativa correcta:</strong> {bq.correctAnswer}
                                </p>
                              )}
                              <p className="mt-1.5 text-[11px] text-[#6B7280]">
                                ℹ️ <em>{bq.explanation}</em>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 border-t border-[#F2EEFF] p-6">
                    <button
                      type="button"
                      onClick={() => setPhase("setup")}
                      className="flex-1 rounded-2xl bg-[#5636D9] py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#4829be]"
                    >
                      Nuevo Duelo (Revancha) ⚔️
                    </button>
                    <Link
                      href="/estudiante/aula"
                      className="rounded-2xl border border-[#E8E0FF] px-6 py-3.5 text-center text-xs font-bold text-[#5636D9] hover:bg-[#F7F4FF]"
                    >
                      Volver al aula
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </EstudianteLayout>
  );
}
