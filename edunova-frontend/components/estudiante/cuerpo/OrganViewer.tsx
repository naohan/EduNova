"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ORGANOS, type OrganId } from "./organData";

type Props = {
  selectedId: OrganId;
  className?: string;
};

/**
 * Laboratorio de anatomía 3D — conserva GLB existentes + OrbitControls.
 */
export default function OrganViewer({ selectedId, className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const apiRef = useRef<{
    load: (id: OrganId) => void;
  } | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1458);
    scene.fog = new THREE.FogExp2(0x1a1458, 0.045);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 100);
    camera.position.set(0, 0.35, 2.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.6;
    controls.maxDistance = 6;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.9;
    controls.target.set(0, 0.15, 0);
    controls.enablePan = false;

    // Luces de laboratorio
    scene.add(new THREE.AmbientLight(0xb8c4ff, 0.45));
    scene.add(new THREE.HemisphereLight(0xe0d4ff, 0x2a1f7a, 0.7));

    const key = new THREE.DirectionalLight(0xfff8ef, 1.55);
    key.position.set(2.4, 3.4, 2.2);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x7dd3fc, 0.7);
    fill.position.set(-2.6, 1.4, -1.2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xf9a8d4, 0.45);
    rim.position.set(0, -1.2, -2.4);
    scene.add(rim);

    const spot = new THREE.SpotLight(0xffffff, 1.8, 12, Math.PI / 5, 0.45, 1);
    spot.position.set(0, 3.2, 1.5);
    spot.target.position.set(0, 0.2, 0);
    scene.add(spot);
    scene.add(spot.target);

    // Plataforma holográfica
    const lab = new THREE.Group();
    scene.add(lab);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.25, 0.12, 48),
      new THREE.MeshStandardMaterial({
        color: 0x312e81,
        metalness: 0.55,
        roughness: 0.35,
        emissive: 0x5636d9,
        emissiveIntensity: 0.25,
      }),
    );
    base.position.y = -0.35;
    lab.add(base);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.035, 12, 64),
      new THREE.MeshStandardMaterial({
        color: 0x25cfe0,
        emissive: 0x25cfe0,
        emissiveIntensity: 0.7,
        metalness: 0.4,
        roughness: 0.3,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.28;
    lab.add(ring);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.02, 10, 48),
      new THREE.MeshBasicMaterial({
        color: 0xa78bfa,
        transparent: true,
        opacity: 0.55,
      }),
    );
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = -0.26;
    lab.add(ring2);

    // Partículas suaves
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(90);
    for (let i = 0; i < 90; i++) sparkPos[i] = (Math.random() - 0.5) * 4;
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
    const sparks = new THREE.Points(
      sparkGeo,
      new THREE.PointsMaterial({
        color: 0xc4b5fd,
        size: 0.035,
        transparent: true,
        opacity: 0.65,
      }),
    );
    scene.add(sparks);

    const root = new THREE.Group();
    scene.add(root);

    const loader = new GLTFLoader();
    let alive = true;
    let frame = 0;
    let enterT = 0;
    let entering = false;

    function clearRoot() {
      while (root.children.length) {
        const child = root.children[0];
        root.remove(child);
        child.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const mat = obj.material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          }
        });
      }
    }

    function fitCamera(object: THREE.Object3D) {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
      object.position.y += 0.15;

      const maxDim = Math.max(size.x, size.y, size.z, 0.001);
      const dist = maxDim * 2.55;
      camera.near = Math.max(dist / 100, 0.01);
      camera.far = dist * 40;
      camera.updateProjectionMatrix();
      camera.position.set(dist * 0.55, dist * 0.4, dist);
      controls.target.set(0, 0.15, 0);
      controls.minDistance = maxDim * 0.85;
      controls.maxDistance = maxDim * 8;
      controls.update();
    }

    function playEntrance() {
      enterT = 0;
      entering = true;
      root.scale.setScalar(0.15);
      root.rotation.y = -0.8;
    }

    function showFallback(id: OrganId) {
      clearRoot();
      const organ = ORGANOS.find((o) => o.id === id)!;
      const color = new THREE.Color(organ.color);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 48, 48),
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.4,
          metalness: 0.12,
          emissive: color,
          emissiveIntensity: 0.15,
        }),
      );
      root.add(mesh);
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.035, 16, 64),
        new THREE.MeshBasicMaterial({
          color: 0x25cfe0,
          transparent: true,
          opacity: 0.4,
        }),
      );
      halo.rotation.x = Math.PI / 2.4;
      root.add(halo);
      fitCamera(root);
      playEntrance();
      setStatus("fallback");
    }

    function load(id: OrganId) {
      const organ = ORGANOS.find((o) => o.id === id);
      if (!organ) return;

      // Tinte de spotlight según órgano
      const accent = new THREE.Color(organ.color);
      spot.color.copy(accent).lerp(new THREE.Color(0xffffff), 0.55);

      if (!organ.modelo) {
        showFallback(id);
        return;
      }

      setStatus("loading");
      loader.load(
        organ.modelo,
        (gltf) => {
          if (!alive) return;
          clearRoot();
          const model = gltf.scene;
          model.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              obj.castShadow = false;
              obj.receiveShadow = false;
            }
          });
          root.add(model);
          fitCamera(model);
          playEntrance();
          setStatus("ready");
        },
        undefined,
        () => {
          if (!alive) return;
          showFallback(id);
        },
      );
    }

    apiRef.current = { load };
    load(selectedId);

    const clock = new THREE.Clock();
    const animate = () => {
      if (!alive) return;
      frame = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      ring.rotation.z += dt * 0.35;
      ring2.rotation.z -= dt * 0.55;
      sparks.rotation.y += dt * 0.08;

      if (entering) {
        enterT += dt;
        const t = Math.min(1, enterT / 0.55);
        const ease = 1 - Math.pow(1 - t, 3);
        root.scale.setScalar(0.15 + ease * 0.85);
        root.rotation.y = -0.8 + ease * 0.8;
        if (t >= 1) entering = false;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      ro.disconnect();
      clearRoot();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiRef.current?.load(selectedId);
  }, [selectedId]);

  return (
    <div className={`relative ${className ?? "h-full min-h-[320px] w-full"}`}>
      <div
        ref={mountRef}
        className="h-full w-full touch-none"
        role="img"
        aria-label="Laboratorio 3D de órganos del cuerpo humano"
      />
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#1a1458]/55 text-sm font-semibold text-white">
          Cargando órgano 3D…
        </div>
      )}
      {status === "fallback" && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-[#5636D9] shadow">
          Vista esquemática: el modelo 3D está en los órganos principales
        </div>
      )}
    </div>
  );
}
