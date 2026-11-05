"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export function StylizedTree({
  position,
  variant = "pine",
  scale = 1,
}: {
  position: [number, number, number];
  variant?: "pine" | "round" | "cherry";
  scale?: number;
}) {
  const sway = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!sway.current) return;
    sway.current.rotation.z = Math.sin(clock.elapsedTime * 0.8 + position[0]) * 0.04;
  });

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.7, 8]} />
        <meshStandardMaterial color="#7A4A28" roughness={0.85} />
      </mesh>
      <group ref={sway}>
        {variant === "pine" && (
          <>
            <mesh position={[0, 0.95, 0]} castShadow>
              <coneGeometry args={[0.55, 0.85, 8]} />
              <meshStandardMaterial color="#24913A" roughness={0.7} />
            </mesh>
            <mesh position={[0, 1.45, 0]} castShadow>
              <coneGeometry args={[0.4, 0.7, 8]} />
              <meshStandardMaterial color="#2F9E44" roughness={0.65} />
            </mesh>
            <mesh position={[0, 1.85, 0]} castShadow>
              <coneGeometry args={[0.28, 0.55, 8]} />
              <meshStandardMaterial color="#3CB371" roughness={0.6} />
            </mesh>
          </>
        )}
        {variant === "round" && (
          <>
            <mesh position={[0, 1.15, 0]} castShadow>
              <sphereGeometry args={[0.65, 14, 14]} />
              <meshStandardMaterial color="#34A853" roughness={0.7} />
            </mesh>
            <mesh position={[0.35, 1.0, 0.15]} castShadow>
              <sphereGeometry args={[0.35, 12, 12]} />
              <meshStandardMaterial color="#4CAF50" roughness={0.75} />
            </mesh>
          </>
        )}
        {variant === "cherry" && (
          <>
            <mesh position={[0, 1.2, 0]} castShadow>
              <sphereGeometry args={[0.7, 14, 14]} />
              <meshStandardMaterial color="#F9A8D4" roughness={0.65} />
            </mesh>
            <mesh position={[0.4, 1.05, 0.2]} castShadow>
              <sphereGeometry args={[0.38, 12, 12]} />
              <meshStandardMaterial color="#FBCFE8" roughness={0.7} />
            </mesh>
            <mesh position={[-0.3, 1.35, 0.15]} castShadow>
              <sphereGeometry args={[0.22, 10, 10]} />
              <meshStandardMaterial color="#FB7185" roughness={0.55} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

/** Flores / hierba baja con InstancedMesh */
export function FlowerPatch({
  center,
  count = 18,
  radius = 2.2,
  palette = ["#F472B6", "#FBBF24", "#A78BFA", "#F87171"],
}: {
  center: [number, number, number];
  count?: number;
  radius?: number;
  palette?: string[];
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const colors = useMemo(() => {
    const arr: THREE.Color[] = [];
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    // positions baked on first frame via useMemo side-effect pattern
    return { dummy, color, arr };
  }, []);

  useMemo(() => {
    // noop placeholder — transforms set in useFrame once
  }, []);

  const ready = useRef(false);
  useFrame(() => {
    if (!mesh.current || ready.current) return;
    const { dummy, color } = colors;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + i * 0.37;
      const r = (0.3 + (i % 5) * 0.15) * radius;
      dummy.position.set(
        center[0] + Math.cos(a) * r,
        center[1] + 0.08,
        center[2] + Math.sin(a) * r,
      );
      dummy.scale.setScalar(0.7 + (i % 3) * 0.15);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
      color.set(palette[i % palette.length]);
      mesh.current.setColorAt(i, color);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor)
      mesh.current.instanceColor.needsUpdate = true;
    ready.current = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow>
      <sphereGeometry args={[0.09, 8, 8]} />
      <meshStandardMaterial roughness={0.45} />
    </instancedMesh>
  );
}

export function Bush({
  position,
  color = "#3D9B5F",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.32, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.2, 0.18, 0.1]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#4CAF50" roughness={0.85} />
      </mesh>
    </group>
  );
}

export function StoneBridge({
  from,
  to,
  y = 0.35,
}: {
  from: [number, number, number];
  to: [number, number, number];
  y?: number;
}) {
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    y,
    (from[2] + to[2]) / 2,
  ];
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const len = Math.hypot(dx, dz);
  const rot = Math.atan2(dx, dz);

  return (
    <group position={mid} rotation={[0, rot, 0]}>
      <RoundedBox
        args={[1.1, 0.18, len * 0.55]}
        radius={0.06}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#D6D3D1" roughness={0.75} />
      </RoundedBox>
      {[-0.48, 0.48].map((x) => (
        <mesh key={x} position={[x, 0.28, 0]} castShadow>
          <boxGeometry args={[0.08, 0.35, len * 0.5]} />
          <meshStandardMaterial color="#A8A29E" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

export function FloatingBook({
  position,
  color = "#5636D9",
  scale = 1,
}: {
  position: [number, number, number];
  color?: string;
  scale?: number;
}) {
  return (
    <Float speed={1.4} floatIntensity={0.55} rotationIntensity={0.35}>
      <group position={position} scale={scale}>
        <RoundedBox args={[0.85, 0.12, 0.65]} radius={0.04} castShadow>
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
        </RoundedBox>
        <mesh position={[0, 0.08, 0]}>
          <boxGeometry args={[0.78, 0.02, 0.58]} />
          <meshStandardMaterial color="#F8F5FF" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.02, -0.28]}>
          <boxGeometry args={[0.85, 0.12, 0.04]} />
          <meshStandardMaterial color="#312E81" roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

export function DistantMountains({
  position = [14, 0, -8] as [number, number, number],
  color = "#8B7EC8",
}: {
  position?: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position}>
      {[
        [0, 4.2, 0, 3.6],
        [3.2, 3.0, -1.5, 2.6],
        [-3.0, 3.4, -1.0, 2.9],
        [5.5, 2.2, 0.5, 2.0],
      ].map(([x, h, z, r], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow>
          <coneGeometry args={[r, h, 6]} />
          <meshStandardMaterial
            color={i % 2 ? color : "#7C6BB5"}
            roughness={0.95}
            flatShading
          />
        </mesh>
      ))}
      {/* nieve tip */}
      <mesh position={[0, 4.0, 0]}>
        <coneGeometry args={[1.2, 1.1, 6]} />
        <meshStandardMaterial color="#F8F5FF" roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

export function Waterfall({
  position,
}: {
  position: [number, number, number];
}) {
  const foam = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!foam.current) return;
    foam.current.position.y =
      position[1] + 0.15 + Math.sin(clock.elapsedTime * 3) * 0.05;
  });

  return (
    <group>
      <mesh position={position}>
        <boxGeometry args={[0.35, 1.8, 0.08]} />
        <meshStandardMaterial
          color="#BAE6FD"
          transparent
          opacity={0.55}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
      <mesh ref={foam} position={[position[0], position[1] - 0.7, position[2]]}>
        <sphereGeometry args={[0.35, 10, 10]} />
        <meshStandardMaterial
          color="#E0F2FE"
          transparent
          opacity={0.7}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export function StoryCastle({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <RoundedBox
        args={[2.6, 2.5, 2.1]}
        radius={0.12}
        position={[0, 1.25, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#7C3AED" roughness={0.45} metalness={0.08} />
      </RoundedBox>
      {([-1.05, 1.05] as const).map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.48, 1.5, 10]} />
            <meshStandardMaterial color="#A78BFA" roughness={0.4} />
          </mesh>
          <mesh position={[0, 3.4, 0]} castShadow>
            <coneGeometry args={[0.58, 0.75, 5]} />
            <meshStandardMaterial color="#F472B6" roughness={0.35} />
          </mesh>
        </group>
      ))}
      {[-0.55, 0.55].map((x) =>
        [0.7, 1.5].map((y) => (
          <mesh key={`${x}-${y}`} position={[x, y, 1.08]}>
            <planeGeometry args={[0.5, 0.42]} />
            <meshStandardMaterial
              color="#FDE68A"
              emissive="#FDE68A"
              emissiveIntensity={0.35}
            />
          </mesh>
        )),
      )}
      {/* puerta arco */}
      <mesh position={[0, 0.55, 1.08]}>
        <planeGeometry args={[0.7, 0.95]} />
        <meshStandardMaterial color="#4C1D95" roughness={0.6} />
      </mesh>
    </group>
  );
}

export function TreasureChest({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <Float speed={1.1} floatIntensity={0.2}>
      <group position={position}>
        <RoundedBox args={[0.9, 0.55, 0.65]} radius={0.06} castShadow>
          <meshStandardMaterial
            color="#FFC928"
            emissive="#FFC928"
            emissiveIntensity={0.3}
            metalness={0.55}
            roughness={0.25}
          />
        </RoundedBox>
        <RoundedBox
          args={[0.94, 0.22, 0.68]}
          radius={0.05}
          position={[0, 0.36, 0]}
          castShadow
        >
          <meshStandardMaterial color="#E8A317" metalness={0.5} roughness={0.3} />
        </RoundedBox>
        <pointLight
          color="#FFC928"
          intensity={0.85}
          distance={3.2}
          position={[0, 0.6, 0]}
        />
      </group>
    </Float>
  );
}
