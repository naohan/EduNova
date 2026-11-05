"use client";

import Image from "next/image";
import { useState } from "react";
import { ListIcon, SpeakerHighIcon, SpeakerSimpleSlashIcon, XIcon } from "@/components/ui/icons";
import { sounds } from "./SoundFX";

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#isometria", label: "Cómo funciona" },
  { href: "#edades", label: "Para tu edad" },
  { href: "#areas", label: "Áreas" },
  { href: "#reto", label: "Mini reto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E0FF] bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#inicio" className="flex shrink-0 items-center gap-2.5">
          <Image src="/assets/logo.svg" alt="" width={36} height={36} className="h-9 w-9" priority />
          <span className="font-[family-name:var(--font-fredoka)] text-[1.35rem] font-semibold tracking-tight text-[#17164F]">
            EduNova
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex lg:gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-[0.92rem] font-semibold text-[#5B5678] transition-colors hover:text-[#5636D9]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundOn(sounds.toggleSound())}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Silenciar sonidos" : "Activar sonidos"}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#5B5678] transition-colors hover:bg-[#F2EEFF] hover:text-[#17164F]"
          >
            {soundOn ? <SpeakerHighIcon className="h-5 w-5" /> : <SpeakerSimpleSlashIcon className="h-5 w-5" />}
          </button>

          <a
            href="/login"
            className="btn-tactil inline-flex items-center rounded-xl bg-[#5636D9] px-4 py-2.5 text-sm font-bold text-white"
            style={{ "--tactil-borde": "#3B229D" } as React.CSSProperties}
          >
            Iniciar sesión
          </a>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#17164F] md:hidden"
          >
            {open ? <XIcon className="h-5 w-5" /> : <ListIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-[#E8E0FF] bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#17164F]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
