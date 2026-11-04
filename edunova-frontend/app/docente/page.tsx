import { DocenteLayout } from "@/components/docente/DocenteLayout";
import { BarChart } from "@/components/docente/charts";
import { StatCard } from "@/components/docente/ui";
import { classInfo, classStats, classroomWeekly } from "@/components/docente/data";

const semanas = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"];

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F5F3FF] rounded-xl p-3">
      <div className="text-xs text-[#6B7280]">{label}</div>
      <div className="text-lg font-bold text-[#17164F]">{value}</div>
    </div>
  );
}

// Server component (no "use client", no useState). Renders DocenteLayout with
// server-rendered children (StatCards + BarChart).
export default function Page() {
  return (
    <DocenteLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <header className="mb-6">
          <p className="text-sm text-[#6B7280]">Panel docente</p>
          <h1 className="text-2xl font-bold text-[#111827]">Resumen del aula</h1>
          <p className="mt-1 text-[#6B7280]">
            {classInfo.curso} · {classInfo.grado} · Sección {classInfo.seccion}
          </p>
        </header>

        {/* Mobile — stacked stat chips */}
        <div className="md:hidden bg-white rounded-2xl border border-[#EDE9FE] p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <Chip label="Estudiantes" value="20" />
            <Chip label="Promedio" value="15.8/20" />
            <Chip label="Actividades" value="82%" />
            <Chip label="Apoyo" value="4" />
          </div>
          <p className="mt-3 text-xs text-[#6B7280]">
            +{classStats.mejora} pts vs bimestre anterior
          </p>
        </div>

        {/* Desktop — 2x2 stat grid */}
        <div className="hidden md:grid grid-cols-2 gap-4">
          <StatCard
            icon="👥"
            label="Estudiantes"
            value="20"
            sublabel={`${classInfo.grado} · Sección ${classInfo.seccion}`}
          />
          <StatCard
            icon="📈"
            label="Promedio del aula"
            value="15.8/20"
            sublabel={`+${classStats.mejora} pts vs bimestre anterior`}
            accent="text-[#10B981]"
          />
          <StatCard
            icon="✅"
            label="Actividades completadas"
            value="82%"
            sublabel="Progreso del aula"
          />
          <StatCard
            icon="⚠️"
            label="Requieren apoyo"
            value="4"
            sublabel="20% del aula"
            accent="text-[#EF4444]"
          />
        </div>

        {/* Desktop — weekly evolution bar chart */}
        <div className="hidden md:block mt-4 bg-white rounded-2xl border border-[#EDE9FE] p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[#111827] mb-3">
            Evolución del aula (6 semanas)
          </h2>
          <BarChart
            categories={semanas}
            series={[{ label: "Promedio", values: classroomWeekly, color: "#5636D9" }]}
            ariaLabel="Promedio del aula por semana"
          />
        </div>
      </div>
    </DocenteLayout>
  );
}
