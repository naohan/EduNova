import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { tiposEvaluacion } from "@/components/estudiante/data";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5">
          <p className="text-sm text-[#5B5678]">Evaluaciones</p>
          <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
            Cómo puedes demostrar lo aprendido
          </h1>
        </header>

        <div className="space-y-3">
          {tiposEvaluacion.map((t) => (
            <Link
              key={t.id}
              href={
                t.id === "foto"
                  ? "/estudiante/evaluaciones/foto"
                  : t.id === "opcion"
                    ? "/estudiante/practica"
                    : "/estudiante/desafio"
              }
              className="flex items-center gap-3 rounded-2xl border border-[#E8E0FF] bg-white p-4"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF6FF] text-xl text-[#5636D9]">
                <t.icon weight="duotone" className="h-6 w-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-[#17164F]">{t.nombre}</span>
                <span className="text-sm text-[#5B5678]">{t.desc}</span>
              </span>
              <span className="text-[#C4B5FD]">›</span>
            </Link>
          ))}
        </div>
      </div>
    </EstudianteLayout>
  );
}
