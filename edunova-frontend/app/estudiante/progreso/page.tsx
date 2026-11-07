"use client";

import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { estudiante, unidadesProgreso, competencias, reforzar } from "@/components/estudiante/data";
import { BotonSalir } from "@/components/estudiante/shared/kit";
import { usePerfilAlumno } from "@/components/estudiante/usePerfilAlumno";
import { TargetIcon } from "@/components/ui/icons";

function Barra({ nombre, pct, color }: { nombre: string; pct: number; color: string }) {
  return (
    <li>
      <div className="mb-1 flex justify-between gap-3 font-bold text-[#17164F]">
        <span className="min-w-0 truncate">{nombre}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#E8E0FF]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </li>
  );
}

export default function Page() {
  const perfil = usePerfilAlumno();
  const pct = perfil?.overallProgressPercent ?? estudiante.progresoTotal;
  const circ = 2 * Math.PI * 45;
  const dash = (pct / 100) * circ;

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5 flex items-center justify-between gap-3">
          <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">Mi progreso</h1>
          <BotonSalir href="/estudiante/logros" etiqueta="Volver al perfil" />
        </header>

        <div className="relative mx-auto h-44 w-44">
          <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label={`${pct}% completado`}>
            <circle cx="60" cy="60" r="45" fill="none" stroke="#E3F8EC" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#2DBE70"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-fredoka)] text-4xl font-bold text-[#17164F]">
            {pct}%
          </span>
        </div>

        <ul className="mt-6 space-y-4 rounded-2xl bg-white p-4">
          {unidadesProgreso.map((u) => (
            <Barra key={u.nombre} nombre={u.nombre} pct={u.pct} color="#2DBE70" />
          ))}
        </ul>

        {reforzar.length ? (
          <Link href="/estudiante/flashcards" className="card-tactil tactil-refuerzo-suave mt-4 items-center gap-3 p-4">
            <TargetIcon weight="fill" className="h-8 w-8 shrink-0 text-[#D9583F]" aria-hidden />
            <span className="min-w-0 flex-1 font-bold text-[#17164F]">{reforzar[0]}</span>
          </Link>
        ) : null}

        <details className="mt-4 rounded-2xl bg-white p-4">
          <summary className="cursor-pointer font-bold text-[#17164F]">Mis competencias</summary>
          <ul className="mt-3 space-y-4">
            {competencias.map((c) => (
              <Barra key={c.nombre} nombre={c.nombre} pct={c.pct} color="#5636D9" />
            ))}
          </ul>
        </details>
      </div>
    </EstudianteLayout>
  );
}
