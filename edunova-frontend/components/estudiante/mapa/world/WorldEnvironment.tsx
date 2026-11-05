"use client";

import { Cloud, Sky } from "@react-three/drei";
import type { DeviceQuality } from "./useDeviceQuality";

type Props = {
  quality: DeviceQuality;
  /** Color de niebla / horizonte EduNova */
  fogColor?: string;
  skyTurbidity?: number;
  accent?: "math" | "comu";
};

export function WorldEnvironment({
  quality,
  fogColor = "#D4C6F7",
  skyTurbidity = 6,
  accent = "math",
}: Props) {
  const cloudColor = accent === "comu" ? "#FFE4F3" : "#F5F0FF";

  return (
    <>
      <color attach="background" args={[fogColor]} />
      <fog attach="fog" args={[fogColor, 28, 62]} />

      <Sky
        distance={450000}
        sunPosition={[8, 12, 4]}
        turbidity={skyTurbidity}
        rayleigh={1.1}
        mieCoefficient={0.004}
        mieDirectionalG={0.8}
      />

      <ambientLight intensity={0.55} />
      <hemisphereLight
        args={[
          accent === "comu" ? "#FCE7F3" : "#F2EEFF",
          accent === "comu" ? "#86EFAC" : "#6BCB77",
          0.85,
        ]}
      />
      <directionalLight
        castShadow={quality.shadows}
        position={[12, 18, 6]}
        intensity={1.15}
        color="#FFF8E7"
        shadow-mapSize={[quality.shadowMap, quality.shadowMap]}
        shadow-bias={-0.00025}
        shadow-camera-far={55}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-normalBias={0.04}
      />
      <directionalLight position={[-8, 6, -10]} intensity={0.35} color="#A5B4FC" />

      {Array.from({ length: quality.cloudCount }).map((_, i) => (
        <Cloud
          key={i}
          position={[
            -14 + i * 5.5,
            7 + (i % 3) * 1.2,
            -12 - (i % 2) * 3,
          ]}
          opacity={0.42}
          speed={0.15}
          segments={quality.mobile ? 8 : 12}
          color={cloudColor}
          bounds={[6, 1.5, 1.2]}
          volume={3}
          fade={28}
        />
      ))}
    </>
  );
}
