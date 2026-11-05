"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAgeTier } from "@/lib/age-tier";
import { ageTierLabel } from "@/lib/api/helpers";
import { AgeTierSwitcher } from "./AgeTierSwitcher";
import { estudiante } from "./data";

type Item = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => ReactNode;
  match?: string;
};

const sideNav: Item[] = [
  { href: "/estudiante", label: "Inicio", icon: IconHome, match: "^/estudiante$" },
  { href: "/estudiante/ruta", label: "Aprender", icon: IconBook },
  { href: "/estudiante/juegos", label: "Juegos", icon: IconGame },
  { href: "/estudiante/aula", label: "Aula", icon: IconClass },
  { href: "/estudiante/progreso", label: "Mi progreso", icon: IconProgress },
  { href: "/estudiante/habilidades", label: "Habilidades", icon: IconSkills },
  { href: "/estudiante/duelo", label: "Duelo", icon: IconMission },
  { href: "/estudiante/evaluaciones", label: "Evaluaciones", icon: IconEval },
  { href: "/estudiante/logros", label: "Perfil", icon: IconUser },
];

const bottomNav: Item[] = [
  { href: "/estudiante", label: "Inicio", icon: IconHome, match: "^/estudiante$" },
  { href: "/estudiante/ruta", label: "Aprender", icon: IconBook },
  { href: "/estudiante/juegos", label: "Juegos", icon: IconGame },
  { href: "/estudiante/aula", label: "Aula", icon: IconClass },
  { href: "/estudiante/logros", label: "Perfil", icon: IconUser },
];

function isOn(pathname: string, item: Item) {
  if (item.match) return new RegExp(item.match).test(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function EstudianteLayout({
  children,
  mobileHeader,
  shellClassName,
}: {
  children: ReactNode;
  mobileHeader?: ReactNode;
  /** Fondo de página (p. ej. nebulosa en cursos) */
  shellClassName?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tier] = useAgeTier();

  return (
    <div className={shellClassName ?? "min-h-screen bg-[#F7F4FF]"}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-[#E8E0FF] bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Image
            src="/assets/Logo.png"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            EduNova
          </span>
        </div>

        <div className="mx-4 mb-4 rounded-2xl bg-[#F2EEFF] p-3">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/usuario.png"
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-[#17164F]">
                {estudiante.nombre}
              </div>
              <div className="text-xs text-[#5636D9]">{ageTierLabel[tier]}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {sideNav.map((item) => {
            const on = isOn(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm ${
                  on
                    ? "bg-[#5636D9] font-semibold text-white"
                    : "font-medium text-[#17164F]/75 hover:bg-[#F2EEFF]"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-5">
          <Image
            src="/assets/woebling.png"
            alt="Woebling"
            width={120}
            height={110}
            className="mx-auto h-auto w-[100px]"
          />
        </div>
      </aside>

      {/* Mobile header */}
      {mobileHeader ?? (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E8E0FF] bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center text-[#17164F]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Link href="/estudiante" className="flex items-center gap-2">
            <Image
              src="/assets/Logo.png"
              alt=""
              width={26}
              height={26}
              className="h-6 w-6 object-contain"
            />
            <span className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
              EduNova
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Notificaciones" className="relative text-[#5636D9]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
                <path d="M10 19a2 2 0 0 0 4 0" />
              </svg>
              <span className="absolute right-0 top-0 h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
            </button>
            <Image
              src="/assets/usuario.png"
              alt="usuario"
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
            />
          </div>
        </header>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#17164F]/35"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-[300px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
                Menú
              </span>
              <button type="button" onClick={() => setOpen(false)} className="text-[#6B7280]">
                ✕
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-3">
              {sideNav.map((item) => {
                const on = isOn(pathname, item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm ${
                      on ? "bg-[#5636D9] font-semibold text-white" : "text-[#17164F]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}

      <main className="min-h-screen pb-[72px] lg:ml-[248px] lg:pb-0">
        <div className="flex justify-end px-4 pt-3 sm:px-6 lg:px-8">
          <AgeTierSwitcher />
        </div>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E0FF] bg-white px-1 py-1 lg:hidden">
        <div className="flex justify-around">
          {bottomNav.map((item) => {
            const on = isOn(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] ${
                  on ? "font-bold text-[#5636D9]" : "font-medium text-[#9CA3AF]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    on ? "bg-[#F2EEFF]" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}
function IconMission({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 14.5 9H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5L12 3Z" />
    </svg>
  );
}
function IconProgress({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 19V10M10 19V5M15 19v-7M20 19V8" />
    </svg>
  );
}
function IconBook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 5.5C5 4.67 5.67 4 6.5 4H12v16H6.5A1.5 1.5 0 0 1 5 18.5v-13Z" />
      <path d="M19 5.5c0-.83-.67-1.5-1.5-1.5H12v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
    </svg>
  );
}
function IconGame({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="8" width="18" height="10" rx="3" />
      <path d="M8 12v2M7 13h2M15 12h.01M18 14h.01" />
    </svg>
  );
}
function IconClass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V7l8-3 8 3v12M12 4v15M4 19h16" />
    </svg>
  );
}
function IconSkills({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 14 9h6l-5 4 2 6-5-3.5L7 19l2-6-5-4h6L12 3Z" />
    </svg>
  );
}
function IconEval({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}
function IconUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}
