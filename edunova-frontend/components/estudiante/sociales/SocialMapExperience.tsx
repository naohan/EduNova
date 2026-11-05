"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { SOLAR_BODIES, type PlanetId } from "@/components/estudiante/solar/planetData";
import { ActivityQuiz } from "@/components/estudiante/shared/ActivityQuiz";
import {
  loadCourseProgress,
  saveCourseProgress,
  type CourseProgress,
} from "@/components/estudiante/shared/quizTypes";
import {
  DEFAULT_SOCIAL_PROGRESS,
  SOCIAL_COURSE,
  SOCIAL_STAGES,
  SOCIAL_STATIONS,
  completeSocialStation,
  getSocialStatus,
  type SocialStation,
} from "./socialMapData";
import { CheckIcon, LightbulbIcon, LockIcon, StarIcon } from "@/components/ui/icons";
import { PlanetDot } from "@/components/estudiante/solar/PlanetDot";

const SolarSystemViewer = dynamic(
  () => import("@/components/estudiante/solar/SolarSystemViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-[#0b0a2e] text-sm text-white/70">
        Cargando Sistema Solar 3D…
      </div>
    ),
  },
);

export function SocialMapExperience() {
  const [progress, setProgress] = useState<CourseProgress>(DEFAULT_SOCIAL_PROGRESS);
  const [selectedId, setSelectedId] = useState("s1");
  const [quizOpen, setQuizOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const p = loadCourseProgress(
      SOCIAL_COURSE.storageKey,
      DEFAULT_SOCIAL_PROGRESS,
    );
    setProgress(p);
    setSelectedId(p.currentId);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCourseProgress(SOCIAL_COURSE.storageKey, progress);
  }, [progress, hydrated]);

  const selected: SocialStation =
    SOCIAL_STATIONS.find((s) => s.id === selectedId) ??
    SOCIAL_STATIONS.find((s) => s.id === progress.currentId) ??
    SOCIAL_STATIONS[0];

  const status = getSocialStatus(selected, progress);
  const stage = SOCIAL_STAGES.find((s) => s.id === selected.stageId)!;
  const planet = SOLAR_BODIES.find((p) => p.id === selected.planetId)!;
  const canStart =
    status === "available" || status === "current" || status === "completed";
  const done = progress.completedIds.length;

  const planetForViewer: PlanetId = selected.planetId;

  function handleSelectStation(id: string) {
    const st = SOCIAL_STATIONS.find((s) => s.id === id);
    if (!st) return;
    if (getSocialStatus(st, progress) === "locked") return;
    setSelectedId(id);
  }

  function onPlanetPick(planetId: PlanetId) {
    // Solo cambia estación si hay una disponible ligada a ese planeta
    const match = SOCIAL_STATIONS.find(
      (s) =>
        s.planetId === planetId &&
        getSocialStatus(s, progress) !== "locked",
    );
    if (match) setSelectedId(match.id);
  }

  function markComplete(xpGained: number) {
    const next = completeSocialStation(selected.id, progress, xpGained);
    setProgress(next);
    setSelectedId(next.currentId);
    setQuizOpen(false);
  }

  const stationList = useMemo(() => SOCIAL_STATIONS, []);

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#0b0a2e]">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-3 pt-3 sm:px-4 lg:px-6 lg:pt-4">
        <Link
          href="/estudiante/ruta"
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-[#17164F] shadow-lg"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF6E0] text-[#5636D9]">
            ←
          </span>
          <span className="hidden pr-1 sm:inline">Volver</span>
        </Link>
        <div className="rounded-full bg-white/95 px-3 py-2 text-center text-[11px] font-semibold text-[#17164F] shadow sm:text-sm">
          {SOCIAL_COURSE.titulo}: {SOCIAL_COURSE.nivelLabel}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-white sm:text-sm">
          <span className="rounded-full bg-white/15 px-2 py-1 backdrop-blur sm:px-3">
            <StarIcon weight="fill" className="mr-1 inline h-4 w-4 align-[-3px] text-[#E0A800]" aria-hidden /> {progress.xp} XP
          </span>
          <Image
            src="/assets/usuario.png"
            alt="usuario"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-white/40"
          />
        </div>
      </header>

      {/* Visor 3D reutilizado */}
      <div className="absolute inset-0 z-0 pt-14 pb-[200px] sm:pb-[180px]">
        {hydrated && (
          <SolarSystemViewer
            selectedId={planetForViewer}
            onSelect={onPlanetPick}
            className="h-full w-full"
          />
        )}
      </div>

      {/* Carrusel de estaciones */}
      <div className="absolute inset-x-0 bottom-[148px] z-10 overflow-x-auto px-3 sm:bottom-[160px]">
        <div className="mx-auto flex max-w-4xl gap-2">
          {stationList.map((st) => {
            const stStatus = getSocialStatus(st, progress);
            const locked = stStatus === "locked";
            return (
              <button
                key={st.id}
                type="button"
                disabled={locked}
                onClick={() => handleSelectStation(st.id)}
                className={`flex shrink-0 flex-col items-center rounded-xl px-3 py-2 text-[10px] font-bold ${
                  selectedId === st.id
                    ? "bg-[#5636D9] text-white"
                    : locked
                      ? "bg-white/10 text-white/40"
                      : stStatus === "completed"
                        ? "bg-[#2DBE70] text-white"
                        : "bg-white/15 text-white"
                }`}
              >
                <span className="text-lg">
                  <PlanetDot color={SOLAR_BODIES.find((p) => p.id === st.planetId)?.color ?? 0x5636d9} />
                </span>
                <span className="mt-0.5 max-w-[72px] truncate">
                  {locked ? <LockIcon weight="fill" aria-label="Bloqueada" /> : stStatus === "completed" ? <CheckIcon weight="bold" aria-label="Completada" /> : st.order}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarjeta inferior */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-4">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-3 shadow-2xl sm:p-4">
          <div className="flex gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#0b0a2e] text-3xl sm:h-20 sm:w-20">
              <PlanetDot color={planet.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-[#5636D9]">
                {stage.nombre}, {planet.name}
              </p>
              <h2 className="font-[family-name:var(--font-fredoka)] text-base font-semibold text-[#17164F] sm:text-lg">
                {selected.title}
              </h2>
              <p className="mt-0.5 text-xs text-[#5B5678]">{selected.description}</p>
              <p className="mt-1 hidden text-[11px] text-[#5B5678] sm:block">
                <LightbulbIcon weight="duotone" className="mr-1 inline h-4 w-4 align-[-3px] text-[#5636D9]" aria-hidden /> {planet.info.dato}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  disabled={!canStart}
                  onClick={() => setQuizOpen(true)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold text-white ${
                    canStart ? "bg-[#5636D9]" : "bg-[#6A6586]"
                  }`}
                >
                  {status === "completed" ? "Repasar →" : "Responder →"}
                </button>
                <span className="text-[10px] font-semibold text-[#5B5678]">
                  {done} de {SOCIAL_STATIONS.length}, {progress.xp} XP
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E8E0FF]">
                <div
                  className="h-full rounded-full bg-[#5636D9]"
                  style={{
                    width: `${(done / SOCIAL_STATIONS.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {quizOpen && (
        <ActivityQuiz
          title={selected.title}
          intro={`Observa ${planet.name} en el modelo 3D y responde. ${planet.info.dato}`}
          questions={selected.questions}
          onClose={() => setQuizOpen(false)}
          onPass={markComplete}
        />
      )}
    </div>
  );
}
