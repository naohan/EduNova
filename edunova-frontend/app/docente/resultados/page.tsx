"use client";

import { useState } from "react";
import Link from "next/link";
import { DocenteLayout } from "@/components/docente/DocenteLayout";
import { EstadoBadge, ProgressBar } from "@/components/docente/ui";
import { classInfo, estudiantes } from "@/components/docente/data";

const cursos = ["Matemática", "Comunicación", "Ciencia"];
const temas = ["Fracciones", "Decimales", "Proporciones", "Porcentajes"];
const periodos = ["III Bimestre", "II Bimestre", "I Bimestre"];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function pctBadge(progreso: number) {
  if (progreso >= 80) return "bg-[#D1FAE5] text-[#065F46]";
  if (progreso >= 55) return "bg-[#FEF3C7] text-[#92400E]";
  return "bg-[#FEE2E2] text-[#991B1B]";
}

export default function Page() {
  const [curso, setCurso] = useState(cursos[0]);
  const [tema, setTema] = useState(temas[0]);
  const [periodo, setPeriodo] = useState(periodos[0]);

  return (
    <DocenteLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {/* Mobile header */}
        <div className="mb-4 flex items-center gap-2 lg:hidden">
          <Link href="/docente" className="text-lg text-[#5636D9]" aria-label="Volver">
            ‹
          </Link>
          <h1 className="flex-1 text-center font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            Resultados por curso
          </h1>
          <span className="w-5" />
        </div>

        <header className="mb-6 hidden lg:block">
          <p className="text-sm text-[#5B5678]">Resultados por curso</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Estudiantes y resultados
          </h1>
          <p className="mt-1 text-[#5B5678]">
            {classInfo.curso}, {classInfo.grado}
          </p>
        </header>

        {/* Filters */}
        <div className="mb-4 space-y-3 lg:grid lg:grid-cols-3 lg:gap-3 lg:space-y-0">
          <Field label="Curso" value={curso} onChange={setCurso} options={cursos} />
          <Field label="Tema" value={tema} onChange={setTema} options={temas} />
          <Field label="Periodo" value={periodo} onChange={setPeriodo} options={periodos} />
        </div>

        {/* Mobile list — percentage pills like mockup */}
        <div className="overflow-hidden rounded-2xl border border-[#E8E0FF] bg-white lg:hidden">
          {estudiantes.map((e, i) => (
            <Link
              key={e.id}
              href={`/docente/estudiante/${e.id}`}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                i < estudiantes.length - 1 ? "border-b border-[#F2EEFF]" : ""
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5636D9] text-xs font-bold text-white">
                {initials(e.nombre)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-[#17164F]">{e.nombre}</div>
                <div className="text-sm text-[#5B5678]">{Math.round(e.nota)}/20</div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${pctBadge(e.progreso)}`}
              >
                {e.progreso}%
              </span>
              <span className="text-[#C4B5FD]">›</span>
            </Link>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-2xl border border-[#E8E0FF] bg-white lg:block">
          <table className="w-full text-sm">
            <thead className="bg-[#F2EEFF] text-[#5B5678]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Estudiante</th>
                <th className="px-4 py-3 text-left font-semibold">Promedio</th>
                <th className="px-4 py-3 text-left font-semibold">Progreso</th>
                <th className="px-4 py-3 text-left font-semibold">Estado</th>
                <th className="px-4 py-3 text-left font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EEFF]">
              {estudiantes.map((e, i) => (
                <tr
                  key={e.id}
                  className={e.estado === "En inicio" ? "bg-[#FFF5F5]" : undefined}
                >
                  <td className="px-4 py-3 text-[#5B5678]">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5636D9] text-xs font-bold text-white">
                        {initials(e.nombre)}
                      </div>
                      <span className="font-medium text-[#17164F]">{e.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{e.nota.toFixed(1)}/20</td>
                  <td className="px-4 py-3">
                    <div className="flex w-36 items-center gap-2">
                      <ProgressBar value={e.progreso} />
                      <span className="text-xs text-[#5B5678]">{e.progreso}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={e.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/docente/estudiante/${e.id}`}
                      className="font-semibold text-[#5636D9]"
                    >
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DocenteLayout>
  );
}

function Field({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#17164F]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full appearance-none rounded-2xl border border-[#E8E0FF] bg-white px-4 py-3 text-sm font-medium text-[#17164F]"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
