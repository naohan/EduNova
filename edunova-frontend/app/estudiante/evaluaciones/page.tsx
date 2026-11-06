import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { tiposEvaluacion } from "@/components/estudiante/data";
import { Mosaico, TituloPantalla } from "@/components/estudiante/shared/kit";

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <TituloPantalla voz="Elige cómo quieres mostrar lo que aprendiste.">Evaluaciones</TituloPantalla>
        <nav aria-label="Tipos de evaluación" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tiposEvaluacion.map((t) => (
            <Mosaico
              key={t.id}
              href={
                t.id === "foto"
                  ? "/estudiante/evaluaciones/foto"
                  : t.id === "opcion"
                    ? "/estudiante/practica"
                    : "/estudiante/desafio"
              }
              etiqueta={t.corto}
              descripcion={`${t.nombre}: ${t.desc}`}
              seccion="magia"
            >
              <t.icon weight="duotone" className="h-16 w-16 text-[#5636D9]" aria-hidden />
            </Mosaico>
          ))}
        </nav>
      </div>
    </EstudianteLayout>
  );
}
