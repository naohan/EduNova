"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  COMU_COURSE,
  COMU_STAGES,
  COMU_STATIONS,
  DEFAULT_COMU_PROGRESS,
  comuCompletedCount,
  completeComuStation,
  getComuStationStatus,
  loadComuProgress,
  saveComuProgress,
  type ComuProgress,
  type ComuStation,
} from "./comuMapData";
import { StarIcon } from "@/components/ui/icons";

const ComuIslandMap = dynamic(
  () => import("./ComuIslandMap").then((m) => m.ComuIslandMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#E9D5FF] text-sm text-[#17164F]">
        Cargando el Reino de las Palabras…
      </div>
    ),
  },
);

const ReadingActivity = dynamic(
  () => import("./ReadingActivity").then((m) => m.ReadingActivity),
  { ssr: false },
);

export function ComuMapExperience() {
  const [progress, setProgress] = useState<ComuProgress>(DEFAULT_COMU_PROGRESS);
  const [selectedId, setSelectedId] = useState<string | null>("c1");
  const [activityOpen, setActivityOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const p = loadComuProgress();
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
    if (hydrated) saveComuProgress(progress);
  }, [progress, hydrated]);

  const selected: ComuStation =
    COMU_STATIONS.find((s) => s.id === selectedId) ??
    COMU_STATIONS.find((s) => s.id === progress.currentId) ??
    COMU_STATIONS[0];

  const status = getComuStationStatus(selected, progress);
  const done = comuCompletedCount(progress);
  const stage = COMU_STAGES.find((s) => s.id === selected.stageId)!;
  const canStart =
    status === "available" || status === "current" || status === "completed";

  function handleSelect(id: string) {
    const st = COMU_STATIONS.find((s) => s.id === id);
    if (!st) return;
    if (getComuStationStatus(st, progress) === "locked") return;
    setSelectedId(id);
  }

  function markComplete(xpGained: number) {
    const next = completeComuStation(selected.id, progress, xpGained);
    setProgress(next);
    setSelectedId(next.currentId);
    setActivityOpen(false);
  }

  function startActivity() {
    if (!canStart) return;
    setActivityOpen(true);
  }

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#E9D5FF]">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-3 pt-3 sm:px-4 lg:px-6 lg:pt-4">
        <Link
          href="/estudiante/ruta"
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-[#17164F] shadow-lg"
          aria-label="Volver a cursos"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFEAF2] text-[#E85D9A]">
            ←
          </span>
          <span className="hidden pr-1 sm:inline">Volver</span>
        </Link>
        <div className="rounded-full bg-white px-3 py-2 text-center text-[11px] font-semibold text-[#17164F] shadow sm:text-sm">
          {COMU_COURSE.titulo}: {COMU_COURSE.nivelLabel}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold sm:gap-2 sm:text-sm">
          <span className="rounded-full bg-white px-2 py-1 shadow sm:px-3 sm:py-1.5">
            <StarIcon weight="fill" className="mr-1 inline h-4 w-4 align-[-3px] text-[#E0A800]" aria-hidden /> {progress.xp} XP
          </span>
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
        Toca una estación o arrastra para girar el mapa
      </p>

      <div className="absolute inset-0 z-0">
        {hydrated && (
          <ComuIslandMap
            progress={progress}
            selectedId={selectedId}
            onSelect={handleSelect}
            mobile={isMobile}
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#E9D5FF]/80 to-transparent p-3 pt-10 sm:p-4 lg:bottom-5 lg:px-6">
        <div className="pointer-events-auto mx-auto max-w-4xl rounded-2xl border border-white/60 bg-white/92 p-3 shadow-2xl backdrop-blur-md sm:p-4">
          <div className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#FFF0F7] sm:h-20 sm:w-20">
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

              <div className="mt-3 hidden items-center gap-2 lg:flex">
                <span className="rounded-full bg-[#F2EEFF] px-3 py-1.5 text-xs font-bold text-[#5636D9]">
                  {status === "completed"
                    ? "Completada"
                    : status === "locked"
                      ? "Bloqueada"
                      : "Disponible"}
                </span>
                <button
                  type="button"
                  disabled={!canStart}
                  onClick={startActivity}
                  className="ml-auto rounded-full bg-[#5636D9] px-5 py-2.5 text-sm font-bold text-white disabled:bg-[#6A6586]"
                >
                  {status === "completed" ? "Repasar →" : "Continuar →"}
                </button>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[10px] font-semibold text-[#5B5678]">
                  <span>
                    {done} de {COMU_STATIONS.length} lecciones, {progress.xp} XP
                  </span>
                  <span className="text-[#E85D9A]">{stage.nombre}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#FFEAF2]">
                  <div
                    className="h-full rounded-full bg-[#5636D9] transition-all"
                    style={{
                      width: `${(done / COMU_STATIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activityOpen && (
        <ReadingActivity
          station={selected}
          onClose={() => setActivityOpen(false)}
          onComplete={markComplete}
        />
      )}
    </div>
  );
}
