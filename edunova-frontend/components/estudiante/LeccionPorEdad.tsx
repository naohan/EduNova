"use client";

import Link from "next/link";
import { useAgeTier } from "@/lib/age-tier";
import { getUnit } from "@/lib/api/client";
import { useApi } from "@/lib/api/use-api";
import { hipotesisCreador, modoPorEdad } from "./ageContent";
import { rutaPasos } from "./data";
import { StoryPlayer } from "./StoryPlayer";
import Image from "next/image";

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
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#F2EEFF] px-4 py-2.5">
        <div className="text-sm font-bold text-[#5636D9]">{modo.etiqueta}</div>
        <div className="text-xs text-[#17164F]/70">{modo.descripcion}</div>
      </div>

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

      {tier === "EXPLORADOR_7_9" ? (
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/estudiante/explorar"
            className="flex flex-col items-center gap-1 rounded-2xl bg-[#EAF6FF] py-5 text-center text-base font-bold text-[#17164F]"
          >
            <Image src="/assets/juego ludico/icon_planeta.png" alt="" width={269} height={194} className="h-12 w-auto" />
            Mira los planetas
          </Link>
          <Link
            href="/estudiante/practica"
            className="flex flex-col items-center gap-1 rounded-2xl bg-[#E9F9F0] py-5 text-center text-base font-bold text-[#17164F]"
          >
            <Image src="/assets/juego ludico/icon_dado.png" alt="" width={170} height={173} className="h-12 w-auto" />
            ¡A jugar!
          </Link>
        </div>
      ) : null}

      {tier === "AVENTURERO_10_12" ? (
        <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4">
          <div className="mb-3 text-sm font-bold text-[#17164F]">Tu ruta</div>
          <ol className="space-y-2">
            {rutaPasos.map((paso, i) => (
              <li key={paso.id}>
                <Link
                  href={paso.href}
                  className="flex items-center gap-3 rounded-xl bg-[#F7F4FF] px-3 py-2.5 text-sm"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5636D9] text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-[#17164F]">{paso.titulo}</span>
                  <span className="text-xs text-[#5B5678]">{paso.desc}</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-[#17164F]/70">
            Reto guiado: encuentra la Tierra entre los planetas en el explorador 3D.
          </p>
        </div>
      ) : null}

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
