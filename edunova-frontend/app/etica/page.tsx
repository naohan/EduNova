import Image from "next/image";
import Link from "next/link";
import {
  BrainIcon,
  ChalkboardTeacherIcon,
  ChartLineIcon,
  CheckCircleIcon,
  LockIcon,
  ShieldCheckIcon,
  SparkleIcon,
  UsersIcon,
  WarningIcon,
} from "@/components/ui/icons";

export const metadata = {
  title: "Uso ético de la IA | EduNova",
  description: "Explicación clara y transparente sobre cómo EduNova utiliza la inteligencia artificial y protege la privacidad de los estudiantes.",
};

const tarjetaCls = "rounded-2xl border border-[#E8E0FF] bg-white p-6 sm:p-7";
const badgeCls = "inline-flex items-center gap-1.5 rounded-full bg-[#EAE5FF] px-3 py-1 text-xs font-bold text-[#5636D9]";
const tituloSeccion = "font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]";

export default function EticaPage() {
  return (
    <div className="min-h-screen bg-[#F2EEFF] text-[#17164F]">
      <header className="border-b border-[#E8E0FF] bg-white py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2.5 font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
            <Image src="/assets/logo.svg" alt="" width={28} height={28} />
            EduNova
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-[#5636D9] underline hover:text-[#4324bd]"
          >
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 text-center sm:text-left">
          <span className={badgeCls}>
            <ShieldCheckIcon weight="fill" className="h-4 w-4 text-[#5636D9]" aria-hidden />
            Transparencia y Cuidado
          </span>
          <h1 className="mt-3 font-[family-name:var(--font-fredoka)] text-2xl font-bold sm:text-3xl text-[#17164F]">
            Uso ético de la inteligencia artificial
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#5B5678] sm:text-base">
            En EduNova la tecnología es una herramienta de apoyo al aprendizaje. Esta página explica con claridad
            qué tareas realiza la IA, qué información se procesa y qué decisiones quedan siempre en manos de las personas.
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. Qué hace la IA */}
          <section className={tarjetaCls}>
            <div className="flex items-center gap-2.5 text-[#5636D9]">
              <SparkleIcon weight="fill" className="h-5 w-5" aria-hidden />
              <h2 className={tituloSeccion}>1. Qué hace la IA</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5B5678]">
              EduNova utiliza modelos de lenguaje para tres tareas concretas de preparación pedagógica:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#17164F]">
              <li className="flex items-start gap-2">
                <CheckCircleIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#2DBE70]" aria-hidden />
                <span><strong>Borrador para el docente:</strong> lee el material de clase (apuntes en texto, documento PDF o imagen de pizarra) y organiza un borrador de unidad con subtemas, preguntas y lectura fácil.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#2DBE70]" aria-hidden />
                <span><strong>Explicar en casa:</strong> genera explicaciones sencillas y contextualizadas para que las familias comprendan los temas que sus hijos están aprendiendo y puedan acompañarlos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#2DBE70]" aria-hidden />
                <span><strong>Preguntas del rival en el duelo:</strong> en el duelo, genera preguntas para el adversario simulado basándose en el curso y el tema elegidos.</span>
              </li>
            </ul>
          </section>

          {/* 2. Qué decide una persona */}
          <section className={tarjetaCls}>
            <div className="flex items-center gap-2.5 text-[#5636D9]">
              <ChalkboardTeacherIcon weight="fill" className="h-5 w-5" aria-hidden />
              <h2 className={tituloSeccion}>2. Qué decide una persona</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5B5678]">
              La inteligencia artificial no publica unidades ni pone notas definitivas por su cuenta:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-[#17164F]">
              <li className="flex items-start gap-2">
                <CheckCircleIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#2DBE70]" aria-hidden />
                <span><strong>Aprobación docente obligatoria:</strong> ninguna unidad llega a los estudiantes sin que el docente la revise y pulse &ldquo;Aprobar y Publicar&rdquo;. Todo borrador permanece privado hasta entonces.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#2DBE70]" aria-hidden />
                <span><strong>Control de notas y criterios:</strong> en evaluaciones donde el sistema sugiere una valoración de razonamiento, el docente tiene la potestad de ajustar, anular o corregir la nota sugerida.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#2DBE70]" aria-hidden />
                <span><strong>Aprobación familiar:</strong> en Saberes de casa, la lección solo llega al estudiante cuando su familia la aprueba.</span>
              </li>
            </ul>
          </section>

          {/* 3 y 4. Qué recibe y qué NO recibe el proveedor de IA */}
          <section className={tarjetaCls}>
            <div className="flex items-center gap-2.5 text-[#5636D9]">
              <LockIcon weight="fill" className="h-5 w-5" aria-hidden />
              <h2 className={tituloSeccion}>3 y 4. Datos enviados al proveedor de IA (Google Gemini)</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#E8E0FF] bg-[#F7F4FF] p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5636D9]">Qué sí recibe</h3>
                <ul className="mt-2 space-y-1.5 text-xs text-[#17164F]">
                  <li>• El material pedagógico que sube el docente para preparar su clase.</li>
                  <li>• El tema general consultado en &ldquo;Explicar en casa&rdquo;.</li>
                  <li>• Lo que la familia cuenta para preparar una lección de Saberes de casa.</li>
                  <li>• El curso y el tema del duelo para generar preguntas del rival. El tema lo escribe el estudiante, hasta 80 caracteres, y le pedimos no poner nombres ni datos personales.</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#C2410C]">Qué no recibe</h3>
                <ul className="mt-2 space-y-1.5 text-xs text-[#17164F]">
                  <li>• Alias, identificadores ni datos personales de estudiantes.</li>
                  <li>• Respuestas individuales de niños y niñas a las actividades.</li>
                  <li>• Las preguntas que los estudiantes crean en el duelo ni las explicaciones que escriben.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Recomendación al docente y condiciones de terceros */}
          <section className={tarjetaCls}>
            <div className="flex items-center gap-2.5 text-[#5636D9]">
              <WarningIcon weight="fill" className="h-5 w-5" aria-hidden />
              <h2 className={tituloSeccion}>5. Recomendaciones de subida y tratamiento de datos</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5B5678]">
              Pedimos a los docentes revisar que el material que suben para analizar no contenga nombres de estudiantes,
              calificaciones de terceros ni datos personales privados.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#5B5678]">
              Para los pictogramas de lectura fácil, nuestro servidor consulta en ARASAAC palabras clave del material del docente, sin datos de estudiantes.
              El servicio externo de procesamiento (Google Gemini) trata los documentos y textos que recibe de acuerdo con
              sus propias condiciones de servicio y políticas de uso de datos.
            </p>
          </section>

          {/* 6. Cómo se mide el aprendizaje (BKT) */}
          <section className={tarjetaCls}>
            <div className="flex items-center gap-2.5 text-[#5636D9]">
              <BrainIcon weight="fill" className="h-5 w-5" aria-hidden />
              <h2 className={tituloSeccion}>6. Medición de aprendizaje con estadística, no con IA generativa</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5B5678]">
              El avance en las competencias del aula se mide mediante un modelo matemático estándar denominado
              <strong> Bayesian Knowledge Tracing (BKT)</strong>. Este cálculo es completamente determinista y estadístico:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-[#17164F]">
              <li className="flex items-start gap-2">
                <CheckCircleIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#2DBE70]" aria-hidden />
                <span>Solo se toman en cuenta los <strong>primeros intentos</strong> de cada actividad.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#2DBE70]" aria-hidden />
                <span>Solo cuentan si se resolvieron <strong>sin solicitar pistas</strong>, reflejando dominio real.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#2DBE70]" aria-hidden />
                <span>No interviene ningún modelo de lenguaje ni algoritmo generativo en el cálculo del dominio.</span>
              </li>
            </ul>
          </section>

          {/* 7. Sin etiquetas */}
          <section className={tarjetaCls}>
            <div className="flex items-center gap-2.5 text-[#5636D9]">
              <ChartLineIcon weight="fill" className="h-5 w-5" aria-hidden />
              <h2 className={tituloSeccion}>7. Sugerencias pedagógicas, nunca etiquetas fijas</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5B5678]">
              Tanto el Radar de Talentos (lógica, perseverancia y autonomía) como las alertas pedagógicas del aula
              se calculan como señales orientadoras basadas en la evidencia de sus actividades.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#5B5678]">
              Son sugerencias para que el docente observe dinámicas y decida si conviene reforzar un tema o dialogar con el estudiante.
              Bajo ningún concepto constituyen diagnósticos clínicos, etiquetas psicológicas ni clasificaciones definitivas.
            </p>
          </section>

          {/* 8. Datos mínimos */}
          <section className={tarjetaCls}>
            <div className="flex items-center gap-2.5 text-[#5636D9]">
              <UsersIcon weight="fill" className="h-5 w-5" aria-hidden />
              <h2 className={tituloSeccion}>8. Principio de datos mínimos</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5B5678]">
              EduNova pide solo los datos que necesita para funcionar:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-[#17164F]">
              <li>• No se solicitan apellidos completos, direcciones de correo electrónico ni teléfonos.</li>
              <li>• No se recopila ubicación geográfica ni datos biométricos.</li>
              <li>• Solo se utilizan: alias, avatar ilustrado, rango de edad y código de aula o institución.</li>
            </ul>
          </section>

          {/* 9. Límites y transparencia */}
          <section className={tarjetaCls}>
            <div className="flex items-center gap-2.5 text-[#5636D9]">
              <WarningIcon weight="fill" className="h-5 w-5" aria-hidden />
              <h2 className={tituloSeccion}>9. Límites de la tecnología</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#5B5678]">
              Somos transparentes respecto a las limitaciones actuales de la plataforma:
            </p>
            <ul className="mt-2 space-y-2 text-sm text-[#17164F]">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#5636D9]">•</span>
                <span><strong>La IA puede equivocarse:</strong> las sugerencias de borradores o explicaciones pueden contener inexactitudes. Por eso las unidades siempre pasan por la revisión del docente. Las preguntas del rival y las explicaciones para familias se generan al momento y ninguna persona las revisa antes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#5636D9]">•</span>
                <span><strong>Disponibilidad y respaldo:</strong> si la conexión con el servicio de IA no está disponible o falla, la aplicación usa contenido de respaldo preparado previamente, y en el Studio se lo avisa al docente.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#5636D9]">•</span>
                <span><strong>Simulación de análisis de fotos:</strong> en la versión actual, el análisis de fotos manuscritas es una demostración técnica basada en una hoja de prueba fija y no procesa imágenes con IA real.</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-10 border-t border-[#E8E0FF] pt-6 text-center text-xs text-[#5B5678]">
          <p>EduNova · Plataforma educativa para Hack4Edu 2026.</p>
          <div className="mt-2">
            <Link href="/" className="font-semibold text-[#5636D9] hover:underline">
              Volver a la página principal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

