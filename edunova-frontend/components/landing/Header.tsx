"use client";

import Image from "next/image";
import { useState } from "react";
import { ListIcon, XIcon } from "@/components/ui/icons";

const links = [
  { href: "#inicio", label: "Inicio" },
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
              className="rounded-xl px-3 py-2 text-[0.92rem] font-semibold text-[#5B5678] transition-colors hover:text-[#5636D9]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href="/login"
            className="inline-flex items-center rounded-xl bg-[#5636D9] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#4528b8]"
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
