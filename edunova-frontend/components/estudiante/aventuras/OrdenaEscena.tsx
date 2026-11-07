"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { PLANETAS, RADIO_SOL, type IdPlaneta } from "./espacioData";
import { HtmlInicial } from "./HtmlInicial";
import { GalaxiaEspiral, PlanetaVisual, SolVisual } from "./espacioVisual";

type Props = {
  orden: IdPlaneta[];
  bandeja: IdPlaneta[];
  colocados: IdPlaneta[];
  onSoltar: (id: IdPlaneta, orbita: IdPlaneta | null) => void;
};

const PRIMERA_ORBITA = 3.8;
const SEPARACION = 2;
const TOLERANCIA = 1;
const TRAMO_BANDEJA = 3.2;

const radioOrbita = (indice: number) => PRIMERA_ORBITA + indice * SEPARACION;
const radioVisual = (id: IdPlaneta) => Math.min(1.15, 0.5 + (PLANETAS.find((p) => p.id === id)?.radio ?? 1) * 0.2);

function Mundo({ orden, bandeja, colocados, onSoltar }: Props) {
  const leerEscena = useThree((estado) => estado.get);
  const planetas = useRef(new Map<IdPlaneta, THREE.Group>());
  const aros = useRef(new Map<IdPlaneta, THREE.MeshBasicMaterial>());
  const arrastrado = useRef<IdPlaneta | null>(null);
  const eventos = useRef({ onSoltar });
  const radioMayor = radioOrbita(orden.length - 1);
  const filaBandeja = radioMayor + 3.2;

  const herramientas = useMemo(
    () => ({
      plano: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      punto: new THREE.Vector3(),
      destino: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    eventos.current = { onSoltar };
  }, [onSoltar]);

  useEffect(() => {
    const soltar = () => {
      const id = arrastrado.current;
      if (!id) return;
      arrastrado.current = null;
      const planeta = planetas.current.get(id);
      if (!planeta) return;
      // Cuenta dónde está el dedo al soltar, no el planeta, que en un equipo lento va atrasado.
      const { raycaster, pointer, camera } = leerEscena();
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(herramientas.plano, herramientas.punto)) planeta.position.copy(herramientas.punto);
      const distancia = Math.hypot(planeta.position.x, planeta.position.z);
      const cercana = orden.find((_, i) => Math.abs(distancia - radioOrbita(i)) < TOLERANCIA) ?? null;
      eventos.current.onSoltar(id, cercana);
    };
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
    return () => {
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
    };
  }, [orden, herramientas, leerEscena]);

  useFrame((estado, delta) => {
    const dt = Math.min(delta, 0.05);
    const { plano, punto, destino } = herramientas;

    // Encuadre: entra todo el sistema y la bandeja, también en un teléfono vertical.
    const aspecto = estado.size.width / estado.size.height;
    const distancia = Math.max(radioMayor + 7, (radioMayor + 2.5) / aspecto) / 0.414;
    estado.camera.position.set(0, distancia * 0.88, distancia * 0.47);
    estado.camera.lookAt(0, 0, 2);

    const suelto = arrastrado.current;
    if (suelto) {
      estado.raycaster.setFromCamera(estado.pointer, estado.camera);
      if (estado.raycaster.ray.intersectPlane(plano, punto)) planetas.current.get(suelto)?.position.copy(punto);
    }

    bandeja.forEach((id, i) => {
      const planeta = planetas.current.get(id);
      if (!planeta || id === suelto) return;
      const indice = orden.indexOf(id);
      if (colocados.includes(id)) {
        const angulo = -0.4 - indice * 0.78 + estado.clock.elapsedTime * 0.12;
        destino.set(Math.cos(angulo) * radioOrbita(indice), 0, Math.sin(angulo) * radioOrbita(indice));
      } else {
        destino.set((i - (bandeja.length - 1) / 2) * TRAMO_BANDEJA, 0, filaBandeja);
      }
      planeta.position.lerp(destino, 1 - Math.exp(-dt * 7));
    });

    const distanciaSuelto = suelto ? Math.hypot(planetas.current.get(suelto)?.position.x ?? 0, planetas.current.get(suelto)?.position.z ?? 0) : -99;
    orden.forEach((id, i) => {
      const aro = aros.current.get(id);
      if (!aro) return;
      const encima = Math.abs(distanciaSuelto - radioOrbita(i)) < TOLERANCIA;
      aro.opacity = encima ? 0.95 : colocados.includes(id) ? 0.4 : 0.2;
      aro.color.set(encima ? "#FFC928" : colocados.includes(id) ? "#2DBE70" : "#FFFFFF");
    });
  });

  function agarrar(id: IdPlaneta, e: ThreeEvent<PointerEvent>) {
    if (colocados.includes(id)) return;
    e.stopPropagation();
    arrastrado.current = id;
  }

  return (
    <>
      <ambientLight intensity={1.1} color="#D6DCFF" />
      <directionalLight position={[0, 12, 14]} intensity={1.2} />
      <pointLight position={[0, 6, 0]} intensity={2.2} decay={0} color="#FFF2DD" />
      <Stars radius={90} depth={30} count={1500} factor={3.5} fade speed={0.5} />
      <GalaxiaEspiral />

      <group scale={2.1 / RADIO_SOL}>
        <SolVisual />
      </group>
      <Html center position={[0, 2.8, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
        <span className="rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white">Sol</span>
      </Html>

      {orden.map((id, i) => (
        <mesh key={id} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radioOrbita(i) - 0.09, radioOrbita(i) + 0.09, 128]} />
          <meshBasicMaterial
            ref={(m) => {
              if (m) aros.current.set(id, m);
            }}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {bandeja.map((id, i) => {
        const datos = PLANETAS.find((p) => p.id === id)!;
        const radio = radioVisual(id);
        return (
          <group
            key={id}
            position={[(i - (bandeja.length - 1) / 2) * TRAMO_BANDEJA, 0, filaBandeja]}
            ref={(g) => {
              if (g) planetas.current.set(id, g);
            }}
          >
            <PlanetaVisual id={id} radio={radio}>
              {/* Zona de agarre más grande que el planeta, para dedos pequeños. */}
              <mesh onPointerDown={(e) => agarrar(id, e)}>
                <sphereGeometry args={[1.5, 12, 10]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
              <Html center position={[0, 0, radio + 0.9]} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
                <span className="rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold whitespace-nowrap text-white">
                  {datos.nombre}
                </span>
              </Html>
            </PlanetaVisual>
          </group>
        );
      })}
    </>
  );
}

export default function OrdenaEscena(props: Props) {
  return (
    <div className="isolate h-full w-full touch-none select-none">
      <Canvas camera={{ position: [0, 30, 16], fov: 45 }} dpr={[1, 1.5]}>
        <color attach="background" args={["#07061F"]} />
        <HtmlInicial />
        <Mundo {...props} />
      </Canvas>
    </div>
  );
}
