import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { estudiante, unidadActual, insignias } from "@/components/estudiante/data";

const shortcuts = [
  { href: "/estudiante/ruta", label: "Aprender", emoji: "📘", bg: "bg-[#EAF6FF]" },
  { href: "/estudiante/juegos", label: "Juegos", emoji: "🎮", bg: "bg-[#F2EEFF]" },
  { href: "/estudiante/misiones", label: "Retos", emoji: "🏆", bg: "bg-[#FFF6E8]" },
  { href: "/estudiante/progreso", label: "Mi progreso", emoji: "📈", bg: "bg-[#E9F9F0]" },
];

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {/* ── Mobile home (mockup gamificado) ── */}
        <div className="lg:hidden">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-[#F2EEFF] ring-2 ring-white shadow">
              <Image
                src="/assets/aventurero.png"
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-cover object-top"
                priority
              />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
                ¡Hola, {estudiante.nombre}!
              </h1>
              <p className="text-sm text-[#6B7280]">
                {estudiante.nivel} · {estudiante.edad} años
              </p>
            </div>
          </div>

          <div className="mb-4 flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
              <span>🔥</span>
              <div>
                <div className="text-[10px] text-[#6B7280]">Racha</div>
                <div className="text-sm font-bold text-[#17164F]">{estudiante.racha} días</div>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
              <span>💎</span>
              <div>
                <div className="text-[10px] text-[#6B7280]">Puntos</div>
                <div className="text-sm font-bold text-[#17164F]">
                  {estudiante.puntos.toLocaleString("es-PE")}
                </div>
              </div>
            </div>
          </div>

          {/* Mission card */}
          <Link
            href="/estudiante/ruta"
            className="relative mb-4 block overflow-hidden rounded-3xl bg-gradient-to-br from-[#5636D9] to-[#3d28a8] p-5 text-white shadow-lg"
          >
            <div className="absolute -right-2 top-2 text-6xl opacity-90">🪐</div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Misión actual
            </p>
            <h2 className="mt-1 max-w-[70%] font-[family-name:var(--font-fredoka)] text-2xl font-semibold">
              {unidadActual.titulo}
            </h2>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-white/80">
                <span>Progreso</span>
                <span>{unidadActual.progreso}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/25">
                <div
                  className="h-full rounded-full bg-[#FFC928]"
                  style={{ width: `${unidadActual.progreso}%` }}
                />
              </div>
            </div>
          </Link>

          {/* Shortcut grid */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            {shortcuts.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl ${s.bg} border border-white/60 p-4 shadow-sm`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-sm font-bold text-[#17164F]">{s.label}</span>
              </Link>
            ))}
          </div>

          <Link
            href="/estudiante/cuerpo"
            className="mb-4 flex items-center gap-3 rounded-3xl border border-[#E8E0FF] bg-white p-4 shadow-sm"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFE8EE] text-2xl">
              🫀
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#5636D9]">
                Nueva exploración 3D
              </p>
              <h2 className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
                El cuerpo humano
              </h2>
              <p className="text-xs text-[#6B7280]">Órganos, sistemas y modelos GLB</p>
            </div>
            <span className="text-[#5636D9]">→</span>
          </Link>

          {/* Mascot tip */}
          <div className="flex items-end gap-2 rounded-2xl bg-white p-3 shadow-sm">
            <Image
              src="/assets/woebling.png"
              alt="Woebling"
              width={56}
              height={52}
              className="h-auto w-12 shrink-0"
            />
            <p className="rounded-2xl rounded-bl-sm bg-[#F2EEFF] px-3 py-2 text-sm text-[#17164F]">
              ¡Hoy puedes avanzar en tu misión y jugar con tu equipo!
            </p>
          </div>
        </div>

        {/* ── Desktop ── */}
        <div className="hidden space-y-5 lg:block">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5636D9] to-[#17164F] p-6 text-white shadow-lg">
            <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between gap-6">
              <div className="max-w-xl">
                <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-semibold">
                  ¡Hola, {estudiante.nombre}!
                </h1>
                <p className="mt-2 text-white/85">
                  Sigamos explorando el Sistema Solar y jugando en equipo.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <span className="rounded-xl bg-white/15 px-3 py-2 text-sm">
                    🔥 Racha {estudiante.racha} días
                  </span>
                  <span className="rounded-xl bg-white/15 px-3 py-2 text-sm">
                    💎 {estudiante.puntos.toLocaleString("es-PE")} pts
                  </span>
                  <span className="rounded-xl bg-white/15 px-3 py-2 text-sm">
                    🏆 {estudiante.nivel}
                  </span>
                </div>
              </div>
              <Image
                src="/assets/woebling.png"
                alt="Woebling"
                width={140}
                height={130}
                className="h-auto w-[130px]"
              />
            </div>
          </section>

          <div className="grid grid-cols-4 gap-4">
            {shortcuts.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className={`rounded-2xl ${s.bg} border border-[#E8E0FF] p-5 text-center shadow-sm`}
              >
                <div className="text-3xl">{s.emoji}</div>
                <div className="mt-2 font-bold text-[#17164F]">{s.label}</div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[#17164F]">{unidadActual.titulo}</h2>
                  <p className="text-sm text-[#6B7280]">{unidadActual.leccion}</p>
                </div>
                <span className="text-sm font-bold text-[#2DBE70]">{unidadActual.progreso}%</span>
              </div>
              <div className="mb-4 h-3 overflow-hidden rounded-full bg-[#E8E0FF]">
                <div
                  className="h-full rounded-full bg-[#2DBE70]"
                  style={{ width: `${unidadActual.progreso}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/estudiante/ruta"
                  className="rounded-xl bg-[#5636D9] px-5 py-2.5 text-sm font-bold text-white"
                >
                  Continuar aprendiendo
                </Link>
                <Link
                  href="/estudiante/cuerpo"
                  className="rounded-xl border border-[#5636D9] px-5 py-2.5 text-sm font-bold text-[#5636D9]"
                >
                  Explorar cuerpo 3D
                </Link>
                <Link
                  href="/estudiante/juegos"
                  className="rounded-xl border border-[#E8E0FF] px-5 py-2.5 text-sm font-bold text-[#17164F]"
                >
                  Jugar tablero
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-semibold text-[#17164F]">Mis insignias</h2>
              <div className="flex flex-wrap gap-2">
                {insignias.map((b) => (
                  <div
                    key={b.id}
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${
                      b.obtenida ? "bg-[#F2EEFF]" : "bg-gray-100 opacity-40"
                    }`}
                  >
                    {b.emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </EstudianteLayout>
  );
}
