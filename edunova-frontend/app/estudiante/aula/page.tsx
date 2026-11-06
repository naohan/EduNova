import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { Mosaico, TituloPantalla } from "@/components/estudiante/shared/kit";
import { ClipboardTextIcon, GameControllerIcon, SwordIcon, TargetIcon } from "@/components/ui/icons";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <TituloPantalla voz="Aquí aprendes con tu equipo. Escribe el código de tu aula para unirte.">Aula</TituloPantalla>

        <div className="mb-4 flex gap-2">
          <label htmlFor="codigo-aula" className="sr-only">
            Código de aula
          </label>
          <input
            id="codigo-aula"
            type="text"
            className="min-w-0 flex-1 rounded-2xl border-2 border-[#E8E0FF] bg-white px-4 py-3 text-lg font-bold tracking-widest text-[#17164F] outline-none focus:border-[#1B8A4F]"
            defaultValue="NOVA-1B"
          />
          <button type="button" className="btn-tactil tactil-cooperar px-5 text-base text-[#17164F]">
            Unirme
          </button>
        </div>

        <nav aria-label="Actividades del aula" className="grid grid-cols-2 gap-3">
          <Mosaico href="/estudiante/juegos" etiqueta="Tablero" descripcion="Tablero en equipo" seccion="juego">
            <GameControllerIcon weight="duotone" className="h-20 w-20 text-[#C98F00]" aria-hidden />
          </Mosaico>
          <Mosaico href="/estudiante/duelo" etiqueta="Duelo" seccion="juego">
            <SwordIcon weight="duotone" className="h-20 w-20 text-[#C98F00]" aria-hidden />
          </Mosaico>
          <Mosaico href="/estudiante/misiones" etiqueta="Retos" seccion="cooperar">
            <TargetIcon weight="duotone" className="h-20 w-20 text-[#1B8A4F]" aria-hidden />
          </Mosaico>
          <Mosaico href="/estudiante/evaluaciones" etiqueta="Evaluaciones" seccion="magia">
            <ClipboardTextIcon weight="duotone" className="h-20 w-20 text-[#5636D9]" aria-hidden />
          </Mosaico>
        </nav>
      </div>
    </EstudianteLayout>
  );
}
