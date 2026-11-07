import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { cursosAprender } from "@/components/estudiante/data";
import { Mosaico, TituloPantalla } from "@/components/estudiante/shared/kit";
import { UnidadesPublicadas } from "@/components/estudiante/UnidadesPublicadas";
import { CheckSquareIcon, ListChecksIcon } from "@/components/ui/icons";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <TituloPantalla voz="Elige un curso para empezar. Abajo están tus unidades y tus tarjetas para repasar.">Aprender</TituloPantalla>

        <UnidadesPublicadas />

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {cursosAprender.map((curso) => (
            <Mosaico
              key={curso.id}
              href={curso.href}
              etiqueta={curso.nombre}
              descripcion={`Abrir curso de ${curso.nombre}`}
              seccion="explorar"
              imagen={curso.imagen}
            />
          ))}
          <Mosaico href="/estudiante/unidades" etiqueta="Mis unidades" seccion="magia">
            <ListChecksIcon weight="duotone" className="h-20 w-20 text-[#5636D9]" aria-hidden />
          </Mosaico>
          <Mosaico href="/estudiante/flashcards" etiqueta="Repasar" seccion="refuerzo">
            <CheckSquareIcon weight="duotone" className="h-20 w-20 text-[#D9583F]" aria-hidden />
          </Mosaico>
        </div>
      </div>
    </EstudianteLayout>
  );
}
