"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { type CalidadGrafica, type ClimaHora, type LugarValleId } from "./valleData";
import { ValleEntorno } from "./ValleEntorno";
import { ValleEdificios } from "./ValleEdificios";

interface Props {
  clima: ClimaHora;
  calidad: CalidadGrafica;
  prefersReducedMotion: boolean;
  lugarCercano: LugarValleId | null;
  onLugarCercanoChange: (id: LugarValleId | null) => void;
  posicionJugador: [number, number, number];
  setPosicionJugador: (pos: [number, number, number]) => void;
  objetivoMovimiento: [number, number] | null;
  setObjetivoMovimiento: (obj: [number, number] | null) => void;
  onWebGLPerdido: () => void;
}

export default function ValleEscena({
  clima,
  calidad,
  prefersReducedMotion,
  lugarCercano,
  onLugarCercanoChange,
  posicionJugador,
  setPosicionJugador,
  objetivoMovimiento,
  setObjetivoMovimiento,
  onWebGLPerdido,
}: Props) {
  // Pausar el bucle de render cuando la pestaña pasa a segundo plano (document.hidden === true)
  const [estaOculto, setEstaOculto] = useState(false);

  useEffect(() => {
    const alCambiarVisibilidad = () => {
      setEstaOculto(document.hidden);
    };
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    return () => {
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows={calidad === "alta"}
      frameloop={estaOculto ? "never" : "always"}
      camera={{ position: [0, 16, 17], fov: 42, near: 0.5, far: 220 }}
      gl={{
        antialias: calidad === "alta",
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        const domElement = gl.domElement;
        const alPerderContexto = (e: Event) => {
          e.preventDefault();
          onWebGLPerdido();
        };
        domElement.addEventListener("webglcontextlost", alPerderContexto);
      }}
      className="h-full w-full touch-none select-none"
    >
      {/* Plano receptor de clics y toques para caminar */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onPointerDown={(e) => {
          e.stopPropagation();
          setObjetivoMovimiento([e.point.x, e.point.z]);
        }}
      >
        <planeGeometry args={[75, 75]} />
        <meshBasicMaterial />
      </mesh>

      {/* Atmósfera, cielo físico, sol, nubes, terreno, agua y vegetación */}
      <ValleEntorno
        clima={clima}
        calidad={calidad}
        prefersReducedMotion={prefersReducedMotion}
        posicionJugador={posicionJugador}
      />

      {/* Edificios arquitectónicos detallados, avatar y cámara con amortiguación */}
      <ValleEdificios
        clima={clima}
        calidad={calidad}
        prefersReducedMotion={prefersReducedMotion}
        lugarCercano={lugarCercano}
        onLugarCercanoChange={onLugarCercanoChange}
        posicionJugador={posicionJugador}
        setPosicionJugador={setPosicionJugador}
        objetivoMovimiento={objetivoMovimiento}
        setObjetivoMovimiento={setObjetivoMovimiento}
      />
    </Canvas>
  );
}

