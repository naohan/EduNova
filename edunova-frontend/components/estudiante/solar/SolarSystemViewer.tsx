"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SOLAR_BODIES, type PlanetId } from "./planetData";

type Props = {
  selectedId: PlanetId;
  onSelect: (id: PlanetId) => void;
  className?: string;
};

type BodyRuntime = {
  id: PlanetId;
  mesh: THREE.Object3D;
  orbit: number;
  speed: number;
  angle: number;
};

/**
 * Visor 3D educativo con Three.js (misma librería que
 * https://github.com/Ozymandros/solar-system).
 * Versión simplificada para el aula: órbitas circulares, sin lunas.
 */
export default function SolarSystemViewer({
  selectedId,
  onSelect,
  className,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  const focusRef = useRef<(id: PlanetId) => void>(() => {});

  selectedRef.current = selectedId;
  onSelectRef.current = onSelect;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0a2e);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(0, 28, 48);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 8;
    controls.maxDistance = 90;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const sunLight = new THREE.PointLight(0xfff2dd, 2.2, 0, 0);
    scene.add(sunLight);

    // Starfield
    const starsGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(900);
    for (let i = 0; i < 900; i++) starPos[i] = (Math.random() - 0.5) * 200;
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(
      new THREE.Points(
        starsGeo,
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.15 }),
      ),
    );

    const bodies: BodyRuntime[] = [];
    const meshById = new Map<PlanetId, THREE.Object3D>();

    for (const data of SOLAR_BODIES) {
      if (data.id === "sol") {
        const sun = new THREE.Mesh(
          new THREE.SphereGeometry(data.radius, 48, 48),
          new THREE.MeshBasicMaterial({ color: data.color }),
        );
        sun.name = data.id;
        scene.add(sun);

        const glow = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: makeGlowTexture(),
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
          }),
        );
        glow.scale.set(10, 10, 1);
        scene.add(glow);

        bodies.push({ id: data.id, mesh: sun, orbit: 0, speed: 0, angle: 0 });
        meshById.set(data.id, sun);
        continue;
      }

      // Orbit ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(data.orbit - 0.03, data.orbit + 0.03, 96),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.12,
          side: THREE.DoubleSide,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);

      const group = new THREE.Group();
      group.name = data.id;

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(data.radius, 32, 32),
        new THREE.MeshStandardMaterial({
          color: data.color,
          roughness: 0.85,
          metalness: 0.05,
        }),
      );
      group.add(mesh);

      if (data.id === "saturno") {
        const rings = new THREE.Mesh(
          new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.2, 64),
          new THREE.MeshBasicMaterial({
            color: 0xc9b896,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.75,
          }),
        );
        rings.rotation.x = -Math.PI / 2.4;
        group.add(rings);
      }

      const angle = Math.random() * Math.PI * 2;
      group.position.set(
        Math.cos(angle) * data.orbit,
        0,
        Math.sin(angle) * data.orbit,
      );
      scene.add(group);

      bodies.push({
        id: data.id,
        mesh: group,
        orbit: data.orbit,
        speed: data.speed,
        angle,
      });
      meshById.set(data.id, group);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function focusBody(id: PlanetId) {
      const obj = meshById.get(id);
      if (!obj) return;
      const target = new THREE.Vector3();
      obj.getWorldPosition(target);
      controls.target.lerp(target, 1);
      const dist = id === "sol" ? 18 : Math.max(6, SOLAR_BODIES.find((b) => b.id === id)!.radius * 8);
      const offset = new THREE.Vector3(dist * 0.6, dist * 0.45, dist);
      camera.position.copy(target.clone().add(offset));
      controls.update();
    }
    focusRef.current = focusBody;

    function onPointerDown(e: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(
        bodies.map((b) => b.mesh),
        true,
      );
      if (!hits.length) return;
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj && !meshById.has(obj.name as PlanetId) && obj.parent) {
        obj = obj.parent;
      }
      const id = (obj?.name || "") as PlanetId;
      if (meshById.has(id)) {
        onSelectRef.current(id);
        focusBody(id);
      }
    }
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    let frame = 0;
    let alive = true;
    const clock = new THREE.Clock();

    function animate() {
      if (!alive) return;
      frame = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      for (const b of bodies) {
        if (b.orbit <= 0) {
          b.mesh.rotation.y += dt * 0.15;
          continue;
        }
        b.angle += dt * 0.22 * b.speed;
        b.mesh.position.set(
          Math.cos(b.angle) * b.orbit,
          0,
          Math.sin(b.angle) * b.orbit,
        );
        b.mesh.rotation.y += dt * 0.8;
      }

      // Soft follow selected body
      const sel = meshById.get(selectedRef.current);
      if (sel && selectedRef.current !== "sol") {
        const t = new THREE.Vector3();
        sel.getWorldPosition(t);
        controls.target.lerp(t, 0.04);
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();
    focusBody(selectedRef.current);

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
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
    };
  }, []);

  // Re-focus when selection changes from carousel
  useEffect(() => {
    focusRef.current(selectedId);
  }, [selectedId]);

  return (
    <div
      ref={mountRef}
      className={className ?? "h-full min-h-[320px] w-full"}
      role="img"
      aria-label="Simulador 3D del Sistema Solar con Three.js"
    />
  );
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 64);
  g.addColorStop(0, "rgba(255,230,150,1)");
  g.addColorStop(0.35, "rgba(255,180,60,0.45)");
  g.addColorStop(1, "rgba(255,120,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}
