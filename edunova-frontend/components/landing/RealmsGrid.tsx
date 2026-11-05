"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { sounds } from "./SoundFX";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/ui/icons";

// Las listas salen de las lecciones reales de cada mapa.
const REALMS = [
  {
    id: "matematica",
    title: "Matemática",
    tag: "Una isla de geometría en 3D",
    image: "/assets/matematica.png",
    w: 603,
    h: 281,
    features: ["Figuras planas, el cubo y figuras 3D", "Perímetro, área y volumen", "Diseño 3D al final de la ruta"],
    fondo: "#FFF6D6",
    boton: "#FFC928",
    borde: "#C98F00",
    texto: "#17164F",
    check: "#C98F00",
  },
  {
    id: "ciencia",
    title: "Ciencia y Tecnología",
    tag: "Laboratorios en 3D",
    image: "/assets/cienciatecnologia.png",
    w: 473,
    h: 303,
    features: ["Órganos en 3D: corazón, pulmones y cerebro", "Explorador del sistema solar", "Misiones con recompensa"],
    fondo: "#E6F2FF",
    boton: "#4C9EFF",
    borde: "#2472CC",
    texto: "#17164F",
    check: "#2472CC",
  },
  {
    id: "comunicacion",
    title: "Comunicación",
    tag: "Lecturas y relatos",
    image: "/assets/comunicacion.png",
    w: 619,
    h: 293,
    features: ["Lecturas con voz que acompaña", "Sinónimos y palabras que suenan", "Elige el final y publica tu relato"],
    fondo: "#F2EEFF",
    boton: "#5636D9",
    borde: "#3B229D",
    texto: "#FFFFFF",
    check: "#5636D9",
  },
  {
    id: "sociales",
    title: "Ciencias Sociales",
    tag: "El mundo y su historia",
    image: "/assets/cienciasociales.png",
    w: 592,
    h: 322,
    features: ["Nuestro planeta, mapas y continentes", "Cultura, escalas e historia", "Ciudadanía y patrimonio"],
    fondo: "#FFEDE8",
    boton: "#FF8A73",
    borde: "#D9583F",
    texto: "#17164F",
    check: "#D9583F",
  },
];

export function RealmsGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {REALMS.map((realm) => (
        <article
          key={realm.id}
          onMouseEnter={() => sounds.playHover()}
          className="flex flex-col justify-between rounded-2xl border border-[#E8E0FF] bg-white p-5 transition-colors hover:border-[#5636D9]"
        >
          <div>
            <div
              className="flex h-36 items-center justify-center rounded-xl p-3"
              style={{ backgroundColor: realm.fondo }}
            >
              <Image
                src={realm.image}
                alt=""
                width={realm.w}
                height={realm.h}
                sizes="240px"
                className="max-h-28 w-auto object-contain"
              />
            </div>

            <h3 className="mt-4 font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
              {realm.title}
            </h3>
            <p className="text-sm font-semibold text-[#5B5678]">{realm.tag}</p>

            <ul className="mt-3 space-y-2 text-sm text-[#5B5678]">
              {realm.features.map((feature) => (
                <li key={feature} className="flex items-start gap-1.5">
                  <CheckCircleIcon
                    weight="fill"
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: realm.check }}
                    aria-hidden
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/login"
            aria-label={`Explorar ${realm.title}`}
            className="btn-tactil mt-5 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold"
            style={
              {
                backgroundColor: realm.boton,
                color: realm.texto,
                "--tactil-borde": realm.borde,
              } as CSSProperties
            }
          >
            Explorar
            <ArrowRightIcon weight="bold" className="h-4 w-4" aria-hidden />
          </a>
        </article>
      ))}
    </div>
  );
}
