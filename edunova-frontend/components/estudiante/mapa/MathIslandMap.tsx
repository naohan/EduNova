"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";
import { IslandScene } from "./IslandScene";
import type { MathProgress } from "./mathMapData";
import { MATH_STATIONS } from "./mathMapData";
import { MapCameraRig, useDeviceQuality } from "./world";

type Props = {
  progress: MathProgress;
  selectedId: string | null;
  onSelect: (id: string) => void;
  mobile?: boolean;
};

export function MathIslandMap({
  progress,
  selectedId,
  onSelect,
  mobile = false,
}: Props) {
  const quality = useDeviceQuality(mobile);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controls = useRef<any>(null);

  const focus =
    MATH_STATIONS.find((s) => s.id === (selectedId ?? progress.currentId))
      ?.position ?? ([0, 0, 0] as [number, number, number]);

  const camPos = mobile
    ? ([focus[0] + 3.2, 7.2, focus[2] + 7.5] as [number, number, number])
    : ([2, 11, 14] as [number, number, number]);

  return (
    <div className="h-full w-full touch-none">
      <Canvas
        shadows={quality.shadows}
        dpr={quality.dpr}
        camera={{ position: camPos, fov: mobile ? 42 : 36, near: 0.1, far: 120 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMappingExposure: 1.05,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#C9B8F5");
          gl.toneMapping = THREE.ACESFilmicToneMapping;
        }}
      >
        <Suspense fallback={null}>
          <IslandScene
            progress={progress}
            selectedId={selectedId}
            onSelect={onSelect}
            quality={quality}
          />
          <ContactShadows
            position={[0, -0.16, 0]}
            opacity={0.28}
            scale={36}
            blur={2.8}
            far={8}
          />
          <OrbitControls
            ref={controls}
            makeDefault
            enablePan={!mobile}
            enableDamping
            dampingFactor={0.08}
            minPolarAngle={0.5}
            maxPolarAngle={Math.PI / 2.4}
            minDistance={mobile ? 5.5 : 9}
            maxDistance={mobile ? 16 : 26}
            target={[focus[0], 1.0, focus[2]]}
          />
          <MapCameraRig focus={focus} mobile={mobile} controls={controls} />
        </Suspense>
      </Canvas>
    </div>
  );
}
