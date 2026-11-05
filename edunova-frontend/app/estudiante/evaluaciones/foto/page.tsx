import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { NotebookPhotoScanner } from "@/components/estudiante/NotebookPhotoScanner";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5">
          <Link href="/estudiante/evaluaciones" className="text-sm text-[#6B7280]">
            ‹ Evaluaciones
          </Link>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Foto de tu cuaderno
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Resuelve el ejercicio en papel y tómale una foto. Revisamos tus pasos, no solo el resultado.
          </p>
        </header>
        <NotebookPhotoScanner />
      </div>
    </EstudianteLayout>
  );
}
