"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAgeTier } from "@/lib/age-tier";
import { ageTierLabel } from "@/lib/api/helpers";
import {
  BellIcon,
  BookOpenIcon,
  ListChecksIcon,
  BrainIcon,
  ChalkboardTeacherIcon,
  ChartBarIcon,
  CheckSquareIcon,
  ClipboardTextIcon,
  CubeIcon,
  GameControllerIcon,
  HouseIcon,
  ListIcon,
  StorefrontIcon,
  SwordIcon,
  TrophyIcon,
  UserIcon,
  XIcon,
} from "@/components/ui/icons";
import { ConexionBadge } from "@/components/ui/ConexionBadge";
import { AgeTierSwitcher } from "./AgeTierSwitcher";
import { AjustesLectura } from "./AjustesLectura";
import { NombreAlumno } from "./NombreAlumno";

type SeccionMarca = "explorar" | "juego" | "cooperar" | "magia" | "refuerzo";

type Item = {
  href: string;
  label: string;
  seccion: SeccionMarca;
  icon: (p: { className?: string; weight?: "bold" | "regular" | "fill" }) => ReactNode;
  match?: string;
};

const sideNav: Item[] = [
  { href: "/estudiante", label: "Inicio", seccion: "magia", icon: HouseIcon, match: "^/estudiante$" },
  { href: "/estudiante/ruta", label: "Aprender", seccion: "explorar", icon: BookOpenIcon },
  { href: "/estudiante/unidades", label: "Mis unidades", seccion: "explorar", icon: ListChecksIcon },
  { href: "/estudiante/juegos", label: "Juegos", seccion: "juego", icon: GameControllerIcon },
  { href: "/estudiante/aventuras", label: "Aventuras 3D", seccion: "explorar", icon: CubeIcon },
  { href: "/estudiante/flashcards", label: "Flashcards", seccion: "refuerzo", icon: CheckSquareIcon },
  { href: "/estudiante/aula", label: "Aula", seccion: "cooperar", icon: ChalkboardTeacherIcon },
  { href: "/estudiante/progreso", label: "Mi progreso", seccion: "cooperar", icon: ChartBarIcon },
  { href: "/estudiante/habilidades", label: "Habilidades", seccion: "cooperar", icon: BrainIcon },
  { href: "/estudiante/duelo", label: "Duelo", seccion: "juego", icon: SwordIcon },
  { href: "/estudiante/ligas", label: "Ligas", seccion: "juego", icon: TrophyIcon },
  { href: "/estudiante/tienda", label: "Tienda", seccion: "juego", icon: StorefrontIcon },
  { href: "/estudiante/evaluaciones", label: "Evaluaciones", seccion: "magia", icon: ClipboardTextIcon },
  { href: "/estudiante/logros", label: "Perfil", seccion: "juego", icon: UserIcon },
];

const bottomNav: Item[] = [
  { href: "/estudiante", label: "Inicio", seccion: "magia", icon: HouseIcon, match: "^/estudiante$" },
  { href: "/estudiante/ruta", label: "Aprender", seccion: "explorar", icon: BookOpenIcon },
  { href: "/estudiante/juegos", label: "Juegos", seccion: "juego", icon: GameControllerIcon },
  { href: "/estudiante/aula", label: "Aula", seccion: "cooperar", icon: ChalkboardTeacherIcon },
  { href: "/estudiante/logros", label: "Perfil", seccion: "juego", icon: UserIcon },
];

const seccionEstilos: Record<
  SeccionMarca,
  {
    activoSidebar: string;
    activoBottomIcon: string;
    activoBottomText: string;
    hoverSidebar: string;
    indicadorColor: string;
  }
> = {
  explorar: {
    activoSidebar: "bg-[#4C9EFF] border-b-2 border-b-[#2472CC] text-[#17164F] font-bold",
    activoBottomIcon: "bg-[#4C9EFF] border-b-2 border-b-[#2472CC] text-[#17164F]",
    activoBottomText: "text-[#17164F] font-extrabold",
    hoverSidebar: "hover:bg-[#E6F2FF] hover:text-[#17164F]",
    indicadorColor: "#4C9EFF",
  },
  juego: {
    activoSidebar: "bg-[#FFC928] border-b-2 border-b-[#C98F00] text-[#17164F] font-bold",
    activoBottomIcon: "bg-[#FFC928] border-b-2 border-b-[#C98F00] text-[#17164F]",
    activoBottomText: "text-[#17164F] font-extrabold",
    hoverSidebar: "hover:bg-[#FFF6D6] hover:text-[#17164F]",
    indicadorColor: "#FFC928",
  },
  cooperar: {
    activoSidebar: "bg-[#2DBE70] border-b-2 border-b-[#1B8A4F] text-[#17164F] font-bold",
    activoBottomIcon: "bg-[#2DBE70] border-b-2 border-b-[#1B8A4F] text-[#17164F]",
    activoBottomText: "text-[#17164F] font-extrabold",
    hoverSidebar: "hover:bg-[#E3F8EC] hover:text-[#17164F]",
    indicadorColor: "#2DBE70",
  },
  magia: {
    activoSidebar: "bg-[#5636D9] border-b-2 border-b-[#3B229D] text-white font-bold",
    activoBottomIcon: "bg-[#5636D9] border-b-2 border-b-[#3B229D] text-white",
    activoBottomText: "text-[#5636D9] font-extrabold",
    hoverSidebar: "hover:bg-[#F2EEFF] hover:text-[#17164F]",
    indicadorColor: "#5636D9",
  },
  refuerzo: {
    activoSidebar: "bg-[#FF8A73] border-b-2 border-b-[#D9583F] text-[#17164F] font-bold",
    activoBottomIcon: "bg-[#FF8A73] border-b-2 border-b-[#D9583F] text-[#17164F]",
    activoBottomText: "text-[#17164F] font-extrabold",
    hoverSidebar: "hover:bg-[#FFEDE8] hover:text-[#17164F]",
    indicadorColor: "#FF8A73",
  },
};

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
            src="/assets/logo.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-[family-name:var(--font-fredoka)] text-xl font-bold text-[#17164F]">
            EduNova
          </span>
        </div>

        <div className="mx-4 mb-3 rounded-2xl border border-[#3B229D]/20 border-b-2 border-b-[#3B229D] bg-[#F2EEFF] p-3">
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
                <NombreAlumno />
              </div>
              <div className="text-xs font-semibold text-[#5636D9]">{ageTierLabel[tier]}</div>
            </div>
          </div>
        </div>

        <nav aria-label="Navegación principal" className="flex-1 space-y-1 overflow-y-auto px-3">
          {sideNav.map((item) => {
            const on = isOn(pathname, item);
            const Icon = item.icon;
            const estilo = seccionEstilos[item.seccion];
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  on
                    ? estilo.activoSidebar
                    : `font-semibold text-[#17164F]/80 ${estilo.hoverSidebar}`
                }`}
                aria-current={on ? "page" : undefined}
              >
                <Icon
                  weight={on ? "bold" : "regular"}
                  className="h-[18px] w-[18px] shrink-0"
                  aria-hidden
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-4">
          <Image
            src="/assets/woebling.png"
            alt="Mascota Woebling"
            width={120}
            height={110}
            className="mx-auto h-auto w-[96px] object-contain"
          />
        </div>
      </aside>

      {/* Mobile header por defecto */}
      {mobileHeader ?? (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E8E0FF] bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#17164F] hover:bg-[#F2EEFF]"
          >
            <ListIcon className="h-6 w-6" aria-hidden />
          </button>
          <Link href="/estudiante" className="flex items-center gap-2">
            <Image
              src="/assets/logo.svg"
              alt=""
              width={26}
              height={26}
              className="h-6 w-6"
            />
            <span className="font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">
              EduNova
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notificaciones"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#5636D9] hover:bg-[#F2EEFF]"
            >
              <BellIcon className="h-5 w-5" aria-hidden />
              {/* Indicador de aviso usando color de Refuerzo, no rojo */}
              <span
                aria-hidden
                className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#FF8A73] ring-2 ring-white"
              />
            </button>
            <Image
              src="/assets/usuario.png"
              alt="Tu perfil"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
            />
          </div>
        </header>
      )}

      {/* Drawer móvil */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-[#17164F]/40"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-[300px] flex-col bg-white">
            <div className="flex items-center justify-between border-b border-[#E8E0FF] px-4 py-4">
              <span className="font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">
                Menú
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#5B5678] hover:bg-[#F2EEFF]"
                aria-label="Cerrar menú"
              >
                <XIcon className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
              {sideNav.map((item) => {
                const on = isOn(pathname, item);
                const Icon = item.icon;
                const estilo = seccionEstilos[item.seccion];
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                      on
                        ? estilo.activoSidebar
                        : `font-semibold text-[#17164F] ${estilo.hoverSidebar}`
                    }`}
                    aria-current={on ? "page" : undefined}
                  >
                    <Icon weight={on ? "bold" : "regular"} className="h-5 w-5 shrink-0" aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}

      <main className="min-h-screen pb-[76px] lg:ml-[248px] lg:pb-0">
        <div className="flex flex-wrap items-center justify-end gap-2 px-4 pt-3 sm:px-6 lg:px-8">
          <ConexionBadge />
          <AgeTierSwitcher />
          <AjustesLectura />
        </div>
        {children}
      </main>

      {/* Barra de navegación inferior móvil orientada por color */}
      <nav
        aria-label="Navegación inferior"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E0FF] bg-white px-2 py-1 lg:hidden"
      >
        <div className="flex justify-around">
          {bottomNav.map((item) => {
            const on = isOn(pathname, item);
            const Icon = item.icon;
            const estilo = seccionEstilos[item.seccion];
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] ${
                  on ? estilo.activoBottomText : "font-semibold text-[#5B5678]"
                }`}
                aria-current={on ? "page" : undefined}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    on ? estilo.activoBottomIcon : "bg-transparent text-[#5B5678]"
                  }`}
                >
                  <Icon weight={on ? "bold" : "regular"} className="h-4 w-4" aria-hidden />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
