import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { SmartFlashcards } from "@/components/estudiante/SmartFlashcards";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5">
          <p className="text-sm text-[#5B5678]">Sistema Solar</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Flashcards inteligentes
          </h1>
        </header>
        <SmartFlashcards />
      </div>
    </EstudianteLayout>
  );
}
