"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { unidadActual } from "@/components/estudiante/data";
import { SOLAR_BODIES, type PlanetId } from "@/components/estudiante/solar/planetData";

const SolarSystemViewer = dynamic(
  () => import("@/components/estudiante/solar/SolarSystemViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-[#0b0a2e] text-sm text-white/70">
        Cargando modelo 3D…
      </div>
    ),
  },
);

export default function Page() {
  const [activo, setActivo] = useState<PlanetId>("tierra");
  const actual = SOLAR_BODIES.find((p) => p.id === activo) ?? SOLAR_BODIES[3];

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <header className="mb-4">
          <p className="text-xs text-[#6B7280]">
            {unidadActual.titulo} › Explora en 3D
          </p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F] sm:text-2xl">
            Exploración interactiva
          </h1>
          <p className="mt-1 text-xs text-[#6B7280]">
            Motor 3D: <strong className="text-[#5636D9]">Three.js</strong> · Arrastra para rotar ·
            scroll para zoom · toca un planeta
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="hidden space-y-2 lg:block">
            {[
              { href: "/estudiante/leccion", label: "¿Qué es?" },
              { href: "/estudiante/leccion", label: "Componentes" },
              { href: "/estudiante/explorar", label: "Explora en 3D", on: true },
              { href: "/estudiante/practica", label: "Practica" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`block rounded-xl px-3 py-2.5 text-sm font-medium ${
                  item.on
                    ? "bg-[#5636D9] text-white"
                    : "border border-[#E8E0FF] bg-white text-[#17164F]"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-4 rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">{actual.emoji}</span>
                <h2 className="font-bold text-[#17164F]">{actual.name}</h2>
              </div>
              <dl className="space-y-1.5 text-xs">
                <Row k="Tipo" v={actual.info.tipo} />
                <Row k="Diámetro" v={actual.info.diametro} />
                <Row k="Distancia" v={actual.info.distancia} />
                <Row k="Temperatura" v={actual.info.temperatura} />
                <Row k="Lunas" v={actual.info.lunas} />
              </dl>
              <p className="mt-3 rounded-xl bg-[#F2EEFF] p-2.5 text-xs text-[#17164F]">
                💡 {actual.info.dato}
              </p>
            </div>
          </aside>

          <div className="overflow-hidden rounded-3xl bg-[#0b0a2e] text-white shadow-lg">
            <div className="relative h-[360px] sm:h-[440px] lg:h-[520px]">
              <SolarSystemViewer
                selectedId={activo}
                onSelect={setActivo}
                className="absolute inset-0 h-full w-full"
              />

              <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-black/40 px-3 py-1.5 text-xs backdrop-blur">
                {actual.emoji} {actual.name}
              </div>

              <div className="absolute bottom-3 left-3 flex max-w-[210px] items-end gap-2">
                <Image
                  src="/assets/woebling.png"
                  alt=""
                  width={48}
                  height={44}
                  className="pointer-events-none h-auto w-11"
                />
                <div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-xs text-[#17164F] shadow">
                  Arrastra, acerca y toca cada planeta.
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-[#12113f] px-3 py-3">
              {SOLAR_BODIES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivo(p.id)}
                  className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-2 ${
                    activo === p.id ? "bg-[#5636D9]" : "bg-white/5"
                  }`}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="mt-1 text-[10px]">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile info card */}
        <div className="mt-4 rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm lg:hidden">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">{actual.emoji}</span>
            <h2 className="font-bold text-[#17164F]">{actual.name}</h2>
          </div>
          <p className="text-sm text-[#17164F]/80">{actual.info.dato}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Row k="Tipo" v={actual.info.tipo} />
            <Row k="Diámetro" v={actual.info.diametro} />
            <Row k="Distancia" v={actual.info.distancia} />
            <Row k="Lunas" v={actual.info.lunas} />
          </dl>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/estudiante/practica"
            className="flex-1 rounded-2xl bg-[#5636D9] py-3.5 text-center text-sm font-bold text-white"
          >
            Ir a practicar →
          </Link>
          <Link
            href="/estudiante/cuerpo"
            className="flex-1 rounded-2xl border border-[#E8E0FF] bg-white py-3.5 text-center text-sm font-bold text-[#17164F]"
          >
            Explorar cuerpo humano 3D
          </Link>
        </div>
      </div>
    </EstudianteLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[#6B7280]">{k}</dt>
      <dd className="font-semibold text-[#17164F]">{v}</dd>
    </div>
  );
}
