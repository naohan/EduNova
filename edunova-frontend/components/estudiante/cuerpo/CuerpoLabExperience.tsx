"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ActivityQuiz } from "@/components/estudiante/shared/ActivityQuiz";
import {
  ORGANOS,
  SISTEMAS_GALERIA,
  getOrganById,
  organHint,
  type OrganId,
} from "./organData";
import { ORGAN_QUIZZES } from "./organQuizData";
import {
  activeMission,
  discoverOrgan,
  loadCuerpoProgress,
  missionProgress,
  passOrganQuiz,
  saveCuerpoProgress,
  type CuerpoProgress,
  DEFAULT_CUERPO_PROGRESS,
} from "./cuerpoProgress";
import { CheckIcon, BinocularsIcon, FlaskIcon, StarIcon, TrophyIcon } from "@/components/ui/icons";

const OrganViewer = dynamic(() => import("./OrganViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[280px] items-center justify-center bg-[#1a1458] text-sm text-white/80">
      Preparando laboratorio 3D…
    </div>
  ),
});

const ROBOT_MSGS = [
  "¡Gira el órgano con el dedo o el ratón!",
  "Cada órgano descubierto te da XP.",
  "Cuando termines, ¡ponte a prueba!",
  "Mira el dato curioso: ¡te ayudará en el quiz!",
];

export function CuerpoLabExperience() {
  const [progress, setProgress] = useState<CuerpoProgress>(DEFAULT_CUERPO_PROGRESS);
  const [activo, setActivo] = useState<OrganId>("corazon");
  const [hydrated, setHydrated] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [filterSistema, setFilterSistema] = useState<string>("todos");
  const [toast, setToast] = useState<string | null>(null);
  const [robotIdx, setRobotIdx] = useState(0);

  useEffect(() => {
    const p = loadCuerpoProgress();
    setProgress(p);
    setActivo(p.lastId);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCuerpoProgress(progress);
  }, [progress, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    setProgress((prev) => {
      const next = discoverOrgan(activo, prev);
      return next === prev ? prev : next;
    });
    setRobotIdx((i) => (i + 1) % ROBOT_MSGS.length);
  }, [activo, hydrated]);

  const actual = getOrganById(activo);
  const conModelo = Boolean(actual.modelo);
  const { mission, done, total } = missionProgress(progress);
  const discovered = progress.discoveredIds.length;
  const quizDone = progress.quizPassedIds.includes(activo);

  const galeria = useMemo(() => {
    if (filterSistema === "todos") return ORGANOS;
    const group = SISTEMAS_GALERIA.find((s) => s.id === filterSistema);
    if (!group) return ORGANOS;
    return group.organIds.map(getOrganById);
  }, [filterSistema]);

  function selectOrgan(id: OrganId) {
    setActivo(id);
  }

  function onQuizPass(xp: number) {
    const next = passOrganQuiz(activo, progress, xp);
    setProgress(next);
    setQuizOpen(false);
    setToast(`¡+${xp} XP! Dominaste ${actual.name}`);
    setTimeout(() => setToast(null), 2600);
  }

  const badges = [
    {
      label: "Explorador",
      ok: discovered >= 3,
      icon: BinocularsIcon,
    },
    {
      label: "Científico",
      ok: progress.quizPassedIds.length >= 2,
      icon: FlaskIcon,
    },
    {
      label: "Misión",
      ok: progress.missionsDone.length >= 1,
      icon: TrophyIcon,
    },
  ];

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#17164F]">
      {/* Fondo atmósfera */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "#17164F",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4 p-3 pb-8 sm:p-5 lg:p-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/estudiante/ruta"
            className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-sm font-bold text-[#17164F] shadow"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2EEFF] text-[#5636D9]">
              ←
            </span>
            <span className="hidden sm:inline">Volver</span>
          </Link>

          <div className="rounded-full bg-white/95 px-3 py-2 text-center shadow">
            <p className="font-[family-name:var(--font-fredoka)] text-sm font-semibold text-[#17164F] sm:text-base">
              Laboratorio del cuerpo
            </p>
            <p className="text-[10px] font-semibold text-[#5636D9] sm:text-xs">
              Explora en 3D
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold sm:text-xs">
            <span className="rounded-full bg-white/95 px-2.5 py-1.5 text-[#17164F] shadow">
              <StarIcon weight="fill" className="mr-1 inline h-4 w-4 align-[-3px] text-[#E0A800]" aria-hidden /> {progress.xp} XP
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-1.5 text-white backdrop-blur">
              {discovered}/{ORGANOS.length}
            </span>
          </div>
        </header>

        {/* Misión */}
        <section className="rounded-2xl border border-white/20 bg-white/10 p-3 shadow-lg backdrop-blur-md sm:p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-[#25CFE0]">
                Misión activa
              </p>
              <h2 className="font-[family-name:var(--font-fredoka)] text-base font-semibold text-white sm:text-lg">
                {mission.titulo}
              </h2>
              <p className="mt-0.5 text-xs text-white/70">
                Explora {done} de {total} órganos y gana {mission.xpBonus} XP
              </p>
            </div>
            <div className="flex gap-1.5">
              {badges.map((b) => (
                <div
                  key={b.label}
                  title={b.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                    b.ok
                      ? "bg-[#FFC928] shadow"
                      : "bg-white/10 opacity-40 grayscale"
                  }`}
                >
                  <b.icon weight="fill" className="h-5 w-5 text-[#17164F]" aria-hidden />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#25CFE0] transition-all"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
        </section>

        {/* Layout principal */}
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Visor 3D */}
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-[#120f3d]/60 shadow-2xl">
            <div className="relative h-[300px] sm:h-[380px] lg:h-[480px]">
              {hydrated && (
                <OrganViewer
                  selectedId={activo}
                  className="absolute inset-0 h-full w-full"
                />
              )}

              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
                                <div>
                  <p className="text-sm font-bold text-[#17164F]">{actual.name}</p>
                  <p className="text-[10px] font-semibold text-[#5636D9]">
                    {actual.sistema}
                    {conModelo ? ", en 3D" : ""}
                  </p>
                </div>
              </div>

              {/* Robot guía */}
              <div className="absolute bottom-3 left-3 right-3 flex max-w-sm items-end gap-2 sm:right-auto">
                <Image
                  src="/assets/robot-saludando.png"
                  alt=""
                  width={56}
                  height={64}
                  className="h-14 w-auto drop-shadow-lg sm:h-16"
                />
                <div className="rounded-2xl rounded-bl-md bg-white px-3 py-2 text-xs font-semibold text-[#17164F] shadow-lg">
                  {ROBOT_MSGS[robotIdx]}
                  <p className="mt-1 text-[10px] font-normal text-[#5B5678]">
                    {organHint(actual)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel info */}
          <aside className="flex flex-col gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-xl sm:p-5">
              <div className="flex items-start gap-3">
                <div
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl sm:h-20 sm:w-20"
                  style={{ backgroundColor: `${actual.color}33` }}
                >
                  <Image
                    src={actual.miniatura}
                    alt=""
                    fill
                    className="object-contain p-1.5"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-[#5636D9]">
                    {actual.descriptor}
                  </p>
                  <h3 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
                    {actual.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#25CFE0]">
                    {actual.sistema}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#5B5678]">
                {actual.funcion}. {actual.resumen.split(".")[0]}.
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <BadgeCard label="Ubicación" value={actual.ubicacion} />
                <BadgeCard label="Relación" value={actual.relacion} />
                <BadgeCard label="Tamaño" value={actual.tamano} />
                <BadgeCard
                  label="Estado"
                  value={
                    progress.discoveredIds.includes(activo)
                      ? "Descubierto"
                      : "Nuevo"
                  }
                />
              </div>

              {/* Dato curioso animado */}
              <div className="mt-3 flex gap-3 overflow-hidden rounded-2xl bg-[#F2EEFF] p-3">
                <div className="relative h-14 w-14 shrink-0">
                  <Image
                    src="/assets/aprender/frasco_ciencia.png"
                    alt=""
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#5636D9]">
                    Dato curioso
                  </p>
                  <p className="text-xs font-semibold leading-snug text-[#17164F] sm:text-sm">
                    {actual.datoCurioso}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setQuizOpen(true)}
                className="mt-4 w-full rounded-full bg-[#5636D9] py-3.5 text-sm font-bold text-white transition hover:bg-[#4a2dc0]"
              >
                {quizDone
                  ? "Repasar lo aprendido →"
                  : "Poner a prueba lo aprendido →"}
              </button>
            </div>

            <div className="flex gap-2">
              <Link
                href="/estudiante/explorar"
                className="flex-1 rounded-2xl border border-white/25 bg-white/10 py-3 text-center text-xs font-bold text-white backdrop-blur"
              >
                Sistema Solar
              </Link>
              <Link
                href="/estudiante/ruta"
                className="flex-1 rounded-2xl bg-[#25CFE0] py-3 text-center text-xs font-bold text-[#17164F]"
              >
                Mis cursos
              </Link>
            </div>
          </aside>
        </div>

        {/* Galería por sistemas */}
        <section className="rounded-2xl border border-white/15 bg-white/95 p-3 shadow-xl sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-[family-name:var(--font-fredoka)] text-base font-semibold text-[#17164F]">
              Galería de órganos
            </h3>
            <p className="text-[10px] font-semibold text-[#5B5678]">
              {progress.missionsDone.includes(activeMission(progress).id)
                ? "¡Misión lista!"
                : `${discovered} descubiertos`}
            </p>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            <FilterChip
              label="Todos"
              active={filterSistema === "todos"}
              onClick={() => setFilterSistema("todos")}
            />
            {SISTEMAS_GALERIA.map((s) => (
              <FilterChip
                key={s.id}
                label={s.nombre}
                active={filterSistema === s.id}
                color={s.color}
                onClick={() => setFilterSistema(s.id)}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {galeria.map((o) => {
              const selected = o.id === activo;
              const seen = progress.discoveredIds.includes(o.id);
              const passed = progress.quizPassedIds.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => selectOrgan(o.id)}
                  className={`flex flex-col items-center rounded-2xl p-2.5 text-center transition ${
                    selected
                      ? "bg-[#5636D9] text-white ring-2 ring-[#25CFE0] ring-offset-2"
                      : "bg-[#F7F4FF] text-[#17164F] hover:bg-[#EDE7FF]"
                  }`}
                >
                  <span
                    className="relative mb-1.5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl"
                    style={{
                      backgroundColor: selected ? "#FFFFFF33" : `${o.color}28`,
                    }}
                  >
                    <Image
                      src={o.miniatura}
                      alt=""
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                    {passed && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2DBE70] text-[10px] text-white">
                        <CheckIcon weight="bold" className="h-4 w-4" aria-label="Descubierto" />
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-bold leading-tight">{o.name}</span>
                  <span
                    className={`mt-0.5 text-[9px] font-semibold ${
                      selected ? "text-white/80" : "text-[#5B5678]"
                    }`}
                  >
                    {o.sistema.replace("Sistema ", "")}
                  </span>
                  {o.modelo && (
                    <span
                      className={`mt-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                        selected
                          ? "bg-white/20 text-white"
                          : "bg-[#E0F7FA] text-[#0E7490]"
                      }`}
                    >
                      3D
                    </span>
                  )}
                  {!seen && !selected && (
                    <span className="mt-1 text-[9px] text-[#A78BFA]">Nuevo</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#2DBE70] px-5 py-2.5 text-sm font-bold text-white shadow-xl">
          {toast}
        </div>
      )}

      {quizOpen && (
        <ActivityQuiz
          title={`Reto: ${actual.name}`}
          intro={`Recuerda: ${actual.datoCurioso}`}
          questions={ORGAN_QUIZZES[activo]}
          onClose={() => setQuizOpen(false)}
          onPass={onQuizPass}
        />
      )}
    </div>
  );
}

function BadgeCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F7F4FF] px-3 py-2.5">
      <p className="text-[9px] font-bold text-[#5B5678]">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-bold leading-snug text-[#17164F]">
        {value}
      </p>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[10px] font-bold transition sm:text-xs ${
        active
          ? "bg-[#5636D9] text-white"
          : "bg-[#F2EEFF] text-[#17164F] hover:bg-[#E8E0FF]"
      }`}
      style={
        active && color
          ? { backgroundColor: color, color: "#fff" }
          : undefined
      }
    >
      {label}
    </button>
  );
}
