"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { analyzeHandwrittenPhoto, submitReasoning } from "@/lib/api/client";
import type { HandwrittenAnalysis, StepVerdict } from "@/lib/api/edunova-contract";
import { useSessionUser } from "@/lib/api/use-session";
import { CameraIcon, ImageIcon } from "@/components/ui/icons";

const veredictos: Record<StepVerdict, { label: string; icono: string; cls: string }> = {
  CORRECT: { label: "Correcto", icono: "✓", cls: "bg-[#D1FAE5] text-[#065F46]" },
  CONCEPT_ERROR: { label: "Revisa la idea", icono: "!", cls: "bg-[#FEE2E2] text-[#991B1B]" },
  ARITHMETIC_ERROR: { label: "Revisa la cuenta", icono: "!", cls: "bg-[#FEF3C7] text-[#92400E]" },
};

// RNF-03: misma respuesta que la semilla del backend, por si el servidor no responde durante el demo.
const analisisEjemplo: HandwrittenAnalysis = {
  steps: [
    { line: 1, text: "1/3 + 1/4", verdict: "CORRECT", feedback: "Planteaste bien la suma." },
    {
      line: 2,
      text: "= 2/7",
      verdict: "CONCEPT_ERROR",
      feedback: "Sumaste numeradores y denominadores. Primero busca un denominador común.",
    },
    { line: 3, text: "= 7/12", verdict: "CORRECT", feedback: "¡Ese es el resultado correcto, 3/12 + 4/12!" },
  ],
  reasoningBonusXP: 20,
  usedFallback: true,
};

const botonFotoCls =
  "flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-[#C4B5FD] bg-[#F7F4FF] p-5 text-center text-sm font-bold text-[#17164F]";

/**
 * HU-04: foto del cuaderno y análisis paso a paso. La foto solo se muestra en este dispositivo:
 * el análisis es simulado y no la usa, así que no se envían imágenes de cuadernos al servidor.
 */
export function NotebookPhotoScanner() {
  const usuario = useSessionUser();
  const [foto, setFoto] = useState<string | null>(null);
  const [explicacion, setExplicacion] = useState("");
  const [analizando, setAnalizando] = useState(false);
  const [resultado, setResultado] = useState<HandwrittenAnalysis | null>(null);
  const [esEjemplo, setEsEjemplo] = useState(false);
  const [puntos, setPuntos] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (foto) URL.revokeObjectURL(foto);
    };
  }, [foto]);

  function elegirFoto(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir la misma imagen
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      setError("Elige una imagen de tu cuaderno.");
      return;
    }
    setError(null);
    setFoto(URL.createObjectURL(archivo));
  }

  // El docente recibe la nota de la IA para revisarla; el servidor suma el bono por explicar.
  async function guardarEvaluacion(analisis: HandwrittenAnalysis, reasoning: string) {
    if (usuario?.role !== "STUDENT") {
      setPuntos("Inicia sesión como estudiante para guardar tus puntos.");
      return;
    }
    const r = await submitReasoning({ studentId: usuario.id, analysis: analisis, reasoning: reasoning || undefined });
    setPuntos(r.ok ? "Tus puntos ya se guardaron y tu docente puede ver tu hoja." : "No se pudieron guardar tus puntos.");
  }

  async function analizar() {
    setAnalizando(true);
    setError(null);
    const texto = explicacion.trim();
    const r = await analyzeHandwrittenPhoto({ explanation: texto || undefined });
    const delServidor = r.ok && Array.isArray(r.data.steps) && r.data.steps.length > 0 ? r.data : null;
    const analisis = delServidor ?? { ...analisisEjemplo, reasoningBonusXP: texto ? analisisEjemplo.reasoningBonusXP : 0 };
    setEsEjemplo(!delServidor);
    setResultado(analisis);
    setAnalizando(false);
    // Después de mostrar el resultado: guardar en la base puede tardar varios segundos.
    if (delServidor) await guardarEvaluacion(analisis, texto);
  }

  function reiniciar() {
    setFoto(null);
    setExplicacion("");
    setResultado(null);
    setEsEjemplo(false);
    setPuntos(null);
    setError(null);
  }

  if (resultado) {
    const porRevisar = resultado.steps.filter((p) => p.verdict !== "CORRECT").length;
    return (
      <div className="space-y-4">
        {esEjemplo ? (
          <p role="status" className="rounded-xl bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]">
            No se pudo conectar con el servidor: este es un análisis de ejemplo y tus puntos no se guardaron.
          </p>
        ) : null}

        <section className="rounded-2xl border border-[#E8E0FF] bg-white p-5">
          <h2 className="font-bold text-[#17164F]">
            {porRevisar
              ? `Vas bien: hay ${porRevisar === 1 ? "1 paso" : `${porRevisar} pasos`} por revisar`
              : "¡Todos tus pasos están bien!"}
          </h2>
          <ol className="mt-3 space-y-2">
            {resultado.steps.map((paso) => {
              const v = veredictos[paso.verdict];
              return (
                <li key={paso.line} className="rounded-xl bg-[#F7F4FF] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-[#17164F]">{paso.text}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${v.cls}`}>
                      <span aria-hidden>{v.icono}</span> {v.label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-[#17164F]/80">{paso.feedback}</p>
                </li>
              );
            })}
          </ol>
        </section>

        {resultado.reasoningBonusXP > 0 ? (
          <section className="rounded-2xl bg-[#FFF6E8] p-4">
            <div className="text-sm font-bold text-[#92400E]">
              +{resultado.reasoningBonusXP} XP por explicar cómo lo hiciste
            </div>
            {puntos ? <p className="mt-1 text-xs text-[#92400E]">{puntos}</p> : null}
          </section>
        ) : (
          <p className="rounded-2xl bg-[#F2EEFF] p-4 text-sm text-[#17164F]">
            La próxima vez explica cómo lo hiciste y ganarás puntos extra.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reiniciar}
            className="rounded-xl bg-[#5636D9] px-5 py-3 text-sm font-bold text-white"
          >
            Escanear otra hoja
          </button>
          <Link href="/estudiante/evaluaciones" className="rounded-xl px-4 py-3 text-sm font-semibold text-[#5636D9]">
            Volver a evaluaciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p role="alert" className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
          {error}
        </p>
      ) : null}

      <section className="rounded-2xl border border-[#E8E0FF] bg-white p-5">
        {foto ? (
          <div className="text-center">
            <Image
              src={foto}
              alt="Foto de tu cuaderno"
              width={480}
              height={360}
              unoptimized
              className="mx-auto max-h-72 w-auto rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={() => setFoto(null)}
              disabled={analizando}
              className="mt-3 text-sm font-semibold text-[#5636D9] disabled:opacity-50"
            >
              Cambiar foto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className={botonFotoCls}>
              <span className="text-3xl" aria-hidden>
                <CameraIcon weight="duotone" className="h-7 w-7" aria-hidden />
              </span>
              Tomar foto
              <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={elegirFoto} />
            </label>
            <label className={botonFotoCls}>
              <span className="text-3xl" aria-hidden>
                <ImageIcon weight="duotone" className="h-7 w-7" aria-hidden />
              </span>
              Subir imagen
              <input type="file" accept="image/*" className="sr-only" onChange={elegirFoto} />
            </label>
          </div>
        )}
      </section>

      <label className="block rounded-2xl border border-[#E8E0FF] bg-white p-5">
        <span className="text-base font-bold text-[#17164F]">¿Cómo lo hiciste?</span>
        <textarea
          rows={3}
          value={explicacion}
          onChange={(e) => setExplicacion(e.target.value)}
          placeholder="Primero sumé…"
          className="mt-3 w-full rounded-xl border border-[#E8E0FF] bg-[#F7F4FF] p-3 text-sm text-[#17164F] outline-none focus:border-[#5636D9]"
        />
      </label>

      <button
        type="button"
        onClick={analizar}
        disabled={!foto || analizando}
        className="btn-tactil tactil-magia w-full py-4 text-lg text-white"
      >
        {analizando ? "Revisando..." : "Revisar"}
      </button>
    </div>
  );
}
