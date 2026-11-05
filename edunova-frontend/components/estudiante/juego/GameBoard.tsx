"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { BOARD_TILES, tilePosition } from "./boardData";
import { JUEGO_ASSETS } from "./assets";
import type { PlayerState } from "./gameTypes";
import { CheckIcon } from "@/components/ui/icons";

type Props = {
  players: PlayerState[];
  turnIndex: number;
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
  displayPositions,
  completedTiles = [],
  landingTile = null,
  movingPlayerId,
  onTileClick,
}: Props) {
  const [hoverTile, setHoverTile] = useState<number | null>(null);

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
    const raw =
      displayPositions?.[player.id] ?? player.position;
    return raw % BOARD_TILES.length;
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[720px]">
      <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(23,22,79,0.3)]">
        {/* Cielo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg,#C4B5FD 0%,#9BB8FF 25%,#7EC8F0 50%,#6BCB77 78%,#4CAF50 100%)",
          }}
        />
        <div className="absolute left-[6%] top-[5%] h-10 w-28 rounded-full bg-white/45" />
        <div className="absolute right-[10%] top-[8%] h-8 w-20 rounded-full bg-white/35" />
        <div className="absolute left-[40%] top-[3%] h-6 w-14 rounded-full bg-white/30" />

        {/* Isla */}
        <div
          className="absolute bottom-[3%] left-1/2 h-[84%] w-[90%] -translate-x-1/2 rounded-[46%]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 35%, #93E06E 0%, #5CBF4E 60%, #388E3C 100%)",
            boxShadow:
              "0 16px 0 #2E7D32, 0 24px 36px rgba(0,0,0,0.22), inset 0 6px 16px rgba(255,255,255,0.2)",
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
            strokeWidth="5.5"
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
          {/* Flechas de sentido */}
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
                opacity="0.7"
              />
            );
          })}
        </svg>

        {/* Ciudad educativa central (compacta) */}
        <div className="absolute left-1/2 top-[46%] z-[6] w-[28%] -translate-x-1/2 -translate-y-1/2 sm:w-[26%]">
          <div className="absolute left-1/2 top-[78%] h-3 w-[80%] -translate-x-1/2 rounded-full bg-black/20 blur-md" />
          {/* Mini edificios */}
          <div className="absolute -left-[35%] bottom-[8%] flex items-end gap-0.5">
            <span className="h-5 w-3 rounded-t bg-[#A78BFA] shadow" />
            <span className="h-7 w-3.5 rounded-t bg-[#7C4DFF] shadow" />
            <span className="h-4 w-2.5 rounded-t bg-[#C4B5FD] shadow" />
          </div>
          <div className="absolute -right-[38%] bottom-[10%] flex items-end gap-0.5">
            <span className="h-6 w-3 rounded-t bg-[#4C9EFF] shadow" />
            <span className="h-4 w-2.5 rounded-t bg-[#25CFE0] shadow" />
          </div>
          <Image
            src={JUEGO_ASSETS.castillo}
            alt="Ciudad del conocimiento"
            width={160}
            height={160}
            priority
            className="relative h-auto w-full drop-shadow-xl"
          />
          {/* Jardín */}
          <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#86EFAC]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#F9A8D4]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#86EFAC]" />
          </div>
        </div>

        {/* Decoraciones ambientales (sin tapar casillas) */}
        <Image
          src={JUEGO_ASSETS.territorioBosque}
          alt=""
          width={48}
          height={48}
          className="pointer-events-none absolute left-[18%] top-[32%] z-[5] h-10 w-10 object-contain opacity-90"
        />
        <Image
          src={JUEGO_ASSETS.territorioCascada}
          alt=""
          width={44}
          height={44}
          className="pointer-events-none absolute right-[17%] top-[34%] z-[5] h-9 w-9 object-contain opacity-90"
        />
        <Image
          src={JUEGO_ASSETS.territorioMontana}
          alt=""
          width={40}
          height={40}
          className="pointer-events-none absolute right-[20%] bottom-[26%] z-[5] h-8 w-8 object-contain opacity-85"
        />
        <Image
          src={JUEGO_ASSETS.regalo}
          alt=""
          width={28}
          height={28}
          className="pointer-events-none absolute left-[22%] bottom-[28%] z-[5] h-6 w-6 object-contain opacity-80"
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
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
              style={{
                left: pos.left,
                top: pos.top,
                transform: `translate(-50%, -50%) ${
                  isHover || isLanding || isCurrentTurnTile
                    ? "scale(1.12)"
                    : "scale(1)"
                }`,
              }}
              title={tile.label}
            >
              <div
                className={`absolute left-0.5 top-1.5 h-full w-full rounded-2xl bg-black/20 blur-[1px]`}
              />
              <div
                className={`relative flex h-11 w-11 items-center justify-center rounded-2xl sm:h-[52px] sm:w-[52px] ${
                  isCurrentTurnTile || isLanding
                    ? "ring-4 ring-[#FFC928]"
                    : isCompleted
                      ? "ring-[3px] ring-[#2DBE70]/80"
                      : "ring-[3px] ring-white/85"
                }`}
                style={{
                  background: `linear-gradient(145deg, ${lighten(tile.color)} 0%, ${tile.color} 50%, ${darken(tile.color)} 100%)`,
                  boxShadow: `0 5px 0 ${darken(tile.color)}, 0 8px 14px rgba(0,0,0,0.22)`,
                  opacity: isCompleted && !isCurrentTurnTile ? 0.92 : 1,
                }}
              >
                <div className="absolute inset-x-1.5 top-0.5 h-1.5 rounded-full bg-white/35" />
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
                  <span className="absolute -bottom-5 left-1/2 z-30 w-[4.8rem] -translate-x-1/2 rounded-full bg-[#E53935] px-1 py-0.5 text-center text-[7px] font-extrabold text-white shadow sm:text-[8px]">
                    SALIDA +50
                  </span>
                )}
              </div>

              {/* Fichas */}
              {here.map((p, idx) => {
                const av =
                  JUEGO_ASSETS.avatars.find((a) => a.id === p.avatarId)?.src ??
                  JUEGO_ASSETS.avatars[0].src;
                const active = players[turnIndex]?.id === p.id;
                const moving = movingPlayerId === p.id;
                const colors = ["#5636D9", "#E85D9A", "#4C9EFF", "#FFC928", "#2DBE70", "#FF8A3D"];
                const ring = colors[players.findIndex((x) => x.id === p.id) % colors.length];
                return (
                  <div
                    key={p.id}
                    className={`absolute transition-all duration-300 ease-out ${
                      moving ? "-translate-y-3 scale-125" : ""
                    }`}
                    style={{
                      left: `${2 + idx * 11}px`,
                      top: `${-36 - idx * 5}px`,
                    }}
                  >
                    {active && (
                      <span className="absolute -inset-1.5 animate-pulse rounded-full bg-[#FFC928]/55" />
                    )}
                    {/* Base ficha */}
                    <span
                      className="absolute -bottom-0.5 left-1/2 h-2 w-7 -translate-x-1/2 rounded-full opacity-80 blur-[1px]"
                      style={{ backgroundColor: ring }}
                    />
                    <Image
                      src={av}
                      alt={p.name}
                      width={44}
                      height={44}
                      className="relative h-9 w-9 rounded-full bg-white object-cover shadow-lg sm:h-10 sm:w-10"
                      style={{ boxShadow: `0 0 0 3px ${ring}, 0 6px 12px rgba(0,0,0,0.25)` }}
                    />
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
