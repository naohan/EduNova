"use client";

import { useEffect, useState } from "react";
import { sounds } from "./SoundFX";
import { BookOpenIcon, CheckCircleIcon, GameControllerIcon, HouseIcon, UsersIcon } from "@/components/ui/icons";

const CHECKPOINTS = [
  { id: "inicio", label: "Inicio", Icon: HouseIcon },
  { id: "isometria", label: "Cómo funciona", Icon: CheckCircleIcon },
  { id: "edades", label: "Para tu edad", Icon: UsersIcon },
  { id: "areas", label: "Áreas", Icon: BookOpenIcon },
  { id: "reto", label: "Mini reto", Icon: GameControllerIcon },
];

export function ScrollQuestPath() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      setScrollPercent(Math.min(100, Math.max(0, Math.round((window.scrollY / totalHeight) * 100))));

      // La sección activa es la última cuyo inicio ya pasó bajo la cabecera.
      let active = 0;
      CHECKPOINTS.forEach((cp, idx) => {
        const elem = document.getElementById(cp.id);
        if (elem && elem.getBoundingClientRect().top <= 140) active = idx;
      });
      setActiveCheckpoint(active);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    sounds.playClick();
    document.getElementById(id)?.scrollIntoView();
  };

  return (
    <>
      {/* Barra superior de progreso de la expedición */}
      <div className="fixed left-0 right-0 top-0 z-[60] h-1 bg-[#E8E0FF]" aria-hidden>
        <div className="h-full bg-[#5636D9]" style={{ width: `${scrollPercent}%` }} />
      </div>

      {/* Brújula flotante, solo en pantallas grandes */}
      <aside aria-label="Secciones de la página" className="fixed bottom-6 right-6 z-40 hidden lg:block">
        <div className="flex items-center gap-2 rounded-2xl border border-[#E8E0FF] bg-white px-3 py-2">
          <span className="text-xs font-bold text-[#17164F]">Expedición: {scrollPercent}%</span>
          <div className="flex items-center gap-1 border-l border-[#E8E0FF] pl-2">
            {CHECKPOINTS.map(({ id, label, Icon }, idx) => (
              <button
                key={id}
                type="button"
                title={label}
                aria-label={label}
                aria-current={activeCheckpoint === idx ? "true" : undefined}
                onClick={() => scrollTo(id)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  activeCheckpoint === idx
                    ? "bg-[#5636D9] text-white"
                    : "bg-[#F2EEFF] text-[#5B5678] hover:bg-[#E8E0FF]"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
