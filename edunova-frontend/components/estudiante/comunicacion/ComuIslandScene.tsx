"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  COMU_STAGES,
  COMU_STATIONS,
  type ComuProgress,
  type ComuStation,
  getComuStationStatus,
} from "./comuMapData";
import { ComuStationMarker } from "./ComuStationMarker";
import { ComuIcons } from "./ComuIcons";
import { RobotMascot } from "@/components/estudiante/mapa/RobotMascot";
import {
  WorldEnvironment,
  StylizedIsland,
  WaterPlane,
  LearningPath,
  StylizedTree,
  FlowerPatch,
  Bush,
  StoneBridge,
  FloatingBook,
  DistantMountains,
  Waterfall,
  StoryCastle,
  TreasureChest,
  type DeviceQuality,
} from "@/components/estudiante/mapa/world";

type Props = {
  progress: ComuProgress;
  selectedId: string | null;
  onSelect: (id: string) => void;
  quality: DeviceQuality;
};

function LetterBlock({
  letter,
  position,
  color,
}: {
  letter: string;
  position: [number, number, number];
  color: string;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.25;
  });
  return (
    <Float speed={1.2} floatIntensity={0.4}>
      <group ref={ref} position={position}>
        <mesh castShadow>
          <boxGeometry args={[1.05, 1.05, 1.05]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.28}
            clearcoat={0.45}
            metalness={0.08}
          />
        </mesh>
        <Html center position={[0, 0, 0.54]} distanceFactor={10}>
          <div className="font-[family-name:var(--font-fredoka)] text-3xl font-bold text-white drop-shadow">
            {letter}
          </div>
        </Html>
      </group>
    </Float>
  );
}

export function ComuIslandScene({
  progress,
  selectedId,
  onSelect,
  quality,
}: Props) {
  const density = quality.decorDensity;

  return (
    <group>
      <WorldEnvironment
        quality={quality}
        fogColor="#E9D5FF"
        skyTurbidity={5.5}
        accent="comu"
      />

      <WaterPlane color="#7DD3FC" y={-0.12} />
      <DistantMountains position={[15, 0.2, -7]} color="#A78BFA" />

      <StylizedIsland
        position={[-8, 0, 2]}
        radius={5.2}
        height={0.55}
        cliffColor="#F9A8D4"
        grassColor="#86EFAC"
        sandColor="#FBCFE8"
      />
      <StylizedIsland
        position={[0, 0.2, -0.4]}
        radius={5.4}
        height={0.9}
        cliffColor="#C4B5FD"
        grassColor="#6EE7B7"
        sandColor="#DDD6FE"
      />
      <StylizedIsland
        position={[9.2, 0.4, 1.1]}
        radius={4.9}
        height={1.3}
        cliffColor="#818CF8"
        grassColor="#A5B4FC"
        sandColor="#C7D2FE"
      />

      <LearningPath
        points={COMU_STATIONS.map((s) => s.position)}
        color="#FFF7FB"
        yOffset={0.3}
      />

      <StoneBridge from={[-4.0, 0, 1.4]} to={[-2.0, 0, 0.1]} y={0.6} />
      <StoneBridge from={[3.4, 0, -0.6]} to={[5.6, 0, 0.5]} y={1.05} />
      <Waterfall position={[7.6, 2.0, 3.4]} />

      <StoryCastle position={[9.5, 1.7, -1.5]} />
      <TreasureChest position={[11.3, 2.05, 3.1]} />

      <LetterBlock letter="A" position={[-10.8, 1.7, 0.6]} color="#F472B6" />
      <LetterBlock letter="B" position={[-6.2, 1.8, 3.8]} color="#60A5FA" />

      <FloatingBook position={[-9.2, 1.4, 4.2]} color="#5636D9" scale={1.15} />
      <FloatingBook position={[-8.2, 1.6, 4.6]} color="#E85D9A" scale={0.95} />
      <FloatingBook position={[1.2, 1.9, 1.6]} color="#4C9EFF" />
      <FloatingBook position={[2.2, 2.1, 1.2]} color="#A78BFA" scale={1.1} />
      {density > 0.7 && (
        <FloatingBook position={[8.6, 3.2, 0.4]} color="#F472B6" scale={0.85} />
      )}

      <StylizedTree position={[-6.8, 0.55, 0.2]} variant="cherry" />
      <StylizedTree position={[-11.2, 0.55, 2.8]} variant="cherry" scale={1.1} />
      <StylizedTree position={[1.8, 1.1, -3.4]} variant="round" />
      <StylizedTree position={[7.4, 1.8, 2.8]} variant="cherry" scale={0.9} />
      {density > 0.6 && (
        <StylizedTree position={[-9.6, 0.55, -0.4]} variant="pine" scale={0.8} />
      )}

      <Bush position={[-7.6, 0.55, 3.6]} color="#F9A8D4" />
      <Bush position={[0.6, 1.1, 1.5]} />
      <Bush position={[10.2, 1.8, 2.4]} color="#A78BFA" />

      {density > 0.5 && (
        <>
          <FlowerPatch
            center={[-8.0, 0.55, 2.0]}
            count={Math.round(18 * density)}
            palette={["#F472B6", "#FBBF24", "#A78BFA", "#F9A8D4"]}
          />
          <FlowerPatch
            center={[0.4, 1.1, -0.2]}
            count={Math.round(14 * density)}
            palette={["#C4B5FD", "#34D399", "#FDE68A"]}
          />
        </>
      )}

      {COMU_STAGES.map((stage) => (
        <Float key={stage.id} speed={1.1} floatIntensity={0.25}>
          <Html
            position={[
              stage.islandCenter[0],
              stage.id === "creadores" ? 3.8 : 3.0,
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

      <ComuIcons />

      {COMU_STATIONS.map((station: ComuStation) => (
        <ComuStationMarker
          key={station.id}
          station={station}
          status={getComuStationStatus(station, progress)}
          selected={selectedId === station.id}
          onSelect={onSelect}
        />
      ))}

      <RobotMascot position={[-11.6, 0.55, 5.0]} />
    </group>
  );
}
