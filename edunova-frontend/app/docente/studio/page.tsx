import { DocenteLayout } from "@/components/docente/DocenteLayout";
import { StudioWizard } from "@/components/docente/studio/StudioWizard";
import { MobilePageHeader } from "@/components/docente/ui";

export default function Page() {
  return (
    <DocenteLayout>
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <MobilePageHeader title="Crear unidad" subtitle="De tu material a una unidad lista" />
        <header className="mb-6 hidden lg:block">
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Crear unidad
          </h1>
          <p className="mt-1 text-[#6B7280]">
            Sube tu material, revisa la rúbrica y publica. Nada llega a tus estudiantes sin tu aprobación.
          </p>
        </header>
        <StudioWizard />
      </div>
    </DocenteLayout>
  );
}
