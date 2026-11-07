import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { NotebookPhotoScanner } from "@/components/estudiante/NotebookPhotoScanner";
import { BotonSalir, BotonVoz } from "@/components/estudiante/shared/kit";

export default function Page() {
  return (
    <EstudianteLayout foco>
      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <header className="mb-5 flex items-center gap-3">
          <h1 className="min-w-0 flex-1 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F] sm:text-3xl">
            Foto de tu cuaderno
          </h1>
          <BotonVoz texto="Resuelve el ejercicio en papel y tómale una foto. Revisamos tus pasos, no solo el resultado. Si explicas cómo lo hiciste, ganas puntos extra." />
          <BotonSalir href="/estudiante/evaluaciones" etiqueta="Salir" />
        </header>
        <NotebookPhotoScanner />
      </div>
    </EstudianteLayout>
  );
}
