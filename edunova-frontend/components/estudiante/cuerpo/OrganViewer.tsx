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
 * Visor 3D de órganos con Three.js + GLTFLoader
 * (misma pila que el modo Estudio de jceronch1/Cuerpo-humano_3D).
 * El repo original usa también <model-viewer> en la galería principal.
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
    scene.background = new THREE.Color(0xf4f0ff);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 100);
    camera.position.set(0, 0.15, 2.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.6;
    controls.maxDistance = 6;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d0f0, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(2.2, 3.2, 2.5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xb8c8ff, 1.1);
    fill.position.set(-2.4, 1.2, -1.5);
    scene.add(fill);

    const root = new THREE.Group();
    scene.add(root);

    const loader = new GLTFLoader();
    let alive = true;
    let frame = 0;
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

      const maxDim = Math.max(size.x, size.y, size.z, 0.001);
      const dist = maxDim * 2.4;
      camera.near = Math.max(dist / 100, 0.01);
      camera.far = dist * 40;
      camera.updateProjectionMatrix();
      camera.position.set(dist * 0.55, dist * 0.35, dist);
      controls.target.set(0, 0, 0);
      controls.minDistance = maxDim * 0.8;
      controls.maxDistance = maxDim * 8;
      controls.update();
    }

    function showFallback(id: OrganId) {
      clearRoot();
      const organ = ORGANOS.find((o) => o.id === id)!;
      const color = new THREE.Color(organ.color);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 48, 48),
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.45,
          metalness: 0.08,
        }),
      );
      root.add(mesh);
      // soft accent rings for “ficha” look
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.035, 16, 64),
        new THREE.MeshBasicMaterial({ color: 0x5636d9, transparent: true, opacity: 0.35 }),
      );
      ring.rotation.x = Math.PI / 2.4;
      root.add(ring);
      fitCamera(root);
      setStatus("fallback");
    }

    function load(id: OrganId) {
      const organ = ORGANOS.find((o) => o.id === id);
      if (!organ) return;

      if (!organ.modelo) {
        showFallback(id);
        return;
      }

      setStatus("loading");
      const url = organ.modelo;
      loader.load(
        url,
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

    const animate = () => {
      if (!alive) return;
      frame = requestAnimationFrame(animate);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once; selection via apiRef
  }, []);

  useEffect(() => {
    apiRef.current?.load(selectedId);
  }, [selectedId]);

  return (
    <div className={`relative ${className ?? "h-full min-h-[320px] w-full"}`}>
      <div
        ref={mountRef}
        className="h-full w-full"
        role="img"
        aria-label="Visor 3D de órganos del cuerpo humano"
      />
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#F4F0FF]/80 text-sm text-[#17164F]">
          Cargando modelo 3D…
        </div>
      )}
      {status === "fallback" && (
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-medium text-[#5636D9] shadow">
          Vista esquemática · ficha completa a la derecha
        </div>
      )}
    </div>
  );
}
