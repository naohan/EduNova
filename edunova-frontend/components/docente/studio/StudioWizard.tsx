"use client";

import { useState } from "react";
import Link from "next/link";
import type { AgeTier, RubricCriterion } from "@/lib/api/edunova-contract";
import { approveRubric, ingestDocument, pictogramUrl } from "@/lib/api/client";
import { useSessionUser } from "@/lib/api/use-session";
import {
  aBorrador,
  borradorDeEjemplo,
  esArchivoDeTexto,
  labNombre,
  leerBase64,
  motivoDeRechazo,
  tituloDesdeArchivo,
  type Borrador,
} from "./studioData";
import { CheckCircleIcon, FilePlusIcon, PencilLineIcon } from "@/components/ui/icons";

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

const edades: { tier: AgeTier; label: string }[] = [
  { tier: "EXPLORADOR_7_9", label: "7 a 9 años" },
  { tier: "AVENTURERO_10_12", label: "10 a 12 años" },
  { tier: "CREADOR_13_15", label: "13 a 15 años" },
];

const MAX_TEXTO = 200_000;

const inputCls =
  "w-full rounded-xl border border-[#E8E0FF] bg-[#F7F4FF] px-3 py-2.5 text-sm text-[#17164F] focus:outline-none focus:ring-2 focus:ring-[#5636D9]/25";
const botonCls = "rounded-xl bg-[#5636D9] px-5 py-3 text-sm font-bold text-white disabled:opacity-50";

/** HU-01: subir material, revisar la rúbrica y publicar. La IA nunca publica sin este clic del docente. */
export function StudioWizard() {
  const usuario = useSessionUser();
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
    const rechazo = archivo ? motivoDeRechazo(archivo) : null;
    if (rechazo) {
      setError(rechazo);
      return;
    }
    setError(null);
    setOcupado(true);
    const esTexto = archivo ? esArchivoDeTexto(archivo) : false;
    const contenido = archivo && esTexto ? await archivo.text() : "";
    const textoFinal = `${texto} ${contenido}`.trim().slice(0, MAX_TEXTO);
    const r = await ingestDocument({
      title: titulo.trim() || undefined,
      text: textoFinal,
      ...(archivo && !esTexto ? { fileBase64: await leerBase64(archivo), mimeType: archivo.type } : {}),
    });
    if (!r.ok && (r.status === 401 || r.status === 403 || r.status === 413 || r.status === 415)) {
      setError(r.status === 413 ? "El archivo pesa demasiado. Prueba con una versión más liviana." : r.error);
      setOcupado(false);
      return;
    }
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

  if (usuario !== undefined && usuario?.role !== "TEACHER") {
    return (
      <section className="rounded-2xl border border-[#E8E0FF] bg-white p-6 text-center">
        <h2 className="font-bold text-[#17164F]">Inicia sesión como docente</h2>
        <p className="mt-1 text-sm text-[#5B5678]">Solo un docente puede crear y publicar unidades.</p>
        <Link href="/login" className={`${botonCls} mt-4 inline-block`}>
          Iniciar sesión
        </Link>
      </section>
    );
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
        <section className="space-y-4 rounded-2xl border border-[#E8E0FF] bg-white p-5">
          <label className="block cursor-pointer rounded-2xl border-2 border-dashed border-[#C4B5FD] bg-[#F7F4FF] p-6 text-center">
            <span className="block text-3xl" aria-hidden>
              <FilePlusIcon className="mx-auto h-7 w-7 text-[#5636D9]" aria-hidden />
            </span>
            <span className="mt-2 block text-sm font-bold text-[#17164F]">
              {archivo ? archivo.name : "Elige un PDF, una imagen o un archivo de texto"}
            </span>
            <input
              type="file"
              accept=".pdf,.txt,.md,image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            />
          </label>
          <div className="flex items-center justify-between text-xs text-[#5B5678]">
            <span>Recomendación: no subas material con datos personales.</span>
            <Link
              href="/etica"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#5636D9] underline hover:text-[#4324bd]"
            >
              Uso ético de la IA
            </Link>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-[#5B5678]">Título de la unidad (opcional)</span>
            <input
              className={`${inputCls} mt-1`}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Sistema Solar"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#5B5678]">O pega el texto de tu clase</span>
            <textarea
              className={`${inputCls} mt-1`}
              rows={4}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </label>
          <button type="button" onClick={analizar} disabled={ocupado} className={botonCls}>
            {ocupado ? "Leyendo tu material con IA…" : "Analizar material"}
          </button>
          {ocupado ? (
            <p role="status" className="text-sm text-[#5B5678]">
              Puede tardar hasta un minuto. La IA arma un borrador; tú decides qué se publica.
            </p>
          ) : null}
        </section>
      ) : null}

      {paso === "revisar" && borrador ? (
        <>
          {borrador.sinConexion ? (
            <p role="status" className="rounded-xl bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]">
              No se pudo analizar en el servidor ({motivoEjemplo}): este es un ejemplo y no se guardará.
            </p>
          ) : null}
          {!borrador.sinConexion && !borrador.modeloIa ? (
            <p role="status" className="rounded-xl bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]">
              No se usó la IA ({borrador.avisoIa ?? "no disponible"}): este contenido es un ejemplo, no sale de tu material.
              Puedes intentarlo otra vez.
            </p>
          ) : null}
          {borrador.modeloIa ? (
            <p role="status" className="rounded-xl bg-[#F2EEFF] px-4 py-3 text-sm text-[#17164F]">
              Borrador generado con IA a partir de tu material. Revísalo: nada llega a tus estudiantes sin tu aprobación.
            </p>
          ) : null}

          <section className="rounded-2xl border border-[#E8E0FF] bg-white p-5">
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
                  {borrador.modeloIa && s.textos ? (
                    <details className="w-full text-sm text-[#17164F]/85">
                      <summary className="cursor-pointer font-semibold text-[#5636D9]">
                        Ver textos por edad, {s.tarjetas} tarjetas y {s.preguntas} preguntas
                      </summary>
                      <dl className="mt-2 space-y-2">
                        {edades.map((e) => (
                          <div key={e.tier}>
                            <dt className="text-xs font-bold text-[#5B5678]">{e.label}</dt>
                            <dd>{s.textos?.[e.tier]}</dd>
                          </div>
                        ))}
                        {s.lecturaFacil ? (
                          <div>
                            <dt className="text-xs font-bold text-[#5B5678]">Lectura fácil (con pictogramas)</dt>
                            <dd className="rounded-lg border border-[#E8E0FF] bg-[#FAF9FF] p-2 text-xs leading-relaxed text-[#17164F]">
                              {s.lecturaFacil}
                            </dd>
                            {s.pictogramas?.length ? (
                              <dd className="mt-2">
                                <div className="flex flex-wrap gap-2">
                                  {s.pictogramas.map((p) => (
                                    <span key={p.id} className="flex w-16 flex-col items-center text-center text-[11px] text-[#17164F]">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={pictogramUrl(p.id)} alt={p.word} className="h-10 w-10 object-contain" />
                                      {p.word}
                                    </span>
                                  ))}
                                </div>
                                <p className="mt-1 text-[11px] text-[#5B5678]">
                                  Pictogramas: Sergio Palao. Origen: ARASAAC (arasaac.org). Licencia: CC BY-NC-SA. Propiedad: Gobierno de Aragón.
                                </p>
                              </dd>
                            ) : null}
                          </div>
                        ) : null}
                      </dl>
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[#E8E0FF] bg-white p-5">
            <h2 className="mb-3 font-bold text-[#17164F]">Rúbrica interna</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-[#F2EEFF] text-[#5B5678]">
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
        <section className="rounded-2xl border border-[#E8E0FF] bg-white p-6 text-center">
          <div className="text-4xl" aria-hidden>
            {borrador.sinConexion ? <PencilLineIcon className="h-6 w-6" aria-hidden /> : <CheckCircleIcon weight="fill" className="h-6 w-6" aria-hidden />}
          </div>
          <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            {borrador.sinConexion ? "Ejemplo aprobado" : "Unidad publicada"}
          </h2>
          <p className="mt-1 text-sm text-[#5B5678]">
            {borrador.sinConexion
              ? "Era un ejemplo: esta unidad no se guardó ni llegó a los estudiantes."
              : `«${borrador.titulo}» ya está disponible para el aula ${borrador.aula}.`}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/estudiante/unidades" className={botonCls}>
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
