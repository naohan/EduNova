import Image from "next/image";
import Header from "@/components/landing/Header";

const features = [
  {
    title: "Aprender",
    text: "Explicaciones claras, cuentos, videos y audios.",
    bg: "bg-[#EAF6FF]",
    color: "#4C9EFF",
    icon: (
      <svg viewBox="0 0 28 28" className="h-7 w-7" fill="none" aria-hidden>
        <path
          d="M5 7.5C5 6.67 5.67 6 6.5 6H13v15H6.5A1.5 1.5 0 0 1 5 19.5v-12Z"
          stroke="#4C9EFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M23 7.5c0-.83-.67-1.5-1.5-1.5H15v15h6.5a1.5 1.5 0 0 0 1.5-1.5v-12Z"
          stroke="#4C9EFF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Jugar",
    text: "Retos, juegos y cuestionarios interactivos.",
    bg: "bg-[#F2EEFF]",
    color: "#5636D9",
    icon: (
      <svg viewBox="0 0 28 28" className="h-7 w-7" fill="none" aria-hidden>
        <rect x="3.5" y="9" width="21" height="12" rx="3.5" stroke="#5636D9" strokeWidth="2" />
        <path d="M9 13v6M6 16h6" stroke="#5636D9" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18.5" cy="13.5" r="1.2" fill="#5636D9" />
        <circle cx="21" cy="16.5" r="1.2" fill="#5636D9" />
      </svg>
    ),
  },
  {
    title: "Avanzar",
    text: "Seguimiento de tu progreso y logros por competencias.",
    bg: "bg-[#E9F9F0]",
    color: "#2DBE70",
    icon: (
      <svg viewBox="0 0 28 28" className="h-7 w-7" fill="none" aria-hidden>
        <path d="M5 20V16M11 20V11M17 20V8M23 20V13" stroke="#2DBE70" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M4 7l6 5 5-7 7 6" stroke="#2DBE70" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Aprender juntos",
    text: "Actividades colaborativas con tus docentes y compañeros.",
    bg: "bg-[#FFF6E8]",
    color: "#F0A020",
    icon: (
      <svg viewBox="0 0 28 28" className="h-7 w-7" fill="none" aria-hidden>
        <circle cx="10" cy="10" r="3.2" stroke="#F0A020" strokeWidth="2" />
        <circle cx="18.5" cy="10" r="3.2" stroke="#F0A020" strokeWidth="2" />
        <path
          d="M4.5 21c0-2.6 2.5-4.7 5.5-4.7s5.5 2.1 5.5 4.7"
          stroke="#F0A020"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M13 21c0-2.6 2.5-4.7 5.5-4.7S24 18.4 24 21"
          stroke="#F0A020"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const stages = [
  {
    age: "7 – 9 años",
    title: "Exploradores",
    text: "Descubre, observa y aprende con historias y juegos simples.",
    bg: "bg-[#EAF7FF]",
    badge: "bg-[#4C9EFF] text-white",
    image: "/assets/explorador.png",
    alt: "Niño explorador con lupa",
  },
  {
    age: "10 – 12 años",
    title: "Aventureros",
    text: "Resuelve retos, experimenta y explica tus ideas.",
    bg: "bg-[#E8F9EF]",
    badge: "bg-[#2DBE70] text-white",
    image: "/assets/aventurero.png",
    alt: "Niña aventurera con mochila",
  },
  {
    age: "13 – 15 años",
    title: "Creadores",
    text: "Analiza, simula, propone soluciones y desarrolla proyectos.",
    bg: "bg-[#F2EEFF]",
    badge: "bg-[#5636D9] text-white",
    image: "/assets/creador.png",
    alt: "Adolescente creador con laptop",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#17164F]">
      <Header />

      {/* HERO */}
      <section
        id="inicio"
        className="relative overflow-hidden bg-[linear-gradient(180deg,#F7F4FF_0%,#EEF3FF_45%,#F8F7FC_100%)]"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-8 h-40 w-56 rounded-full bg-white/60 blur-2xl" />
          <div className="absolute right-10 top-4 h-32 w-48 rounded-full bg-white/50 blur-2xl" />
          <div className="absolute bottom-0 left-1/3 h-28 w-64 rounded-full bg-[#F2EEFF]/80 blur-2xl" />
        </div>

        <div className="relative mx-auto grid max-w-[1180px] items-center gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:px-8 lg:py-10">
          {/* Texto primero (mobile-first = mockup) */}
          <div className="order-1 text-left">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#E8F3FF] px-3.5 py-1.5 text-[0.8rem] font-bold text-[#17164F]">
              <span aria-hidden>✨</span>
              Plataforma educativa interactiva
            </div>

            <h1 className="font-[family-name:var(--font-fredoka)] text-[2.35rem] leading-[1.08] font-semibold tracking-tight text-[#17164F] sm:text-[3.1rem] lg:text-[3.45rem]">
              Aprender puede ser
              <br />
              una{" "}
              <span className="relative inline-block text-[#17164F]">
                aventura
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 180 12"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 8c28-6 55-8 88-4 28 3 55 5 88 1"
                    stroke="#FFC928"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-5 max-w-[34rem] text-[0.98rem] leading-relaxed text-[#17164F]/70 sm:text-[1.05rem]">
              Explora, juega y descubre a tu ritmo con actividades educativas
              adaptadas a tu nivel, basadas en el Currículo Nacional del MINEDU.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="/estudiante"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#5636D9] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(86,54,217,0.28)] transition-transform hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 12a4 4 0 0 0-4 4v1h12v-1a4 4 0 0 0-4-4H6Z" />
                  <path d="M15.5 6.5V5h-1v1.5H13v1h1.5V9h1V7.5H17v-1h-1.5Z" />
                </svg>
                Crear cuenta gratis
              </a>
              <a
                href="/estudiante"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-[1.5px] border-[#17164F]/25 bg-white px-6 py-3.5 text-sm font-bold text-[#17164F] transition-colors hover:border-[#5636D9] hover:text-[#5636D9]"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                  <rect x="3" y="3.5" width="8" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M11 10h6m0 0-2.2-2.2M17 10l-2.2 2.2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Iniciar sesión
              </a>
            </div>
          </div>

          {/* Ilustración del mockup */}
          <div className="order-2 relative mx-auto w-full max-w-[560px] lg:max-w-none">
            <Image
              src="/assets/hero-illustration.png"
              alt="Woebling con libro y laptop EduNova"
              width={1485}
              height={645}
              priority
              className="h-auto w-full drop-shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* ¿Qué puedes hacer? */}
      <section id="que-es" className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <h2 className="relative mx-auto mb-8 max-w-fit text-center font-[family-name:var(--font-fredoka)] text-[1.55rem] font-semibold text-[#17164F] sm:mb-10 sm:text-[1.85rem]">
            <span className="absolute -top-3 left-0 text-[#FFC928] sm:-left-5">✦</span>
            <span className="absolute -top-2 right-0 text-[#FFC928] sm:-right-5">✦</span>
            ¿Qué puedes hacer en EduNova?
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            {features.map((item) => (
              <article
                key={item.title}
                className={`flex items-start gap-3.5 rounded-[22px] ${item.bg} px-4 py-4 sm:px-5 sm:py-5`}
              >
                <div className="mt-0.5 shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-[family-name:var(--font-fredoka)] text-[1.05rem] font-semibold text-[#17164F]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[0.86rem] leading-snug text-[#17164F]/65">
                    {item.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Etapas */}
      <section id="como-funciona" className="bg-white pb-12 pt-2 sm:pb-16">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-[family-name:var(--font-fredoka)] text-[1.55rem] font-semibold text-[#17164F] sm:mb-10 sm:text-[1.85rem]">
            Una experiencia para cada etapa
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
            {stages.map((stage) => (
              <article
                key={stage.title}
                className={`relative overflow-hidden rounded-[24px] ${stage.bg} p-4 sm:p-5`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative h-[108px] w-[108px] shrink-0 sm:h-[120px] sm:w-[120px]">
                    <Image
                      src={stage.image}
                      alt={stage.alt}
                      fill
                      className="object-contain object-left-bottom"
                      sizes="120px"
                    />
                  </div>
                  <div className="min-w-0 flex-1 pr-1">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[0.72rem] font-bold ${stage.badge}`}
                    >
                      {stage.age}
                    </span>
                    <h3 className="mt-2 font-[family-name:var(--font-fredoka)] text-[1.35rem] font-semibold text-[#17164F]">
                      {stage.title}
                    </h3>
                    <p className="mt-1 text-[0.84rem] leading-snug text-[#17164F]/70">
                      {stage.text}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Áreas / pie como en el mockup extendido */}
      <footer id="areas" className="border-t border-[#F2EEFF] bg-white py-5">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-center gap-x-5 gap-y-3 px-4 text-[0.82rem] text-[#17164F]/65 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 font-medium text-[#17164F]">
            <span className="text-[#5636D9]">✓</span>
            Alineado al Currículo Nacional del MINEDU
          </span>
          <span className="hidden text-[#F2EEFF] sm:inline">|</span>
          <span>📘 Personal Social</span>
          <span>🧪 Ciencia y Tecnología</span>
          <span>🔢 Matemática</span>
          <a href="/estudiante" className="font-bold text-[#5636D9] hover:underline">
            Demo estudiante →
          </a>
          <a href="/docente" className="font-bold text-[#17164F] hover:underline">
            Demo docente →
          </a>
        </div>
      </footer>
    </div>
  );
}
