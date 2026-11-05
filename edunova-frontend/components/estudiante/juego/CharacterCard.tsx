"use client";

import Image from "next/image";
import type { CharacterProfile } from "./gameTypes";
import { soundManager } from "./soundEffects";
import { HeartIcon } from "@/components/ui/icons";

type Props = {
  profile: CharacterProfile;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
};

export function CharacterCard({ profile, selected, onSelect, compact = false }: Props) {
  function handleClick() {
    soundManager.playCoin();
    onSelect();
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-3 rounded-2xl p-2.5 transition-all text-left ${
          selected
            ? "bg-white text-[#17164F] shadow-lg ring-2 ring-[#FFC928]"
            : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        <div
          className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl p-1"
          style={{ backgroundColor: `${profile.color}25` }}
        >
          <Image
            src={profile.avatarSrc}
            alt={profile.name}
            fill
            className="object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-bold">{profile.name}</span>
            <span className="text-[10px] text-[#FFC928]">❤️x{profile.stats.vida}</span>
          </div>
          <p className="truncate text-[10px] opacity-75">{profile.archetype}</p>
        </div>
      </button>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`relative cursor-pointer overflow-hidden rounded-2xl border-2 transition-all duration-200 select-none ${
        selected
          ? "border-[#FFC928] bg-white shadow-2xl scale-[1.02] ring-4 ring-[#FFC928]/30"
          : "border-white/15 bg-white/95 hover:border-white/40 hover:scale-[1.01]"
      }`}
    >
      {/* Top Banner with Archetype & Hearts */}
      <div
        className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-white"
        style={{ backgroundColor: profile.color }}
      >
        <span className="flex items-center gap-1 tracking-wider uppercase text-[11px]">
          <span>{profile.archetype}</span>
        </span>
        <div className="flex items-center gap-0.5" title={`Vidas: ${profile.stats.vida}`}>
          {Array.from({ length: profile.stats.vida }).map((_, i) => (
            <HeartIcon key={i} weight="fill" className="h-3.5 w-3.5 text-white" aria-hidden />
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Avatar Display with Glow */}
        <div className="relative mx-auto my-2 h-28 w-28 sm:h-32 sm:w-32">
          <div
            className="absolute inset-2 rounded-full opacity-30 blur-md"
            style={{ backgroundColor: profile.color }}
          />
          <Image
            src={profile.avatarSrc}
            alt={profile.name}
            fill
            className="object-contain drop-shadow-md transition-transform group-hover:scale-105"
          />
          {selected && (
            <div className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#127A43] text-white shadow-md">
              ✓
            </div>
          )}
        </div>

        {/* Character Name & Role */}
        <div className="text-center">
          <h3 className="font-[family-name:var(--font-fredoka)] text-base sm:text-lg font-bold text-[#17164F]">
            {profile.name}
          </h3>
          <p className="text-xs font-semibold text-[#5636D9]">
            {profile.archetype}
          </p>
        </div>

        {/* Stat Bars */}
        <div className="mt-3 space-y-1.5 rounded-xl bg-[#F7F4FF] p-2.5 text-[11px]">
          <StatRow label="Lógica" value={profile.stats.logica} color="#5636D9" />
          <StatRow label="Energía" value={profile.stats.energia} color="#FF8A3D" />
          <StatRow label="Cooperación" value={profile.stats.cooperacion} color="#2DBE70" />
        </div>

        {/* Abilities */}
        <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2.5">
          <div className="flex items-start gap-1.5 text-left">
            <span className="text-xs">⚡</span>
            <div>
              <p className="text-[11px] font-bold text-[#17164F]">
                {profile.passiveName}{" "}
                <span className="font-normal text-[10px] text-[#5B5678]">(Pasiva)</span>
              </p>
              <p className="text-[10px] leading-tight text-[#5B5678]">
                {profile.passiveDesc}
              </p>
            </div>
          </div>
          <div className="flex flex-col text-left">
            <p className="text-[11px] font-bold text-[#17164F]">
              {profile.activeName}{" "}
              <span className="font-semibold text-[10px] text-[#D9583F]">(Habilidad Activa)</span>
            </p>
            <p className="text-[10px] leading-tight text-[#5B5678]">
              {profile.activeDesc}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`mt-3.5 w-full rounded-full py-2 text-xs font-bold transition-all ${
            selected
              ? "bg-[#17164F] text-[#FFC928] shadow-md"
              : "bg-[#F2EEFF] text-[#5636D9] hover:bg-[#5636D9] hover:text-white"
          }`}
        >
          {selected ? "✓ Seleccionado" : "Elegir Personaje"}
        </button>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="w-16 font-semibold text-[#5B5678]">{label}</span>
      <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(value / 5) * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-3 text-right font-bold text-[#17164F]">{value}</span>
    </div>
  );
}

