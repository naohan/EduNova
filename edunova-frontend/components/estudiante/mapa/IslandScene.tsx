"use client";

import { useRef } from "react";
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
import { GeometryIcons } from "./GeometryIcons";
import {
  WorldEnvironment,
  StylizedIsland,
  WaterPlane,
  LearningPath,
  StylizedTree,
  FlowerPatch,
  Bush,
  StoneBridge,
  DistantMountains,
  Waterfall,
  TreasureChest,
  type DeviceQuality,
} from "./world";

type Props = {
  progress: MathProgress;
  selectedId: string | null;
  onSelect: (id: string) => void;
  quality: DeviceQuality;
};

function HeroCube() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.55;
      ref.current.rotation.x = Math.sin(performance.now() / 1200) * 0.12;
    }
  });

  return (
    <Float speed={1.3} floatIntensity={0.4}>
      <group position={[-2.2, 1.85, 1.1]}>
        <mesh position={[0, -0.55, 0]} receiveShadow>
          <cylinderGeometry args={[0.75, 0.9, 0.2, 28]} />
          <meshStandardMaterial
            color="#5636D9"
            emissive="#5636D9"
            emissiveIntensity={0.4}
            metalness={0.45}
            roughness={0.3}
          />
        </mesh>
        <mesh ref={ref} castShadow>
          <boxGeometry args={[0.95, 0.95, 0.95]} />
          <meshPhysicalMaterial
            color="#C4B5FD"
            transmission={0.5}
            thickness={0.9}
            roughness={0.1}
            metalness={0.05}
            transparent
            opacity={0.92}
          />
        </mesh>
        <pointLight color="#A78BFA" intensity={1.3} distance={4.5} />
      </group>
    </Float>
  );
}

function DecorShapes() {
  const cone = useRef<THREE.Mesh>(null);
  const cyl = useRef<THREE.Mesh>(null);
  const pyr = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (cone.current) cone.current.rotation.y -= dt * 0.4;
    if (cyl.current) cyl.current.rotation.y += dt * 0.35;
    if (pyr.current) pyr.current.rotation.y += dt * 0.3;
  });

  return (
    <group>
      <Float speed={1.2} floatIntensity={0.45}>
        <mesh ref={cone} position={[0.8, 2.55, -2.6]} castShadow>
          <coneGeometry args={[0.5, 1.0, 28]} />
          <meshPhysicalMaterial
            color="#5636D9"
            roughness={0.2}
            metalness={0.15}
            clearcoat={0.4}
          />
        </mesh>
      </Float>
      <Float speed={1.35} floatIntensity={0.45}>
        <mesh ref={cyl} position={[8.2, 3.15, 2.6]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.9, 24]} />
          <meshPhysicalMaterial color="#FF6B9D" roughness={0.22} clearcoat={0.5} />
        </mesh>
      </Float>
      <Float speed={1.25} floatIntensity={0.45}>
        <mesh ref={pyr} position={[10.4, 3.25, -0.6]} castShadow>
          <coneGeometry args={[0.58, 0.95, 4]} />
          <meshPhysicalMaterial color="#4C9EFF" roughness={0.2} clearcoat={0.45} />
        </mesh>
      </Float>
      <TreasureChest position={[11.4, 1.95, 3.0]} />
    </group>
  );
}

export function IslandScene({
  progress,
  selectedId,
  onSelect,
  quality,
}: Props) {
  const density = quality.decorDensity;

  return (
    <group>
      <WorldEnvironment quality={quality} fogColor="#C9B8F5" accent="math" />

      <WaterPlane color="#5BA8F5" />
      <DistantMountains position={[14, 0.1, -8]} color="#8B7EC8" />

      <StylizedIsland
        position={[-8, 0, 2]}
        radius={5.2}
        height={0.55}
        cliffColor="#D4B896"
        grassColor="#7DCE82"
        sandColor="#E8D5A3"
      />
      <StylizedIsland
        position={[0, 0.15, -0.5]}
        radius={5.5}
        height={0.85}
        cliffColor="#5F8F5E"
        grassColor="#4CAF50"
        sandColor="#A3C48A"
      />
      <StylizedIsland
        position={[9.2, 0.35, 1.2]}
        radius={4.9}
        height={1.25}
        cliffColor="#7C6BB5"
        grassColor="#9B8AD4"
        sandColor="#B8A9E0"
      />

      <LearningPath
        points={MATH_STATIONS.map((s) => s.position)}
        yOffset={0.28}
      />

      <StoneBridge from={[-4.2, 0, 1.2]} to={[-2.2, 0, 0.2]} y={0.55} />
      <StoneBridge from={[3.2, 0, -0.8]} to={[5.4, 0, 0.4]} y={0.95} />
      <Waterfall position={[-5.8, 1.1, 4.6]} />

      {/* Vegetación */}
      <StylizedTree position={[-10.2, 0.55, 0.4]} variant="pine" scale={1.1} />
      <StylizedTree position={[-6.2, 0.55, 3.8]} variant="round" />
      {density > 0.7 && (
        <StylizedTree position={[-11.0, 0.55, 3.2]} variant="pine" scale={0.85} />
      )}
      <StylizedTree position={[-1.8, 1.0, 1.5]} variant="pine" />
      <StylizedTree position={[1.6, 1.0, -2.8]} variant="round" scale={1.15} />
      <StylizedTree position={[7.2, 1.7, -1.2]} variant="pine" scale={0.95} />
      <StylizedTree position={[10.8, 1.7, 0.2]} variant="round" />

      <Bush position={[-9.0, 0.55, 4.0]} />
      <Bush position={[-7.4, 0.55, 0.6]} color="#2F9E44" />
      <Bush position={[0.8, 1.0, 1.8]} />
      <Bush position={[8.4, 1.7, 2.8]} color="#6D28D9" />

      {density > 0.5 && (
        <>
          <FlowerPatch center={[-8.2, 0.55, 2.2]} count={Math.round(16 * density)} />
          <FlowerPatch
            center={[0.2, 1.0, -0.2]}
            count={Math.round(14 * density)}
            palette={["#A78BFA", "#FBBF24", "#34D399"]}
          />
          <FlowerPatch
            center={[9.0, 1.7, 1.0]}
            count={Math.round(12 * density)}
            palette={["#C4B5FD", "#F9A8D4", "#FDE68A"]}
          />
        </>
      )}

      {MATH_STAGES.map((stage) => (
        <Float key={stage.id} speed={1.1} floatIntensity={0.25}>
          <Html
            position={[
              stage.islandCenter[0],
              stage.islandCenter[1] + (stage.id === "creadores" ? 3.6 : 2.9),
              stage.islandCenter[2],
            ]}
            center
            distanceFactor={14}
            zIndexRange={[4, 0]}
          >
            <div
              className="pointer-events-none whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: stage.color }}
            >
              {stage.nombre}
            </div>
          </Html>
        </Float>
      ))}

      <HeroCube />
      <DecorShapes />
      <GeometryIcons />

      {MATH_STATIONS.map((station: MathStation) => (
        <StationMarker
          key={station.id}
          station={station}
          status={getStationStatus(station, progress)}
          selected={selectedId === station.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
