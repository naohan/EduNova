"use client";

import Image from "next/image";
import { useState } from "react";

const links = [
  { href: "#inicio", label: "Inicio", active: true },
  { href: "#que-es", label: "¿Qué es EduNova?" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#areas", label: "Áreas de aprendizaje" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#inicio" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/assets/logo.svg"
            alt=""
            width={34}
            height={34}
            className="h-[34px] w-[34px]"
            priority
          />
          <span className="font-[family-name:var(--font-fredoka)] text-[1.35rem] font-semibold tracking-tight text-[#17164F]">
            EduNova
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex lg:gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={
                link.active
                  ? "rounded-full bg-[#F2EEFF] px-4 py-2 text-[0.92rem] font-bold text-[#5636D9]"
                  : "rounded-full px-4 py-2 text-[0.92rem] font-semibold text-[#17164F]/70 transition-colors hover:text-[#5636D9]"
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href="/login"
            className="hidden items-center rounded-xl border-[1.5px] border-[#17164F]/25 px-4 py-2.5 text-sm font-bold text-[#17164F] transition-colors hover:border-[#5636D9] hover:text-[#5636D9] sm:inline-flex"
          >
            Iniciar sesión
          </a>
          <a
            href="/estudiante"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#5636D9] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#4528b8]"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 12a4 4 0 0 0-4 4v1h12v-1a4 4 0 0 0-4-4H6Z" />
              <path d="M15.5 6.5V5h-1v1.5H13v1h1.5V9h1V7.5H17v-1h-1.5Z" />
            </svg>
            Crear cuenta
          </a>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#17164F] md:hidden"
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-[#F2EEFF] bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  link.active
                    ? "rounded-xl bg-[#F2EEFF] px-4 py-3 text-sm font-bold text-[#5636D9]"
                    : "rounded-xl px-4 py-3 text-sm font-semibold text-[#17164F]/80"
                }
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-xl border border-[#17164F]/20 px-4 py-3 text-center text-sm font-bold text-[#17164F] sm:hidden"
            >
              Iniciar sesión
            </a>
            <a
              href="/docente"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-[#5636D9]"
            >
              Demo docente
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
