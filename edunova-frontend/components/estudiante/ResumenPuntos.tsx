"use client";

import { DiamondIcon, FireIcon } from "@/components/ui/icons";
import { estudiante } from "./data";
import { usePerfilAlumno } from "./usePerfilAlumno";

/** HU-06: racha y puntos del estudiante alineados a los tokens de la sección Juego. */
export function ResumenPuntos() {
  const perfil = usePerfilAlumno();
  const racha = perfil?.streakDays ?? estudiante.racha;
  const puntos = perfil?.leagues.masteryPoints ?? estudiante.puntos;

  return (
    <dl className="flex items-center gap-2.5">
      <div className="flex items-center gap-2 rounded-xl border border-[#C98F00]/30 border-b-2 border-b-[#C98F00] bg-[#FFF6D6] px-3 py-1.5 text-[#17164F]">
        <FireIcon weight="fill" className="h-5 w-5 text-[#C98F00]" aria-hidden />
        <div>
          <dt className="sr-only">Racha de días</dt>
          <dd className="text-sm font-extrabold leading-none">
            {racha} <span className="text-xs font-semibold text-[#17164F]/75">días</span>
          </dd>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-[#C98F00]/30 border-b-2 border-b-[#C98F00] bg-[#FFF6D6] px-3 py-1.5 text-[#17164F]">
        <DiamondIcon weight="fill" className="h-5 w-5 text-[#C98F00]" aria-hidden />
        <div>
          <dt className="sr-only">Puntos NovaCoins</dt>
          <dd className="text-sm font-extrabold leading-none">
            {puntos.toLocaleString("es-PE")} <span className="text-xs font-semibold text-[#17164F]/75">pts</span>
          </dd>
        </div>
      </div>
    </dl>
  );
}
