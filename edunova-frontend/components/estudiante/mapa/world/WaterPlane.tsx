"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  color?: string;
  y?: number;
};

export function WaterPlane({ color = "#5BA8F5", y = -0.18 }: Props) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!mat.current) return;
    mat.current.opacity = 0.55 + Math.sin(clock.elapsedTime * 0.6) * 0.04;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
        <circleGeometry args={[30, 72]} />
        <meshStandardMaterial
          ref={mat}
          color={color}
          transparent
          opacity={0.58}
          roughness={0.12}
          metalness={0.25}
        />
      </mesh>
      {/* Anillo de espuma lejana */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y + 0.02, 0]}>
        <ringGeometry args={[22, 28, 64]} />
        <meshBasicMaterial color="#E0F2FE" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}
