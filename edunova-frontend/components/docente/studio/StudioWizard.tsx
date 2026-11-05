"use client";

import { useState } from "react";
import Link from "next/link";
import type { RubricCriterion } from "@/lib/api/edunova-contract";
import { approveRubric, ingestDocument } from "@/lib/api/client";
import {
  aBorrador,
  borradorDeEjemplo,
  esArchivoDeTexto,
  labNombre,
  tituloDesdeArchivo,
  type Borrador,
} from "./studioData";

type Paso = "subir" | "revisar" | "publicado";

const pasos: { id: Paso; label: string }[] = [
  { id: "subir", label: "Subir material" },
  { id: "revisar", label: "Revisar rúbrica" },
  { id: "publicado", label: "Publicado" },
];

const columnas: { campo: "topicName" | "evaluationCriterion" | "suggestedActivity"; label: string }[] = [
  { campo: "topicName", label: "Tema" },
  { campo: "evaluationCriterion", label: "Criterio de evaluación" },
  { campo: "suggestedActivity", label: "Actividad sugerida" },
];

const MAX_TEXTO = 200_000;

const inputCls =
  "w-full rounded-xl border border-[#E8E0FF] bg-[#F7F4FF] px-3 py-2.5 text-sm text-[#17164F] focus:outline-none focus:ring-2 focus:ring-[#5636D9]/25";
const botonCls = "rounded-xl bg-[#5636D9] px-5 py-3 text-sm font-bold text-white disabled:opacity-50";

/** HU-01: subir material, revisar la rúbrica y publicar. La IA nunca publica sin este clic del docente. */
export function StudioWizard() {
  const [paso, setPaso] = useState<Paso>("subir");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [motivoEjemplo, setMotivoEjemplo] = useState("");

  const rubricaCompleta = borrador?.rubrica.every((c) => columnas.every(({ campo }) => c[campo].trim())) ?? false;

  async function analizar() {
    const tituloFinal = titulo.trim() || (archivo ? tituloDesdeArchivo(archivo.name) : "");
    if (!tituloFinal && !texto.trim()) {
      setError("Sube un archivo o pega el texto de tu clase.");
      return;
    }
    setError(null);
    setOcupado(true);
    const contenido = archivo && esArchivoDeTexto(archivo) ? await archivo.text() : "";
    const textoFinal = `${texto} ${contenido}`.trim().slice(0, MAX_TEXTO);
    const r = await ingestDocument({ title: tituloFinal || undefined, text: textoFinal });
    const recibido = r.ok ? aBorrador(r.data) : null;
    setBorrador(recibido ?? borradorDeEjemplo(tituloFinal, textoFinal));
    if (!recibido) {
      const motivo = r.ok ? "respuesta incompleta" : r.status ? `error ${r.status}: ${r.error}` : r.error;
      setMotivoEjemplo(motivo);
      console.warn("Studio: se usa el ejemplo local.", motivo);
    }
    setOcupado(false);
    setPaso("revisar");
  }

  function editar(id: string, campo: keyof RubricCriterion, valor: string) {
    setBorrador((b) =>
      b ? { ...b, rubrica: b.rubrica.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)) } : b,
    );
  }

  async function publicar() {
    if (!borrador || !rubricaCompleta) return;
    setError(null);
    if (borrador.sinConexion) {
      setPaso("publicado");
      return;
    }
    setOcupado(true);
    const r = await approveRubric(borrador.id, borrador.rubrica);
    setOcupado(false);
    if (r.ok) setPaso("publicado");
    else setError(`No se pudo publicar: ${r.error}. La unidad sigue en borrador; puedes reintentar.`);
  }

  function reiniciar() {
    setPaso("subir");
    setArchivo(null);
    setTitulo("");
    setTexto("");
    setBorrador(null);
    setError(null);
  }

  return (
    <div className="space-y-5">
      <ol className="flex gap-2">
        {pasos.map((p, i) => {
          const on = p.id === paso;
          return (
            <li
              key={p.id}
              aria-current={on ? "step" : undefined}
              className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold sm:text-sm ${
                on ? "bg-[#5636D9] text-white" : "bg-[#F2EEFF] text-[#17164F]/70"
              }`}
            >
              {i + 1}. {p.label}
            </li>
          );
        })}
      </ol>

      {error ? (
        <p role="alert" className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
          {error}
        </p>
      ) : null}

      {paso === "subir" ? (
        <section className="space-y-4 rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-[#C4B5FD] bg-[#F7F4FF] p-6 text-center">
            <span className="block text-3xl" aria-hidden>
              📄
            </span>
            <span className="mt-2 block text-sm font-bold text-[#17164F]">
              {archivo ? archivo.name : "Elige un PDF, presentación, imagen o texto"}
            </span>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx,.txt,.md,image/*"
              className="sr-only"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6B7280]">Título de la unidad (opcional)</span>
            <input
              className={`${inputCls} mt-1`}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Sistema Solar"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6B7280]">O pega el texto de tu clase</span>
            <textarea
              className={`${inputCls} mt-1`}
              rows={4}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </label>
          <button type="button" onClick={analizar} disabled={ocupado} className={botonCls}>
            {ocupado ? "Analizando material…" : "Analizar material"}
          </button>
        </section>
      ) : null}

      {paso === "revisar" && borrador ? (
        <>
          {borrador.sinConexion ? (
            <p role="status" className="rounded-xl bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]">
              No se pudo analizar en el servidor ({motivoEjemplo}): este es un ejemplo y no se guardará.
            </p>
          ) : null}

          <section className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-bold text-[#17164F]">{borrador.titulo}</h2>
              <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#92400E]">
                Borrador
              </span>
            </div>
            <ul className="space-y-2">
              {borrador.subtemas.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F7F4FF] px-3 py-2.5 text-sm"
                >
                  <span className="font-semibold text-[#17164F]">{s.titulo}</span>
                  <span className="text-xs text-[#5636D9]">{labNombre[s.lab]}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-bold text-[#17164F]">Rúbrica interna</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-[#F2EEFF] text-[#6B7280]">
                  <tr>
                    {columnas.map((c) => (
                      <th key={c.campo} scope="col" className="px-2 py-2 text-left">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {borrador.rubrica.map((fila) => (
                    <tr key={fila.id}>
                      {columnas.map((c) => (
                        <td key={c.campo} className="px-2 py-2">
                          <input
                            aria-label={`${c.label} de ${fila.topicName || "este tema"}`}
                            className={inputCls}
                            value={fila[c.campo]}
                            onChange={(e) => editar(fila.id, c.campo, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rubricaCompleta ? (
              <p className="mt-3 text-xs text-[#991B1B]">Completa todos los campos para publicar.</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={publicar}
                disabled={ocupado || !rubricaCompleta}
                className={botonCls}
              >
                {ocupado ? "Publicando…" : "Aprobar y Publicar"}
              </button>
              <button
                type="button"
                onClick={reiniciar}
                disabled={ocupado}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#5636D9] disabled:opacity-50"
              >
                Empezar de nuevo
              </button>
            </div>
          </section>
        </>
      ) : null}

      {paso === "publicado" && borrador ? (
        <section className="rounded-2xl border border-[#E8E0FF] bg-white p-6 text-center shadow-sm">
          <div className="text-4xl" aria-hidden>
            {borrador.sinConexion ? "📝" : "✅"}
          </div>
          <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            {borrador.sinConexion ? "Ejemplo aprobado" : "Unidad publicada"}
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            {borrador.sinConexion
              ? "Era un ejemplo: esta unidad no se guardó ni llegó a los estudiantes."
              : `«${borrador.titulo}» ya está disponible para el aula ${borrador.aula}.`}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/estudiante/leccion" className={botonCls}>
              Ver como estudiante
            </Link>
            <button
              type="button"
              onClick={reiniciar}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-[#5636D9]"
            >
              Crear otra unidad
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
