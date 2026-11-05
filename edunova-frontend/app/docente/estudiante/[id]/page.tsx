// Server component — resolves params server-side and renders the use-client
// EstudianteDetalle child. Exports generateStaticParams so the 20 ids are known
// at build time (prevents usePathname in DocenteLayout from suspending under
// cacheComponents).

import { DocenteLayout } from "@/components/docente/DocenteLayout";
import { FichaEstudiante } from "@/components/docente/FichaEstudiante";
import { estudiantes, idsAulaDemo } from "@/components/docente/data";

export async function generateStaticParams() {
  return [...estudiantes.map((e) => e.id), ...idsAulaDemo].map((id) => ({ id }));
}

export default async function Page({
  params,
}: PageProps<"/docente/estudiante/[id]">) {
  const { id } = await params;
  return (
    <DocenteLayout>
      <FichaEstudiante id={id} />
    </DocenteLayout>
  );
}
