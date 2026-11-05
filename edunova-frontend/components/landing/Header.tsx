"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ListIcon,
  XIcon,
  SpeakerHighIcon,
  SpeakerSimpleSlashIcon,
} from "@/components/ui/icons";
import { sounds } from "./SoundFX";

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#isometria", label: "Ciudadela 3D" },
  { href: "#edades", label: "Para tu Edad" },
  { href: "#areas", label: "Mundos del Saber" },
  { href: "#reto", label: "Mini Reto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = () => {
    const isNowOn = sounds.toggleSound();
    setSoundOn(isNowOn);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E0FF]/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo de Marca */}
        <a
          href="#inicio"
          onClick={() => sounds.playClick()}
          className="group flex shrink-0 items-center gap-2.5 transition-transform hover:scale-105"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#5636D9] to-[#25CFE0] p-1.5 shadow-md shadow-[#5636D9]/25 transition-transform group-hover:rotate-6">
            <Image
              src="/assets/logo.svg"
              alt=""
              width={34}
              height={34}
              className="h-full w-full invert"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-[family-name:var(--font-fredoka)] text-[1.4rem] font-bold tracking-tight text-[#17164F]">
                EduNova
              </span>
              <span className="rounded-full bg-[#FFC928]/25 px-2 py-0.5 text-[10px] font-bold text-[#8F6600]">
                2026
              </span>
            </div>
            <span className="hidden text-[10px] font-semibold text-[#8681A6] sm:block">
              Aprender es una aventura
            </span>
          </div>
        </a>

        {/* Navegación Desktop */}
        <nav className="hidden items-center gap-1 md:flex lg:gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onMouseEnter={() => sounds.playHover()}
              onClick={() => sounds.playClick()}
              className="rounded-xl px-3 py-2 text-[0.92rem] font-bold text-[#5B5678] transition-all hover:bg-[#F2EEFF] hover:text-[#5636D9]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Acciones y Botones */}
        <div className="flex items-center gap-2.5">
          {/* Botón de Sonido Lúdico tipo Nintendo */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label={soundOn ? "Silenciar efectos sonoros" : "Activar efectos sonoros"}
            title={soundOn ? "Sonido Activado" : "Activar Efectos Retro"}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all ${
              soundOn
                ? "border-[#2DBE70] bg-[#2DBE70]/15 text-[#2DBE70] scale-105 shadow-sm shadow-[#2DBE70]/30"
                : "border-[#E8E0FF] bg-white text-[#8681A6] hover:bg-[#F7F4FF] hover:text-[#17164F]"
            }`}
          >
            {soundOn ? (
              <SpeakerHighIcon weight="bold" className="h-5 w-5 animate-pulse" />
            ) : (
              <SpeakerSimpleSlashIcon weight="bold" className="h-5 w-5" />
            )}
          </button>

          <a
            href="/login"
            onClick={() => sounds.playClick()}
            className="btn-tactil inline-flex items-center justify-center rounded-xl bg-[#5636D9] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#5636D9]/30 transition-transform hover:scale-105"
            style={{ "--tactil-borde": "#3B229D" } as React.CSSProperties}
          >
            <span>Iniciar sesión</span>
          </a>

          {/* Menú Móvil */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => {
              setOpen((v) => !v);
              sounds.playClick();
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#17164F] md:hidden"
          >
            {open ? <XIcon className="h-6 w-6" /> : <ListIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Panel Móvil Desplegable */}
      {open && (
        <div id="mobile-nav" className="border-t border-[#E8E0FF] bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  setOpen(false);
                  sounds.playClick();
                }}
                className="flex items-center justify-between rounded-xl p-3 text-base font-bold text-[#17164F] hover:bg-[#F2EEFF]"
              >
                <span>{link.label}</span>
                <span className="text-xs text-[#5636D9]">Ir →</span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
