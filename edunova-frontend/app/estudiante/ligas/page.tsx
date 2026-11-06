"use client";

import { useState } from "react";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { TituloPantalla } from "@/components/estudiante/shared/kit";
import { FireIcon, TrophyIcon } from "@/components/ui/icons";
import { getLeaderboard, getLeaderboardAroundMe } from "@/lib/api/client";
import type { LeaderboardAroundMeResponse, LeaderboardEntry } from "@/lib/api/edunova-contract";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";

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
  data,
  puntos,
  miId,
}: {
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
    } else if (myIndex > 0) {
      const filaSuperior = data.rows[myIndex - 1];
      const miFila = data.rows[myIndex];
      const diff = Math.max(1, filaSuperior[puntos] - miFila[puntos]);
      mensajePosicion = `A ${diff} ${diff === 1 ? "punto" : "puntos"} de avanzar`;
    } else {
      mensajePosicion = "Sigue sumando para avanzar";
    }
  }

  return (
    <section>
      {mensajePosicion ? <p className="mb-3 text-center text-lg font-bold text-[#17164F]">{mensajePosicion}</p> : null}
      <ol className="space-y-2">
        {data.rows.map((f, i) => {
          const soyYo = f.studentId === miId;
          const puesto = myPosition !== undefined && myIndex >= 0 ? myPosition - myIndex + i : i + 1;
          const displayRank = medallas[puesto - 1] ?? puesto;
          return (
            <li
              key={f.studentId}
              aria-current={soyYo ? "true" : undefined}
              className={`flex min-h-[60px] items-center gap-3 rounded-2xl px-4 py-2.5 ${
                soyYo ? "bg-[#FFC928]" : "bg-white"
              }`}
            >
              <span className="w-8 shrink-0 text-center text-xl font-bold text-[#17164F]">{displayRank}</span>
              <span className="min-w-0 flex-1 truncate text-lg font-bold text-[#17164F]">
                {f.alias}
                {soyYo ? " (tú)" : ""}
              </span>
              <span className="shrink-0 text-lg font-black text-[#17164F]">{f[puntos]}</span>
            </li>
          );
        })}
      </ol>
    </section>
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
  const [liga, setLiga] = useState<"maestria" | "superacion">("maestria");

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

  const ligas = [
    { id: "maestria" as const, etiqueta: "Maestría", Icono: TrophyIcon },
    { id: "superacion" as const, etiqueta: "Superación", Icono: FireIcon },
  ];

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-xl p-4 sm:p-6 lg:p-8">
        <TituloPantalla voz="Compites en dos ligas a la vez. Maestría premia lo que dominas: precisión, retos en 3D y las preguntas que creas. Superación premia tu esfuerzo: constancia, reintentos y ayudar a tus compañeros.">
          Ligas
        </TituloPantalla>

        {sinServidor ? (
          <p role="status" className="mb-4 rounded-xl bg-[#FEF3C7] px-4 py-3 text-sm font-semibold text-[#92400E]">
            Sin conexión: datos de ejemplo.
          </p>
        ) : null}

        <div className="mb-4 grid grid-cols-2 gap-2">
          {ligas.map(({ id, etiqueta, Icono }) => {
            const on = liga === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setLiga(id)}
                className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-lg font-bold transition-colors ${
                  on ? "bg-[#2DBE70] text-[#17164F]" : "bg-[#E3F8EC] text-[#17164F]"
                }`}
              >
                <Icono weight="fill" className="h-6 w-6" aria-hidden />
                {etiqueta}
              </button>
            );
          })}
        </div>

        {liga === "maestria" ? (
          <TablaLiga data={datosMaestria} puntos="masteryPoints" miId={miId} />
        ) : (
          <TablaLiga data={datosSuperacion} puntos="effortPoints" miId={miId} />
        )}
      </div>
    </EstudianteLayout>
  );
}
