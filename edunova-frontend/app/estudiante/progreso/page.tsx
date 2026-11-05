import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import {
  estudiante,
  unidadesProgreso,
  competencias,
  reforzar,
  insignias,
} from "@/components/estudiante/data";

export default function Page() {
  const pct = estudiante.progresoTotal;
  const circ = 2 * Math.PI * 45;
  const dash = (pct / 100) * circ;

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5">
          <p className="text-sm text-[#6B7280]">Mi progreso</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Resumen personal
          </h1>
        </header>

        {/* Tabs visual */}
        <div className="mb-5 flex gap-2 overflow-x-auto">
          {["Resumen", "Competencias", "Habilidades", "Historial"].map((t, i) => (
            <span
              key={t}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium ${
                i === 0
                  ? "bg-[#5636D9] text-white"
                  : "border border-[#E8E0FF] bg-white text-[#6B7280]"
              }`}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Donut */}
          <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-[#17164F]">Progreso general</h2>
            <div className="relative mx-auto h-36 w-36">
              <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label={`${pct}%`}>
                <circle cx="60" cy="60" r="45" fill="none" stroke="#E8E0FF" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#5636D9"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${circ}`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#17164F]">{pct}%</span>
                <span className="text-[11px] text-[#6B7280]">8 de 11 temas</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <Mini n="9" l="Completos" c="text-[#2DBE70]" />
              <Mini n="2" l="En proceso" c="text-[#FFC928]" />
              <Mini n="0" l="Pendientes" c="text-[#EF4444]" />
            </div>
          </div>

          {/* Units */}
          <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-[#17164F]">Progreso por unidad</h2>
            <ul className="space-y-3">
              {unidadesProgreso.map((u) => (
                <li key={u.nombre}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-[#17164F]">{u.nombre}</span>
                    <span className="text-[#6B7280]">{u.pct}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#E8E0FF]">
                    <div
                      className="h-full rounded-full bg-[#2DBE70]"
                      style={{ width: `${u.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Competencies */}
          <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-[#17164F]">Mis competencias</h2>
            <ul className="space-y-3">
              {competencias.map((c) => (
                <li key={c.nombre}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-[#17164F]">{c.nombre}</span>
                    <span className="text-[#5636D9] font-bold">{c.pct}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#E8E0FF]">
                    <div
                      className="h-full rounded-full bg-[#5636D9]"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#FFF0C2] bg-[#FFFBEB] p-5">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#92400E]">
              🎯 Para reforzar
            </h2>
            <ul className="space-y-2">
              {reforzar.map((r) => (
                <li key={r} className="text-sm text-[#78350F]">
                  • {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#17164F]">Insignias recientes</h2>
              <Link href="/estudiante/logros" className="text-sm font-semibold text-[#5636D9]">
                Ver todas
              </Link>
            </div>
            <div className="flex gap-2">
              {insignias.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
                    b.obtenida ? "bg-[#F2EEFF]" : "bg-gray-100 opacity-40"
                  }`}
                >
                  {b.emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EstudianteLayout>
  );
}

function Mini({ n, l, c }: { n: string; l: string; c: string }) {
  return (
    <div className="rounded-xl bg-[#F7F4FF] p-2">
      <div className={`text-lg font-bold ${c}`}>{n}</div>
      <div className="text-[10px] text-[#6B7280]">{l}</div>
    </div>
  );
}
