"use client";

import Link from "next/link";
import { DocenteLayout } from "@/components/docente/DocenteLayout";
import { LineChart } from "@/components/docente/charts";
import { AlertasExplicables, FuenteDatos } from "@/components/docente/PanelesAula";
import { useAula } from "@/components/docente/useAula";
import { ArrowRightIcon, WarningIcon } from "@/components/ui/icons";

const semanas = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"];

export default function Page() {
  const { alertas, apoyo, enVivo, evolucion, stats } = useAula();

  return (
    <DocenteLayout>
      <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">
        <header>
          <p className="text-sm text-[#5B5678]">Panel docente</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-extrabold text-[#17164F] sm:text-3xl">
            Resumen del aula
          </h1>
          <p className="mt-1 text-[#5B5678]">
            Matemática, 1° Secundaria, sección B. {stats.totalEstudiantes} estudiantes, III bimestre.
          </p>
          <div className="mt-2">
            <FuenteDatos enVivo={enVivo} />
          </div>
        </header>

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#E8E0FF] bg-[#E8E0FF] lg:grid-cols-4">
          <Stat label="Promedio del aula" value={`${stats.promedio} / 20`} />
          <Stat label="Actividades completadas" value={`${stats.actividadesCompletadas}%`} />
          <Stat
            label="Requieren apoyo"
            value={`${stats.apoyo} (${stats.apoyoPct}%)`}
            icon={<WarningIcon weight="fill" className="h-5 w-5 text-[#C62828]" aria-hidden />}
          />
          <Stat label="Mejora vs bimestre" value={`+${stats.mejora}`} />
        </dl>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <section className="min-w-0 rounded-2xl border border-[#E8E0FF] bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-[#17164F]">Evolución del aprendizaje</h2>
              <Link
                href="/docente/reportes"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#5636D9] hover:underline"
              >
                Ver analítica completa
                <ArrowRightIcon weight="bold" className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
            <LineChart data={evolucion} labels={semanas} ariaLabel="Promedio del aula por semana" />
          </section>

          <section className="rounded-2xl border border-[#E8E0FF] bg-white p-5">
            <h2 className="font-bold text-[#17164F]">Requieren apoyo</h2>
            <ul className="mt-3 space-y-1">
              {apoyo.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/docente/estudiante/${e.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-[#F7F4FF]"
                  >
                    <span className="min-w-0 truncate font-semibold text-[#17164F]">{e.nombre}</span>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-[#C62828]">
                      {e.nota.toFixed(1)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/docente/resultados"
              className="mt-4 block rounded-xl bg-[#5636D9] py-2.5 text-center text-sm font-bold text-white hover:bg-[#4528b8]"
            >
              Ver resultados
            </Link>
          </section>
        </div>

        <AlertasExplicables alertas={alertas} />
      </div>
    </DocenteLayout>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white p-4 sm:p-5">
      <dt className="text-sm text-[#5B5678]">{label}</dt>
      <dd className="mt-1 flex items-center gap-2 text-2xl font-bold text-[#17164F]">
        {icon}
        {value}
      </dd>
    </div>
  );
}
