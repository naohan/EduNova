"use client";

import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { getLeaderboard, getLeaderboardAroundMe, getStudentProfile } from "@/lib/api/client";
import type { LeaderboardAroundMeResponse, LeaderboardEntry } from "@/lib/api/edunova-contract";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";

const divisiones: Record<LeaderboardEntry["division"], { label: string; cls: string }> = {
  BRONCE: { label: "Bronce", cls: "bg-[#F5E6D8] text-[#8A5A2B]" },
  PLATA: { label: "Plata", cls: "bg-[#E8E0FF] text-[#4B5563]" },
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

interface LigaData {
  rows: LeaderboardEntry[];
  myPosition?: number;
  total?: number;
}

function TablaLiga({
  titulo,
  descripcion,
  data,
  puntos,
  miId,
}: {
  titulo: string;
  descripcion: string;
  data: LigaData;
  puntos: "masteryPoints" | "effortPoints";
  miId?: string;
}) {
  const myIndex = miId ? data.rows.findIndex((f) => f.studentId === miId) : -1;
  const myPosition = data.myPosition ?? (myIndex >= 0 ? myIndex + 1 : undefined);
  const total = data.total ?? data.rows.length;

  let mensajePosicion: string | null = null;
  if (miId && myPosition !== undefined && total > 0) {
    const mitadSuperior = Math.ceil(total / 2);
    if (myPosition <= mitadSuperior) {
      mensajePosicion = `Vas en el puesto ${myPosition} de ${total}`;
    } else {
      if (myIndex > 0) {
        const filaSuperior = data.rows[myIndex - 1];
        const miFila = data.rows[myIndex];
        const diff = Math.max(1, filaSuperior[puntos] - miFila[puntos]);
        mensajePosicion = `A ${diff} puntos de avanzar`;
      } else {
        mensajePosicion = `A 1 puntos de avanzar`;
      }
    }
  }

  return (
    <section className="rounded-2xl border border-[#E8E0FF] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-[#17164F]">{titulo}</h2>
          <p className="mt-0.5 text-xs text-[#5B5678]">{descripcion}</p>
        </div>
        {mensajePosicion ? (
          <span className="rounded-full bg-[#EAE5FF] px-3 py-1 text-xs font-bold text-[#5636D9]">
            {mensajePosicion}
          </span>
        ) : null}
      </div>

      <ol className="mt-3 space-y-2">
        {data.rows.map((f, i) => {
          const soyYo = f.studentId === miId;
          const division = divisiones[f.division];
          const puesto = myPosition !== undefined && myIndex >= 0 ? myPosition - myIndex + i : i + 1;
          const displayRank = medallas[puesto - 1] ?? puesto;
          return (
            <li
              key={f.studentId}
              aria-current={soyYo ? "true" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                soyYo ? "bg-[#EAE5FF] ring-2 ring-[#5636D9]" : "bg-[#F7F4FF]"
              }`}
            >
              <span className="w-7 shrink-0 text-center text-sm font-bold text-[#17164F]">
                {displayRank}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[#17164F]">
                  {f.alias}
                  {soyYo ? " (tú)" : ""}
                </span>
                <span className="block truncate text-xs text-[#5B5678]">
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
        <div key={d.label} className="rounded-2xl border border-[#E8E0FF] bg-white p-3 text-center">
          <div className="text-xl font-extrabold text-[#17164F]">{d.valor}</div>
          <div className="text-[11px] text-[#5B5678]">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function fallbackData(puntos: "masteryPoints" | "effortPoints", studentId?: string): LigaData {
  const sorted = [...ligaEjemplo].sort((a, b) => b[puntos] - a[puntos]);
  const total = sorted.length;
  if (!studentId) {
    return { rows: sorted.slice(0, 5), total };
  }
  const idx = sorted.findIndex((f) => f.studentId === studentId);
  const myPosition = idx >= 0 ? idx + 1 : 1;
  const start = Math.max(0, (idx >= 0 ? idx : 0) - 2);
  const end = Math.min(total, (idx >= 0 ? idx : 0) + 3);
  return {
    rows: sorted.slice(start, end),
    myPosition,
    total,
  };
}

export default function Page() {
  const usuario = useSessionUser();
  const miId = usuario?.role === "STUDENT" ? usuario.id : undefined;

  const maestriaApi = useApi<LeaderboardEntry[] | LeaderboardAroundMeResponse>(
    () => (miId ? getLeaderboardAroundMe("mastery") : getLeaderboard("mastery")),
    [miId],
  );
  const superacionApi = useApi<LeaderboardEntry[] | LeaderboardAroundMeResponse>(
    () => (miId ? getLeaderboardAroundMe("effort") : getLeaderboard("effort")),
    [miId],
  );

  const sinServidor = maestriaApi.status === "error" || superacionApi.status === "error";

  const normalizarData = (
    apiData: LeaderboardEntry[] | LeaderboardAroundMeResponse | undefined,
    puntos: "masteryPoints" | "effortPoints",
  ): LigaData => {
    if (!apiData) return fallbackData(puntos, miId);
    if (Array.isArray(apiData)) {
      return { rows: apiData, total: apiData.length };
    }
    return apiData;
  };

  const datosMaestria =
    maestriaApi.status === "ok" ? normalizarData(maestriaApi.data, "masteryPoints") : fallbackData("masteryPoints", miId);
  const datosSuperacion =
    superacionApi.status === "ok" ? normalizarData(superacionApi.data, "effortPoints") : fallbackData("effortPoints", miId);

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-[#5B5678]">Competencia sana</p>
            <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">Ligas</h1>
            <p className="mt-1 text-sm text-[#5B5678]">
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
            data={datosMaestria}
            puntos="masteryPoints"
            miId={miId}
          />
          <TablaLiga
            titulo="Liga de Superación"
            descripcion="Constancia, reintentos y ayuda a compañeros."
            data={datosSuperacion}
            puntos="effortPoints"
            miId={miId}
          />
        </div>
      </div>
    </EstudianteLayout>
  );
}
