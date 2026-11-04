"use client";

// Docente layout: desktop sidebar + mobile bottom nav.
// Client component because it uses usePathname (active link) and useState
// (collapsible "Aulas" submenu). Server pages render it and pass server-rendered
// JSX as children.

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-white text-[#5636D9] font-semibold"
          : "text-white/80 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span aria-hidden="true">{icon}</span>
        {label}
      </span>
      {badge ? (
        <span className="bg-[#5636D9] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

const mobileNav = [
  { href: "/docente", label: "Inicio", icon: "🏠" },
  { href: "/docente/competencias", label: "Aulas", icon: "🏫" },
  { href: "/docente/evaluacion", label: "Evaluar", icon: "✏️" },
  { href: "/docente/resultados", label: "Reportes", icon: "📊" },
  { href: "#", label: "Perfil", icon: "👤" },
];

export function DocenteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [aulasOpen, setAulasOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-[#F5F3FF]">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-56 flex-col bg-[#17164F] text-white">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
          <img
            src="/assets/mascotaedu%20nova.png"
            alt="Mascota EduNova"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-bold">EduNova</span>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavItem href="/docente" label="Inicio" icon="🏠" active={pathname === "/docente"} />
          <button
            type="button"
            onClick={() => setAulasOpen((o) => !o)}
            aria-expanded={aulasOpen}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <span aria-hidden="true">🏫</span>
              Aulas
            </span>
            <span
              aria-hidden="true"
              className={`transition-transform ${aulasOpen ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>
          {aulasOpen ? (
            <div className="ml-3 space-y-1 border-l border-white/10 pl-2">
              <NavItem
                href="/docente/evaluacion"
                label="Evaluación"
                icon="✏️"
                active={pathname === "/docente/evaluacion"}
              />
              <NavItem
                href="/docente/competencias"
                label="Seguimiento"
                icon="📈"
                active={pathname === "/docente/competencias"}
              />
              <NavItem
                href="/docente/reportes"
                label="Analítica"
                icon="📊"
                active={pathname === "/docente/reportes"}
                badge="Nuevo"
              />
            </div>
          ) : null}
          <NavItem
            href="/docente/resultados"
            label="Reportes"
            icon="📋"
            active={pathname === "/docente/resultados"}
          />
          <NavItem href="#" label="Recursos" icon="📚" active={false} />
        </nav>

        <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#5636D9] flex items-center justify-center text-sm font-semibold shrink-0">
            AT
          </div>
          <div className="text-xs leading-tight">
            <div className="font-semibold">Prof. Ana Torres</div>
            <div className="text-white/60">Docente</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-56 pb-16 md:pb-0 min-w-0">
        {children}
        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#EDE9FE] flex justify-around py-1.5">
          {mobileNav.map((item) => {
            const active = item.href !== "#" && pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] ${
                  active ? "text-[#5636D9] font-semibold" : "text-[#6B7280]"
                }`}
              >
                <span aria-hidden="true" className="text-lg">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
