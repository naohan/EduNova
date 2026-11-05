"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  ChalkboardTeacherIcon,
  ChartBarIcon,
  ChartLineIcon,
  ClipboardTextIcon,
  FilePlusIcon,
  FileTextIcon,
  HouseIcon,
  ListIcon,
  UserIcon,
  XIcon,
} from "@/components/ui/icons";

type NavItem = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => ReactNode;
  badge?: string;
  match?: string;
  skipActive?: boolean;
};

const mainNav: NavItem[] = [
  { href: "/docente", label: "Inicio", icon: HouseIcon, match: "^/docente$" },
  { href: "/docente/resultados", label: "Aulas", icon: ChalkboardTeacherIcon },
  { href: "/docente/studio", label: "Crear unidad", icon: FilePlusIcon },
  { href: "/docente/evaluacion", label: "Evaluación", icon: ClipboardTextIcon },
  { href: "/docente/competencias", label: "Seguimiento", icon: ChartLineIcon },
  {
    href: "/docente/reportes",
    label: "Analítica educativa",
    icon: ChartBarIcon,
    badge: "Nuevo",
  },
  { href: "/docente/reportes", label: "Reportes", icon: FileTextIcon, skipActive: true },
];

const mobileBottom = [
  { href: "/docente", label: "Inicio", icon: HouseIcon, match: "^/docente$" },
  { href: "/docente/resultados", label: "Aulas", icon: ChalkboardTeacherIcon },
  { href: "/docente/evaluacion", label: "Evaluar", icon: ClipboardTextIcon },
  { href: "/docente/competencias", label: "Seguir", icon: ChartLineIcon },
  { href: "/docente/reportes", label: "Perfil", icon: UserIcon },
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-[#E8E0FF] bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Image src="/assets/logo.svg" alt="" width={32} height={32} />
          <span className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            EduNova
          </span>
        </div>

        <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-[#F2EEFF] p-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#5636D9] text-sm font-bold text-white">
            AT
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-bold text-[#17164F]">
              Prof. Ana Torres
            </div>
            <div className="text-xs text-[#5B5678]">Docente</div>
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
                    ? "bg-[#5636D9] font-semibold text-white"
                    : "font-medium text-[#17164F]/75 hover:bg-[#F2EEFF]"
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
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E8E0FF] bg-white/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#17164F]"
        >
          <ListIcon className="h-5 w-5" />
        </button>
        <Link href="/docente" className="flex items-center gap-2">
          <Image src="/assets/logo.svg" alt="" width={26} height={26} />
          <span className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
            EduNova
          </span>
        </Link>
        <button type="button" aria-label="Notificaciones" className="text-[#5636D9]">
          <BellIcon className="h-5 w-5" />
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
                <XIcon className="h-5 w-5" aria-label="Cerrar" />
              </button>
            </div>

            <div className="mx-4 mb-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5636D9] text-sm font-bold text-white">
                AT
              </div>
              <div>
                <div className="text-sm font-bold text-[#17164F]">Prof. Ana Torres</div>
                <div className="text-xs text-[#5B5678]">Docente</div>
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
                      <span className={on ? "text-white/80" : "text-[#6A6586]"}>›</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}

      {/* El contenido del panel adulto usa Nunito en los títulos; el logo conserva Fredoka. */}
      <main className="min-h-screen pb-[72px] [--font-fredoka:var(--font-nunito)] lg:ml-[248px] lg:pb-0">{children}</main>

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
                  on ? "font-bold text-[#5636D9]" : "font-medium text-[#6A6586]"
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
