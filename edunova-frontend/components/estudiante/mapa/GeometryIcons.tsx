"use client";

import { Float, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { MATH_ASSETS, MATH_STATIONS } from "./mathMapData";

function FloatingIcon({
  url,
  position,
  scale = 1.1,
  knockBlack = true,
}: {
  url: string;
  position: [number, number, number];
  scale?: number;
  knockBlack?: boolean;
}) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <Float speed={1.4} floatIntensity={0.45} rotationIntensity={0.12}>
      <sprite position={position} scale={[scale, scale, scale]}>
        <spriteMaterial
          map={texture}
          transparent
          depthWrite={false}
          // Additive hace invisible el negro de compás/regla/tesoro
          blending={knockBlack ? THREE.AdditiveBlending : THREE.NormalBlending}
          opacity={knockBlack ? 0.95 : 1}
        />
      </sprite>
    </Float>
  );
}

/** Iconos llamativos de geometría (assets/matematica) */
export function GeometryIcons() {
  return (
    <group>
      {MATH_STATIONS.map((st) => {
        const isCard = st.icon.includes("figura3d") || st.icon.includes("matematica");
        return (
          <FloatingIcon
            key={st.id}
            url={st.icon}
            position={[
              st.position[0] + 0.9,
              st.position[1] + 1.4,
              st.position[2] - 0.4,
            ]}
            scale={st.kind === "explorar3d" ? 1.3 : 1.1}
            knockBlack={!isCard}
          />
        );
      })}

      <FloatingIcon
        url={MATH_ASSETS.compas}
        position={[-9.8, 2.45, 0.2]}
        scale={1.4}
      />
      <FloatingIcon
        url={MATH_ASSETS.regla}
        position={[-0.2, 2.85, -3.4]}
        scale={1.25}
      />
      <FloatingIcon
        url={MATH_ASSETS.tesoro}
        position={[11.6, 3.05, 3.4]}
        scale={1.45}
      />
    </group>
  );
}
