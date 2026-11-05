"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CursoId } from "@/components/estudiante/data";
import { ActivityQuiz } from "@/components/estudiante/shared/ActivityQuiz";
import { JUEGO_ASSETS } from "./assets";
import { BOARD_TILES, COURSE_OPTIONS, TERRITORIES } from "./boardData";
import { GameBoard } from "./GameBoard";
import { useGameRoom } from "./useGameRoom";
import type { GameRoom, PlayerState } from "./gameTypes";
import { CrownIcon, LockIcon } from "@/components/ui/icons";

type Step = "curso" | "sala" | "lobby" | "play";

export function ExploradoresGame() {
  const game = useGameRoom();
  const [step, setStep] = useState<Step>("curso");
  const [courseId, setCourseId] = useState<CursoId>("matematica");
  const [tab, setTab] = useState<"crear" | "unir">("crear");
  const [topic, setTopic] = useState(COURSE_OPTIONS[0].topics[0]);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState<string>(JUEGO_ASSETS.avatars[0].id);
  const [joinCode, setJoinCode] = useState("");
  const [showTerritories, setShowTerritories] = useState(false);
  const [boardAnimating, setBoardAnimating] = useState(false);
  const [tileInfo, setTileInfo] = useState<number | null>(null);

  const course = COURSE_OPTIONS.find((c) => c.id === courseId)!;

  // Sync step from room phase
  const effectiveStep: Step = useMemo(() => {
    if (!game.room) return step === "lobby" || step === "play" ? "sala" : step;
    if (game.room.phase === "lobby") return "lobby";
    return "play";
  }, [game.room, step]);

  async function handleCreate() {
    const room = await game.createRoom({
      courseId,
      topic: `${course.nombre}: ${topic}`,
      mission: course.mission,
      maxPlayers,
      hostName: name || "Anfitrión",
      avatarId,
    });
    if (room) setStep("lobby");
  }

  async function handleJoin() {
    const room = await game.joinRoom({
      code: joinCode,
      name: name || "Jugador",
      avatarId,
    });
    if (room) setStep("lobby");
  }

  const pending = game.room?.pending;
  const showQuiz =
    pending &&
    (pending.type === "pregunta" ||
      pending.type === "desafio" ||
      pending.type === "cooperacion" ||
      pending.type === "evento");

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#17164F]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "#17164F",
        }}
      />

      <div
        className={`relative z-10 mx-auto ${
          effectiveStep === "play"
            ? "max-w-6xl p-2 sm:p-3"
            : "max-w-5xl p-3 pb-10 sm:p-5"
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
            onContinue={() => setStep("sala")}
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
            avatarId={avatarId}
            setAvatarId={setAvatarId}
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            busy={game.busy}
            error={game.error}
            onBack={() => setStep("curso")}
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
          />
        )}
      </div>

      {showQuiz &&
        !boardAnimating &&
        game.canControlTurn &&
        pending &&
        "question" in pending && (
        <ActivityQuiz
          title={
            pending.type === "cooperacion"
              ? "Casilla de cooperación"
              : pending.type === "desafio"
                ? "Casilla de desafío"
                : pending.type === "evento"
                  ? "Evento sorpresa"
                  : "Casilla de pregunta"
          }
          intro={
            pending.type === "cooperacion"
              ? "¡Comenten en equipo y elijan juntos la respuesta!"
              : !game.isMyTurn
                ? `Turno de ${game.room?.players[game.room.turnIndex]?.name ?? "compañero"}. Tú lanzas por el equipo`
                : undefined
          }
          questions={[pending.question]}
          onClose={() => game.action({ action: "resolve", skip: true })}
          onPass={(xp) =>
            game.action({ action: "resolve", correct: true, xp })
          }
        />
      )}

      {pending &&
        !boardAnimating &&
        (pending.type === "recompensa" || pending.type === "descanso") &&
        game.canControlTurn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17164F]/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
              <Image
                src={
                  pending.type === "recompensa"
                    ? JUEGO_ASSETS.regalo
                    : JUEGO_ASSETS.libroAzul
                }
                alt=""
                width={64}
                height={64}
                className="mx-auto h-16 w-16"
              />
              <h3 className="mt-3 font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
                {pending.type === "recompensa" ? "¡Recompensa!" : "Descanso"}
              </h3>
              <p className="mt-2 text-sm text-[#5B5678]">{pending.message}</p>
              {"xp" in pending && (
                <p className="mt-2 text-sm font-bold text-[#127A43]">
                  +{pending.xp} XP
                </p>
              )}
              <button
                type="button"
                onClick={() => game.action({ action: "resolve" })}
                className="mt-4 w-full rounded-full bg-[#5636D9] py-3 text-sm font-bold text-white"
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

      {showTerritories && game.room && (
        <TerritoriesModal
          unlocked={game.room.territoriesUnlocked}
          onClose={() => setShowTerritories(false)}
        />
      )}

      {tileInfo != null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
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
                  Casilla {tileInfo + 1}
                </p>
                <h3 className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
                  {BOARD_TILES[tileInfo].label}
                </h3>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#5B5678]">
              {BOARD_TILES[tileInfo].kind === "pregunta" &&
                "Al caer aquí responderás una pregunta del tema."}
              {BOARD_TILES[tileInfo].kind === "desafio" &&
                "Reto más exigente: ¡aplica lo aprendido!"}
              {BOARD_TILES[tileInfo].kind === "recompensa" &&
                "Ganas XP y ayudas a la misión del equipo."}
              {BOARD_TILES[tileInfo].kind === "cooperacion" &&
                "Resuelvan juntos en consenso."}
              {BOARD_TILES[tileInfo].kind === "evento" &&
                "¡Sorpresa educativa!"}
              {BOARD_TILES[tileInfo].kind === "descanso" &&
                "Revisa una pista y gana ayuda."}
              {BOARD_TILES[tileInfo].kind === "salida" &&
                "Punto de inicio. Pasar por aquí da +50 XP."}
            </p>
            <button
              type="button"
              onClick={() => setTileInfo(null)}
              className="mt-4 w-full rounded-full bg-[#5636D9] py-2.5 text-sm font-bold text-white"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {game.room?.phase === "finished" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#17164F]/60 p-4 backdrop-blur">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
            <Image
              src={JUEGO_ASSETS.trofeo}
              alt=""
              width={72}
              height={72}
              className="mx-auto"
            />
            <h2 className="mt-3 font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
              ¡Misión cumplida!
            </h2>
            <p className="mt-2 text-sm text-[#5B5678]">
              El equipo conquistó todos los territorios. ¡Excelente trabajo
              colaborativo!
            </p>
            <button
              type="button"
              onClick={() => {
                game.leave();
                setStep("curso");
              }}
              className="mt-5 w-full rounded-full bg-[#5636D9] py-3 font-bold text-white"
            >
              Nueva partida
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="mx-auto max-w-lg">
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src={JUEGO_ASSETS.logoLibro} alt="" width={40} height={40} />
          <span className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-white">
            EduNova
          </span>
        </div>
        <Image
          src={JUEGO_ASSETS.robot}
          alt=""
          width={56}
          height={64}
          className="h-14 w-auto"
        />
      </header>

      <div className="rounded-2xl bg-white/95 p-4 shadow-2xl sm:p-6">
        <h1 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F] sm:text-2xl">
          ¿Qué quieres estudiar hoy?
        </h1>
        <p className="mt-1 text-xs text-[#5B5678]">
          Todos los jugadores de la partida usarán el mismo curso.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {COURSE_OPTIONS.map((c) => {
            const on = c.id === courseId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={`relative flex flex-col items-center rounded-2xl p-3 text-center transition ${
                  on
                    ? "bg-[#F2EEFF] ring-2 ring-[#5636D9]"
                    : "bg-[#F7F4FF] hover:bg-[#EDE7FF]"
                }`}
              >
                {on && (
                  <Image
                    src={JUEGO_ASSETS.checkVerde}
                    alt=""
                    width={22}
                    height={22}
                    className="absolute right-2 top-2 h-5 w-5"
                  />
                )}
                <Image
                  src={c.icon}
                  alt=""
                  width={72}
                  height={72}
                  className="h-16 w-16 object-contain sm:h-20 sm:w-20"
                />
                <span className="mt-2 text-sm font-bold text-[#17164F]">
                  {c.nombre}
                </span>
                <span className="mt-1 text-[10px] leading-snug text-[#5B5678]">
                  {c.desc}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="mt-5 w-full rounded-full bg-[#5636D9] py-3.5 text-sm font-bold text-white"
        >
          Continuar
        </button>
        <Link
          href="/estudiante"
          className="mt-2 block text-center text-xs font-semibold text-[#5B5678]"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

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
  avatarId,
  setAvatarId,
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
  avatarId: string;
  setAvatarId: (id: string) => void;
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
        className="mb-3 text-sm font-bold text-white/80"
      >
        ← Cambiar curso
      </button>

      <div className="rounded-2xl bg-white p-4 shadow-2xl sm:p-5">
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-full bg-[#F2EEFF] p-1">
          {(["crear", "unir"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full py-2 text-xs font-bold ${
                tab === t ? "bg-[#5636D9] text-white" : "text-[#5636D9]"
              }`}
            >
              {t === "crear" ? "Crear sala" : "Unirse con código"}
            </button>
          ))}
        </div>

        <label className="text-[10px] font-bold text-[#5B5678]">
          Tu nombre
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Noemí"
          className="mt-1 w-full rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] px-3 py-2.5 text-sm font-semibold text-[#17164F] outline-none focus:ring-2 focus:ring-[#5636D9]"
        />

        <p className="mt-3 text-[10px] font-bold text-[#5B5678]">
          Avatar
        </p>
        <div className="mt-1 flex gap-2">
          {JUEGO_ASSETS.avatars.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAvatarId(a.id)}
              className={`rounded-xl p-1 ${
                avatarId === a.id ? "ring-2 ring-[#5636D9]" : "opacity-70"
              }`}
            >
              <Image
                src={a.src}
                alt={a.label}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-cover"
              />
            </button>
          ))}
        </div>

        {tab === "crear" ? (
          <>
            <label className="mt-3 block text-[10px] font-bold text-[#5B5678]">
              Tema
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

            <label className="mt-3 block text-[10px] font-bold text-[#5B5678]">
              Jugadores (2 a 6)
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
                  Misión del equipo
                </p>
                <p className="text-sm font-bold text-[#17164F]">
                  {course.mission}
                </p>
              </div>
              <Image
                src={JUEGO_ASSETS.castillo}
                alt=""
                width={72}
                height={72}
                className="h-16 w-16 object-contain"
              />
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={onCreate}
              className="mt-5 w-full rounded-full bg-[#5636D9] py-3.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {busy ? "Creando…" : "Crear sala"}
            </button>
          </>
        ) : (
          <>
            <label className="mt-3 block text-[10px] font-bold text-[#5B5678]">
              Código de sala
            </label>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Ej. 8F3K7"
              maxLength={6}
              className="mt-1 w-full rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] px-3 py-2.5 text-center text-lg font-bold tracking-[0.3em] text-[#17164F] outline-none focus:ring-2 focus:ring-[#5636D9]"
            />
            <button
              type="button"
              disabled={busy || joinCode.length < 4}
              onClick={onJoin}
              className="mt-5 w-full rounded-full bg-[#5636D9] py-3.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {busy ? "Entrando…" : "Unirse"}
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
      <div className="rounded-2xl bg-white p-4 shadow-2xl sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
              Sala del equipo
            </h2>
            <p className="text-xs text-[#5B5678]">{room.teamName}</p>
          </div>
          <button
            type="button"
            onClick={onLeave}
            className="text-xs font-bold text-[#5B5678]"
          >
            Salir
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#F2EEFF] px-3 py-2">
          <div>
            <p className="text-[10px] font-bold text-[#5636D9]">
              Código
            </p>
            <p className="font-[family-name:var(--font-fredoka)] text-2xl font-bold tracking-widest text-[#17164F]">
              {room.code}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(room.code)}
            className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#5636D9] shadow"
          >
            <Image src={JUEGO_ASSETS.copiar} alt="" width={16} height={16} />
            Copiar
          </button>
        </div>

        <p className="mt-3 text-xs text-[#5B5678]">
          {room.topic}. {room.mission}
        </p>
        <p className="mt-1 text-[11px] font-semibold text-[#5636D9]">
          {room.players.length}/{room.maxPlayers} jugadores
          {canAdd ? ". Toca + para agregar compañeros" : ""}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {slots.map((p, i) => {
            if (!p) {
              return (
                <button
                  key={`empty-${i}`}
                  type="button"
                  disabled={!canAdd || busy}
                  onClick={onAddGuest}
                  className="flex flex-col items-center rounded-2xl border border-dashed border-[#C4B5FD] bg-[#F7F4FF] p-3 transition hover:border-[#5636D9] hover:bg-[#EDE7FF] disabled:opacity-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-[#5636D9] shadow">
                    +
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-[#5636D9]">
                    Agregar
                  </span>
                </button>
              );
            }
            const av =
              JUEGO_ASSETS.avatars.find((a) => a.id === p.avatarId)?.src ??
              JUEGO_ASSETS.avatars[0].src;
            return (
              <div
                key={p.id}
                className="relative flex flex-col items-center rounded-2xl bg-[#F7F4FF] p-3"
              >
                {me.isHost && !p.isHost && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onRemoveGuest(p.id)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FEE2E2] text-[10px] font-bold text-[#E85D5D]"
                    aria-label={`Quitar a ${p.name}`}
                  >
                    ×
                  </button>
                )}
                <Image
                  src={av}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                />
                <span className="mt-1 truncate text-xs font-bold text-[#17164F]">
                  {p.name}
                </span>
                {p.ready ? (
                  <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-[#127A43]">
                    <Image
                      src={JUEGO_ASSETS.checkVerde}
                      alt=""
                      width={12}
                      height={12}
                    />
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
            className="mt-3 w-full rounded-full border-2 border-dashed border-[#5636D9] bg-[#F2EEFF] py-2.5 text-sm font-bold text-[#5636D9]"
          >
            + Agregar compañero
          </button>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={onReady}
          className={`mt-3 w-full rounded-full py-3 text-sm font-bold ${
            me.ready
              ? "bg-[#E8E0FF] text-[#5636D9]"
              : "bg-[#25CFE0] text-[#17164F]"
          }`}
        >
          {me.ready ? "No estoy listo" : "¡Estoy listo!"}
        </button>

        {me.isHost && (
          <button
            type="button"
            disabled={busy || room.players.length < 2}
            onClick={onStart}
            className="mt-2 w-full rounded-full bg-[#5636D9] py-3.5 text-sm font-bold text-white disabled:bg-[#6A6586]"
          >
            {room.players.length < 2
              ? "Agrega al menos 1 compañero"
              : "Comenzar juego"}
          </button>
        )}

        {!me.isHost && (
          <p className="mt-3 text-center text-xs text-[#5B5678]">
            Esperando a que el anfitrión inicie…
          </p>
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
}) {
  const [rolling, setRolling] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [displayPositions, setDisplayPositions] = useState<
    Record<string, number>
  >({});
  const [landingTile, setLandingTile] = useState<number | null>(null);
  const [diceFace, setDiceFace] = useState<number | null>(null);
  const [hint, setHint] = useState("Lanza el dado para avanzar");

  const current = room.players[room.turnIndex];
  const blocked = Boolean(room.pending) || rolling || busy;
  const canRoll = canControlTurn && !blocked;
  const unlocked = room.territoriesUnlocked.length;
  const ranked = room.players.slice().sort((a, b) => b.xp - a.xp);
  const leaderId = ranked[0]?.id;

  const currentAv =
    JUEGO_ASSETS.avatars.find((a) => a.id === current?.avatarId)?.src ??
    JUEGO_ASSETS.avatars[0].src;

  // Sync display positions when not animating
  useEffect(() => {
    if (rolling) return;
    const map: Record<string, number> = {};
    for (const p of room.players) map[p.id] = p.position % BOARD_TILES.length;
    setDisplayPositions(map);
  }, [room.players, rolling]);

  async function handleRoll() {
    if (!canRoll || !current) return;
    const from = current.position % BOARD_TILES.length;
    setRolling(true);
    onAnimatingChange(true);
    setHint("¡Dado en juego…!");
    setDiceFace(null);

    // Spin faces
    for (let i = 0; i < 8; i++) {
      setDiceFace(Math.floor(Math.random() * 6) + 1);
      await new Promise((r) => setTimeout(r, 70));
    }

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

    // Step along the path
    for (let step = 1; step <= dice; step++) {
      const pos = (from + step) % BOARD_TILES.length;
      setDisplayPositions((prev) => ({ ...prev, [current.id]: pos }));
      setLandingTile(pos);
      await new Promise((r) => setTimeout(r, 320));
    }

    setLandingTile(to);
    setHint(
      nextRoom.pending
        ? `Casilla: ${BOARD_TILES[to].label}. ¡Resuelve la actividad!`
        : "Turno listo",
    );
    await new Promise((r) => setTimeout(r, 280));
    setRolling(false);
    onAnimatingChange(false);
    setLandingTile(null);
  }

  return (
    <div className="relative mx-auto min-h-[calc(100dvh-0.75rem)] w-full max-w-6xl overflow-hidden rounded-2xl">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -10%, #D4C4FF 0%, #9B8CFF 40%, #6BA0F5 100%)",
        }}
      />

      {/* Header compacto */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-2 p-2.5 sm:p-3">
        <div className="flex items-center gap-2 rounded-2xl bg-white/95 px-2.5 py-1.5 shadow-lg">
          <Image src={JUEGO_ASSETS.logoLibro} alt="" width={28} height={28} />
          <span className="hidden text-xs font-bold text-[#17164F] sm:inline">
            Exploradores
          </span>
        </div>
        <div className="max-w-[42%] truncate rounded-full bg-[#5636D9] px-3 py-1.5 text-[10px] font-bold text-white shadow sm:text-xs">
          {room.topic}
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold shadow sm:text-xs">
            <Image src={JUEGO_ASSETS.xp} alt="" width={14} height={14} />
            {me.xp}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold shadow sm:text-xs">
            <Image src={JUEGO_ASSETS.estrella} alt="" width={14} height={14} />
            {unlocked}/{TERRITORIES.length}
          </span>
          <button
            type="button"
            onClick={onLeave}
            className="rounded-full bg-white p-1.5 shadow"
            aria-label="Salir"
          >
            <Image src={JUEGO_ASSETS.salir} alt="" width={16} height={16} />
          </button>
        </div>
      </header>

      {/* Jugadores (chip horizontal en móvil / columna en desktop) */}
      <aside className="absolute left-2 top-14 z-30 hidden w-[148px] flex-col gap-1.5 md:flex">
        <div className="rounded-2xl bg-white/95 p-2 shadow-xl backdrop-blur">
          {ranked.map((p) => {
            const av =
              JUEGO_ASSETS.avatars.find((a) => a.id === p.avatarId)?.src ??
              JUEGO_ASSETS.avatars[0].src;
            const onTurn = p.id === current?.id;
            return (
              <div
                key={p.id}
                className={`mb-1 flex items-center gap-1.5 rounded-xl px-1 py-0.5 last:mb-0 ${
                  onTurn ? "bg-[#FFF6D6] ring-2 ring-[#FFC928]" : ""
                }`}
              >
                <Image
                  src={av}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-[#17164F]">
                    {p.name}
                    {p.id === leaderId ? <CrownIcon weight="fill" className="ml-1 inline h-4 w-4 align-[-2px] text-[#E0A800]" aria-label="Líder" /> : null}
                  </p>
                  <p className="text-[9px] font-semibold text-[#5B5678]">
                    {p.xp} XP
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-2xl bg-white px-2 py-1.5 text-center shadow-lg">
          <p className="text-[9px] font-bold text-[#5B5678]">Turno</p>
          <p className="text-xs font-bold text-[#5636D9]">{current?.name}</p>
        </div>
      </aside>

      {/* Misión compacta */}
      <aside className="absolute right-2 top-14 z-30 hidden w-[170px] lg:block">
        <div className="rounded-2xl bg-white/95 p-2.5 shadow-xl backdrop-blur">
          <p className="text-[9px] font-bold text-[#5636D9]">
            Misión
          </p>
          <p className="mt-0.5 text-[11px] font-bold leading-snug text-[#17164F]">
            {room.mission}
          </p>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#E8E0FF]">
            <div
              className="h-full rounded-full bg-[#2DBE70] transition-all"
              style={{
                width: `${(unlocked / TERRITORIES.length) * 100}%`,
              }}
            />
          </div>
          <p className="mt-1 text-[9px] font-semibold text-[#5B5678]">
            {unlocked}/{TERRITORIES.length} territorios
          </p>
        </div>
      </aside>

      {/* Tablero protagonista */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-1 pb-[7.5rem] pt-12 md:px-40 md:pb-28 lg:px-48">
        <GameBoard
          players={room.players}
          turnIndex={room.turnIndex}
          displayPositions={displayPositions}
          completedTiles={room.completedTiles ?? [0]}
          landingTile={landingTile}
          movingPlayerId={rolling ? current?.id : null}
          onTileClick={(i) => onTileInfo(i)}
        />
      </div>

      {/* Hint de turno */}
      <div className="absolute bottom-[6.75rem] left-1/2 z-30 w-[min(92%,420px)] -translate-x-1/2 rounded-full bg-[#17164F]/75 px-3 py-1.5 text-center text-[11px] font-semibold text-white shadow backdrop-blur sm:bottom-[6.25rem]">
        {room.pending && !rolling
          ? "Resuelve la casilla antes de volver a lanzar"
          : canControlTurn && !isMyTurn
            ? `${hint} (controlas a ${current?.name})`
            : hint}
      </div>

      {/* Controles */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-wrap items-center justify-center gap-2 p-2.5 sm:p-3">
        {/* Jugadores móvil */}
        <div className="flex max-w-full gap-1 overflow-x-auto md:hidden">
          {ranked.map((p) => {
            const av =
              JUEGO_ASSETS.avatars.find((a) => a.id === p.avatarId)?.src ??
              JUEGO_ASSETS.avatars[0].src;
            return (
              <div
                key={p.id}
                className={`flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-bold shadow ${
                  p.id === current?.id ? "ring-2 ring-[#FFC928]" : ""
                }`}
              >
                <Image
                  src={av}
                  alt=""
                  width={22}
                  height={22}
                  className="h-5 w-5 rounded-full object-cover"
                />
                {p.xp}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 rounded-2xl bg-white px-3 py-2 shadow-2xl">
          <button
            type="button"
            disabled={!canRoll}
            onClick={handleRoll}
            className="relative disabled:opacity-50"
            aria-label="Lanzar dado"
          >
            <Image
              src={JUEGO_ASSETS.dado}
              alt=""
              width={56}
              height={56}
              className={`h-12 w-12 sm:h-14 sm:w-14 ${
                rolling ? "animate-spin" : canRoll ? "hover:scale-110" : ""
              }`}
            />
            {(diceFace != null || room.dice != null) && (
              <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#5636D9] text-xs font-extrabold text-white shadow">
                {rolling && diceFace == null ? "?" : diceFace ?? room.dice}
              </span>
            )}
          </button>
          <button
            type="button"
            disabled={!canRoll}
            onClick={handleRoll}
            className="rounded-full bg-[#5636D9] px-5 py-3 text-sm font-extrabold text-white shadow-[0_6px_0_#3d2799] disabled:bg-[#6A6586] disabled:shadow-none"
          >
            {rolling
              ? "Moviendo…"
              : room.pending
                ? "Actividad pendiente"
                : canControlTurn && !isMyTurn
                  ? `Lanzar: ${current?.name}`
                  : "Lanzar dado"}
          </button>
        </div>

        <button
          type="button"
          onClick={onShowTerritories}
          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2.5 text-[11px] font-bold text-[#5636D9] shadow-lg"
        >
          <Image src={JUEGO_ASSETS.estrella} alt="" width={16} height={16} />
          Territorios
        </button>
        <button
          type="button"
          onClick={() => setShowProgress((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2.5 text-[11px] font-bold text-[#17164F] shadow-lg"
        >
          <Image src={JUEGO_ASSETS.grafico} alt="" width={16} height={16} />
          Progreso
        </button>
      </div>

      {showProgress && (
        <div className="absolute bottom-[5.5rem] left-1/2 z-40 w-[min(92%,340px)] -translate-x-1/2 rounded-2xl bg-white p-3 text-center text-[11px] font-semibold text-[#17164F] shadow-2xl">
          Misión {unlocked} de {TERRITORIES.length}. XP del equipo:{" "}
          {room.players.reduce((s, p) => s + p.xp, 0)}
        </div>
      )}

      {error && (
        <p className="absolute bottom-[5.5rem] left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#FEE2E2] px-3 py-1.5 text-[11px] font-bold text-[#B91C1C]">
          {error}
        </p>
      )}

      {/* Avatar turno móvil */}
      <div className="absolute bottom-[5.75rem] left-2 z-30 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 shadow md:hidden">
        <Image
          src={currentAv}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6 rounded-full object-cover"
        />
        <span className="text-[10px] font-bold text-[#17164F]">
          {current?.name}
        </span>
      </div>
    </div>
  );
}

function TerritoriesModal({
  unlocked,
  onClose,
}: {
  unlocked: string[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#17164F]/45 p-3 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl sm:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
              Territorios del equipo
            </h3>
            <p className="text-xs text-[#5B5678]">
              {unlocked.length}/{TERRITORIES.length} conquistados
            </p>
          </div>
          <button type="button" onClick={onClose}>
            <Image src={JUEGO_ASSETS.cerrar} alt="Cerrar" width={28} height={28} />
          </button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {TERRITORIES.map((t) => {
            const ok = unlocked.includes(t.id);
            return (
              <div
                key={t.id}
                className={`relative overflow-hidden rounded-2xl p-2 ${
                  ok ? "bg-[#ECFDF5]" : "bg-[#F3F4F6] opacity-70"
                }`}
              >
                <Image
                  src={t.image}
                  alt=""
                  width={120}
                  height={80}
                  className="mx-auto h-16 w-auto object-contain"
                />
                <p className="mt-1 text-center text-xs font-bold text-[#17164F]">
                  {t.nombre}
                </p>
                {ok ? (
                  <Image
                    src={JUEGO_ASSETS.checkVerde}
                    alt=""
                    width={20}
                    height={20}
                    className="absolute right-2 top-2"
                  />
                ) : (
                  <LockIcon weight="fill" className="absolute right-2 top-2 h-4 w-4 text-[#5B5678]" aria-label="Bloqueado" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
