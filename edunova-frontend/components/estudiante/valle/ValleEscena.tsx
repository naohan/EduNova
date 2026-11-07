"use client";

import { useEffect, useState, type RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import {
  destinoAlcanzable,
  type CalidadGrafica,
  type ClimaHora,
  type LugarValleId,
  type PersonajeGuiaId,
} from "./valleData";
import { ValleEntorno } from "./ValleEntorno";
import { ValleEdificios } from "./ValleEdificios";

interface Props {
  clima: ClimaHora;
  calidad: CalidadGrafica;
  prefersReducedMotion: boolean;
  pausado: boolean;
  lugarCercano: LugarValleId | null;
  onLugarCercanoChange: (id: LugarValleId | null) => void;
  personajeCercano: PersonajeGuiaId | null;
  onPersonajeCercanoChange: (id: PersonajeGuiaId | null) => void;
  novedades: { escuela: number; casa: number };
  preguntasDisponibles: { elena: boolean; mateo: boolean; vega: boolean };
  posicionRef: RefObject<[number, number, number]>;
  objetivoMovimiento: [number, number] | null;
  setObjetivoMovimiento: (obj: [number, number] | null) => void;
  onWebGLPerdido: () => void;
}

export default function ValleEscena({
  clima,
  calidad,
  prefersReducedMotion,
  pausado,
  lugarCercano,
  onLugarCercanoChange,
  personajeCercano,
  onPersonajeCercanoChange,
  novedades,
  preguntasDisponibles,
  posicionRef,
  objetivoMovimiento,
  setObjetivoMovimiento,
  onWebGLPerdido,
}: Props) {
  // Pausar el bucle de render cuando la pestaña pasa a segundo plano
  const [estaOculto, setEstaOculto] = useState(false);

  useEffect(() => {
    const alCambiarVisibilidad = () => setEstaOculto(document.hidden);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    return () => document.removeEventListener("visibilitychange", alCambiarVisibilidad);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows={calidad === "alta"}
      frameloop={estaOculto ? "never" : "always"}
      camera={{ position: [0, 8, 19], fov: 50, near: 0.5, far: 280 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onWebGLPerdido();
        });
      }}
      // isolate: los carteles de drei tienen su propio z-index y sin esto taparían el HUD y los diálogos.
      className="isolate h-full w-full touch-none select-none"
    >
      {/* Plano invisible que recibe los toques para caminar */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
        onPointerDown={(e) => {
          e.stopPropagation();
          setObjetivoMovimiento(destinoAlcanzable(e.point.x, e.point.z));
        }}
      >
        <planeGeometry args={[150, 150]} />
        <meshBasicMaterial />
      </mesh>

      <ValleEntorno clima={clima} calidad={calidad} prefersReducedMotion={prefersReducedMotion} />

      <ValleEdificios
        clima={clima}
        calidad={calidad}
        prefersReducedMotion={prefersReducedMotion}
        pausado={pausado}
        lugarCercano={lugarCercano}
        onLugarCercanoChange={onLugarCercanoChange}
        personajeCercano={personajeCercano}
        onPersonajeCercanoChange={onPersonajeCercanoChange}
        novedades={novedades}
        preguntasDisponibles={preguntasDisponibles}
        posicionRef={posicionRef}
        objetivoMovimiento={objetivoMovimiento}
        setObjetivoMovimiento={setObjetivoMovimiento}
      />
    </Canvas>
  );
}
