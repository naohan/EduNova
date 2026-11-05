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

const STATUS_COLOR: Record<StationStatus, string> = {
  completed: "#2DBE70",
  current: "#5636D9",
  available: "#4C9EFF",
  locked: "#9CA3AF",
};

export function StationMarker({ station, status, selected, onSelect }: Props) {
  const glow = useRef<THREE.Mesh>(null);
  const locked = status === "locked";

  useFrame(({ clock }) => {
    if (!glow.current || status !== "current") return;
    const s = 1.05 + Math.sin(clock.elapsedTime * 2.4) * 0.08;
    glow.current.scale.setScalar(s);
  });

  return (
    <group position={station.position}>
      {/* base platform */}
      <mesh
        position={[0, -0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.55, 24]} />
        <meshStandardMaterial
          color={selected ? "#5636D9" : "#FFFFFF"}
          emissive={status === "current" ? "#5636D9" : "#000000"}
          emissiveIntensity={status === "current" ? 0.35 : 0}
          roughness={0.4}
        />
      </mesh>

      {status === "current" && (
        <mesh ref={glow} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.58, 0.78, 32]} />
          <meshBasicMaterial color="#C084FC" transparent opacity={0.65} />
        </mesh>
      )}

      {/* node body */}
      <mesh
        position={[0, 0.35, 0]}
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
        {station.geometry === "cube" || station.kind === "explorar3d" ? (
          <boxGeometry args={[0.55, 0.55, 0.55]} />
        ) : station.geometry === "cone" ? (
          <coneGeometry args={[0.32, 0.55, 16]} />
        ) : station.geometry === "sphere" ? (
          <sphereGeometry args={[0.32, 16, 16]} />
        ) : station.geometry === "cylinder" ? (
          <cylinderGeometry args={[0.28, 0.28, 0.5, 16]} />
        ) : station.geometry === "pyramid" ? (
          <coneGeometry args={[0.35, 0.55, 4]} />
        ) : (
          <sphereGeometry args={[0.3, 16, 16]} />
        )}
        <meshPhysicalMaterial
          color={STATUS_COLOR[status]}
          roughness={locked ? 0.9 : 0.25}
          metalness={0.15}
          transmission={status === "current" ? 0.25 : 0}
          thickness={0.4}
          transparent={locked}
          opacity={locked ? 0.55 : 1}
        />
      </mesh>

      {/* status badge via Html for check/lock */}
      <Html center position={[0, 0.85, 0]} distanceFactor={10} zIndexRange={[10, 0]}>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold shadow ${
            status === "completed"
              ? "bg-[#2DBE70] text-white"
              : status === "locked"
                ? "bg-[#E5E7EB] text-[#6B7280]"
                : status === "current"
                  ? "bg-[#5636D9] text-white ring-2 ring-white"
                  : "bg-white text-[#4C9EFF]"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (!locked) onSelect(station.id);
          }}
        >
          {status === "completed" ? "✓" : status === "locked" ? "🔒" : station.order}
        </div>
      </Html>
    </group>
  );
}
