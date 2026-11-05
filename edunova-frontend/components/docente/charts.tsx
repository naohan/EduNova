// Gráficas del panel docente, sin librerías y sin "use client": sirven en servidor y cliente.
// Las marcas van en SVG y los textos en HTML, así el texto no crece con el ancho del contenedor.
// El hover es solo CSS. Cada valor también se puede leer en "Ver datos".

import type { ReactNode } from "react";
import type { CompetenciaMastery } from "./data";

const LINE_COLOR = "#5636D9";

function Tooltip({ children, align = "center" }: { children: ReactNode; align?: "start" | "center" | "end" }) {
  const pos = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align];
  return (
    <span
      className={`pointer-events-none absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-lg bg-[#17164F] px-2.5 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${pos}`}
    >
      {children}
    </span>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-3 text-sm text-[#5B5678]">
      <summary className="cursor-pointer font-semibold text-[#5636D9]">Ver datos</summary>
      <table className="mt-2 w-full tabular-nums">
        <thead>
          <tr className="text-left text-xs">
            {head.map((h) => (
              <th key={h} className="py-1 pr-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r[0])} className="border-t border-[#E8E0FF]">
              {r.map((c, i) => (
                <td key={i} className="py-1 pr-3">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

function niceStep(range: number) {
  const raw = range / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / pow;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * pow;
}

// ── LineChart ───────────────────────────────────────────────────────────────
interface LineChartProps {
  data: number[];
  labels?: string[];
  ariaLabel?: string;
}

export function LineChart({ data, labels, ariaLabel }: LineChartProps) {
  const n = data.length;
  const lbls = labels ?? Array.from({ length: n }, (_, i) => `Sem ${i + 1}`);
  const step = niceStep(Math.max(...data) - Math.min(...data) || 1);
  const lo = Math.floor(Math.min(...data) / step) * step;
  const hi = Math.ceil(Math.max(...data) / step) * step + (Math.max(...data) % step === 0 ? step : 0);
  const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);
  const yOf = (v: number) => (1 - (v - lo) / (hi - lo)) * 100;
  const points = data.map((v, i) => ({
    x: n === 1 ? 50 : 4 + (i * 92) / (n - 1),
    y: yOf(v),
    v,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const last = points[n - 1];

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative h-52 w-7 shrink-0 text-right text-xs tabular-nums text-[#5B5678] sm:h-60">
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${yOf(t)}%` }}>
              {t}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-52 sm:h-60" role="group" aria-label={ariaLabel ?? "Evolución semanal"}>
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden
            >
              {ticks.map((t) => (
                <line
                  key={t}
                  x1={0}
                  x2={100}
                  y1={yOf(t)}
                  y2={yOf(t)}
                  stroke="#E8E0FF"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path
                d={path}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <span
              className="absolute -translate-x-1/2 -translate-y-full pb-2 text-sm font-bold text-[#17164F]"
              style={{ left: `${last.x}%`, top: `${last.y}%` }}
            >
              {last.v.toFixed(1)}
            </span>

            {points.map((p, i) => (
              <div
                key={i}
                tabIndex={0}
                aria-label={`${lbls[i]}: ${p.v.toFixed(1)}`}
                className="group absolute inset-y-0 -translate-x-1/2 outline-none"
                style={{ left: `${p.x}%`, width: `${92 / Math.max(n - 1, 1)}%` }}
              >
                <span className="absolute inset-y-0 left-1/2 w-px bg-[#17164F]/25 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                <span className="absolute left-1/2" style={{ top: `${p.y}%` }}>
                  <span className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5636D9] ring-2 ring-white" />
                  <Tooltip align={p.x > 80 ? "end" : p.x < 20 ? "start" : "center"}>
                    <strong className="font-bold">{p.v.toFixed(1)}</strong> {lbls[i]}
                  </Tooltip>
                </span>
              </div>
            ))}
          </div>

          <div className="relative mt-2 h-4 text-xs text-[#5B5678]">
            {points.map((p, i) => (
              <span key={i} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${p.x}%` }}>
                {lbls[i]}
              </span>
            ))}
          </div>
        </div>
      </div>
      <DataTable head={["Periodo", "Promedio"]} rows={data.map((v, i) => [lbls[i], v.toFixed(1)])} />
    </div>
  );
}

// ── BarChart ─────────────────────────────────────────────────────────────────
interface BarSeries {
  label: string;
  values: number[];
  color: string;
}
interface BarChartProps {
  categories: string[];
  series: BarSeries[];
  max?: number;
  ariaLabel?: string;
}

export function BarChart({ categories, series, max = 20, ariaLabel }: BarChartProps) {
  return (
    <div>
      <div
        className="flex h-44 items-end gap-2 border-b border-[#E8E0FF]"
        role="group"
        aria-label={ariaLabel ?? "Gráfico de barras"}
      >
        {categories.map((c, i) => (
          <div
            key={c}
            tabIndex={0}
            aria-label={`${c}: ${series.map((s) => `${s.label} ${s.values[i].toFixed(1)}`).join(", ")}`}
            className="group relative flex h-full min-w-0 flex-1 items-end justify-center gap-0.5 outline-none"
          >
            {series.map((s) => (
              <div
                key={s.label}
                className="w-full max-w-5 rounded-t transition-opacity group-hover:opacity-85"
                style={{ height: `${(s.values[i] / max) * 100}%`, backgroundColor: s.color }}
              />
            ))}
            {/* Solo se rotula la primera serie, sobre la barra más alta del grupo. */}
            <span
              className="absolute left-1/2 mb-0.5 -translate-x-1/2 text-xs font-semibold text-[#17164F]"
              style={{ bottom: `${(Math.max(...series.map((s) => s.values[i])) / max) * 100}%` }}
            >
              {series[0].values[i].toFixed(1)}
            </span>
            <Tooltip align={i === 0 ? "start" : i === categories.length - 1 ? "end" : "center"}>
              {series.map((s) => (
                <span key={s.label} className="block">
                  <strong className="font-bold">{s.values[i].toFixed(1)}</strong> {s.label}
                </span>
              ))}
            </Tooltip>
          </div>
        ))}
      </div>

      <div className="mt-1.5 flex gap-2">
        {categories.map((c) => (
          <span key={c} className="min-w-0 flex-1 text-center text-xs leading-tight text-[#5B5678]">
            {c}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#5B5678]">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden />
            {s.label}
          </span>
        ))}
      </div>
      <DataTable
        head={["Tema", ...series.map((s) => s.label)]}
        rows={categories.map((c, i) => [c, ...series.map((s) => s.values[i].toFixed(1))])}
      />
    </div>
  );
}

// ── StackedBarChart ──────────────────────────────────────────────────────────
// Barra segmentada por competencia. Los colores son de estado, con su nombre en la leyenda.
const ESTADOS = [
  { key: "logrado", label: "Logrado", color: "#2DBE70" },
  { key: "proceso", label: "En proceso", color: "#FFC928" },
  { key: "inicio", label: "En inicio", color: "#EF4444" },
] as const;

export function StackedBarChart({
  data,
  showLegend = true,
}: {
  data: CompetenciaMastery[];
  showLegend?: boolean;
}) {
  return (
    <div>
      <div className="space-y-3.5">
        {data.map((row) => (
          <div key={row.nombre}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-[#17164F]">{row.nombre}</span>
              <span className="shrink-0 text-xs text-[#5B5678]">{row.logrado}% logrado</span>
            </div>
            <div className="flex h-2 gap-0.5" role="group" aria-label={row.nombre}>
              {ESTADOS.map((e, i) => (
                <div
                  key={e.key}
                  tabIndex={0}
                  aria-label={`${e.label}: ${row[e.key]}%`}
                  className={`group relative outline-none first:rounded-l-full last:rounded-r-full`}
                  style={{ width: `${row[e.key]}%`, backgroundColor: e.color }}
                >
                  <Tooltip align={i === 0 ? "start" : i === 2 ? "end" : "center"}>
                    <strong className="font-bold">{row[e.key]}%</strong> {e.label}
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showLegend ? (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#5B5678]">
            {ESTADOS.map((e) => (
              <span key={e.key} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: e.color }} aria-hidden />
                {e.label}
              </span>
            ))}
          </div>
          <DataTable
            head={["Competencia", ...ESTADOS.map((e) => e.label)]}
            rows={data.map((r) => [r.nombre, `${r.logrado}%`, `${r.proceso}%`, `${r.inicio}%`])}
          />
        </>
      ) : null}
    </div>
  );
}
