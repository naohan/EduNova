import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { NombreAlumno } from "@/components/estudiante/NombreAlumno";
import { ResumenPuntos } from "@/components/estudiante/ResumenPuntos";
import { Mosaico } from "@/components/estudiante/shared/kit";
import { unidadActual } from "@/components/estudiante/data";
import { PlayIcon } from "@/components/ui/icons";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-4xl space-y-5 p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F] sm:text-4xl">
            ¡Hola, <NombreAlumno />!
          </h1>
          <ResumenPuntos />
        </header>

        {/* Una sola invitación grande: seguir donde se quedó */}
        <Link
          href="/estudiante/ruta"
          aria-label={`Continuar: ${unidadActual.titulo}`}
          className="card-tactil tactil-explorar-suave flex-col overflow-hidden p-0"
        >
          <span className="relative block h-44 w-full bg-[#17164F] sm:h-52">
            <Image
              src="/assets/landing/sistema-solar.webp"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 860px, 100vw"
              className="object-cover"
            />
          </span>
          <span className="flex items-center gap-4 p-4">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F]">
                {unidadActual.titulo}
              </span>
              <span className="mt-2 block h-3 overflow-hidden rounded-full bg-white" aria-hidden>
                <span className="block h-full rounded-full bg-[#4C9EFF]" style={{ width: `${unidadActual.progreso}%` }} />
              </span>
            </span>
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#4C9EFF] text-[#17164F]">
              <PlayIcon weight="fill" className="h-8 w-8" aria-hidden />
            </span>
          </span>
        </Link>

        <nav aria-label="Accesos rápidos" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Mosaico href="/estudiante/jugar" etiqueta="Juegos" seccion="juego" imagen="/assets/juego ludico/icon_dado.png" />
          <Mosaico href="/estudiante/flashcards" etiqueta="Repasar" seccion="refuerzo" imagen="/assets/juego ludico/icon_pregunta.png" />
          <Mosaico href="/estudiante/misiones" etiqueta="Retos" seccion="cooperar" imagen="/assets/juego ludico/icon_trofeo.png" />
          <Mosaico href="/estudiante/evaluaciones/foto" etiqueta="Cuaderno" seccion="magia" imagen="/assets/juego ludico/robot_mascota.png" />
        </nav>
      </div>
    </EstudianteLayout>
  );
}
