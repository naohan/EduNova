import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { UnidadesAula } from "@/components/estudiante/UnidadesAula";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5">
          <p className="text-sm text-[#5B5678]">Publicadas por tu docente</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Mis unidades
          </h1>
        </header>
        <UnidadesAula />
      </div>
    </EstudianteLayout>
  );
}
