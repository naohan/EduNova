"use client";

import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { getLeaderboard, getStudentProfile } from "@/lib/api/client";
import type { LeaderboardEntry } from "@/lib/api/edunova-contract";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";

const divisiones: Record<LeaderboardEntry["division"], { label: string; cls: string }> = {
  BRONCE: { label: "Bronce", cls: "bg-[#F5E6D8] text-[#8A5A2B]" },
  PLATA: { label: "Plata", cls: "bg-[#E5E7EB] text-[#4B5563]" },
  ORO: { label: "Oro", cls: "bg-[#FEF3C7] text-[#92400E]" },
  SUPERNOVA: { label: "Supernova", cls: "bg-[#EAE5FF] text-[#5636D9]" },
};

const medallas = ["🥇", "🥈", "🥉"];

// Mismos valores que la semilla del backend: se usan si el servidor no responde.
const ligaEjemplo: LeaderboardEntry[] = [
  { studentId: "u-student-1", alias: "Gloria", institutionName: "Colegio San Martín", masteryPoints: 980, effortPoints: 600, division: "SUPERNOVA" },
  { studentId: "u-student-2", alias: "Mateo", institutionName: "Colegio San Martín", masteryPoints: 910, effortPoints: 653, division: "SUPERNOVA" },
  { studentId: "u-student-3", alias: "Sofía", institutionName: "Colegio San Martín", masteryPoints: 840, effortPoints: 706, division: "SUPERNOVA" },
  { studentId: "u-student-seed-4", alias: "Lucas", masteryPoints: 770, effortPoints: 759, division: "ORO" },
  { studentId: "u-student-seed-5", alias: "Valentina", institutionName: "Colegio San Martín", masteryPoints: 700, effortPoints: 812, division: "ORO" },
];

function TablaLiga({
  titulo,
  descripcion,
  filas,
  puntos,
  miId,
}: {
  titulo: string;
  descripcion: string;
  filas: LeaderboardEntry[];
  puntos: "masteryPoints" | "effortPoints";
  miId?: string;
}) {
  return (
    <section className="rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm sm:p-5">
      <h2 className="font-bold text-[#17164F]">{titulo}</h2>
      <p className="mt-0.5 text-xs text-[#6B7280]">{descripcion}</p>
      <ol className="mt-3 space-y-2">
        {filas.map((f, i) => {
          const soyYo = f.studentId === miId;
          const division = divisiones[f.division];
          return (
            <li
              key={f.studentId}
              aria-current={soyYo ? "true" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                soyYo ? "bg-[#EAE5FF] ring-2 ring-[#5636D9]" : "bg-[#F7F4FF]"
              }`}
            >
              <span className="w-7 shrink-0 text-center text-sm font-bold text-[#17164F]">
                {medallas[i] ?? i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[#17164F]">
                  {f.alias}
                  {soyYo ? " (tú)" : ""}
                </span>
                <span className="block truncate text-xs text-[#6B7280]">
                  {f.institutionName ?? "Estudia en casa"}
                </span>
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${division.cls}`}>
                {division.label}
              </span>
              <span className="w-12 shrink-0 text-right text-sm font-bold text-[#5636D9]">{f[puntos]}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function MiResumen({ studentId }: { studentId: string }) {
  const perfil = useApi(() => getStudentProfile(studentId), [studentId]);
  if (perfil.status !== "ok") return null;
  const { streakDays, novaCoins, badges } = perfil.data;
  const datos = [
    { label: "Días seguidos", valor: streakDays },
    { label: "NovaCoins", valor: novaCoins.toLocaleString("es-PE") },
    { label: "Insignias", valor: badges.length },
  ];
  return (
    <div className="mb-5 grid grid-cols-3 gap-3">
      {datos.map((d) => (
        <div key={d.label} className="rounded-2xl border border-[#E8E0FF] bg-white p-3 text-center shadow-sm">
          <div className="text-xl font-extrabold text-[#17164F]">{d.valor}</div>
          <div className="text-[11px] text-[#6B7280]">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  const usuario = useSessionUser();
  const miId = usuario?.role === "STUDENT" ? usuario.id : undefined;
  const maestria = useApi(() => getLeaderboard("mastery"), []);
  const superacion = useApi(() => getLeaderboard("effort"), []);
  const sinServidor = maestria.status === "error" || superacion.status === "error";

  const ordenada = (clave: "masteryPoints" | "effortPoints") =>
    [...ligaEjemplo].sort((a, b) => b[clave] - a[clave]);

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-[#6B7280]">Competencia sana</p>
            <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">Ligas</h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Compites en dos ligas a la vez: una premia lo que dominas y otra tu esfuerzo.
            </p>
          </div>
          <Link
            href="/estudiante/tienda"
            className="rounded-xl bg-[#5636D9] px-4 py-2.5 text-sm font-bold text-white"
          >
            Ir a la tienda
          </Link>
        </header>

        {sinServidor ? (
          <p role="status" className="mb-4 rounded-xl bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]">
            No se pudo conectar con el servidor: se muestran datos de ejemplo.
          </p>
        ) : null}

        {miId ? <MiResumen studentId={miId} /> : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <TablaLiga
            titulo="Liga de Maestría"
            descripcion="Precisión, retos 3D y preguntas que creas."
            filas={maestria.status === "ok" ? maestria.data : ordenada("masteryPoints")}
            puntos="masteryPoints"
            miId={miId}
          />
          <TablaLiga
            titulo="Liga de Superación"
            descripcion="Constancia, reintentos y ayuda a compañeros."
            filas={superacion.status === "ok" ? superacion.data : ordenada("effortPoints")}
            puntos="effortPoints"
            miId={miId}
          />
        </div>
      </div>
    </EstudianteLayout>
  );
}
