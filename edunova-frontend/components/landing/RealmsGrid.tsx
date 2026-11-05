"use client";

import React, { useState } from "react";
import Image from "next/image";
import { sounds } from "./SoundFX";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/ui/icons";

interface Realm {
  id: string;
  title: string;
  tag: string;
  color: string;
  accentBg: string;
  borderColor: string;
  image: string;
  w: number;
  h: number;
  features: string[];
  ctaUrl: string;
  curriculumBadge: string;
}

const REALMS: Realm[] = [
  {
    id: "matematica",
    title: "Matemática Vivencial",
    tag: "Isla de Fractalia & Geometría 3D",
    color: "#C98F00",
    accentBg: "bg-[#FFF6D6]",
    borderColor: "border-[#FFC928]",
    image: "/assets/matematica.png",
    w: 603,
    h: 281,
    features: [
      "Retos de fracciones con islas piratas y tesoros",
      "Figuras geométricas 3D manipulables con rotación",
      "Cálculo mental gamificado y multiplicadores de racha",
    ],
    ctaUrl: "/estudiante/matematica/mapa",
    curriculumBadge: "Competencias: Cantidad y Forma",
  },
  {
    id: "ciencia",
    title: "Ciencia y Tecnología",
    tag: "Laboratorio Bio-3D & Espacio",
    color: "#1697A6",
    accentBg: "bg-[#E6F9FB]",
    borderColor: "border-[#25CFE0]",
    image: "/assets/cienciatecnologia.png",
    w: 473,
    h: 303,
    features: [
      "Simulador 3D de órganos vitales (Corazón, Pulmones, Cerebro)",
      "Explorador orbital interactivo del Sistema Solar",
      "Experimentos virtuales seguros de física y química",
    ],
    ctaUrl: "/estudiante/cuerpo",
    curriculumBadge: "Competencias: Indagación y Mundo Físico",
  },
  {
    id: "comunicacion",
    title: "Comunicación Creativa",
    tag: "Palacio de Vocabulario y Creación",
    color: "#5636D9",
    accentBg: "bg-[#F2EEFF]",
    borderColor: "border-[#5636D9]",
    image: "/assets/comunicacion.png",
    w: 619,
    h: 293,
    features: [
      "Cuentos y textos acompañados con narrador de voz humana",
      "Flashcards dinámicas para expandir el léxico",
      "Talleres colaborativos de redacción de historias",
    ],
    ctaUrl: "/estudiante/comunicacion/mapa",
    curriculumBadge: "Competencias: Lectura y Expresión Oral",
  },
  {
    id: "sociales",
    title: "Ciencias Sociales",
    tag: "Archipiélago Histórico y Ciudadanía",
    color: "#D9583F",
    accentBg: "bg-[#FFEDE8]",
    borderColor: "border-[#FF8A73]",
    image: "/assets/cienciasociales.png",
    w: 592,
    h: 322,
    features: [
      "Mapas de expedición interactiva por el Perú y el planeta",
      "Líneas de tiempo visuales de civilizaciones",
      "Dilemas éticos y debates sobre ciudadanía activa",
    ],
    ctaUrl: "/estudiante/sociales/mapa",
    curriculumBadge: "Competencias: Tiempo Histórico y Espacio",
  },
];

export function RealmsGrid() {
  const [hoveredRealm, setHoveredRealm] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {REALMS.map((realm) => {
        const isHovered = hoveredRealm === realm.id;
        return (
          <article
            key={realm.id}
            onMouseEnter={() => {
              setHoveredRealm(realm.id);
              sounds.playHover();
            }}
            onMouseLeave={() => setHoveredRealm(null)}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 bg-white p-6 transition-all duration-300 ${
              isHovered
                ? `shadow-2xl -translate-y-2 ${realm.borderColor}`
                : "border-[#E8E0FF] shadow-sm hover:border-slate-300"
            }`}
          >
            {/* Cabecera de la tarjeta */}
            <div>
              <div className="flex items-center justify-between">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                  style={{
                    backgroundColor: `${realm.color}15`,
                    color: realm.color,
                  }}
                >
                  {realm.curriculumBadge}
                </span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: realm.color }}
                />
              </div>

              {/* Imagen Ilustrada del Área */}
              <div className="relative mt-4 flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#F7F4FF] to-white p-2">
                <Image
                  src={realm.image}
                  alt={realm.title}
                  width={realm.w}
                  height={realm.h}
                  className="max-h-32 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <h4 className="mt-4 font-[family-name:var(--font-fredoka)] text-xl font-bold text-[#17164F]">
                {realm.title}
              </h4>
              <p className="text-xs font-bold text-[#5B5678]">{realm.tag}</p>

              {/* Lista de Habilidades */}
              <ul className="mt-4 space-y-2 border-t border-[#F2EEFF] pt-3 text-xs text-[#5B5678]">
                {realm.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircleIcon
                      weight="fill"
                      className="mt-0.5 h-3.5 w-3.5 shrink-0"
                      style={{ color: realm.color }}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botón de Entrada */}
            <div className="mt-6 pt-3">
              <a
                href="/login"
                className="btn-tactil flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all"
                style={{
                  backgroundColor: realm.color,
                  color: "#FFFFFF",
                }}
              >
                <span>Explorar Mundo</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
