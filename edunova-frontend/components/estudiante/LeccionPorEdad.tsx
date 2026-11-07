"use client";

import { useAgeTier } from "@/lib/age-tier";
import { getUnit } from "@/lib/api/client";
import { useApi } from "@/lib/api/use-api";
import { hipotesisCreador, modoPorEdad } from "./ageContent";
import { StoryPlayer } from "./StoryPlayer";
import { Mosaico } from "./shared/kit";

// Unidad del backend de la que sale la frase de apertura (primer subtema).
const UNIT_ID = "unit-solar-system";

/**
 * Bloque de la lección que cambia con el modo de edad (HU-02):
 * 7–9: voz destacada y botones de misión grandes · 10–12: ruta por etapas y reto guiado ·
 * 13–15: datos y pregunta de hipótesis abierta.
 *
 * La frase de apertura se lee del backend (`storyTextByAge`); si no responde, se usa el texto local
 * de `ageContent.ts`, que es idéntico, así que la lección no cambia ni parpadea.
 */
export function LeccionPorEdad() {
  const [tier] = useAgeTier();
  const unit = useApi(() => getUnit(UNIT_ID), []);
  const modo = modoPorEdad[tier];

  // Se lee con cuidado: una respuesta incompleta del servidor no debe romper la lección.
  const texto0 =
    unit.status === "ok" ? unit.data?.subtopics?.[0]?.stages?.discover?.storyTextByAge?.[tier] : undefined;
  const desdeApi = typeof texto0 === "string" && texto0.trim() ? texto0 : undefined;
  const gancho = desdeApi ?? modo.gancho;
  const texto = [gancho, ...modo.parrafos].join(" ");

  return (
    <>
      <StoryPlayer key={tier} text={texto} prominent={tier === "EXPLORADOR_7_9"} />

      <article className="rounded-2xl border border-[#E8E0FF] bg-white p-5">
        <div
          className={`space-y-3 leading-relaxed text-[#17164F]/80 ${
            tier === "EXPLORADOR_7_9" ? "text-lg" : "text-sm"
          }`}
        >
          <p data-fuente={desdeApi ? "api" : "local"} className="font-semibold text-[#17164F]">
            {gancho}
          </p>
          {modo.parrafos.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </article>

      <div className="grid grid-cols-2 gap-3">
        <Mosaico href="/estudiante/explorar" etiqueta="Planetas" descripcion="Mira los planetas en 3D" seccion="explorar" imagen="/assets/juego ludico/icon_planeta.png" />
        <Mosaico href="/estudiante/practica" etiqueta="¡A jugar!" descripcion="Practica con una pregunta" seccion="juego" imagen="/assets/juego ludico/icon_dado.png" />
      </div>

      {tier === "CREADOR_13_15" ? (
        <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
          <label htmlFor="hipotesis" className="block text-sm font-bold text-[#17164F]">
            {hipotesisCreador}
          </label>
          <textarea
            id="hipotesis"
            rows={4}
            placeholder="Mi predicción es…"
            className="mt-3 w-full rounded-xl border border-[#E8E0FF] bg-[#F7F4FF] p-3 text-sm text-[#17164F] outline-none focus:border-[#5636D9]"
          />
        </div>
      ) : null}
    </>
  );
}
