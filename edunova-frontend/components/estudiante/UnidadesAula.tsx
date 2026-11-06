"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CaretLeftIcon, CheckCircleIcon, LightbulbIcon } from "@/components/ui/icons";
import { useAgeTier } from "@/lib/age-tier";
import { listUnits } from "@/lib/api/client";
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
  const inicio = useRef(0);

  useEffect(() => {
    inicio.current = marcaDeTiempo();
  }, []);

  function responder(indice: number) {
    if (acerto || descartadas.includes(indice)) return;
    const correcta = indice === pregunta.answerIndex;
    registrarEvento({
      activity: "QUIZ",
      correct: correcta,
      subtopicId,
      questionId: pregunta.id,
      attempt: descartadas.length + 1,
      hintsUsed: pistas,
      timeMs: msDesde(inicio.current),
    });
    if (correcta) setAcerto(true);
    else setDescartadas([...descartadas, indice]);
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
  const texto = subtema.stages.discover.storyTextByAge[tier];
  const preguntas = subtema.stages.demonstrate.questions ?? [];
  const pregunta = preguntas[numero];

  return (
    <div className="space-y-4">
      <StoryPlayer key={`${subtema.id}-${tier}`} text={texto} prominent={tier === "EXPLORADOR_7_9"} />
      <article className={tarjetaCls}>
        <h2 className="font-bold text-[#17164F]">{subtema.title}</h2>
        <p
          className={`mt-2 leading-relaxed text-[#17164F]/85 ${tier === "EXPLORADOR_7_9" ? "text-lg" : "text-sm"}`}
        >
          {texto}
        </p>
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
  const [manualTier] = useAgeTier();
  const [manualOverride, setManualOverride] = useState<AgeTier | null>(null);
  const prevManualRef = useRef(manualTier);

  useEffect(() => {
    if (prevManualRef.current !== manualTier) {
      setManualOverride(manualTier);
      prevManualRef.current = manualTier;
    }
  }, [manualTier]);

  const effectiveTier: AgeTier =
    manualOverride ?? perfil?.diagnosticTier ?? usuario?.ageTier ?? manualTier;

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
  // Lo más reciente primero: lo último que publicó el docente es lo que toca hoy.
  const lista = unidades.data.filter((u) => !aula || u.classroomCode === aula).reverse();
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
                <span className="block font-bold text-[#17164F]">{u.title}</span>
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
