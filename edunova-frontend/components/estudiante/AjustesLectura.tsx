// components/estudiante/AjustesLectura.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { GearIcon, XIcon } from "@/components/ui/icons";
import { AgeTierSwitcher } from "./AgeTierSwitcher";
import {
  applyReadingSettings,
  loadReadingSettings,
  saveReadingSettings,
  type ReadingSettings,
} from "@/lib/reading-settings";

export function AjustesLectura() {
  const [abierto, setAbierto] = useState(false);
  const [settings, setSettings] = useState<ReadingSettings>(loadReadingSettings);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyReadingSettings(loadReadingSettings());
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    }
    if (abierto) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [abierto]);

  function cambiar<K extends keyof ReadingSettings>(campo: K, valor: ReadingSettings[K]) {
    const nuevo = { ...settings, [campo]: valor };
    setSettings(nuevo);
    saveReadingSettings(nuevo);
  }

  return (
    <div className="relative inline-block" ref={panelRef}>
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-label="Ajustes"
        title="Ajustes"
        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#5636D9] transition-colors hover:bg-[#F2EEFF]"
      >
        <GearIcon weight="fill" className="h-6 w-6" aria-hidden />
      </button>

      {abierto ? (
        <div
          role="dialog"
          aria-label="Panel de ajustes"
          className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-[#E8E0FF] bg-white p-4 text-[#17164F] shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between border-b border-[#E8E0FF] pb-2">
            <span className="text-sm font-bold text-[#17164F]">Ajustes</span>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[#5B5678] hover:bg-[#F2EEFF] hover:text-[#17164F]"
              aria-label="Cerrar ajustes"
            >
              <XIcon className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Edad: el modo Camaleón */}
            <div>
              <span className="mb-1.5 block font-bold text-[#5B5678]">Edad</span>
              <AgeTierSwitcher />
            </div>

            {/* Tamaño */}
            <div>
              <span className="mb-1.5 block font-bold text-[#5B5678]">Tamaño</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: "normal", label: "Normal" },
                    { id: "grande", label: "Grande" },
                    { id: "muy-grande", label: "Muy grande" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={settings.size === s.id}
                    onClick={() => cambiar("size", s.id)}
                    className={`rounded-xl px-2 py-2 text-center font-bold transition-colors ${
                      settings.size === s.id
                        ? "bg-[#5636D9] text-white"
                        : "bg-[#F7F4FF] text-[#17164F] hover:bg-[#EAE5FF]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Espaciado */}
            <div>
              <span className="mb-1.5 block font-bold text-[#5B5678]">Espaciado</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: "normal", label: "Normal" },
                    { id: "amplio", label: "Amplio" },
                  ] as const
                ).map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    aria-pressed={settings.spacing === sp.id}
                    onClick={() => cambiar("spacing", sp.id)}
                    className={`rounded-xl px-2 py-2 text-center font-bold transition-colors ${
                      settings.spacing === sp.id
                        ? "bg-[#5636D9] text-white"
                        : "bg-[#F7F4FF] text-[#17164F] hover:bg-[#EAE5FF]"
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contraste */}
            <div>
              <span className="mb-1.5 block font-bold text-[#5B5678]">Contraste</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: "normal", label: "Normal" },
                    { id: "alto", label: "Alto" },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={settings.contrast === c.id}
                    onClick={() => cambiar("contrast", c.id)}
                    className={`rounded-xl px-2 py-2 text-center font-bold transition-colors ${
                      settings.contrast === c.id
                        ? "bg-[#5636D9] text-white"
                        : "bg-[#F7F4FF] text-[#17164F] hover:bg-[#EAE5FF]"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipografía */}
            <div>
              <span className="mb-1.5 block font-bold text-[#5B5678]">Tipografía</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: "normal", label: "Normal" },
                    { id: "clara", label: "Letra clara" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={settings.font === f.id}
                    onClick={() => cambiar("font", f.id)}
                    className={`rounded-xl px-2 py-2 text-center font-bold transition-colors ${
                      settings.font === f.id
                        ? "bg-[#5636D9] text-white"
                        : "bg-[#F7F4FF] text-[#17164F] hover:bg-[#EAE5FF]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
