"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CursoId } from "@/components/estudiante/data";
import { JUEGO_ASSETS } from "./assets";
import {
  BOARD_TILES,
  CHARACTER_PROFILES,
  COURSE_OPTIONS,
  GAME_LEVELS,
  TERRITORIES,
  getCharacterProfileByAvatar,
} from "./boardData";
import { GameBoard } from "./GameBoard";
import { useGameRoom } from "./useGameRoom";
import type { CharacterClass, GameRoom, PlayerState } from "./gameTypes";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CrownIcon,
  DiamondIcon,
  HeartIcon,
  LightningIcon,
  LockIcon,
  MusicNotesIcon,
  PlusIcon,
  ShieldCheckIcon,
  SignInIcon,
  SpeakerHighIcon,
  SpeakerSimpleSlashIcon,
  StarIcon,
  TrophyIcon,
  UsersIcon,
  XIcon,
} from "@/components/ui/icons";
import { BotonSalir, PuntosAvance } from "@/components/estudiante/shared/kit";
import { Dice3D } from "./Dice3D";
import { CharacterCard, iconoHabilidad } from "./CharacterCard";
import { GameQuizModal } from "./GameQuizModal";
import { soundManager } from "./soundEffects";
import { listUnits } from "@/lib/api/client";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";
import type { QuizQuestion } from "@/components/estudiante/shared/quizTypes";

const AULA_DEMO = "EDU-402";

type Step = "curso" | "personaje" | "sala" | "lobby" | "play";

const QUE_HACE_CASILLA: Record<string, string> = {
  salida: "Aquí empiezas. Pasar da premio.",
  pregunta: "Responde y gana puntos.",
  desafio: "Una pregunta más difícil.",
  recompensa: "Un cofre con premio.",
  cooperacion: "Respondan en equipo.",
  evento: "Una sorpresa.",
  descanso: "Recuperas un corazón.",
};

export function ExploradoresGame() {
  const game = useGameRoom();
  const usuario = useSessionUser();
  const unidadesRes = useApi(listUnits, []);
  const [step, setStep] = useState<Step>("curso");
  const [courseId, setCourseId] = useState<CursoId>("matematica");
  const [characterClass, setCharacterClass] = useState<CharacterClass>("explorador");
  const [tab, setTab] = useState<"crear" | "unir">("crear");
  const [topic, setTopic] = useState(COURSE_OPTIONS[0].topics[0]);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState<string>(JUEGO_ASSETS.avatars[1].id);
  const [joinCode, setJoinCode] = useState("");
  const [showTerritories, setShowTerritories] = useState(false);
  const [boardAnimating, setBoardAnimating] = useState(false);
  const [tileInfo, setTileInfo] = useState<number | null>(null);
  const [muted, setMuted] = useState(soundManager.isMuted());
  const [bgmActive, setBgmActive] = useState(!soundManager.isBgmMuted());
  const [levelUpAlert, setLevelUpAlert] = useState<number | null>(null);

  const course = COURSE_OPTIONS.find((c) => c.id === courseId)!;
  const currentProfile = CHARACTER_PROFILES[characterClass];

  // Sync step from room phase
  const effectiveStep: Step = useMemo(() => {
    if (!game.room) return step === "lobby" || step === "play" ? "sala" : step;
    if (game.room.phase === "lobby") return "lobby";
    return "play";
  }, [game.room, step]);

  // Iniciar música de fondo automáticamente al entrar en lobby o juego
  useEffect(() => {
    if (effectiveStep === "lobby" || effectiveStep === "play") {
      if (!soundManager.isBgmMuted()) {
        soundManager.startBGM();
      }
    }
  }, [effectiveStep]);

  // Chequear si subió de nivel para disparar fanfarria
  const roomLevel = game.room?.currentLevel ?? 1;
  const lastAlertedLevel = useRef(1);
  useEffect(() => {
    if (roomLevel <= 1) {
      lastAlertedLevel.current = 1;
    } else if (effectiveStep === "play" && roomLevel !== lastAlertedLevel.current) {
      lastAlertedLevel.current = roomLevel;
      soundManager.playLevelUp();
      const timer = setTimeout(() => {
        setLevelUpAlert(roomLevel);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [roomLevel, effectiveStep]);

  // Preguntas reales de unidades publicadas por el docente (aula)
  const unitQuestions: QuizQuestion[] = useMemo(() => {
    if (unidadesRes.status !== "ok") return [];
    const aula = usuario?.classroomCode ?? AULA_DEMO;
    const publicadas = unidadesRes.data.filter(
      (u) => u.status === "PUBLISHED" && u.classroomCode === aula && !u.familyStudentId,
    );
    const result: QuizQuestion[] = [];
    for (const u of publicadas) {
      for (const sub of u.subtopics) {
        for (const q of sub.stages.demonstrate.questions) {
          if (
            q.id &&
            q.prompt &&
            Array.isArray(q.options) &&
            q.options.length >= 2 &&
            new Set(q.options).size === q.options.length &&
            typeof q.answerIndex === "number" &&
            q.answerIndex >= 0 &&
            q.answerIndex < q.options.length
          ) {
            result.push({
              id: q.id,
              type: "multiple",
              enunciado: q.prompt,
              opciones: q.options,
              respuesta: q.options[q.answerIndex],
              pista: q.hint || undefined,
              explicacion: "¡Respuesta correcta!",
              xp: 20,
              subtopicId: sub.id,
            });
          }
        }
      }
    }
    return result;
  }, [unidadesRes, usuario]);

  async function handleCreate() {
    const room = await game.createRoom({
      courseId,
      topic: `${course.nombre}: ${topic}`,
      mission: course.mission,
      maxPlayers,
      hostName: name || currentProfile.name.split(" ")[0],
      avatarId,
      characterClass,
      unitQuestions: unitQuestions.length > 0 ? unitQuestions.slice(0, 50) : undefined,
    });
    if (room) setStep("lobby");
  }

  async function handleJoin() {
    const room = await game.joinRoom({
      code: joinCode,
      name: name || currentProfile.name.split(" ")[0],
      avatarId,
      characterClass,
    });
    if (room) setStep("lobby");
  }

  function handleToggleMute() {
    const next = soundManager.toggleMute();
    setMuted(next);
  }

  function handleToggleBgm() {
    const active = soundManager.toggleBGM();
    setBgmActive(active);
  }

  const pending = game.room?.pending;
  const showQuiz =
    pending &&
    (pending.type === "pregunta" ||
      pending.type === "desafio" ||
      pending.type === "cooperacion" ||
      pending.type === "evento");

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#12113B] text-slate-100">
      {/* Dynamic Background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,#5636D9_0%,#17164F_50%,#0B0A26_100%)]"
      />

      <header className="relative z-40 px-3 py-2 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          {effectiveStep === "play" || effectiveStep === "lobby" ? (
            <BotonSalir
              onClick={() => {
                game.leave();
                setStep(effectiveStep === "play" ? "curso" : "sala");
              }}
              etiqueta="Salir de la partida"
              oscuro
            />
          ) : (
            <BotonSalir href="/estudiante/jugar" etiqueta="Salir del juego" oscuro />
          )}
          {effectiveStep === "curso" || effectiveStep === "personaje" || effectiveStep === "sala" ? (
            <PuntosAvance
              actual={effectiveStep === "curso" ? 0 : effectiveStep === "personaje" ? 1 : 2}
              total={3}
              oscuro
              etiqueta="Pasos"
            />
          ) : (
            <div className="flex-1" />
          )}
          <button
            type="button"
            onClick={handleToggleBgm}
            aria-pressed={bgmActive}
            aria-label="Música"
            title="Música"
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
              bgmActive ? "bg-[#FFC928] text-[#17164F]" : "bg-white/15 text-white"
            }`}
          >
            <MusicNotesIcon weight="fill" className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={handleToggleMute}
            aria-pressed={!muted}
            aria-label="Sonidos"
            title="Sonidos"
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
              !muted ? "bg-[#2DBE70] text-[#17164F]" : "bg-white/15 text-white"
            }`}
          >
            {!muted ? (
              <SpeakerHighIcon weight="fill" className="h-6 w-6" aria-hidden />
            ) : (
              <SpeakerSimpleSlashIcon weight="fill" className="h-6 w-6" aria-hidden />
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div
        className={`relative z-10 mx-auto ${
          effectiveStep === "play"
            ? "max-w-6xl p-2 sm:p-3"
            : "max-w-5xl p-3 pb-12 sm:p-6"
        }`}
      >
        {effectiveStep === "curso" && (
          <CourseSelect
            courseId={courseId}
            onSelect={(id) => {
              setCourseId(id);
              const c = COURSE_OPTIONS.find((x) => x.id === id)!;
              setTopic(c.topics[0]);
              setStep("personaje");
            }}
          />
        )}

        {effectiveStep === "personaje" && (
          <CharacterSelectScreen
            selectedClass={characterClass}
            onSelectClass={(cls) => {
              setCharacterClass(cls);
              setAvatarId(CHARACTER_PROFILES[cls].avatarId);
            }}
            onContinue={() => setStep("sala")}
            onBack={() => setStep("curso")}
          />
        )}

        {effectiveStep === "sala" && (
          <RoomSetup
            tab={tab}
            setTab={setTab}
            course={course}
            topic={topic}
            setTopic={setTopic}
            maxPlayers={maxPlayers}
            setMaxPlayers={setMaxPlayers}
            name={name}
            setName={setName}
            character={currentProfile}
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            busy={game.busy}
            error={game.error}
            onBack={() => setStep("personaje")}
            onCreate={handleCreate}
            onJoin={handleJoin}
          />
        )}

        {effectiveStep === "lobby" && game.room && game.me && (
          <LobbyScreen
            room={game.room}
            meId={game.me.id}
            busy={game.busy}
            error={game.error}
            onReady={() =>
              game.action({ action: "ready", ready: !game.me!.ready })
            }
            onAddGuest={() => game.action({ action: "addGuest" })}
            onRemoveGuest={(targetId) =>
              game.action({ action: "removeGuest", targetId })
            }
            onStart={() => game.action({ action: "start" })}
          />
        )}

        {effectiveStep === "play" && game.room && game.me && (
          <PlayScreen
            room={game.room}
            me={game.me}
            isMyTurn={game.isMyTurn}
            canControlTurn={game.canControlTurn}
            busy={game.busy}
            error={game.error}
            onRoll={(extraSteps) => game.action({ action: "roll", extraSteps }, { silentBusy: true })}
            onAnimatingChange={setBoardAnimating}
            onTileInfo={setTileInfo}
            onShowTerritories={() => setShowTerritories(true)}
          />
        )}
      </div>

      {/* In-Game Challenge Quiz Modal with Lives, Shields, and Robot Coach */}
      {showQuiz &&
        !boardAnimating &&
        game.canControlTurn &&
        pending &&
        "question" in pending &&
        game.me && (
        <GameQuizModal
          key={pending.question.id}
          question={pending.question}
          esTurnoPropio={Boolean(game.isMyTurn)}
          tileTitle={
            pending.type === "cooperacion"
              ? "Casilla de Cooperación"
              : pending.type === "desafio"
                ? "Casilla de Desafío"
                : pending.type === "evento"
                  ? "Evento Sorpresa"
                  : "Casilla de Sabiduría"
          }
          tileKind={pending.type}
          player={game.room?.players[game.room.turnIndex] ?? game.me}
          character={getCharacterProfileByAvatar(
            (game.room?.players[game.room.turnIndex] ?? game.me).avatarId
          )}
          combo={(game.room?.players[game.room.turnIndex] ?? game.me).combo ?? 0}
          onClose={() => game.action({ action: "resolve", skip: true })}
          onResolve={(result) =>
            game.action({
              action: "resolve",
              correct: result.correct,
              xp: result.xp,
              coins: result.coins,
              lives: result.lives,
              combo: result.combo,
              usedAbility: result.usedAbility,
            })
          }
        />
      )}

      {/* Reward or Rest Notification Modal */}
      {pending &&
        !boardAnimating &&
        (pending.type === "recompensa" || pending.type === "descanso") &&
        game.canControlTurn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17164F]/60 p-4 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl animate-[bounce_0.5s_ease-out]">
              <Image
                src={
                  pending.type === "recompensa"
                    ? JUEGO_ASSETS.regalo
                    : JUEGO_ASSETS.libroAzul
                }
                alt=""
                width={72}
                height={72}
                className="mx-auto h-18 w-18 drop-shadow-md"
              />
              <h3 className="mt-3 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F]">
                {pending.type === "recompensa" ? "¡Premio!" : "Descanso"}
              </h3>
              {"xp" in pending && (
                <div className="mt-3 flex items-center justify-center gap-3">
                  <span className="rounded-xl bg-[#E3F8EC] px-3 py-1 text-xs font-black text-[#17164F]">
                    +{pending.xp} XP
                  </span>
                  {"coins" in pending && pending.coins && (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-[#FFF6D6] px-3 py-1 text-xs font-black text-[#17164F]">
                      +{pending.coins}
                      <DiamondIcon weight="fill" className="h-3.5 w-3.5 text-[#C98F00]" aria-hidden />
                    </span>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => game.action({ action: "resolve" })}
                aria-label="Continuar"
                className="btn-tactil tactil-cooperar mt-5 w-full py-3 text-[#17164F]"
              >
                <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
              </button>
            </div>
          </div>
        )}

      {/* Level Up Fanfare Modal */}
      {levelUpAlert && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center border-4 border-b-8 border-[#FFC928] border-b-[#C98F00]">
            <div className="mb-2 flex justify-center">
              <StarIcon weight="fill" className="h-12 w-12 text-[#FFC928]" aria-hidden />
            </div>
            <h2 className="font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">
              ¡Nivel {levelUpAlert}!
            </h2>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xl font-bold text-[#17164F]">
              <DiamondIcon weight="fill" className="h-6 w-6 text-[#C98F00]" aria-hidden />+
              {GAME_LEVELS[levelUpAlert - 1]?.rewardCoins}
            </p>
            <button
              type="button"
              onClick={() => setLevelUpAlert(null)}
              aria-label="Seguir jugando"
              className="btn-tactil tactil-juego mt-5 w-full py-3 text-[#17164F]"
            >
              <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* Territories modal */}
      {showTerritories && game.room && (
        <TerritoriesModal
          unlocked={game.room.territoriesUnlocked}
          onClose={() => setShowTerritories(false)}
        />
      )}

      {/* Tile info modal */}
      {tileInfo != null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-center text-[#17164F] shadow-2xl">
            <span
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: BOARD_TILES[tileInfo].color }}
            >
              <Image src={BOARD_TILES[tileInfo].icon} alt="" width={40} height={40} />
            </span>
            <h3 className="mt-3 font-[family-name:var(--font-fredoka)] text-xl font-bold">{BOARD_TILES[tileInfo].label}</h3>
            <p className="mt-1 text-base font-semibold">{QUE_HACE_CASILLA[BOARD_TILES[tileInfo].kind]}</p>
            <button
              type="button"
              onClick={() => setTileInfo(null)}
              aria-label="Cerrar"
              className="btn-tactil tactil-magia mt-4 w-full py-3 text-white"
            >
              <CheckIcon weight="bold" className="h-6 w-6" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {/* Final Victory Screen */}
      {game.room?.phase === "finished" && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#17164F]/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl text-[#17164F] animate-[bounce_0.6s_ease-out]">
            <Image
              src={JUEGO_ASSETS.trofeo}
              alt=""
              width={80}
              height={80}
              className="mx-auto drop-shadow-xl"
            />
            <h2 className="mt-3 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F]">
              ¡Ganaron!
            </h2>
            <p className="my-4 inline-flex items-center gap-1.5 text-xl font-bold text-[#17164F]">
              <DiamondIcon weight="fill" className="h-6 w-6 text-[#C98F00]" aria-hidden />+{game.room.totalCoins ?? 400}
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/estudiante/tienda"
                className="btn-tactil tactil-juego w-full py-3 text-sm font-black text-[#17164F]"
              >
                Tienda
              </Link>
              <button
                type="button"
                onClick={() => {
                  game.leave();
                  setStep("curso");
                }}
                className="btn-tactil tactil-magia w-full py-3 text-sm font-bold text-white"
              >
                Otra vez
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// STEP 1: Curso. Tocar uno ya es elegirlo.
// -------------------------------------------------------------
function CourseSelect({ courseId, onSelect }: { courseId: CursoId; onSelect: (id: CursoId) => void }) {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-5 mt-2 text-center font-[family-name:var(--font-fredoka)] text-3xl font-bold text-white">
        ¿Qué curso?
      </h1>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {COURSE_OPTIONS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={c.id === courseId}
            onClick={() => {
              soundManager.playCoin();
              onSelect(c.id);
            }}
            className="card-tactil tactil-blanco min-h-[168px] flex-col items-center justify-center gap-2 p-4 text-center"
          >
            <Image src={c.icon} alt="" width={96} height={96} className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
            <span className="font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">{c.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 2: Personaje
// -------------------------------------------------------------
function CharacterSelectScreen({
  selectedClass,
  onSelectClass,
  onContinue,
  onBack,
}: {
  selectedClass: CharacterClass;
  onSelectClass: (cls: CharacterClass) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-5 mt-2 text-center font-[family-name:var(--font-fredoka)] text-3xl font-bold text-white">
        ¿Quién eres?
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {(Object.keys(CHARACTER_PROFILES) as CharacterClass[]).map((cls) => (
          <CharacterCard
            key={cls}
            profile={CHARACTER_PROFILES[cls]}
            selected={selectedClass === cls}
            onSelect={() => onSelectClass(cls)}
          />
        ))}
      </div>

      <div className="mx-auto mt-6 flex max-w-md gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Atrás"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white"
        >
          <ArrowLeftIcon weight="bold" className="h-6 w-6" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Siguiente"
          onClick={() => {
            soundManager.playStep();
            onContinue();
          }}
          className="btn-tactil tactil-juego flex-1 py-3 text-[#17164F]"
        >
          <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 3: Sala. Dos caminos grandes; lo demás ya viene elegido.
// -------------------------------------------------------------
function RoomSetup({
  tab,
  setTab,
  course,
  topic,
  setTopic,
  maxPlayers,
  setMaxPlayers,
  name,
  setName,
  character,
  joinCode,
  setJoinCode,
  busy,
  error,
  onBack,
  onCreate,
  onJoin,
}: {
  tab: "crear" | "unir";
  setTab: (t: "crear" | "unir") => void;
  course: (typeof COURSE_OPTIONS)[number];
  topic: string;
  setTopic: (t: string) => void;
  maxPlayers: number;
  setMaxPlayers: (n: number) => void;
  name: string;
  setName: (n: string) => void;
  character: (typeof CHARACTER_PROFILES)[CharacterClass];
  joinCode: string;
  setJoinCode: (c: string) => void;
  busy: boolean;
  error: string | null;
  onBack: () => void;
  onCreate: () => void;
  onJoin: () => void;
}) {
  return (
    <div className="mx-auto max-w-md">
      <div className="mt-2 rounded-3xl bg-white p-5 text-[#17164F] sm:p-6">
        <div className="mb-5 grid grid-cols-2 gap-2">
          {(["crear", "unir"] as const).map((t) => {
            const Icono = t === "crear" ? PlusIcon : SignInIcon;
            const on = tab === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setTab(t)}
                className={`flex flex-col items-center gap-1 rounded-2xl py-4 text-base font-bold transition-colors ${
                  on ? "bg-[#5636D9] text-white" : "bg-[#F2EEFF] text-[#17164F]"
                }`}
              >
                <Icono weight="bold" className="h-8 w-8" aria-hidden />
                {t === "crear" ? "Crear" : "Entrar"}
              </button>
            );
          })}
        </div>

        {tab === "unir" ? (
          <>
            <label htmlFor="codigo-sala" className="sr-only">
              Código de sala
            </label>
            <input
              id="codigo-sala"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              maxLength={6}
              autoComplete="off"
              className="w-full rounded-2xl border-2 border-[#E8E0FF] bg-[#F7F4FF] px-3 py-4 text-center text-2xl font-bold tracking-[0.3em] text-[#17164F] outline-none focus:border-[#5636D9]"
            />
          </>
        ) : null}

        <details className="mt-4 rounded-2xl bg-[#F7F4FF] p-3">
          <summary className="cursor-pointer text-sm font-bold text-[#17164F]">Más opciones</summary>
          <label htmlFor="alias-jugador" className="mt-3 block text-sm font-bold text-[#17164F]">
            Tu alias
          </label>
          <input
            id="alias-jugador"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={character.name.split(" ")[0]}
            className="mt-1 w-full rounded-xl border border-[#E8E0FF] bg-white px-3 py-2.5 font-semibold text-[#17164F] outline-none focus:border-[#5636D9]"
          />
          {tab === "crear" ? (
            <>
              <label htmlFor="tema-sala" className="mt-3 block text-sm font-bold text-[#17164F]">
                Tema
              </label>
              <select
                id="tema-sala"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E8E0FF] bg-white px-3 py-2.5 font-semibold text-[#17164F]"
              >
                {course.topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="mt-3 flex items-center gap-3">
                <UsersIcon weight="fill" className="h-6 w-6 text-[#5636D9]" aria-label="Jugadores" />
                <button
                  type="button"
                  aria-label="Menos jugadores"
                  onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-[#5636D9]"
                >
                  −
                </button>
                <span className="w-6 text-center text-xl font-bold text-[#17164F]">{maxPlayers}</span>
                <button
                  type="button"
                  aria-label="Más jugadores"
                  onClick={() => setMaxPlayers(Math.min(6, maxPlayers + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-[#5636D9]"
                >
                  +
                </button>
              </div>
            </>
          ) : null}
        </details>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Atrás"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F2EEFF] text-[#17164F]"
          >
            <ArrowLeftIcon weight="bold" className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            disabled={busy || (tab === "unir" && joinCode.length < 4)}
            onClick={tab === "crear" ? onCreate : onJoin}
            aria-label={tab === "crear" ? "Crear sala" : "Entrar a la sala"}
            className="btn-tactil tactil-juego flex-1 py-3 text-[#17164F]"
          >
            {busy ? "..." : <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />}
          </button>
        </div>

        {error ? <p className="mt-3 text-center text-sm font-bold text-[#D9583F]">{error}</p> : null}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 4: Sala de espera. El código, quién está y un botón.
// -------------------------------------------------------------
function LobbyScreen({
  room,
  meId,
  busy,
  error,
  onReady,
  onAddGuest,
  onRemoveGuest,
  onStart,
}: {
  room: NonNullable<ReturnType<typeof useGameRoom>["room"]>;
  meId: string;
  busy: boolean;
  error: string | null;
  onReady: () => void;
  onAddGuest: () => void;
  onRemoveGuest: (targetId: string) => void;
  onStart: () => void;
}) {
  const me = room.players.find((p) => p.id === meId)!;
  const slots = Array.from({ length: room.maxPlayers }, (_, i) => room.players[i] ?? null);
  const canAdd = me.isHost && room.players.length < room.maxPlayers;
  const todosListos = room.players.every((p) => p.ready);

  return (
    <div className="mx-auto max-w-md">
      <div className="mt-2 rounded-3xl bg-white p-5 text-[#17164F] sm:p-6">
        <div className="flex items-center justify-between gap-2 rounded-2xl bg-[#F2EEFF] px-4 py-3">
          <p className="font-[family-name:var(--font-fredoka)] text-3xl font-black tracking-widest text-[#17164F]">
            {room.code}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Copiar código"
              title="Copiar código"
              onClick={() => {
                soundManager.playCoin();
                navigator.clipboard?.writeText(room.code);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white"
            >
              <Image src={JUEGO_ASSETS.copiar} alt="" width={24} height={24} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {slots.map((p, i) => {
            if (!p) {
              return (
                <button
                  key={`empty-${i}`}
                  type="button"
                  disabled={!canAdd || busy}
                  onClick={onAddGuest}
                  aria-label="Agregar jugador"
                  className="flex min-h-[112px] items-center justify-center rounded-2xl border-2 border-dashed border-[#C4B5FD] bg-[#F7F4FF] text-[#5636D9] transition-colors hover:border-[#5636D9] disabled:opacity-50"
                >
                  <PlusIcon weight="bold" className="h-8 w-8" aria-hidden />
                </button>
              );
            }
            const av = JUEGO_ASSETS.avatars.find((a) => a.id === p.avatarId)?.src ?? JUEGO_ASSETS.avatars[0].src;
            return (
              <div key={p.id} className="relative flex min-h-[112px] flex-col items-center justify-center rounded-2xl bg-[#F7F4FF] p-2 text-center">
                {me.isHost && !p.isHost ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onRemoveGuest(p.id)}
                    className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFEDE8] text-[#D9583F]"
                    aria-label={`Quitar a ${p.name}`}
                  >
                    <XIcon weight="bold" className="h-4 w-4" aria-hidden />
                  </button>
                ) : null}
                <span className="relative">
                  <Image src={av} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
                  {p.ready ? (
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2DBE70] text-[#17164F]">
                      <CheckIcon weight="bold" className="h-4 w-4" aria-label="Listo" />
                    </span>
                  ) : null}
                </span>
                <span className="mt-1.5 max-w-[100px] truncate text-sm font-bold text-[#17164F]">{p.name}</span>
              </div>
            );
          })}
        </div>

        {me.isHost && todosListos ? (
          <button
            type="button"
            disabled={busy || room.players.length < 2}
            onClick={() => {
              soundManager.playCorrect();
              onStart();
            }}
            className="btn-tactil tactil-juego mt-5 w-full gap-2 py-3.5 text-lg text-[#17164F]"
          >
            {room.players.length < 2 ? (
              <>
                <PlusIcon weight="bold" className="h-6 w-6" aria-hidden />
                Falta 1 jugador
              </>
            ) : (
              "¡Jugar!"
            )}
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={onReady}
            className={`btn-tactil mt-5 w-full gap-2 py-3.5 text-lg ${
              me.ready ? "tactil-blanco text-[#17164F]" : "tactil-cooperar text-[#17164F]"
            }`}
          >
            <CheckIcon weight="bold" className="h-6 w-6" aria-hidden />
            {me.ready ? "Esperando" : "¡Listo!"}
          </button>
        )}

        {error ? <p className="mt-2 text-center text-sm font-bold text-[#D9583F]">{error}</p> : null}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 5: Tablero. Corazones, tablero y dado.
// -------------------------------------------------------------
function PlayScreen({
  room,
  me,
  isMyTurn,
  canControlTurn,
  busy,
  error,
  onRoll,
  onAnimatingChange,
  onTileInfo,
  onShowTerritories,
}: {
  room: GameRoom;
  me: PlayerState;
  isMyTurn: boolean;
  canControlTurn: boolean;
  busy: boolean;
  error: string | null;
  onRoll: (extraSteps: number) => Promise<GameRoom | null>;
  onAnimatingChange: (v: boolean) => void;
  onTileInfo: (i: number | null) => void;
  onShowTerritories: () => void;
}) {
  const [rolling, setRolling] = useState(false);
  const [displayPositions, setDisplayPositions] = useState<Record<string, number>>({});
  const [landingTile, setLandingTile] = useState<number | null>(null);
  const [diceFace, setDiceFace] = useState<number | null>(null);

  const current = room.players[room.turnIndex];
  const blocked = Boolean(room.pending) || rolling || busy;
  const canRoll = canControlTurn && !blocked;
  const unlocked = room.territoriesUnlocked.length;
  const ranked = room.players.slice().sort((a, b) => b.xp - a.xp);
  const leaderId = ranked[0]?.id;
  const currentProfile = getCharacterProfileByAvatar(current?.avatarId ?? me.avatarId);
  const Habilidad = iconoHabilidad[currentProfile.id];
  const puedeTurbo = currentProfile.id === "gamer" && !current?.usedAbility;

  // Sync positions when not animating
  useEffect(() => {
    if (rolling) return;
    const map: Record<string, number> = {};
    for (const p of room.players) map[p.id] = p.position % BOARD_TILES.length;
    const timer = setTimeout(() => {
      setDisplayPositions(map);
    }, 0);
    return () => clearTimeout(timer);
  }, [room.players, rolling]);

  async function handleRoll(extraSteps = 0) {
    if (!canRoll || !current) return;
    soundManager.init();
    soundManager.playDice();
    if (extraSteps) soundManager.playAbility();
    const from = current.position % BOARD_TILES.length;
    setRolling(true);
    onAnimatingChange(true);
    setDiceFace(null);

    const nextRoom = await onRoll(extraSteps);
    if (!nextRoom) {
      setRolling(false);
      onAnimatingChange(false);
      return;
    }

    const mover = nextRoom.players.find((p) => p.id === current.id)!;
    const to = mover.position % BOARD_TILES.length;
    // Con Turbo se avanza más que la cara del dado, y el dado solo tiene seis caras.
    const pasos = nextRoom.dice ?? 1;
    setDiceFace(Math.min(6, Math.max(1, pasos - extraSteps)));

    for (let step = 1; step <= pasos; step++) {
      const pos = (from + step) % BOARD_TILES.length;
      setDisplayPositions((prev) => ({ ...prev, [current.id]: pos }));
      setLandingTile(pos);
      soundManager.playStep();
      await new Promise((r) => setTimeout(r, 260));
    }

    setLandingTile(to);
    await new Promise((r) => setTimeout(r, 250));
    setRolling(false);
    onAnimatingChange(false);
    setLandingTile(null);
  }

  return (
    <div className="relative mx-auto w-full max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-3 py-2 text-[#17164F]">
        <div className="flex items-center gap-2">
          <div className="relative h-11 w-11 shrink-0">
            <Image src={currentProfile.avatarSrc} alt="" fill sizes="44px" className="rounded-full object-cover ring-2 ring-[#5636D9]" />
            {current?.id === leaderId ? (
              <CrownIcon weight="fill" className="absolute -right-1.5 -top-1.5 h-5 w-5 text-[#FFC928]" aria-label="Va ganando" />
            ) : null}
          </div>
          <div>
            <p className="text-sm font-black">{current?.name}</p>
            <div className="flex items-center gap-0.5" role="img" aria-label={`${current?.lives ?? 3} corazones`}>
              {Array.from({ length: current?.maxLives ?? 3 }).map((_, i) => (
                <HeartIcon
                  key={i}
                  weight="fill"
                  className={`h-4 w-4 ${i < (current?.lives ?? 3) ? "text-[#FF8A73]" : "text-[#17164F]/15"}`}
                  aria-hidden
                />
              ))}
              {(current?.shields ?? 0) > 0 ? <ShieldCheckIcon weight="fill" className="ml-1 h-4 w-4 text-[#C98F00]" aria-label="Escudo" /> : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShowTerritories}
            aria-label={`Nivel ${room.currentLevel ?? 1}, ${unlocked} de 6 territorios`}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-[#F2EEFF] px-3 text-base font-extrabold text-[#17164F]"
          >
            <TrophyIcon weight="fill" className="h-5 w-5 text-[#5636D9]" aria-hidden />
            {unlocked}/6
          </button>
          <span className="flex h-11 items-center gap-1.5 rounded-xl bg-[#FFF6D6] px-3 text-base font-black text-[#17164F]" aria-label={`${me.novaCoins ?? 80} monedas`}>
            <DiamondIcon weight="fill" className="h-5 w-5 text-[#C98F00]" aria-hidden />
            {me.novaCoins ?? 80}
          </span>
          <span className="flex h-11 items-center gap-1.5 rounded-xl bg-[#E3F8EC] px-3 text-base font-black text-[#17164F]" aria-label={`${me.xp} puntos`}>
            <LightningIcon weight="fill" className="h-5 w-5 text-[#1B8A4F]" aria-hidden />
            {me.xp}
          </span>
        </div>
      </header>

      <div className="mt-3 flex flex-col items-center gap-3 lg:flex-row lg:items-start lg:justify-center">
        <div className="mx-auto w-full max-w-[560px] flex-1 sm:max-w-[620px]">
          <GameBoard
            players={room.players}
            turnIndex={room.turnIndex}
            currentLevel={room.currentLevel ?? 1}
            displayPositions={displayPositions}
            completedTiles={room.completedTiles ?? [0]}
            landingTile={landingTile}
            movingPlayerId={rolling ? current?.id : null}
            onTileClick={(i) => onTileInfo(i)}
          />
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-56">
          <div className="rounded-2xl bg-white p-4 text-center">
            <Dice3D
              value={diceFace ?? (room.dice ? Math.min(6, room.dice) : null)}
              rolling={rolling}
              canRoll={canRoll}
              onRoll={() => handleRoll()}
              accentColor={currentProfile.color}
            />
            {canRoll && puedeTurbo ? (
              <button
                type="button"
                onClick={() => handleRoll(2)}
                aria-label={`${currentProfile.activeName}: ${currentProfile.activeDesc}`}
                className="btn-tactil tactil-refuerzo mt-3 w-full gap-2 py-2.5 text-base text-[#17164F]"
              >
                <Habilidad weight="fill" className="h-5 w-5" aria-hidden />
                {currentProfile.activeShort}
              </button>
            ) : null}
            {!isMyTurn && canControlTurn ? (
              <p className="mt-2 text-sm font-bold text-[#17164F]">Lanza por {current?.name}</p>
            ) : null}
            {error ? <p className="mt-2 text-sm font-bold text-[#D9583F]">{error}</p> : null}
          </div>

          <ul className="hidden gap-1.5 rounded-2xl bg-white p-2 text-[#17164F] lg:grid" aria-label="Jugadores">
            {ranked.map((p) => {
              const av = JUEGO_ASSETS.avatars.find((a) => a.id === p.avatarId)?.src ?? JUEGO_ASSETS.avatars[0].src;
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-2 rounded-xl p-1.5 ${p.id === current?.id ? "bg-[#FFF6D6]" : ""}`}
                >
                  <Image src={av} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{p.name}</span>
                  <span className="text-sm font-black">{p.xp}</span>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Territories Modal
// -------------------------------------------------------------
function TerritoriesModal({
  unlocked,
  onClose,
}: {
  unlocked: string[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl text-[#17164F]">
        <div className="flex items-center justify-between">
          <h3 className="font-[family-name:var(--font-fredoka)] text-xl font-bold">Territorios</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F2EEFF] text-[#17164F]"
          >
            <XIcon weight="bold" className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {TERRITORIES.map((t) => {
            const isUnlocked = unlocked.includes(t.id);
            return (
              <div
                key={t.id}
                className={`relative flex flex-col items-center rounded-2xl p-3 text-center border transition-all ${
                  isUnlocked
                    ? "border-[#2DBE70] bg-[#F0FDF4] shadow-md"
                    : "border-slate-200 bg-slate-50 opacity-60 grayscale"
                }`}
              >
                <Image
                  src={t.image}
                  alt={t.nombre}
                  width={56}
                  height={56}
                  className="h-14 w-14 object-contain drop-shadow"
                />
                <span className="mt-2 text-xs font-bold leading-tight">
                  {t.nombre}
                </span>
                {isUnlocked ? (
                  <CheckIcon weight="bold" className="mt-1 h-5 w-5 text-[#1B8A4F]" aria-label="Conquistado" />
                ) : (
                  <LockIcon weight="bold" className="mt-1 h-5 w-5 text-[#5B5678]" aria-label="Bloqueado" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
