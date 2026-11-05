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

const topNav = [
  { href: "/estudiante", label: "Inicio" },
  { href: "/estudiante/ruta", label: "Aprender", on: true },
  { href: "/estudiante/juegos", label: "Juegos" },
  { href: "/estudiante/aula", label: "Aula" },
  { href: "/estudiante/progreso", label: "Mi progreso" },
];

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
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#B8D4FF]">
      {/* Header desktop */}
      <header className="absolute inset-x-0 top-0 z-20 hidden px-4 pt-4 lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link href="/estudiante" className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 shadow">
            <Image src="/assets/Logo.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
            <span className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
              EduNova
            </span>
          </Link>
          <nav className="flex gap-1 rounded-full bg-white/95 p-1 shadow">
            {topNav.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  n.on ? "bg-[#5636D9] text-white" : "text-[#17164F]/70"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#17164F]">
            <span className="rounded-full bg-white/95 px-3 py-1.5 shadow">🔥 3 días</span>
            <span className="rounded-full bg-white/95 px-3 py-1.5 shadow">⭐ 120 XP</span>
            <span className="rounded-full bg-white/95 px-3 py-1.5 shadow">💎 5</span>
            <Image
              src="/assets/usuario.png"
              alt="usuario"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
            />
          </div>
        </div>
        <div className="mx-auto mt-3 flex max-w-6xl justify-center">
          <div className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-[#17164F] shadow">
            {MATH_COURSE.titulo} — {MATH_COURSE.nivelLabel}
          </div>
        </div>
      </header>

      {/* Header mobile */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-3 pt-3 lg:hidden">
        <Link
          href="/estudiante/curso/matematica"
          className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 shadow"
        >
          <span className="text-[#17164F]">←</span>
          <Image src="/assets/Logo.png" alt="" width={24} height={24} className="h-6 w-6" />
          <span className="font-[family-name:var(--font-fredoka)] text-sm font-semibold text-[#17164F]">
            EduNova
          </span>
        </Link>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold">
          <span className="rounded-full bg-white/90 px-2 py-1 shadow">🔥 3</span>
          <span className="rounded-full bg-white/90 px-2 py-1 shadow">⭐ 120</span>
          <Image
            src="/assets/usuario.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
          />
        </div>
      </header>

      {/* Stage pills overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-20 z-10 hidden justify-center gap-2 lg:flex">
        {MATH_STAGES.map((s) => (
          <span
            key={s.id}
            className="rounded-full px-3 py-1 text-xs font-bold text-white shadow"
            style={{ backgroundColor: s.color }}
          >
            {s.nombre} · {s.subtitle}
          </span>
        ))}
      </div>

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

      {/* Bottom station card */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:p-4 lg:bottom-4 lg:px-6">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-white/60 bg-white/95 p-3 shadow-2xl backdrop-blur sm:p-4">
          <div className="flex gap-3">
            <div className="relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#17164F] sm:block">
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                {selected.geometry === "cube"
                  ? "🧊"
                  : selected.geometry === "sphere"
                    ? "🔵"
                    : selected.geometry === "cone"
                      ? "🔺"
                      : selected.geometry === "cylinder"
                        ? "🥫"
                        : selected.geometry === "pyramid"
                          ? "⛰️"
                          : "📐"}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#5636D9]">
                    {stage.nombre} · {stage.nivel}
                  </p>
                  <h2 className="font-[family-name:var(--font-fredoka)] text-base font-semibold text-[#17164F] sm:text-lg">
                    {selected.title}
                  </h2>
                  <p className="mt-0.5 hidden text-xs text-[#5B5678] sm:block">
                    {selected.description}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!canStart}
                  onClick={startActivity}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow lg:hidden ${
                    canStart ? "bg-[#5636D9]" : "bg-[#9CA3AF]"
                  }`}
                  aria-label="Continuar"
                >
                  →
                </button>
              </div>

              <div className="mt-2 hidden flex-wrap gap-2 lg:flex">
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
                  className="ml-auto rounded-full bg-[#5636D9] px-5 py-2 text-sm font-bold text-white disabled:bg-[#9CA3AF]"
                >
                  {status === "completed" ? "Repasar →" : "Continuar →"}
                </button>
              </div>

              <div className="mt-2">
                <div className="mb-1 flex justify-between text-[10px] font-semibold text-[#6B7280]">
                  <span>
                    {done} de {MATH_STATIONS.length} lecciones
                  </span>
                  <span>
                    {status === "locked"
                      ? "Bloqueada"
                      : status === "completed"
                        ? "Completada"
                        : status === "current"
                          ? "Actual"
                          : "Disponible"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#E8E0FF]">
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
