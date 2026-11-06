"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { BotonSalir, BotonVoz, PuntosAvance } from "@/components/estudiante/shared/kit";
import { ArrowRightIcon, CheckIcon, FireIcon, LightningIcon, PlayIcon, TargetIcon } from "@/components/ui/icons";
import { habilidades as defaultHabilidades } from "@/components/estudiante/data";
import {
  BANCO_PREGUNTAS_INTELIGENCIA,
  type PreguntaInteligencia,
} from "@/components/estudiante/test-inteligencia-data";

interface AnswerResult {
  pregunta: PreguntaInteligencia;
  respuestaSeleccionada: string;
  esCorrecta: boolean;
}

export default function Page() {
  // Racha and test state
  const [racha, setRacha] = useState(5);
  const [testRealizadoHoy, setTestRealizadoHoy] = useState(false);
  const [testActivo, setTestActivo] = useState(false);
  const [preguntasTest, setPreguntasTest] = useState<PreguntaInteligencia[]>([]);
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string | null>(null);
  const [respuestasTest, setRespuestasTest] = useState<AnswerResult[]>([]);
  const [testFinalizado, setTestFinalizado] = useState(false);

  // Load streak and today status from localStorage
  useEffect(() => {
    try {
      const hoy = new Date().toISOString().slice(0, 10);
      const fechaGuardada = localStorage.getItem("edunova_test_fecha");
      const rachaGuardada = localStorage.getItem("edunova_test_racha");

      if (rachaGuardada) {
        setRacha(parseInt(rachaGuardada, 10));
      }

      if (fechaGuardada === hoy) {
        setTestRealizadoHoy(true);
      }
    } catch (e) {
      console.warn("Storage not available", e);
    }
  }, []);

  // Pick 5 random questions (balanced: at least 1 from each of the 4 intelligences + 1 extra)
  const iniciarTest = () => {
    const espacial = BANCO_PREGUNTAS_INTELIGENCIA.filter((q) => q.categoria === "espacial");
    const razonamiento = BANCO_PREGUNTAS_INTELIGENCIA.filter((q) => q.categoria === "razonamiento");
    const verbal = BANCO_PREGUNTAS_INTELIGENCIA.filter((q) => q.categoria === "verbal");
    const matematica = BANCO_PREGUNTAS_INTELIGENCIA.filter((q) => q.categoria === "matematica");

    const pickRandom = (arr: PreguntaInteligencia[]) =>
      arr[Math.floor(Math.random() * arr.length)];

    const seleccionadas: PreguntaInteligencia[] = [
      pickRandom(espacial),
      pickRandom(razonamiento),
      pickRandom(verbal),
      pickRandom(matematica),
    ];

    // Pick 5th question from the full pool, avoiding duplicates
    const restantes = BANCO_PREGUNTAS_INTELIGENCIA.filter(
      (q) => !seleccionadas.some((s) => s.id === q.id)
    );
    seleccionadas.push(pickRandom(restantes));

    // Shuffle the 5 questions
    seleccionadas.sort(() => Math.random() - 0.5);

    setPreguntasTest(seleccionadas);
    setIndicePregunta(0);
    setOpcionSeleccionada(null);
    setRespuestasTest([]);
    setTestFinalizado(false);
    setTestActivo(true);
  };

  // Confirm answer and advance
  const confirmarRespuesta = () => {
    if (!opcionSeleccionada) return;

    const actual = preguntasTest[indicePregunta];
    // Compare selected answer with correct answer
    // For verbal/math: compare selected option text or letter with respuestaCorrecta / respuestaTexto
    const optIdx = actual.opciones.indexOf(opcionSeleccionada);
    const letraIndex = optIdx >= 0 ? String.fromCharCode(65 + optIdx) : "";
    const esCorrecta =
      opcionSeleccionada.trim().toLowerCase() === actual.respuestaCorrecta.trim().toLowerCase() ||
      opcionSeleccionada.trim().toLowerCase() === actual.respuestaTexto.trim().toLowerCase() ||
      letraIndex.toLowerCase() === actual.respuestaCorrecta.trim().toLowerCase();

    const resultado: AnswerResult = {
      pregunta: actual,
      respuestaSeleccionada: opcionSeleccionada,
      esCorrecta,
    };

    const nuevasRespuestas = [...respuestasTest, resultado];
    setRespuestasTest(nuevasRespuestas);

    if (indicePregunta < preguntasTest.length - 1) {
      setIndicePregunta(indicePregunta + 1);
      setOpcionSeleccionada(null);
    } else {
      // Test finished!
      finalizarTest(nuevasRespuestas);
    }
  };

  // Finish test: update streak and save results for teacher
  const finalizarTest = (resultados: AnswerResult[]) => {
    setTestFinalizado(true);

    try {
      const hoy = new Date().toISOString().slice(0, 10);
      const nuevaRacha = testRealizadoHoy ? racha : racha + 1;
      setRacha(nuevaRacha);
      setTestRealizadoHoy(true);

      localStorage.setItem("edunova_test_fecha", hoy);
      localStorage.setItem("edunova_test_racha", String(nuevaRacha));

      // Calculate category breakdown
      const aciertos = resultados.filter((r) => r.esCorrecta).length;
      const historial = {
        fecha: hoy,
        aciertos,
        total: resultados.length,
        detalles: resultados.map((r) => ({
          categoria: r.pregunta.nombreCategoria,
          esCorrecta: r.esCorrecta,
        })),
      };

      localStorage.setItem("edunova_docente_test_report", JSON.stringify(historial));
    } catch (e) {
      console.warn("Storage error", e);
    }
  };

  const salirDelTest = () => {
    setTestActivo(false);
    setTestFinalizado(false);
  };

  const pregunta = preguntasTest[indicePregunta];

  if (testFinalizado) {
    return (
      <EstudianteLayout foco>
        <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col items-center justify-center p-4 text-center">
          <Image src="/assets/woebling.png" alt="" width={140} height={128} className="h-auto w-32" />
          <h1 className="mt-4 font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">¡Terminaste!</h1>
          <p className="mt-3 flex items-center gap-5 text-xl font-black text-[#17164F]">
            <span className="inline-flex items-center gap-1.5">
              <TargetIcon weight="fill" className="h-6 w-6 text-[#1B8A4F]" aria-hidden />
              {respuestasTest.filter((r) => r.esCorrecta).length}/{respuestasTest.length}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FireIcon weight="fill" className="h-6 w-6 text-[#C98F00]" aria-hidden />
              {racha}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LightningIcon weight="fill" className="h-6 w-6 text-[#5636D9]" aria-hidden />+50
            </span>
          </p>
          <p className="mt-3 text-base font-semibold text-[#17164F]/75">Tu docente lo verá.</p>
          <button
            type="button"
            onClick={salirDelTest}
            aria-label="Volver a mis habilidades"
            className="btn-tactil tactil-cooperar mt-6 w-full max-w-xs py-3.5 text-[#17164F]"
          >
            <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
          </button>
        </div>
      </EstudianteLayout>
    );
  }

  if (testActivo && pregunta) {
    const conImagen = pregunta.imagen && pregunta.imagen !== "/test-inteligencia/N/A";
    return (
      <EstudianteLayout foco>
        <div className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <PuntosAvance actual={indicePregunta} total={preguntasTest.length} etiqueta="Preguntas" />
            <BotonSalir onClick={salirDelTest} etiqueta="Salir del test" />
          </div>

          <div className="mt-5 flex items-start gap-3">
            <h1 className="min-w-0 flex-1 font-[family-name:var(--font-fredoka)] text-2xl font-bold leading-snug text-[#17164F]">
              {pregunta.enunciado}
            </h1>
            <BotonVoz key={pregunta.id} texto={[pregunta.enunciado, ...pregunta.opciones].join(". ")} />
          </div>

          {conImagen ? (
            <div className="mt-4 flex justify-center rounded-2xl bg-white p-3">
              <Image
                src={pregunta.imagen!}
                alt={`Pregunta ${pregunta.id}`}
                width={460}
                height={260}
                className="max-h-[240px] w-auto rounded-xl object-contain"
              />
            </div>
          ) : null}

          <div
            className={`mt-4 grid gap-3 ${pregunta.opciones.length > 5 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}`}
          >
            {pregunta.opciones.map((opt) => (
              <button
                key={opt}
                type="button"
                aria-pressed={opcionSeleccionada === opt}
                onClick={() => setOpcionSeleccionada(opt)}
                className={`min-h-[64px] rounded-2xl border-2 border-b-4 px-4 py-3 text-lg font-bold text-[#17164F] transition-colors ${
                  opcionSeleccionada === opt ? "border-[#5636D9] bg-[#F2EEFF]" : "border-[#E8E0FF] bg-white hover:bg-[#F7F4FF]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-4">
            <button
              type="button"
              onClick={confirmarRespuesta}
              disabled={!opcionSeleccionada}
              aria-label="Siguiente"
              className="btn-tactil tactil-magia w-full py-3.5 text-white"
            >
              <ArrowRightIcon weight="bold" className="h-7 w-7" aria-hidden />
            </button>
          </div>
        </div>
      </EstudianteLayout>
    );
  }

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5 flex items-center gap-3">
          <h1 className="min-w-0 flex-1 font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">Habilidades</h1>
          <BotonVoz texto="Son actividades para descubrir tus fortalezas. No son etiquetas ni diagnósticos. Completa cinco desafíos al día para mantener tu racha." />
          <BotonSalir href="/estudiante/logros" etiqueta="Volver al perfil" />
        </header>

        <button
          type="button"
          onClick={iniciarTest}
          aria-label={testRealizadoHoy ? "Practicar otra vez" : "Empezar el test de hoy"}
          className="card-tactil tactil-magia-suave w-full items-center gap-3 p-4 text-left"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#5636D9] text-white">
            {testRealizadoHoy ? (
              <CheckIcon weight="bold" className="h-7 w-7" aria-hidden />
            ) : (
              <PlayIcon weight="fill" className="h-7 w-7" aria-hidden />
            )}
          </span>
          <span className="min-w-0 flex-1 font-[family-name:var(--font-fredoka)] text-xl font-bold text-[#17164F]">Test de hoy</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-lg font-black text-[#17164F]">
            <FireIcon weight="fill" className="h-6 w-6 text-[#C98F00]" aria-hidden />
            {racha}
          </span>
        </button>

        <ul className="mt-4 grid grid-cols-2 gap-3">
          {defaultHabilidades.map((h) => (
            <li key={h.id} className="flex flex-col items-center gap-1 rounded-2xl bg-white p-4 text-center">
              <span className="text-4xl" aria-hidden>
                {h.emoji}
              </span>
              <span className="font-bold text-[#17164F]">{h.nombre}</span>
              <span className="mt-1 block h-3 w-full overflow-hidden rounded-full bg-[#E8E0FF]" aria-label={`${h.pct}%`} role="img">
                <span className="block h-full rounded-full bg-[#5636D9]" style={{ width: `${h.pct}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </EstudianteLayout>
  );
}
