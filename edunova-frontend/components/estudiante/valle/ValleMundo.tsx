"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  type CalidadGrafica,
  type ClimaHora,
  type LugarValleId,
  CLAVE_LOCALSTORAGE_CALIDAD,
  CLAVE_LOCALSTORAGE_ULTIMO_LUGAR,
  LUGARES_VALLE,
} from "./valleData";
import { hayWebGL } from "@/components/estudiante/aventuras/comun";
import { BotonSalir, Mosaico } from "@/components/estudiante/shared/kit";
import {
  CubeIcon,
  ListIcon,
  SparkleIcon,
} from "@/components/ui/icons";

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

  // Acción para entrar al lugar activo (guarda último lugar y navega)
  const entrarAlLugar = useCallback((lugar: (typeof LUGARES_VALLE)[0]) => {
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE_ULTIMO_LUGAR, lugar.id);
    } catch {
      // Ignorar fallo
    }
    router.push(lugar.ruta);
  }, [router]);

  // Tecla Enter o Espacio para entrar al lugar si la tarjeta está visible
  useEffect(() => {
    const alPresionarTecla = (e: KeyboardEvent) => {
      if (!infoLugar) return;
      if (e.key === "Enter" || e.key === " ") {
        // Evitar que la barra espaciadora haga scroll en la página
        e.preventDefault();
        entrarAlLugar(infoLugar);
      }
    };
    window.addEventListener("keydown", alPresionarTecla);
    return () => {
      window.removeEventListener("keydown", alPresionarTecla);
    };
  }, [infoLugar, entrarAlLugar]);

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

          {/* GUÍA TÁCTIL / TECLADO INFERIOR SUTIL (cuando no hay tarjeta abierta) */}
          {!infoLugar && (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4">
              <p className="rounded-full bg-white/80 px-4 py-1.5 text-xs font-medium text-[#17164F] backdrop-blur-sm sm:text-sm">
                Toca el suelo o usa las flechas / WASD para caminar
              </p>
            </div>
          )}

          {/* TARJETA CONTEXTUAL DEL LUGAR (HUD INFERIOR) */}
          {infoLugar && (
            <div className="pointer-events-auto absolute inset-x-4 bottom-4 z-30 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
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
