import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { LeccionPorEdad } from "@/components/estudiante/LeccionPorEdad";
import { BotonSalir } from "@/components/estudiante/shared/kit";
import { teoria } from "@/components/estudiante/data";

export default function Page() {
  return (
    <EstudianteLayout foco>
      <div className="mx-auto max-w-2xl space-y-4 p-4 sm:p-6">
        <header className="flex items-center justify-between gap-3">
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F] sm:text-3xl">{teoria.titulo}</h1>
          <BotonSalir href="/estudiante/ruta" etiqueta="Salir" />
        </header>
        <LeccionPorEdad />
      </div>
    </EstudianteLayout>
  );
}
