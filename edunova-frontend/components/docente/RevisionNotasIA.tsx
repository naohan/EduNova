"use client";

import { useState } from "react";
import { getClassAssessments, overrideAssessment, type ApiResult } from "@/lib/api/client";
import type { AssessmentRecord } from "@/lib/api/edunova-contract";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";

const NOTA_MAX = 20;

const sinSesion = (): Promise<ApiResult<AssessmentRecord[]>> =>
  Promise.resolve({ ok: false, status: 401, error: "Falta iniciar sesión" });

function Fila({ inicial }: { inicial: AssessmentRecord }) {
  const [registro, setRegistro] = useState(inicial);
  const [nota, setNota] = useState(String(inicial.teacherOverrideScore ?? inicial.aiScore));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valor = Number(nota);
  const valida = nota.trim() !== "" && valor >= 0 && valor <= NOTA_MAX;
  const final = registro.teacherOverrideScore ?? registro.aiScore;

  async function guardar(score: number | null) {
    setGuardando(true);
    setError(null);
    const r = await overrideAssessment(registro.id, score);
    setGuardando(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setRegistro(r.data);
    setNota(String(r.data.teacherOverrideScore ?? r.data.aiScore));
  }

  return (
    <li className="rounded-xl bg-[#F7F4FF] p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-bold text-[#17164F]">{registro.alias}</span>
        <span className="text-sm text-[#5B5678]">
          Nota de la IA: {registro.aiScore}/{NOTA_MAX}
          {registro.teacherOverrideScore !== null ? (
            <span className="ml-2 font-bold text-[#5636D9]">Tu nota: {final}/{NOTA_MAX}</span>
          ) : null}
        </span>
      </div>
      {registro.firstErrorFeedback ? (
        <p className="mt-1 text-sm text-[#17164F]/80">
          {registro.stepsToReview === 1 ? "1 paso" : `${registro.stepsToReview} pasos`} por revisar:{" "}
          {registro.firstErrorFeedback}
        </p>
      ) : null}
      {registro.reasoning ? (
        <p className="mt-1 text-sm italic text-[#5B5678]">Explicación del estudiante: “{registro.reasoning}”</p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-[#17164F]">
          Nota final
          <input
            type="number"
            min={0}
            max={NOTA_MAX}
            step={0.5}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="w-20 rounded-xl border border-[#E8E0FF] bg-white px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          disabled={guardando || !valida}
          onClick={() => void guardar(valor)}
          className="rounded-xl bg-[#5636D9] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar nota"}
        </button>
        {registro.teacherOverrideScore !== null ? (
          <button
            type="button"
            disabled={guardando}
            onClick={() => void guardar(null)}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-[#5636D9] disabled:opacity-50"
          >
            Usar la nota de la IA
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-[#991B1B]">
          {error}
        </p>
      ) : null}
    </li>
  );
}

/** RF-04: toda nota de la IA pasa por el docente, que puede cambiarla. */
export function RevisionNotasIA() {
  const usuario = useSessionUser();
  const codigo = usuario?.role === "TEACHER" ? usuario.classroomCode : undefined;
  const [recarga, setRecarga] = useState(0);
  const evaluaciones = useApi(() => (codigo ? getClassAssessments(codigo) : sinSesion()), [codigo, recarga]);

  return (
    <section className="mb-6 rounded-2xl border border-[#E8E0FF] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-[#17164F]">Revisar notas de la IA</h2>
          <p className="text-xs text-[#5B5678]">Hojas del cuaderno analizadas. La nota final la decides tú.</p>
        </div>
        {codigo ? (
          <button
            type="button"
            onClick={() => setRecarga((n) => n + 1)}
            className="rounded-xl border border-[#E8E0FF] px-3 py-2 text-sm font-semibold text-[#5636D9]"
          >
            Actualizar
          </button>
        ) : null}
      </div>

      {!codigo ? (
        <p className="mt-3 text-sm text-[#5B5678]">Inicia sesión como docente para ver las hojas de tu aula.</p>
      ) : evaluaciones.status === "loading" ? (
        <p className="mt-3 text-sm text-[#5B5678]">Cargando…</p>
      ) : evaluaciones.status === "error" ? (
        <p role="alert" className="mt-3 text-sm text-[#991B1B]">
          No se pudieron cargar las hojas: {evaluaciones.error}
        </p>
      ) : evaluaciones.data.length === 0 ? (
        <p className="mt-3 text-sm text-[#5B5678]">Aún no hay hojas por revisar.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {evaluaciones.data.map((e) => (
            <Fila key={e.id} inicial={e} />
          ))}
        </ul>
      )}
    </section>
  );
}
