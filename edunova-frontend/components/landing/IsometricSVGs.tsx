"use client";

import React, { useState } from "react";
import Image from "next/image";
import { sounds } from "./SoundFX";

// ============================================================================
// ISO CITADEL HERO (La Ciudadela Flotante de EduNova)
// Diseñado siguiendo las normas de ANATOMY:
// - Proyección isométrica limpia (ángulos 30°)
// - Sombreado a 4 tonos (Top: luz directa, Left: medio tono, Right: sombra profunda, Accents: neón)
// - Ensamblaje mecánico coherente: isla flotante de estratos geológicos,
//   pod de aula cuántica, torre de cristal con haz resonante, engranajes en movimiento,
//   cables tensores y marco tipo placa técnica interactiva "Fig 01".
// ============================================================================

export function IsoCitadelHero() {
  const [activeNode, setActiveNode] = useState<string>("cristal");
  const [viewMode, setViewMode] = useState<"render" | "vector">("render");

  const nodesInfo: Record<string, { title: string; desc: string; badge: string; color: string }> = {
    cristal: {
      title: "Núcleo de Curiosidad",
      desc: "Generador de energía cognitiva infinita alimentado por preguntas de los estudiantes.",
      badge: "Potencia: 99.8% NOMINAL",
      color: "#25CFE0",
    },
    torre: {
      title: "Observatorio Cósmico",
      desc: "Telescopio orbital 3D para explorar el sistema solar y constelaciones en tiempo real.",
      badge: "Señal: Órbita Estable",
      color: "#FFC928",
    },
    engranaje: {
      title: "Motor de Retos Gamificados",
      desc: "Distribuye misiones diarias, multiplicadores de XP y batallas lógicas de matemáticas.",
      badge: "Cadencia: 120 RPM",
      color: "#FF5C5C",
    },
    laboratorio: {
      title: "Bio-Domus 3D",
      desc: "Simulador de anatomía humana interactiva con órganos hiperrealistas manipulables.",
      badge: "Sensores: 100% Calibrados",
      color: "#2DBE70",
    },
  };

  const handleSelect = (node: string) => {
    setActiveNode(node);
    sounds.playHover();
  };

  const current = nodesInfo[activeNode] || nodesInfo.cristal;

  return (
    <div className="relative w-full max-w-[620px] mx-auto select-none">
      {/* Marco de especificación estilo Anatomy Figure */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-[#5636D9]/25 bg-gradient-to-b from-[#17164F]/95 via-[#13113D] to-[#0A0924] p-4 sm:p-6 shadow-2xl shadow-[#5636D9]/20 backdrop-blur-md">
        {/* Cabecera Técnica */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 animate-ping rounded-full bg-[#25CFE0]" />
            <span className="font-mono font-bold tracking-wider text-[#25CFE0]">FIG. 01</span>
            <span className="text-white/40">/</span>
            <span className="font-semibold text-white/80">CIUDADELA ISOMÉTRICA EDUNOVA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-white/10 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setViewMode("render");
                  sounds.playClick();
                }}
                className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold transition-all ${
                  viewMode === "render"
                    ? "bg-[#5636D9] text-white shadow-md shadow-[#5636D9]/50 scale-102"
                    : "text-white/60 hover:text-white"
                }`}
              >
                ✨ Render 3D
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("vector");
                  sounds.playClick();
                }}
                className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold transition-all ${
                  viewMode === "vector"
                    ? "bg-[#5636D9] text-white shadow-md shadow-[#5636D9]/50 scale-102"
                    : "text-white/60 hover:text-white"
                }`}
              >
                📐 Vector 30°
              </button>
            </div>
          </div>
        </div>

        {/* Lienzo: Render 3D o SVG Isométrico según modo */}
        <div className="relative mt-3 flex items-center justify-center min-h-[300px] sm:min-h-[380px]">
          {/* Brillo de fondo estelar */}
          <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-[#5636D9]/25 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute right-4 top-10 h-40 w-40 rounded-full bg-[#25CFE0]/20 blur-2xl" />

          {viewMode === "render" ? (
            <div className="relative w-full overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl">
              <Image
                src="/assets/landing/ciudadela-hero-3d.jpg"
                alt="Ciudadela flotante 3D del conocimiento de EduNova"
                width={800}
                height={600}
                className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
                priority
              />

              {/* Hotspots interactivos flotantes sobre el render 3D */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Hotspot 1: Cristal (Centro Arriba) */}
                <button
                  type="button"
                  onClick={() => handleSelect("cristal")}
                  className="pointer-events-auto absolute top-[18%] left-[48%] -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-white/40 bg-[#17164F]/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
                >
                  <span className="h-2 w-2 rounded-full bg-[#00F0FF] animate-ping" />
                  <span>💎 Núcleo</span>
                </button>

                {/* Hotspot 2: Observatorio (Derecha Arriba) */}
                <button
                  type="button"
                  onClick={() => handleSelect("torre")}
                  className="pointer-events-auto absolute top-[36%] right-[10%] flex items-center gap-1.5 rounded-full border border-white/40 bg-[#17164F]/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
                >
                  <span className="h-2 w-2 rounded-full bg-[#FFC928]" />
                  <span>🔭 Observatorio</span>
                </button>

                {/* Hotspot 3: Engranajes (Izquierda) */}
                <button
                  type="button"
                  onClick={() => handleSelect("engranaje")}
                  className="pointer-events-auto absolute top-[44%] left-[10%] flex items-center gap-1.5 rounded-full border border-white/40 bg-[#17164F]/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
                >
                  <span className="h-2 w-2 rounded-full bg-[#FF5C5C]" />
                  <span>⚙️ Retos</span>
                </button>

                {/* Hotspot 4: Bio-Domus (Abajo Izquierda) */}
                <button
                  type="button"
                  onClick={() => handleSelect("laboratorio")}
                  className="pointer-events-auto absolute bottom-[18%] left-[28%] flex items-center gap-1.5 rounded-full border border-white/40 bg-[#17164F]/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-lg backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
                >
                  <span className="h-2 w-2 rounded-full bg-[#2DBE70]" />
                  <span>🔬 Bio-Domus</span>
                </button>
              </div>
            </div>
          ) : (
            <svg
              viewBox="0 0 600 480"
              className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
              style={{ overflow: "visible" }}
            >
            <defs>
              {/* Gradientes y Patrones Isométricos */}
              <linearGradient id="crystalGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F0FF" />
                <stop offset="50%" stopColor="#25CFE0" />
                <stop offset="100%" stopColor="#5636D9" />
              </linearGradient>

              <linearGradient id="crystalShade" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E0FFFF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0B4B6F" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="islandTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#35D97E" />
                <stop offset="100%" stopColor="#1EA75B" />
              </linearGradient>

              <linearGradient id="goldBeam" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFE066" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FF9900" stopOpacity="0.1" />
              </linearGradient>

              {/* Filtro de Resplandor Neón */}
              <filter id="neonBloom" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* SOMBRA ARROJADA DE LA ISLA */}
            <ellipse cx="300" cy="435" rx="190" ry="32" fill="#050414" opacity="0.6" filter="url(#neonBloom)" />

            {/* BASE DE LA ISLA FLOTANTE - ESTRATOS ISOMÉTRICOS */}
            <g className="island-base">
              {/* Cara Inferior / Pico Rocoso */}
              <polygon points="300,410 170,300 230,350 300,420 370,350 430,300" fill="#140D33" />
              
              {/* Cara Lateral Izquierda (Sombra intermedia) */}
              <polygon
                points="120,240 300,340 300,410 170,300 120,240"
                fill="#241B52"
                stroke="#1B1340"
                strokeWidth="1.5"
              />
              {/* Estratos geológicos cara izquierda */}
              <polygon points="120,255 300,355 300,370 150,285" fill="#1E1644" opacity="0.8" />
              <polygon points="120,275 300,375 300,390 170,300" fill="#19113B" opacity="0.9" />

              {/* Cara Lateral Derecha (Sombra profunda) */}
              <polygon
                points="300,340 480,240 430,300 300,410"
                fill="#17103B"
                stroke="#0F092B"
                strokeWidth="1.5"
              />
              {/* Estratos geológicos cara derecha */}
              <polygon points="300,355 460,265 445,280 300,370" fill="#120C30" opacity="0.8" />

              {/* Borde rocoso superior */}
              <polygon points="120,240 300,340 480,240 300,140" fill="#1E7A4A" />

              {/* Superficie Verde / Cesped Tecnológico (Luz cenital) */}
              <polygon
                points="120,230 300,330 480,230 300,130"
                fill="url(#islandTop)"
                stroke="#47F295"
                strokeWidth="2"
              />

              {/* Rejilla Isométrica sutil sobre la hierba */}
              <path
                d="M 180,197 L 360,297 M 240,163 L 420,263 M 210,280 L 390,180 M 270,313 L 450,213"
                stroke="#29BD6A"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />

              {/* Camino de baldosas hexagonales hacia el centro */}
              <polygon points="280,260 300,270 320,260 320,252 300,242 280,252" fill="#FFE885" stroke="#C98F00" strokeWidth="1.5" />
              <polygon points="255,275 275,285 295,275 295,267 275,257 255,267" fill="#FFF0A6" stroke="#C98F00" strokeWidth="1.5" />
              <polygon points="305,275 325,285 345,275 345,267 325,257 305,267" fill="#FFF0A6" stroke="#C98F00" strokeWidth="1.5" />
            </g>

            {/* PLATAFORMA ELEVADA CENTRAL (POD CUÁNTICO) */}
            <g className="quantum-pod" transform="translate(0, -10)">
              {/* Cilindro / Sólido Isométrico Base */}
              <path
                d="M 240,210 L 300,245 L 360,210 L 360,225 L 300,260 L 240,225 Z"
                fill="#2E2369"
                stroke="#5636D9"
                strokeWidth="1.5"
              />
              <polygon
                points="240,210 300,245 360,210 300,175"
                fill="#43358F"
                stroke="#7054F7"
                strokeWidth="2"
              />

              {/* Anillo de Levitación Neón con Rotación Simulada */}
              <ellipse
                cx="300"
                cy="200"
                rx="75"
                ry="36"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="2.5"
                strokeDasharray="16 12"
                filter="url(#neonBloom)"
                className="animate-spin"
                style={{ transformOrigin: "300px 200px", animationDuration: "14s" }}
              />
            </g>

            {/* NODO 1: EL CRISTAL DE CURIOSIDAD (CENTRAL FLOTANTE) */}
            <g
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => handleSelect("cristal")}
              transform="translate(0, -15)"
            >
              {/* Haz de luz de ascensión */}
              <polygon points="280,220 320,220 330,80 270,80" fill="url(#goldBeam)" />

              {/* Sólido Poliedro Isométrico (Cristal de doble pirámide) */}
              <g className="animate-bounce" style={{ animationDuration: "3.2s" }}>
                {/* Faceta Superior Izquierda (Media Luz) */}
                <polygon points="300,90 270,140 300,165" fill="#25CFE0" stroke="#E0FFFF" strokeWidth="1" />
                {/* Faceta Superior Derecha (Sombra) */}
                <polygon points="300,90 300,165 330,140" fill="#128B99" stroke="#E0FFFF" strokeWidth="1" />
                {/* Faceta Superior Frontal (Luz directa) */}
                <polygon points="300,90 285,150 315,150" fill="#80F5FF" opacity="0.8" />
                {/* Faceta Inferior Izquierda */}
                <polygon points="300,215 270,140 300,165" fill="#0D5963" stroke="#25CFE0" strokeWidth="1" />
                {/* Faceta Inferior Derecha */}
                <polygon points="300,215 300,165 330,140" fill="#073B42" stroke="#25CFE0" strokeWidth="1" />

                {/* Destello de brillo puntual */}
                <circle cx="295" cy="120" r="3" fill="#FFFFFF" filter="url(#neonBloom)" />
                <path d="M 285,120 L 305,120 M 295,110 L 295,130" stroke="#FFFFFF" strokeWidth="1.5" />
              </g>

              {/* Aro orbital del cristal */}
              <ellipse
                cx="300"
                cy="140"
                rx="42"
                ry="18"
                fill="none"
                stroke="#FFC928"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            </g>

            {/* NODO 2: OBSERVATORIO CÓSMICO (TORRE DERECHA) */}
            <g
              className="cursor-pointer transition-transform hover:scale-105"
              onClick={() => handleSelect("torre")}
            >
              {/* Base de la torre derecha */}
              <polygon points="380,210 420,230 420,180 380,160" fill="#2E2369" stroke="#5636D9" />
              <polygon points="420,230 460,210 460,160 420,180" fill="#1E1647" stroke="#3D2699" />
              <polygon points="380,160 420,180 460,160 420,140" fill="#5636D9" stroke="#7E60FF" strokeWidth="1.5" />

              {/* Telescopio Isométrico orientado hacia las estrellas */}
              <g transform="translate(420, 130) rotate(-28)">
                <rect x="-8" y="-40" width="16" height="50" rx="3" fill="#F4F0FF" stroke="#17164F" strokeWidth="1.5" />
                <rect x="-11" y="-45" width="22" height="8" rx="2" fill="#FFC928" stroke="#17164F" strokeWidth="1.5" />
                <rect x="-6" y="5" width="12" height="15" fill="#5636D9" />
                {/* Lente con emisión */}
                <ellipse cx="0" cy="-45" rx="10" ry="4" fill="#00F0FF" filter="url(#neonBloom)" />
              </g>

              {/* Ondas de radio que emite el telescopio */}
              <path
                d="M 450,85 A 15 15 0 0 1 475,70"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="2"
                strokeDasharray="3 3"
                className="animate-pulse"
              />
              <path
                d="M 460,75 A 25 25 0 0 1 495,55"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className="animate-pulse"
                style={{ animationDelay: "300ms" }}
              />
            </g>

            {/* NODO 3: MOTOR DE ENGRANAJES (LADO IZQUIERDO) */}
            <g
              className="cursor-pointer transition-transform hover:scale-105"
              onClick={() => handleSelect("engranaje")}
            >
              {/* Estructura de soporte metálico */}
              <polygon points="160,210 200,230 200,200 160,180" fill="#241B52" stroke="#48388C" />
              <polygon points="200,230 230,215 230,185 200,200" fill="#19123D" stroke="#372A70" />
              <polygon points="160,180 200,200 230,185 190,165" fill="#3D2F7A" stroke="#6855B8" />

              {/* Engranaje Isométrico Grande */}
              <g transform="translate(195, 175) scale(1, 0.58) rotate(45)">
                <circle cx="0" cy="0" r="28" fill="#FFC928" stroke="#C98F00" strokeWidth="2" />
                <circle cx="0" cy="0" r="14" fill="#17164F" stroke="#FFE066" strokeWidth="2" />
                {/* Dientes del engranaje */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <rect
                    key={angle}
                    x="-4"
                    y="-34"
                    width="8"
                    height="8"
                    rx="1.5"
                    fill="#FFA800"
                    stroke="#C98F00"
                    strokeWidth="1"
                    transform={`rotate(${angle})`}
                  />
                ))}
              </g>

              {/* Micro Engranaje Secundario Acoplado */}
              <g transform="translate(160, 195) scale(1, 0.58) rotate(-20)">
                <circle cx="0" cy="0" r="16" fill="#FF5C5C" stroke="#B82E2E" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="7" fill="#17164F" />
              </g>
            </g>

            {/* NODO 4: BIO-DOMUS 3D / LABORATORIO (FRENTE IZQUIERDA) */}
            <g
              className="cursor-pointer transition-transform hover:scale-105"
              onClick={() => handleSelect("laboratorio")}
            >
              {/* Domo geodésico de vidrio con espécimen */}
              <path
                d="M 210,290 C 210,250 270,250 270,290 Z"
                fill="#2DBE70"
                fillOpacity="0.25"
                stroke="#2DBE70"
                strokeWidth="2"
              />
              <ellipse cx="240" cy="290" rx="30" ry="12" fill="#1E8A4F" stroke="#2DBE70" strokeWidth="1.5" />
              
              {/* Holograma de Corazón/ADN palpitando dentro */}
              <g transform="translate(240, 270) scale(0.85)" className="animate-pulse">
                <path
                  d="M 0,0 C -8,-10 -15,0 0,15 C 15,0 8,-10 0,0 Z"
                  fill="#FF4B72"
                  filter="url(#neonBloom)"
                />
              </g>

              {/* Anillo indicador en suelo */}
              <ellipse cx="240" cy="292" rx="34" ry="14" fill="none" stroke="#2DBE70" strokeWidth="1.5" strokeDasharray="4 3" />
            </g>

            {/* CABLES CONDUCTORES DE DATOS CON PULSOS LUMINOSOS */}
            <g className="cables" strokeLinecap="round">
              {/* Cable 1: Engranaje a Cristal */}
              <path d="M 210,190 Q 250,210 280,180" fill="none" stroke="#FFC928" strokeWidth="2.5" />
              {/* Cable 2: Domo a Cristal */}
              <path d="M 260,270 Q 280,240 295,200" fill="none" stroke="#2DBE70" strokeWidth="2.5" />
              {/* Cable 3: Torre a Cristal */}
              <path d="M 390,180 Q 340,210 315,180" fill="none" stroke="#00F0FF" strokeWidth="2.5" />

              {/* Pulso de luz viajero (Punto animado) */}
              <circle cx="245" cy="195" r="3.5" fill="#FFFFFF" filter="url(#neonBloom)">
                <animate
                  attributeName="cx"
                  values="210;250;280"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values="190;210;180"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>

            {/* NUBES ISOMÉTRICAS FLOTANTES (EFECTO DE ALTURA) */}
            <g opacity="0.75" className="animate-pulse" style={{ animationDuration: "5s" }}>
              {/* Nube 1 izquierda */}
              <g transform="translate(60, 280) scale(0.9, 0.5)">
                <ellipse cx="40" cy="40" rx="35" ry="25" fill="#FFFFFF" opacity="0.85" />
                <ellipse cx="70" cy="35" rx="30" ry="25" fill="#FFFFFF" opacity="0.95" />
                <ellipse cx="95" cy="42" rx="25" ry="18" fill="#FFFFFF" opacity="0.85" />
              </g>
              {/* Nube 2 derecha superior */}
              <g transform="translate(450, 110) scale(0.8, 0.45)">
                <ellipse cx="40" cy="40" rx="30" ry="20" fill="#FFFFFF" opacity="0.85" />
                <ellipse cx="65" cy="35" rx="25" ry="20" fill="#FFFFFF" opacity="0.95" />
              </g>
            </g>
          </svg>
          )}
        </div>

        {/* TARJETA DE LECTURA TÉCNICA ACTIVA (Live Readout estilo Anatomy) */}
        <div className="relative mt-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-all sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span
                className="flex h-3.5 w-3.5 rounded-full shadow-[0_0_12px]"
                style={{ backgroundColor: current.color, boxShadow: `0 0 12px ${current.color}` }}
              />
              <div>
                <h4 className="font-[family-name:var(--font-fredoka)] text-base font-bold text-white sm:text-lg">
                  {current.title}
                </h4>
                <p className="text-xs text-white/70">{current.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span
                className="rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide"
                style={{ backgroundColor: `${current.color}25`, color: current.color }}
              >
                {current.badge}
              </span>
            </div>
          </div>

          {/* Selector interactivo de estaciones */}
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-2.5">
            <span className="self-center text-[10px] font-semibold text-white/40 uppercase tracking-wider mr-1">
              Examinar:
            </span>
            {(["cristal", "torre", "engranaje", "laboratorio"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  activeNode === key
                    ? "bg-[#5636D9] text-white shadow-md shadow-[#5636D9]/50 scale-105"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                {key === "cristal" && "💎 Núcleo"}
                {key === "torre" && "🔭 Observatorio"}
                {key === "engranaje" && "⚙️ Retos"}
                {key === "laboratorio" && "🔬 Bio-Domus"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ISO STEM STATION (Aparato de Ciencia, Matemática y Tecnología)
// ============================================================================

export function IsoStemStation() {
  const [power, setPower] = useState(78);

  return (
    <div className="relative rounded-3xl border-2 border-[#25CFE0]/30 bg-gradient-to-br from-[#121139] to-[#0A0924] p-5 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs">
        <span className="font-mono font-bold text-[#25CFE0]">LABORATORIO ISOMÉTRICO VIRTUAL</span>
        <span className="rounded bg-[#2DBE70]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#2DBE70]">
          REACTIVO
        </span>
      </div>

      <div className="my-3 flex items-center justify-center">
        <svg viewBox="0 0 380 240" className="w-full max-w-[340px] h-auto">
          {/* Base de la mesa de experimentación */}
          <polygon points="190,210 50,135 190,60 330,135" fill="#1C1A4A" stroke="#25CFE0" strokeWidth="1.5" />
          <polygon points="50,135 190,210 190,225 50,150" fill="#141238" />
          <polygon points="190,210 330,135 330,150 190,225" fill="#0E0C2B" />

          {/* Matraz de Química Isométrico con Líquido Borboteante */}
          <g transform="translate(110, 85)">
            {/* Matraz erlenmeyer */}
            <polygon points="30,70 10,70 20,40 20,25 25,25 25,40" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.9" />
            <polygon points="28,68 12,68 18,48 24,48" fill="#25CFE0" fillOpacity="0.75" />
            {/* Burbujas animadas */}
            <circle cx="20" cy="58" r="2.5" fill="#FFFFFF" className="animate-ping" />
            <circle cx="16" cy="63" r="1.8" fill="#FFFFFF" />
            <circle cx="22" cy="52" r="1.5" fill="#FFFFFF" />
          </g>

          {/* Osciloscopio con Pantalla de Onda Senoidal */}
          <g transform="translate(195, 75)">
            {/* Chasis cúbico isométrico */}
            <polygon points="0,50 60,85 60,35 0,0" fill="#292766" stroke="#48429E" strokeWidth="1.5" />
            <polygon points="60,85 110,55 110,5 60,35" fill="#1A1847" stroke="#332D7A" strokeWidth="1.5" />
            <polygon points="0,0 60,35 110,5 50,-30" fill="#3D388F" stroke="#5D56BD" strokeWidth="1.5" />

            {/* Pantalla CRT verde fósforo */}
            <polygon points="65,40 105,15 105,48 65,73" fill="#0D2E1F" stroke="#2DBE70" strokeWidth="1.5" />
            {/* Señal de onda */}
            <path
              d="M 68,58 Q 78,35 88,52 T 102,40"
              fill="none"
              stroke="#00FF88"
              strokeWidth="2"
              className="animate-pulse"
            />
          </g>

          {/* Manómetro / Dial circular con Aguja Móvil */}
          <g transform="translate(160, 140)">
            {/* Poste de fijación */}
            <line x1="25" y1="20" x2="25" y2="40" stroke="#8A82BD" strokeWidth="3" />
            {/* Esfera */}
            <circle cx="25" cy="15" r="16" fill="#F8FAFC" stroke="#17164F" strokeWidth="2" />
            {/* Escala */}
            <path d="M 15,15 A 10 10 0 0 1 35,15" fill="none" stroke="#5636D9" strokeWidth="2" strokeDasharray="2 3" />
            {/* Aguja dinámica */}
            <line
              x1="25"
              y1="15"
              x2={25 + 9 * Math.cos(((power - 50) * Math.PI) / 60)}
              y2={15 - 9 * Math.sin(((power - 50) * Math.PI) / 60)}
              stroke="#FF4B72"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="25" cy="15" r="3" fill="#17164F" />
          </g>
        </svg>
      </div>

      {/* Controles interactivos de prueba para estudiantes */}
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 p-3 text-xs">
        <div>
          <span className="font-semibold text-white/80">Regulador de Presión Teórica:</span>
          <div className="font-mono text-sm font-bold text-[#FFC928]">{power} kPa</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPower((p) => Math.max(20, p - 10));
              sounds.playClick();
            }}
            className="rounded-lg bg-white/10 px-2.5 py-1 font-bold hover:bg-white/20 active:scale-95"
          >
            -
          </button>
          <button
            type="button"
            onClick={() => {
              setPower((p) => Math.min(100, p + 10));
              sounds.playClick();
            }}
            className="rounded-lg bg-[#25CFE0] px-2.5 py-1 font-bold text-[#17164F] hover:bg-[#6be4f0] active:scale-95"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ISO GAMIFIED CHEST (Cofre Isométrico de Recompensas y XP)
// ============================================================================

export function IsoGamifiedChest() {
  const [opened, setOpened] = useState(false);

  const handleClick = () => {
    setOpened((v) => !v);
    if (!opened) {
      sounds.playPowerUp();
    } else {
      sounds.playClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative cursor-pointer select-none rounded-3xl border-2 border-[#FFC928]/40 bg-gradient-to-b from-[#2E1E66] to-[#140D36] p-5 text-center shadow-xl transition-all duration-300 hover:border-[#FFC928] hover:shadow-[0_0_30px_rgba(255,201,40,0.35)]"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-[#FFC928]">RECOMPENSA DIARIA</span>
        <span className="rounded-full bg-[#FFC928]/20 px-2.5 py-0.5 font-bold text-[#FFC928]">
          {opened ? "¡DESBLOQUEADO!" : "TOCA PARA ABRIR"}
        </span>
      </div>

      <div className="my-4 flex items-center justify-center">
        <svg viewBox="0 0 260 200" className="w-48 h-auto">
          {/* Rayos dorados cuando está abierto */}
          {opened && (
            <g className="animate-spin" style={{ transformOrigin: "130px 100px", animationDuration: "12s" }}>
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <line
                  key={deg}
                  x1="130"
                  y1="100"
                  x2={130 + 85 * Math.cos((deg * Math.PI) / 180)}
                  y2={100 + 85 * Math.sin((deg * Math.PI) / 180)}
                  stroke="#FFE066"
                  strokeWidth="2"
                  strokeDasharray="4 8"
                  opacity="0.6"
                />
              ))}
            </g>
          )}

          {/* Sombra del cofre */}
          <ellipse cx="130" cy="170" rx="70" ry="18" fill="#0A081F" opacity="0.6" />

          {/* Base del Cofre Isométrico */}
          <polygon points="130,165 70,130 70,100 130,135" fill="#804A00" stroke="#4A2B00" strokeWidth="2" />
          <polygon points="130,165 190,130 190,100 130,135" fill="#5E3600" stroke="#3D2300" strokeWidth="2" />
          <polygon points="70,100 130,135 190,100 130,65" fill="#A86200" stroke="#5E3600" strokeWidth="2" />

          {/* Refuerzos dorados / Herrajes */}
          <polygon points="130,165 120,159 120,129 130,135" fill="#FFC928" />
          <polygon points="130,165 140,159 140,129 130,135" fill="#E6B01E" />
          <polygon points="70,130 80,124 80,94 70,100" fill="#FFC928" />
          <polygon points="190,130 180,124 180,94 190,100" fill="#CCA018" />

          {/* Tapa del Cofre (Cerrada o Abierta según estado) */}
          {!opened ? (
            <g className="tapa-cerrada">
              <polygon points="70,100 130,65 190,100 130,135" fill="#8C5200" stroke="#FFC928" strokeWidth="2" />
              {/* Cerradura frontal */}
              <circle cx="130" cy="135" r="7" fill="#FFC928" stroke="#5E3600" strokeWidth="1.5" />
              <circle cx="130" cy="135" r="2.5" fill="#17164F" />
            </g>
          ) : (
            <g className="tapa-abierta" transform="translate(0, -35)">
              <polygon points="70,85 130,45 190,85 130,125" fill="#B36800" stroke="#FFE066" strokeWidth="2" />
              {/* Joyas y XP brotando */}
              <g className="animate-bounce" style={{ animationDuration: "1.2s" }}>
                <polygon points="130,55 118,75 142,75" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="1.5" />
                <polygon points="130,95 118,75 142,75" fill="#00A3B0" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="130" cy="75" r="3" fill="#FFFFFF" />
              </g>
              {/* Estrellas flotantes */}
              <circle cx="100" cy="60" r="4" fill="#FFC928" className="animate-ping" />
              <circle cx="160" cy="50" r="3.5" fill="#FF5C5C" className="animate-pulse" />
            </g>
          )}
        </svg>
      </div>

      <div className="font-[family-name:var(--font-fredoka)] text-lg font-bold text-white">
        {opened ? "¡+250 Puntos de Experiencia!" : "Cofre del Saber Semanal"}
      </div>
      <p className="mt-1 text-xs text-white/70">
        {opened
          ? "¡Has desbloqueado el emblema 'Curiosidad Imparable'!"
          : "Haz clic para abrir tu botín de aventuras curriculares."}
      </p>
    </div>
  );
}
