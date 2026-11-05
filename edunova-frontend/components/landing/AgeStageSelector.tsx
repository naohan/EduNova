"use client";

import { useState } from "react";
import Image from "next/image";
import { sounds } from "./SoundFX";

const STAGES = [
  {
    id: "exploradores",
    age: "7 a 9 años",
    title: "Exploradores",
    text: "Descubre y observa con historias, voz que lee contigo y juegos simples.",
    avatar: "/assets/landing/explorador.webp",
    image: "/assets/landing/isla-matematica.webp",
    alt: "Mapa 3D de la isla de Matemática con sus estaciones",
    w: 1200,
    h: 792,
  },
  {
    id: "aventureros",
    age: "10 a 12 años",
    title: "Aventureros",
    text: "Resuelve retos, experimenta y compite sano en ligas y duelos.",
    avatar: "/assets/landing/aventurera.webp",
    image: "/assets/landing/sistema-solar.webp",
    alt: "Explorador 3D del sistema solar con los planetas y sus órbitas",
    w: 1400,
    h: 884,
  },
  {
    id: "creadores",
    age: "13 a 15 años",
    title: "Creadores",
    text: "Analiza, simula y explica tus ideas en los laboratorios 3D.",
    avatar: "/assets/landing/creador.webp",
    image: "/assets/landing/corazon-3d.webp",
    alt: "Laboratorio del cuerpo: un corazón en 3D sobre una plataforma",
    w: 1208,
    h: 920,
  },
];

export function AgeStageSelector() {
  const [activeId, setActiveId] = useState(STAGES[1].id);
  const active = STAGES.find((s) => s.id === activeId) ?? STAGES[1];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
      <div role="tablist" aria-label="Elige una edad" className="flex flex-col gap-2">
        {STAGES.map((stage) => {
          const on = stage.id === activeId;
          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls="etapa-panel"
              onClick={() => {
                setActiveId(stage.id);
                sounds.playClick();
              }}
              className={`flex items-center gap-4 rounded-2xl border-2 p-3 text-left transition-colors ${
                on ? "border-[#5636D9] bg-white" : "border-transparent hover:bg-white"
              }`}
            >
              <Image src={stage.avatar} alt="" width={72} height={72} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-[#5B5678]">{stage.age}</span>
                <span className="block font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
                  {stage.title}
                </span>
                {on ? <span className="mt-0.5 block text-[#5B5678]">{stage.text}</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div id="etapa-panel" role="tabpanel" aria-label={active.title}>
        <Image
          key={active.id}
          src={active.image}
          alt={active.alt}
          width={active.w}
          height={active.h}
          sizes="(min-width: 1024px) 640px, 100vw"
          className="entrada aspect-[8/5] w-full rounded-2xl object-cover"
        />
      </div>
    </div>
  );
}
