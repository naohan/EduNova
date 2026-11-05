"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  MATH_STAGES,
  MATH_STATIONS,
  type MathProgress,
  type MathStation,
  getStationStatus,
} from "./mathMapData";
import { StationMarker } from "./StationMarker";
import { RobotMascot } from "./RobotMascot";

type Props = {
  progress: MathProgress;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function PathRibbon() {
  const points = useMemo(() => {
    const pts = MATH_STATIONS.map(
      (s) => new THREE.Vector3(s.position[0], 0.12, s.position[2]),
    );
    const curve = new THREE.CatmullRomCurve3(pts);
    return curve.getPoints(64);
  }, []);

  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      MATH_STATIONS.map(
        (s) => new THREE.Vector3(s.position[0], 0.12, s.position[2]),
      ),
    );
    return new THREE.TubeGeometry(curve, 64, 0.22, 8, false);
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#F8F6FF" roughness={0.85} />
      {/* invisible helper for tube - stars along path */}
      {points
        .filter((_, i) => i % 8 === 0)
        .map((p, i) => (
          <mesh key={i} position={[p.x, p.y + 0.25, p.z]}>
            <octahedronGeometry args={[0.08, 0]} />
            <meshStandardMaterial
              color="#FFC928"
              emissive="#FFC928"
              emissiveIntensity={0.4}
            />
          </mesh>
        ))}
    </mesh>
  );
}

function Island({
  center,
  color,
  label,
  scale = 1,
  height = 0.6,
}: {
  center: [number, number, number];
  color: string;
  label: string;
  scale?: number;
  height?: number;
}) {
  return (
    <group position={center}>
      <mesh position={[0, height * 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.4 * scale, 4.2 * scale, height, 8]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, height + 0.08, 0]} receiveShadow>
        <cylinderGeometry args={[3.2 * scale, 3.2 * scale, 0.18, 8]} />
        <meshStandardMaterial color="#6BCB77" roughness={1} />
      </mesh>
      {/* trees */}
      {[
        [1.6, 0.9],
        [-1.8, 1.1],
        [0.4, -1.5],
        [-0.8, -1.2],
      ].map(([x, z], i) => (
        <group key={i} position={[x * scale, height + 0.1, z * scale]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.5, 6]} />
            <meshStandardMaterial color="#8B5A2B" />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <coneGeometry args={[0.45, 0.9, 7]} />
            <meshStandardMaterial color="#2F9E44" />
          </mesh>
        </group>
      ))}
      <Float speed={1.2} floatIntensity={0.35} rotationIntensity={0.1}>
        <Html position={[0, height + 2.0, 0]} center distanceFactor={12} zIndexRange={[5, 0]}>
          <div className="whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#17164F] shadow">
            {label}
          </div>
        </Html>
      </Float>
    </group>
  );
}

function DecorShapes() {
  const cube = useRef<THREE.Mesh>(null);
  const cone = useRef<THREE.Mesh>(null);
  const pyramid = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (cube.current) cube.current.rotation.y += dt * 0.4;
    if (cone.current) cone.current.rotation.y -= dt * 0.35;
    if (pyramid.current) pyramid.current.rotation.y += dt * 0.3;
  });

  return (
    <group>
      <Float speed={1.5} floatIntensity={0.5}>
        <mesh ref={cube} position={[-6.5, 1.8, 0.2]} castShadow>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshPhysicalMaterial
            color="#A78BFA"
            transmission={0.35}
            thickness={0.6}
            roughness={0.15}
            metalness={0.1}
          />
        </mesh>
      </Float>
      <Float speed={1.2} floatIntensity={0.4}>
        <mesh ref={cone} position={[0.5, 2.1, -2.8]} castShadow>
          <coneGeometry args={[0.45, 0.9, 24]} />
          <meshStandardMaterial color="#5636D9" roughness={0.35} />
        </mesh>
      </Float>
      <Float speed={1.4} floatIntensity={0.45}>
        <mesh ref={pyramid} position={[9.2, 2.6, -0.8]} castShadow>
          <coneGeometry args={[0.55, 0.85, 4]} />
          <meshStandardMaterial color="#4C9EFF" roughness={0.3} />
        </mesh>
      </Float>
      <mesh position={[11.2, 1.55, 3.2]} castShadow>
        <boxGeometry args={[0.7, 0.55, 0.5]} />
        <meshStandardMaterial
          color="#FFC928"
          emissive="#FFC928"
          emissiveIntensity={0.25}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function Water() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.35, 0]} receiveShadow>
      <circleGeometry args={[22, 48]} />
      <meshStandardMaterial
        color="#4C9EFF"
        transparent
        opacity={0.55}
        roughness={0.2}
        metalness={0.15}
      />
    </mesh>
  );
}

function MountainRange() {
  return (
    <group position={[12, 0, -6]}>
      {[
        [0, 2.2, 0, 2.8],
        [2.5, 1.6, -1, 2],
        [-2.2, 1.8, -0.5, 2.2],
      ].map(([x, h, z, r], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow>
          <coneGeometry args={[r, h, 5]} />
          <meshStandardMaterial color="#7C6BB5" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

export function IslandScene({ progress, selectedId, onSelect }: Props) {
  return (
    <group>
      <color attach="background" args={["#B8D4FF"]} />
      <fog attach="fog" args={["#C9DCFF", 18, 42]} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#E8F0FF", "#6BCB77", 0.65]} />
      <directionalLight
        castShadow
        position={[8, 14, 6]}
        intensity={1.35}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={40}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      <Water />
      <MountainRange />

      {MATH_STAGES.map((stage, i) => (
        <Island
          key={stage.id}
          center={stage.islandCenter}
          color={i === 0 ? "#E8D5A3" : i === 1 ? "#8FBF7A" : "#9B8EC4"}
          label={stage.nombre}
          scale={i === 1 ? 1.05 : 1}
          height={0.55 + i * 0.25}
        />
      ))}

      <PathRibbon />
      <DecorShapes />

      {MATH_STATIONS.map((station: MathStation) => (
        <StationMarker
          key={station.id}
          station={station}
          status={getStationStatus(station, progress)}
          selected={selectedId === station.id}
          onSelect={onSelect}
        />
      ))}

      <RobotMascot position={[-11.5, 0.55, 5.2]} />
    </group>
  );
}
