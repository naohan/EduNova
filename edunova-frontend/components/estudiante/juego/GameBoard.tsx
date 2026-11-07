"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { BOARD_TILES, GAME_LEVELS, tilePosition } from "./boardData";
import { JUEGO_ASSETS } from "./assets";
import type { PlayerState } from "./gameTypes";
import { CheckIcon, CrownIcon, HeartIcon } from "@/components/ui/icons";

type Props = {
  players: PlayerState[];
  turnIndex: number;
  currentLevel?: number;
  /** Posiciones visuales (durante animación) */
  displayPositions?: Record<string, number>;
  completedTiles?: number[];
  landingTile?: number | null;
  movingPlayerId?: string | null;
  onTileClick?: (tileIndex: number) => void;
};

// Fichas sobre la casilla, en px desde su centro. El tamaño baja con la cantidad para que nunca se tapen,
// y van encima y no arriba de la casilla: en la fila superior se saldrían del tablero.
const RANURAS_POR_CANTIDAD: Record<number, { tamano: number; lugares: Array<{ x: number; y: number }> }> = {
  1: { tamano: 38, lugares: [{ x: 0, y: -4 }] },
  2: {
    tamano: 32,
    lugares: [
      { x: -17, y: 0 },
      { x: 17, y: 0 },
    ],
  },
  3: {
    tamano: 28,
    lugares: [
      { x: -15, y: -14 },
      { x: 15, y: -14 },
      { x: 0, y: 15 },
    ],
  },
  4: {
    tamano: 28,
    lugares: [
      { x: -15, y: -15 },
      { x: 15, y: -15 },
      { x: -15, y: 15 },
      { x: 15, y: 15 },
    ],
  },
};

export function GameBoard({
  players,
  turnIndex,
  currentLevel = 1,
  displayPositions,
  completedTiles = [],
  landingTile = null,
  movingPlayerId,
  onTileClick,
}: Props) {
  const [hoverTile, setHoverTile] = useState<number | null>(null);

  const levelConfig = useMemo(() => {
    return GAME_LEVELS.find((l) => l.level === currentLevel) ?? GAME_LEVELS[0];
  }, [currentLevel]);

  const pathPoints = useMemo(() => {
    return BOARD_TILES.map((_, i) => {
      const p = tilePosition(i);
      return {
        x: parseFloat(p.left),
        y: parseFloat(p.top),
      };
    });
  }, []);

  const pathD = useMemo(() => {
    if (!pathPoints.length) return "";
    const pts = [...pathPoints, pathPoints[0]];
    return pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  }, [pathPoints]);

  function posOf(player: PlayerState) {
    const raw = displayPositions?.[player.id] ?? player.position;
    return raw % BOARD_TILES.length;
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[max(240px,min(620px,calc(100dvh-372px)))] select-none lg:max-w-[max(240px,min(620px,calc(100dvh-172px)))]">
      <div className="absolute inset-0 overflow-hidden rounded-3xl border-4 border-white/20 shadow-[0_24px_60px_rgba(23,22,79,0.45)]">
        {/* Dynamic Sky Environment by Level */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: levelConfig.skyGradient,
          }}
        />

        {/* Twinkling Stars (Levels 2, 3, 4) */}
        {levelConfig.starsOpacity > 0 && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-700"
            style={{ opacity: levelConfig.starsOpacity }}
          >
            <div className="absolute left-[12%] top-[8%] h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            <div className="absolute right-[22%] top-[14%] h-2 w-2 rounded-full bg-[#FFC928] animate-pulse" />
            <div className="absolute left-[45%] top-[22%] h-1 w-1 rounded-full bg-white" />
            <div className="absolute right-[10%] top-[6%] h-1.5 w-1.5 rounded-full bg-white" />
            <div className="absolute left-[18%] top-[28%] h-2 w-2 rounded-full bg-[#25CFE0] animate-pulse" />
            <div className="absolute right-[15%] top-[32%] h-1.5 w-1.5 rounded-full bg-white animate-ping" />
          </div>
        )}

        {/* Floating Clouds */}
        <div className="absolute left-[6%] top-[5%] h-10 w-28 rounded-full bg-white/35 blur-[1px] animate-[floatCloud_8s_ease-in-out_infinite]" />
        <div className="absolute right-[10%] top-[8%] h-8 w-20 rounded-full bg-white/25 blur-[1px]" />
        <div className="absolute left-[40%] top-[3%] h-6 w-14 rounded-full bg-white/20 blur-[1px]" />

        {/* Dynamic Island by Level */}
        <div
          className="absolute bottom-[3%] left-1/2 h-[84%] w-[90%] -translate-x-1/2 rounded-[46%] transition-all duration-1000"
          style={{
            background: levelConfig.islandGradient,
            boxShadow:
              "0 20px 0 rgba(0,0,0,0.3), 0 30px 45px rgba(0,0,0,0.35), inset 0 8px 24px rgba(255,255,255,0.25)",
          }}
        >
          {/* Mosaico de adoquines de la Plaza del Dado */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[46%] opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(#FFC928 15%, transparent 16%), radial-gradient(#38BDF8 15%, transparent 16%)",
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 12px 12px",
            }}
          />
        </div>

        {/* Banderines festivos en SVG sobre la plaza */}
        <svg
          className="pointer-events-none absolute inset-x-0 top-[2.5%] z-[5] h-10 w-full"
          viewBox="0 0 400 36"
          preserveAspectRatio="none"
        >
          <path
            d="M 20 6 Q 200 30 380 6"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.5"
          />
          <polygon points="50,11 64,13 57,25" fill="#EF4444" />
          <polygon points="95,16 109,18 102,30" fill="#FFC928" />
          <polygon points="140,21 154,22 147,34" fill="#3B82F6" />
          <polygon points="192,23 206,23 199,35" fill="#10B981" />
          <polygon points="244,22 258,21 251,34" fill="#F97316" />
          <polygon points="290,18 304,16 297,29" fill="#8B5CF6" />
          <polygon points="334,13 348,11 341,24" fill="#EC4899" />
        </svg>

        {/* Camino base (anillo de tierra) */}
        <svg
          className="pointer-events-none absolute inset-0 z-[4] h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d={pathD}
            fill="none"
            stroke="#D4A574"
            strokeWidth="5.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
          <path
            d={pathD}
            fill="none"
            stroke="#F5E6C8"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1.2 1.6"
            opacity="0.9"
          />
          {/* Marcadores de flujo */}
          {pathPoints.map((p, i) => {
            const next = pathPoints[(i + 1) % pathPoints.length];
            const mx = (p.x + next.x) / 2;
            const my = (p.y + next.y) / 2;
            return (
              <circle
                key={`dot-${i}`}
                cx={mx}
                cy={my}
                r="0.55"
                fill="#FFFFFF"
                opacity="0.8"
              />
            );
          })}
        </svg>

        {/* Centro del Tablero: Ciudad & Mascota Robot & Nivel */}
        <div className="absolute left-1/2 top-[47%] z-[6] w-[34%] -translate-x-1/2 -translate-y-1/2 text-center sm:w-[30%]">
          {/* Level Header Pill sin cortes de texto */}
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#17164F]/85 px-3 py-1 text-xs font-black text-white shadow-lg backdrop-blur-md">
            <span className="hidden whitespace-nowrap sm:inline">{levelConfig.badge}</span>
            <span className="whitespace-nowrap">{`Nivel ${currentLevel}`}</span>
          </div>

          <div className="relative mx-auto w-full">
            <div className="absolute left-1/2 top-[80%] h-4 w-[85%] -translate-x-1/2 rounded-full bg-black/35 blur-md" />
            <Image
              src={JUEGO_ASSETS.castillo}
              alt="Ciudad del conocimiento"
              width={160}
              height={160}
              priority
              className="relative mx-auto h-auto w-full drop-shadow-2xl"
            />
          </div>

          {/* Cheering Robot Mascot Mini */}
          <Image
            src={JUEGO_ASSETS.robot}
            alt="Cosmo"
            width={28}
            height={28}
            className="mx-auto -mt-2 h-6 w-6 animate-bounce object-contain motion-reduce:animate-none sm:h-7 sm:w-7"
          />
        </div>

        {/* Ambient landmarks */}
        <Image
          src={JUEGO_ASSETS.territorioBosque}
          alt=""
          width={48}
          height={48}
          className="pointer-events-none absolute left-[16%] top-[30%] z-[5] h-10 w-10 object-contain opacity-90 drop-shadow sm:h-11 sm:w-11"
        />
        <Image
          src={JUEGO_ASSETS.territorioCascada}
          alt=""
          width={44}
          height={44}
          className="pointer-events-none absolute right-[15%] top-[32%] z-[5] h-9 w-9 object-contain opacity-90 drop-shadow sm:h-10 sm:w-10"
        />
        <Image
          src={JUEGO_ASSETS.territorioMontana}
          alt=""
          width={40}
          height={40}
          className="pointer-events-none absolute bottom-[25%] right-[18%] z-[5] h-8 w-8 object-contain opacity-85 drop-shadow sm:h-9 sm:w-9"
        />
        <Image
          src={JUEGO_ASSETS.regalo}
          alt=""
          width={28}
          height={28}
          className="pointer-events-none absolute bottom-[26%] left-[20%] z-[5] h-6 w-6 object-contain opacity-90 drop-shadow sm:h-7 sm:w-7"
        />

        {/* Casillas */}
        {BOARD_TILES.map((tile, i) => {
          const pos = tilePosition(i);
          const here = players.filter((p) => posOf(p) === i);
          const isCurrentTurnTile =
            players[turnIndex] && posOf(players[turnIndex]) === i;
          const isCompleted = completedTiles.includes(i);
          const isLanding = landingTile === i;
          const isHover = hoverTile === i;
          const isSalida = tile.kind === "salida";

          const cantJugadores = Math.min(4, Math.max(1, here.length));
          const { tamano, lugares } = RANURAS_POR_CANTIDAD[cantJugadores];
          const conDetalle = cantJugadores <= 2; // con 3 o 4 fichas, corazones y nombre se pisarían

          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => onTileClick?.(i)}
              onMouseEnter={() => setHoverTile(i)}
              onMouseLeave={() => setHoverTile(null)}
              className="absolute transition-transform duration-200 focus:outline-none"
              style={{
                // En las esquinas coinciden dos casillas: arriba va la que tiene fichas, y si no, Salida.
                zIndex: here.length > 0 ? 25 : isSalida ? 22 : 20,
                left: pos.left,
                top: pos.top,
                transform: `translate(-50%, -50%) ${
                  isHover || isLanding || isCurrentTurnTile
                    ? "scale(1.15)"
                    : "scale(1)"
                }`,
              }}
              title={tile.label}
            >
              {/* Tile shadow */}
              <div className="absolute left-0.5 top-1.5 h-full w-full rounded-2xl bg-black/25 blur-[1.5px]" />

              {/* Destello del color de la casilla al aterrizar */}
              {isLanding && (
                <span
                  className="pointer-events-none absolute -inset-2.5 rounded-2xl animate-ping motion-reduce:hidden"
                  style={{ backgroundColor: tile.color, opacity: 0.7 }}
                />
              )}

              {/* 3D Tile Face con relieve táctil inferior */}
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all sm:h-12 sm:w-12 ${
                  isCurrentTurnTile || isLanding
                    ? "ring-4 ring-[#FFC928] animate-pulse"
                    : isCompleted
                      ? "ring-[3px] ring-[#2DBE70]/80"
                      : "ring-[3px] ring-white/90"
                }`}
                style={{
                  background: `linear-gradient(145deg, ${lighten(tile.color)} 0%, ${tile.color} 50%, ${darken(tile.color)} 100%)`,
                  boxShadow: `0 6px 0 ${darken(tile.color)}, 0 10px 18px rgba(0,0,0,0.32)`,
                  opacity: isCompleted && !isCurrentTurnTile ? 0.95 : 1,
                }}
              >
                <div className="absolute inset-x-1.5 top-0.5 h-1.5 rounded-full bg-white/40" />
                <Image
                  src={tile.icon}
                  alt=""
                  width={28}
                  height={28}
                  className="relative h-5 w-5 object-contain drop-shadow sm:h-6 sm:w-6"
                />

                {isCompleted && !isCurrentTurnTile && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2DBE70] text-[8px] font-bold text-white shadow">
                    <CheckIcon weight="bold" className="h-4 w-4" aria-label="Superada" />
                  </span>
                )}

                {isSalida && (
                  <span className="absolute -bottom-3 left-1/2 z-30 w-[3.6rem] -translate-x-1/2 rounded-full bg-[#E53935] px-1 py-0.5 text-center text-[7px] font-extrabold tracking-wide text-white shadow-md sm:text-[8px]">
                    SALIDA +50
                  </span>
                )}
              </div>

              {/* Fichas de Jugadores en Ranuras Anti-Solapamiento con Salto Parabólico */}
              {here.map((p, idx) => {
                const av =
                  JUEGO_ASSETS.avatars.find((a) => a.id === p.avatarId)?.src ??
                  JUEGO_ASSETS.avatars[0].src;
                const active = players[turnIndex]?.id === p.id;
                const moving = movingPlayerId === p.id;
                const colors = ["#5636D9", "#E85D9A", "#4C9EFF", "#FFC928", "#2DBE70", "#FF8A3D"];
                const ring = colors[players.findIndex((x) => x.id === p.id) % colors.length];
                const playerLives = p.lives ?? 3;
                const slot = lugares[idx] ?? lugares[0];

                return (
                  <div
                    key={p.id}
                    className="absolute z-30"
                    style={{
                      width: tamano,
                      height: tamano,
                      left: `calc(50% + ${slot.x}px)`,
                      top: `calc(50% + ${slot.y}px)`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {/* Active Turn Halo Pulsante Dorado */}
                    {active && (
                      <>
                        <span className="pointer-events-none absolute -inset-2.5 animate-ping rounded-full bg-[#FFC928]/40 motion-reduce:hidden" />
                        <span className="pointer-events-none absolute -inset-1.5 animate-pulse rounded-full border-2 border-[#FFC928] bg-[#FFC928]/25 shadow-[0_0_12px_#FFC928]" />
                      </>
                    )}

                    {/* Sombra inferior que responde a la elevación del salto */}
                    <span
                      className={`absolute -bottom-1 left-1/2 h-2.5 w-7 -translate-x-1/2 rounded-full blur-[1px] transition-all duration-200 ${
                        moving
                          ? "scale-50 opacity-30"
                          : "opacity-80"
                      }`}
                      style={{ backgroundColor: ring }}
                    />

                    {/* La ficha se vuelve a montar en cada casilla: la animación corre una vez por paso */}
                    <div className={`relative h-full w-full ${moving ? "animate-[saltoFicha_260ms_ease-out] motion-reduce:animate-none" : ""}`}>
                      {/* Floating Health Badge over token */}
                      {conDetalle ? (
                        <div className="absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-px rounded-full border border-white/30 bg-black/75 px-1 text-[8px]">
                          {Array.from({ length: p.maxLives ?? 3 }).map((_, lIdx) => (
                            <HeartIcon
                              key={lIdx}
                              weight="fill"
                              className={`h-2 w-2 ${lIdx < playerLives ? "text-[#FF8A73]" : "text-white/20"}`}
                              aria-hidden
                            />
                          ))}
                        </div>
                      ) : null}

                      {/* Turn Crown */}
                      {active && conDetalle && (
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce text-[#FFC928] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] motion-reduce:animate-none">
                          <CrownIcon weight="fill" className="h-4 w-4" aria-hidden />
                        </span>
                      )}

                      {/* Avatar Token */}
                      <Image
                        src={av}
                        alt={p.name}
                        width={44}
                        height={44}
                        className="relative h-full w-full rounded-full bg-white object-cover shadow-xl"
                        style={{
                          boxShadow: `0 0 0 3px ${ring}, 0 6px 14px rgba(0,0,0,0.35)`,
                        }}
                      />

                      {/* Mini Name Badge */}
                      {conDetalle ? (
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white/95 px-1 text-[8px] font-black text-[#17164F] shadow">
                          {p.name.slice(0, 7)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function darken(hex: string) {
  const n = hex.replace("#", "");
  const r = Math.max(0, parseInt(n.slice(0, 2), 16) - 42);
  const g = Math.max(0, parseInt(n.slice(2, 4), 16) - 42);
  const b = Math.max(0, parseInt(n.slice(4, 6), 16) - 42);
  return `rgb(${r},${g},${b})`;
}

function lighten(hex: string) {
  const n = hex.replace("#", "");
  const r = Math.min(255, parseInt(n.slice(0, 2), 16) + 48);
  const g = Math.min(255, parseInt(n.slice(2, 4), 16) + 48);
  const b = Math.min(255, parseInt(n.slice(4, 6), 16) + 48);
  return `rgb(${r},${g},${b})`;
}
