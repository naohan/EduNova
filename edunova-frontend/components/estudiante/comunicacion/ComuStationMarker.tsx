"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { ComuStation, StationStatus } from "./comuMapData";
import { CheckIcon, LockIcon, StarIcon } from "@/components/ui/icons";

type Props = {
  station: ComuStation;
  status: StationStatus;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function ComuStationMarker({ station, status, selected, onSelect }: Props) {
  const glow = useRef<THREE.Mesh>(null);
  const locked = status === "locked";

  useFrame(({ clock }) => {
    if (!glow.current || status !== "current") return;
    glow.current.scale.setScalar(1.08 + Math.sin(clock.elapsedTime * 2.6) * 0.1);
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
      <mesh position={[0, -0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.78, 0.88, 0.16, 24]} />
        <meshStandardMaterial color="#FCE7F3" roughness={0.7} />
      </mesh>
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
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.78, 32]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      {status === "current" && (
        <mesh ref={glow} position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.75, 0.95, 32]} />
          <meshBasicMaterial color="#F0ABFC" transparent opacity={0.75} />
        </mesh>
      )}
      {(status === "current" || station.kind === "lectura") && !locked && (
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.42, 0.55, 0.12]} />
          <meshStandardMaterial color="#A78BFA" roughness={0.35} />
        </mesh>
      )}
      <Html
        center
        position={[0, status === "current" ? 1.05 : 0.55, 0]}
        distanceFactor={11}
        zIndexRange={[12, 0]}
      >
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
          {status === "completed"
            ? <CheckIcon weight="bold" aria-label="Completada" />
            : status === "locked"
              ? <LockIcon weight="fill" aria-label="Bloqueada" />
              : status === "current"
                ? <StarIcon weight="fill" aria-label="Actual" />
                : station.order}
        </button>
      </Html>
    </group>
  );
}
