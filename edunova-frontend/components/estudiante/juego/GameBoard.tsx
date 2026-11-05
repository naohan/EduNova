"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { BOARD_TILES, GAME_LEVELS, tilePosition } from "./boardData";
import { JUEGO_ASSETS } from "./assets";
import type { PlayerState } from "./gameTypes";
import { CheckIcon } from "@/components/ui/icons";

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
    <div className="relative mx-auto aspect-square w-full max-w-[720px] select-none">
      <div className="absolute inset-0 overflow-hidden rounded-3xl shadow-[0_24px_60px_rgba(23,22,79,0.45)] border-4 border-white/20">
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
            <div className="absolute top-[8%] left-[12%] h-1.5 w-1.5 rounded-full bg-white animate-ping" />
            <div className="absolute top-[14%] right-[22%] h-2 w-2 rounded-full bg-[#FFC928] animate-pulse" />
            <div className="absolute top-[22%] left-[45%] h-1 w-1 rounded-full bg-white" />
            <div className="absolute top-[6%] right-[10%] h-1.5 w-1.5 rounded-full bg-white" />
            <div className="absolute top-[28%] left-[18%] h-2 w-2 rounded-full bg-[#25CFE0] animate-pulse" />
            <div className="absolute top-[32%] right-[15%] h-1.5 w-1.5 rounded-full bg-white animate-ping" />
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
        />

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
        <div className="absolute left-1/2 top-[47%] z-[6] w-[34%] -translate-x-1/2 -translate-y-1/2 sm:w-[30%] text-center">
          {/* Level Header Pill */}
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-[10px] sm:text-xs font-black text-white shadow-lg backdrop-blur-md border border-white/20">
            <span>{levelConfig.badge}</span>
            <span className="truncate max-w-[140px] sm:max-w-none">{levelConfig.name.split(":")[0]}</span>
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
          <div className="mt-1 flex items-center justify-center gap-1 rounded-full bg-white/90 px-2 py-0.5 shadow-md">
            <Image
              src={JUEGO_ASSETS.robot}
              alt="Cosmo"
              width={20}
              height={20}
              className="h-4 w-4 object-contain animate-bounce"
            />
            <span className="text-[9px] font-extrabold text-[#17164F]">
              Misión Activa
            </span>
          </div>
        </div>

        {/* Ambient landmarks */}
        <Image
          src={JUEGO_ASSETS.territorioBosque}
          alt=""
          width={48}
          height={48}
          className="pointer-events-none absolute left-[16%] top-[30%] z-[5] h-11 w-11 object-contain opacity-90 drop-shadow"
        />
        <Image
          src={JUEGO_ASSETS.territorioCascada}
          alt=""
          width={44}
          height={44}
          className="pointer-events-none absolute right-[15%] top-[32%] z-[5] h-10 w-10 object-contain opacity-90 drop-shadow"
        />
        <Image
          src={JUEGO_ASSETS.territorioMontana}
          alt=""
          width={40}
          height={40}
          className="pointer-events-none absolute right-[18%] bottom-[25%] z-[5] h-9 w-9 object-contain opacity-85 drop-shadow"
        />
        <Image
          src={JUEGO_ASSETS.regalo}
          alt=""
          width={28}
          height={28}
          className="pointer-events-none absolute left-[20%] bottom-[26%] z-[5] h-7 w-7 object-contain opacity-90 drop-shadow"
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

          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => onTileClick?.(i)}
              onMouseEnter={() => setHoverTile(i)}
              onMouseLeave={() => setHoverTile(null)}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 focus:outline-none"
              style={{
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

              {/* 3D Tile Face */}
              <div
                className={`relative flex h-11 w-11 items-center justify-center rounded-2xl sm:h-[52px] sm:w-[52px] transition-all ${
                  isCurrentTurnTile || isLanding
                    ? "ring-4 ring-[#FFC928] animate-pulse"
                    : isCompleted
                      ? "ring-[3px] ring-[#2DBE70]/80"
                      : "ring-[3px] ring-white/90"
                }`}
                style={{
                  background: `linear-gradient(145deg, ${lighten(tile.color)} 0%, ${tile.color} 50%, ${darken(tile.color)} 100%)`,
                  boxShadow: `0 6px 0 ${darken(tile.color)}, 0 10px 18px rgba(0,0,0,0.3)`,
                  opacity: isCompleted && !isCurrentTurnTile ? 0.95 : 1,
                }}
              >
                <div className="absolute inset-x-1.5 top-0.5 h-1.5 rounded-full bg-white/40" />
                <Image
                  src={tile.icon}
                  alt=""
                  width={28}
                  height={28}
                  className="relative h-6 w-6 object-contain drop-shadow sm:h-7 sm:w-7"
                />

                {isCompleted && !isCurrentTurnTile && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2DBE70] text-[8px] font-bold text-white shadow">
                    <CheckIcon weight="bold" className="h-4 w-4" aria-label="Superada" />
                  </span>
                )}

                {isSalida && (
                  <span className="absolute -bottom-5 left-1/2 z-30 w-[4.8rem] -translate-x-1/2 rounded-full bg-[#E53935] px-1 py-0.5 text-center text-[7px] font-extrabold text-white shadow-md sm:text-[8px] tracking-wide">
                    SALIDA +50
                  </span>
                )}
              </div>

              {/* Fichas de Jugadores con Vidas y Nombres Flotantes */}
              {here.map((p, idx) => {
                const av =
                  JUEGO_ASSETS.avatars.find((a) => a.id === p.avatarId)?.src ??
                  JUEGO_ASSETS.avatars[0].src;
                const active = players[turnIndex]?.id === p.id;
                const moving = movingPlayerId === p.id;
                const colors = ["#5636D9", "#E85D9A", "#4C9EFF", "#FFC928", "#2DBE70", "#FF8A3D"];
                const ring = colors[players.findIndex((x) => x.id === p.id) % colors.length];
                const playerLives = p.lives ?? 3;

                return (
                  <div
                    key={p.id}
                    className={`absolute z-30 transition-all duration-300 ease-out ${
                      moving ? "-translate-y-4 scale-125" : ""
                    }`}
                    style={{
                      left: `${2 + idx * 12}px`,
                      top: `${-44 - idx * 7}px`,
                    }}
                  >
                    {/* Active Turn Halo */}
                    {active && (
                      <span className="absolute -inset-2 animate-ping rounded-full bg-[#FFC928]/40" />
                    )}

                    {/* Ficha Base */}
                    <span
                      className="absolute -bottom-1 left-1/2 h-2.5 w-8 -translate-x-1/2 rounded-full opacity-80 blur-[1px]"
                      style={{ backgroundColor: ring }}
                    />

                    {/* Floating Health Badge (❤️❤️❤️) over token */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full bg-black/70 px-1.5 py-0.2 shadow-md border border-white/30 text-[9px]">
                      {Array.from({ length: p.maxLives ?? 3 }).map((_, lIdx) => (
                        <span
                          key={lIdx}
                          className={lIdx < playerLives ? "opacity-100" : "opacity-30 grayscale"}
                        >
                          ❤️
                        </span>
                      ))}
                    </div>

                    {/* Turn Crown */}
                    {active && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs animate-bounce drop-shadow">
                        👑
                      </span>
                    )}

                    {/* Avatar Token */}
                    <Image
                      src={av}
                      alt={p.name}
                      width={44}
                      height={44}
                      className="relative h-10 w-10 rounded-full bg-white object-cover shadow-xl sm:h-11 sm:w-11"
                      style={{
                        boxShadow: `0 0 0 3px ${ring}, 0 8px 16px rgba(0,0,0,0.35)`,
                      }}
                    />

                    {/* Mini Name Badge */}
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white/95 px-1 text-[8px] font-black text-[#17164F] shadow">
                      {p.name.slice(0, 8)}
                    </span>
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
