import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { cursosAprender, estudiante } from "@/components/estudiante/data";
import { NombreAlumno } from "@/components/estudiante/NombreAlumno";

export default function Page() {
  return (
    <EstudianteLayout
      mobileHeader={
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-transparent px-4 lg:hidden">
          <Link href="/estudiante" className="flex items-center gap-2">
            <Image
              src="/assets/Logo.png"
              alt="EduNova"
              width={34}
              height={34}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="font-[family-name:var(--font-fredoka)] text-lg font-semibold text-[#17164F]">
              EduNova
            </span>
          </Link>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="Notificaciones"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#5636D9] shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
                <path d="M10 19a2 2 0 0 0 4 0" />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
            </button>
            <Image
              src="/assets/usuario.png"
              alt="usuario"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow"
            />
          </div>
        </header>
      }
    >
      <div className="relative mx-auto min-h-[calc(100vh-3.5rem)] max-w-3xl overflow-hidden px-4 pb-8 pt-2 sm:px-6 lg:min-h-0 lg:p-8">
        {/* Atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[#F7F4FF] lg:rounded-2xl"
        />

        {/* Hero */}
        <section className="mb-5 flex items-end gap-2 sm:mb-6 sm:gap-4">
          <Image
            src="/assets/robot-saludando.png"
            alt=""
            width={160}
            height={180}
            className="h-auto w-[118px] shrink-0 sm:w-[140px]"
            priority
          />
          <div className="mb-6 min-w-0 flex-1 sm:mb-10">
            <div className="relative rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-md">
              <p className="font-[family-name:var(--font-fredoka)] text-base font-semibold leading-snug text-[#17164F] sm:text-lg">
                ¡Hola, <NombreAlumno />! Explora tus cursos
              </p>
              <span
                aria-hidden
                className="absolute -left-2 bottom-3 h-0 w-0 border-y-[10px] border-r-[12px] border-y-transparent border-r-white"
              />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5B5678]">
              Aprende, juega, descubre y supera misiones increíbles.
            </p>
          </div>
        </section>

        {/* Course grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {cursosAprender.map((curso) => (
            <Link
              key={curso.id}
              href={curso.href}
              className={`group flex flex-col rounded-2xl ${curso.tint} border border-white/70 p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:p-4`}
            >
                  <div className="relative mx-auto mb-2 h-[88px] w-full sm:h-[110px]">
                <Image
                  src={curso.imagen}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 42vw, 200px"
                />
              </div>
              <h2 className="font-[family-name:var(--font-fredoka)] text-sm font-semibold text-[#17164F] sm:text-base">
                {curso.nombre}
              </h2>
              <p className="mt-1 flex-1 text-[11px] leading-snug text-[#5B5678] sm:text-xs">
                {curso.desc}
              </p>
              <span className="mt-3 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#5636D9] text-white shadow transition group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/estudiante/matematica/mapa"
          className="mt-6 flex w-full items-center justify-between gap-3 rounded-full bg-[#5636D9] px-4 py-3.5 text-white transition hover:bg-[#4a2dc0] sm:px-5"
        >
          <span className="flex min-w-0 items-center gap-3">
            <Image
              src="/assets/cohete.png"
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 object-contain"
            />
            <span className="font-[family-name:var(--font-fredoka)] text-sm font-semibold sm:text-base">
              Comenzar mi aventura
            </span>
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </Link>
      </div>
    </EstudianteLayout>
  );
}
