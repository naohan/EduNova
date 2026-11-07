"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, CheckCircleIcon, WarningIcon } from "@/components/ui/icons";
import { getDiagnosticQuestions, submitDiagnostic } from "@/lib/api/client";
import type { AgeTier, DiagnosticQuestion, DiagnosticResult } from "@/lib/api/edunova-contract";

const tarjetaCls = "rounded-2xl border border-[#E8E0FF] bg-white p-6";
const botonPrimarioCls =
  "rounded-xl bg-[#5636D9] px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-95 disabled:opacity-50";

function nombreNivel(tier: AgeTier): string {
  switch (tier) {
    case "EXPLORADOR_7_9":
      return "Explorador";
    case "AVENTURERO_10_12":
      return "Aventurero";
    case "CREADOR_13_15":
      return "Creador";
  }
}

export function DiagnosticoNivel() {
  const [fase, setFase] = useState<"cargando" | "error" | "intro" | "preguntas" | "enviando" | "terminado">("cargando");
  const [preguntas, setPreguntas] = useState<DiagnosticQuestion[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Map<string, number>>(new Map());
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [resultado, setResultado] = useState<DiagnosticResult | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  function procesarResultadoCarga(r: { ok: boolean; data?: DiagnosticQuestion[] }) {
    if (!r.ok || !r.data || r.data.length === 0) {
      setFase("error");
    } else {
      setPreguntas(r.data);
      setIndiceActual(0);
      setRespuestas(new Map());
      setOpcionSeleccionada(null);
      setFase("intro");
    }
  }

  function reintentarCarga() {
    setFase("cargando");
    void getDiagnosticQuestions().then((r) => {
      procesarResultadoCarga(r as { ok: boolean; data?: DiagnosticQuestion[] });
    });
  }

  useEffect(() => {
    let cancelado = false;
    void getDiagnosticQuestions().then((r) => {
      if (cancelado) return;
      procesarResultadoCarga(r as { ok: boolean; data?: DiagnosticQuestion[] });
    });
    return () => {
      cancelado = true;
    };
  }, []);

  function iniciar() {
    setIndiceActual(0);
    setOpcionSeleccionada(null);
    setFase("preguntas");
  }

  function seleccionarOpcion(idx: number) {
    setOpcionSeleccionada(idx);
  }

  async function avanzarPregunta() {
    if (opcionSeleccionada === null) return;
    const pregunta = preguntas[indiceActual];
    if (!pregunta) return;

    const nuevasRespuestas = new Map(respuestas);
    nuevasRespuestas.set(pregunta.id, opcionSeleccionada);
    setRespuestas(nuevasRespuestas);

    if (indiceActual + 1 < preguntas.length) {
      setIndiceActual(indiceActual + 1);
      const siguienteId = preguntas[indiceActual + 1]?.id;
      setOpcionSeleccionada(siguienteId ? (nuevasRespuestas.get(siguienteId) ?? null) : null);
    } else {
      // Enviar respuestas al servidor
      setFase("enviando");
      setErrorEnvio(null);
      const payload = Array.from(nuevasRespuestas.entries()).map(([questionId, optionIndex]) => ({
        questionId,
        optionIndex,
      }));
      const res = await submitDiagnostic(payload);
      if (res.ok) {
        setResultado(res.data);
        setFase("terminado");
      } else {
        setErrorEnvio(res.error || "No se pudo guardar el diagnóstico.");
        setFase("preguntas");
      }
    }
  }

  if (fase === "cargando") {
    return (
      <div className={`${tarjetaCls} text-center`}>
        <p className="text-sm font-medium text-[#5B5678]">Cargando preguntas…</p>
      </div>
    );
  }

  if (fase === "error") {
    return (
      <div className={`${tarjetaCls} text-center space-y-4`}>
        <div className="flex justify-center">
          <WarningIcon className="h-10 w-10 text-[#EF4444]" aria-hidden />
        </div>
        <h2 className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
          Sin conexión con el servidor
        </h2>
        <p className="text-sm text-[#5B5678]">
          No pudimos cargar las preguntas en este momento. Por favor comprueba tu conexión e inténtalo otra vez.
        </p>
        <div>
          <button type="button" onClick={reintentarCarga} className={botonPrimarioCls}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (fase === "intro") {
    return (
      <div className={`${tarjetaCls} space-y-5 text-center`}>
        <div className="flex justify-center">
          <BookOpenIcon className="h-12 w-12 text-[#5636D9]" aria-hidden />
        </div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
          Ajustar mis lecturas
        </h1>
        <div className="rounded-xl bg-[#F2EEFF] p-4">
          <p className="text-base font-medium text-[#17164F]">
            No es un examen y no da puntos. Nos ayuda a elegir tus lecturas.
          </p>
        </div>
        <p className="text-sm text-[#5B5678]">
          Responderás unas preguntas cortas a tu propio ritmo. Tómate el tiempo que necesites.
        </p>
        <div className="pt-2">
          <button type="button" onClick={iniciar} className={botonPrimarioCls}>
            Empezar
          </button>
        </div>
      </div>
    );
  }

  if (fase === "terminado" && resultado) {
    const nivel = nombreNivel(resultado.diagnosticTier);
    return (
      <div className={`${tarjetaCls} space-y-5 text-center`}>
        <div className="flex justify-center">
          <CheckCircleIcon weight="fill" className="h-12 w-12 text-[#127A43]" aria-hidden />
        </div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
          Listo. Tus lecturas empezarán en nivel {nivel}
        </h1>
        <p className="text-sm text-[#5B5678]">
          A partir de ahora tus lecturas y actividades se adaptarán para que aprendas con comodidad.
        </p>
        <div className="pt-3">
          <Link href="/estudiante/unidades" className={botonPrimarioCls}>
            Ir a mis unidades
          </Link>
        </div>
      </div>
    );
  }

  const preguntaActual = preguntas[indiceActual];
  const esUltima = indiceActual === preguntas.length - 1;
  const progresoPorcentaje = Math.round(((indiceActual + 1) / preguntas.length) * 100);

  return (
    <div className="space-y-4">
      {/* Barra de progreso */}
      <div className="flex items-center justify-between text-xs font-semibold text-[#5B5678]">
        <span>
          Pregunta {indiceActual + 1} de {preguntas.length}
        </span>
        <span>{progresoPorcentaje}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8E0FF]">
        <div
          className="h-full bg-[#5636D9] transition-all duration-300"
          style={{ width: `${progresoPorcentaje}%` }}
        />
      </div>

      {errorEnvio && (
        <div className="rounded-xl bg-[#FFF5F5] border border-[#EF4444] p-3 text-sm text-[#EF4444]">
          {errorEnvio}. Por favor presiona Finalizar nuevamente para reintentar.
        </div>
      )}

      {/* Tarjeta de pregunta */}
      {preguntaActual && (
        <div className={tarjetaCls}>
          <h2 className="text-lg font-bold leading-relaxed text-[#17164F]">
            {preguntaActual.prompt}
          </h2>

          <div className="mt-5 space-y-2.5">
            {preguntaActual.options.map((opcion, idx) => {
              const estaSeleccionada = opcionSeleccionada === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => seleccionarOpcion(idx)}
                  className={`w-full rounded-xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition-colors ${
                    estaSeleccionada
                      ? "border-[#5636D9] bg-[#F2EEFF] text-[#5636D9]"
                      : "border-[#E8E0FF] bg-white text-[#17164F] hover:bg-[#FAF9FF]"
                  }`}
                >
                  {opcion}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={avanzarPregunta}
              disabled={opcionSeleccionada === null || fase === "enviando"}
              className={botonPrimarioCls}
            >
              <span className="flex items-center gap-2">
                {fase === "enviando" ? "Guardando…" : esUltima ? "Finalizar" : "Siguiente"}
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

