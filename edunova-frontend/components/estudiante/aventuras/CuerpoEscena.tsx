"use client";

import { useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ORGANOS, type IdOrgano } from "./cuerpoData";
import { HtmlInicial } from "./HtmlInicial";

type Props = {
  encontrados: IdOrgano[];
  nombres: boolean;
  onTocar: (id: IdOrgano) => void;
};

const MOVIMIENTO_MAXIMO_PX = 8; // más que esto es girar el cuerpo, no tocar un órgano
const sinToque = () => null;

function Piel({ children, ...props }: { children: ReactNode } & React.ComponentProps<"mesh">) {
  return (
    <mesh {...props} raycast={sinToque}>
      {children}
      <meshStandardMaterial color="#9CC9FF" transparent opacity={0.17} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Silueta() {
  return (
    <group>
      <Piel position={[0, 3, 0]} scale={[0.85, 0.95, 0.85]}>
        <sphereGeometry args={[0.85, 28, 22]} />
      </Piel>
      <Piel position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.28, 0.32, 0.5, 16]} />
      </Piel>
      <Piel position={[0, 0.75, 0]} scale={[1, 1, 0.62]}>
        <capsuleGeometry args={[1.02, 1.3, 10, 24]} />
      </Piel>
      {[-1, 1].map((lado) => (
        <group key={lado}>
          <Piel position={[lado * 1.36, 0.85, 0]} rotation={[0, 0, lado * 0.14]}>
            <capsuleGeometry args={[0.26, 2.1, 8, 14]} />
          </Piel>
          <Piel position={[lado * 0.48, -2.05, 0]}>
            <capsuleGeometry args={[0.34, 2.2, 8, 14]} />
          </Piel>
        </group>
      ))}
    </group>
  );
}

function Organo({
  id,
  encontrado,
  nombre,
  etiquetaEn,
  latido,
  onTocar,
  children,
}: {
  id: IdOrgano;
  encontrado: boolean;
  nombre: boolean;
  etiquetaEn: [number, number, number];
  latido?: boolean;
  onTocar: (id: IdOrgano) => void;
  children: ReactNode;
}) {
  const grupo = useRef<THREE.Group>(null);
  const [encima, setEncima] = useState(false);

  useFrame((estado) => {
    if (!grupo.current) return;
    const pulso = latido || encontrado ? 1 + Math.max(0, Math.sin(estado.clock.elapsedTime * 7)) * 0.07 : 1;
    grupo.current.scale.setScalar(pulso * (encima ? 1.1 : 1));
  });

  function tocar(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    if (e.delta <= MOVIMIENTO_MAXIMO_PX) onTocar(id);
  }

  return (
    <group
      ref={grupo}
      onClick={tocar}
      onPointerOver={(e) => {
        e.stopPropagation();
        setEncima(true);
      }}
      onPointerOut={() => setEncima(false)}
    >
      {children}
      {nombre || encima || encontrado ? (
        <Html center position={etiquetaEn} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap text-white ${
              encontrado ? "bg-[#127A43]" : "bg-black/70"
            }`}
          >
            {ORGANOS[id].nombre}
          </span>
        </Html>
      ) : null}
    </group>
  );
}

function Material({ color, encontrado }: { color: string; encontrado: boolean }) {
  return <meshStandardMaterial color={color} roughness={0.55} emissive={encontrado ? "#2DBE70" : "#000000"} emissiveIntensity={0.55} />;
}

function Organos({ encontrados, nombres, onTocar }: Props) {
  const base = (id: IdOrgano) => ({ id, encontrado: encontrados.includes(id), nombre: nombres, onTocar });

  return (
    <group>
      <Organo {...base("cerebro")} etiquetaEn={[0, 3.1, 0.75]}>
        <mesh position={[0, 3.1, 0]} scale={[0.6, 0.48, 0.58]}>
          <sphereGeometry args={[1, 24, 18]} />
          <Material color="#F4A6B8" encontrado={encontrados.includes("cerebro")} />
        </mesh>
      </Organo>
      <Organo {...base("pulmones")} etiquetaEn={[-0.75, 1.95, 0.3]}>
        {[-1, 1].map((lado) => (
          <mesh key={lado} position={[lado * 0.52, 1.22, 0]} scale={[0.38, 0.62, 0.32]}>
            <sphereGeometry args={[1, 20, 16]} />
            <Material color="#F08A8A" encontrado={encontrados.includes("pulmones")} />
          </mesh>
        ))}
      </Organo>
      <Organo {...base("corazon")} etiquetaEn={[0.2, 1.2, 0.7]} latido>
        <mesh position={[0.14, 1.12, 0.34]} scale={[0.27, 0.31, 0.25]}>
          <sphereGeometry args={[1, 20, 16]} />
          <Material color="#C8102E" encontrado={encontrados.includes("corazon")} />
        </mesh>
      </Organo>
      <Organo {...base("higado")} etiquetaEn={[-0.75, 0.42, 0.5]}>
        <mesh position={[-0.36, 0.42, 0.16]} scale={[0.5, 0.24, 0.3]}>
          <sphereGeometry args={[1, 20, 14]} />
          <Material color="#8B3A2B" encontrado={encontrados.includes("higado")} />
        </mesh>
      </Organo>
      <Organo {...base("estomago")} etiquetaEn={[0.8, 0.42, 0.5]}>
        <mesh position={[0.38, 0.4, 0.16]} scale={[0.3, 0.26, 0.24]}>
          <sphereGeometry args={[1, 20, 14]} />
          <Material color="#E8B04A" encontrado={encontrados.includes("estomago")} />
        </mesh>
      </Organo>
      <Organo {...base("intestinos")} etiquetaEn={[0, -0.72, 0.5]}>
        <mesh position={[0, -0.22, 0.12]} rotation={[0.2, 0, 0]}>
          <torusKnotGeometry args={[0.3, 0.12, 80, 10, 2, 3]} />
          <Material color="#E8836B" encontrado={encontrados.includes("intestinos")} />
        </mesh>
      </Organo>
      <Organo {...base("rinones")} etiquetaEn={[1, 0.02, -0.26]}>
        {[-1, 1].map((lado) => (
          <mesh key={lado} position={[lado * 0.58, 0.02, -0.26]} scale={[0.16, 0.24, 0.14]}>
            <sphereGeometry args={[1, 16, 12]} />
            <Material color="#7A3B69" encontrado={encontrados.includes("rinones")} />
          </mesh>
        ))}
      </Organo>
    </group>
  );
}

export default function CuerpoEscena(props: Props) {
  return (
    <div className="h-full w-full touch-none select-none">
      <Canvas camera={{ position: [0, 1.75, 10], fov: 42 }} dpr={[1, 1.75]}>
        <color attach="background" args={["#10103A"]} />
        <HtmlInicial />
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 6]} intensity={1.6} />
        <directionalLight position={[-3, 1, -6]} intensity={0.8} color="#B8C4FF" />
        <Silueta />
        <Organos {...props} />
        <OrbitControls enablePan={false} minDistance={5} maxDistance={13} target={[0, 1.75, 0]} />
      </Canvas>
    </div>
  );
}
