import Image from "next/image";
import Header from "@/components/landing/Header";
import { AgeStageSelector } from "@/components/landing/AgeStageSelector";
import { InteractiveReto } from "@/components/landing/InteractiveReto";
import { MesaAprobacion } from "@/components/landing/figura/MesaAprobacion";
import { CheckCircleIcon } from "@/components/ui/icons";

const areas = [
  {
    title: "Matemática",
    text: "Figuras, volumen y fracciones en una isla por descubrir.",
    image: "/assets/matematica.png",
    w: 603,
    h: 281,
  },
  {
    title: "Comunicación",
    text: "Lectura, sinónimos y relatos con voz que acompaña.",
    image: "/assets/comunicacion.png",
    w: 619,
    h: 293,
  },
  {
    title: "Ciencia y Tecnología",
    text: "El cuerpo humano y el sistema solar en 3D.",
    image: "/assets/cienciatecnologia.png",
    w: 473,
    h: 303,
  },
  {
    title: "Ciencias Sociales",
    text: "El planeta, los mapas, la cultura y la ciudadanía.",
    image: "/assets/cienciasociales.png",
    w: 592,
    h: 322,
  },
];

const titulo = "font-[family-name:var(--font-fredoka)] font-semibold text-[#17164F]";
const tituloSeccion = `${titulo} text-[1.85rem] leading-tight sm:text-[2.4rem]`;

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-white text-[#17164F]">
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

          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((area) => (
              <article key={area.title}>
                <div className="flex h-32 items-end">
                  <Image
                    src={area.image}
                    alt=""
                    width={area.w}
                    height={area.h}
                    sizes="240px"
                    className="max-h-32 w-auto max-w-full object-contain object-left-bottom"
                  />
                </div>
                <h3 className={`${titulo} mt-4 text-xl`}>{area.title}</h3>
                <p className="mt-1 text-[#5B5678]">{area.text}</p>
              </article>
            ))}
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

      <footer className="border-t border-[#E8E0FF] bg-white py-6">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 text-sm text-[#5B5678] sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 font-[family-name:var(--font-fredoka)] text-base font-semibold text-[#17164F]">
            <Image src="/assets/logo.svg" alt="" width={26} height={26} />
            EduNova
          </span>
          <span>Hack4Edu 2026</span>
        </div>
      </footer>
    </div>
  );
}
