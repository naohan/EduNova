"use client";

import { useState } from "react";
import { LineChart } from "./charts";
import { EstadoBadge, MobilePageHeader, Stars } from "./ui";
import { rosaRecord } from "./data";
import type { Estudiante } from "./data";
import { CheckIcon, MinusIcon } from "@/components/ui/icons";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

type Tab = "resumen" | "evolucion" | "competencias";
const tabs: { id: Tab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "evolucion", label: "Evolución" },
  { id: "competencias", label: "Competencias" },
];

export function EstudianteDetalle({ student }: { student: Estudiante }) {
  const [tab, setTab] = useState<Tab>("evolucion");
  const detalle = student.id === rosaRecord.id ? rosaRecord : {
    ...rosaRecord,
    id: student.id,
    nombre: student.nombre,
    nota: student.nota,
    estado: student.estado,
    progreso: Math.round(student.progreso / 20),
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <MobilePageHeader
        title="Detalle del estudiante"
        subtitle={student.nombre}
        backHref="/docente/resultados"
      />

      <header className="mb-6 hidden lg:block">
        <p className="text-sm text-[#5B5678]">Ficha del estudiante</p>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
          Detalle del estudiante
        </h1>
      </header>

      {/* Mobile profile card — mockup phone #4 */}
      <div className="mb-4 rounded-2xl border border-[#E8E0FF] bg-white p-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#5636D9] text-base font-bold text-white">
            {initials(student.nombre)}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-[#17164F]">{student.nombre}</div>
            <div className="mt-1">
              <EstadoBadge estado={student.estado} />
            </div>
          </div>
          <div className="rounded-2xl bg-[#F2EEFF] px-3 py-2 text-center">
            <div className="text-xl font-bold text-[#5636D9]">
              {student.nota.toFixed(0)}/20
            </div>
            <div className="text-[10px] text-[#5B5678]">promedio</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <aside className="hidden shrink-0 lg:block lg:w-64">
          <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5636D9] text-base font-semibold text-white">
                {initials(student.nombre)}
              </div>
              <div>
                <div className="font-semibold text-[#17164F]">{student.nombre}</div>
                <div className="mt-1">
                  <EstadoBadge estado={student.estado} />
                </div>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#5B5678]">Promedio</dt>
                <dd className="font-semibold text-[#17164F]">{student.nota.toFixed(1)}/20</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#5B5678]">Progreso</dt>
                <dd className="font-semibold text-[#17164F]">{student.progreso}%</dd>
              </div>
            </dl>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div
            role="tablist"
            aria-label="Secciones del estudiante"
            className="mb-4 flex gap-2 overflow-x-auto"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium ${
                  tab === t.id
                    ? "bg-[#5636D9] text-white"
                    : "border border-[#E8E0FF] bg-white text-[#5B5678]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "resumen" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="tabpanel">
              <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
                <div className="text-xs text-[#5B5678]">Promedio</div>
                <div className="text-3xl font-bold text-[#17164F]">
                  {detalle.nota.toFixed(1)}/20
                </div>
              </div>
              <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
                <div className="text-xs text-[#5B5678]">Actividades</div>
                <div className="text-3xl font-bold text-[#17164F]">
                  {detalle.actividades.completadas}/{detalle.actividades.total}
                </div>
              </div>
              <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
                <div className="text-xs text-[#5B5678]">Progreso</div>
                <div className="text-3xl font-bold text-[#127A43]">+{detalle.progreso}</div>
                <div className="text-xs text-[#5B5678]">vs bimestre anterior</div>
              </div>
            </div>
          )}

          {tab === "evolucion" && (
            <div
              className="rounded-2xl border border-[#E8E0FF] bg-white p-5"
              role="tabpanel"
            >
              <h2 className="mb-3 text-base font-semibold text-[#17164F]">
                Evolución de notas
              </h2>
              <LineChart
                data={detalle.bimestres}
                labels={["B1", "B2", "B3"]}
                ariaLabel="Evolución por bimestre"
              />
              <div className="mt-4 flex justify-center lg:hidden">
                <div className="rounded-2xl bg-[#F2EEFF] px-6 py-3 text-center">
                  <div className="text-3xl font-bold text-[#5636D9]">
                    {student.nota.toFixed(0)}/20
                  </div>
                  <div className="text-xs text-[#5B5678]">Promedio actual</div>
                </div>
              </div>
            </div>
          )}

          {tab === "competencias" && (
            <div className="space-y-4" role="tabpanel">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {detalle.competencias.map((c) => (
                  <div
                    key={c.nombre}
                    className="rounded-2xl border border-[#E8E0FF] bg-white p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-[#17164F]">{c.nombre}</span>
                      <EstadoBadge estado={c.estado} />
                    </div>
                    <div className="mt-1 text-2xl font-bold text-[#17164F]">
                      {c.nota.toFixed(1)}/20
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
                <h3 className="mb-2 text-sm font-semibold text-[#17164F]">
                  Habilidades transversales
                </h3>
                <div className="space-y-2">
                  {detalle.habilidades.map((h) => (
                    <div key={h.nombre} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-[#5B5678]">{h.nombre}</span>
                      <div className="flex items-center gap-2">
                        <Stars count={h.nivel} />
                        <span className={h.nivel >= 2 ? "text-[#127A43]" : "text-[#C62828]"}>
                          {h.nivel >= 2 ? <CheckIcon weight="bold" className="h-4 w-4" aria-label="Logrado" /> : <MinusIcon className="h-4 w-4" aria-label="Pendiente" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
                <label htmlFor="observacion" className="text-sm font-semibold text-[#17164F]">
                  Observaciones docente
                </label>
                <textarea
                  id="observacion"
                  defaultValue={detalle.observacion}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-[#E8E0FF] bg-[#F2EEFF]/50 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
