"use client";

import { useMemo } from "react";
import * as THREE from "three";

type Props = {
  points: [number, number, number][];
  color?: string;
  radius?: number;
  yOffset?: number;
};

export function LearningPath({
  points,
  color = "#FFFFFF",
  radius = 0.4,
  yOffset = 0.22,
}: Props) {
  const { tube, rim, gems } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(p[0], yOffset, p[2])),
    );
    return {
      tube: new THREE.TubeGeometry(curve, 120, radius, 14, false),
      rim: new THREE.TubeGeometry(curve, 120, radius * 1.22, 14, false),
      gems: curve.getSpacedPoints(22),
    };
  }, [points, radius, yOffset]);

  return (
    <group>
      <mesh geometry={rim} receiveShadow>
        <meshStandardMaterial
          color="#C4B5FD"
          roughness={0.65}
          transparent
          opacity={0.55}
        />
      </mesh>
      <mesh geometry={tube} receiveShadow>
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </mesh>
      {gems.map((p, i) =>
        i % 2 === 0 ? (
          <mesh key={i} position={[p.x, p.y + 0.22, p.z]} castShadow>
            <octahedronGeometry args={[0.1, 0]} />
            <meshStandardMaterial
              color="#FFC928"
              emissive="#FFC928"
              emissiveIntensity={0.55}
              metalness={0.35}
              roughness={0.25}
            />
          </mesh>
        ) : null,
      )}
    </group>
  );
}
