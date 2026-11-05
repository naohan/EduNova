import Image from "next/image";
import Header from "@/components/landing/Header";
import { AgeStageSelector } from "@/components/landing/AgeStageSelector";
import { InteractiveReto } from "@/components/landing/InteractiveReto";
import { RealmsGrid } from "@/components/landing/RealmsGrid";
import { ScrollQuestPath } from "@/components/landing/ScrollQuestPath";
import { MesaAprobacion } from "@/components/landing/figura/MesaAprobacion";
import { CheckCircleIcon, GameControllerIcon, ShieldCheckIcon, UsersIcon } from "@/components/ui/icons";

const avatares = [
  { src: "/assets/juego ludico/avatar_estudiante.png", w: 240, h: 225 },
  { src: "/assets/juego ludico/avatar_nino.png", w: 220, h: 225 },
  { src: "/assets/juego ludico/avatar_auriculares.png", w: 179, h: 218 },
  { src: "/assets/juego ludico/avatar_reina.png", w: 188, h: 218 },
];

const titulo = "font-[family-name:var(--font-fredoka)] font-semibold text-[#17164F]";
const tituloSeccion = `${titulo} text-[1.85rem] leading-tight sm:text-[2.4rem]`;

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-white text-[#17164F]">
      <ScrollQuestPath />
      <Header />

      <section id="inicio" className="scroll-mt-[72px] bg-[#F2EEFF]">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-8 lg:py-16">
          <div className="entrada">
            <h1 className={`${titulo} text-[2.5rem] leading-[1.08] tracking-tight sm:text-[3.25rem] lg:text-[3.75rem]`}>
              Aprender puede ser una aventura
            </h1>
            <p className="mt-5 max-w-[30rem] text-[1.05rem] leading-relaxed text-[#5B5678] sm:text-lg">
              Islas, laboratorios 3D y retos para niños de 7 a 15 años, basados en el Currículo
              Nacional.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/login"
                className="btn-tactil inline-flex items-center justify-center rounded-xl bg-[#5636D9] px-6 py-3.5 font-bold text-white"
                style={{ "--tactil-borde": "#3B229D" } as React.CSSProperties}
              >
                Iniciar sesión
              </a>
              <a
                href="#reto"
                className="inline-flex items-center justify-center rounded-xl px-4 py-3.5 font-bold text-[#5636D9] transition-colors hover:bg-white"
              >
                Probar un reto
              </a>
            </div>
          </div>

          <div className="entrada [animation-delay:120ms]">
            <Image
              src="/assets/landing/ciudadela-hero-3d.jpg"
              alt="Isla flotante con un castillo, un observatorio y un jardín: el mundo de EduNova"
              width={1024}
              height={1024}
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="aspect-[5/4] w-full rounded-2xl object-cover"
            />
          </div>
        </div>
      </section>

      <section id="isometria" className="scroll-mt-[72px] py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <h2 className={tituloSeccion}>La IA propone. El docente decide.</h2>
          <p className="mt-3 max-w-[40rem] text-lg leading-relaxed text-[#5B5678]">
            El docente sube su material y la IA arma la unidad con su rúbrica. Nada llega a los
            estudiantes sin su aprobación.
          </p>
          <div className="mt-8 rounded-2xl border border-[#E8E0FF] bg-white p-4 sm:p-6">
            <MesaAprobacion />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#F7F4FF] p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5636D9] text-white">
                <GameControllerIcon className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h3 className="font-bold text-[#17164F]">Funciona en celulares, tablets y laptops</h3>
                <p className="text-sm text-[#5B5678]">Se instala como app y una lección queda lista sin internet.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#17164F]">
              <span className="rounded-lg bg-white px-3 py-1">App instalable</span>
              <span className="rounded-lg bg-white px-3 py-1">Modo offline</span>
            </div>
          </div>
        </div>
      </section>

      <section id="edades" className="scroll-mt-[72px] bg-[#F7F4FF] py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <h2 className={tituloSeccion}>Una experiencia para cada edad</h2>
          <div className="mt-8">
            <AgeStageSelector />
          </div>
        </div>
      </section>

      <section id="areas" className="scroll-mt-[72px] py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <h2 className={tituloSeccion}>Áreas de aprendizaje</h2>
          <p className="mt-3 inline-flex items-center gap-2 font-semibold text-[#5B5678]">
            <CheckCircleIcon weight="fill" className="h-5 w-5 shrink-0 text-[#5636D9]" aria-hidden />
            Basadas en el Currículo Nacional del MINEDU
          </p>
          <div className="mt-10">
            <RealmsGrid />
          </div>
        </div>
      </section>

      <section className="bg-[#17164F] py-14 text-white sm:py-20">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="flex justify-center lg:col-span-5">
            <Image
              src="/assets/landing/woebling-3d.jpg"
              alt="Woebling, el robot de EduNova"
              width={420}
              height={420}
              sizes="320px"
              className="h-auto w-64 rounded-2xl object-cover sm:w-80"
            />
          </div>

          <div className="lg:col-span-7">
            <h2 className="font-[family-name:var(--font-fredoka)] text-[1.85rem] font-semibold leading-tight sm:text-[2.4rem]">
              Conoce a <span className="text-[#FFC928]">Woebling</span>, tu compañero de ruta
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/85">
              Si te equivocas, Woebling no te da la respuesta: te deja una pista para que la descubras
              y celebra contigo cuando lo logras.
            </p>

            <div className="mt-6 rounded-2xl bg-white/10 p-4">
              <p className="text-sm font-bold text-[#FFC928]">Por ejemplo, en un reto de fracciones:</p>
              <p className="mt-1 text-white/90">
                &ldquo;¡Casi! Imagina una pizza cortada en 8 partes. Si tu amigo toma 3, ¿cuántas quedan?&rdquo;
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3">
                {avatares.map((a) => (
                  <span
                    key={a.src}
                    className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white"
                  >
                    <Image src={a.src} alt="" width={a.w} height={a.h} className="h-10 w-auto" />
                  </span>
                ))}
              </div>
              <p className="font-bold">Juega en equipo con tu aula</p>
            </div>
          </div>
        </div>
      </section>

      <section id="reto" className="scroll-mt-[72px] bg-[#F2EEFF] py-14 sm:py-20">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <h2 className={tituloSeccion}>Prueba un reto</h2>
            <p className="mt-3 max-w-[26rem] text-lg leading-relaxed text-[#5B5678]">
              Elige tu edad y responde. Woebling te acompaña en cada misión.
            </p>
            <Image
              src="/assets/robot-saludando.png"
              alt="Woebling, el robot de EduNova, saludando"
              width={490}
              height={415}
              sizes="240px"
              className="mt-6 hidden h-auto w-56 lg:block"
            />
          </div>
          <InteractiveReto />
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#5636D9] p-8 text-center text-white sm:p-14">
            <h2 className="mx-auto max-w-2xl font-[family-name:var(--font-fredoka)] text-[1.85rem] font-semibold leading-tight sm:text-[2.4rem]">
              ¿Listo para convertir el estudio en tu juego favorito?
            </h2>
            <p className="mt-3 text-lg text-white/85">Entra con tu alias y el código de tu aula.</p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
              <a
                href="/login"
                className="btn-tactil inline-flex items-center justify-center rounded-xl bg-[#FFC928] px-7 py-3.5 font-bold text-[#17164F]"
                style={{ "--tactil-borde": "#C98F00" } as React.CSSProperties}
              >
                Iniciar sesión
              </a>
              <a
                href="/docente"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold text-white transition-colors hover:bg-white/15"
              >
                <UsersIcon weight="bold" className="h-5 w-5" aria-hidden />
                Acceso para docentes
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/85">
              {["Solo alias, sin apellidos", "Sin publicidad", "Una lección lista sin internet"].map((punto) => (
                <span key={punto} className="flex items-center gap-1.5">
                  <CheckCircleIcon weight="fill" className="h-4 w-4 text-[#FFC928]" aria-hidden />
                  {punto}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E8E0FF] bg-white py-12 text-[#5B5678]">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <span className="inline-flex items-center gap-2.5 font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
                <Image src="/assets/logo.svg" alt="" width={32} height={32} />
                EduNova
              </span>
              <p className="mt-3 max-w-sm text-sm">
                Plataforma de aprendizaje con juegos, basada en el Currículo Nacional del Perú. Proyecto
                para Hack4Edu 2026.
              </p>
              <p className="mt-4 flex items-center gap-2 text-sm font-bold text-[#17164F]">
                <ShieldCheckIcon weight="fill" className="h-4 w-4 text-[#5636D9]" aria-hidden />
                Solo alias: nunca apellidos ni teléfonos
              </p>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-fredoka)] font-semibold text-[#17164F]">Explorar</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#isometria" className="hover:text-[#5636D9]">Cómo funciona</a></li>
                <li><a href="#edades" className="hover:text-[#5636D9]">Para tu edad</a></li>
                <li><a href="#areas" className="hover:text-[#5636D9]">Áreas</a></li>
                <li><a href="#reto" className="hover:text-[#5636D9]">Mini reto</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-[family-name:var(--font-fredoka)] font-semibold text-[#17164F]">Plataforma</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="/login" className="hover:text-[#5636D9]">Iniciar sesión</a></li>
                <li><a href="/docente" className="hover:text-[#5636D9]">Panel del docente</a></li>
                <li><a href="/familia" className="hover:text-[#5636D9]">Portal de familias</a></li>
              </ul>
            </div>
          </div>

          <p className="mt-10 border-t border-[#E8E0FF] pt-6 text-sm">© 2026 EduNova, Hack4Edu.</p>
        </div>
      </footer>
    </div>
  );
}
