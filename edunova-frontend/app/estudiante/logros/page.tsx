import Image from "next/image";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { insignias } from "@/components/estudiante/data";
import { NombreAlumno } from "@/components/estudiante/NombreAlumno";
import { ResumenPuntos } from "@/components/estudiante/ResumenPuntos";
import { Mosaico } from "@/components/estudiante/shared/kit";
import { BrainIcon, ChartBarIcon, LockIcon } from "@/components/ui/icons";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">
            <NombreAlumno />
          </h1>
          <ResumenPuntos />
        </header>

        <nav aria-label="Tu avance" className="grid grid-cols-2 gap-3">
          <Mosaico href="/estudiante/progreso" etiqueta="Mi progreso" seccion="cooperar">
            <ChartBarIcon weight="duotone" className="h-20 w-20 text-[#1B8A4F]" aria-hidden />
          </Mosaico>
          <Mosaico href="/estudiante/habilidades" etiqueta="Habilidades" seccion="magia">
            <BrainIcon weight="duotone" className="h-20 w-20 text-[#5636D9]" aria-hidden />
          </Mosaico>
        </nav>

        <ul aria-label="Insignias" className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {insignias.map((b) => (
            <li key={b.id} className="relative flex flex-col items-center gap-1 rounded-2xl bg-white p-3 text-center">
              <Image
                src={b.img}
                alt=""
                width={64}
                height={64}
                className={`h-14 w-14 object-contain ${b.obtenida ? "" : "opacity-30 grayscale"}`}
              />
              <span className="text-sm font-bold text-[#17164F]">{b.nombre}</span>
              {b.obtenida ? null : (
                <LockIcon weight="fill" className="absolute right-2 top-2 h-5 w-5 text-[#5B5678]" aria-label="Por desbloquear" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </EstudianteLayout>
  );
}
