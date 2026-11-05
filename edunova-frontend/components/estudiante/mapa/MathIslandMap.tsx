"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";
import { IslandScene } from "./IslandScene";
import type { MathProgress } from "./mathMapData";
import { MATH_STATIONS } from "./mathMapData";

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
  const focus =
    MATH_STATIONS.find((s) => s.id === (selectedId ?? progress.currentId))
      ?.position ?? [0, 0, 0];

  const camPos = mobile
    ? ([focus[0] + 4.5, 5.5, focus[2] + 6.5] as [number, number, number])
    : ([6, 9, 12] as [number, number, number]);

  return (
    <div className="h-full w-full touch-none">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: camPos, fov: mobile ? 46 : 42, near: 0.1, far: 80 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#B8D4FF");
        }}
      >
        <Suspense fallback={null}>
          <IslandScene
            progress={progress}
            selectedId={selectedId}
            onSelect={onSelect}
          />
          <ContactShadows
            position={[0, -0.32, 0]}
            opacity={0.35}
            scale={28}
            blur={2.2}
          />
          <OrbitControls
            makeDefault
            enablePan={!mobile}
            minPolarAngle={0.35}
            maxPolarAngle={Math.PI / 2.15}
            minDistance={mobile ? 4 : 6}
            maxDistance={mobile ? 16 : 22}
            target={
              mobile
                ? [focus[0], 0.6, focus[2]]
                : [0, 0.8, 0]
            }
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
