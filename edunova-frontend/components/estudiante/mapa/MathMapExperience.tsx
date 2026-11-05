"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  MATH_COURSE,
  MATH_STAGES,
  MATH_STATIONS,
  completedCount,
  completeStation,
  getStationStatus,
  loadMathProgress,
  saveMathProgress,
  type MathProgress,
  type MathStation,
} from "./mathMapData";
import { FireIcon, StarIcon } from "@/components/ui/icons";

const MathIslandMap = dynamic(
  () => import("./MathIslandMap").then((m) => m.MathIslandMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#B8D4FF] text-sm text-[#17164F]">
        Cargando isla 3D…
      </div>
    ),
  },
);

const GeometryExplorer = dynamic(
  () => import("./GeometryExplorer").then((m) => m.GeometryExplorer),
  { ssr: false },
);

export function MathMapExperience() {
  const [progress, setProgress] = useState<MathProgress>({
    completedIds: [],
    currentId: "e1",
  });
  const [selectedId, setSelectedId] = useState<string | null>("e1");
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const p = loadMathProgress();
    setProgress(p);
    setSelectedId(p.currentId);
    setHydrated(true);
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (hydrated) saveMathProgress(progress);
  }, [progress, hydrated]);

  const selected: MathStation =
    MATH_STATIONS.find((s) => s.id === selectedId) ??
    MATH_STATIONS.find((s) => s.id === progress.currentId) ??
    MATH_STATIONS[0];

  const status = getStationStatus(selected, progress);
  const done = completedCount(progress);
  const stage = MATH_STAGES.find((s) => s.id === selected.stageId)!;

  const canStart = status === "available" || status === "current" || status === "completed";

  function handleSelect(id: string) {
    const st = MATH_STATIONS.find((s) => s.id === id);
    if (!st) return;
    const s = getStationStatus(st, progress);
    if (s === "locked") return;
    setSelectedId(id);
  }

  function startActivity() {
    if (!canStart) return;
    if (selected.kind === "explorar3d" || selected.geometry) {
      setExplorerOpen(true);
      return;
    }
    // teoría / juego / reto: marcar completado tras “actividad” corta
    markComplete();
  }

  function markComplete() {
    const next = completeStation(selected.id, progress);
    setProgress(next);
    setSelectedId(next.currentId);
    setExplorerOpen(false);
  }

  const secondary = useMemo(
    () => [
      { label: "Teoría", action: () => markComplete() },
      {
        label: "Juego",
        action: () => {
          if (selected.geometry) setExplorerOpen(true);
          else markComplete();
        },
      },
      {
        label: "Explorar en 3D",
        action: () => setExplorerOpen(true),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected.id, progress],
  );

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#C9B8F5]">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-3 pt-3 sm:px-4 lg:px-6 lg:pt-4">
        <Link
          href="/estudiante/ruta"
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-[#17164F] shadow-lg"
          aria-label="Volver a cursos"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2EEFF] text-[#5636D9]">
            ←
          </span>
          <span className="hidden pr-1 sm:inline">Volver</span>
        </Link>
        <div className="rounded-full bg-white px-3 py-2 text-center text-[11px] font-semibold text-[#17164F] shadow sm:text-sm">
          {MATH_COURSE.titulo}: {MATH_COURSE.nivelLabel}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold sm:gap-2 sm:text-sm">
          <span className="rounded-full bg-white px-2 py-1 shadow sm:px-3 sm:py-1.5"><FireIcon weight="fill" className="mr-1 inline h-4 w-4 align-[-3px] text-[#E8590C]" aria-hidden />3</span>
          <span className="hidden rounded-full bg-white px-3 py-1.5 shadow sm:inline"><StarIcon weight="fill" className="mr-1 inline h-4 w-4 align-[-3px] text-[#E0A800]" aria-hidden />120</span>
          <Image
            src="/assets/usuario.png"
            alt="usuario"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-white sm:h-9 sm:w-9"
          />
        </div>
      </header>

      <p className="pointer-events-none absolute inset-x-0 top-[4.25rem] z-10 text-center text-[11px] font-semibold text-[#17164F]/70 lg:top-[4.75rem]">
        Toca una estación del camino o arrastra para girar el mapa
      </p>

      {/* 3D Map */}
      <div className="absolute inset-0 z-0">
        {hydrated && (
          <MathIslandMap
            progress={progress}
            selectedId={selectedId}
            onSelect={handleSelect}
            mobile={isMobile}
          />
        )}
      </div>

      {/* Bottom station card (estilo mockup) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#C9B8F5]/80 to-transparent p-3 pt-10 sm:p-4 lg:bottom-5 lg:px-6">
        <div className="pointer-events-auto mx-auto max-w-4xl rounded-2xl border border-white/60 bg-white/92 p-3 shadow-2xl backdrop-blur-md sm:p-4">
          <div className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#17164F] sm:h-20 sm:w-20">
              <Image
                src={selected.icon}
                alt=""
                fill
                className="object-contain p-1.5"
                sizes="80px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-[family-name:var(--font-fredoka)] text-base font-semibold text-[#17164F] sm:text-lg">
                    {selected.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#5B5678] sm:text-sm">
                    {selected.description}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!canStart}
                  onClick={startActivity}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow lg:hidden ${
                    canStart ? "bg-[#5636D9]" : "bg-[#6A6586]"
                  }`}
                  aria-label="Continuar"
                >
                  →
                </button>
              </div>

              <div className="mt-3 hidden flex-wrap items-center gap-2 lg:flex">
                {secondary.map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    disabled={!canStart}
                    onClick={b.action}
                    className="rounded-full border border-[#E8E0FF] bg-[#F2EEFF] px-3 py-1.5 text-xs font-bold text-[#17164F] disabled:opacity-40"
                  >
                    {b.label}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!canStart}
                  onClick={startActivity}
                  className="ml-auto rounded-full bg-[#5636D9] px-5 py-2.5 text-sm font-bold text-white disabled:bg-[#6A6586]"
                >
                  Continuar →
                </button>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[10px] font-semibold text-[#5B5678]">
                  <span>
                    {done} de {MATH_STATIONS.length} lecciones
                  </span>
                  <span className="text-[#5636D9]">{stage.nombre}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#E8E0FF]">
                  <div
                    className="h-full rounded-full bg-[#5636D9] transition-all"
                    style={{
                      width: `${(done / MATH_STATIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {explorerOpen && (
        <GeometryExplorer
          geometry={selected.geometry ?? "cube"}
          onClose={() => setExplorerOpen(false)}
          onComplete={markComplete}
        />
      )}
    </div>
  );
}
