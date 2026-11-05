import Link from "next/link";
import { DocenteLayout } from "@/components/docente/DocenteLayout";
import { LineChart } from "@/components/docente/charts";
import { classStats, classroomWeekly } from "@/components/docente/data";

const semanas = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"];

export default function Page() {
  return (
    <DocenteLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {/* ── Mobile: Resumen del aula (mockup phone) ── */}
        <div className="lg:hidden">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg text-[#5636D9]">‹</span>
            <h1 className="flex-1 text-center font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
              Resumen del aula
            </h1>
            <span className="w-5" />
          </div>

          <button
            type="button"
            className="mb-4 flex w-full items-center justify-between rounded-2xl border border-[#E8E0FF] bg-white px-4 py-3 text-sm font-semibold text-[#17164F] shadow-sm"
          >
            Matemática 1°B
            <span className="text-[#9CA3AF]">▾</span>
          </button>

          {/* Info chips 2x2 */}
          <div className="mb-3 grid grid-cols-2 gap-3">
            <InfoChip icon="📘" title="1° Grado" sub="Secundaria" />
            <InfoChip icon="🎒" title="Sección" sub="B" />
            <InfoChip icon="👥" title="20" sub="Estudiantes" />
            <InfoChip icon="📅" title="III" sub="Bimestre" />
          </div>

          {/* Metric cards */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF6E0] text-xl">
                🏆
              </span>
              <div className="flex-1">
                <div className="text-xs text-[#6B7280]">Promedio del aula</div>
                <div className="text-xl font-bold text-[#17164F]">15.8 / 20</div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E9F9F0] text-xl">
                  ✅
                </span>
                <div className="flex-1">
                  <div className="text-xs text-[#6B7280]">Actividades completadas</div>
                  <div className="text-xl font-bold text-[#17164F]">82%</div>
                </div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#E8E0FF]">
                <div className="h-full w-[82%] rounded-full bg-[#2DBE70]" />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-[#FFF5F5] p-4 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-xl">
                ⚠️
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#991B1B]">
                  Estudiantes que requieren apoyo
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#EF4444]">4</div>
                <div className="text-xs font-semibold text-[#EF4444]">(20%)</div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href="/docente/resultados"
              className="rounded-2xl bg-[#5636D9] py-3.5 text-center text-sm font-bold text-white"
            >
              Ver resultados
            </Link>
            <Link
              href="/docente/reportes"
              className="rounded-2xl border-2 border-[#5636D9] bg-white py-3.5 text-center text-sm font-bold text-[#5636D9]"
            >
              Analítica
            </Link>
          </div>
        </div>

        {/* ── Desktop overview ── */}
        <div className="hidden lg:block">
          <header className="mb-6">
            <p className="text-sm text-[#6B7280]">Panel docente</p>
            <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
              Resumen del aula
            </h1>
            <p className="mt-1 text-[#6B7280]">Matemática · 1° Secundaria – Sección B</p>
          </header>

          <div className="mb-4 grid grid-cols-4 gap-4">
            <DesktopStat icon="🏆" label="Promedio del aula" value="15.8 / 20" />
            <DesktopStat icon="✅" label="Actividades completadas" value="82%" accent="text-[#2DBE70]" />
            <DesktopStat
              icon="⚠️"
              label="Requieren apoyo"
              value="4 (20%)"
              accent="text-[#EF4444]"
              alert
            />
            <DesktopStat
              icon="📈"
              label="Mejora vs bimestre"
              value={`+${classStats.mejora}`}
              accent="text-[#2DBE70]"
            />
          </div>

          <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-[#17164F]">Evolución del aprendizaje</h2>
              <Link href="/docente/reportes" className="text-sm font-semibold text-[#5636D9]">
                Ver analítica completa →
              </Link>
            </div>
            <LineChart data={classroomWeekly} labels={semanas} />
          </div>
        </div>
      </div>
    </DocenteLayout>
  );
}

function InfoChip({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-[#E8E0FF] bg-white p-3.5 shadow-sm">
      <div className="mb-1 text-lg">{icon}</div>
      <div className="text-sm font-bold text-[#17164F]">{title}</div>
      <div className="text-xs text-[#6B7280]">{sub}</div>
    </div>
  );
}

function DesktopStat({
  icon,
  label,
  value,
  accent,
  alert,
}: {
  icon: string;
  label: string;
  value: string;
  accent?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        alert ? "border-red-200 bg-[#FFF5F5]" : "border-[#E8E0FF] bg-white"
      }`}
    >
      <div className="mb-2 text-xl">{icon}</div>
      <div className="text-xs text-[#6B7280]">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent ?? "text-[#17164F]"}`}>{value}</div>
    </div>
  );
}
