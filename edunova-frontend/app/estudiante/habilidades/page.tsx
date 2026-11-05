"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { habilidades as defaultHabilidades } from "@/components/estudiante/data";
import {
  BANCO_PREGUNTAS_INTELIGENCIA,
  type PreguntaInteligencia,
} from "@/components/estudiante/test-inteligencia-data";

type Tab = "rendimiento" | "habilidades" | "recomendaciones";

interface AnswerResult {
  pregunta: PreguntaInteligencia;
  respuestaSeleccionada: string;
  esCorrecta: boolean;
}

export default function Page() {
  const [tab, setTab] = useState<Tab>("habilidades");

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

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#6B7280]">Perfil de aprendizaje</p>
            <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F] sm:text-3xl">
              Habilidades y fortalezas
            </h1>
            <p className="mt-1 text-xs text-[#6B7280]">
              Actividades exploratorias — no son etiquetas ni diagnósticos.
            </p>
          </div>

          {/* Racha Badge */}
          <div className="flex items-center gap-2 rounded-2xl border border-[#FED7AA] bg-[#FFF6E8] px-4 py-2 text-[#92400E] shadow-sm">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#B45309]">Racha diaria</p>
              <p className="text-sm font-black">{racha} días seguidos</p>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="mb-5 flex gap-2 overflow-x-auto">
          {(
            [
              ["rendimiento", "Rendimiento"],
              ["habilidades", "Habilidades"],
              ["recomendaciones", "Recomendaciones"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setTestActivo(false);
              }}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                tab === id
                  ? "bg-[#5636D9] text-white shadow-sm"
                  : "border border-[#E8E0FF] bg-white text-[#6B7280] hover:bg-[#F7F4FF]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* TAB: HABILIDADES                                         */}
        {/* ======================================================== */}
        {tab === "habilidades" && (
          <div className="space-y-6">
            {/* Daily Test Streak Callout Banner */}
            {!testActivo && (
              <div className="overflow-hidden rounded-3xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#5636D9] text-2xl text-white shadow-md">
                      🎯
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-[#17164F]">
                          Test Diario de Inteligencias
                        </h2>
                        {testRealizadoHoy ? (
                          <span className="rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-[10px] font-bold text-[#065F46]">
                            ✓ Completado hoy
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-bold text-[#92400E]">
                            ⚡ Pendiente hoy
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {testRealizadoHoy
                          ? "¡Racha de hoy asegurada! Puedes realizar otro test de práctica adicional si deseas entrenar más (opcional)."
                          : "Completa 5 desafíos rápidos al día para mantener tu racha activa (+50 XP). No te preocupes por equivocarte: ayuda a tu docente a conocer tu forma de aprender."}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={iniciarTest}
                    className="shrink-0 rounded-2xl bg-[#5636D9] px-6 py-3.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-[#4829be]"
                  >
                    {testRealizadoHoy ? "Practicar de nuevo (Opcional) 🎲" : "Comenzar Test Diario 🚀"}
                  </button>
                </div>
              </div>
            )}

            {/* Test Interface when Active */}
            {testActivo && !testFinalizado && preguntasTest.length > 0 && (
              <div className="rounded-3xl border border-[#5636D9] bg-white p-6 shadow-md">
                {/* Test Header */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#F2EEFF] pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full bg-[#F2EEFF] px-3 py-1 text-xs font-bold text-[#5636D9]">
                      {preguntasTest[indicePregunta].emoji} {preguntasTest[indicePregunta].nombreCategoria}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      Nivel {preguntasTest[indicePregunta].nivel} · {preguntasTest[indicePregunta].tipo}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#17164F]">
                      Pregunta {indicePregunta + 1} de {preguntasTest.length}
                    </span>
                    <button
                      type="button"
                      onClick={salirDelTest}
                      className="rounded-xl border border-[#E8E0FF] px-2.5 py-1 text-xs font-bold text-[#6B7280] hover:bg-[#F7F4FF]"
                    >
                      ✕ Salir
                    </button>
                  </div>
                </div>

                {/* Question Content */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#17164F] sm:text-base">
                    {preguntasTest[indicePregunta].enunciado}
                  </h3>

                  {/* If question has an image (Espacial o Razonamiento) */}
                  {preguntasTest[indicePregunta].imagen && preguntasTest[indicePregunta].imagen !== "/test-inteligencia/N/A" && (
                    <div className="flex justify-center rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] p-4">
                      <Image
                        src={preguntasTest[indicePregunta].imagen!}
                        alt={`Pregunta ${preguntasTest[indicePregunta].id}`}
                        width={460}
                        height={260}
                        className="max-h-[260px] w-auto rounded-xl object-contain shadow-sm"
                      />
                    </div>
                  )}

                  {/* Options */}
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                      Selecciona tu respuesta:
                    </p>
                    <div
                      className={`grid gap-2.5 ${
                        preguntasTest[indicePregunta].opciones.length > 5
                          ? "grid-cols-2 sm:grid-cols-4"
                          : "grid-cols-1 sm:grid-cols-2"
                      }`}
                    >
                      {preguntasTest[indicePregunta].opciones.map((opt, i) => {
                        const isSelected = opcionSeleccionada === opt;
                        const isSingleLetter = opt.length === 1;
                        const letterBadge = isSingleLetter ? opt : String.fromCharCode(65 + i);

                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setOpcionSeleccionada(opt)}
                            className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left text-xs font-medium transition-all ${
                              isSelected
                                ? "border-[#5636D9] bg-[#F2EEFF] text-[#17164F] shadow-sm ring-2 ring-[#5636D9]"
                                : "border-[#E8E0FF] bg-white text-[#374151] hover:border-[#CBD5E1] hover:bg-[#F7F4FF]"
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                isSelected
                                  ? "bg-[#5636D9] text-white"
                                  : "border border-[#E8E0FF] bg-[#F7F4FF] text-[#17164F]"
                              }`}
                            >
                              {letterBadge}
                            </span>
                            <span className="text-sm font-semibold">
                              {isSingleLetter ? `Opción ${opt}` : opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={confirmarRespuesta}
                      disabled={!opcionSeleccionada}
                      className="rounded-2xl bg-[#5636D9] px-6 py-3.5 text-xs font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-[#4829be] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {indicePregunta === preguntasTest.length - 1
                        ? "Finalizar Test 🏁"
                        : "Siguiente pregunta →"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Test Results Screen (NO REVEALING CORRECT ANSWERS NOR SOLUTIONS) */}
            {testFinalizado && (
              <div className="rounded-3xl border border-[#E8E0FF] bg-white p-6 shadow-sm">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5636D9] text-3xl text-white shadow-md">
                    🎉
                  </div>
                  <h2 className="mt-3 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F]">
                    ¡Test Diario Completado!
                  </h2>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    Tus respuestas han sido procesadas para tu perfil de aprendizaje
                  </p>

                  <div className="mx-auto mt-4 inline-flex items-center gap-3 rounded-full bg-[#ECFDF5] px-4 py-1.5 text-xs font-bold text-[#065F46]">
                    <span>🎯 {respuestasTest.filter((r) => r.esCorrecta).length} de {respuestasTest.length} aciertos</span>
                    <span>•</span>
                    <span>🔥 Racha: {racha} días</span>
                    <span>•</span>
                    <span>⚡ +50 XP</span>
                  </div>
                </div>

                {/* Question results breakdown WITHOUT leaking answers */}
                <div className="mt-6 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                    Evaluación formativa (Detección de fortalezas):
                  </h3>

                  <div className="space-y-2">
                    {respuestasTest.map((r, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between rounded-2xl border p-3.5 text-xs ${
                          r.esCorrecta
                            ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#065F46]"
                            : "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{r.pregunta.emoji}</span>
                          <div>
                            <p className="font-bold">
                              Pregunta #{idx + 1}: {r.pregunta.nombreCategoria} ({r.pregunta.tipo})
                            </p>
                            <p className="text-[11px] opacity-80 truncate max-w-md">
                              {r.pregunta.enunciado}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              r.esCorrecta
                                ? "bg-[#10B981] text-white"
                                : "bg-[#EF4444] text-white"
                            }`}
                          >
                            {r.esCorrecta ? "✓ Acertado" : "✗ Por reforzar"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Teacher visibility notice */}
                <div className="mt-6 rounded-2xl border border-[#EDE9FE] bg-[#F2EEFF] p-4 text-xs text-[#5636D9]">
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl">👩‍🏫</span>
                    <div>
                      <p className="font-bold">Resultados enviados al panel de tu Docente</p>
                      <p className="mt-0.5 text-[11px] text-[#4B5563]">
                        No mostramos las soluciones para que puedas seguir intentándolo en tus próximos desafíos. Tu profesora revisará este mapa para asignarte actividades adaptadas a tus fortalezas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={salirDelTest}
                    className="rounded-2xl bg-[#5636D9] px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-[#4829be]"
                  >
                    Ver mi mapa de fortalezas actualizado 📊
                  </button>
                </div>
              </div>
            )}

            {/* Radar and 4 Intelligence Cards */}
            {!testActivo && (
              <div className="grid gap-4 lg:grid-cols-2">
                {/* 4-Axis Radar Chart */}
                <div className="rounded-3xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#17164F]">Mapa de fortalezas</h2>
                    <span className="rounded-full bg-[#F2EEFF] px-2.5 py-0.5 text-[10px] font-bold text-[#5636D9]">
                      4 Inteligencias
                    </span>
                  </div>
                  <RadarChart />
                </div>

                {/* 4 Intelligences Cards */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {defaultHabilidades.map((h) => (
                      <div
                        key={h.id}
                        className="rounded-2xl border border-[#E8E0FF] bg-[#F7F4FF] p-4 text-center transition-transform hover:scale-[1.02]"
                      >
                        <div className="text-3xl">{h.emoji}</div>
                        <div className="mt-2 text-xs font-bold text-[#17164F]">{h.nombre}</div>
                        <div className="mt-1 text-base font-black text-[#5636D9]">{h.pct}%</div>
                        <div className="mt-1 text-[10px] text-[#6B7280]">
                          {h.id === "razonamiento" && "Sucesiones y deducción"}
                          {h.id === "espacial" && "Vistas 3D y rotación"}
                          {h.id === "verbal" && "Analogías y comprensión"}
                          {h.id === "matematica" && "Series y patrones lógicos"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommendation Card */}
                  <div className="rounded-2xl border border-[#FFF0C2] bg-[#FFFBEB] p-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#92400E]">
                      ¿Qué puedes reforzar hoy?
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-xs text-[#78350F]">
                      <li>• <strong>Verbal:</strong> Practica analogías y deduce significados en contexto</li>
                      <li>• <strong>Espacial:</strong> Entrena la visión 3D girando mentalmente figuras</li>
                    </ul>
                    <Link
                      href="/estudiante/ruta"
                      className="mt-3 inline-flex rounded-xl bg-[#5636D9] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#4829be]"
                    >
                      Ver actividades sugeridas
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: RENDIMIENTO                                         */}
        {/* ======================================================== */}
        {tab === "rendimiento" && (
          <div className="rounded-2xl border border-[#E8E0FF] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#6B7280]">
              Resumen de notas y progreso por unidad.
            </p>
            <Link
              href="/estudiante/progreso"
              className="mt-3 inline-flex text-sm font-semibold text-[#5636D9]"
            >
              Ir a Mi progreso →
            </Link>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: RECOMENDACIONES                                     */}
        {/* ======================================================== */}
        {tab === "recomendaciones" && (
          <div className="space-y-3">
            {[
              "Practica el test diario de inteligencias para mantener tu racha",
              "Resuelve retos espaciales en la sección de juegos",
              "Crea un duelo de conocimiento para desafiar a tu compañero",
              "Explora en 3D el Sistema Solar para ejercitar tu percepción espacial",
            ].map((r) => (
              <div
                key={r}
                className="rounded-2xl border border-[#E8E0FF] bg-white p-4 text-sm font-medium text-[#17164F] shadow-sm"
              >
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    </EstudianteLayout>
  );
}

// 4-Axis Dynamic Radar Chart for the 4 Intelligences
function RadarChart() {
  const cx = 120;
  const cy = 120;
  const r = 75;
  const n = defaultHabilidades.length;

  const pts = defaultHabilidades.map((h, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const rr = (h.pct / 100) * r;
    return [cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)];
  });
  const poly = pts.map((p) => p.join(",")).join(" ");
  const rings = [0.33, 0.66, 1];

  return (
    <svg
      viewBox="0 0 240 240"
      className="mx-auto h-auto w-full max-w-[270px]"
      role="img"
      aria-label="Radar de 4 inteligencias"
    >
      {/* Background concentric polygons */}
      {rings.map((f) => (
        <polygon
          key={f}
          fill="none"
          stroke="#E8E0FF"
          strokeWidth="1"
          points={Array.from({ length: n }, (_, i) => {
            const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
            return `${cx + r * f * Math.cos(ang)},${cy + r * f * Math.sin(ang)}`;
          }).join(" ")}
        />
      ))}

      {/* Axis lines */}
      {defaultHabilidades.map((_, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + r * Math.cos(ang)}
            y2={cy + r * Math.sin(ang)}
            stroke="#E8E0FF"
          />
        );
      })}

      {/* Filled radar area */}
      <polygon points={poly} fill="rgba(86,54,217,0.25)" stroke="#5636D9" strokeWidth="2.5" />

      {/* Vertex dots */}
      {pts.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="4" fill="#5636D9" stroke="#fff" strokeWidth="1.5" />
      ))}

      {/* Axis labels */}
      {defaultHabilidades.map((h, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const lx = cx + (r + 18) * Math.cos(ang);
        const ly = cy + (r + 18) * Math.sin(ang);
        return (
          <text
            key={h.id}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8.5"
            fill="#17164F"
            fontWeight="bold"
          >
            {h.nombre}
          </text>
        );
      })}
    </svg>
  );
}
