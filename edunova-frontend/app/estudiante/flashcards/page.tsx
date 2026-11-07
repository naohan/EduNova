import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { SmartFlashcards } from "@/components/estudiante/SmartFlashcards";

export default function Page() {
  return (
    <EstudianteLayout foco>
      <div className="mx-auto min-h-[100dvh] max-w-xl p-4 sm:p-6">
        <SmartFlashcards />
      </div>
    </EstudianteLayout>
  );
}
