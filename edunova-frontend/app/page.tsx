import Image from "next/image";
import Header from "@/components/landing/Header";
import {
  IsoCitadelHero,
  IsoStemStation,
  IsoGamifiedChest,
} from "@/components/landing/IsometricSVGs";
import { AgeStageSelector } from "@/components/landing/AgeStageSelector";
import { ScrollQuestPath } from "@/components/landing/ScrollQuestPath";
import { InteractiveReto } from "@/components/landing/InteractiveReto";
import { RealmsGrid } from "@/components/landing/RealmsGrid";
import {
  RocketIcon,
  BrainIcon,
  SparkleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  GameControllerIcon,
  UsersIcon,
} from "@/components/ui/icons";

const avatares = [
  { src: "/assets/juego ludico/avatar_estudiante.png", w: 240, h: 225, name: "Lucas (10)" },
  { src: "/assets/juego ludico/avatar_nino.png", w: 220, h: 225, name: "Mateo (8)" },
  { src: "/assets/juego ludico/avatar_auriculares.png", w: 179, h: 218, name: "Sofía (14)" },
  { src: "/assets/juego ludico/avatar_reina.png", w: 188, h: 218, name: "Valeria (12)" },
];

const tituloFont = "font-[family-name:var(--font-fredoka)] font-bold text-[#17164F]";

export default function Home() {
  return (
    <div className="relative min-h-[100dvh] bg-[#FCFBFF] text-[#17164F] selection:bg-[#5636D9] selection:text-white">
      {/* Barra de progreso de la expedición y brújula flotante con scroll */}
      <ScrollQuestPath />

      {/* Cabecera Principal con Navegación y Switch de Sonido Retro */}
      <Header />

      {/* ======================================================================
          HERO SECTION: LA CIUDADELA ISOMÉTRICA FLOTANTE DEL CONOCIMIENTO
          ====================================================================== */}
      <section
        id="inicio"
        className="relative overflow-hidden border-b border-[#E8E0FF] bg-gradient-to-b from-[#F2EEFF] via-[#F8F5FF] to-white pt-8 pb-16 lg:pt-14 lg:pb-24"
      >
        {/* Gráficos de fondo decorativos cósmicos */}
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#5636D9]/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-[#25CFE0]/15 blur-3xl" />

        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
            {/* Texto y Acciones del Hero */}
            <div className="entrada flex flex-col items-start">
              {/* Badge Dinámico de Temporada */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#5636D9]/20 bg-white/90 px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#2DBE70]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#5636D9]">
                  TEMPORADA EDUCATIVA 2026 • HACK4EDU
                </span>
                <span className="text-[10px] text-[#5B5678]">|</span>
                <span className="text-xs font-bold text-[#FFC928]">★ NIVEL 1 ACTIVADO</span>
              </div>

              {/* Título Principal de Impacto */}
              <h1 className="mt-5 font-[family-name:var(--font-fredoka)] text-4xl font-extrabold leading-[1.08] tracking-tight text-[#17164F] sm:text-5xl lg:text-[3.85rem]">
                Donde aprender se convierte en una{" "}
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#5636D9] via-[#8544F7] to-[#25CFE0]">
                  aventura épica
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 9C75 3 225 3 298 9"
                      stroke="#FFC928"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              {/* Descripción Clara y Enérgica */}
              <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-[#5B5678] sm:text-xl">
                Explora islas en 3D, supera duelos matemáticos y desbloquea poderes
                científicos reales. Diseñado para estudiantes de{" "}
                <strong className="font-bold text-[#17164F]">7 a 15 años</strong> y
                alineado al Currículo Nacional del Perú.
              </p>

              {/* Botones de Acción Táctiles 3D */}
              <div className="mt-8 flex w-full flex-col gap-3.5 sm:w-auto sm:flex-row sm:items-center">
                <a
                  href="/login"
                  className="btn-tactil inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#5636D9] px-7 py-4 text-base font-extrabold text-white shadow-xl shadow-[#5636D9]/30 transition-transform hover:scale-105 active:scale-95"
                  style={{ "--tactil-borde": "#3B229D" } as React.CSSProperties}
                >
                  <RocketIcon weight="bold" className="h-5 w-5 text-[#FFC928]" />
                  <span>¡Empezar mi Misión Gratis!</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </a>

                <a
                  href="#isometria"
                  className="btn-tactil inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#E8E0FF] bg-white px-5 py-4 text-base font-bold text-[#17164F] transition-all hover:border-[#5636D9] hover:bg-[#F7F4FF]"
                  style={{ "--tactil-borde": "#DDD4FF" } as React.CSSProperties}
                >
                  <BrainIcon weight="bold" className="h-5 w-5 text-[#5636D9]" />
                  <span>Ver Maquinaria 3D</span>
                </a>
              </div>

              {/* Ticker de Métricas de Gamificación */}
              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-[#E8E0FF] pt-6 sm:grid-cols-4 sm:gap-6">
                <div>
                  <div className="font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#5636D9]">
                    12,400+
                  </div>
                  <div className="text-xs font-semibold text-[#5B5678]">Retos Superados</div>
                </div>
                <div>
                  <div className="font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#2DBE70]">
                    4 Reinos
                  </div>
                  <div className="text-xs font-semibold text-[#5B5678]">Curriculares</div>
                </div>
                <div>
                  <div className="font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#FFC928]">
                    100%
                  </div>
                  <div className="text-xs font-semibold text-[#5B5678]">Norma MINEDU</div>
                </div>
                <div>
                  <div className="font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#25CFE0]">
                    0%
                  </div>
                  <div className="text-xs font-semibold text-[#5B5678]">Aburrimiento</div>
                </div>
              </div>
            </div>

            {/* Ilustración Isométrica Interactiva estilo Anatomy */}
            <div className="entrada relative [animation-delay:150ms]">
              <IsoCitadelHero />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          SECCIÓN 2: LA MAQUINARIA ISOMÉTRICA DEL SABER (SKILL ANATOMY)
          ====================================================================== */}
      <section id="isometria" className="scroll-mt-20 py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="rounded-full bg-[#5636D9]/10 px-3.5 py-1 text-xs font-bold text-[#5636D9]">
              TECNOLOGÍA PEDAGÓGICA VIVA
            </span>
            <h2 className={`${tituloFont} mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]`}>
              La Maquinaria Interactiva de EduNova
            </h2>
            <p className="mt-4 text-base text-[#5B5678] sm:text-lg">
              EduNova no es una página con párrafos aburridos: cada lección es un
              aparato físico-virtual donde puedes tocar diales, regular presión,
              analizar ondas y forjar recompensas con tus propias manos.
            </p>
          </div>

          {/* Grid con los dos aparatos isométricos artesanales */}
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <IsoStemStation />
              <div className="mt-3 flex items-center justify-between text-xs text-[#5B5678]">
                <span>Módulo de Simulación Física y Química</span>
                <span className="font-mono text-[#25CFE0] font-bold">Fig. 02: Banco de Ensayos</span>
              </div>
            </div>

            <div>
              <IsoGamifiedChest />
              <div className="mt-3 flex items-center justify-between text-xs text-[#5B5678]">
                <span>Motor de Incentivos y Progresión por Retos</span>
                <span className="font-mono text-[#FFC928] font-bold">Fig. 03: Caja Fuerte XP</span>
              </div>
            </div>
          </div>

          {/* Banner de soporte de hardware y accesibilidad */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-[#E8E0FF] bg-[#F7F4FF] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5636D9] text-white">
                <GameControllerIcon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-[family-name:var(--font-fredoka)] text-base font-bold text-[#17164F]">
                  Compatible con Tablets del Ministerio, Laptops y Celulares
                </h4>
                <p className="text-xs text-[#5B5678]">
                  Optimizado para funcionar fluido incluso en conexiones lentas o dispositivos escolares.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-[#2DBE70] border border-[#2DBE70]/30">
                PWA Instalable
              </span>
              <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-[#5636D9] border border-[#5636D9]/30">
                Modo Offline
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          SECCIÓN 3: EXPERIENCIA POR EDADES (7 A 15 AÑOS)
          ====================================================================== */}
      <section id="edades" className="scroll-mt-20 bg-[#F2EEFF]/60 py-16 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="rounded-full bg-[#2DBE70]/15 px-3.5 py-1 text-xs font-bold text-[#1B8A4F]">
              ADAPTACIÓN PSICOPEDAGÓGICA
            </span>
            <h2 className={`${tituloFont} mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]`}>
              Tres Clanes de Aprendizaje para cada Etapa
            </h2>
            <p className="mt-4 text-base text-[#5B5678] sm:text-lg">
              Un niño de 7 años necesita cuentos y personajes; un adolescente de 14 busca
              retos reales, proyectos y simulaciones 3D. Elige una etapa para ver su universo:
            </p>
          </div>

          <div className="mt-10">
            <AgeStageSelector />
          </div>
        </div>
      </section>

      {/* ======================================================================
          SECCIÓN 4: LOS 4 REINOS CURRICULARES (MUNDOS VIVOS)
          ====================================================================== */}
      <section id="areas" className="scroll-mt-20 py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="rounded-full bg-[#FFC928]/25 px-3.5 py-1 text-xs font-bold text-[#8F6600]">
                ÁREAS OFICIALES MINEDU
              </span>
              <h2 className={`${tituloFont} mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]`}>
                Los 4 Reinos del Saber
              </h2>
              <p className="mt-2 text-base text-[#5B5678]">
                Cada curso es un territorio con islas explorables, acertijos y trofeos coleccionables.
              </p>
            </div>

            <div className="flex items-center gap-2 font-semibold text-xs text-[#5636D9]">
              <CheckCircleIcon weight="fill" className="h-5 w-5" />
              <span>Competencias Curriculares Nacionales Integradas</span>
            </div>
          </div>

          <div className="mt-10">
            <RealmsGrid />
          </div>
        </div>
      </section>

      {/* ======================================================================
          SECCIÓN 5: TUTOR INTELIGENTE WOEBLING Y COMUNIDAD
          ====================================================================== */}
      <section className="border-y border-[#E8E0FF] bg-gradient-to-r from-[#17164F] to-[#241B52] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Mascota Woebling en 3D */}
            <div className="flex justify-center lg:col-span-5">
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-[#00F0FF]/30 blur-2xl transition-all group-hover:bg-[#5636D9]/50" />
                <Image
                  src="/assets/landing/woebling-3d.jpg"
                  alt="Robot Woebling tutor inteligente en 3D"
                  width={420}
                  height={420}
                  className="relative h-auto w-64 rounded-3xl border-4 border-white/20 object-cover shadow-2xl drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105 sm:w-80"
                />
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/30 bg-[#17164F]/90 px-3 py-1 font-mono text-[11px] font-bold text-[#FFC928] shadow-lg backdrop-blur-md">
                  ★ MASCOTA OFICIAL
                </span>
              </div>
            </div>

            {/* Explicación del Tutor Socrático */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#00F0FF]">
                <SparkleIcon className="h-4 w-4" />
                <span>ASISTENTE SOCRÁTICO NO INVASIVO</span>
              </div>

              <h3 className="mt-4 font-[family-name:var(--font-fredoka)] text-3xl font-bold leading-tight sm:text-4xl">
                Conoce a <span className="text-[#FFC928]">Woebling</span>: Tu compañero de ruta que nunca te da la respuesta servida
              </h3>

              <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
                Woebling es el robot tutor de EduNova. Cuando un estudiante se equivoca o
                se bloquea, Woebling no le regala la solución: le hace preguntas guiadas,
                le muestra analogías visuales y celebra con él cuando logra descubrir la respuesta.
              </p>

              {/* Burbuja de diálogo de Woebling */}
              <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <div className="font-bold text-sm text-[#00F0FF]">
                      Woebling dice en un reto de fracciones:
                    </div>
                    <p className="mt-1 text-xs italic text-white/90">
                      &ldquo;¡Casi lo tienes! Imagina que cortamos esa pizza en 8 rebanadas y tu amigo toma 3.
                      ¿Cuántas quedan en la caja? ¡Fíjate en el numerador!&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Avatares de compañeros */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex -space-x-3">
                  {avatares.map((a) => (
                    <span
                      key={a.src}
                      title={a.name}
                      className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-md transition-transform hover:scale-110"
                    >
                      <Image src={a.src} alt="" width={a.w} height={a.h} className="h-10 w-auto" />
                    </span>
                  ))}
                </div>
                <div className="text-xs text-white/75">
                  <strong className="block text-sm text-white font-bold">
                    Aprende junto a compañeros de todo el país
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          SECCIÓN 6: MINI RETO GAMIFICADO JUGABLE EN VIVO
          ====================================================================== */}
      <section id="reto" className="scroll-mt-20 py-16 sm:py-24 bg-[#FAF7FF]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <span className="rounded-full bg-[#FF5C5C]/15 px-3.5 py-1 text-xs font-bold text-[#D93838]">
              PRUEBA EN VIVO
            </span>
            <h2 className={`${tituloFont} mt-3 text-3xl sm:text-4xl lg:text-[2.75rem]`}>
              Juega un Reto de 10 Segundos Ahora
            </h2>
            <p className="mt-3 text-base text-[#5B5678] sm:text-lg">
              Prueba la experiencia de juego de EduNova antes de registrarte. Elige tu nivel y gana tus primeros puntos de experiencia.
            </p>
          </div>

          <InteractiveReto />
        </div>
      </section>

      {/* ======================================================================
          SECCIÓN 7: LLAMADO A LA ACCIÓN FINAL (PORTAL DE DESPEGUE)
          ====================================================================== */}
      <section className="relative overflow-hidden py-20 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border-4 border-[#5636D9]/20 bg-gradient-to-tr from-[#17164F] via-[#2A1B70] to-[#5636D9] p-8 text-center text-white shadow-2xl sm:p-14">
            {/* Destellos y Estrellas de fondo */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#25CFE0]/30 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#FFC928]/30 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-[#00F0FF] backdrop-blur-md">
                🚀 COMIENZA TU EXPEDICIÓN HOY
              </span>

              <h2 className="mt-6 font-[family-name:var(--font-fredoka)] text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                ¿Listo para convertir el estudio en tu juego favorito?
              </h2>

              <p className="mt-4 text-base text-white/85 sm:text-lg">
                Crea tu perfil en 30 segundos, personaliza tu avatar y empieza a acumular
                trofeos curriculares en matemáticas, ciencias y comunicación.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
                <a
                  href="/login"
                  className="btn-tactil inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FFC928] px-8 py-4 text-base font-extrabold text-[#17164F] shadow-xl shadow-[#FFC928]/30 transition-transform hover:scale-105"
                  style={{ "--tactil-borde": "#C98F00" } as React.CSSProperties}
                >
                  <RocketIcon weight="bold" className="h-5 w-5" />
                  <span>¡Crear mi Cuenta de Estudiante!</span>
                </a>

                <a
                  href="/docente"
                  className="btn-tactil inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-6 py-4 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/25"
                  style={{ "--tactil-borde": "rgba(255,255,255,0.2)" } as React.CSSProperties}
                >
                  <UsersIcon weight="bold" className="h-5 w-5" />
                  <span>Acceso para Docentes</span>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon weight="fill" className="h-4 w-4 text-[#2DBE70]" />
                  100% Gratuito durante Hack4Edu
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon weight="fill" className="h-4 w-4 text-[#2DBE70]" />
                  Sin publicidad ni rastreadores
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon weight="fill" className="h-4 w-4 text-[#2DBE70]" />
                  Alineado a las Rutas del Aprendizaje
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          FOOTER OFICIAL EDUNOVA
          ====================================================================== */}
      <footer className="border-t border-[#E8E0FF] bg-white py-12 text-[#5B5678]">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Columna Marca */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5636D9] p-1">
                  <Image src="/assets/logo.svg" alt="" width={24} height={24} className="invert" />
                </div>
                <span className="font-[family-name:var(--font-fredoka)] text-xl font-bold text-[#17164F]">
                  EduNova
                </span>
              </div>
              <p className="mt-3 max-w-sm text-sm text-[#5B5678]">
                Plataforma interactiva de aprendizaje gamificado basada en el Currículo Nacional del Perú. Proyecto oficial desarrollado para Hack4Edu 2026.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#2DBE70]">
                <ShieldCheckIcon weight="fill" className="h-4 w-4" />
                <span>Entorno protegido y seguro para menores de edad</span>
              </div>
            </div>

            {/* Enlaces de Navegación */}
            <div>
              <h5 className="font-[family-name:var(--font-fredoka)] font-bold text-[#17164F]">
                Exploración
              </h5>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#inicio" className="hover:text-[#5636D9]">Ciudadela 3D</a></li>
                <li><a href="#edades" className="hover:text-[#5636D9]">Clanes por Edad (7-15)</a></li>
                <li><a href="#areas" className="hover:text-[#5636D9]">Mundos Curriculares</a></li>
                <li><a href="#reto" className="hover:text-[#5636D9]">Mini Reto en Vivo</a></li>
              </ul>
            </div>

            {/* Accesos de Plataforma */}
            <div>
              <h5 className="font-[family-name:var(--font-fredoka)] font-bold text-[#17164F]">
                Plataforma
              </h5>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="/login" className="hover:text-[#5636D9]">Iniciar Sesión</a></li>
                <li><a href="/docente" className="hover:text-[#5636D9]">Panel del Docente</a></li>
                <li><a href="/familia" className="hover:text-[#5636D9]">Portal Familias</a></li>
                <li><span className="text-xs text-[#8681A6]">Hack4Edu 2026 • Versión 1.0</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between border-t border-[#F2EEFF] pt-6 text-xs text-[#8681A6]">
            <span>© 2026 EduNova • Hack4Edu. Todos los derechos reservados.</span>
            <span>Diseñado con pasión pedagógica e ingeniería de software para la educación peruana.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
