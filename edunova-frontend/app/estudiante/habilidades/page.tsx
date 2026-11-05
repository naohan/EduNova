"use client";

import { useState } from "react";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { habilidades } from "@/components/estudiante/data";

type Tab = "rendimiento" | "habilidades" | "recomendaciones";

export default function Page() {
  const [tab, setTab] = useState<Tab>("habilidades");

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5">
          <p className="text-sm text-[#6B7280]">Perfil de aprendizaje</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Habilidades y fortalezas
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Actividades exploratorias — no son etiquetas ni diagnósticos.
          </p>
        </header>

        <div className="mb-5 flex gap-2 overflow-x-auto">
          {(
            [
              ["rendimiento", "Rendimiento"],
              ["habilidades", "Habilidades"],
              ["recomendaciones", "Recomendaciones"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium ${
                tab === id
                  ? "bg-[#5636D9] text-white"
                  : "border border-[#E8E0FF] bg-white text-[#6B7280]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "habilidades" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-[#17164F]">Mapa de fortalezas</h2>
              <RadarChart />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {habilidades.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] p-3 text-center"
                  >
                    <div className="text-2xl">{h.emoji}</div>
                    <div className="mt-1 text-xs font-bold text-[#17164F]">{h.nombre}</div>
                    <div className="text-sm font-bold text-[#5636D9]">{h.pct}%</div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#FFF0C2] bg-[#FFFBEB] p-4">
                <h3 className="text-sm font-semibold text-[#92400E]">¿Qué puedes mejorar?</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-[#78350F]">
                  <li>• Comunicación: explica tu procedimiento en voz alta</li>
                  <li>• Creatividad: propón un ejemplo cotidiano del tema</li>
                </ul>
                <Link
                  href="/estudiante/ruta"
                  className="mt-3 inline-flex rounded-xl bg-[#5636D9] px-4 py-2 text-sm font-bold text-white"
                >
                  Ver actividades sugeridas
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "rendimiento" ? (
          <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#6B7280]">
              Resumen de notas y progreso por unidad.
            </p>
            <Link
              href="/estudiante/progreso"
              className="mt-3 inline-flex text-sm font-semibold text-[#5636D9]"
            >
              Ir a Mi progreso →
            </Link>
          </div>
        ) : null}

        {tab === "recomendaciones" ? (
          <div className="space-y-3">
            {[
              "Practica casillas de cooperación en el tablero",
              "Crea un duelo sobre fracciones equivalentes",
              "Explora en 3D Júpiter y Saturno",
            ].map((r) => (
              <div
                key={r}
                className="rounded-2xl border border-[#E8E0FF] bg-white p-4 text-sm font-medium text-[#17164F] shadow-sm"
              >
                {r}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </EstudianteLayout>
  );
}

function RadarChart() {
  const cx = 120;
  const cy = 120;
  const r = 80;
  const n = habilidades.length;
  const pts = habilidades.map((h, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = (h.pct / 100) * r;
    return [cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)];
  });
  const poly = pts.map((p) => p.join(",")).join(" ");
  const rings = [0.33, 0.66, 1];

  return (
    <svg viewBox="0 0 240 240" className="mx-auto h-auto w-full max-w-[280px]" role="img" aria-label="Radar de habilidades">
      {rings.map((f) => (
        <polygon
          key={f}
          fill="none"
          stroke="#E8E0FF"
          strokeWidth="1"
          points={Array.from({ length: n }, (_, i) => {
            const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
            return `${cx + r * f * Math.cos(ang)},${cy + r * f * Math.sin(ang)}`;
          }).join(" ")}
        />
      ))}
      {habilidades.map((_, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + r * Math.cos(ang)}
            y2={cy + r * Math.sin(ang)}
            stroke="#E8E0FF"
          />
        );
      })}
      <polygon points={poly} fill="rgba(86,54,217,0.25)" stroke="#5636D9" strokeWidth="2" />
      {habilidades.map((h, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const lx = cx + (r + 18) * Math.cos(ang);
        const ly = cy + (r + 18) * Math.sin(ang);
        return (
          <text
            key={h.id}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="#17164F"
            fontWeight="600"
          >
            {h.nombre}
          </text>
        );
      })}
    </svg>
  );
}
