// Pure inline SVG charts for the EduNova Docente panel.
// Presentational only — no "use client" — usable on server and client.
// No chart libraries are used; everything is hand-rolled SVG.

import type { ReactNode } from "react";
import type { CompetenciaMastery } from "./data";

// ── LineChart ───────────────────────────────────────────────────────────────
// viewBox 0 0 300 120. Auto-scaled: y = 15 + (1 - (v-min)/(max-min)) * 80,
// x = 20 + i*52. Rising data renders left-to-right (min at bottom-left).
interface LineChartProps {
  data: number[];
  labels?: string[];
  ariaLabel?: string;
}

export function LineChart({ data, labels, ariaLabel }: LineChartProps) {
  const n = data.length;
  const lbls = labels ?? Array.from({ length: n }, (_, i) => `Sem ${i + 1}`);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: 20 + i * 52,
    y: 15 + (1 - (v - min) / range) * 80,
    v,
  }));
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  return (
    <svg
      viewBox="0 0 300 120"
      className="w-full h-auto"
      role="img"
      aria-label={ariaLabel ?? "Evolución semanal"}
    >
      <path
        d={path}
        fill="none"
        stroke="#5636D9"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#5636D9" />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={9} fill="#6B7280">
            {p.v.toFixed(1)}
          </text>
          <text x={p.x} y={113} textAnchor="middle" fontSize={9} fill="#6B7280">
            {lbls[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── BarChart ─────────────────────────────────────────────────────────────────
// viewBox 0 0 320 140. Supports single-series or grouped (multi-series) bars.
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
  const n = categories.length;
  const k = series.length;
  const groupWidth = 320 / n;
  const groupPad = groupWidth * 0.1;
  const usable = groupWidth - groupPad * 2;
  const slot = usable / k;
  const barWidth = slot * 0.85;
  const barGap = slot * 0.15;
  const baseline = 110;
  const chartH = 100;

  const bars: ReactNode[] = [];
  series.forEach((s, j) => {
    s.values.forEach((v, i) => {
      const h = (v / max) * chartH;
      const y = baseline - h;
      const x = i * groupWidth + groupPad + j * (barWidth + barGap);
      bars.push(
        <g key={`${j}-${i}`}>
          <rect x={x} y={y} width={barWidth} height={h} fill={s.color} rx={2} />
          <text
            x={x + barWidth / 2}
            y={y - 3}
            textAnchor="middle"
            fontSize={8}
            fill="#6B7280"
          >
            {v.toFixed(1)}
          </text>
        </g>
      );
    });
  });

  return (
    <div>
      <svg
        viewBox="0 0 320 140"
        className="w-full h-auto"
        role="img"
        aria-label={ariaLabel ?? "Gráfico de barras"}
      >
        {bars}
        {categories.map((c, i) => (
          <text
            key={i}
            x={i * groupWidth + groupWidth / 2}
            y={128}
            textAnchor="middle"
            fontSize={9}
            fill="#6B7280"
          >
            {c}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#6B7280]">
        {series.map((s, j) => (
          <span key={j} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── StackedBarChart ──────────────────────────────────────────────────────────
// Per competency: a full-width inline SVG (viewBox 0 0 300 24, preserveAspectRatio
// none) split into verde / amarillo / rojo proportional rects. Name + percentages
// rendered as HTML around each bar, plus a shared legend.
export function StackedBarChart({ data }: { data: CompetenciaMastery[] }) {
  return (
    <div className="space-y-3">
      {data.map((row) => (
        <div key={row.nombre}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-[#111827]">{row.nombre}</span>
            <span className="text-xs text-[#6B7280]">
              {row.logrado}% · {row.proceso}% · {row.inicio}%
            </span>
          </div>
          <svg
            viewBox="0 0 300 24"
            preserveAspectRatio="none"
            className="w-full h-3 rounded-full"
            role="img"
            aria-label={`${row.nombre}: ${row.logrado}% logrado, ${row.proceso}% en proceso, ${row.inicio}% en inicio`}
          >
            <rect x={0} y={0} width={(row.logrado / 100) * 300} height={24} fill="#10B981" />
            <rect
              x={(row.logrado / 100) * 300}
              y={0}
              width={(row.proceso / 100) * 300}
              height={24}
              fill="#F59E0B"
            />
            <rect
              x={((row.logrado + row.proceso) / 100) * 300}
              y={0}
              width={(row.inicio / 100) * 300}
              height={24}
              fill="#EF4444"
            />
          </svg>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#6B7280]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" aria-hidden="true" />
          Logrado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" aria-hidden="true" />
          En proceso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" aria-hidden="true" />
          En inicio
        </span>
      </div>
    </div>
  );
}

// ── DonutChart ───────────────────────────────────────────────────────────────
// viewBox 0 0 120 120. Track r=45 #E5E7EB; progress r=45 #5633D9 strokeLinecap round.
// strokeDasharray is COMPUTED from the percentage (circ = 2*Math.PI*45 ≈ 282.74):
// for 82% → "231.85 282.74". The spec's literal "282 345" is wrong and is not used.
// Rotated -90° about (60,60) so the arc starts at the top. Center label is an HTML overlay.
interface DonutChartProps {
  pct: number;
  label?: string;
  size?: number;
}

export function DonutChart({ pct, label = "Completadas", size = 128 }: DonutChartProps) {
  const circ = 2 * Math.PI * 45;
  const dash = (pct / 100) * circ;
  return (
    <div
      className="relative inline-flex flex-col items-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full"
        role="img"
        aria-label={`${pct}% ${label}`}
      >
        <circle cx={60} cy={60} r={45} fill="none" stroke="#E5E7EB" strokeWidth={10} />
        <circle
          cx={60}
          cy={60}
          r={45}
          fill="none"
          stroke="#5636D9"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-[#111827]">{pct}%</span>
        <span className="text-xs text-[#6B7280]">{label}</span>
      </div>
    </div>
  );
}
