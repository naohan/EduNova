"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { MathStation, StationStatus } from "./mathMapData";

type Props = {
  station: MathStation;
  status: StationStatus;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function StationMarker({ station, status, selected, onSelect }: Props) {
  const glow = useRef<THREE.Mesh>(null);
  const locked = status === "locked";

  useFrame(({ clock }) => {
    if (!glow.current || status !== "current") return;
    const s = 1.08 + Math.sin(clock.elapsedTime * 2.6) * 0.1;
    glow.current.scale.setScalar(s);
  });

  const baseColor =
    status === "completed"
      ? "#2DBE70"
      : status === "current"
        ? "#5636D9"
        : status === "available"
          ? "#FFFFFF"
          : "#D1D5DB";

  return (
    <group position={station.position}>
      {/* Pedestal */}
      <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.88, 0.16, 24]} />
        <meshStandardMaterial color="#EDE9FE" roughness={0.7} />
      </mesh>
      {/* Nodo circular tipo mapa de aprendizaje */}
      <mesh
        position={[0, 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
        onClick={(e) => {
          e.stopPropagation();
          if (!locked) onSelect(station.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!locked) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <circleGeometry args={[0.62, 32]} />
        <meshStandardMaterial
          color={selected && !locked ? "#5636D9" : baseColor}
          emissive={status === "current" ? "#5636D9" : "#000000"}
          emissiveIntensity={status === "current" ? 0.45 : 0}
          roughness={0.3}
          metalness={0.08}
        />
      </mesh>

      {/* Borde blanco */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.78, 32]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {status === "current" && (
        <mesh ref={glow} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.75, 0.95, 32]} />
          <meshBasicMaterial color="#C084FC" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Mini figura geométrica encima del nodo actual / 3D */}
      {(status === "current" || station.kind === "explorar3d") && !locked && (
        <mesh
          position={[0, 0.55, 0]}
          castShadow
          onClick={(e) => {
            e.stopPropagation();
            onSelect(station.id);
          }}
        >
          {station.geometry === "cone" ? (
            <coneGeometry args={[0.28, 0.5, 16]} />
          ) : station.geometry === "sphere" ? (
            <sphereGeometry args={[0.28, 16, 16]} />
          ) : station.geometry === "cylinder" ? (
            <cylinderGeometry args={[0.22, 0.22, 0.45, 16]} />
          ) : station.geometry === "pyramid" ? (
            <coneGeometry args={[0.3, 0.5, 4]} />
          ) : (
            <boxGeometry args={[0.45, 0.45, 0.45]} />
          )}
          <meshPhysicalMaterial
            color={status === "current" ? "#A78BFA" : "#4C9EFF"}
            transmission={status === "current" ? 0.35 : 0.1}
            roughness={0.2}
            thickness={0.5}
          />
        </mesh>
      )}

      <Html center position={[0, status === "current" ? 1.05 : 0.55, 0]} distanceFactor={11} zIndexRange={[12, 0]}>
        <button
          type="button"
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-md ${
            status === "completed"
              ? "bg-[#2DBE70] text-white"
              : status === "locked"
                ? "bg-[#E5E7EB] text-[#6B7280]"
                : status === "current"
                  ? "bg-[#FFC928] text-[#17164F] ring-2 ring-white"
                  : "bg-white text-[#5636D9]"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!locked) onSelect(station.id);
          }}
        >
          {status === "completed" ? "✓" : status === "locked" ? "🔒" : status === "current" ? "★" : station.order}
        </button>
      </Html>
    </group>
  );
}
