"use client";

import Image from "next/image";
import Link from "next/link";
import { BOARD_TILES } from "@/components/estudiante/juego/boardData";
import { JUEGO_ASSETS } from "@/components/estudiante/juego/assets";

export default function Page() {
  return (
    <div className="min-h-[100dvh] bg-[#17164F] p-4 sm:p-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex items-center gap-2">
          <Link
            href="/estudiante/juegos"
            className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold text-white"
          >
            ← Volver al juego
          </Link>
        </div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-white">
          Casillas del tablero
        </h1>
        <p className="mt-1 text-xs text-white/70">
          Tipos de casillas en Exploradores del conocimiento
        </p>

        <div className="mt-4 space-y-2">
          {[
            { kind: "salida", nombre: "Salida", desc: "Inicio del recorrido. +50 XP al pasar." },
            { kind: "pregunta", nombre: "Pregunta", desc: "Resuelve un ejercicio del tema." },
            { kind: "desafio", nombre: "Desafío", desc: "Reto más exigente del curso." },
            { kind: "recompensa", nombre: "Recompensa", desc: "Ganas XP y recursos del equipo." },
            { kind: "cooperacion", nombre: "Cooperación", desc: "Responden en consenso con el equipo." },
            { kind: "evento", nombre: "Evento sorpresa", desc: "Situación inesperada educativa." },
            { kind: "descanso", nombre: "Descanso", desc: "Revisa teoría y gana ayuda." },
          ].map((c) => {
            const sample = BOARD_TILES.find((t) => t.kind === c.kind);
            return (
              <article
                key={c.kind}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: sample?.color ?? "#5636D9" }}
                >
                  <Image
                    src={sample?.icon ?? JUEGO_ASSETS.pregunta}
                    alt=""
                    width={28}
                    height={28}
                  />
                </span>
                <div>
                  <h2 className="font-bold text-[#17164F]">{c.nombre}</h2>
                  <p className="text-sm text-[#5B5678]">{c.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
