"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CalidadGrafica,
  type ClimaHora,
  type LugarValleId,
  type PersonajeGuiaId,
  CLAVE_LOCALSTORAGE_CALIDAD,
  CLAVE_LOCALSTORAGE_PREGUNTAS_RESUELTAS,
  CLAVE_LOCALSTORAGE_ULTIMO_LUGAR,
  LUGARES_VALLE,
  PERSONAJES_GUIA,
} from "./valleData";
import { hayWebGL } from "@/components/estudiante/aventuras/comun";
import { BotonSalir, Mosaico } from "@/components/estudiante/shared/kit";
import { Pregunta } from "@/components/estudiante/UnidadesAula";
import { listUnits } from "@/lib/api/client";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";
import type { LearningUnit, UnitQuestion } from "@/lib/api/edunova-contract";
import {
  ChatCircleIcon,
  CubeIcon,
  ListIcon,
  SparkleIcon,
  WarningIcon,
  XIcon,
} from "@/components/ui/icons";

const AULA_DEMO = "EDU-402";

// Carga perezosa del Canvas 3D sin SSR
const ValleEscena = dynamic(() => import("./ValleEscena"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#EBF4FA] p-4 text-[#17164F]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2472CC] border-t-transparent" />
      <p className="font-[family-name:var(--font-fredoka)] text-xl font-bold">
        Preparando el Valle de los Saberes…
      </p>
    </div>
  ),
});

export function ValleMundo() {
  const router = useRouter();
  const usuario = useSessionUser();

  // Consulta de unidades sin bloquear el render del valle (P15)
  const respuestaUnidades = useApi(listUnits, []);

  // Detección inicial de soporte WebGL sin efecto en cascada
  const [webglDisponible] = useState(() => (typeof document === "undefined" ? true : hayWebGL()));
  const [modoSimple, setModoSimple] = useState(() => (typeof document === "undefined" ? false : !hayWebGL()));

  // Clima y hora: día, atardecer, noche
  const [clima, setClima] = useState<ClimaHora>("dia");

  // Calidad gráfica: alta o ligera (en móviles inicia en ligera)
  const [calidad, setCalidad] = useState<CalidadGrafica>(() => {
    try {
      const guardada = typeof window !== "undefined" ? localStorage.getItem(CLAVE_LOCALSTORAGE_CALIDAD) : null;
      if (guardada === "alta" || guardada === "ligera") return guardada;
      if (typeof window !== "undefined" && window.innerWidth < 768) return "ligera";
    } catch {
      // Ignorar fallo de localStorage
    }
    return "alta";
  });

  // Preferencia del sistema para reducir movimiento
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });

  // Lugar cercano actual para la tarjeta contextual
  const [lugarCercano, setLugarCercano] = useState<LugarValleId | null>(null);

  // Personaje guía cercano actual (P15)
  const [personajeCercano, setPersonajeCercano] = useState<PersonajeGuiaId | null>(null);

  // Estado del diálogo abierto con un personaje guía (P15)
  const [dialogoPersonaje, setDialogoPersonaje] = useState<PersonajeGuiaId | null>(null);

  // Preguntas resueltas en el valle persistidas en localStorage (P15)
  const [preguntasResueltas, setPreguntasResueltas] = useState<string[]>(() => {
    try {
      const data = typeof window !== "undefined" ? localStorage.getItem(CLAVE_LOCALSTORAGE_PREGUNTAS_RESUELTAS) : null;
      return data ? (JSON.parse(data) as string[]) : [];
    } catch {
      return [];
    }
  });

  // Posición del jugador: último lugar visitado o [0, 0, 0]
  const [posicionJugador, setPosicionJugador] = useState<[number, number, number]>(() => {
    try {
      const ultimo = typeof window !== "undefined" ? localStorage.getItem(CLAVE_LOCALSTORAGE_ULTIMO_LUGAR) : null;
      if (ultimo) {
        const encontrado = LUGARES_VALLE.find((l) => l.id === ultimo);
        if (encontrado) return encontrado.puntoEntrada;
      }
    } catch {
      // Ignorar fallo de localStorage
    }
    return [0, 0, 0];
  });
  const [objetivoMovimiento, setObjetivoMovimiento] = useState<[number, number] | null>(null);

  // Filtros de unidades publicadas (P15)
  const unidadesAula = useMemo(() => {
    if (respuestaUnidades.status !== "ok") return [];
    const aula = usuario?.classroomCode ?? AULA_DEMO;
    return respuestaUnidades.data
      .filter((u) => u.status === "PUBLISHED" && u.classroomCode === aula && !u.familyStudentId)
      .reverse();
  }, [respuestaUnidades, usuario]);

  const unidadesFamilia = useMemo(() => {
    if (respuestaUnidades.status !== "ok" || !usuario?.id) return [];
    return respuestaUnidades.data
      .filter((u) => u.status === "PUBLISHED" && u.familyStudentId === usuario.id)
      .reverse();
  }, [respuestaUnidades, usuario]);

  // Novedades en los edificios (Escuela y Tu casa)
  const novedades = useMemo(() => {
    return {
      escuela: unidadesAula.length,
      casa: unidadesFamilia.length,
    };
  }, [unidadesAula, unidadesFamilia]);

  // Pools de preguntas de las unidades para los 3 personajes guía (P15)
  // 1. Maestra Elena: preguntas de unidades del aula
  const poolElena = useMemo(() => {
    const lista: { unidad: LearningUnit; subtopicId: string; pregunta: UnitQuestion }[] = [];
    for (const u of unidadesAula) {
      for (const st of u.subtopics) {
        for (const q of st.stages.demonstrate.questions) {
          lista.push({ unidad: u, subtopicId: st.id, pregunta: q });
        }
      }
    }
    return lista;
  }, [unidadesAula]);

  // 2. Sabio Mateo: preguntas de unidades familiares
  const poolMateo = useMemo(() => {
    const lista: { unidad: LearningUnit; subtopicId: string; pregunta: UnitQuestion }[] = [];
    for (const u of unidadesFamilia) {
      for (const st of u.subtopics) {
        for (const q of st.stages.demonstrate.questions) {
          lista.push({ unidad: u, subtopicId: st.id, pregunta: q });
        }
      }
    }
    return lista;
  }, [unidadesFamilia]);

  // 3. Astrónoma Vega: preguntas de unidades del aula con integración SOLAR_SYSTEM
  const poolVega = useMemo(() => {
    const lista: { unidad: LearningUnit; subtopicId: string; pregunta: UnitQuestion }[] = [];
    for (const u of unidadesAula) {
      for (const st of u.subtopics) {
        if (st.lab3DIntegration?.type === "SOLAR_SYSTEM") {
          for (const q of st.stages.demonstrate.questions) {
            lista.push({ unidad: u, subtopicId: st.id, pregunta: q });
          }
        }
      }
    }
    return lista;
  }, [unidadesAula]);

  // Próxima pregunta pendiente para cada personaje
  const retoElena = useMemo(() => poolElena.find((p) => !preguntasResueltas.includes(p.pregunta.id)) ?? null, [poolElena, preguntasResueltas]);
  const retoMateo = useMemo(() => poolMateo.find((p) => !preguntasResueltas.includes(p.pregunta.id)) ?? null, [poolMateo, preguntasResueltas]);
  const retoVega = useMemo(() => poolVega.find((p) => !preguntasResueltas.includes(p.pregunta.id)) ?? null, [poolVega, preguntasResueltas]);

  const preguntasDisponibles = useMemo(() => ({
    elena: Boolean(retoElena),
    mateo: Boolean(retoMateo),
    vega: Boolean(retoVega),
  }), [retoElena, retoMateo, retoVega]);

  // Escuchar cambios de prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Guardar cambio de calidad con try/catch
  const alternarCalidad = () => {
    const nueva = calidad === "alta" ? "ligera" : "alta";
    setCalidad(nueva);
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE_CALIDAD, nueva);
    } catch {
      // Ignorar fallo
    }
  };

  // Objeto del lugar cercano actual
  const infoLugar = useMemo(() => {
    if (!lugarCercano) return null;
    return LUGARES_VALLE.find((l) => l.id === lugarCercano) ?? null;
  }, [lugarCercano]);

  // Personaje cercano actual
  const infoPersonaje = useMemo(() => {
    if (!personajeCercano) return null;
    return PERSONAJES_GUIA.find((pg) => pg.id === personajeCercano) ?? null;
  }, [personajeCercano]);

  // Personaje con quien se está hablando en diálogo abierto
  const personajeEnDialogo = useMemo(() => {
    if (!dialogoPersonaje) return null;
    return PERSONAJES_GUIA.find((pg) => pg.id === dialogoPersonaje) ?? null;
  }, [dialogoPersonaje]);

  // Reto activo en el diálogo
  const retoEnDialogo = useMemo(() => {
    if (dialogoPersonaje === "elena") return retoElena;
    if (dialogoPersonaje === "mateo") return retoMateo;
    if (dialogoPersonaje === "vega") return retoVega;
    return null;
  }, [dialogoPersonaje, retoElena, retoMateo, retoVega]);

  // Guardar pregunta resuelta cuando Pregunta llama a onSiguiente (solo tras acertar)
  const alResolverPregunta = useCallback((idPregunta: string) => {
    setPreguntasResueltas((prev) => {
      if (prev.includes(idPregunta)) return prev;
      const actualizadas = [...prev, idPregunta];
      try {
        localStorage.setItem(CLAVE_LOCALSTORAGE_PREGUNTAS_RESUELTAS, JSON.stringify(actualizadas));
      } catch {
        // Ignorar fallo de localStorage
      }
      return actualizadas;
    });
  }, []);

  // Acción para entrar al lugar activo (guarda último lugar y navega)
  const entrarAlLugar = useCallback((lugar: (typeof LUGARES_VALLE)[0]) => {
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE_ULTIMO_LUGAR, lugar.id);
    } catch {
      // Ignorar fallo
    }
    router.push(lugar.ruta);
  }, [router]);

  // Tecla Enter o Espacio para entrar al lugar si la tarjeta está visible, o 'E' para hablar con personaje
  useEffect(() => {
    const alPresionarTecla = (e: KeyboardEvent) => {
      // Si el diálogo está abierto, Escape lo cierra
      if (dialogoPersonaje) {
        if (e.key === "Escape") {
          e.preventDefault();
          setDialogoPersonaje(null);
        }
        return;
      }

      // Tecla 'e' o 'E' para abrir diálogo con personaje cercano
      if ((e.key === "e" || e.key === "E") && personajeCercano) {
        e.preventDefault();
        setDialogoPersonaje(personajeCercano);
        return;
      }

      // Enter o Espacio para entrar al edificio si está en el radio
      if (infoLugar && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        entrarAlLugar(infoLugar);
      }
    };
    window.addEventListener("keydown", alPresionarTecla);
    return () => {
      window.removeEventListener("keydown", alPresionarTecla);
    };
  }, [dialogoPersonaje, personajeCercano, infoLugar, entrarAlLugar]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#EBF4FA]">
      {/* VISTA 3D DEL VALLE */}
      {!modoSimple && webglDisponible ? (
        <div className="relative h-full w-full">
          <ValleEscena
            clima={clima}
            calidad={calidad}
            prefersReducedMotion={prefersReducedMotion}
            lugarCercano={lugarCercano}
            onLugarCercanoChange={setLugarCercano}
            personajeCercano={personajeCercano}
            onPersonajeCercanoChange={setPersonajeCercano}
            novedades={novedades}
            preguntasDisponibles={preguntasDisponibles}
            posicionJugador={posicionJugador}
            setPosicionJugador={setPosicionJugador}
            objetivoMovimiento={objetivoMovimiento}
            setObjetivoMovimiento={setObjetivoMovimiento}
            onWebGLPerdido={() => setModoSimple(true)}
          />

          {/* HUD SUPERIOR */}
          <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4">
            {/* Título y alternador a Mapa Simple */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModoSimple(true)}
                className="flex items-center gap-2 rounded-xl border-2 border-[#E8E0FF] bg-white px-3 py-2 text-sm font-bold text-[#17164F] shadow-sm transition-colors hover:bg-[#F2EEFF]"
                aria-label="Ver mapa simple en 2D"
              >
                <ListIcon weight="bold" className="h-5 w-5 text-[#2472CC]" aria-hidden />
                <span className="hidden sm:inline">Mapa simple</span>
              </button>
            </div>

            {/* Selector de clima y hora + Calidad + Botón Salir */}
            <div className="pointer-events-auto flex items-center gap-2">
              {/* Selector de Clima / Hora */}
              <div className="flex items-center rounded-xl border-2 border-[#E8E0FF] bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setClima("dia")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                    clima === "dia"
                      ? "bg-[#FFC928] text-[#17164F]"
                      : "text-[#17164F]/70 hover:bg-[#F2EEFF]"
                  }`}
                  aria-label="Clima Día"
                >
                  Día
                </button>
                <button
                  type="button"
                  onClick={() => setClima("atardecer")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                    clima === "atardecer"
                      ? "bg-[#FF8A73] text-white"
                      : "text-[#17164F]/70 hover:bg-[#F2EEFF]"
                  }`}
                  aria-label="Clima Atardecer"
                >
                  Tarde
                </button>
                <button
                  type="button"
                  onClick={() => setClima("noche")}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                    clima === "noche"
                      ? "bg-[#17164F] text-white"
                      : "text-[#17164F]/70 hover:bg-[#F2EEFF]"
                  }`}
                  aria-label="Clima Noche"
                >
                  Noche
                </button>
              </div>

              {/* Botón selector de Calidad */}
              <button
                type="button"
                onClick={alternarCalidad}
                className="hidden rounded-xl border-2 border-[#E8E0FF] bg-white px-3 py-2 text-xs font-bold text-[#17164F] shadow-sm transition-colors hover:bg-[#F2EEFF] sm:flex sm:items-center sm:gap-1.5"
                title="Cambiar calidad gráfica"
              >
                <SparkleIcon weight="bold" className="h-4 w-4 text-[#C98F00]" aria-hidden />
                <span>Calidad: {calidad === "alta" ? "Alta" : "Ligera"}</span>
              </button>

              {/* Salida hacia /estudiante/jugar */}
              <BotonSalir href="/estudiante/jugar" etiqueta="Volver a juegos" />
            </div>
          </header>

          {/* BOTÓN HABLAR CON PERSONAJE GUÍA CERCANO (P15) */}
          {infoPersonaje && !dialogoPersonaje && (
            <div className="pointer-events-auto absolute inset-x-4 bottom-24 z-20 mx-auto flex max-w-xs justify-center animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setDialogoPersonaje(infoPersonaje.id)}
                className="flex items-center gap-2 rounded-2xl border-2 border-[#5636D9] bg-white px-5 py-3 font-bold text-[#5636D9] shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                <ChatCircleIcon weight="fill" className="h-6 w-6 text-[#5636D9]" aria-hidden />
                <span>Hablar con {infoPersonaje.nombre} <kbd className="ml-1 rounded bg-[#F2EEFF] px-1.5 py-0.5 text-xs font-semibold">E</kbd></span>
              </button>
            </div>
          )}

          {/* GUÍA TÁCTIL / TECLADO INFERIOR SUTIL (cuando no hay tarjeta abierta) */}
          {!infoLugar && !infoPersonaje && !dialogoPersonaje && (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
              <p className="rounded-full bg-white/80 px-4 py-1.5 text-xs font-medium text-[#17164F] backdrop-blur-sm sm:text-sm">
                Toca el suelo o usa las flechas / WASD para caminar
              </p>
            </div>
          )}

          {/* TARJETA CONTEXTUAL DEL LUGAR (HUD INFERIOR) */}
          {infoLugar && !dialogoPersonaje && (
            <div className="pointer-events-auto absolute inset-x-4 bottom-4 z-20 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center gap-4 rounded-2xl border-2 border-[#E8E0FF] border-b-4 border-b-[#CFC4F5] bg-white p-4 shadow-lg sm:p-5">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${infoLugar.color}25`, color: infoLugar.color }}
                >
                  {infoLugar.icon({ className: "w-8 h-8", weight: "bold" })}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-bold text-[#17164F]">
                      {infoLugar.nombre}
                    </h2>
                    <span className="rounded-full bg-[#F2EEFF] px-2 py-0.5 text-xs font-bold text-[#5636D9]">
                      {infoLugar.tipo}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-[#5B5678] sm:text-sm">
                    {infoLugar.frase}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => entrarAlLugar(infoLugar)}
                  className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-[#2DBE70] px-4 font-bold text-white transition-colors hover:bg-[#249E5D]"
                >
                  Entrar
                </button>
              </div>
            </div>
          )}

          {/* DIÁLOGO ACCESIBLE 2D SOBRE EL CANVAS CON PERSONAJE GUÍA (P15) */}
          {personajeEnDialogo && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-dialogo-guia"
              className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150"
            >
              <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border-2 border-[#E8E0FF] bg-white p-5 shadow-2xl sm:p-6">
                {/* Cabecera del diálogo */}
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#E8E0FF] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2EEFF] text-[#5636D9]">
                      <ChatCircleIcon weight="fill" className="h-6 w-6" aria-hidden />
                    </span>
                    <div>
                      <h2 id="titulo-dialogo-guia" className="font-[family-name:var(--font-fredoka)] text-xl font-bold text-[#17164F]">
                        {personajeEnDialogo.nombre}
                      </h2>
                      <p className="text-xs font-medium text-[#5B5678]">{personajeEnDialogo.rol}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDialogoPersonaje(null)}
                    aria-label="Cerrar diálogo"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7F4FF] text-[#17164F] transition-colors hover:bg-[#E8E0FF]"
                  >
                    <XIcon weight="bold" className="h-5 w-5" aria-hidden />
                  </button>
                </div>

                {/* Contenido: Pregunta real o invitación a explorar */}
                {retoEnDialogo ? (
                  <div>
                    <p className="mb-3 text-sm font-medium text-[#17164F]">
                      {personajeEnDialogo.saludo}
                    </p>

                    {/* Nota de seguridad destacada si es Tu casa / Sabio Mateo y la unidad tiene safetyNote */}
                    {dialogoPersonaje === "mateo" && retoEnDialogo.unidad.safetyNote ? (
                      <div className="mb-3 flex items-start gap-2 rounded-xl border border-[#FFC928] bg-[#FFFBEB] p-3 text-xs font-medium text-[#92400E]">
                        <WarningIcon weight="fill" className="mt-0.5 h-4 w-4 shrink-0 text-[#C98F00]" aria-hidden />
                        <span>{retoEnDialogo.unidad.safetyNote}</span>
                      </div>
                    ) : null}

                    {/* Componente Pregunta reutilizado sin alterar contrato ni eventos (P15) */}
                    <div className="rounded-xl bg-[#FAF9FF] p-2">
                      <Pregunta
                        key={retoEnDialogo.pregunta.id}
                        pregunta={retoEnDialogo.pregunta}
                        subtopicId={retoEnDialogo.subtopicId}
                        onSiguiente={() => alResolverPregunta(retoEnDialogo.pregunta.id)}
                      />
                    </div>

                    {/* Enlace secundario hacia la unidad */}
                    <div className="mt-4 flex items-center justify-between pt-2">
                      <Link
                        href={`/estudiante/unidades?unidad=${retoEnDialogo.unidad.id}`}
                        className="text-xs font-bold text-[#5636D9] underline hover:text-[#3B229D]"
                      >
                        Ir a esta unidad completa
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDialogoPersonaje(null)}
                        className="rounded-xl border border-[#E8E0FF] bg-white px-3 py-1.5 text-xs font-bold text-[#17164F] hover:bg-[#F2EEFF]"
                      >
                        Seguir caminando
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Sin preguntas pendientes o sin conexión: invita a explorar el lugar */
                  <div className="space-y-4 text-center">
                    <p className="text-sm text-[#17164F]">
                      {dialogoPersonaje === "elena"
                        ? "¡Has completado todos los retos de hoy! Entra a la Escuela para repasar todas las lecciones del aula."
                        : dialogoPersonaje === "mateo"
                          ? "¡Qué gran trabajo con tus saberes! Entra a Tu casa para compartir historias y lecciones en familia."
                          : "¡Los telescopios están calibrados! Entra al Observatorio para pilotar tu nave por el Sistema Solar."}
                    </p>
                    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const lugarDestino = LUGARES_VALLE.find((l) => l.id === personajeEnDialogo.lugarId);
                          setDialogoPersonaje(null);
                          if (lugarDestino) entrarAlLugar(lugarDestino);
                        }}
                        className="rounded-xl bg-[#2DBE70] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#249E5D]"
                      >
                        Entrar al edificio
                      </button>
                      <button
                        type="button"
                        onClick={() => setDialogoPersonaje(null)}
                        className="rounded-xl border border-[#E8E0FF] bg-white px-4 py-2 text-sm font-bold text-[#17164F] hover:bg-[#F2EEFF]"
                      >
                        Seguir caminando
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================== */
        /* MAPA SIMPLE 2D (RESPALDO Y ACCESIBILIDAD INMEDIATA)            */
        /* ============================================================== */
        <div className="flex h-full w-full flex-col overflow-y-auto bg-[#F7F4FF] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-3xl flex-1">
            <header className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F] sm:text-3xl">
                  Valle de los Saberes
                </h1>
                <p className="text-sm text-[#5B5678]">
                  Explora los 6 lugares del valle
                </p>
              </div>
              <div className="flex items-center gap-2">
                {webglDisponible && (
                  <button
                    type="button"
                    onClick={() => setModoSimple(false)}
                    className="flex items-center gap-2 rounded-xl border-2 border-[#E8E0FF] bg-white px-3 py-2 text-sm font-bold text-[#17164F] shadow-sm transition-colors hover:bg-[#F2EEFF]"
                  >
                    <CubeIcon weight="bold" className="h-5 w-5 text-[#5636D9]" aria-hidden />
                    <span>Ver en 3D</span>
                  </button>
                )}
                <BotonSalir href="/estudiante/jugar" etiqueta="Volver a juegos" />
              </div>
            </header>

            <nav aria-label="Lugares del Valle" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {LUGARES_VALLE.map((lugar) => {
                const Icono = lugar.icon;
                const cantidadNovedades = lugar.id === "escuela" ? novedades.escuela : lugar.id === "casa" ? novedades.casa : 0;

                return (
                  <div
                    key={lugar.id}
                    onClick={() => {
                      try {
                        localStorage.setItem(CLAVE_LOCALSTORAGE_ULTIMO_LUGAR, lugar.id);
                      } catch {
                        // Ignorar fallo
                      }
                    }}
                    className="relative flex flex-col"
                  >
                    <Mosaico
                      href={lugar.ruta}
                      etiqueta={lugar.nombre}
                      descripcion={lugar.descripcion}
                      seccion={lugar.seccion}
                    >
                      <span style={{ color: lugar.color }}>
                        <Icono weight="duotone" className="h-16 w-16" />
                      </span>
                    </Mosaico>

                    {/* Insignia con texto, forma y color si tiene unidades (P15) */}
                    {cantidadNovedades > 0 && (
                      <div className="pointer-events-none absolute top-2 right-2 flex items-center gap-1 rounded-full bg-[#5636D9] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                        <SparkleIcon weight="fill" className="h-3 w-3 text-[#FFC928]" aria-hidden />
                        <span>{cantidadNovedades} {cantidadNovedades === 1 ? "unidad" : "unidades"}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
