"use client";

import React, { useEffect, useState } from "react";
import { sounds } from "./SoundFX";

export function ScrollQuestPath() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState(0);

  const checkpoints = [
    { id: "inicio", label: "El Portal", icon: "🚀", desc: "Bienvenida a la Ciudadela" },
    { id: "edades", label: "3 Clanes", icon: "⭐", desc: "7 a 15 Años" },
    { id: "mundos", label: "4 Reinos", icon: "🗺️", desc: "Áreas Curriculares" },
    { id: "laboratorio", label: "Lab 3D", icon: "🔬", desc: "Ciencia en Acción" },
    { id: "reto", label: "Mini Reto", icon: "🎮", desc: "Gana tus primeros 100 XP" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const current = window.scrollY;
      const pct = Math.min(100, Math.max(0, Math.round((current / totalHeight) * 100)));
      setScrollPercent(pct);

      // Determine active checkpoint
      if (pct < 20) setActiveCheckpoint(0);
      else if (pct < 40) setActiveCheckpoint(1);
      else if (pct < 65) setActiveCheckpoint(2);
      else if (pct < 85) setActiveCheckpoint(3);
      else setActiveCheckpoint(4);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    sounds.playClick();
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Barra superior de progreso de la expedición */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-black/10">
        <div
          className="h-full bg-gradient-to-r from-[#25CFE0] via-[#FFC928] to-[#5636D9] transition-all duration-150 ease-out shadow-[0_0_12px_rgba(37,207,224,0.8)]"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* Widget flotante lateral de la brújula de aventura (Visible en pantallas medianas y grandes) */}
      <aside
        aria-label="Progreso de la aventura"
        className="fixed bottom-6 right-6 z-40 hidden flex-col items-end gap-2 lg:flex"
      >
        <div className="flex items-center gap-2 rounded-2xl border-2 border-[#5636D9]/20 bg-white/95 px-3 py-2 shadow-2xl backdrop-blur-md transition-all hover:border-[#5636D9]">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#2DBE70]" />
            <span className="font-mono text-xs font-bold text-[#17164F]">
              EXPEDICIÓN: {scrollPercent}%
            </span>
          </div>

          <div className="flex items-center gap-1 border-l border-[#E8E0FF] pl-2">
            {checkpoints.map((cp, idx) => (
              <button
                key={cp.id}
                type="button"
                title={`${cp.label}: ${cp.desc}`}
                onClick={() => scrollTo(cp.id)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-transform ${
                  activeCheckpoint === idx
                    ? "bg-[#5636D9] text-white scale-110 shadow-md shadow-[#5636D9]/40"
                    : "bg-[#F2EEFF] text-[#5B5678] hover:bg-[#E8E0FF] hover:scale-105"
                }`}
              >
                <span>{cp.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
