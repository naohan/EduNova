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
import { NombreAlumno } from "./NombreAlumno";

type Item = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => ReactNode;
  match?: string;
};

const sideNav: Item[] = [
  { href: "/estudiante", label: "Inicio", icon: HouseIcon, match: "^/estudiante$" },
  { href: "/estudiante/ruta", label: "Aprender", icon: BookOpenIcon },
  { href: "/estudiante/juegos", label: "Juegos", icon: GameControllerIcon },
  { href: "/estudiante/aventuras", label: "Aventuras 3D", icon: CubeIcon },
  { href: "/estudiante/flashcards", label: "Flashcards", icon: CheckSquareIcon },
  { href: "/estudiante/aula", label: "Aula", icon: ChalkboardTeacherIcon },
  { href: "/estudiante/progreso", label: "Mi progreso", icon: ChartBarIcon },
  { href: "/estudiante/habilidades", label: "Habilidades", icon: BrainIcon },
  { href: "/estudiante/duelo", label: "Duelo", icon: SwordIcon },
  { href: "/estudiante/ligas", label: "Ligas", icon: TrophyIcon },
  { href: "/estudiante/tienda", label: "Tienda", icon: StorefrontIcon },
  { href: "/estudiante/evaluaciones", label: "Evaluaciones", icon: ClipboardTextIcon },
  { href: "/estudiante/logros", label: "Perfil", icon: UserIcon },
];

const bottomNav: Item[] = [
  { href: "/estudiante", label: "Inicio", icon: HouseIcon, match: "^/estudiante$" },
  { href: "/estudiante/ruta", label: "Aprender", icon: BookOpenIcon },
  { href: "/estudiante/juegos", label: "Juegos", icon: GameControllerIcon },
  { href: "/estudiante/aula", label: "Aula", icon: ChalkboardTeacherIcon },
  { href: "/estudiante/logros", label: "Perfil", icon: UserIcon },
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
            src="/assets/logo.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8"
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
                <NombreAlumno />
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
            <ListIcon className="h-5 w-5" />
          </button>
          <Link href="/estudiante" className="flex items-center gap-2">
            <Image
              src="/assets/logo.svg"
              alt=""
              width={26}
              height={26}
              className="h-6 w-6"
            />
            <span className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
              EduNova
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Notificaciones" className="relative text-[#5636D9]">
              <BellIcon className="h-5 w-5" />
            </button>
            <Image
              src="/assets/usuario.png"
              alt="Tu perfil"
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
              <button type="button" onClick={() => setOpen(false)} className="text-[#5B5678]">
                <XIcon className="h-5 w-5" aria-label="Cerrar" />
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
        <div className="flex flex-wrap items-center justify-end gap-2 px-4 pt-3 sm:px-6 lg:px-8">
          <ConexionBadge />
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
