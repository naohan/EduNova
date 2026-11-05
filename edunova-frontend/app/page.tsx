import Image from "next/image";
import Header from "@/components/landing/Header";
import { CheckCircleIcon } from "@/components/ui/icons";

const avatares = [
  { src: "/assets/juego ludico/avatar_estudiante.png", w: 240, h: 225 },
  { src: "/assets/juego ludico/avatar_nino.png", w: 220, h: 225 },
  { src: "/assets/juego ludico/avatar_auriculares.png", w: 179, h: 218 },
  { src: "/assets/juego ludico/avatar_reina.png", w: 188, h: 218 },
];

// Cada etapa es un peldaño: la altura y el tono suben con la edad.
const stages = [
  {
    age: "7 a 9 años",
    title: "Exploradores",
    text: "Descubre, observa y aprende con historias y juegos simples.",
    image: "/assets/landing/explorador.webp",
    alt: "Niño explorador con lupa",
    step: "bg-[#F2EEFF] text-[#17164F] lg:min-h-[280px]",
    muted: "text-[#5B5678]",
  },
  {
    age: "10 a 12 años",
    title: "Aventureros",
    text: "Resuelve retos, experimenta y explica tus ideas.",
    image: "/assets/landing/aventurera.webp",
    alt: "Niña aventurera con mochila",
    step: "bg-[#DDD4FF] text-[#17164F] lg:min-h-[340px]",
    muted: "text-[#3F3A63]",
  },
  {
    age: "13 a 15 años",
    title: "Creadores",
    text: "Analiza, simula, propone soluciones y desarrolla proyectos.",
    image: "/assets/landing/creador.webp",
    alt: "Adolescente creador con laptop",
    step: "bg-[#5636D9] text-white lg:min-h-[400px]",
    muted: "text-white/85",
  },
];

const areas = [
  {
    title: "Matemática",
    text: "Geometría y fracciones en una isla por descubrir.",
    image: "/assets/matematica.png",
    w: 603,
    h: 281,
  },
  {
    title: "Comunicación",
    text: "Lectura, vocabulario e historias colaborativas.",
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
    text: "Geografía, historia y ciudadanía.",
    image: "/assets/cienciasociales.png",
    w: 592,
    h: 322,
  },
];

const titulo = "font-[family-name:var(--font-fredoka)] font-semibold text-[#17164F]";

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-white text-[#17164F]">
      <Header />

      <section id="inicio" className="scroll-mt-[72px] bg-[#F2EEFF]">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-8 lg:py-20">
          <div className="entrada">
            <h1 className={`${titulo} text-[2.5rem] leading-[1.08] tracking-tight sm:text-[3.25rem] lg:text-[3.75rem]`}>
              Aprender puede ser una aventura
            </h1>

            <p className="mt-5 max-w-[30rem] text-[1.05rem] leading-relaxed text-[#5B5678] sm:text-lg">
              Explora, juega y descubre a tu ritmo, con actividades para tu edad basadas en el
              Currículo Nacional.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-xl bg-[#5636D9] px-6 py-3.5 font-bold text-white transition-colors hover:bg-[#4528b8]"
              >
                Iniciar sesión
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-xl px-4 py-3.5 font-bold text-[#5636D9] transition-colors hover:bg-white"
              >
                Ver cómo funciona
              </a>
            </div>
          </div>

          <div className="entrada relative [animation-delay:120ms]">
            <Image
              src="/assets/landing/corazon-3d.webp"
              alt="Laboratorio del cuerpo de EduNova: un corazón en 3D sobre una plataforma, con el robot Woebling explicando cómo funciona"
              width={1208}
              height={920}
              priority
              sizes="(min-width: 1024px) 580px, 100vw"
              className="h-auto w-full rounded-2xl"
            />
          </div>
        </div>
      </section>

      <section id="que-es" className="scroll-mt-[72px] py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <h2 className={`${titulo} mb-8 text-[1.75rem] sm:mb-10 sm:text-[2.25rem]`}>
            ¿Qué puedes hacer en EduNova?
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
            <article className="overflow-hidden rounded-2xl bg-[#17164F] text-white lg:col-span-4">
              <Image
                src="/assets/landing/sistema-solar.webp"
                alt="Explorador 3D del sistema solar con el Sol, los planetas y sus órbitas"
                width={1400}
                height={884}
                sizes="(min-width: 1024px) 760px, 100vw"
                className="h-56 w-full object-cover sm:h-72"
              />
              <div className="p-6">
                <h3 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold">Aprender</h3>
                <p className="mt-1 text-white/85">Explicaciones claras, cuentos, videos y audios.</p>
              </div>
            </article>

            <article className="flex flex-col overflow-hidden rounded-2xl bg-[#E8F3FF] lg:col-span-2">
              <div className="p-6">
                <h3 className={`${titulo} text-2xl`}>Jugar</h3>
                <p className="mt-1 text-[#5B5678]">Retos, juegos y cuestionarios interactivos.</p>
              </div>
              <Image
                src="/assets/landing/isla-matematica.webp"
                alt="Mapa 3D de la isla de Matemática con sus estaciones"
                width={1200}
                height={792}
                sizes="(min-width: 1024px) 370px, 100vw"
                className="mt-auto h-56 w-full object-cover sm:h-64"
              />
            </article>

            <article className="flex items-center justify-between gap-4 rounded-2xl bg-[#FFF3CC] p-6 lg:col-span-2">
              <div>
                <h3 className={`${titulo} text-2xl`}>Avanzar</h3>
                <p className="mt-1 text-[#5B5678]">Sigue tu progreso y tus logros por competencias.</p>
              </div>
              <Image
                src="/assets/juego ludico/icon_trofeo.png"
                alt=""
                width={230}
                height={161}
                className="h-auto w-24 shrink-0"
              />
            </article>

            <article className="flex flex-col justify-between gap-5 rounded-2xl bg-[#5636D9] p-6 text-white sm:flex-row sm:items-center lg:col-span-4">
              <div>
                <h3 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold">
                  Aprender juntos
                </h3>
                <p className="mt-1 text-white/85">Actividades colaborativas con tus docentes y compañeros.</p>
              </div>
              <div className="flex shrink-0 -space-x-3">
                {avatares.map((a) => (
                  <span
                    key={a.src}
                    className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-[#5636D9]"
                  >
                    <Image src={a.src} alt="" width={a.w} height={a.h} className="h-14 w-auto" />
                  </span>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-[72px] pb-14 sm:pb-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <h2 className={`${titulo} mb-8 text-[1.75rem] sm:mb-10 sm:text-[2.25rem]`}>
            Una experiencia para cada etapa
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-end">
            {stages.map((stage) => (
              <article key={stage.title} className={`flex flex-col justify-between gap-4 rounded-2xl p-6 ${stage.step}`}>
                <Image
                  src={stage.image}
                  alt={stage.alt}
                  width={240}
                  height={240}
                  className="h-24 w-24 rounded-xl object-cover"
                />
                <div>
                  <p className={`text-sm font-bold ${stage.muted}`}>{stage.age}</p>
                  <h3 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold">
                    {stage.title}
                  </h3>
                  <p className={`mt-1 ${stage.muted}`}>{stage.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="areas" className="scroll-mt-[72px] bg-[#F7F4FF] py-14 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <h2 className={`${titulo} text-[1.75rem] sm:text-[2.25rem]`}>Áreas de aprendizaje</h2>
          <p className="mt-2 inline-flex items-center gap-2 font-semibold text-[#5B5678]">
            <CheckCircleIcon weight="fill" className="h-5 w-5 shrink-0 text-[#5636D9]" aria-hidden />
            Alineado al Currículo Nacional del MINEDU
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

      <footer className="border-t border-[#E8E0FF] bg-white py-6">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-4 text-sm text-[#5B5678] sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 font-semibold text-[#17164F]">
            <Image src="/assets/logo.svg" alt="" width={24} height={24} />
            EduNova
          </span>
          <span>Hack4Edu 2026</span>
        </div>
      </footer>
    </div>
  );
}
