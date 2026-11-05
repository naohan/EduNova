"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

export function RobotMascot({
  position = [0, 0, 0] as [number, number, number],
}) {
  const arm = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!arm.current) return;
    arm.current.rotation.z = -0.4 + Math.sin(clock.elapsedTime * 2.2) * 0.45;
  });

  return (
    <Float speed={1.1} floatIntensity={0.25} rotationIntensity={0.05}>
      <group position={position}>
        {/* pedestal */}
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.16, 8]} />
          <meshStandardMaterial color="#C4B5A0" roughness={0.9} />
        </mesh>

        {/* body */}
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.55, 0.7, 0.4]} />
          <meshStandardMaterial color="#F4F0FF" roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.55, 0.21]}>
          <boxGeometry args={[0.35, 0.25, 0.04]} />
          <meshStandardMaterial
            color="#25CFE0"
            emissive="#25CFE0"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* head */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.48, 0.42, 0.4]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
        {/* eyes */}
        <mesh position={[-0.12, 1.08, 0.21]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial
            color="#4C9EFF"
            emissive="#4C9EFF"
            emissiveIntensity={0.8}
          />
        </mesh>
        <mesh position={[0.12, 1.08, 0.21]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial
            color="#4C9EFF"
            emissive="#4C9EFF"
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* backpack */}
        <mesh position={[0, 0.6, -0.28]} castShadow>
          <boxGeometry args={[0.42, 0.45, 0.18]} />
          <meshStandardMaterial color="#5636D9" roughness={0.4} />
        </mesh>

        {/* waving arm */}
        <group ref={arm} position={[0.38, 0.75, 0]}>
          <mesh position={[0.18, 0, 0]} castShadow>
            <boxGeometry args={[0.36, 0.14, 0.14]} />
            <meshStandardMaterial color="#E8E0FF" />
          </mesh>
          <mesh position={[0.38, 0, 0]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </group>

        {/* other arm */}
        <mesh position={[-0.4, 0.55, 0.05]} castShadow>
          <boxGeometry args={[0.14, 0.36, 0.14]} />
          <meshStandardMaterial color="#E8E0FF" />
        </mesh>

        {/* legs */}
        <mesh position={[-0.14, 0.18, 0]} castShadow>
          <boxGeometry args={[0.16, 0.28, 0.18]} />
          <meshStandardMaterial color="#5636D9" />
        </mesh>
        <mesh position={[0.14, 0.18, 0]} castShadow>
          <boxGeometry args={[0.16, 0.28, 0.18]} />
          <meshStandardMaterial color="#5636D9" />
        </mesh>
      </group>
    </Float>
  );
}
