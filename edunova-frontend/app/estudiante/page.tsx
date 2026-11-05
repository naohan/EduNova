import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { NombreAlumno } from "@/components/estudiante/NombreAlumno";
import { ResumenPuntos } from "@/components/estudiante/ResumenPuntos";
import { unidadActual, insignias } from "@/components/estudiante/data";
import { ArrowRightIcon, BookOpenIcon, CubeIcon, TrophyIcon } from "@/components/ui/icons";

const shortcuts = [
  {
    href: "/estudiante/ruta",
    label: "Aprender",
    seccion: "Explorar",
    tactilClass: "tactil-explorar-suave",
    img: "/assets/juego ludico/icon_libro_abierto.png",
  },
  {
    href: "/estudiante/juegos",
    label: "Juegos",
    seccion: "Juego",
    tactilClass: "tactil-juego-suave",
    img: "/assets/juego ludico/icon_dado.png",
  },
  {
    href: "/estudiante/misiones",
    label: "Retos",
    seccion: "Cooperar",
    tactilClass: "tactil-cooperar-suave",
    img: "/assets/juego ludico/icon_trofeo.png",
  },
  {
    href: "/estudiante/evaluaciones/foto",
    label: "Cuaderno",
    seccion: "Magia",
    tactilClass: "tactil-magia-suave",
    img: "/assets/juego ludico/robot_mascota.png",
  },
  {
    href: "/estudiante/flashcards",
    label: "Repasar",
    seccion: "Refuerzo",
    tactilClass: "tactil-refuerzo-suave",
    img: "/assets/juego ludico/icon_pregunta.png",
  },
];

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Cabecera del estudiante */}
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F] sm:text-4xl">
              ¡Hola, <NombreAlumno />!
            </h1>
            <p className="mt-1 text-sm font-semibold text-[#5B5678]">
              Elige tu aventura de hoy.
            </p>
          </div>
          <ResumenPuntos />
        </header>

        {/* Zona principal: Misión activa (Explorar) y actividades complementarias */}
        <div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
          {/* Tarjeta táctil principal: Explorar el Sistema Solar */}
          <article className="card-tactil tactil-explorar-suave flex-col overflow-hidden border border-[#2472CC]/30 p-0">
            <div className="relative h-48 w-full overflow-hidden bg-[#17164F] sm:h-56">
              <Image
                src="/assets/landing/sistema-solar.webp"
                alt="Ilustración del Sistema Solar con órbitas y planetas"
                fill
                priority
                sizes="(min-width: 1024px) 680px, 100vw"
                className="object-cover"
              />
              <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#4C9EFF] px-3 py-1 text-xs font-black text-[#17164F]">
                <BookOpenIcon weight="bold" className="h-3.5 w-3.5" aria-hidden />
                <span>Explorar</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#17164F]/70">
                  Misión activa
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F] sm:text-3xl">
                  {unidadActual.titulo}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[#17164F]/80">
                  {unidadActual.leccion}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#17164F]">
                    <span>Progreso</span>
                    <span>{unidadActual.progreso}%</span>
                  </div>
                  <div
                    className="h-3 w-full overflow-hidden rounded-full border border-[#2472CC]/30 bg-white"
                    role="progressbar"
                    aria-valuenow={unidadActual.progreso}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progreso de la misión del Sistema Solar"
                  >
                    <div
                      className="h-full rounded-full bg-[#4C9EFF]"
                      style={{ width: `${unidadActual.progreso}%` }}
                    />
                  </div>
                </div>

                <Link
                  href="/estudiante/ruta"
                  className="btn-tactil tactil-explorar w-full gap-2 px-5 py-3 text-base text-[#17164F]"
                  aria-label="Continuar la misión del Sistema Solar"
                >
                  <span>Continuar</span>
                  <ArrowRightIcon weight="bold" className="h-5 w-5" aria-hidden />
                </Link>
              </div>
            </div>
          </article>

          {/* Columna lateral: Lab 3D e Insignias */}
          <div className="grid gap-5">
            {/* Lab 3D del Cuerpo Humano (Explorar) */}
            <Link
              href="/estudiante/cuerpo"
              className="card-tactil tactil-explorar-suave flex-col overflow-hidden border border-[#2472CC]/25 p-0"
              aria-label="Explorar laboratorio 3D del cuerpo humano"
            >
              <div className="relative h-36 w-full overflow-hidden bg-[#17164F]">
                <Image
                  src="/assets/landing/corazon-3d.webp"
                  alt="Modelo tridimensional del corazón humano"
                  fill
                  sizes="(min-width: 1024px) 380px, 100vw"
                  className="object-cover"
                />
                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#4C9EFF] px-2.5 py-0.5 text-xs font-black text-[#17164F]">
                  <CubeIcon weight="bold" className="h-3.5 w-3.5" aria-hidden />
                  <span>Lab 3D</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <h2 className="font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">
                    El cuerpo humano
                  </h2>
                  <p className="text-xs font-semibold text-[#17164F]/70">
                    Órganos interactivos
                  </p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4C9EFF] text-[#17164F]">
                  <ArrowRightIcon weight="bold" className="h-4 w-4" aria-hidden />
                </div>
              </div>
            </Link>

            {/* Insignias logradas (Juego) */}
            <section
              className="rounded-2xl border border-[#C98F00]/25 border-b-4 border-b-[#C98F00] bg-[#FFF6D6] p-4"
              aria-labelledby="mis-insignias"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrophyIcon weight="bold" className="h-4 w-4 text-[#C98F00]" aria-hidden />
                  <h2 id="mis-insignias" className="font-extrabold text-[#17164F]">
                    Mis insignias
                  </h2>
                </div>
                <Link
                  href="/estudiante/logros"
                  className="btn-tactil tactil-juego h-8 min-h-[36px] rounded-lg px-3 text-xs font-black text-[#17164F]"
                  aria-label="Ver todas mis insignias"
                >
                  Ver todas
                </Link>
              </div>
              <ul className="flex flex-wrap gap-2.5">
                {insignias.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-center rounded-xl border border-[#C98F00]/20 bg-white p-1.5"
                  >
                    <Image
                      src={b.img}
                      alt={b.obtenida ? b.nombre : `${b.nombre}, por desbloquear`}
                      title={b.nombre}
                      width={40}
                      height={40}
                      className={`h-9 w-9 object-contain ${
                        b.obtenida ? "" : "opacity-30 grayscale"
                      }`}
                    />
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Barra táctil de 5 accesos rápidos por sección */}
        <nav
          aria-label="Accesos rápidos por sección"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        >
          {shortcuts.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className={`card-tactil ${s.tactilClass} min-h-[96px] flex-col items-center justify-center gap-2 p-3 text-center`}
              aria-label={`${s.seccion}: ${s.label}`}
            >
              <Image
                src={s.img}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
                aria-hidden
              />
              <span className="text-sm font-black text-[#17164F]">
                {s.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </EstudianteLayout>
  );
}
