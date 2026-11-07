"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useAgeTier } from "@/lib/age-tier";
import { soundManager } from "@/components/estudiante/juego/soundEffects";
import { Burbuja, MarcoJuego, PantallaFin, PantallaInicio, SinWebGL, decir, hayWebGL, mezclar, usePremio } from "./comun";
import { CASOS, CONFIG_DOCTOR, ORGANOS, type Caso, type IdOrgano } from "./cuerpoData";
import { marcaDeTiempo, msDesde, registrarEvento } from "@/lib/api/learning-events";

const CuerpoEscena = dynamic(() => import("./CuerpoEscena"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-white/70">Preparando el cuerpo…</div>,
});

const XP_POR_CASO = 30;
const COINS_POR_CASO = 10;
const PAUSA_CASO_MS = 3200;

type Fin = { aviso: string };

/** Plan, sección 4: Doctor Detective. Un caso cotidiano y el estudiante toca los órganos en 3D. */
export function DoctorDetective() {
  const [tier] = useAgeTier();
  const config = CONFIG_DOCTOR[tier];
  const premiar = usePremio("HUMAN_BODY", "doctor");
  const [soportado] = useState(() => (typeof document === "undefined" ? true : hayWebGL()));

  const [casos, setCasos] = useState<Caso[] | null>(null);
  const [ronda, setRonda] = useState(0);
  const [encontrados, setEncontrados] = useState<IdOrgano[]>([]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [fin, setFin] = useState<Fin | null>(null);
  const resuelto = useRef(false);
  const attemptRef = useRef(1);
  const inicioRef = useRef(0);
  const bloqueadoRef = useRef(false);

  const caso = casos?.[ronda] ?? null;
  const texto = mensaje ?? caso?.texto ?? "";
  const xp = (casos?.length ?? 0) * XP_POR_CASO;
  const coins = (casos?.length ?? 0) * COINS_POR_CASO;

  useEffect(() => {
    if (caso && !fin && config.vozAutomatica) decir(caso.texto);
  }, [caso, fin, config.vozAutomatica]);

  function empezar() {
    soundManager.init();
    resuelto.current = false;
    attemptRef.current = 1;
    inicioRef.current = marcaDeTiempo();
    bloqueadoRef.current = false;
    const disponibles = CASOS.filter((c) => !config.soloFaciles || !c.dificil);
    setCasos(mezclar(disponibles).slice(0, config.rondas));
    setRonda(0);
    setEncontrados([]);
    setMensaje(null);
    setFin(null);
  }

  async function terminar(total: number) {
    soundManager.playLevelUp();
    setFin({ aviso: "Guardando tus puntos…" });
    const aviso = await premiar(total * XP_POR_CASO, total * COINS_POR_CASO);
    setFin({ aviso });
  }

  function tocar(id: IdOrgano) {
    if (!caso || !casos || fin || resuelto.current || encontrados.includes(id) || bloqueadoRef.current) return;
    bloqueadoRef.current = true;
    setTimeout(() => {
      bloqueadoRef.current = false;
    }, 400);

    const esCorrecto = caso.organos.includes(id);
    const questionId = `lab-doctor-${caso.id}`;
    const timeMs = msDesde(inicioRef.current);
    const intentoActual = attemptRef.current;

    void registrarEvento({
      activity: "LAB_3D",
      correct: esCorrecto,
      questionId,
      attempt: intentoActual,
      hintsUsed: 0,
      timeMs,
    });

    if (!esCorrecto) {
      attemptRef.current += 1;
      soundManager.playWrong();
      setMensaje(`Ese órgano ${ORGANOS[id].funcion}. Sigue investigando: ${caso.texto}`);
      return;
    }
    soundManager.playCorrect();
    const nuevos = [...encontrados, id];
    setEncontrados(nuevos);
    const faltan = caso.organos.filter((o) => !nuevos.includes(o)).length;
    if (faltan > 0) {
      setMensaje(`¡Bien! Falta ${faltan === 1 ? "1 órgano" : `${faltan} órganos`}. ${caso.texto}`);
      return;
    }
    resuelto.current = true;
    setMensaje(`¡Caso resuelto! ${caso.explicacion}`);
    if (config.vozAutomatica) decir(caso.explicacion);
    setTimeout(() => {
      resuelto.current = false;
      attemptRef.current = 1;
      inicioRef.current = marcaDeTiempo();
      bloqueadoRef.current = false;
      setEncontrados([]);
      setMensaje(null);
      if (ronda + 1 >= casos.length) void terminar(casos.length);
      else setRonda(ronda + 1);
    }, PAUSA_CASO_MS);
  }

  return (
    <MarcoJuego titulo="Doctor Detective">
      {soportado ? <CuerpoEscena encontrados={encontrados} nombres={config.nombres} onTocar={tocar} /> : <SinWebGL />}

      {casos && !fin ? (
        <Burbuja etiqueta={`Caso ${ronda + 1} de ${casos.length}`} texto={texto} onEscuchar={() => decir(texto)} />
      ) : null}

      {!casos ? (
        <PantallaInicio
          titulo="¡Se busca doctor!"
          texto="Lee cada caso y toca el órgano que lo explica. Si te equivocas, aprendes qué hace ese órgano."
          ayuda="Toca un órgano para elegirlo. Arrastra para girar el cuerpo y ver los que están atrás."
          onEmpezar={empezar}
        />
      ) : null}

      {fin ? (
        <PantallaFin
          titulo="¡Eres un gran doctor!"
          texto={`Resolviste ${casos?.length ?? 0} casos.`}
          xp={xp}
          coins={coins}
          aviso={fin.aviso}
          onRepetir={empezar}
        />
      ) : null}
    </MarcoJuego>
  );
}
