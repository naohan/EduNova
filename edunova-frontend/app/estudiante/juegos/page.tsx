"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";

const pathTiles = [
  { x: "8%", y: "72%", color: "bg-[#5636D9]" },
  { x: "22%", y: "62%", color: "bg-[#4C9EFF]" },
  { x: "34%", y: "70%", color: "bg-[#FFC928]" },
  { x: "46%", y: "55%", color: "bg-[#5636D9]" },
  { x: "58%", y: "48%", color: "bg-[#2DBE70]" },
  { x: "70%", y: "40%", color: "bg-[#4C9EFF]" },
  { x: "82%", y: "28%", color: "bg-[#FFC928]" },
];

export default function Page() {
  const [dado, setDado] = useState<number | null>(null);
  const [pos, setPos] = useState(0);

  function lanzar() {
    const n = Math.floor(Math.random() * 6) + 1;
    setDado(n);
    setPos((p) => Math.min(pathTiles.length - 1, p + Math.min(n, 2)));
  }

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <header className="mb-4">
          <p className="text-sm text-[#6B7280]">Juegos</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Exploradores del conocimiento
          </h1>
        </header>

        {/* Mission banner */}
        <div className="mb-4 rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#5636D9]">
            Misión del equipo
          </div>
          <h2 className="mt-1 font-bold text-[#17164F]">
            Restaurar el observatorio espacial
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">Equipo Galaxia · 4 jugadores</p>
        </div>

        {/* Board */}
        <div className="relative mb-4 overflow-hidden rounded-3xl bg-gradient-to-b from-[#B8E0FF] to-[#7BC67E] shadow-lg">
          <div className="relative h-[280px] sm:h-[340px]">
            {/* Island base */}
            <div className="absolute bottom-6 left-1/2 h-24 w-[85%] -translate-x-1/2 rounded-[50%] bg-[#5FAE55]/80 blur-[1px]" />
            <div className="absolute bottom-10 left-1/2 h-16 w-[70%] -translate-x-1/2 rounded-[40%] bg-[#6FBF63]" />

            {/* Observatory goal */}
            <div className="absolute right-[10%] top-6 flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#17164F] text-2xl shadow-lg ring-4 ring-[#4C9EFF]/40">
                🔭
              </div>
              <span className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#17164F]">
                Meta
              </span>
            </div>

            {/* Path tiles */}
            {pathTiles.map((t, i) => (
              <div
                key={i}
                className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl ${t.color} text-xs font-bold text-white shadow-md ring-2 ${
                  i === pos ? "ring-[#FFC928] scale-110" : "ring-white/50"
                }`}
                style={{ left: t.x, top: t.y }}
              >
                {i === pos ? "🚀" : i + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <div>
            <div className="text-xs text-[#6B7280]">Último lanzamiento</div>
            <div className="text-2xl font-bold text-[#17164F]">{dado ?? "—"}</div>
          </div>
          <div className="text-5xl" aria-hidden>
            🎲
          </div>
          <button
            type="button"
            onClick={lanzar}
            className="rounded-2xl bg-[#5636D9] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(86,54,217,0.3)]"
          >
            Lanzar dado
          </button>
        </div>

        {dado ? (
          <div className="mb-4 flex items-end gap-2">
            <Image
              src="/assets/woebling.png"
              alt=""
              width={52}
              height={48}
              className="h-auto w-11"
            />
            <p className="rounded-2xl rounded-bl-sm bg-[#F2EEFF] px-3 py-2 text-sm text-[#17164F]">
              Sacaste un {dado}. ¡Avanza y resuelve la casilla!
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/estudiante/juegos/casillas"
            className="rounded-2xl border border-[#E8E0FF] bg-white py-3.5 text-center text-sm font-bold text-[#5636D9] shadow-sm"
          >
            Ver casillas del tablero
          </Link>
          <Link
            href="/estudiante/practica"
            className="rounded-2xl bg-[#5636D9] py-3.5 text-center text-sm font-bold text-white"
          >
            Resolver casilla pregunta
          </Link>
        </div>
      </div>
    </EstudianteLayout>
  );
}
