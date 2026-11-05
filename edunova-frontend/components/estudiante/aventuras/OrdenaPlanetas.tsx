"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAgeTier } from "@/lib/age-tier";
import { soundManager } from "@/components/estudiante/juego/soundEffects";
import { Burbuja, MarcoJuego, PantallaFin, PantallaInicio, SinWebGL, decir, hayWebGL, mezclar, usePremio } from "./comun";
import { PLANETAS, PLANETAS_ORDENA, type IdPlaneta } from "./espacioData";

const OrdenaEscena = dynamic(() => import("./OrdenaEscena"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-white/70">Preparando el espacio…</div>,
});

const XP_POR_PLANETA = 20;
const COINS_POR_PLANETA = 5;

const nombreDe = (id: IdPlaneta) => PLANETAS.find((p) => p.id === id)?.nombre ?? id;

/** Plan, sección 6: en 7-9 años la teoría se aprende arrastrando planetas. */
export function OrdenaPlanetas() {
  const [tier] = useAgeTier();
  const orden = PLANETAS_ORDENA[tier];
  const premiar = usePremio("SOLAR_SYSTEM", "ordena");
  const [soportado] = useState(() => (typeof document === "undefined" ? true : hayWebGL()));

  const [bandeja, setBandeja] = useState<IdPlaneta[] | null>(null);
  const [colocados, setColocados] = useState<IdPlaneta[]>([]);
  const [intentos, setIntentos] = useState(0);
  const [mensaje, setMensaje] = useState("Arrastra un planeta hasta su órbita.");
  const [aviso, setAviso] = useState<string | null>(null);

  const xp = orden.length * XP_POR_PLANETA;
  const coins = orden.length * COINS_POR_PLANETA;

  function empezar() {
    soundManager.init();
    setBandeja(mezclar(orden));
    setColocados([]);
    setIntentos(0);
    setMensaje("Arrastra un planeta hasta su órbita.");
    setAviso(null);
  }

  async function terminar() {
    soundManager.playLevelUp();
    setAviso("Guardando tus puntos…");
    decir(`Lo lograste. El orden es: ${orden.map(nombreDe).join(", ")}.`);
    setAviso(await premiar(xp, coins));
  }

  function soltar(id: IdPlaneta, orbita: IdPlaneta | null) {
    if (!orbita) {
      setMensaje(`Suelta ${nombreDe(id)} sobre una órbita.`);
      return;
    }
    if (orbita !== id) {
      setIntentos((n) => n + 1);
      soundManager.playWrong();
      const masCerca = orden.indexOf(id) < orden.indexOf(orbita);
      setMensaje(`Casi. ${nombreDe(id)} está más ${masCerca ? "cerca del" : "lejos del"} Sol. ¡Prueba otra vez!`);
      return;
    }
    soundManager.playCorrect();
    setMensaje(`¡Muy bien! ${PLANETAS.find((p) => p.id === id)?.dato ?? ""}`);
    const nuevos = [...colocados, id];
    setColocados(nuevos);
    if (nuevos.length === orden.length) void terminar();
  }

  return (
    <MarcoJuego titulo="Ordena los Planetas">
      {!soportado ? <SinWebGL /> : null}
      {soportado && bandeja ? <OrdenaEscena orden={orden} bandeja={bandeja} colocados={colocados} onSoltar={soltar} /> : null}

      {bandeja && !aviso ? (
        <Burbuja
          etiqueta={`${colocados.length} de ${orden.length} en su lugar`}
          texto={mensaje}
          onEscuchar={() => decir(mensaje)}
        />
      ) : null}

      {!bandeja ? (
        <PantallaInicio
          titulo="¿Quién va primero?"
          texto="Lleva cada planeta a su órbita, desde el más cercano al Sol hasta el más lejano."
          ayuda="Toca un planeta, arrástralo hasta su órbita y suéltalo."
          onEmpezar={empezar}
        />
      ) : null}

      {aviso ? (
        <PantallaFin
          titulo="¡Sistema Solar en orden!"
          texto={intentos === 0 ? "¡Sin ningún error!" : `Lo lograste con ${intentos} ${intentos === 1 ? "reintento" : "reintentos"}.`}
          xp={xp}
          coins={coins}
          aviso={aviso}
          onRepetir={empezar}
        />
      ) : null}
    </MarcoJuego>
  );
}
