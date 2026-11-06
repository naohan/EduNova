"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  ChalkboardTeacherIcon,
  GameControllerIcon,
  HouseIcon,
  UserIcon,
} from "@/components/ui/icons";
import { ConexionBadge } from "@/components/ui/ConexionBadge";
import { AjustesLectura } from "./AjustesLectura";

type SeccionMarca = "explorar" | "juego" | "cooperar" | "magia" | "refuerzo";

type Item = {
  href: string;
  label: string;
  seccion: SeccionMarca;
  icon: (p: { className?: string; weight?: "bold" | "regular" | "fill" }) => ReactNode;
  /** Pantallas que viven dentro de este lugar: el menú sigue marcado mientras estás ahí. */
  incluye?: string[];
};

// Cinco lugares, uno por color. Lo demás se abre desde dentro de cada uno, con mosaicos grandes.
const lugares: Item[] = [
  { href: "/estudiante", label: "Inicio", seccion: "magia", icon: HouseIcon },
  {
    href: "/estudiante/ruta",
    label: "Aprender",
    seccion: "explorar",
    icon: BookOpenIcon,
    incluye: [
      "/estudiante/unidades",
      "/estudiante/diagnostico",
      "/estudiante/flashcards",
      "/estudiante/leccion",
      "/estudiante/practica",
      "/estudiante/explorar",
      "/estudiante/cuerpo",
      "/estudiante/curso",
      "/estudiante/matematica",
      "/estudiante/comunicacion",
      "/estudiante/sociales",
    ],
  },
  {
    href: "/estudiante/jugar",
    label: "Juegos",
    seccion: "juego",
    icon: GameControllerIcon,
    incluye: [
      "/estudiante/juegos",
      "/estudiante/duelo",
      "/estudiante/aventuras",
      "/estudiante/ligas",
      "/estudiante/tienda",
    ],
  },
  {
    href: "/estudiante/aula",
    label: "Aula",
    seccion: "cooperar",
    icon: ChalkboardTeacherIcon,
    incluye: ["/estudiante/evaluaciones", "/estudiante/misiones", "/estudiante/desafio"],
  },
  {
    href: "/estudiante/logros",
    label: "Perfil",
    seccion: "refuerzo",
    icon: UserIcon,
    incluye: ["/estudiante/progreso", "/estudiante/habilidades", "/estudiante/logro"],
  },
];

// Cada lugar conserva su color aunque no esté activo: el niño lo encuentra por color, no por la palabra.
const seccionEstilos: Record<SeccionMarca, { activo: string; reposo: string; texto: string }> = {
  explorar: {
    activo: "bg-[#4C9EFF] border-b-4 border-b-[#2472CC] text-[#17164F]",
    reposo: "bg-[#E6F2FF] text-[#2472CC]",
    texto: "text-[#17164F]",
  },
  juego: {
    activo: "bg-[#FFC928] border-b-4 border-b-[#C98F00] text-[#17164F]",
    reposo: "bg-[#FFF6D6] text-[#C98F00]",
    texto: "text-[#17164F]",
  },
  cooperar: {
    activo: "bg-[#2DBE70] border-b-4 border-b-[#1B8A4F] text-[#17164F]",
    reposo: "bg-[#E3F8EC] text-[#1B8A4F]",
    texto: "text-[#17164F]",
  },
  magia: {
    activo: "bg-[#5636D9] border-b-4 border-b-[#3B229D] text-white",
    reposo: "bg-[#F2EEFF] text-[#5636D9]",
    texto: "text-[#5636D9]",
  },
  refuerzo: {
    activo: "bg-[#FF8A73] border-b-4 border-b-[#D9583F] text-[#17164F]",
    reposo: "bg-[#FFEDE8] text-[#D9583F]",
    texto: "text-[#17164F]",
  },
};

function isOn(pathname: string, item: Item) {
  if (item.href === "/estudiante") return pathname === item.href;
  return [item.href, ...(item.incluye ?? [])].some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

function Lugar({ item, on, compacto }: { item: Item; on: boolean; compacto?: boolean }) {
  const Icon = item.icon;
  const estilo = seccionEstilos[item.seccion];
  return (
    <Link
      href={item.href}
      aria-current={on ? "page" : undefined}
      className={`flex flex-col items-center justify-center gap-1 ${compacto ? "min-h-[60px] min-w-0 flex-1" : "py-1.5"}`}
    >
      <span
        className={`flex items-center justify-center rounded-2xl transition-colors ${
          compacto ? "h-10 w-12" : "h-14 w-14"
        } ${on ? estilo.activo : estilo.reposo}`}
      >
        <Icon weight={on ? "fill" : "bold"} className={compacto ? "h-6 w-6" : "h-7 w-7"} aria-hidden />
      </span>
      <span className={`text-xs font-bold ${on ? estilo.texto : "text-[#17164F]/70"}`}>{item.label}</span>
    </Link>
  );
}

export function EstudianteLayout({
  children,
  mobileHeader,
  shellClassName,
  foco = false,
}: {
  children: ReactNode;
  mobileHeader?: ReactNode;
  shellClassName?: string;
  /** Mientras el niño resuelve algo no hay menú: solo el ejercicio y su X para salir. */
  foco?: boolean;
}) {
  const pathname = usePathname();

  if (foco) {
    return (
      <div className={shellClassName ?? "min-h-[100dvh] bg-[#F7F4FF]"}>
        <main className="min-h-[100dvh]">{children}</main>
      </div>
    );
  }

  return (
    <div className={shellClassName ?? "min-h-screen bg-[#F7F4FF]"}>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[104px] flex-col items-center gap-2 border-r border-[#E8E0FF] bg-white py-4 lg:flex">
        <Link href="/estudiante" aria-label="EduNova, ir al inicio" className="mb-2">
          <Image src="/assets/logo.svg" alt="" width={40} height={40} className="h-10 w-10" />
        </Link>
        <nav aria-label="Navegación principal" className="flex flex-1 flex-col justify-center gap-2">
          {lugares.map((item) => (
            <Lugar key={item.href} item={item} on={isOn(pathname, item)} />
          ))}
        </nav>
      </aside>

      {mobileHeader}

      <main className="min-h-screen pb-[84px] lg:ml-[104px] lg:pb-0">
        <div className="flex items-center justify-between gap-2 px-4 pt-3 sm:px-6 lg:justify-end lg:px-8">
          <Link href="/estudiante" aria-label="EduNova, ir al inicio" className={mobileHeader ? "hidden" : "lg:hidden"}>
            <Image src="/assets/logo.svg" alt="" width={36} height={36} className="h-9 w-9" />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ConexionBadge />
            <AjustesLectura />
          </div>
        </div>
        {children}
      </main>

      <nav
        aria-label="Navegación inferior"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E0FF] bg-white px-2 py-1 lg:hidden"
      >
        <div className="flex justify-around">
          {lugares.map((item) => (
            <Lugar key={item.href} item={item} on={isOn(pathname, item)} compacto />
          ))}
        </div>
      </nav>
    </div>
  );
}
