import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { ValleMundo } from "@/components/estudiante/valle/ValleMundo";

export default function Page() {
  return (
    <EstudianteLayout foco>
      <ValleMundo />
    </EstudianteLayout>
  );
}

