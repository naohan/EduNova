import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { NombreAlumno } from "@/components/estudiante/NombreAlumno";
import { ResumenPuntos } from "@/components/estudiante/ResumenPuntos";
import { unidadActual, insignias } from "@/components/estudiante/data";
import { ArrowRightIcon } from "@/components/ui/icons";

const shortcuts = [
  { href: "/estudiante/ruta", label: "Aprender", img: "/assets/juego ludico/icon_libro_abierto.png" },
  { href: "/estudiante/juegos", label: "Juegos", img: "/assets/juego ludico/icon_dado.png" },
  { href: "/estudiante/misiones", label: "Retos", img: "/assets/juego ludico/icon_trofeo.png" },
  { href: "/estudiante/progreso", label: "Mi progreso", img: "/assets/juego ludico/icon_grafico.png" },
];

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6 lg:p-8">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-semibold text-[#17164F] sm:text-4xl">
              ¡Hola, <NombreAlumno />!
            </h1>
            <p className="mt-1 text-[#5B5678]">Sigamos explorando el Sistema Solar y jugando en equipo.</p>
          </div>
          <ResumenPuntos />
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <Link
            href="/estudiante/ruta"
            className="group flex flex-col overflow-hidden rounded-2xl bg-[#17164F] text-white"
          >
            <Image
              src="/assets/landing/sistema-solar.webp"
              alt=""
              width={1400}
              height={884}
              priority
              sizes="(min-width: 1024px) 640px, 100vw"
              className="h-44 w-full object-cover sm:h-56"
            />
            <div className="p-5 sm:p-6">
              <p className="text-sm font-semibold text-white/80">Misión actual</p>
              <h2 className="mt-0.5 font-[family-name:var(--font-fredoka)] text-2xl font-semibold">
                {unidadActual.titulo}
              </h2>
              <p className="mt-1 text-sm text-white/80">{unidadActual.leccion}</p>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="h-2 flex-1 overflow-hidden rounded-full bg-white/20"
                  role="progressbar"
                  aria-valuenow={unidadActual.progreso}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progreso de la misión"
                >
                  <div
                    className="h-full rounded-full bg-[#FFC928]"
                    style={{ width: `${unidadActual.progreso}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{unidadActual.progreso}%</span>
              </div>
              <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#5636D9]">
                Continuar aprendiendo
                <ArrowRightIcon weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </div>
          </Link>

          <div className="grid gap-4">
            <Link
              href="/estudiante/cuerpo"
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E0FF] bg-white"
            >
              <Image
                src="/assets/landing/corazon-3d.webp"
                alt=""
                width={1208}
                height={920}
                sizes="(min-width: 1024px) 380px, 100vw"
                className="h-36 w-full flex-1 object-cover"
              />
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <h2 className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
                    El cuerpo humano
                  </h2>
                  <p className="text-sm text-[#5B5678]">Explora órganos y sistemas en 3D</p>
                </div>
                <ArrowRightIcon weight="bold" className="h-5 w-5 shrink-0 text-[#5636D9] transition-transform group-hover:translate-x-0.5" aria-hidden />
              </div>
            </Link>

            <section className="rounded-2xl border border-[#E8E0FF] bg-white p-4" aria-labelledby="mis-insignias">
              <div className="mb-3 flex items-baseline justify-between">
                <h2 id="mis-insignias" className="font-bold text-[#17164F]">
                  Mis insignias
                </h2>
                <Link href="/estudiante/logros" className="text-sm font-semibold text-[#5636D9] hover:underline">
                  Ver todas
                </Link>
              </div>
              <ul className="flex gap-3">
                {insignias.map((b) => (
                  <li key={b.id}>
                    <Image
                      src={b.img}
                      alt={b.obtenida ? b.nombre : `${b.nombre}, por desbloquear`}
                      title={b.nombre}
                      width={48}
                      height={48}
                      className={`h-11 w-11 object-contain ${b.obtenida ? "" : "opacity-35 grayscale"}`}
                    />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <nav aria-label="Accesos rápidos" className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {shortcuts.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="flex items-center gap-3 rounded-2xl border border-[#E8E0FF] bg-white p-3.5 font-bold text-[#17164F] transition-colors hover:border-[#5636D9]"
            >
              <Image src={s.img} alt="" width={48} height={48} className="h-10 w-10 shrink-0 object-contain" />
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </EstudianteLayout>
  );
}
