"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CaretLeftIcon,
  CheckCircleIcon,
  SpeakerHighIcon,
  SpeakerSimpleSlashIcon,
  SparkleIcon,
  WarningIcon,
} from "@/components/ui/icons";
import { createFamilyDraft, publishFamilyUnit } from "@/lib/api/client";
import type { FamilyCategory, FamilyDraftResponse, LearningUnit } from "@/lib/api/edunova-contract";
import { useSessionUser } from "@/lib/api/use-session";

const categorias: Array<{ id: FamilyCategory; label: string; desc: string }> = [
  { id: "CAMPO_Y_LUGAR", label: "Conocer el campo y el lugar", desc: "Siembra, clima, animales, caminos y geografía local" },
  { id: "SALUD_Y_PLANTAS", label: "Plantas y salud", desc: "Hierbas tradicionales, infusiones y cuidados familiares" },
  { id: "COCINA", label: "Cocina", desc: "Recetas tradicionales, técnicas familiares y nutrición" },
  { id: "OFICIOS_Y_HOGAR", label: "Oficios y hogar", desc: "Artesanía, reparaciones, costura y trabajos manuales" },
  { id: "AHORRO", label: "Ahorro", desc: "Economía familiar, presupuesto y cuidado de recursos" },
  { id: "IDIOMAS", label: "Idiomas", desc: "Lenguas originarias, frases cotidianas y tradiciones" },
  { id: "OTRO", label: "Otro", desc: "Cualquier otro saber o vivencia que quieras transmitir" },
];

// El servidor recorta en este límite: aquí se avisa para que nada se pierda sin que la familia lo sepa.
const LIMITE_TEXTO = 4000;

const tarjetaCls = "rounded-2xl border border-[#E8E0FF] bg-white p-5 sm:p-6";
const botonCls = "rounded-xl bg-[#5636D9] px-5 py-3 text-sm font-bold text-white disabled:opacity-50 hover:bg-[#4324bd] transition-colors";

export function SaberesDeCasa() {
  const usuario = useSessionUser();
  const [categoria, setCategoria] = useState<FamilyCategory>("CAMPO_Y_LUGAR");
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [borradorResp, setBorradorResp] = useState<FamilyDraftResponse | null>(null);
  const [publicando, setPublicando] = useState(false);
  const [publicada, setPublicada] = useState<LearningUnit | null>(null);
  const [escuchando, setEscuchando] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function toggleAudio(textoLeccion: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (escuchando) {
      window.speechSynthesis.cancel();
      setEscuchando(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(textoLeccion);
    utter.lang = "es-ES";
    utter.onend = () => setEscuchando(false);
    utter.onerror = () => setEscuchando(false);
    setEscuchando(true);
    window.speechSynthesis.speak(utter);
  }

  async function prepararLeccion() {
    if (!texto.trim()) {
      setError("Por favor, escribe lo que deseas enseñar.");
      return;
    }
    setError(null);
    setCargando(true);
    const r = await createFamilyDraft({
      category: categoria,
      text: texto.trim(),
      title: titulo.trim() || undefined,
    });
    setCargando(false);
    if (r.ok) {
      setBorradorResp(r.data);
    } else {
      setError(r.error || "No se pudo preparar la lección. Revisa tu conexión o intenta nuevamente.");
    }
  }

  async function publicar() {
    if (!borradorResp) return;
    setPublicando(true);
    setError(null);
    const r = await publishFamilyUnit(borradorResp.unit.id);
    setPublicando(false);
    if (r.ok) {
      setPublicada(r.data);
    } else {
      setError(r.error || "No se pudo publicar la lección. Intenta nuevamente.");
    }
  }

  function reiniciar() {
    setBorradorResp(null);
    setPublicada(null);
    setTexto("");
    setTitulo("");
    setError(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setEscuchando(false);
  }

  if (usuario !== undefined && usuario?.role !== "FAMILY_TUTOR") {
    return (
      <section className={tarjetaCls}>
        <h2 className="font-bold text-[#17164F]">Inicia sesión como familia</h2>
        <p className="mt-1 text-sm text-[#5B5678]">Esta sección es para que los tutores familiares preparen lecciones para sus hijos.</p>
        <Link href="/login" className={`${botonCls} mt-4 inline-block`}>
          Iniciar sesión
        </Link>
      </section>
    );
  }

  if (publicada) {
    return (
      <section className={`${tarjetaCls} text-center space-y-4`}>
        <CheckCircleIcon weight="fill" className="mx-auto h-12 w-12 text-[#2DBE70]" aria-hidden />
        <h2 className="font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F]">
          ¡Lección publicada para tu hijo!
        </h2>
        <p className="text-sm text-[#5B5678] max-w-md mx-auto">
          Tu lección &ldquo;{publicada.title}&rdquo; ya está disponible para tu hijo en la sección <strong>Mis unidades</strong> con la etiqueta <strong>De tu familia</strong>.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reiniciar} className={botonCls}>
            Enseñar otro saber
          </button>
          <Link
            href="/familia"
            className="rounded-xl border border-[#E8E0FF] bg-white px-5 py-3 text-sm font-bold text-[#5636D9] hover:bg-[#F7F4FF]"
          >
            Volver al portal
          </Link>
        </div>
      </section>
    );
  }

  if (borradorResp) {
    const { unit, usedFallback, aiNotice, safetyNotice } = borradorResp;
    const textoCompleto = unit.subtopics
      .map((st) => `${st.title}. ${st.stages.discover.storyTextByAge.AVENTURERO_10_12}`)
      .join(" ");

    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setBorradorResp(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5636D9]"
          >
            <CaretLeftIcon className="h-4 w-4" aria-hidden /> Modificar lo que escribiste
          </button>
          <button
            type="button"
            onClick={() => toggleAudio(textoCompleto)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8E0FF] bg-white px-3 py-1.5 text-xs font-bold text-[#5636D9] hover:bg-[#F7F4FF]"
          >
            {escuchando ? (
              <>
                <SpeakerSimpleSlashIcon className="h-4 w-4 text-[#E11D48]" aria-hidden /> Detener voz
              </>
            ) : (
              <>
                <SpeakerHighIcon className="h-4 w-4 text-[#5636D9]" aria-hidden /> Escuchar lección
              </>
            )}
          </button>
        </div>

        {usedFallback ? (
          <div className="rounded-xl border border-[#FEF3C7] bg-[#FFFBEB] p-4 text-xs text-[#92400E]">
            <span className="font-bold">Aviso: </span>
            {aiNotice || "No se pudo utilizar la IA en este momento. Se preparó un borrador con tu texto tal como lo escribiste."}
          </div>
        ) : (
          <div className="rounded-xl border border-[#E8E0FF] bg-[#F7F4FF] p-3 text-xs text-[#5636D9] flex items-center gap-2">
            <SparkleIcon weight="fill" className="h-4 w-4 shrink-0" aria-hidden />
            <span>La IA organizó lo que contaste en una lección clara para tu hijo. Revisa que todo sea correcto antes de publicar.</span>
          </div>
        )}

        {safetyNotice ? (
          <div role="status" className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4 text-xs font-bold text-[#9A3412]">
            {safetyNotice}
          </div>
        ) : null}

        <div className={tarjetaCls}>
          <div className="border-b border-[#E8E0FF] pb-4">
            <span className="text-xs font-bold text-[#5636D9] uppercase tracking-wide">Borrador de lección</span>
            <h2 className="mt-1 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F]">
              {unit.title}
            </h2>
          </div>

          {unit.safetyNote ? (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-3 text-xs font-bold text-[#9A3412]">
              <WarningIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#EA580C]" aria-hidden />
              <span>{unit.safetyNote}</span>
            </div>
          ) : null}

          <div className="mt-5 space-y-5">
            {unit.subtopics.map((st) => (
              <div key={st.id} className="rounded-xl border border-[#E8E0FF] bg-[#FAF9FF] p-4">
                <h3 className="font-bold text-[#17164F]">{st.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#17164F]/85">
                  {st.stages.discover.storyTextByAge.AVENTURERO_10_12}
                </p>

                <details className="mt-3 text-xs text-[#17164F]">
                  <summary className="cursor-pointer font-bold text-[#5636D9]">Ver todo lo que leerá tu hijo</summary>
                  <dl className="mt-2 space-y-2">
                    <div>
                      <dt className="font-bold text-[#5B5678]">Para 7 a 9 años</dt>
                      <dd>{st.stages.discover.storyTextByAge.EXPLORADOR_7_9}</dd>
                    </div>
                    <div>
                      <dt className="font-bold text-[#5B5678]">Para 13 a 15 años</dt>
                      <dd>{st.stages.discover.storyTextByAge.CREADOR_13_15}</dd>
                    </div>
                    {st.stages.discover.easyReadText ? (
                      <div>
                        <dt className="font-bold text-[#5B5678]">Lectura fácil</dt>
                        <dd>{st.stages.discover.easyReadText}</dd>
                      </div>
                    ) : null}
                    {st.stages.practice.flashcards.length ? (
                      <div>
                        <dt className="font-bold text-[#5B5678]">Tarjetas de repaso</dt>
                        {st.stages.practice.flashcards.map((f) => (
                          <dd key={f.id}>
                            {f.front}: {f.back}
                          </dd>
                        ))}
                      </div>
                    ) : null}
                  </dl>
                </details>

                {st.stages.demonstrate.questions?.length ? (
                  <div className="mt-4 border-t border-[#E8E0FF] pt-3">
                    <span className="text-xs font-bold text-[#5B5678]">Preguntas de práctica:</span>
                    <ul className="mt-2 space-y-2">
                      {st.stages.demonstrate.questions.map((q) => (
                        <li key={q.id} className="rounded-lg bg-white p-2.5 text-xs border border-[#E8E0FF]">
                          <p className="font-semibold text-[#17164F]">{q.prompt}</p>
                          <div className="mt-1.5 grid grid-cols-2 gap-1 text-[#5B5678]">
                            {q.options.map((opt, i) => (
                              <span key={opt} className={i === q.answerIndex ? "font-bold text-[#127A43]" : ""}>
                                • {opt} {i === q.answerIndex ? "✓" : ""}
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {error ? (
            <p role="alert" className="mt-4 rounded-xl bg-[#FEE2E2] px-4 py-3 text-xs text-[#991B1B]">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8E0FF]">
            <button
              type="button"
              onClick={() => setBorradorResp(null)}
              className="rounded-xl border border-[#E8E0FF] px-4 py-2.5 text-xs font-bold text-[#5B5678] hover:bg-[#F7F4FF]"
            >
              Editar texto
            </button>
            <button
              type="button"
              onClick={publicar}
              disabled={publicando}
              className={botonCls}
            >
              {publicando ? "Publicando para tu hijo…" : "Publicar para mi hijo"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <div className={tarjetaCls}>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-bold sm:text-3xl text-[#17164F]">
          Enseña lo que sabes
        </h1>
        <p className="mt-1 text-sm text-[#5B5678]">
          Comparte tu experiencia familiar. La IA la ordenará como una lección para tu hijo, y tú podrás revisarla y aprobarla.
        </p>

        {error ? (
          <p role="alert" className="mt-4 rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
            {error}
          </p>
        ) : null}

        {/* 1. Elegir categoría */}
        <div className="mt-6 space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5B5678]">
            1. Elige una categoría
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categorias.map((cat) => {
              const activa = cat.id === categoria;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoria(cat.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    activa
                      ? "border-[#5636D9] bg-[#EAE5FF] text-[#17164F]"
                      : "border-[#E8E0FF] bg-white text-[#5B5678] hover:border-[#C4B5FD]"
                  }`}
                >
                  <span className="block font-bold text-sm text-[#17164F]">{cat.label}</span>
                  <span className="mt-0.5 block text-xs text-[#5B5678]">{cat.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Título opcional */}
        <div className="mt-5 space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5B5678]">
            Título o tema (opcional)
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Cómo cuidar las plantas de muña en invierno"
            className="w-full rounded-xl border border-[#E8E0FF] bg-[#FAF9FF] px-4 py-2.5 text-sm font-semibold text-[#17164F] outline-none focus:border-[#5636D9] focus:bg-white"
          />
        </div>

        {/* 2. Cuadro grande de texto */}
        <div className="mt-5 space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5B5678]">
            2. Cuenta lo que sabes
          </label>
          <textarea
            rows={7}
            maxLength={LIMITE_TEXTO}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Cuéntalo como se lo contarías a tu hijo. También puedes tocar el micrófono de tu teclado y hablar."
            className="w-full rounded-2xl border border-[#E8E0FF] bg-[#FAF9FF] p-4 text-sm leading-relaxed text-[#17164F] outline-none focus:border-[#5636D9] focus:bg-white"
          />
          <p className="mt-1 text-xs text-[#5B5678]">
            Cuéntalo como se lo contarías a tu hijo. También puedes tocar el micrófono de tu teclado y hablar.
          </p>
          {texto.length >= LIMITE_TEXTO * 0.9 ? (
            <p className="text-xs font-bold text-[#92400E]">
              Te quedan {LIMITE_TEXTO - texto.length} letras. Si necesitas más, prepara otra lección.
            </p>
          ) : null}
        </div>

        {/* 3. Aviso */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E8E0FF] bg-[#FAF9FF] px-3.5 py-2.5 text-xs text-[#5B5678]">
          <WarningIcon weight="fill" className="h-4 w-4 shrink-0 text-[#5636D9]" aria-hidden />
          <span>Aviso: No escribas nombres ni datos personales.</span>
        </div>

        {/* 4. Botón Preparar lección */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={prepararLeccion}
            disabled={cargando || !texto.trim()}
            className={botonCls}
          >
            {cargando ? "Preparando lección con IA…" : "Preparar lección"}
          </button>
        </div>
      </div>
    </div>
  );
}

