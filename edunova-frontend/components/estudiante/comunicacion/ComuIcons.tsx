"use client";

import { Float, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { COMU_ASSETS, COMU_STATIONS } from "./comuMapData";

function FloatingIcon({
  url,
  position,
  scale = 1.15,
}: {
  url: string;
  position: [number, number, number];
  scale?: number;
}) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <Float speed={1.35} floatIntensity={0.45} rotationIntensity={0.12}>
      <sprite position={position} scale={[scale, scale, scale]}>
        <spriteMaterial
          map={texture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.95}
        />
      </sprite>
    </Float>
  );
}

export function ComuIcons() {
  return (
    <group>
      {COMU_STATIONS.map((st) => (
        <FloatingIcon
          key={st.id}
          url={st.icon}
          position={[
            st.position[0] + 0.85,
            st.position[1] + 1.35,
            st.position[2] - 0.35,
          ]}
          scale={1.2}
        />
      ))}
      <FloatingIcon url={COMU_ASSETS.libro} position={[-9.6, 2.5, 0.3]} scale={1.45} />
      <FloatingIcon url={COMU_ASSETS.audio} position={[0.4, 2.9, -3.2]} scale={1.25} />
      <FloatingIcon url={COMU_ASSETS.estrella} position={[11.5, 3.1, 3.3]} scale={1.35} />
    </group>
  );
}
