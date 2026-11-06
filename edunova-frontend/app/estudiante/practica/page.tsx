"use client";

import { useState } from "react";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { preguntaPractica } from "@/components/estudiante/data";
import { registrarEvento } from "@/lib/api/learning-events";
import { BotonSalir, BotonVoz, Opcion } from "@/components/estudiante/shared/kit";
import { ArrowRightIcon } from "@/components/ui/icons";

// La pregunta del planeta más grande pertenece al subtema de los gigantes gaseosos.
const SUBTEMA_PRACTICA = "st-solar-3";

export default function Page() {
  const [sel, setSel] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const [intentos, setIntentos] = useState(0);

  function responder(id: string) {
    if (ok) return;
    const op = preguntaPractica.opciones.find((o) => o.id === id)!;
    setSel(id);
    setOk(op.correcta);
    setIntentos(intentos + 1);
    registrarEvento({
      activity: "QUIZ",
      correct: op.correcta,
      subtopicId: SUBTEMA_PRACTICA,
      questionId: "practica-planeta-grande",
      attempt: intentos + 1,
      hintsUsed: 0,
      timeMs: 0,
    });
  }

  return (
    <EstudianteLayout foco>
      <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col p-4 sm:p-6">
        <div className="flex justify-end">
          <BotonSalir href="/estudiante/jugar" etiqueta="Salir" />
        </div>

        <div className="mt-4 flex items-start gap-3">
          <h1 className="min-w-0 flex-1 font-[family-name:var(--font-fredoka)] text-2xl font-bold leading-snug text-[#17164F] sm:text-3xl">
            {preguntaPractica.enunciado}
          </h1>
          <BotonVoz texto={[preguntaPractica.enunciado, ...preguntaPractica.opciones.map((o) => o.label)].join(". ")} />
        </div>

        <div className="mt-6 grid gap-3">
          {preguntaPractica.opciones.map((op) => (
            <Opcion
              key={op.id}
              estado={sel === op.id ? (op.correcta ? "bien" : "mal") : "normal"}
              disabled={ok === true}
              onClick={() => responder(op.id)}
            >
              <span className="flex items-center gap-3">
                <span className="h-7 w-7 shrink-0 rounded-full" style={{ backgroundColor: op.color }} aria-hidden />
                {op.label}
              </span>
            </Opcion>
          ))}
        </div>

        <div className="mt-auto flex min-h-[72px] items-center gap-3 pt-4">
          <p role="status" className="min-w-0 flex-1 text-lg font-bold text-[#17164F]">
            {ok === true ? <span className="text-[#1B8A4F]">¡Bien! +{preguntaPractica.puntos}</span> : ok === false ? "Casi. Prueba otra." : null}
          </p>
          {ok ? (
            <Link href="/estudiante/jugar" aria-label="Continuar" className="btn-tactil tactil-cooperar px-8 py-3 text-[#17164F]">
              <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>
    </EstudianteLayout>
  );
}
