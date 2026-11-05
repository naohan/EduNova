"use client";

import { DiamondIcon, FireIcon } from "@/components/ui/icons";
import { estudiante } from "./data";
import { usePerfilAlumno } from "./usePerfilAlumno";

/** HU-06: racha y puntos reales del estudiante, con los datos fijos de respaldo. */
export function ResumenPuntos() {
  const perfil = usePerfilAlumno();
  const racha = perfil?.streakDays ?? estudiante.racha;
  const puntos = perfil?.leagues.masteryPoints ?? estudiante.puntos;

  return (
    <dl className="flex gap-6">
      <div className="flex items-center gap-2">
        <FireIcon weight="fill" className="h-6 w-6 text-[#E8590C]" aria-hidden />
        <div>
          <dt className="text-xs text-[#5B5678]">Racha</dt>
          <dd className="font-bold text-[#17164F]">{racha} días</dd>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DiamondIcon weight="fill" className="h-6 w-6 text-[#4C9EFF]" aria-hidden />
        <div>
          <dt className="text-xs text-[#5B5678]">Puntos</dt>
          <dd className="font-bold text-[#17164F]">{puntos.toLocaleString("es-PE")}</dd>
        </div>
      </div>
    </dl>
  );
}
