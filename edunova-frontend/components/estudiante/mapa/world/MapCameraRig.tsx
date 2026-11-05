"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type ControlsLike = {
  target: THREE.Vector3;
  update: () => void;
};

type Props = {
  focus: [number, number, number];
  mobile?: boolean;
  controls: React.MutableRefObject<ControlsLike | null>;
};

/** Suaviza el target de OrbitControls al cambiar de estación */
export function MapCameraRig({ focus, mobile = false, controls }: Props) {
  const goal = useRef(new THREE.Vector3(focus[0], mobile ? 0.9 : 1.0, focus[2]));
  const camGoal = useRef(new THREE.Vector3());
  const { camera } = useThree();
  const first = useRef(true);

  useEffect(() => {
    goal.current.set(focus[0], mobile ? 0.9 : 1.0, focus[2]);
    if (mobile) {
      camGoal.current.set(focus[0] + 3.2, 7.2, focus[2] + 7.5);
    } else {
      camGoal.current.set(
        THREE.MathUtils.clamp(focus[0] * 0.25 + 2, -2, 6),
        11,
        14,
      );
    }
  }, [focus, mobile]);

  useFrame(() => {
    const ctrl = controls.current;
    if (!ctrl) return;

    if (first.current) {
      ctrl.target.copy(goal.current);
      if (mobile) camera.position.copy(camGoal.current);
      first.current = false;
      return;
    }

    ctrl.target.lerp(goal.current, 0.07);
    if (mobile) {
      camera.position.lerp(camGoal.current, 0.055);
    }
    ctrl.update();
  });

  return null;
}
