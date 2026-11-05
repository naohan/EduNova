"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => ReactNode;
  badge?: string;
  match?: string;
  skipActive?: boolean;
};

const mainNav: NavItem[] = [
  { href: "/docente", label: "Inicio", icon: IconHome, match: "^/docente$" },
  { href: "/docente/resultados", label: "Aulas", icon: IconClass },
  { href: "/docente/evaluacion", label: "Evaluación", icon: IconEval },
  { href: "/docente/competencias", label: "Seguimiento", icon: IconTrack },
  {
    href: "/docente/reportes",
    label: "Analítica educativa",
    icon: IconAnalytics,
    badge: "Nuevo",
  },
  { href: "/docente/reportes", label: "Reportes", icon: IconReport, skipActive: true },
];

const mobileBottom = [
  { href: "/docente", label: "Inicio", icon: IconHome, match: "^/docente$" },
  { href: "/docente/resultados", label: "Aulas", icon: IconClass },
  { href: "/docente/evaluacion", label: "Evaluar", icon: IconEval },
  { href: "/docente/competencias", label: "Seguir", icon: IconTrack },
  { href: "/docente/reportes", label: "Perfil", icon: IconUser },
];

function active(pathname: string, item: { href: string; match?: string }) {
  if (item.match) return new RegExp(item.match).test(pathname);
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function DocenteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F4FF]">
      {/* ── Desktop sidebar (lavanda claro, como el mockup) ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-[#E8E0FF] bg-[#F2EEFF] lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Image src="/assets/logo.svg" alt="" width={32} height={32} />
          <span className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            EduNova
          </span>
        </div>

        <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5636D9] text-sm font-bold text-white">
            AT
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-bold text-[#17164F]">
              Prof. Ana Torres
            </div>
            <div className="text-xs text-[#6B7280]">Docente</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {mainNav.map((item) => {
            const on = !item.skipActive && active(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  on
                    ? "bg-[#5636D9] font-semibold text-white shadow-sm"
                    : "font-medium text-[#17164F]/75 hover:bg-white/80"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </span>
                {item.badge ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      on ? "bg-white text-[#5636D9]" : "bg-[#5636D9] text-white"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-5">
          <Image
            src="/assets/woebling-estudiando.png"
            alt="Woebling"
            width={180}
            height={140}
            className="mx-auto h-auto w-[140px] drop-shadow-md"
          />
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E8E0FF] bg-white/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#17164F]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <Link href="/docente" className="flex items-center gap-2">
          <Image src="/assets/logo.svg" alt="" width={26} height={26} />
          <span className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
            EduNova
          </span>
        </Link>
        <button type="button" aria-label="Notificaciones" className="text-[#5636D9]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
        </button>
      </header>

      {/* ── Mobile drawer (igual al menú del mockup) ── */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#17164F]/35"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[320px] flex-col bg-[#F2EEFF] shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-2">
                <Image src="/assets/logo.svg" alt="" width={28} height={28} />
                <span className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
                  EduNova
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-[#17164F]/60"
              >
                ✕
              </button>
            </div>

            <div className="mx-4 mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5636D9] text-sm font-bold text-white">
                AT
              </div>
              <div>
                <div className="text-sm font-bold text-[#17164F]">Prof. Ana Torres</div>
                <div className="text-xs text-[#6B7280]">Docente</div>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5 px-3">
              {mainNav.map((item) => {
                const on = !item.skipActive && active(pathname, item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm ${
                      on
                        ? "bg-[#5636D9] font-semibold text-white"
                        : "bg-white/70 font-medium text-[#17164F]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {item.badge ? (
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#5636D9]">
                        {item.badge}
                      </span>
                    ) : (
                      <span className={on ? "text-white/80" : "text-[#9CA3AF]"}>›</span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 pb-6">
              <Image
                src="/assets/woebling.png"
                alt="Woebling"
                width={140}
                height={130}
                className="mx-auto h-auto w-[110px]"
              />
            </div>
          </div>
        </div>
      ) : null}

      <main className="min-h-screen pb-[72px] lg:ml-[248px] lg:pb-0">{children}</main>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E0FF] bg-white px-1 py-1 lg:hidden">
        <div className="flex justify-around">
          {mobileBottom.map((item) => {
            const on = active(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] ${
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
function IconClass({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V7l8-3 8 3v12M12 4v15M4 19h16" />
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
function IconTrack({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V5M4 19h16M7 14l4-5 3 3 5-7" />
    </svg>
  );
}
function IconAnalytics({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 19V10M10 19V5M15 19v-7M20 19V8" />
    </svg>
  );
}
function IconReport({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
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
