"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { soundManager } from "./soundEffects";

type Props = {
  value: number | null;
  rolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  accentColor?: string;
};

const FACE_ROTATIONS: Record<number, string> = {
  1: "rotateX(0deg) rotateY(0deg)",
  2: "rotateX(-90deg) rotateY(0deg)",
  3: "rotateX(0deg) rotateY(90deg)",
  4: "rotateX(0deg) rotateY(-90deg)",
  5: "rotateX(90deg) rotateY(0deg)",
  6: "rotateX(180deg) rotateY(0deg)",
};

export function Dice3D({ value, rolling, canRoll, onRoll, accentColor = "#5636D9" }: Props) {
  const [internalRolling, setInternalRolling] = useState(false);
  const [currentFace, setCurrentFace] = useState<number>(value ?? 1);

  useEffect(() => {
    if (rolling) {
      setInternalRolling(true);
      soundManager.playDice();
    } else {
      const timer = setTimeout(() => {
        setInternalRolling(false);
        if (value) setCurrentFace(value);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [rolling, value]);

  function handleRoll() {
    if (!canRoll || rolling || internalRolling) return;
    soundManager.init();
    soundManager.playDice();
    onRoll();
  }

  const rotationStyle = internalRolling
    ? "animate-[diceTumble_0.6s_ease-in-out_infinite]"
    : "";

  const faceTransform = !internalRolling
    ? FACE_ROTATIONS[currentFace] ?? FACE_ROTATIONS[1]
    : "rotateX(720deg) rotateY(720deg)";

  return (
    <div className="flex flex-col items-center select-none">
      {/* 3D Dice Container */}
      <div
        className="relative h-20 w-20 sm:h-24 sm:w-24 cursor-pointer [perspective:600px] group"
        onClick={handleRoll}
        title={canRoll ? "Toca para lanzar el dado" : "Espera tu turno"}
      >
        {/* Glow halo */}
        {canRoll && !internalRolling && (
          <div
            className="absolute -inset-2 rounded-2xl opacity-60 blur-md transition-all group-hover:opacity-90 animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
        )}

        <div
          className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${rotationStyle}`}
          style={{
            transform: faceTransform,
          }}
        >
          {/* Face 1: 1 pip (center) */}
          <DiceFace transform="translateZ(40px) sm:translateZ(48px)">
            <Pip center />
          </DiceFace>

          {/* Face 2: 2 pips (diagonal) */}
          <DiceFace transform="rotateX(90deg) translateZ(40px) sm:translateZ(48px)">
            <div className="flex h-full w-full justify-between p-2 sm:p-2.5">
              <Pip />
              <div className="self-end"><Pip /></div>
            </div>
          </DiceFace>

          {/* Face 3: 3 pips */}
          <DiceFace transform="rotateY(-90deg) translateZ(40px) sm:translateZ(48px)">
            <div className="flex h-full w-full justify-between p-2 sm:p-2.5">
              <Pip />
              <div className="self-center"><Pip /></div>
              <div className="self-end"><Pip /></div>
            </div>
          </DiceFace>

          {/* Face 4: 4 pips (corners) */}
          <DiceFace transform="rotateY(90deg) translateZ(40px) sm:translateZ(48px)">
            <div className="flex h-full w-full flex-col justify-between p-2 sm:p-2.5">
              <div className="flex justify-between"><Pip /><Pip /></div>
              <div className="flex justify-between"><Pip /><Pip /></div>
            </div>
          </DiceFace>

          {/* Face 5: 5 pips */}
          <DiceFace transform="rotateX(-90deg) translateZ(40px) sm:translateZ(48px)">
            <div className="relative flex h-full w-full flex-col justify-between p-2 sm:p-2.5">
              <div className="flex justify-between"><Pip /><Pip /></div>
              <div className="absolute inset-0 flex items-center justify-center"><Pip /></div>
              <div className="flex justify-between"><Pip /><Pip /></div>
            </div>
          </DiceFace>

          {/* Face 6: 6 pips */}
          <DiceFace transform="rotateX(180deg) translateZ(40px) sm:translateZ(48px)">
            <div className="flex h-full w-full justify-between p-2 sm:p-2.5">
              <div className="flex flex-col justify-between"><Pip /><Pip /><Pip /></div>
              <div className="flex flex-col justify-between"><Pip /><Pip /><Pip /></div>
            </div>
          </DiceFace>
        </div>

        {/* Shadow */}
        <div className="absolute -bottom-3 left-1/2 h-3 w-16 -translate-x-1/2 rounded-full bg-black/40 blur-sm" />
      </div>

      {/* Button & Label */}
      <button
        type="button"
        disabled={!canRoll || rolling || internalRolling}
        onClick={handleRoll}
        className={`btn-tactil mt-4 px-6 py-2.5 text-xs sm:text-sm font-black transition-all ${
          canRoll && !rolling && !internalRolling
            ? "tactil-juego"
            : "border-slate-300 bg-white/20 text-white/50 cursor-not-allowed"
        }`}
      >
        <Image
          src="/assets/juego ludico/icon_dado.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
          aria-hidden
        />
        <span>
          {internalRolling || rolling
            ? "Lanzando dado..."
            : canRoll
              ? "Lanzar dado 3D"
              : "Turno del compañero"}
        </span>
      </button>
    </div>
  );
}

function DiceFace({
  children,
  transform,
}: {
  children: React.ReactNode;
  transform: string;
}) {
  return (
    <div
      className="absolute inset-0 rounded-2xl border-2 border-white/60 bg-gradient-to-br from-white via-[#FAF7FF] to-[#E9E4F5] shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),0_6px_12px_rgba(0,0,0,0.18)]"
      style={{
        transform,
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function Pip({ center }: { center?: boolean }) {
  return (
    <div
      className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-gradient-to-br from-[#17164F] to-[#5636D9] shadow-inner ${
        center ? "mx-auto my-auto" : ""
      }`}
    />
  );
}

