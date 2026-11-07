import { DiagnosticoNivel } from "@/components/estudiante/DiagnosticoNivel";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <DiagnosticoNivel />
      </div>
    </EstudianteLayout>
  );
}

