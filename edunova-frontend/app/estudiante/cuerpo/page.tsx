"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import {
  ORGANOS,
  teoriaCuerpo,
  unidadCuerpo,
  type OrganId,
} from "@/components/estudiante/cuerpo/organData";

const OrganViewer = dynamic(
  () => import("@/components/estudiante/cuerpo/OrganViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-[#F4F0FF] text-sm text-[#17164F]/70">
        Cargando modelo 3D…
      </div>
    ),
  },
);

export default function Page() {
  const [activo, setActivo] = useState<OrganId>("corazon");
  const actual = ORGANOS.find((o) => o.id === activo) ?? ORGANOS[2];
  const conModelo = Boolean(actual.modelo);

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <header className="mb-4">
          <p className="text-xs text-[#6B7280]">
            {unidadCuerpo.titulo} › Explora en 3D
          </p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F] sm:text-2xl">
            Órganos del cuerpo humano
          </h1>
          <p className="mt-1 text-xs text-[#6B7280]">
            Motor 3D: <strong className="text-[#5636D9]">Three.js + GLTF</strong>{" "}
            · Arrastra para rotar · scroll para zoom
            {conModelo ? " · modelo .glb" : " · ficha educativa"}
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="hidden space-y-3 lg:block">
            <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm">
              <h2 className="font-[family-name:var(--font-fredoka)] text-base font-semibold text-[#17164F]">
                {teoriaCuerpo.titulo}
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[#17164F]/80">
                {teoriaCuerpo.parrafos[0]}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="relative h-14 w-14 overflow-hidden rounded-xl"
                  style={{ backgroundColor: `${actual.color}33` }}
                >
                  <Image
                    src={actual.miniatura}
                    alt=""
                    fill
                    className="object-contain p-1"
                    sizes="56px"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-[#17164F]">{actual.name}</h2>
                  <p className="text-xs text-[#5636D9]">{actual.descriptor}</p>
                </div>
              </div>
              <dl className="space-y-1.5 text-xs">
                <Row k="Sistema" v={actual.sistema} />
                <Row k="Función" v={actual.funcion} />
                <Row k="Ubicación" v={actual.ubicacion} />
                <Row k="Relación" v={actual.relacion} />
                <Row k="Tamaño" v={actual.tamano} />
              </dl>
              <p className="mt-3 rounded-xl bg-[#F2EEFF] p-2.5 text-xs text-[#17164F]">
                💡 {actual.datoCurioso}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#17164F]/75">
                {actual.resumen}
              </p>
            </div>
          </aside>

          <div className="overflow-hidden rounded-3xl border border-[#E8E0FF] bg-white text-[#17164F] shadow-lg">
            <div className="relative h-[360px] sm:h-[440px] lg:h-[520px]">
              <OrganViewer
                selectedId={activo}
                className="absolute inset-0 h-full w-full"
              />

              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-xl bg-white/90 px-3 py-1.5 text-xs shadow backdrop-blur">
                <span>{actual.emoji}</span>
                <span className="font-semibold">{actual.name}</span>
                <span className="text-[#6B7280]">· {actual.sistema}</span>
              </div>

              <div className="absolute bottom-3 left-3 flex max-w-[230px] items-end gap-2">
                <Image
                  src="/assets/woebling.png"
                  alt=""
                  width={48}
                  height={44}
                  className="pointer-events-none h-auto w-11"
                />
                <div className="rounded-2xl rounded-bl-sm bg-[#5636D9] px-3 py-2 text-xs text-white shadow">
                  {conModelo
                    ? "Gira el modelo y lee la ficha del órgano."
                    : "Este órgano tiene ficha completa; el 3D llega en los principales."}
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto border-t border-[#E8E0FF] bg-[#F7F4FF] px-3 py-3">
              {ORGANOS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setActivo(o.id)}
                  className={`flex shrink-0 flex-col items-center rounded-xl px-2.5 py-2 ${
                    activo === o.id
                      ? "bg-[#5636D9] text-white"
                      : "bg-white text-[#17164F] shadow-sm"
                  }`}
                >
                  <span className="relative mb-1 h-9 w-9 overflow-hidden rounded-lg bg-[#F2EEFF]">
                    <Image
                      src={o.miniatura}
                      alt=""
                      fill
                      className="object-contain p-0.5"
                      sizes="36px"
                    />
                  </span>
                  <span className="text-[10px] font-medium">{o.name}</span>
                  {o.modelo && (
                    <span
                      className={`mt-0.5 text-[8px] uppercase tracking-wide ${
                        activo === o.id ? "text-white/80" : "text-[#5636D9]"
                      }`}
                    >
                      3D
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile info */}
        <div className="mt-4 rounded-2xl border border-[#E8E0FF] bg-white p-4 shadow-sm lg:hidden">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-2xl">{actual.emoji}</span>
            <div>
              <h2 className="font-bold text-[#17164F]">{actual.name}</h2>
              <p className="text-xs text-[#5636D9]">{actual.sistema}</p>
            </div>
          </div>
          <p className="text-sm text-[#17164F]/80">{actual.resumen}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <Row k="Función" v={actual.funcion} />
            <Row k="Ubicación" v={actual.ubicacion} />
            <Row k="Relación" v={actual.relacion} />
            <Row k="Tamaño" v={actual.tamano} />
          </dl>
          <p className="mt-3 rounded-xl bg-[#F2EEFF] p-2.5 text-xs text-[#17164F]">
            💡 {actual.datoCurioso}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/estudiante/explorar"
            className="flex-1 rounded-2xl border border-[#E8E0FF] bg-white py-3.5 text-center text-sm font-bold text-[#17164F]"
          >
            Ver Sistema Solar 3D
          </Link>
          <Link
            href="/estudiante/ruta"
            className="flex-1 rounded-2xl bg-[#5636D9] py-3.5 text-center text-sm font-bold text-white"
          >
            Volver a aprender →
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
