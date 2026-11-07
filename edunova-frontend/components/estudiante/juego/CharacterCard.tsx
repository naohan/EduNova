"use client";

import type { ComponentType } from "react";
import Image from "next/image";
import type { CharacterClass, CharacterProfile } from "./gameTypes";
import { soundManager } from "./soundEffects";
import { BotonVoz } from "@/components/estudiante/shared/kit";
import { CheckIcon, CompassIcon, FlaskIcon, HeartIcon, LightningIcon, ShieldCheckIcon } from "@/components/ui/icons";

type Props = {
  profile: CharacterProfile;
  selected: boolean;
  onSelect: () => void;
};

type IconoProps = { className?: string; weight?: "fill" | "bold"; "aria-hidden"?: boolean };

/** La habilidad de cada personaje se reconoce por su dibujo, sin leer su nombre. */
export const iconoHabilidad: Record<CharacterClass, ComponentType<IconoProps>> = {
  aventurera: ShieldCheckIcon,
  explorador: CompassIcon,
  cientifico: FlaskIcon,
  gamer: LightningIcon,
};

export function CharacterCard({ profile, selected, onSelect }: Props) {
  const Habilidad = iconoHabilidad[profile.id];

  function handleClick() {
    soundManager.playCoin();
    onSelect();
  }

  return (
    <div
      className={`relative rounded-3xl bg-white p-3 text-center transition-shadow sm:p-4 ${
        selected ? "ring-4 ring-[#FFC928]" : "ring-1 ring-white/20"
      }`}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={selected}
        aria-label={`Elegir a ${profile.name}`}
        className="block w-full rounded-2xl"
      >
        <span className="relative mx-auto block h-28 w-28 sm:h-36 sm:w-36">
          <Image src={profile.avatarSrc} alt="" fill sizes="144px" className="object-contain" />
        </span>
        <span className="mt-1 block font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">
          {profile.name.split(" ")[0]}
        </span>
        <span className="mt-1 flex items-center justify-center gap-0.5" aria-label={`${profile.stats.vida} corazones`}>
          {Array.from({ length: profile.stats.vida }).map((_, i) => (
            <HeartIcon key={i} weight="fill" className="h-5 w-5 text-[#FF8A73]" aria-hidden />
          ))}
        </span>
        <span className="mt-2 flex items-center justify-center gap-1.5 text-sm font-bold text-[#17164F]">
          <Habilidad weight="fill" className="h-5 w-5 shrink-0 text-[#C98F00]" aria-hidden />
          {profile.activeShort}
        </span>
      </button>

      <BotonVoz
        texto={`${profile.name}. ${profile.activeDesc}`}
        etiqueta={`Escuchar a ${profile.name}`}
        className="absolute left-2 top-2 !h-10 !w-10"
      />

      {selected ? (
        <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#2DBE70] text-[#17164F]">
          <CheckIcon weight="bold" className="h-5 w-5" aria-hidden />
        </span>
      ) : null}
    </div>
  );
}
