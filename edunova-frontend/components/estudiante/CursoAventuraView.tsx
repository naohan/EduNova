"use client";

import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import {
  estudiante,
  tiposAventura,
  type CursoAprender,
} from "@/components/estudiante/data";

/** Quita el negro de los PNG de personaje (fondo #000). */
const imgKnockout = "mix-blend-screen";

function destinoAventura(curso: CursoAprender) {
  // Matemática, Comunicación, Ciencia y Sociales → aventura directa
  return curso.ctaHref;
}

export function CursoAventuraView({ curso }: { curso: CursoAprender }) {
  const destino = destinoAventura(curso);
  const isCiencia = curso.id === "ciencia";

  return (
    <EstudianteLayout
      shellClassName="min-h-screen bg-[#17164F]"
      mobileHeader={
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-transparent px-3 sm:px-4 lg:hidden">
          <Link
            href="/estudiante/ruta"
            className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5 backdrop-blur"
            aria-label="Volver a cursos"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-[#5636D9]">
              ←
            </span>
            <span className="pr-1 text-xs font-bold text-white">Volver</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-white">
            <span className="rounded-full bg-white/15 px-2 py-1 backdrop-blur">🔥 3</span>
            <span className="rounded-full bg-white/15 px-2 py-1 backdrop-blur">⭐ 120</span>
            <span className="rounded-full bg-white/15 px-2 py-1 backdrop-blur">💎 5</span>
            <Image
              src="/assets/usuario.png"
              alt="usuario"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white/40"
            />
          </div>
        </header>
      }
    >
      <div className="relative overflow-hidden">
        {/* ── Nebulosa / cielo (fondo del mockup) ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] lg:h-[560px]"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(124,58,237,0.55), transparent 60%), radial-gradient(ellipse 70% 50% at 85% 20%, rgba(76,158,255,0.35), transparent 55%), radial-gradient(ellipse 50% 40% at 50% 80%, rgba(86,54,217,0.4), transparent 70%), linear-gradient(180deg, #1a1458 0%, #2a1f7a 40%, #3d2a9e 70%, #5636D9 100%)",
          }}
        />
        {/* Estrellas */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-70 lg:h-[560px]"
          style={{
            backgroundImage:
              "radial-gradient(1.5px 1.5px at 10% 20%, #fff, transparent), radial-gradient(1px 1px at 30% 40%, #fff, transparent), radial-gradient(1.5px 1.5px at 50% 15%, #fff, transparent), radial-gradient(1px 1px at 70% 35%, #fff, transparent), radial-gradient(2px 2px at 85% 25%, #fff, transparent), radial-gradient(1px 1px at 20% 60%, #fff, transparent), radial-gradient(1.5px 1.5px at 60% 55%, #fff, transparent), radial-gradient(1px 1px at 90% 50%, #fff, transparent), radial-gradient(1px 1px at 40% 70%, #fff, transparent)",
          }}
        />
        {/* Onda inferior lavanda */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[380px] z-[1] h-[200px] lg:top-[420px]"
        >
          <svg
            viewBox="0 0 1440 200"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <path
              d="M0,80 C240,160 480,20 720,90 C960,160 1200,40 1440,100 L1440,200 L0,200 Z"
              fill="#EDE7FF"
            />
            <path
              d="M0,110 C300,180 500,50 780,120 C1000,170 1240,70 1440,130 L1440,200 L0,200 Z"
              fill="#F7F4FF"
            />
          </svg>
        </div>
        {/* Base clara bajo la onda */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[500px] bottom-0 bg-[#F7F4FF] lg:top-[540px]"
        />
        {/* Hojas / blobs decorativos */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 bottom-10 h-40 w-40 rounded-full bg-[#2DBE70]/25 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 bottom-24 h-36 w-36 rounded-full bg-[#5636D9]/20 blur-2xl"
        />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-2 sm:px-6 lg:p-8">
          {/* Volver (desktop; en móvil está en el header) */}
          <div className="mb-4 hidden lg:block">
            <Link
              href="/estudiante/ruta"
              className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-bold text-[#17164F] shadow-lg transition hover:bg-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2EEFF] text-[#5636D9]">
                ←
              </span>
              Volver a cursos
            </Link>
          </div>

          {/* ── Mobile hero ── */}
          <section className="mb-5 lg:hidden">
            <div className="relative mx-auto h-[230px] w-full max-w-[340px]">
              <Image
                src="/assets/aprender/hero_exploradora.png"
                alt=""
                fill
                className={`object-contain object-bottom ${imgKnockout}`}
                sizes="340px"
                priority
              />
              <Image
                src="/assets/aprender/holograma_tierra.png"
                alt=""
                width={96}
                height={96}
                className={`absolute right-1 top-0 h-[88px] w-[88px] object-contain drop-shadow-xl ${imgKnockout}`}
              />
              {isCiencia ? (
                <Image
                  src="/assets/aprender/esqueleto_3d.png"
                  alt=""
                  width={80}
                  height={110}
                  className={`absolute bottom-6 right-0 h-[110px] w-auto object-contain drop-shadow-lg ${imgKnockout}`}
                />
              ) : (
                <Image
                  src={curso.iconoCurso}
                  alt=""
                  width={72}
                  height={72}
                  className="absolute bottom-8 right-0 h-[72px] w-[72px] object-contain drop-shadow-lg"
                />
              )}
            </div>
            <div className="mx-auto flex max-w-md items-center gap-3 rounded-full bg-white/95 px-4 py-3 shadow-lg">
              <Image
                src={curso.iconoCurso}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 object-contain"
              />
              <div className="min-w-0">
                <h1 className="font-[family-name:var(--font-fredoka)] text-base font-semibold text-[#17164F]">
                  {curso.nombre}
                </h1>
                <p className="text-[11px] leading-snug text-[#5B5678]">{curso.tagline}</p>
              </div>
            </div>
          </section>

          {/* ── Desktop hero ── */}
          <section className="mb-8 hidden items-end gap-3 lg:grid lg:grid-cols-[1.1fr_1fr_1.2fr]">
            <div className="flex items-end gap-2 pb-2">
              <Image
                src="/assets/robot-saludando.png"
                alt=""
                width={140}
                height={160}
                className="h-auto w-[130px] shrink-0 drop-shadow-2xl"
                priority
              />
              <div className="relative mb-10 rounded-3xl rounded-bl-md bg-white px-4 py-3 shadow-xl">
                <p className="font-[family-name:var(--font-fredoka)] text-base font-semibold leading-snug text-[#17164F]">
                  ¡Hola, {estudiante.nombre}! Explora, experimenta y descubre el mundo con
                  EduNova.
                </p>
                <span
                  aria-hidden
                  className="absolute -left-2 bottom-4 h-0 w-0 border-y-[10px] border-r-[12px] border-y-transparent border-r-white"
                />
              </div>
            </div>

            <div className="mb-6 flex items-center gap-3 self-center rounded-full bg-white/95 px-5 py-4 shadow-xl">
              <Image
                src={curso.iconoCurso}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
                  {curso.nombre}
                </h1>
                <p className="text-sm text-[#5B5678]">{curso.tagline}</p>
              </div>
            </div>

            <div className="relative h-[260px]">
              <Image
                src="/assets/aprender/hero_exploradora.png"
                alt=""
                fill
                className={`object-contain object-bottom ${imgKnockout}`}
                sizes="400px"
                priority
              />
              <Image
                src="/assets/aprender/holograma_tierra.png"
                alt=""
                width={120}
                height={120}
                className={`absolute right-6 top-0 h-[110px] w-[110px] object-contain drop-shadow-2xl ${imgKnockout}`}
              />
              {isCiencia ? (
                <Image
                  src="/assets/aprender/esqueleto_3d.png"
                  alt=""
                  width={100}
                  height={140}
                  className={`absolute bottom-2 right-2 h-[130px] w-auto object-contain drop-shadow-xl ${imgKnockout}`}
                />
              ) : (
                <Image
                  src={curso.iconoCurso}
                  alt=""
                  width={100}
                  height={100}
                  className="absolute bottom-6 right-4 h-[100px] w-[100px] object-contain drop-shadow-xl"
                />
              )}
            </div>
          </section>

          {/* Adventure picker */}
          <section className="relative pt-2 lg:pt-6">
            <h2 className="mb-4 flex items-center justify-center gap-2 text-center font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F] sm:text-3xl">
              <span aria-hidden className="text-[#FFC928]">✦</span>
              Elige tu tipo de aventura
              <span aria-hidden className="text-[#FFC928]">✦</span>
            </h2>

            {/* Mobile: toca la tarjeta → entra de frente a la aventura */}
            <div className="space-y-3 lg:hidden">
              {tiposAventura.map((tipo) => (
                <Link
                  key={tipo.id}
                  href={destino}
                  className={`flex w-full flex-col overflow-hidden rounded-[24px] text-left shadow-md transition ${tipo.cardBg}`}
                >
                  <div className="relative z-10 flex h-[148px] items-end justify-center px-3 pt-3">
                    <Image
                      src={tipo.imagen}
                      alt=""
                      width={160}
                      height={148}
                      className={`h-[140px] w-auto max-w-full object-contain object-bottom drop-shadow-md ${imgKnockout}`}
                    />
                  </div>
                  <div className="relative z-0 flex items-center gap-2 rounded-t-[28px] bg-white px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-[family-name:var(--font-fredoka)] text-base font-semibold text-[#17164F]">
                        {tipo.nombre}
                      </h3>
                      <p className="mt-0.5 text-[11px] leading-snug text-[#5B5678]">
                        {tipo.desc}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5636D9] text-white shadow">
                      <ArrowIcon />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop: misma acción — de frente a la aventura */}
            <div className="hidden gap-5 lg:grid lg:grid-cols-3">
              {tiposAventura.map((tipo) => (
                <Link
                  key={tipo.id}
                  href={destino}
                  className={`group relative flex flex-col overflow-hidden rounded-[32px] text-left shadow-lg transition hover:-translate-y-1 ${tipo.cardBg}`}
                >
                  <div className="relative z-10 flex h-[230px] items-end justify-center px-4 pt-5">
                    <Image
                      src={tipo.imagen}
                      alt=""
                      width={240}
                      height={220}
                      className={`h-[210px] w-auto max-w-[95%] object-contain object-bottom drop-shadow-lg ${imgKnockout}`}
                    />
                  </div>
                  <div className="relative z-0 rounded-t-[36px] bg-white px-5 pb-5 pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
                          {tipo.nombre}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-[#5B5678]">
                          {tipo.desc}
                        </p>
                      </div>
                      <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#5636D9] text-white shadow-md transition group-hover:scale-105">
                        <ArrowIcon />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 flex justify-center lg:mt-10">
              <Link
                href={destino}
                className="inline-flex w-full max-w-md items-center justify-between gap-3 rounded-full bg-gradient-to-r from-[#5636D9] to-[#4C9EFF] px-5 py-3.5 text-white shadow-xl shadow-[#5636D9]/35 transition hover:brightness-110 sm:w-auto sm:min-w-[300px]"
              >
                <span className="flex items-center gap-3">
                  <Image
                    src="/assets/cohete.png"
                    alt=""
                    width={36}
                    height={36}
                    className="h-8 w-8 object-contain"
                  />
                  <span className="font-[family-name:var(--font-fredoka)] text-sm font-semibold sm:text-base">
                    Ir a la aventura
                  </span>
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </EstudianteLayout>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
