"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CLAVE_LOCALSTORAGE_CALIDAD,
  CLAVE_LOCALSTORAGE_PREGUNTAS_RESUELTAS,
  CLAVE_LOCALSTORAGE_ULTIMO_LUGAR,
  INICIO_JUGADOR,
  LUGARES_VALLE,
  PERSONAJES_GUIA,
  type CalidadGrafica,
  type ClimaHora,
  type LugarValle,
  type LugarValleId,
  type PersonajeGuiaDef,
  type PersonajeGuiaId,
} from "./valleData";
import { hayWebGL } from "@/components/estudiante/aventuras/comun";
import { BotonSalir, BotonVoz, Mosaico } from "@/components/estudiante/shared/kit";
import { Pregunta } from "@/components/estudiante/UnidadesAula";
import { listUnits } from "@/lib/api/client";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";
import { noopSubscribe } from "@/lib/speech";
import type { LearningUnit, UnitQuestion } from "@/lib/api/edunova-contract";
import {
  ChatCircleIcon,
  CubeIcon,
  MapTrifoldIcon,
  MoonIcon,
  SparkleIcon,
  SunHorizonIcon,
  SunIcon,
  WarningIcon,
  XIcon,
} from "@/components/ui/icons";

const AULA_DEMO = "EDU-402";

type Reto = { unidad: LearningUnit; subtopicId: string; pregunta: UnitQuestion };

function Preparando() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#E6F2FF] p-4 text-center text-[#17164F]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2472CC] border-t-transparent" />
      <p className="font-[family-name:var(--font-fredoka)] text-xl font-bold">Preparando el Valle de los Saberes…</p>
    </div>
  );
}

// Carga perezosa del Canvas 3D sin SSR
const ValleEscena = dynamic(() => import("./ValleEscena"), { ssr: false, loading: () => <Preparando /> });

function leerResueltas(clave: string): string[] {
  try {
    const datos: unknown = JSON.parse(localStorage.getItem(clave) ?? "[]");
    return Array.isArray(datos) ? datos.filter((d): d is string => typeof d === "string") : [];
  } catch {
    return [];
  }
}

function calidadInicial(): CalidadGrafica {
  try {
    const guardada = localStorage.getItem(CLAVE_LOCALSTORAGE_CALIDAD);
    if (guardada === "alta" || guardada === "ligera") return guardada;
  } catch {
    // Sin localStorage se decide por el ancho de la pantalla.
  }
  return window.innerWidth < 768 ? "ligera" : "alta";
}

function posicionInicial(): [number, number, number] {
  try {
    const ultimo = localStorage.getItem(CLAVE_LOCALSTORAGE_ULTIMO_LUGAR);
    const lugar = LUGARES_VALLE.find((l) => l.id === ultimo);
    if (lugar) return [...lugar.puntoEntrada];
  } catch {
    // Sin localStorage se empieza en el centro del valle.
  }
  return [...INICIO_JUGADOR];
}

function recordarLugar(id: LugarValleId) {
  try {
    localStorage.setItem(CLAVE_LOCALSTORAGE_ULTIMO_LUGAR, id);
  } catch {
    // No recordar el lugar no impide entrar.
  }
}

/** Reúne las preguntas de unas unidades; `incluye` permite quedarse con algunos subtemas. */
function preguntasDe(unidades: LearningUnit[], incluye: (subtema: LearningUnit["subtopics"][number]) => boolean = () => true) {
  const lista: Reto[] = [];
  for (const unidad of unidades) {
    for (const subtema of unidad.subtopics) {
      if (!incluye(subtema)) continue;
      for (const pregunta of subtema.stages.demonstrate.questions ?? []) {
        lista.push({ unidad, subtopicId: subtema.id, pregunta });
      }
    }
  }
  return lista;
}

const botonHud = "btn-tactil tactil-blanco h-12 w-12 shrink-0";

function BotonHora({
  activo,
  etiqueta,
  seccion,
  onClick,
  children,
}: {
  activo: boolean;
  etiqueta: string;
  seccion: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      aria-pressed={activo}
      title={etiqueta}
      className={`btn-tactil h-12 w-12 shrink-0 ${activo ? seccion : "tactil-blanco"}`}
    >
      {children}
    </button>
  );
}

/** Tarjeta para entrar a un lugar: nombre, voz y una sola acción. */
function TarjetaLugar({ lugar, onEntrar }: { lugar: LugarValle; onEntrar: () => void }) {
  const Icono = lugar.icon;
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border-2 border-[#E8E0FF] bg-white p-3">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
        style={{ backgroundColor: lugar.colorFondo, color: lugar.colorBorde }}
      >
        <Icono className="h-7 w-7" weight="bold" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">{lugar.nombre}</h2>
        <p className="hidden truncate text-sm text-[#5B5678] sm:block">{lugar.frase}</p>
      </div>
      <BotonVoz texto={`${lugar.nombre}. ${lugar.frase}.`} etiqueta={`Escuchar: ${lugar.nombre}`} />
      <button type="button" onClick={onEntrar} className="btn-tactil tactil-cooperar h-12 shrink-0 px-4">
        Entrar
      </button>
    </div>
  );
}

/** Conversación con un guía. Es un dialog nativo: atrapa el foco y se cierra con Escape. */
function DialogoGuia({
  guia,
  reto,
  onCerrar,
  onResuelta,
  onEntrar,
}: {
  guia: PersonajeGuiaDef;
  reto: Reto | null;
  onCerrar: () => void;
  onResuelta: (id: string) => void;
  onEntrar: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (dialogo && !dialogo.open) dialogo.showModal();
    return () => dialogo?.close();
  }, []);

  const texto = reto ? guia.saludo : guia.invitacion;

  return (
    <dialog
      ref={ref}
      aria-labelledby="titulo-dialogo-guia"
      onCancel={(e) => {
        e.preventDefault();
        onCerrar();
      }}
      className="m-auto max-h-[90dvh] w-[min(32rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border-2 border-[#E8E0FF] bg-white p-4 text-[#17164F] backdrop:bg-[#17164F]/50 sm:p-5"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F2EEFF] text-[#5636D9]">
          <ChatCircleIcon weight="fill" className="h-6 w-6" aria-hidden />
        </span>
        <h2 id="titulo-dialogo-guia" className="min-w-0 flex-1 font-[family-name:var(--font-fredoka)] text-xl font-bold">
          {guia.nombre}
        </h2>
        <BotonVoz texto={texto} etiqueta="Escuchar" />
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F2EEFF] text-[#17164F] hover:bg-[#E8E0FF]"
        >
          <XIcon weight="bold" className="h-6 w-6" aria-hidden />
        </button>
      </div>

      <p className="mb-3">{texto}</p>

      {reto ? (
        <>
          {guia.id === "mateo" && reto.unidad.safetyNote ? (
            <div className="mb-3 flex items-start gap-2 rounded-xl bg-[#FEF3C7] p-3 text-sm font-semibold text-[#92400E]">
              <WarningIcon weight="fill" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <span>{reto.unidad.safetyNote}</span>
            </div>
          ) : null}

          <Pregunta
            key={reto.pregunta.id}
            pregunta={reto.pregunta}
            subtopicId={reto.subtopicId}
            onSiguiente={() => onResuelta(reto.pregunta.id)}
          />

          <Link href={`/estudiante/unidades?unidad=${reto.unidad.id}`} className="btn-tactil tactil-blanco mt-3 w-full px-4">
            Ir a esta unidad
          </Link>
        </>
      ) : (
        <button type="button" onClick={onEntrar} className="btn-tactil tactil-cooperar w-full px-5">
          Entrar
        </button>
      )}
    </dialog>
  );
}

export function ValleMundo() {
  const router = useRouter();
  const usuario = useSessionUser();

  // Lo que depende del navegador se decide ya montado: el servidor solo manda la pantalla de carga.
  const montado = useSyncExternalStore(noopSubscribe, () => true, () => false);

  // Consulta de unidades sin bloquear el primer render del valle
  const respuestaUnidades = useApi(listUnits, []);

  const [webglDisponible] = useState(() => (typeof document === "undefined" ? true : hayWebGL()));
  const [modoSimple, setModoSimple] = useState(!webglDisponible);
  const [clima, setClima] = useState<ClimaHora>("dia");
  const [calidad, setCalidad] = useState<CalidadGrafica>(() => (typeof window === "undefined" ? "alta" : calidadInicial()));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );

  const [lugarCercano, setLugarCercano] = useState<LugarValleId | null>(null);
  const [personajeCercano, setPersonajeCercano] = useState<PersonajeGuiaId | null>(null);
  const [dialogoPersonaje, setDialogoPersonaje] = useState<PersonajeGuiaId | null>(null);
  const [yaCamino, setYaCamino] = useState(false);

  const [inicio] = useState<[number, number, number]>(() => (typeof window === "undefined" ? [...INICIO_JUGADOR] : posicionInicial()));
  const posicionRef = useRef(inicio);
  const [objetivoMovimiento, setObjetivo] = useState<[number, number] | null>(null);

  const setObjetivoMovimiento = useCallback((objetivo: [number, number] | null) => {
    setObjetivo(objetivo);
    if (objetivo) setYaCamino(true);
  }, []);

  // Cada estudiante lleva su lista: en un aparato compartido no debe heredar lo que resolvió otro.
  const claveResueltas = `${CLAVE_LOCALSTORAGE_PREGUNTAS_RESUELTAS}-${usuario?.id ?? "invitado"}`;
  const guardadas = useMemo(() => (typeof window === "undefined" ? [] : leerResueltas(claveResueltas)), [claveResueltas]);
  const [nuevas, setNuevas] = useState<string[]>([]);
  const preguntasResueltas = useMemo(() => [...guardadas, ...nuevas], [guardadas, nuevas]);

  // Mismo filtro de UnidadesPublicadas, sin las unidades privadas de cada familia
  const unidadesAula = useMemo(() => {
    if (respuestaUnidades.status !== "ok") return [];
    const aula = usuario?.classroomCode ?? AULA_DEMO;
    return respuestaUnidades.data
      .filter((u) => u.status === "PUBLISHED" && u.classroomCode === aula && !u.familyStudentId)
      .reverse();
  }, [respuestaUnidades, usuario]);

  const unidadesFamilia = useMemo(() => {
    if (respuestaUnidades.status !== "ok" || !usuario?.id) return [];
    return respuestaUnidades.data.filter((u) => u.status === "PUBLISHED" && u.familyStudentId === usuario.id).reverse();
  }, [respuestaUnidades, usuario]);

  const novedades = useMemo(
    () => ({ escuela: unidadesAula.length, casa: unidadesFamilia.length }),
    [unidadesAula, unidadesFamilia],
  );

  // El próximo reto de cada guía: la primera pregunta real que todavía no se resolvió en el valle
  const retos = useMemo(() => {
    const pendiente = (lista: Reto[]) => lista.find((r) => !preguntasResueltas.includes(r.pregunta.id)) ?? null;
    return {
      elena: pendiente(preguntasDe(unidadesAula)),
      mateo: pendiente(preguntasDe(unidadesFamilia)),
      vega: pendiente(preguntasDe(unidadesAula, (s) => s.lab3DIntegration?.type === "SOLAR_SYSTEM")),
    };
  }, [unidadesAula, unidadesFamilia, preguntasResueltas]);

  const preguntasDisponibles = useMemo(
    () => ({ elena: Boolean(retos.elena), mateo: Boolean(retos.mateo), vega: Boolean(retos.vega) }),
    [retos],
  );

  useEffect(() => {
    if (!window.matchMedia) return;
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    const alCambiar = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    consulta.addEventListener("change", alCambiar);
    return () => consulta.removeEventListener("change", alCambiar);
  }, []);

  const alternarCalidad = () => {
    const nueva = calidad === "alta" ? "ligera" : "alta";
    setCalidad(nueva);
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE_CALIDAD, nueva);
    } catch {
      // La elección vale para esta visita aunque no se pueda guardar.
    }
  };

  const infoLugar = LUGARES_VALLE.find((l) => l.id === lugarCercano) ?? null;
  const infoPersonaje = PERSONAJES_GUIA.find((p) => p.id === personajeCercano) ?? null;
  const guiaEnDialogo = PERSONAJES_GUIA.find((p) => p.id === dialogoPersonaje) ?? null;

  const irAlMapaSimple = useCallback(() => {
    setModoSimple(true);
    setLugarCercano(null);
    setPersonajeCercano(null);
    setDialogoPersonaje(null);
    setObjetivo(null);
  }, []);

  const abrirDialogo = useCallback((id: PersonajeGuiaId) => {
    setObjetivo(null);
    setDialogoPersonaje(id);
  }, []);

  const alResolverPregunta = useCallback(
    (id: string) => {
      setNuevas((previas) => {
        if (previas.includes(id)) return previas;
        const actualizadas = [...previas, id];
        try {
          localStorage.setItem(claveResueltas, JSON.stringify([...guardadas, ...actualizadas]));
        } catch {
          // Sin localStorage la pregunta vale como resuelta hasta salir del valle.
        }
        return actualizadas;
      });
    },
    [claveResueltas, guardadas],
  );

  const entrarAlLugar = useCallback(
    (lugar: LugarValle) => {
      recordarLugar(lugar.id);
      router.push(lugar.ruta);
    },
    [router],
  );

  // Enter o Espacio entran al lugar cercano; E habla con el guía
  useEffect(() => {
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (modoSimple || dialogoPersonaje) return;
      // Un botón o enlace con foco responde a su propia tecla.
      if ((e.target as HTMLElement | null)?.closest?.("button, a, input, textarea, select, summary")) return;

      if ((e.key === "e" || e.key === "E") && personajeCercano) {
        e.preventDefault();
        abrirDialogo(personajeCercano);
      } else if (infoLugar && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        entrarAlLugar(infoLugar);
      }
    };
    window.addEventListener("keydown", alPresionarTecla);
    return () => window.removeEventListener("keydown", alPresionarTecla);
  }, [modoSimple, dialogoPersonaje, personajeCercano, infoLugar, entrarAlLugar, abrirDialogo]);

  if (!montado) {
    return (
      <div className="h-[100dvh] w-full">
        <Preparando />
      </div>
    );
  }

  if (modoSimple) {
    return (
      <div className="flex h-[100dvh] w-full flex-col overflow-y-auto bg-[#F7F4FF] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-3xl flex-1">
          <header className="mb-5 flex items-center justify-between gap-3">
            <h1 className="min-w-0 font-[family-name:var(--font-fredoka)] text-2xl font-bold text-[#17164F] sm:text-3xl">
              Valle de los Saberes
            </h1>
            <div className="flex shrink-0 items-center gap-2">
              {webglDisponible ? (
                <button
                  type="button"
                  onClick={() => setModoSimple(false)}
                  aria-label="Ver en 3D"
                  title="Ver en 3D"
                  className={`${botonHud} sm:w-auto sm:gap-2 sm:px-3`}
                >
                  <CubeIcon weight="bold" className="h-6 w-6 text-[#5636D9]" aria-hidden />
                  <span className="hidden sm:inline">Ver en 3D</span>
                </button>
              ) : null}
              <BotonSalir href="/estudiante/jugar" etiqueta="Volver a juegos" />
            </div>
          </header>

          <nav aria-label="Lugares del Valle" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {LUGARES_VALLE.map((lugar) => {
              const Icono = lugar.icon;
              const cantidad = lugar.id === "escuela" ? novedades.escuela : lugar.id === "casa" ? novedades.casa : 0;
              return (
                <div key={lugar.id} onClick={() => recordarLugar(lugar.id)} className="relative flex flex-col">
                  <Mosaico href={lugar.ruta} etiqueta={lugar.nombre} descripcion={lugar.descripcion} seccion={lugar.seccion}>
                    <span style={{ color: lugar.colorBorde }}>
                      <Icono weight="duotone" className="h-16 w-16" />
                    </span>
                  </Mosaico>

                  {cantidad > 0 ? (
                    <div className="pointer-events-none absolute top-2 right-2 flex items-center gap-1 rounded-full bg-[#5636D9] px-2 py-0.5 text-xs font-bold text-white">
                      <SparkleIcon weight="fill" className="h-3 w-3 text-[#FFC928]" aria-hidden />
                      <span>
                        {cantidad} {cantidad === 1 ? "unidad" : "unidades"}
                      </span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#E6F2FF]">
      <ValleEscena
        clima={clima}
        calidad={calidad}
        prefersReducedMotion={prefersReducedMotion}
        pausado={Boolean(dialogoPersonaje)}
        lugarCercano={lugarCercano}
        onLugarCercanoChange={setLugarCercano}
        personajeCercano={personajeCercano}
        onPersonajeCercanoChange={setPersonajeCercano}
        novedades={novedades}
        preguntasDisponibles={preguntasDisponibles}
        posicionRef={posicionRef}
        objetivoMovimiento={objetivoMovimiento}
        setObjetivoMovimiento={setObjetivoMovimiento}
        onWebGLPerdido={irAlMapaSimple}
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 sm:p-4">
        <button
          type="button"
          onClick={irAlMapaSimple}
          aria-label="Mapa simple"
          title="Mapa simple"
          className={`pointer-events-auto ${botonHud} sm:w-auto sm:gap-2 sm:px-3`}
        >
          <MapTrifoldIcon weight="bold" className="h-6 w-6 text-[#2472CC]" aria-hidden />
          <span className="hidden sm:inline">Mapa simple</span>
        </button>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <BotonHora activo={clima === "dia"} etiqueta="Día" seccion="tactil-juego" onClick={() => setClima("dia")}>
            <SunIcon weight="fill" className="h-6 w-6" aria-hidden />
          </BotonHora>
          <BotonHora activo={clima === "atardecer"} etiqueta="Atardecer" seccion="tactil-refuerzo" onClick={() => setClima("atardecer")}>
            <SunHorizonIcon weight="fill" className="h-6 w-6" aria-hidden />
          </BotonHora>
          <BotonHora activo={clima === "noche"} etiqueta="Noche" seccion="tactil-magia" onClick={() => setClima("noche")}>
            <MoonIcon weight="fill" className="h-6 w-6" aria-hidden />
          </BotonHora>
          <button
            type="button"
            onClick={alternarCalidad}
            aria-label={`Calidad: ${calidad === "alta" ? "Alta" : "Ligera"}`}
            title={`Calidad: ${calidad === "alta" ? "Alta" : "Ligera"}`}
            className={`${botonHud} sm:w-auto sm:gap-1.5 sm:px-3`}
          >
            <SparkleIcon weight={calidad === "alta" ? "fill" : "regular"} className="h-6 w-6 text-[#C98F00]" aria-hidden />
            <span className="hidden text-sm sm:inline">{calidad === "alta" ? "Alta" : "Ligera"}</span>
          </button>
          <BotonSalir href="/estudiante/jugar" etiqueta="Volver a juegos" />
        </div>
      </header>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex flex-col items-center gap-2">
        {!yaCamino && !infoLugar && !infoPersonaje ? (
          <p className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#17164F]">Toca el suelo para caminar</p>
        ) : null}

        {infoPersonaje && !dialogoPersonaje ? (
          <button
            type="button"
            onClick={() => abrirDialogo(infoPersonaje.id)}
            className="btn-tactil tactil-magia pointer-events-auto h-12 gap-2 px-4"
          >
            <ChatCircleIcon weight="fill" className="h-6 w-6" aria-hidden />
            <span>Hablar con {infoPersonaje.nombre}</span>
          </button>
        ) : null}

        {infoLugar && !dialogoPersonaje ? (
          <div className="pointer-events-auto flex w-full justify-center">
            <TarjetaLugar lugar={infoLugar} onEntrar={() => entrarAlLugar(infoLugar)} />
          </div>
        ) : null}
      </div>

      {guiaEnDialogo ? (
        <DialogoGuia
          guia={guiaEnDialogo}
          reto={retos[guiaEnDialogo.id]}
          onCerrar={() => setDialogoPersonaje(null)}
          onResuelta={alResolverPregunta}
          onEntrar={() => {
            const destino = LUGARES_VALLE.find((l) => l.id === guiaEnDialogo.lugarId);
            setDialogoPersonaje(null);
            if (destino) entrarAlLugar(destino);
          }}
        />
      ) : null}
    </div>
  );
}
