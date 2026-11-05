"use client";

import { useMemo } from "react";
import * as THREE from "three";

type Props = {
  position: [number, number, number];
  radius?: number;
  height?: number;
  cliffColor: string;
  grassColor: string;
  sandColor?: string;
  segments?: number;
};

/** Isla en capas: acantilado → arena → hierba con borde suave */
export function StylizedIsland({
  position,
  radius = 5,
  height = 0.7,
  cliffColor,
  grassColor,
  sandColor = "#E8D5A3",
  segments = 24,
}: Props) {
  const grassGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const n = segments;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const wobble = 1 + Math.sin(a * 3) * 0.04 + Math.cos(a * 5) * 0.03;
      const x = Math.cos(a) * radius * 0.92 * wobble;
      const y = Math.sin(a) * radius * 0.92 * wobble;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.12,
      bevelSegments: 2,
    });
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [radius, segments]);

  return (
    <group position={position}>
      {/* Base / acantilado */}
      <mesh castShadow receiveShadow position={[0, height * 0.35, 0]}>
        <cylinderGeometry args={[radius * 0.95, radius * 1.08, height, segments]} />
        <meshStandardMaterial
          color={cliffColor}
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>
      {/* Anillo de arena */}
      <mesh receiveShadow position={[0, height * 0.72, 0]}>
        <cylinderGeometry
          args={[radius * 0.98, radius * 0.98, 0.12, segments]}
        />
        <meshStandardMaterial color={sandColor} roughness={1} />
      </mesh>
      {/* Hierba biselada */}
      <mesh
        geometry={grassGeo}
        castShadow
        receiveShadow
        position={[0, height * 0.78, 0]}
      >
        <meshStandardMaterial
          color={grassColor}
          roughness={0.88}
          metalness={0}
        />
      </mesh>
      {/* Destello suave en el centro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height * 0.95, 0]}>
        <circleGeometry args={[radius * 0.35, 24]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent
          opacity={0.08}
          roughness={1}
        />
      </mesh>
    </group>
  );
}
