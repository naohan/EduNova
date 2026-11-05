"use client";

import { useState } from "react";
import Link from "next/link";
import { DocenteLayout } from "@/components/docente/DocenteLayout";
import { BarChart, LineChart, StackedBarChart, DonutChart } from "@/components/docente/charts";
import {
  EstadoBadge,
  MobilePageHeader,
  ProgressBar,
  SoftSkill,
} from "@/components/docente/ui";
import {
  classInfo,
  classStats,
  estudiantes,
  classroomWeekly,
  competenciaMastery,
  topicComparison,
  strategyAnalysis,
  causalidadDisclaimer,
  predictiveAlerts,
  predictiveDisclaimer,
  rosaRecord,
} from "@/components/docente/data";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

type DesktopTab =
  | "dashboard"
  | "resultados"
  | "competencias"
  | "estrategias"
  | "alertas";

const desktopTabs: { id: DesktopTab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "resultados", label: "Resultados por curso" },
  { id: "competencias", label: "Seguimiento por competencia" },
  { id: "estrategias", label: "Análisis de estrategias" },
  { id: "alertas", label: "Alertas predictivas" },
];

export default function Page() {
  const [desktopTab, setDesktopTab] = useState<DesktopTab>("dashboard");
  const [search, setSearch] = useState("");

  const temas = topicComparison.map((t) => t.tema);
  const aulaVals = topicComparison.map((t) => t.aula);
  const metaVals = topicComparison.map((t) => t.meta);
  const filtered = estudiantes.filter((e) =>
    e.nombre.toLowerCase().includes(search.toLowerCase()),
  );

  const resumenAula = (
    <div className="rounded-2xl border border-[#EDE9FE] bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-[#17164F]">Resumen del aula</h3>
      <div className="grid grid-cols-2 gap-2.5">
        <MiniStat label="Promedio" value="15.8/20" accent="text-[#2DBE70]" />
        <MiniStat label="Actividades" value="82%" accent="text-[#5636D9]" />
        <MiniStat label="Estudiantes" value="20" />
        <MiniStat label="Apoyo" value="4 · 20%" accent="text-[#EF4444]" alert />
      </div>
    </div>
  );

  const evolucion = (
    <div className="rounded-2xl border border-[#EDE9FE] bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-[#17164F]">
        Evolución del aula (6 semanas)
      </h3>
      <LineChart data={classroomWeekly} ariaLabel="Evolución semanal del aula" />
    </div>
  );

  const dominio = (
    <div className="rounded-2xl border border-[#EDE9FE] bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-[#17164F]">Dominio por competencia</h3>
      <StackedBarChart data={competenciaMastery} />
    </div>
  );

  const comparison = (
    <div className="rounded-2xl border border-[#EDE9FE] bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-[#17164F]">Comparación por tema</h3>
      <BarChart
        categories={temas}
        series={[
          { label: "Promedio aula", values: aulaVals, color: "#17164F" },
          { label: "Meta esperada", values: metaVals, color: "#A5B4FC" },
        ]}
        max={20}
        ariaLabel="Comparación aula vs meta por tema"
      />
    </div>
  );

  const estudiantesTable = (
    <div className="rounded-2xl border border-[#EDE9FE] bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-[#17164F]">Estudiantes del aula</h3>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar estudiante"
          className="min-w-[140px] flex-1 rounded-lg border border-[#EDE9FE] px-3 py-1.5 text-sm"
          aria-label="Buscar estudiante"
        />
      </div>
      <div className="max-h-[280px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[#F2EEFF] text-[#6B7280]">
            <tr>
              <th className="px-2 py-2 text-left font-semibold">Estudiante</th>
              <th className="px-2 py-2 text-left font-semibold">Prom.</th>
              <th className="px-2 py-2 text-left font-semibold">Progreso</th>
              <th className="px-2 py-2 text-left font-semibold">Estado</th>
              <th className="px-2 py-2 text-left font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE9FE]">
            {filtered.map((e) => (
              <tr
                key={e.id}
                className={e.estado === "En inicio" ? "bg-[#FEE2E2]/35" : undefined}
              >
                <td className="px-2 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5636D9] text-[10px] font-semibold text-white">
                      {initials(e.nombre)}
                    </div>
                    <span className="font-medium text-[#17164F]">{e.nombre}</span>
                  </div>
                </td>
                <td className="px-2 py-2 font-semibold">{e.nota.toFixed(1)}</td>
                <td className="px-2 py-2">
                  <div className="flex w-24 items-center gap-1.5">
                    <ProgressBar value={e.progreso} ariaLabel={`Progreso de ${e.nombre}`} />
                    <span className="text-[10px] text-[#6B7280]">{e.progreso}%</span>
                  </div>
                </td>
                <td className="px-2 py-2">
                  <EstadoBadge estado={e.estado} />
                </td>
                <td className="px-2 py-2">
                  <Link
                    href={`/docente/estudiante/${e.id}`}
                    className="text-xs font-semibold text-[#5636D9]"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const rosaFicha = (
    <div className="rounded-2xl border border-[#EDE9FE] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5636D9] text-xs font-semibold text-white">
          {initials(rosaRecord.nombre)}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-[#17164F]">{rosaRecord.nombre}</div>
          <EstadoBadge estado={rosaRecord.estado} />
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#17164F]">{rosaRecord.nota.toFixed(1)}/20</div>
          <div className="text-[11px] text-[#6B7280]">
            {rosaRecord.actividades.completadas}/{rosaRecord.actividades.total} act.
          </div>
        </div>
      </div>
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        Soft skills
      </h4>
      <div className="space-y-1.5">
        {rosaRecord.habilidades.map((h) => (
          <SoftSkill key={h.nombre} name={h.nombre} ok={h.nivel >= 2} />
        ))}
      </div>
      <Link
        href={`/docente/estudiante/${rosaRecord.id}`}
        className="mt-3 inline-flex text-sm font-semibold text-[#5636D9]"
      >
        Abrir ficha completa →
      </Link>
    </div>
  );

  const estrategias = (
    <div className="rounded-2xl border border-[#EDE9FE] bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-[#17164F]">Análisis de estrategias</h3>
      <p className="mb-3 text-xs text-[#6B7280]">{strategyAnalysis.titulo}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-xl border border-[#EDE9FE] bg-[#F2EEFF] p-3 text-center">
          <div className="text-xs text-[#6B7280]">Antes</div>
          <div className="text-2xl font-bold text-[#17164F]">{strategyAnalysis.antes}</div>
          <div className="text-xs text-[#6B7280]">{strategyAnalysis.antesPct}% logro</div>
        </div>
        <span aria-hidden className="text-xl text-[#5636D9]">
          →
        </span>
        <div className="flex-1 rounded-xl bg-[#D1FAE5] p-3 text-center">
          <div className="text-xs text-[#065F46]">Después</div>
          <div className="text-2xl font-bold text-[#065F46]">{strategyAnalysis.despues}</div>
          <div className="text-xs text-[#065F46]">{strategyAnalysis.despuesPct}% logro</div>
        </div>
      </div>
      <div className="mt-3">
        <span className="inline-flex rounded-full bg-[#D1FAE5] px-2.5 py-1 text-xs font-semibold text-[#065F46]">
          +{strategyAnalysis.variacion} pts (+{strategyAnalysis.variacionPct}%)
        </span>
      </div>
    </div>
  );

  const alertas = (
    <div className="rounded-2xl border border-[#EDE9FE] bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <span aria-hidden>⚠️</span>
        <h3 className="text-sm font-semibold text-[#17164F]">Alertas predictivas</h3>
      </div>
      <p className="mb-3 text-xs text-[#6B7280]">Recomendación para revisión docente</p>
      <ul className="space-y-2">
        {predictiveAlerts.map((a) => (
          <li
            key={a.estudiante}
            className="flex items-start justify-between rounded-xl bg-[#FFF8E8] p-2.5"
          >
            <div>
              <div className="text-sm font-semibold text-[#17164F]">{a.estudiante}</div>
              <div className="text-xs text-[#92400E]">{a.tendencia}</div>
            </div>
            <span className="text-xs font-medium text-[#5636D9]">{a.accion}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs italic text-[#6B7280]">{predictiveDisclaimer}</p>
    </div>
  );

  const notaInfo = (
    <div className="rounded-2xl border border-[#EDE9FE] bg-[#F2EEFF] p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-[#17164F]">Nota para revisión humana</h3>
      <p className="text-xs leading-relaxed text-[#17164F]/70">{causalidadDisclaimer}</p>
    </div>
  );

  const dashboard = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {resumenAula}
        {evolucion}
        {dominio}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {comparison}
        {estudiantesTable}
        {rosaFicha}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {estrategias}
        {alertas}
        {notaInfo}
      </div>
    </div>
  );

  let desktopContent = dashboard;
  if (desktopTab === "resultados") desktopContent = estudiantesTable;
  else if (desktopTab === "competencias") desktopContent = dominio;
  else if (desktopTab === "estrategias") desktopContent = estrategias;
  else if (desktopTab === "alertas") desktopContent = alertas;

  return (
    <DocenteLayout>
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6 lg:p-8">
        {/* Desktop header */}
        <header className="mb-5 hidden lg:block">
          <p className="text-xs text-[#6B7280]">
            Analítica educativa <span aria-hidden>›</span> Matemática · 1°B
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
              {classInfo.curso}
            </h1>
            <div className="flex items-center gap-2">
              <select
                aria-label="Curso"
                className="rounded-xl border border-[#EDE9FE] bg-white px-3 py-2 text-sm"
                defaultValue="Matemática 1B"
              >
                <option>Matemática 1B</option>
                <option>Comunicación 1A</option>
              </select>
              <select
                aria-label="Periodo"
                className="rounded-xl border border-[#EDE9FE] bg-white px-3 py-2 text-sm"
              >
                <option>Bimestre 1</option>
                <option>Bimestre 2</option>
              </select>
              <button
                type="button"
                className="rounded-xl bg-[#5636D9] px-4 py-2 text-sm font-bold text-white"
              >
                Exportar reporte
              </button>
            </div>
          </div>
        </header>

        <div className="mb-5 hidden lg:block">
          <div role="tablist" aria-label="Secciones de analítica" className="flex flex-wrap gap-2">
            {desktopTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={desktopTab === t.id}
                onClick={() => setDesktopTab(t.id)}
                className={`rounded-xl px-3.5 py-2 text-sm font-medium ${
                  desktopTab === t.id
                    ? "bg-[#5636D9] text-white"
                    : "border border-[#EDE9FE] bg-white text-[#6B7280]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:block" role="tabpanel">
          {desktopContent}
        </div>

        {/* Mobile reports — mockup phone #7 */}
        <div className="lg:hidden">
          <MobilePageHeader title="Reportes" subtitle="Analítica educativa" />

          <div className="space-y-4">
            <div className="flex flex-col items-center rounded-2xl border border-[#EDE9FE] bg-white p-5 shadow-sm">
              <DonutChart pct={classStats.actividadesCompletadas} label="Completadas" />
              <p className="mt-2 text-sm text-[#6B7280]">Actividades del aula</p>
            </div>

            <div className="rounded-2xl border border-[#EDE9FE] bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-[#17164F]">
                Dominio por competencia
              </h3>
              <ul className="space-y-3">
                {competenciaMastery.map((c) => (
                  <li key={c.nombre}>
                    <div className="mb-1 flex justify-between text-xs text-[#6B7280]">
                      <span>{c.nombre}</span>
                      <span>{c.logrado}% logrado</span>
                    </div>
                    <ProgressBar value={c.logrado} ariaLabel={`${c.nombre} logrado`} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#EDE9FE] bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-[#17164F]">Comparación por tema</h3>
              <BarChart
                categories={temas}
                series={[
                  { label: "Aula", values: aulaVals, color: "#17164F" },
                  { label: "Meta", values: metaVals, color: "#A5B4FC" },
                ]}
                max={20}
              />
            </div>
          </div>
        </div>
      </div>
    </DocenteLayout>
  );
}

function MiniStat({
  label,
  value,
  accent,
  alert,
}: {
  label: string;
  value: string;
  accent?: string;
  alert?: boolean;
}) {
  return (
    <div className={`rounded-xl p-2.5 ${alert ? "bg-[#FFF5F5]" : "bg-[#F2EEFF]/70"}`}>
      <div className="text-[11px] text-[#6B7280]">{label}</div>
      <div className={`text-lg font-bold ${accent ?? "text-[#17164F]"}`}>{value}</div>
    </div>
  );
}
