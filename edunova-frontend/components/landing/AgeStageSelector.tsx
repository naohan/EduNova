"use client";

import React, { useState } from "react";
import Image from "next/image";
import { sounds } from "./SoundFX";
import {
  CheckCircleIcon,
  ArrowRightIcon,
  TrophyIcon,
} from "@/components/ui/icons";

interface StageData {
  id: string;
  age: string;
  title: string;
  subtitle: string;
  description: string;
  tagline: string;
  badge: string;
  color: string;
  bgGrad: string;
  borderColor: string;
  avatar: string;
  previewImage: string;
  previewAlt: string;
  features: string[];
  sampleQuest: {
    name: string;
    reward: string;
    tag: string;
  };
}

const STAGES: StageData[] = [
  {
    id: "exploradores",
    age: "7 a 9 años",
    title: "Exploradores",
    subtitle: "Aprender jugando con curiosidad natural",
    description:
      "Diseñado con letras grandes, explicaciones orales con audio, mundos ilustrados y la compañía constante de Woebling, el robot tutor.",
    tagline: "¡Descubre, toca y aprende sin frustración!",
    badge: "Etapa Primaria Inicial",
    color: "#2DBE70",
    bgGrad: "from-[#113B26]/30 via-[#0E2419] to-[#0A1610]",
    borderColor: "border-[#2DBE70]/40",
    avatar: "/assets/landing/explorador.webp",
    previewImage: "/assets/landing/isla-matematica.webp",
    previewAlt: "Isla de matemática para niños exploradores con retos lúdicos",
    features: [
      "Lectura acompañada con voz natural y cuentos ilustrados",
      "Matemáticas táctiles con bloques y piratas de fracciones",
      "Recompensas inmediatas con estrellas, gemas y stickers",
      "Interfaz libre de frustración con modo guiado paso a paso",
    ],
    sampleQuest: {
      name: "El Tesoro de la Isla Fraccional",
      reward: "+150 Estrellas Mágicas",
      tag: "Matemática 3°",
    },
  },
  {
    id: "aventureros",
    age: "10 a 12 años",
    title: "Aventureros",
    subtitle: "Retos estratégicos, ligas y misiones épicas",
    description:
      "Los estudiantes resuelven enigmas de ciencias sociales, compiten en duelos amigables de razonamiento matemático y desbloquean rangos en la Liga de la Sabiduría.",
    tagline: "¡Supera desafíos en equipo y sube de rango!",
    badge: "Etapa Primaria Alta",
    color: "#FFC928",
    bgGrad: "from-[#47360A]/30 via-[#261D05] to-[#120E02]",
    borderColor: "border-[#FFC928]/40",
    avatar: "/assets/landing/aventurera.webp",
    previewImage: "/assets/landing/sistema-solar.webp",
    previewAlt: "Explorador interactivo del sistema solar para aventureros",
    features: [
      "Duelos de ingenio y desafíos por tiempo controlado",
      "Simulador 3D del Sistema Solar y capas de la Tierra",
      "Ligas de progreso semanal entre colegios y aulas",
      "Feedback pedagógico inteligente para aprender del error",
    ],
    sampleQuest: {
      name: "Órbita Crítica: Rescate en Marte",
      reward: "+300 XP + Trofeo Cósmico",
      tag: "Ciencia y Tecnología",
    },
  },
  {
    id: "creadores",
    age: "13 a 15 años",
    title: "Creadores",
    subtitle: "Modelado 3D, proyectos y pensamiento crítico",
    description:
      "Herramientas avanzadas para estudiantes de secundaria: laboratorios de anatomía en 3D, simuladores de debate ciudadano y proyectos reales vinculados al MINEDU.",
    tagline: "¡Domina el conocimiento y diseña el futuro!",
    badge: "Etapa Secundaria",
    color: "#5636D9",
    bgGrad: "from-[#2A166E]/40 via-[#180E42] to-[#0A0621]",
    borderColor: "border-[#5636D9]/50",
    avatar: "/assets/landing/creador.webp",
    previewImage: "/assets/landing/corazon-3d.webp",
    previewAlt: "Laboratorio 3D de anatomía humana interactiva con corazón bombeando",
    features: [
      "Modelos 3D manipulables: Corazón, Cerebro, Pulmones e Intestinos",
      "Ensayos y debates guiados con argumentación estructurada",
      "Portafolio digital de evidencias para evaluación docente",
      "Preparación formativa preuniversitaria y desarrollo de proyectos",
    ],
    sampleQuest: {
      name: "Disección Virtual: El Sistema Circulatorio",
      reward: "+500 XP + Certificado de Habilidad",
      tag: "Biología y Salud",
    },
  },
];

export function AgeStageSelector() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const active = STAGES[selectedIdx];

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    sounds.playClick();
  };

  return (
    <div className="w-full">
      {/* Selector de Pestañas Táctil Estilo Switcher de Videojuego */}
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 rounded-2xl bg-[#17164F]/5 p-2 backdrop-blur-sm sm:gap-3">
        {STAGES.map((stage, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => handleSelect(idx)}
              className={`relative flex flex-1 flex-col items-center justify-center rounded-xl py-3 px-2 text-center transition-all duration-200 sm:px-4 ${
                isSelected
                  ? "bg-white text-[#17164F] shadow-lg shadow-[#5636D9]/10 scale-102 font-bold ring-2 ring-[#5636D9]"
                  : "text-[#5B5678] hover:bg-white/60 hover:text-[#17164F]"
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold sm:text-sm">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <span className="truncate">{stage.title}</span>
              </div>
              <span className="mt-0.5 text-[11px] font-bold text-[#8681A6]">
                {stage.age}
              </span>

              {isSelected && (
                <span
                  className="absolute -bottom-1 h-1 w-8 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tarjeta de Contenido Dinámico de la Etapa Seleccionada */}
      <div className="mt-8 overflow-hidden rounded-3xl border-2 border-[#E8E0FF] bg-white p-6 shadow-xl transition-all duration-300 sm:p-10 lg:grid lg:grid-cols-12 lg:gap-10">
        {/* Columna Izquierda: Información de la Etapa */}
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: `${active.color}15`,
                  color: active.color === "#FFC928" ? "#9E6D00" : active.color,
                }}
              >
                {active.badge}
              </span>
              <span className="text-sm font-bold text-[#5B5678]">
                Rango: {active.age}
              </span>
            </div>

            <h3 className="mt-3 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F] sm:text-3xl">
              {active.title}: <span style={{ color: active.color === "#FFC928" ? "#C98F00" : active.color }}>{active.subtitle}</span>
            </h3>

            <p className="mt-3 text-base leading-relaxed text-[#5B5678]">
              {active.description}
            </p>

            {/* Lista de Perks / Características Clave */}
            <div className="mt-6 space-y-2.5">
              {active.features.map((feature, fIdx) => (
                <div key={fIdx} className="flex items-start gap-2.5 text-sm font-semibold text-[#17164F]">
                  <CheckCircleIcon
                    weight="fill"
                    className="mt-0.5 h-5 w-5 shrink-0"
                    style={{ color: active.color === "#FFC928" ? "#C98F00" : active.color }}
                  />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Misión de Prueba Rápida de la Etapa */}
          <div className="mt-8 rounded-2xl border-2 border-dashed border-[#E8E0FF] bg-[#F7F4FF] p-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#5636D9]">
              <span className="flex items-center gap-1.5">
                <TrophyIcon className="h-4 w-4" /> MISIÓN DESTACADA DE LA ETAPA
              </span>
              <span className="rounded bg-[#5636D9]/10 px-2 py-0.5">{active.sampleQuest.tag}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <h5 className="font-[family-name:var(--font-fredoka)] text-base font-bold text-[#17164F]">
                  {active.sampleQuest.name}
                </h5>
                <span className="text-xs font-bold text-[#2DBE70]">
                  Recompensa: {active.sampleQuest.reward}
                </span>
              </div>
              <a
                href="/login"
                className="btn-tactil inline-flex items-center gap-1.5 rounded-xl bg-[#5636D9] px-4 py-2 text-xs font-bold text-white transition-transform hover:scale-105"
              >
                <span>Probar</span>
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Vista Previa Gráfica y Avatar */}
        <div className="relative mt-8 flex flex-col items-center justify-center lg:mt-0 lg:col-span-5">
          {/* Tarjeta de visualización enmarcada con sombra gamer */}
          <div className="relative w-full overflow-hidden rounded-2xl border-4 border-white shadow-2xl shadow-[#17164F]/15">
            <Image
              src={active.previewImage}
              alt={active.previewAlt}
              width={800}
              height={500}
              className="h-64 w-full object-cover transition-all duration-500 hover:scale-105 sm:h-72"
            />
            {/* Overlay sutil inferior */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#17164F]/80 via-[#17164F]/40 to-transparent p-4 text-white">
              <span className="text-xs font-mono font-bold tracking-wider text-[#00F0FF]">
                INTERFAZ REAL DE LA PLATAFORMA
              </span>
              <p className="text-sm font-semibold">{active.tagline}</p>
            </div>
          </div>

          {/* Avatar del estudiante en esquina flotante */}
          <div className="absolute -bottom-4 -right-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br from-[#F2EEFF] to-white shadow-xl transition-transform hover:scale-110 sm:h-28 sm:w-28">
            <Image
              src={active.avatar}
              alt=""
              width={160}
              height={160}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
