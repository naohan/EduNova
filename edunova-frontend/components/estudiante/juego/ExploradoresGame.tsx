"use client";

import { useEffect, useMemo, useState } from "react";
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
import { CrownIcon } from "@/components/ui/icons";
import { Dice3D } from "./Dice3D";
import { CharacterCard } from "./CharacterCard";
import { GameQuizModal } from "./GameQuizModal";
import { soundManager } from "./soundEffects";

type Step = "curso" | "personaje" | "sala" | "lobby" | "play";
type AgeTier = "EXPLORADOR_7_9" | "AVENTURERO_10_12" | "CREADOR_13_15";

export function ExploradoresGame() {
  const game = useGameRoom();
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
  const [ageTier, setAgeTier] = useState<AgeTier>("AVENTURERO_10_12");
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
        setBgmActive(true);
      }
    }
  }, [effectiveStep]);

  // Sync avatarId when characterClass changes
  useEffect(() => {
    setAvatarId(CHARACTER_PROFILES[characterClass].avatarId);
  }, [characterClass]);

  // Chequear si subió de nivel para disparar fanfarria
  const roomLevel = game.room?.currentLevel ?? 1;
  useEffect(() => {
    if (roomLevel > 1 && effectiveStep === "play") {
      setLevelUpAlert(roomLevel);
      soundManager.playLevelUp();
    }
  }, [roomLevel, effectiveStep]);

  async function handleCreate() {
    const room = await game.createRoom({
      courseId,
      topic: `${course.nombre}: ${topic}`,
      mission: course.mission,
      maxPlayers,
      hostName: name || currentProfile.name.split(" ")[0],
      avatarId,
      characterClass,
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

      {/* Top Header Global (Referencia Visual B del Plan Maestro) */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#17164F]/90 px-3 py-2 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-2">
            <Link href="/estudiante" className="flex items-center gap-1.5 hover:opacity-85">
              <Image src={JUEGO_ASSETS.logoLibro} alt="EduNova" width={32} height={32} />
              <span className="font-[family-name:var(--font-fredoka)] text-base sm:text-lg font-bold text-white">
                EduNova <span className="text-[#FFC928]">Juegos</span>
              </span>
            </Link>
          </div>

          {/* Selector Camaleón de Edad (HU-02) */}
          <div className="hidden sm:flex items-center gap-1 rounded-full bg-white/10 p-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setAgeTier("EXPLORADOR_7_9")}
              className={`rounded-full px-2.5 py-1 transition-all ${
                ageTier === "EXPLORADOR_7_9" ? "bg-[#FFC928] text-[#17164F] shadow" : "text-white/70 hover:text-white"
              }`}
            >
              7–9 Exp
            </button>
            <button
              type="button"
              onClick={() => setAgeTier("AVENTURERO_10_12")}
              className={`rounded-full px-2.5 py-1 transition-all ${
                ageTier === "AVENTURERO_10_12" ? "bg-[#5636D9] text-white shadow" : "text-white/70 hover:text-white"
              }`}
            >
              10–12 Avent
            </button>
            <button
              type="button"
              onClick={() => setAgeTier("CREADOR_13_15")}
              className={`rounded-full px-2.5 py-1 transition-all ${
                ageTier === "CREADOR_13_15" ? "bg-[#25CFE0] text-[#17164F] shadow" : "text-white/70 hover:text-white"
              }`}
            >
              13–15 Cread
            </button>
          </div>

          {/* PWA Offline Badge & Sound Toggle */}
          <div className="flex items-center gap-2">
            {/* PWA Sync Badge (HU-08) */}
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-[#127A43]/20 border border-[#2DBE70]/40 px-2.5 py-1 text-[10px] font-bold text-[#4ADE80]">
              <span className="h-2 w-2 rounded-full bg-[#2DBE70] animate-pulse" />
              <span>PWA Sincronizada</span>
            </div>

            {/* Hub Shortcut to Tienda & Ligas */}
            <Link
              href="/estudiante/tienda"
              className="flex items-center gap-1 rounded-full bg-[#FFC928]/20 border border-[#FFC928]/40 px-2.5 py-1 text-[11px] font-bold text-[#FFC928] hover:bg-[#FFC928]/30"
              title="Ir a la Tienda de la Mascota"
            >
              <span>🛍️</span>
              <span className="hidden sm:inline">Tienda</span>
            </Link>

            {/* Botón de música de fondo */}
            <button
              type="button"
              onClick={handleToggleBgm}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black transition-all ${
                bgmActive
                  ? "bg-gradient-to-r from-[#FFC928] via-[#FF8A3D] to-[#E85D5D] text-[#17164F] shadow-md animate-pulse ring-2 ring-[#FFC928]/60"
                  : "border border-white/20 bg-white/10 text-white/60 hover:bg-white/20"
              }`}
              title={bgmActive ? "Pausar música de fondo" : "Activar música de fondo"}
            >
              <span>{bgmActive ? "🎵" : "🔇"}</span>
              <span className="hidden sm:inline">{bgmActive ? "Música: ON" : "Música: OFF"}</span>
            </button>

            {/* SFX Mute Audio Button */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all ${
                !muted
                  ? "border-[#2DBE70]/50 bg-[#2DBE70]/20 text-[#4ADE80] shadow"
                  : "border-white/20 bg-white/10 text-white/50"
              }`}
              title={muted ? "Activar efectos de sonido" : "Silenciar efectos de sonido"}
            >
              <span>{muted ? "🔇" : "🔊"}</span>
              <span className="hidden sm:inline">{muted ? "SFX: OFF" : "SFX: ON"}</span>
            </button>
          </div>
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
            }}
            onContinue={() => setStep("personaje")}
          />
        )}

        {effectiveStep === "personaje" && (
          <CharacterSelectScreen
            selectedClass={characterClass}
            onSelectClass={(cls) => setCharacterClass(cls)}
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
            onLeave={() => {
              game.leave();
              setStep("sala");
            }}
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
            onRoll={() => game.action({ action: "roll" }, { silentBusy: true })}
            onAnimatingChange={setBoardAnimating}
            onTileInfo={setTileInfo}
            onShowTerritories={() => setShowTerritories(true)}
            onLeave={() => {
              game.leave();
              setStep("curso");
            }}
            onUseAbility={async () => {
              // Habilidad activa del jugador en turno
              soundManager.playAbility();
              if (currentProfile.id === "gamer") {
                // Avanza +2 casillas con Turbo Boost
                await game.action({ action: "roll", extraSteps: 2 }, { silentBusy: true });
              }
            }}
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
          question={pending.question}
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
                {pending.type === "recompensa" ? "¡Recompensa del Saber!" : "Zona de Descanso"}
              </h3>
              <p className="mt-2 text-sm text-[#5B5678]">{pending.message}</p>
              {"xp" in pending && (
                <div className="mt-3 flex items-center justify-center gap-3">
                  <span className="rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-black text-[#127A43]">
                    +{pending.xp} XP
                  </span>
                  {"coins" in pending && pending.coins && (
                    <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-black text-[#92400E]">
                      +{pending.coins} NovaCoins 🪙
                    </span>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => game.action({ action: "resolve" })}
                className="mt-5 w-full rounded-full bg-[#5636D9] py-3 text-sm font-bold text-white shadow-lg hover:bg-[#4323c4] active:scale-95"
              >
                Continuar Expedición →
              </button>
            </div>
          </div>
        )}

      {/* Level Up Fanfare Modal */}
      {levelUpAlert && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-white via-[#F7F4FF] to-[#EDE7FF] p-6 text-center shadow-2xl border-4 border-[#FFC928] animate-[bounce_0.6s_ease-out]">
            <div className="text-5xl mb-2 animate-bounce">🌟</div>
            <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F]">
              ¡NIVEL {levelUpAlert} SUPERADO!
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#5636D9]">
              {GAME_LEVELS[levelUpAlert - 1]?.name ?? "Mundo Conquistado"}
            </p>
            <p className="mt-1 text-xs text-[#5B5678]">
              {GAME_LEVELS[levelUpAlert - 1]?.subtitle}
            </p>

            <div className="my-4 flex items-center justify-center gap-2 rounded-2xl bg-[#FFF6D6] p-3 text-xs font-bold text-[#92400E]">
              <span>🎁 Recompensa:</span>
              <span>+{GAME_LEVELS[levelUpAlert - 1]?.rewardCoins} NovaCoins 🪙</span>
              <span>|</span>
              <span>+{GAME_LEVELS[levelUpAlert - 1]?.rewardXP} XP</span>
            </div>

            <p className="text-[11px] text-[#127A43] font-bold">
              ❤️ Todas las vidas y habilidades del equipo han sido recargadas.
            </p>

            <button
              type="button"
              onClick={() => setLevelUpAlert(null)}
              className="mt-5 w-full rounded-full bg-[#FFC928] py-3 text-sm font-black text-[#17164F] shadow-lg hover:brightness-110 active:scale-95"
            >
              ¡Adelante al siguiente Mundo! 🚀
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
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl text-[#17164F]">
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl shadow"
                style={{ backgroundColor: BOARD_TILES[tileInfo].color }}
              >
                <Image
                  src={BOARD_TILES[tileInfo].icon}
                  alt=""
                  width={28}
                  height={28}
                />
              </span>
              <div>
                <p className="text-[10px] font-bold text-[#5B5678]">
                  Casilla {tileInfo + 1} de {BOARD_TILES.length}
                </p>
                <h3 className="font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">
                  {BOARD_TILES[tileInfo].label}
                </h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#5B5678] leading-relaxed">
              {BOARD_TILES[tileInfo].kind === "pregunta" &&
                "Al caer aquí responderás una pregunta formativa del tema para ganar XP y NovaCoins."}
              {BOARD_TILES[tileInfo].kind === "desafio" &&
                "Reto más exigente: ¡pregunta avanzada que pondrá a prueba tu lógica y maestría!"}
              {BOARD_TILES[tileInfo].kind === "recompensa" &&
                "Cofre sorpresa con NovaCoins y XP directos para el equipo."}
              {BOARD_TILES[tileInfo].kind === "cooperacion" &&
                "Resuelvan juntos en consenso. Otorga puntos para la Liga de Superación y Cooperación."}
              {BOARD_TILES[tileInfo].kind === "evento" &&
                "¡Evento sorpresa educativo con recompensas inesperadas!"}
              {BOARD_TILES[tileInfo].kind === "descanso" &&
                "Zona de calma: recupera 1 corazón de vida (❤️) y gana puntos de esfuerzo."}
              {BOARD_TILES[tileInfo].kind === "salida" &&
                "Punto de inicio. Pasar por aquí recarga +50 XP y +50 NovaCoins."}
            </p>
            <button
              type="button"
              onClick={() => setTileInfo(null)}
              className="mt-4 w-full rounded-full bg-[#5636D9] py-2.5 text-xs font-bold text-white shadow"
            >
              Entendido
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
              ¡Misión Galáctica Cumplida!
            </h2>
            <p className="mt-2 text-sm text-[#5B5678]">
              El equipo conquistó los 6 territorios educativos y superó el Nivel 4: Castillo del Saber Supremo.
            </p>

            <div className="my-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#F2EEFF] p-3 text-xs font-bold">
              <div className="text-center">
                <span className="block text-lg text-[#5636D9]">+{game.room.totalCoins ?? 400}</span>
                <span className="text-[10px] text-[#5B5678]">NovaCoins Ganadas</span>
              </div>
              <div className="text-center">
                <span className="block text-lg text-[#127A43]">Nivel 4</span>
                <span className="text-[10px] text-[#5B5678]">Maestría Total</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/estudiante/tienda"
                className="w-full rounded-full bg-[#FFC928] py-3 text-sm font-black text-[#17164F] shadow hover:brightness-110"
              >
                Ir a la Tienda a equipar al Robot 🛍️
              </Link>
              <button
                type="button"
                onClick={() => {
                  game.leave();
                  setStep("curso");
                }}
                className="w-full rounded-full bg-[#5636D9] py-3 text-sm font-bold text-white shadow hover:bg-[#4323c4]"
              >
                Jugar otra partida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// STEP 1: Selección de Curso y Niveles
// -------------------------------------------------------------
function CourseSelect({
  courseId,
  onSelect,
  onContinue,
}: {
  courseId: CursoId;
  onSelect: (id: CursoId) => void;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#FFC928]">
            Paso 1 de 3 • Misión Educativa
          </span>
          <h1 className="mt-1 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-white sm:text-3xl">
            Elige tu Campo de Aventura
          </h1>
        </div>
        <Image
          src={JUEGO_ASSETS.robot}
          alt="Cosmo Bot"
          width={64}
          height={72}
          className="h-16 w-auto animate-bounce drop-shadow"
        />
      </header>

      <div className="rounded-3xl bg-white/95 p-5 shadow-2xl text-[#17164F] sm:p-7">
        <p className="text-xs font-semibold text-[#5B5678]">
          Selecciona la materia que explorará tu equipo en el tablero interactivo:
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3.5">
          {COURSE_OPTIONS.map((c) => {
            const on = c.id === courseId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  soundManager.playCoin();
                  onSelect(c.id);
                }}
                className={`relative flex flex-col items-center rounded-2xl p-4 text-center transition-all ${
                  on
                    ? "bg-[#F2EEFF] ring-3 ring-[#5636D9] shadow-md scale-[1.02]"
                    : "bg-[#F7F4FF] hover:bg-[#EDE7FF] hover:scale-[1.01]"
                }`}
              >
                {on && (
                  <Image
                    src={JUEGO_ASSETS.checkVerde}
                    alt=""
                    width={22}
                    height={22}
                    className="absolute right-2.5 top-2.5 h-5 w-5"
                  />
                )}
                <Image
                  src={c.icon}
                  alt=""
                  width={72}
                  height={72}
                  className="h-16 w-16 object-contain sm:h-20 sm:w-20 drop-shadow"
                />
                <span className="mt-2 text-sm font-bold text-[#17164F]">
                  {c.nombre}
                </span>
                <span className="mt-1 text-[11px] leading-tight text-[#5B5678]">
                  {c.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Level Progression Preview */}
        <div className="mt-6 rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] p-4">
          <p className="text-[11px] font-bold text-[#5636D9] uppercase tracking-wide">
            Estructura de Niveles del Tablero
          </p>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GAME_LEVELS.map((lvl) => (
              <div
                key={lvl.level}
                className="rounded-xl bg-white p-2 text-center shadow-sm border border-slate-100"
              >
                <span className="text-base">{lvl.badge.split(" ")[0]}</span>
                <p className="text-[10px] font-bold text-[#17164F] truncate">
                  Nivel {lvl.level}
                </p>
                <p className="text-[9px] text-[#FF8A3D] font-bold">
                  +{lvl.rewardCoins} 🪙
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundManager.playStep();
            onContinue();
          }}
          className="mt-6 w-full rounded-full bg-[#5636D9] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#4323c4] active:scale-95"
        >
          Siguiente: Elegir Personaje →
        </button>

        <Link
          href="/estudiante"
          className="mt-3 block text-center text-xs font-semibold text-[#5B5678] hover:underline"
        >
          Volver al panel del estudiante
        </Link>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 2: Selección de Personajes (Héroes con Vidas y Habilidades)
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
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs sm:text-sm font-bold text-white/80 hover:text-white"
        >
          ← Cambiar curso
        </button>
        <span className="rounded-full bg-[#FFC928]/20 border border-[#FFC928]/40 px-3 py-1 text-xs font-black text-[#FFC928]">
          Paso 2 de 3 • Héroes de la Aventura
        </span>
      </div>

      <div className="text-center mb-6">
        <h2 className="font-[family-name:var(--font-fredoka)] text-2xl sm:text-3xl font-bold text-white">
          Elige tu Personaje y Rol
        </h2>
        <p className="text-xs sm:text-sm text-white/70 mt-1">
          Cada personaje tiene vidas, estadísticas y una habilidad única para el equipo:
        </p>
      </div>

      {/* Grid of 4 Character Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(CHARACTER_PROFILES) as CharacterClass[]).map((cls) => {
          const profile = CHARACTER_PROFILES[cls];
          return (
            <CharacterCard
              key={cls}
              profile={profile}
              selected={selectedClass === cls}
              onSelect={() => onSelectClass(cls)}
            />
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => {
            soundManager.playStep();
            onContinue();
          }}
          className="w-full max-w-md rounded-full bg-gradient-to-r from-[#FFC928] via-[#FF8A3D] to-[#E85D5D] py-3.5 text-sm sm:text-base font-black text-[#17164F] shadow-xl hover:brightness-110 active:scale-95"
        >
          Continuar con {CHARACTER_PROFILES[selectedClass].name} →
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 3: Configuración de Sala
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
      <button
        type="button"
        onClick={onBack}
        className="mb-3 text-xs sm:text-sm font-bold text-white/80 hover:text-white"
      >
        ← Cambiar personaje
      </button>

      <div className="rounded-3xl bg-white p-5 shadow-2xl text-[#17164F] sm:p-6">
        {/* Tab switch */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-[#F2EEFF] p-1">
          {(["crear", "unir"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full py-2 text-xs font-bold transition-all ${
                tab === t ? "bg-[#5636D9] text-white shadow" : "text-[#5636D9]"
              }`}
            >
              {t === "crear" ? "Crear Sala Cooperativa" : "Unirse con Código"}
            </button>
          ))}
        </div>

        {/* Selected Hero Preview */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#F7F4FF] p-3 border border-[#E8E0FF]">
          <div
            className="relative h-12 w-12 shrink-0 rounded-xl p-1"
            style={{ backgroundColor: `${character.color}25` }}
          >
            <Image
              src={character.avatarSrc}
              alt={character.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#17164F]">{character.name}</p>
            <p className="text-[10px] text-[#5636D9] font-semibold">{character.archetype}</p>
          </div>
          <div className="text-right">
            <span className="text-xs">❤️x{character.stats.vida}</span>
          </div>
        </div>

        <label className="text-[11px] font-bold text-[#5B5678]">
          Tu Alias de Jugador
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={character.name.split(" ")[0]}
          className="mt-1 w-full rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] px-3 py-2.5 text-sm font-semibold text-[#17164F] outline-none focus:ring-2 focus:ring-[#5636D9]"
        />

        {tab === "crear" ? (
          <>
            <label className="mt-3 block text-[11px] font-bold text-[#5B5678]">
              Subtema Curricular
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] px-3 py-2.5 text-sm font-semibold text-[#17164F]"
            >
              {course.topics.map((t) => (
                <option key={t} value={t}>
                  {course.nombre}: {t}
                </option>
              ))}
            </select>

            <label className="mt-3 block text-[11px] font-bold text-[#5B5678]">
              Número de Exploradores (2 a 6)
            </label>
            <div className="mt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2EEFF] text-lg font-bold text-[#5636D9]"
              >
                −
              </button>
              <span className="text-xl font-bold text-[#17164F]">
                {maxPlayers}
              </span>
              <button
                type="button"
                onClick={() => setMaxPlayers(Math.min(6, maxPlayers + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2EEFF] text-lg font-bold text-[#5636D9]"
              >
                +
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#F2EEFF] p-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-[#5636D9]">
                  Misión del Equipo
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#17164F]">
                  {course.mission}
                </p>
              </div>
              <Image
                src={JUEGO_ASSETS.castillo}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 object-contain"
              />
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={onCreate}
              className="mt-5 w-full rounded-full bg-[#5636D9] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#4323c4] disabled:opacity-60"
            >
              {busy ? "Creando sala..." : "Crear Sala Cooperativa"}
            </button>
          </>
        ) : (
          <>
            <label className="mt-3 block text-[11px] font-bold text-[#5B5678]">
              Código de Sala (ej. 8F3K7)
            </label>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              maxLength={6}
              className="mt-1 w-full rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] px-3 py-3 text-center text-xl font-bold tracking-[0.3em] text-[#17164F] outline-none focus:ring-2 focus:ring-[#5636D9]"
            />
            <button
              type="button"
              disabled={busy || joinCode.length < 4}
              onClick={onJoin}
              className="mt-5 w-full rounded-full bg-[#5636D9] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#4323c4] disabled:opacity-60"
            >
              {busy ? "Entrando..." : "Unirse a la Expedición"}
            </button>
          </>
        )}

        {error && (
          <p className="mt-3 text-center text-xs font-semibold text-[#E85D5D]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 4: Lobby de la Sala
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
  onLeave,
}: {
  room: NonNullable<ReturnType<typeof useGameRoom>["room"]>;
  meId: string;
  busy: boolean;
  error: string | null;
  onReady: () => void;
  onAddGuest: () => void;
  onRemoveGuest: (targetId: string) => void;
  onStart: () => void;
  onLeave: () => void;
}) {
  const me = room.players.find((p) => p.id === meId)!;
  const slots = Array.from(
    { length: room.maxPlayers },
    (_, i) => room.players[i] ?? null,
  );
  const canAdd = me.isHost && room.players.length < room.maxPlayers;

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl bg-white p-5 shadow-2xl text-[#17164F] sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-bold text-[#17164F]">
              Sala de Espera
            </h2>
            <p className="text-xs text-[#5B5678]">{room.teamName}</p>
          </div>
          <button
            type="button"
            onClick={onLeave}
            className="text-xs font-bold text-[#E85D5D] hover:underline"
          >
            Salir
          </button>
        </div>

        {/* Room code card */}
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#F2EEFF] px-4 py-2.5">
          <div>
            <p className="text-[10px] font-bold text-[#5636D9] uppercase">
              Código de Sala
            </p>
            <p className="font-[family-name:var(--font-fredoka)] text-2xl font-black tracking-widest text-[#17164F]">
              {room.code}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.playCoin();
              navigator.clipboard?.writeText(room.code);
            }}
            className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#5636D9] shadow hover:bg-slate-50"
          >
            <Image src={JUEGO_ASSETS.copiar} alt="" width={16} height={16} />
            Copiar
          </button>
        </div>

        <p className="mt-3 text-xs text-[#5B5678]">
          <strong>Misión: </strong>{room.topic}. {room.mission}
        </p>
        <p className="mt-1 text-[11px] font-bold text-[#5636D9]">
          {room.players.length}/{room.maxPlayers} Exploradores Conectados
        </p>

        {/* Players slots with health badges */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {slots.map((p, i) => {
            if (!p) {
              return (
                <button
                  key={`empty-${i}`}
                  type="button"
                  disabled={!canAdd || busy}
                  onClick={onAddGuest}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#C4B5FD] bg-[#F7F4FF] p-3 min-h-[105px] transition hover:border-[#5636D9] hover:bg-[#EDE7FF] disabled:opacity-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-base font-bold text-[#5636D9] shadow">
                    +
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-[#5636D9]">
                    Agregar Bot
                  </span>
                </button>
              );
            }
            const av =
              JUEGO_ASSETS.avatars.find((a) => a.id === p.avatarId)?.src ??
              JUEGO_ASSETS.avatars[0].src;
            const profile = getCharacterProfileByAvatar(p.avatarId);

            return (
              <div
                key={p.id}
                className="relative flex flex-col items-center rounded-2xl bg-[#F7F4FF] p-3 text-center border border-[#E8E0FF]"
              >
                {me.isHost && !p.isHost && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onRemoveGuest(p.id)}
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#FEE2E2] text-xs font-bold text-[#E85D5D]"
                    aria-label={`Quitar a ${p.name}`}
                  >
                    ×
                  </button>
                )}
                <Image
                  src={av}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow"
                />
                <span className="mt-1 truncate text-xs font-bold text-[#17164F] max-w-[90px]">
                  {p.name}
                </span>
                <span className="text-[9px] text-[#5636D9] font-semibold">
                  {profile.archetype}
                </span>
                <span className="text-[9px] text-[#E85D5D]">
                  {"❤️".repeat(p.lives ?? 3)}
                </span>
                {p.ready ? (
                  <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-[#127A43]">
                    <Image src={JUEGO_ASSETS.checkVerde} alt="" width={12} height={12} />
                    Listo
                  </span>
                ) : (
                  <span className="mt-1 text-[9px] font-bold text-[#6A6586]">
                    Preparando…
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {canAdd && (
          <button
            type="button"
            disabled={busy}
            onClick={onAddGuest}
            className="mt-3 w-full rounded-full border-2 border-dashed border-[#5636D9] bg-[#F2EEFF] py-2 text-xs font-bold text-[#5636D9] hover:bg-[#E8E0FF]"
          >
            + Invitar Compañero / Bot
          </button>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={onReady}
          className={`mt-3 w-full rounded-full py-3 text-sm font-bold shadow transition-all ${
            me.ready
              ? "bg-[#E8E0FF] text-[#5636D9]"
              : "bg-[#25CFE0] text-[#17164F] hover:brightness-105"
          }`}
        >
          {me.ready ? "Cambiar a 'No listo'" : "¡Estoy listo para Jugar!"}
        </button>

        {me.isHost && (
          <button
            type="button"
            disabled={busy || room.players.length < 2}
            onClick={() => {
              soundManager.playCorrect();
              onStart();
            }}
            className="mt-2 w-full rounded-full bg-[#5636D9] py-3.5 text-sm font-black text-white shadow-lg hover:bg-[#4323c4] disabled:bg-[#6A6586]"
          >
            {room.players.length < 2
              ? "Agrega al menos 1 compañero"
              : "¡Comenzar Partida! 🎲"}
          </button>
        )}

        {error && (
          <p className="mt-2 text-center text-xs font-semibold text-[#E85D5D]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// STEP 5: Pantalla de Juego Principal con Vidas, Niveles y Dado 3D
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
  onLeave,
  onUseAbility,
}: {
  room: GameRoom;
  me: PlayerState;
  isMyTurn: boolean;
  canControlTurn: boolean;
  busy: boolean;
  error: string | null;
  onRoll: () => Promise<GameRoom | null>;
  onAnimatingChange: (v: boolean) => void;
  onTileInfo: (i: number | null) => void;
  onShowTerritories: () => void;
  onLeave: () => void;
  onUseAbility: () => void;
}) {
  const [rolling, setRolling] = useState(false);
  const [displayPositions, setDisplayPositions] = useState<Record<string, number>>({});
  const [landingTile, setLandingTile] = useState<number | null>(null);
  const [diceFace, setDiceFace] = useState<number | null>(null);
  const [hint, setHint] = useState("Lanza el dado para avanzar por el tablero");
  const [robotSpeech, setRobotSpeech] = useState<string>(
    "¡Tu turno! Cada respuesta correcta suma NovaCoins para personalizar tu avatar."
  );

  const current = room.players[room.turnIndex];
  const blocked = Boolean(room.pending) || rolling || busy;
  const canRoll = canControlTurn && !blocked;
  const unlocked = room.territoriesUnlocked.length;
  const ranked = room.players.slice().sort((a, b) => b.xp - a.xp);
  const leaderId = ranked[0]?.id;
  const currentProfile = getCharacterProfileByAvatar(current?.avatarId ?? me.avatarId);

  // Sync positions when not animating
  useEffect(() => {
    if (rolling) return;
    const map: Record<string, number> = {};
    for (const p of room.players) map[p.id] = p.position % BOARD_TILES.length;
    setDisplayPositions(map);
  }, [room.players, rolling]);

  async function handleRoll() {
    if (!canRoll || !current) return;
    soundManager.init();
    soundManager.playDice();
    const from = current.position % BOARD_TILES.length;
    setRolling(true);
    onAnimatingChange(true);
    setHint("¡El dado 3D está rodando...!");
    setDiceFace(null);

    const nextRoom = await onRoll();
    if (!nextRoom) {
      setRolling(false);
      onAnimatingChange(false);
      setHint("No se pudo lanzar. Intenta de nuevo.");
      return;
    }

    const mover = nextRoom.players.find((p) => p.id === current.id)!;
    const to = mover.position % BOARD_TILES.length;
    const dice = nextRoom.dice ?? 1;
    setDiceFace(dice);
    setHint(`${current.name} avanza ${dice} casillas`);

    // Step by step audio and hopping animation
    for (let step = 1; step <= dice; step++) {
      const pos = (from + step) % BOARD_TILES.length;
      setDisplayPositions((prev) => ({ ...prev, [current.id]: pos }));
      setLandingTile(pos);
      soundManager.playStep();
      await new Promise((r) => setTimeout(r, 260));
    }

    setLandingTile(to);
    setHint(
      nextRoom.pending
        ? `Aterrizaste en: ${BOARD_TILES[to].label}!`
        : "Turno completado"
    );
    await new Promise((r) => setTimeout(r, 250));
    setRolling(false);
    onAnimatingChange(false);
    setLandingTile(null);
  }

  return (
    <div className="relative mx-auto min-h-[calc(100dvh-1rem)] w-full max-w-6xl overflow-hidden rounded-3xl bg-[#17164F] border-2 border-white/10 shadow-2xl">
      {/* Top HUD: Vidas, NovaCoins, Nivel, Combo */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/95 px-3 py-2 text-[#17164F] shadow-lg sm:px-5">
        {/* Jugador en Turno */}
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src={currentProfile.avatarSrc}
              alt=""
              fill
              className="rounded-full object-cover ring-2 ring-[#5636D9]"
            />
            {current?.id === leaderId && (
              <CrownIcon weight="fill" className="absolute -top-1.5 -right-1.5 h-4 w-4 text-[#FFC928]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black">{current?.name}</span>
              <span className="text-[10px] text-[#5636D9] font-semibold">({currentProfile.archetype})</span>
            </div>
            {/* Lives ❤️ */}
            <div className="flex items-center gap-0.5 text-xs" title={`Vidas: ${current?.lives ?? 3}`}>
              {Array.from({ length: current?.maxLives ?? 3 }).map((_, i) => (
                <span
                  key={i}
                  className={i < (current?.lives ?? 3) ? "opacity-100" : "opacity-25 grayscale"}
                >
                  ❤️
                </span>
              ))}
              {(current?.shields ?? 0) > 0 && <span className="ml-1 text-xs">🛡️</span>}
            </div>
          </div>
        </div>

        {/* Global Level and Mission Pill */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShowTerritories}
            className="flex items-center gap-1.5 rounded-full bg-[#F2EEFF] px-3 py-1 text-xs font-extrabold text-[#5636D9] shadow-sm hover:bg-[#E8E0FF]"
          >
            <span>{GAME_LEVELS[(room.currentLevel ?? 1) - 1]?.badge.split(" ")[0]}</span>
            <span>Nivel {room.currentLevel ?? 1}</span>
            <span className="text-[10px] text-[#5B5678]">({unlocked}/6 Territorios)</span>
          </button>
        </div>

        {/* Currency & Score Stats */}
        <div className="flex items-center gap-2">
          {/* NovaCoins */}
          <div className="flex items-center gap-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-1 text-xs font-black text-[#92400E] shadow-sm">
            <span>🪙</span>
            <span>{me.novaCoins ?? 80}</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 rounded-full bg-[#D1FAE5] border border-[#A7F3D0] px-2.5 py-1 text-xs font-black text-[#065F46] shadow-sm">
            <span>⚡</span>
            <span>{me.xp} XP</span>
          </div>

          <button
            type="button"
            onClick={onLeave}
            className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
            title="Salir al Menú"
          >
            <Image src={JUEGO_ASSETS.salir} alt="Salir" width={16} height={16} />
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <div className="relative flex flex-col lg:flex-row items-center justify-between p-2 sm:p-4 gap-4">
        {/* Left Column: Player Cards / Ranking */}
        <aside className="w-full lg:w-56 shrink-0 space-y-2 hidden sm:block">
          <div className="rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur text-[#17164F]">
            <p className="text-[10px] font-bold text-[#5636D9] uppercase tracking-wider mb-2">
              Exploradores en Sala
            </p>
            <div className="space-y-1.5">
              {ranked.map((p) => {
                const av =
                  JUEGO_ASSETS.avatars.find((a) => a.id === p.avatarId)?.src ??
                  JUEGO_ASSETS.avatars[0].src;
                const onTurn = p.id === current?.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-xl p-2 transition-all ${
                      onTurn
                        ? "bg-[#FFF6D6] ring-2 ring-[#FFC928] shadow-sm"
                        : "bg-[#F7F4FF]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={av}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold leading-tight">
                          {p.name}
                        </p>
                        <p className="text-[9px] text-[#E85D5D]">
                          {"❤️".repeat(p.lives ?? 3)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#5636D9]">
                      {p.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Character Ability Action Card */}
          {current?.id === me.id && (
            <div className="rounded-2xl border border-white/20 bg-white/95 p-3 shadow-xl text-[#17164F]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#5636D9]">
                <span>{currentProfile.activeIcon}</span>
                <span>{currentProfile.activeName}</span>
              </div>
              <p className="text-[10px] text-[#5B5678] mt-1 leading-tight">
                {currentProfile.activeDesc}
              </p>
              {currentProfile.id === "gamer" && (
                <button
                  type="button"
                  disabled={!canRoll}
                  onClick={onUseAbility}
                  className="mt-2 w-full rounded-full bg-[#FF8A3D] py-1.5 text-xs font-black text-white shadow hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  ⚡ Activar Turbo (+2 Casillas)
                </button>
              )}
            </div>
          )}
        </aside>

        {/* Central: 3D Board Component */}
        <div className="flex-1 w-full max-w-[560px] sm:max-w-[620px] mx-auto py-2">
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

        {/* Right Column: Interactive 3D Dice & Robot Coach */}
        <aside className="w-full lg:w-56 shrink-0 flex flex-col items-center justify-between gap-3">
          {/* 3D Dice Component */}
          <div className="w-full rounded-2xl bg-white/95 p-4 shadow-xl text-center backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5636D9] mb-2">
              Tirada de Avance
            </p>
            <Dice3D
              value={diceFace ?? room.dice}
              rolling={rolling}
              canRoll={canRoll}
              onRoll={handleRoll}
              accentColor={currentProfile.color}
            />
          </div>

          {/* Robot Mascot Coach Dialogue Box */}
          <div className="w-full rounded-2xl border border-white/20 bg-gradient-to-b from-[#17164F] to-[#2E2870] p-3 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-1.5">
              <Image
                src={JUEGO_ASSETS.robot}
                alt="Cosmo Bot"
                width={32}
                height={32}
                className="h-8 w-8 object-contain animate-bounce"
              />
              <span className="text-[10px] font-black uppercase text-[#FFC928]">
                Cosmo-Bot Guía
              </span>
            </div>
            <p className="text-xs leading-snug text-white/90">
              {room.pending
                ? "¡Actividad en curso! Resuelve la pregunta para seguir avanzando."
                : canControlTurn && !isMyTurn
                  ? `Lanzas por tu compañero ${current?.name}.`
                  : hint}
            </p>
          </div>
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
          <h3 className="font-[family-name:var(--font-fredoka)] text-xl font-bold">
            Mapa de Territorios
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-[#5B5678] hover:underline"
          >
            Cerrar
          </button>
        </div>
        <p className="text-xs text-[#5B5678] mt-1">
          Cada territorio representa un mundo del saber conquistado por el equipo:
        </p>

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
                <span className="mt-1 text-[10px] font-black">
                  {isUnlocked ? "✓ Conquistado" : "🔒 Bloqueado"}
                </span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-[#5636D9] py-3 text-xs font-bold text-white shadow"
        >
          Volver al Tablero
        </button>
      </div>
    </div>
  );
}
