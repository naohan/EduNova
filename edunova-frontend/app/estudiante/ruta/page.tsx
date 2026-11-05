import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { cursosAprender } from "@/components/estudiante/data";
import { NombreAlumno } from "@/components/estudiante/NombreAlumno";
import { UnidadesPublicadas } from "@/components/estudiante/UnidadesPublicadas";
import { ArrowRightIcon, BellIcon, BookOpenIcon } from "@/components/ui/icons";

export default function Page() {
  return (
    <EstudianteLayout
      mobileHeader={
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E8E0FF] bg-white/95 px-4 backdrop-blur lg:hidden">
          <Link href="/estudiante" className="flex items-center gap-2">
            <Image
              src="/assets/Logo.png"
              alt="EduNova"
              width={34}
              height={34}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">
              EduNova
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notificaciones"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#5636D9] hover:bg-[#F2EEFF]"
            >
              <BellIcon className="h-5 w-5" aria-hidden />
              <span
                aria-hidden
                className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#FF8A73] ring-2 ring-white"
              />
            </button>
            <Image
              src="/assets/usuario.png"
              alt="Tu perfil"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
            />
          </div>
        </header>
      }
    >
      <div className="relative mx-auto min-h-[calc(100vh-3.5rem)] max-w-3xl px-4 pb-8 pt-3 sm:px-6 lg:min-h-0 lg:p-8">
        {/* Cabecera temática de la ruta (Explorar) */}
        <section className="mb-6 flex items-end gap-3 sm:gap-4">
          <Image
            src="/assets/robot-saludando.png"
            alt="Mascota saludando"
            width={160}
            height={180}
            className="h-auto w-[112px] shrink-0 object-contain sm:w-[136px]"
            priority
          />
          <div className="mb-3 min-w-0 flex-1 sm:mb-6">
            <div className="rounded-2xl border border-[#2472CC]/20 border-b-2 border-b-[#2472CC] bg-[#E6F2FF] px-4 py-3 text-[#17164F]">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#2472CC]">
                <BookOpenIcon weight="bold" className="h-3.5 w-3.5" aria-hidden />
                <span>Explorar</span>
              </div>
              <p className="mt-0.5 font-[family-name:var(--font-fredoka)] text-lg font-bold sm:text-xl">
                ¡Hola, <NombreAlumno />!
              </p>
              <p className="mt-0.5 text-xs font-medium text-[#17164F]/80 sm:text-sm">
                Elige tu curso para comenzar la aventura.
              </p>
            </div>
          </div>
        </section>

        {/* Misiones publicadas por el docente */}
        <UnidadesPublicadas />

        {/* Cuadrícula táctil de cursos por sección Explorar */}
        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:gap-4">
          {cursosAprender.map((curso) => (
            <Link
              key={curso.id}
              href={curso.href}
              className="card-tactil tactil-explorar-suave flex-col justify-between border border-[#2472CC]/25 p-3.5 sm:p-4"
              aria-label={`Abrir curso de ${curso.nombre}`}
            >
              <div>
                <div className="relative mx-auto mb-2.5 h-[84px] w-full sm:h-[104px]">
                  <Image
                    src={curso.imagen}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 42vw, 200px"
                    aria-hidden
                  />
                </div>
                <h2 className="font-[family-name:var(--font-fredoka)] text-base font-bold text-[#17164F] sm:text-lg">
                  {curso.nombre}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs font-medium text-[#17164F]/75">
                  {curso.desc}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#2472CC]/15 pt-2.5">
                <span className="text-[11px] font-black uppercase text-[#2472CC]">
                  Entrar
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4C9EFF] text-[#17164F]">
                  <ArrowRightIcon weight="bold" className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Acción táctil principal para la aventura destacada */}
        <Link
          href="/estudiante/matematica/mapa"
          className="btn-tactil tactil-explorar mt-6 w-full justify-between gap-3 px-5 py-3.5 text-[#17164F]"
          aria-label="Comenzar aventura en la isla matemática"
        >
          <span className="flex items-center gap-3">
            <Image
              src="/assets/cohete.png"
              alt=""
              width={40}
              height={40}
              className="h-8 w-8 shrink-0 object-contain"
              aria-hidden
            />
            <span className="font-[family-name:var(--font-fredoka)] text-base font-bold">
              Comenzar aventura
            </span>
          </span>
          <ArrowRightIcon weight="bold" className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </EstudianteLayout>
  );
}
