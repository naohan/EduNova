"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import { useAgeTier } from "@/lib/age-tier";
import { soundManager } from "@/components/estudiante/juego/soundEffects";
import { StarIcon } from "@/components/ui/icons";
import { Burbuja, MarcoJuego, PantallaFin, PantallaInicio, SinWebGL, decir, hayWebGL, mezclar, usePremio } from "./comun";
import { CONFIG_PILOTO, LIMITE_MUNDO, PLANETAS, RADIO_SOL, posicionDe, type IdPlaneta } from "./espacioData";

const PilotoEscena = dynamic(() => import("./PilotoEscena"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-white/70">Preparando el cohete…</div>,
});

const XP_MISION = 150;
const COINS_MISION = 50;
const PAUSA_LLEGADA_MS = 2600;

type Fin = { xp: number; coins: number; aviso: string };

/** Los planetas lejanos quedan fuera de la pantalla: el radar dice hacia dónde volar. */
function Radar({
  marcador,
  objetivo,
}: {
  marcador: RefObject<SVGCircleElement | null>;
  objetivo: IdPlaneta | null;
}) {
  const borde = LIMITE_MUNDO + 5;
  return (
    <svg
      viewBox={`${-borde} ${-borde} ${borde * 2} ${borde * 2}`}
      role="img"
      aria-label="Radar: tu cohete y los planetas"
      className="pointer-events-none absolute right-3 bottom-3 z-10 h-28 w-28 rounded-full border-2 border-white/25 bg-black/70 sm:h-40 sm:w-40"
    >
      <circle r={RADIO_SOL} fill="#FDB813" />
      {PLANETAS.map((p) => {
        const [x, z] = posicionDe(p);
        return (
          <g key={p.id}>
            {p.id === objetivo ? <circle cx={x} cy={z} r={9} fill="none" stroke="#FFC928" strokeWidth={2.5} /> : null}
            <circle data-planeta={p.id} cx={x} cy={z} r={Math.max(3.5, p.radio * 1.4)} fill={p.color} />
          </g>
        );
      })}
      <circle ref={marcador} data-nave r={4.5} fill="#FFFFFF" stroke="#E85D5D" strokeWidth={2.5} />
    </svg>
  );
}

/** HU-03: misión guiada en 3D. El estudiante pilota el cohete hasta el planeta de cada pista. */
export function PilotoEspacial() {
  const [tier] = useAgeTier();
  const config = CONFIG_PILOTO[tier];
  const premiar = usePremio("SOLAR_SYSTEM", "piloto");
  const [soportado] = useState(() => (typeof document === "undefined" ? true : hayWebGL()));

  const [objetivos, setObjetivos] = useState<IdPlaneta[] | null>(null);
  const [ronda, setRonda] = useState(0);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [estrellas, setEstrellas] = useState(0);
  const [celebracion, setCelebracion] = useState(0);
  const [fin, setFin] = useState<Fin | null>(null);
  const celebrando = useRef(false);
  const totalEstrellas = useRef(0);
  const marcador = useRef<SVGCircleElement>(null);

  const actual = PLANETAS.find((p) => p.id === objetivos?.[ronda]) ?? null;
  const pista = actual?.pistas[tier] ?? "";

  useEffect(() => {
    if (pista && !fin && config.vozAutomatica) decir(pista);
  }, [pista, fin, config.vozAutomatica]);

  function empezar() {
    soundManager.init();
    celebrando.current = false;
    setObjetivos(mezclar(PLANETAS.map((p) => p.id)).slice(0, config.rondas));
    setRonda(0);
    setMensaje(null);
    setEstrellas(0);
    totalEstrellas.current = 0;
    setFin(null);
  }

  async function terminar() {
    const coins = COINS_MISION + totalEstrellas.current;
    setFin({ xp: XP_MISION, coins, aviso: "Guardando tus puntos…" });
    soundManager.playLevelUp();
    const aviso = await premiar(XP_MISION, coins);
    setFin({ xp: XP_MISION, coins, aviso });
  }

  function tocarPlaneta(id: IdPlaneta) {
    if (!actual || fin || celebrando.current) return;
    const tocado = PLANETAS.find((p) => p.id === id);
    if (!tocado) return;

    if (id !== actual.id) {
      soundManager.playWrong();
      setMensaje(`Ese es ${tocado.nombre}. ${pista}`);
      return;
    }
    celebrando.current = true;
    soundManager.playCorrect();
    setCelebracion((n) => n + 1);
    const texto = `¡Llegaste a ${tocado.nombre}! ${tocado.dato}`;
    setMensaje(texto);
    if (config.vozAutomatica) decir(texto);
    setTimeout(() => {
      celebrando.current = false;
      setMensaje(null);
      if (ronda + 1 >= config.rondas) void terminar();
      else setRonda(ronda + 1);
    }, PAUSA_LLEGADA_MS);
  }

  function tomarEstrella() {
    if (!objetivos || fin) return;
    soundManager.playCoin();
    totalEstrellas.current += 1;
    setEstrellas(totalEstrellas.current);
  }

  return (
    <MarcoJuego titulo="Piloto Espacial">
      {soportado ? (
        <PilotoEscena
          config={config}
          objetivo={actual?.id ?? null}
          celebracion={celebracion}
          onPlaneta={tocarPlaneta}
          onEstrella={tomarEstrella}
          onChoque={() => soundManager.playHeartLost()}
          marcador={marcador}
        />
      ) : (
        <SinWebGL />
      )}

      {objetivos && !fin ? (
        <>
          <Burbuja
            etiqueta={`Misión ${ronda + 1} de ${config.rondas}`}
            texto={mensaje ?? pista}
            onEscuchar={() => decir(mensaje ?? pista)}
          />
          <Radar marcador={marcador} objetivo={config.flecha ? (actual?.id ?? null) : null} />
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 font-bold">
            <StarIcon weight="fill" className="h-5 w-5 text-[#FFC928]" aria-hidden />
            <span aria-label={`${estrellas} estrellas`}>{estrellas}</span>
          </div>
        </>
      ) : null}

      {!objetivos ? (
        <PantallaInicio
          titulo="¡Sube al cohete!"
          texto="Lee la pista y vuela hasta el planeta correcto. Recoge todas las estrellas que puedas."
          ayuda="Mantén presionado hacia donde quieres ir, o usa las flechas del teclado."
          onEmpezar={empezar}
        />
      ) : null}

      {fin ? (
        <PantallaFin
          titulo="¡Misión cumplida!"
          texto={`Visitaste ${config.rondas} planetas y recogiste ${estrellas} ${estrellas === 1 ? "estrella" : "estrellas"}.`}
          xp={fin.xp}
          coins={fin.coins}
          aviso={fin.aviso}
          onRepetir={empezar}
        />
      ) : null}
    </MarcoJuego>
  );
}
