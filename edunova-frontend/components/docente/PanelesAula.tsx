"use client";

import { useState } from "react";
import type { ExplainableAlert, TalentSignal } from "@/lib/api/edunova-contract";
import { CheckCircleIcon, WarningIcon } from "@/components/ui/icons";
import { markAlertAttended } from "@/lib/api/client";
import { ProgressBar } from "./ui";

export function FuenteDatos({ enVivo }: { enVivo: boolean }) {
  return (
    <p
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        enVivo ? "bg-[#E9F9F0] text-[#127A43]" : "bg-[#F2EEFF] text-[#5B5678]"
      }`}
    >
      {enVivo ? "Datos del aula en vivo" : "Datos de ejemplo: inicia sesión como docente para ver tu aula"}
    </p>
  );
}

function formatearFecha(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

/** RF-05: dice qué falla y a cuántos estudiantes, no solo una nota. */
export function AlertasExplicables({ alertas }: { alertas: ExplainableAlert[] }) {
  const [atendidas, setAtendidas] = useState<Record<string, string>>({});
  const [cargandoId, setCargandoId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<{ id: string; error: string } | null>(null);

  if (!alertas.length) return null;

  async function handleMarcarAtendida(alertId: string) {
    setCargandoId(alertId);
    setErrorId(null);
    const r = await markAlertAttended(alertId);
    setCargandoId(null);
    if (r.ok) {
      setAtendidas((prev) => ({ ...prev, [alertId]: r.data.attendedAt }));
    } else {
      setErrorId({ id: alertId, error: r.error || "No se pudo marcar como atendida." });
    }
  }

  return (
    <section className="rounded-2xl border border-[#E8E0FF] bg-white p-5">
      <h2 className="flex items-center gap-2 font-bold text-[#17164F]">
        <WarningIcon weight="fill" className="h-5 w-5 text-[#92400E]" aria-hidden />
        Alertas explicables
      </h2>
      <p className="text-xs text-[#5B5678]">Recomendación para revisión docente.</p>
      <ul className="mt-3 space-y-3">
        {alertas.map((a) => {
          const fechaAtendida = atendidas[a.id] ?? a.attendedAt;
          const estaAtendida = Boolean(fechaAtendida);

          return (
            <li
              key={a.id}
              className={`rounded-xl p-4 text-sm transition-all ${
                estaAtendida
                  ? "border border-[#E8E0FF] bg-[#FAF9FF] opacity-65 text-[#5B5678]"
                  : "border border-[#FDE68A] bg-[#FFFBEB] text-[#17164F]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-relaxed">{a.message}</p>
                {estaAtendida && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#E9F9F0] px-2.5 py-0.5 text-xs font-semibold text-[#127A43]">
                    <CheckCircleIcon weight="fill" className="h-3.5 w-3.5" aria-hidden />
                    Atendida el {formatearFecha(fechaAtendida)}
                  </span>
                )}
              </div>

              {a.affectedAliases && a.affectedAliases.length > 0 && (
                <p className="mt-2 text-xs text-[#5B5678]">
                  <span className="font-semibold text-[#17164F]">Estudiantes:</span>{" "}
                  {a.affectedAliases.join(", ")}
                </p>
              )}

              {a.commonMistake ? (
                <div className="mt-2 text-xs text-[#92400E]">
                  <span className="font-semibold text-[#17164F]">
                    Error frecuente ({a.commonMistake.students} estudiantes):
                  </span>{" "}
                  {a.commonMistake.text}
                </div>
              ) : null}

              {a.suggestedAction && (
                <div className="mt-2.5 rounded-lg border border-[#FDE68A] bg-white/80 p-2.5 text-xs text-[#17164F]">
                  <strong className="block font-semibold text-[#92400E] mb-0.5">Qué hacer:</strong>
                  <span>{a.suggestedAction}</span>
                </div>
              )}

              {!estaAtendida && !a.id.startsWith("ejemplo") && (
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleMarcarAtendida(a.id)}
                    disabled={cargandoId === a.id}
                    className="rounded-xl bg-[#5636D9] px-3.5 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {cargandoId === a.id ? "Guardando…" : "Marcar como atendida"}
                  </button>
                  {errorId?.id === a.id && (
                    <span className="text-xs text-[#EF4444] font-medium">{errorId.error}</span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const senales: Array<{ clave: "logic" | "perseverance" | "autonomy"; nombre: string }> = [
  { clave: "logic", nombre: "Lógica" },
  { clave: "perseverance", nombre: "Perseverancia" },
  { clave: "autonomy", nombre: "Autonomía" },
];

/** RF-05, Reto 20: sugerencias para observar en clase, nunca etiquetas. */
export function RadarTalentos({ talentos, aviso }: { talentos: TalentSignal[]; aviso: string }) {
  if (!talentos.length) {
    return (
      <section className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
        <h3 className="text-sm font-semibold text-[#17164F]">Radar de Talentos</h3>
        <p className="mt-2 text-xs text-[#5B5678]">Aún no hay evidencia suficiente</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#17164F]">Radar de Talentos</h3>
      <ul className="mt-3 space-y-3">
        {talentos.map((t) => (
          <li key={t.studentId}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-semibold text-[#17164F]">{t.alias}</span>
              <span className="text-xs text-[#5B5678]">
                Basado en {t.evidenceCount} {t.evidenceCount === 1 ? "actividad" : "actividades"}
              </span>
            </div>
            <div className="space-y-1">
              {senales.map((s) => (
                <div key={s.clave} className="grid grid-cols-[96px_1fr_28px] items-center gap-2 text-xs text-[#5B5678]">
                  <span>{s.nombre}</span>
                  {t[s.clave] === undefined ? (
                    <span className="col-span-2 text-right italic">Sin datos aún</span>
                  ) : (
                    <>
                      <ProgressBar value={t[s.clave] ?? 0} ariaLabel={`${s.nombre} de ${t.alias}`} />
                      <span className="text-right tabular-nums">{t[s.clave]}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {aviso && <p className="mt-3 text-xs italic text-[#5B5678]">{aviso}</p>}
    </section>
  );
}
