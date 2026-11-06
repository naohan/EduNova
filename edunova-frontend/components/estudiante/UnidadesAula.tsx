"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CaretLeftIcon, CheckCircleIcon, LightbulbIcon, WarningIcon } from "@/components/ui/icons";
import { AGE_TIER_EVENT, useAgeTier } from "@/lib/age-tier";
import { listUnits, pictogramUrl } from "@/lib/api/client";
import { ageTierLabel } from "@/lib/api/helpers";
import type { AgeTier, LearningUnit, SubtopicNode, UnitQuestion } from "@/lib/api/edunova-contract";
import { marcaDeTiempo, msDesde, registrarEvento } from "@/lib/api/learning-events";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";
import { StoryPlayer } from "./StoryPlayer";
import { usePerfilAlumno } from "./usePerfilAlumno";

const tarjetaCls = "rounded-2xl border border-[#E8E0FF] bg-white p-5";
const botonCls = "rounded-xl bg-[#5636D9] px-5 py-3 text-sm font-bold text-white disabled:opacity-50";

function Pregunta({
  pregunta,
  subtopicId,
  onSiguiente,
}: {
  pregunta: UnitQuestion;
  subtopicId: string;
  onSiguiente: () => void;
}) {
  const [descartadas, setDescartadas] = useState<number[]>([]);
  const [acerto, setAcerto] = useState(false);
  const [pistas, setPistas] = useState(0);
  const [avisoBono, setAvisoBono] = useState<string | null>(null);
  const inicio = useRef(0);

  useEffect(() => {
    inicio.current = marcaDeTiempo();
  }, []);

  function responder(indice: number) {
    if (acerto || descartadas.includes(indice)) return;
    const correcta = indice === pregunta.answerIndex;
    // Se marca al instante: esperar a la red dejaría al estudiante sin reacción y podría tocar dos veces.
    if (correcta) setAcerto(true);
    else setDescartadas([...descartadas, indice]);
    void registrarEvento({
      activity: "QUIZ",
      correct: correcta,
      subtopicId,
      questionId: pregunta.id,
      attempt: descartadas.length + 1,
      hintsUsed: pistas,
      timeMs: msDesde(inicio.current),
    }).then((res) => {
      if (res?.effortBonus) setAvisoBono("Tres seguidas. +5 de esfuerzo");
    });
  }

  return (
    <div className={tarjetaCls}>
      <h3 className="font-bold text-[#17164F]">{pregunta.prompt}</h3>
      <div className="mt-3 space-y-2">
        {pregunta.options.map((opcion, i) => {
          const descartada = descartadas.includes(i);
          const buena = acerto && i === pregunta.answerIndex;
          return (
            <button
              key={opcion}
              type="button"
              onClick={() => responder(i)}
              disabled={descartada || acerto}
              className={`w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold text-[#17164F] ${
                buena
                  ? "border-[#2DBE70] bg-[#E9F9F0]"
                  : descartada
                    ? "border-[#EF4444] bg-[#FFF5F5] opacity-70"
                    : "border-[#E8E0FF] bg-white"
              }`}
            >
              {opcion}
            </button>
          );
        })}
      </div>

      {avisoBono ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#2DBE70] bg-[#E9F9F0] px-3 py-2 text-xs font-bold text-[#127A43]">
          <CheckCircleIcon weight="fill" className="h-4 w-4 shrink-0 text-[#2DBE70]" aria-hidden />
          <span>{avisoBono}</span>
        </div>
      ) : null}

      {acerto ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm font-bold text-[#127A43]">
            <CheckCircleIcon weight="fill" className="h-5 w-5" aria-hidden /> ¡Bien!
          </p>
          <button type="button" onClick={onSiguiente} className={botonCls}>
            Siguiente
          </button>
        </div>
      ) : (
        <>
          {descartadas.length ? (
            <p className="mt-3 text-sm text-[#17164F]/80" role="status">
              Casi. Prueba otra vez.
            </p>
          ) : null}
          {pistas ? (
            <p className="mt-3 rounded-xl bg-[#F2EEFF] p-3 text-sm text-[#17164F]">{pregunta.hint}</p>
          ) : pregunta.hint ? (
            <button
              type="button"
              onClick={() => setPistas(1)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5636D9]"
            >
              <LightbulbIcon className="h-4 w-4" aria-hidden /> Ver pista
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

function PictogramaItem({ word, id }: { word: string; id: number }) {
  const [fallo, setFallo] = useState(false);

  if (fallo) {
    return (
      <span className="rounded-xl border border-[#E8E0FF] bg-[#F2EEFF] px-2.5 py-1 text-xs font-semibold text-[#17164F]">
        {word}
      </span>
    );
  }

  return (
    <div className="flex w-20 flex-col items-center rounded-xl border border-[#E8E0FF] bg-white p-2 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={pictogramUrl(id)}
        alt={word}
        onError={() => setFallo(true)}
        className="h-14 w-14 object-contain"
      />
      <span className="mt-1 w-full truncate text-[11px] font-semibold text-[#17164F]">{word}</span>
    </div>
  );
}

function Subtema({
  subtema,
  onFin,
  esUltimo,
  tier,
}: {
  subtema: SubtopicNode;
  onFin: () => void;
  esUltimo: boolean;
  tier: AgeTier;
}) {
  const [numero, setNumero] = useState(0);
  const [lecturaFacilActiva, setLecturaFacilActiva] = useState(false);

  const easyReadText = subtema.stages.discover.easyReadText;
  const pictograms = subtema.stages.discover.pictograms ?? [];

  const textoNormal = subtema.stages.discover.storyTextByAge[tier];
  const textoParaAudio = lecturaFacilActiva && easyReadText ? easyReadText : textoNormal;
  const preguntas = subtema.stages.demonstrate.questions ?? [];
  const pregunta = preguntas[numero];

  const frasesFaciles = easyReadText?.match(/[^.!?]+[.!?]*/g)?.map((f) => f.trim()).filter(Boolean) ?? [];

  return (
    <div className="space-y-4">
      <StoryPlayer
        key={`${subtema.id}-${tier}-${lecturaFacilActiva}`}
        text={textoParaAudio}
        prominent={tier === "EXPLORADOR_7_9"}
      />
      <article className={tarjetaCls}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-[#17164F]">{subtema.title}</h2>
          {easyReadText ? (
            <label className="inline-flex cursor-pointer select-none items-center gap-2 rounded-xl border border-[#E8E0FF] bg-[#FAF9FF] px-2.5 py-1 text-xs font-semibold text-[#5636D9]">
              <input
                type="checkbox"
                checked={lecturaFacilActiva}
                onChange={(e) => setLecturaFacilActiva(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-[#E8E0FF] text-[#5636D9] focus:ring-[#5636D9]"
              />
              Lectura fácil
            </label>
          ) : null}
        </div>

        {lecturaFacilActiva && easyReadText ? (
          <div className="mt-3">
            <div className="space-y-2 text-base font-medium leading-relaxed text-[#17164F] sm:text-lg">
              {frasesFaciles.map((frase, idx) => (
                <p key={idx}>{frase}</p>
              ))}
            </div>

            {pictograms.length > 0 && (
              <div className="mt-4 border-t border-[#E8E0FF] pt-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  {pictograms.map((p) => (
                    <PictogramaItem key={p.id} word={p.word} id={p.id} />
                  ))}
                </div>
                <p className="mt-2.5 text-[11px] text-[#5B5678]">
                  Pictogramas: Sergio Palao. Origen: ARASAAC (arasaac.org). Licencia: CC BY-NC-SA. Propiedad: Gobierno de Aragón.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p
            className={`mt-2 leading-relaxed text-[#17164F]/85 ${tier === "EXPLORADOR_7_9" ? "text-lg" : "text-sm"}`}
          >
            {textoNormal}
          </p>
        )}
      </article>

      {pregunta ? (
        <Pregunta
          key={pregunta.id}
          pregunta={pregunta}
          subtopicId={subtema.id}
          onSiguiente={() => (numero + 1 < preguntas.length ? setNumero(numero + 1) : onFin())}
        />
      ) : (
        <button type="button" onClick={onFin} className={botonCls}>
          {esUltimo ? "Terminar unidad" : "Siguiente tema"}
        </button>
      )}
    </div>
  );
}

function Unidad({
  unidad,
  onVolver,
  tier,
}: {
  unidad: LearningUnit;
  onVolver: () => void;
  tier: AgeTier;
}) {
  const [indice, setIndice] = useState(0);
  const subtema = unidad.subtopics[indice];

  return (
    <div>
      <button
        type="button"
        onClick={onVolver}
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-[#5636D9]"
      >
        <CaretLeftIcon className="h-4 w-4" aria-hidden /> Mis unidades
      </button>
      <p className="text-sm text-[#5B5678]">
        {unidad.title}
        {subtema ? ` · Tema ${indice + 1} de ${unidad.subtopics.length}` : ""}
      </p>

      {unidad.safetyNote ? (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-3.5 text-xs font-bold text-[#9A3412]">
          <WarningIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#EA580C]" aria-hidden />
          <span>{unidad.safetyNote}</span>
        </div>
      ) : null}

      {subtema ? (
        <div className="mt-3">
          <Subtema
            key={subtema.id}
            subtema={subtema}
            esUltimo={indice + 1 === unidad.subtopics.length}
            onFin={() => setIndice(indice + 1)}
            tier={tier}
          />
        </div>
      ) : (
        <section className={`${tarjetaCls} mt-3 text-center`}>
          <CheckCircleIcon weight="fill" className="mx-auto h-10 w-10 text-[#127A43]" aria-hidden />
          <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            ¡Terminaste la unidad!
          </h2>
          <p className="mt-1 text-sm text-[#5B5678]">Tu docente ya puede ver cómo avanzas en cada tema.</p>
          <button type="button" onClick={onVolver} className={`${botonCls} mt-4`}>
            Volver a mis unidades
          </button>
        </section>
      )}
    </div>
  );
}

/** Unidades que el docente publicó para el aula, adaptadas a la edad elegida. */
export function UnidadesAula() {
  const usuario = useSessionUser();
  const perfil = usePerfilAlumno();
  const [tierElegido] = useAgeTier();
  const [usoSelector, setUsoSelector] = useState(false);

  // El selector manda en cuanto el estudiante lo toca, incluso si toca el nivel que ya estaba marcado.
  useEffect(() => {
    const marcar = () => setUsoSelector(true);
    window.addEventListener(AGE_TIER_EVENT, marcar);
    return () => window.removeEventListener(AGE_TIER_EVENT, marcar);
  }, []);

  const nivelDiagnostico = usoSelector ? undefined : perfil?.diagnosticTier;
  const effectiveTier: AgeTier = nivelDiagnostico ?? tierElegido;

  const unidades = useApi(listUnits, []);
  const [abierta, setAbierta] = useState<string | null>(null);

  if (unidades.status === "loading") return <p className="text-sm text-[#5B5678]">Cargando tus unidades…</p>;
  if (unidades.status === "error") {
    return (
      <p role="status" className="rounded-xl bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]">
        No se pudo conectar con el servidor. Tus unidades aparecerán cuando vuelva la conexión.
      </p>
    );
  }

  const aula = usuario?.classroomCode;
  // Lo más reciente primero: incluye las de su aula y las creadas por su familia para él
  const lista = unidades.data
    .filter((u) => {
      if (u.familyStudentId) return u.familyStudentId === usuario?.id;
      return !aula || u.classroomCode === aula;
    })
    .reverse();
  const unidad = lista.find((u) => u.id === abierta);
  if (unidad) {
    return (
      <Unidad
        key={unidad.id}
        unidad={unidad}
        onVolver={() => setAbierta(null)}
        tier={effectiveTier}
      />
    );
  }

  return (
    <div>
      {!perfil?.diagnosticTier && (
        <div className="mb-3 flex justify-end">
          <Link
            href="/estudiante/diagnostico"
            className="text-xs font-semibold text-[#5B5678] underline hover:text-[#5636D9]"
          >
            Ajustar mis lecturas
          </Link>
        </div>
      )}
      {nivelDiagnostico ? (
        <p className="mb-3 text-xs text-[#5B5678]">
          Tus lecturas empiezan en nivel {ageTierLabel[nivelDiagnostico]}. Puedes cambiarlo con el selector.
        </p>
      ) : null}
      {!lista.length ? (
        <p className="text-sm text-[#5B5678]">Tu docente todavía no publicó unidades.</p>
      ) : (
        <ul className="space-y-3">
          {lista.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => setAbierta(u.id)}
                className="w-full rounded-2xl border border-[#E8E0FF] bg-white p-4 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="block font-bold text-[#17164F]">{u.title}</span>
                  {u.familyStudentId ? (
                    <span className="shrink-0 rounded-full bg-[#EAE5FF] px-2.5 py-0.5 text-xs font-bold text-[#5636D9]">
                      De tu familia
                    </span>
                  ) : null}
                </div>
                <span className="text-sm text-[#5B5678]">
                  {u.subtopics.length} {u.subtopics.length === 1 ? "tema" : "temas"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
