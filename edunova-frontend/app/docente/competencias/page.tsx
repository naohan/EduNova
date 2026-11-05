"use client";

import { useState } from "react";
import Link from "next/link";
import { DocenteLayout } from "@/components/docente/DocenteLayout";
import { StackedBarChart } from "@/components/docente/charts";
import { EstadoBadge } from "@/components/docente/ui";
import { competenciaMastery, estudiantes, classInfo } from "@/components/docente/data";
import type { Estado } from "@/components/docente/data";

const sampleIds = ["1", "2", "3", "4", "5"];
const matrizEstados: Record<string, Estado[]> = {
  "1": ["Logrado", "Logrado", "Logrado", "Logrado"],
  "2": ["Logrado", "En proceso", "Logrado", "Logrado"],
  "3": ["En proceso", "En inicio", "En proceso", "En proceso"],
  "4": ["En inicio", "En inicio", "En proceso", "En inicio"],
  "5": ["Logrado", "En proceso", "Logrado", "En proceso"],
};

const competenciasLista = [
  {
    nombre: "Resuelve problemas de cantidad",
    estado: "Logrado" as Estado,
  },
  {
    nombre: "Resuelve problemas de regularidad, equivalencia y cambio",
    estado: "En proceso" as Estado,
  },
  {
    nombre: "Resuelve problemas de forma, movimiento y localización",
    estado: "En proceso" as Estado,
  },
  {
    nombre: "Resuelve problemas de gestión de datos e incertidumbre",
    estado: "En inicio" as Estado,
  },
];

export default function Page() {
  const [aula, setAula] = useState("Matemática 1B");
  const sample = estudiantes.filter((e) => sampleIds.includes(e.id));
  const nombres = competenciaMastery.map((c) => c.nombre);

  return (
    <DocenteLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {/* Mobile */}
        <div className="lg:hidden">
          <div className="mb-4 flex items-center gap-2">
            <Link href="/docente" className="text-lg text-[#5636D9]" aria-label="Volver">
              ‹
            </Link>
            <h1 className="flex-1 text-center font-[family-name:var(--font-fredoka)] text-[1.05rem] font-semibold leading-tight text-[#17164F]">
              Seguimiento por competencia
            </h1>
            <span className="w-5" />
          </div>

          <button
            type="button"
            className="mb-4 flex w-full items-center justify-between rounded-2xl border border-[#E8E0FF] bg-white px-4 py-3 text-sm font-semibold"
          >
            {aula}
            <span className="text-[#6A6586]">▾</span>
          </button>

          <div className="space-y-3">
            {competenciasLista.map((c) => (
              <article
                key={c.nombre}
                className="rounded-2xl border border-[#E8E0FF] bg-white p-4"
              >
                <div className="mb-2 flex justify-end">
                  <EstadoBadge estado={c.estado} />
                </div>
                <h3 className="text-sm font-semibold leading-snug text-[#17164F]">
                  {c.nombre}
                </h3>
              </article>
            ))}
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden lg:block">
          <header className="mb-6">
            <p className="text-sm text-[#5B5678]">Seguimiento por competencia</p>
            <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
              Dominio curricular
            </h1>
            <p className="mt-1 text-[#5B5678]">
              {classInfo.curso}, {classInfo.grado}
            </p>
          </header>

          <label className="mb-5 block max-w-xs">
            <span className="text-xs font-medium text-[#5B5678]">Aula / curso</span>
            <select
              value={aula}
              onChange={(e) => setAula(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E8E0FF] bg-white px-3 py-2.5 text-sm"
            >
              <option>Matemática 1B</option>
              <option>Comunicación 1A</option>
            </select>
          </label>

          <div className="mb-6 grid grid-cols-2 gap-4">
            {competenciaMastery.map((c) => (
              <div
                key={c.nombre}
                className="rounded-2xl border border-[#E8E0FF] bg-white p-4"
              >
                <StackedBarChart data={[c]} showLegend={false} />
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E8E0FF] bg-white p-4">
            <h3 className="mb-3 font-semibold text-[#17164F]">
              Criterios curriculares por estudiante
            </h3>
            <table className="w-full text-sm">
              <thead className="bg-[#F2EEFF] text-[#5B5678]">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Estudiante</th>
                  {nombres.map((n) => (
                    <th key={n} className="px-3 py-2 text-left font-semibold">
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EEFF]">
                {sample.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-2 font-medium">{e.nombre}</td>
                    {matrizEstados[e.id].map((est, i) => (
                      <td key={i} className="px-3 py-2">
                        <EstadoBadge estado={est} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DocenteLayout>
  );
}
