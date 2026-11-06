"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Obra } from "../valle/valleObra";
import { construirExplorador } from "../valle/valleAldea";

export interface ArenaEscenaProps {
  phase: "sync_waiting" | "duel_battle" | "duel_results";
  lastAnswer?: { correct: boolean; id: number } | null;
  userWon?: boolean;
}

const PI = Math.PI;
const CELEBRACION_S = 1.4;
const ENCOGIDO_S = 0.4;
const PEBETEROS: Array<[number, number]> = [
  [-4.2, -4.2],
  [4.2, -4.2],
  [-4.2, 4.2],
  [4.2, 4.2],
];

function crearPrng(semilla = 123456789) {
  let s = semilla >>> 0;
  return () => {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >>> 17)) >>> 0;
    s = (s ^ (s << 5)) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

/** Interior del Coliseo en una sola llamada de dibujo. */
function crearGeometriaColiseo(): THREE.BufferGeometry {
  const o = new Obra();

  o.cilindro(7.2, 7.2, 0.4, 36, "#DFC59E", [0, -0.2, 0]);
  o.corona(2.0, 2.18, 36, "#FFC928", [0, 0.02, 0]);

  // Gradas escalonadas
  o.tubo(7.2, 0.6, 36, "#B8AC9C", [0, 0.3, 0]);
  o.corona(7.2, 8.4, 36, "#C8BEB0", [0, 0.6, 0]);
  o.tubo(8.4, 0.7, 36, "#AFA393", [0, 0.95, 0]);
  o.corona(8.4, 9.6, 36, "#BFB5A5", [0, 1.3, 0]);
  o.tubo(9.6, 0.7, 36, "#9E9283", [0, 1.65, 0]);
  o.corona(9.6, 10.8, 36, "#B4AA9B", [0, 2.0, 0]);

  // Columnas con estandartes azules y dorados
  for (let i = 0; i < 12; i++) {
    const ang = (i * PI * 2) / 12;
    const x = Math.cos(ang) * 10.4;
    const z = Math.sin(ang) * 10.4;
    // Cara del estandarte hacia el centro de la arena
    const haciaCentro = -ang - PI / 2;

    o.cilindro(0.32, 0.36, 3.2, 12, "#EAE3D5", [x, 3.6, z]);
    o.caja(0.85, 0.25, 0.85, "#F2ECE2", [x, 5.2, z], [0, ang, 0]);

    const fondo = i % 2 === 0 ? "#2563EB" : "#E2B93B";
    const franja = i % 2 === 0 ? "#FFC928" : "#1D4ED8";
    o.caja(0.7, 1.4, 0.04, fondo, [x * 0.92, 3.2, z * 0.92], [0, haciaCentro, 0]);
    o.caja(0.7, 0.16, 0.05, franja, [x * 0.92, 3.5, z * 0.92], [0, haciaCentro, 0]);
  }

  o.tubo(10.5, 0.45, 36, "#D5CABE", [0, 5.4, 0]);

  for (const [x, z] of PEBETEROS) {
    o.cilindro(0.24, 0.18, 0.9, 10, "#332F38", [x, 0.45, z]);
    o.cilindro(0.42, 0.22, 0.35, 10, "#48434F", [x, 1.05, z]);
  }

  return o.geometria();
}

type Asiento = { x: number; y: number; z: number; giro: number; color: string };

/** Gradas llenas detrás de los duelistas. El lado de la cámara queda libre para no tapar la arena. */
function crearAsientos() {
  const colores = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];
  const asientos: Asiento[] = [];
  for (const fila of [
    { radio: 7.8, y: 0.6, cantidad: 10 },
    { radio: 9.0, y: 1.3, cantidad: 12 },
    { radio: 10.2, y: 2.0, cantidad: 14 },
  ]) {
    for (let i = 0; i < fila.cantidad; i++) {
      const ang = -PI / 2 + (i / (fila.cantidad - 1) - 0.5) * PI * 1.5;
      asientos.push({
        x: Math.cos(ang) * fila.radio,
        y: fila.y,
        z: Math.sin(ang) * fila.radio,
        giro: Math.atan2(-Math.cos(ang), -Math.sin(ang)),
        color: colores[asientos.length % colores.length],
      });
    }
  }
  return asientos;
}

const ASIENTOS = crearAsientos();

// Objetos de trabajo de cada cuadro: crearlos en el bucle generaría basura 60 veces por segundo.
const trabajo = new THREE.Object3D();

/** Público instanciado. Cada cuadro parte de su asiento, así nunca se va moviendo de lugar. */
function PublicoGradas({ celebraHasta, victoria }: { celebraHasta: React.RefObject<number>; victoria: boolean }) {
  const cuerposRef = useRef<THREE.InstancedMesh>(null);
  const cabezasRef = useRef<THREE.InstancedMesh>(null);
  const saltando = useRef(false);

  // Cuerpo y cabeza van aparte: el color de cada espectador solo debe teñir la ropa.
  const { geoCuerpo, geoCabeza } = useMemo(() => {
    const cuerpo = new Obra();
    cuerpo.cilindro(0.17, 0.22, 0.5, 8, "#FFFFFF", [0, 0.25, 0]);
    const cabeza = new Obra();
    cabeza.esfera(0.17, "#F2C9A8", [0, 0.66, 0], undefined, 1);
    cabeza.esfera(0.175, "#3D2314", [0, 0.74, -0.03], [1, 0.62, 1], 1);
    return { geoCuerpo: cuerpo.geometria(), geoCabeza: cabeza.geometria() };
  }, []);

  useEffect(() => {
    const cuerpos = cuerposRef.current;
    const cabezas = cabezasRef.current;
    if (!cuerpos || !cabezas) return;
    const color = new THREE.Color();
    ASIENTOS.forEach((a, i) => {
      trabajo.position.set(a.x, a.y, a.z);
      trabajo.rotation.set(0, a.giro, 0);
      trabajo.updateMatrix();
      cuerpos.setMatrixAt(i, trabajo.matrix);
      cabezas.setMatrixAt(i, trabajo.matrix);
      cuerpos.setColorAt(i, color.set(a.color));
    });
    cuerpos.instanceMatrix.needsUpdate = true;
    cabezas.instanceMatrix.needsUpdate = true;
    if (cuerpos.instanceColor) cuerpos.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state) => {
    const cuerpos = cuerposRef.current;
    const cabezas = cabezasRef.current;
    if (!cuerpos || !cabezas) return;
    const ahora = state.clock.elapsedTime;
    const celebra = victoria || ahora < celebraHasta.current;
    if (!celebra && !saltando.current) return;
    saltando.current = celebra;

    ASIENTOS.forEach((a, i) => {
      trabajo.position.set(a.x, a.y + (celebra ? Math.abs(Math.sin(ahora * 7 + i * 0.7)) * 0.24 : 0), a.z);
      trabajo.rotation.set(0, a.giro, 0);
      trabajo.updateMatrix();
      cuerpos.setMatrixAt(i, trabajo.matrix);
      cabezas.setMatrixAt(i, trabajo.matrix);
    });
    cuerpos.instanceMatrix.needsUpdate = true;
    cabezas.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={cuerposRef} args={[geoCuerpo, undefined, ASIENTOS.length]} frustumCulled={false}>
        <meshStandardMaterial vertexColors roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={cabezasRef} args={[geoCabeza, undefined, ASIENTOS.length]} frustumCulled={false}>
        <meshStandardMaterial vertexColors roughness={0.6} />
      </instancedMesh>
    </>
  );
}

/** Las cuatro llamas son instancias de una misma figura: una sola llamada de dibujo. */
function Antorchas() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const geo = useMemo(() => {
    const o = new Obra();
    o.cono(0.22, 0.5, 8, "#FF7A18", [0, 0.18, 0]);
    o.cono(0.12, 0.34, 8, "#FFDD44", [0, 0.14, 0.11]);
    o.cono(0.12, 0.34, 8, "#FFDD44", [0, 0.14, -0.11]);
    return o.geometria();
  }, []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    PEBETEROS.forEach(([x, z], i) => {
      const llama = 1 + Math.sin(state.clock.elapsedTime * 14 + i * 1.7) * 0.14;
      trabajo.position.set(x, 1.25, z);
      trabajo.rotation.set(0, 0, 0);
      trabajo.scale.set(llama, llama * 1.1, llama);
      trabajo.updateMatrix();
      mesh.setMatrixAt(i, trabajo.matrix);
    });
    trabajo.scale.set(1, 1, 1);
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[geo, undefined, PEBETEROS.length]} frustumCulled={false}>
        <meshBasicMaterial vertexColors />
      </instancedMesh>
      <pointLight position={[-4.2, 1.8, -4.2]} color="#FFA439" intensity={6} distance={9} decay={2} />
      <pointLight position={[4.2, 1.8, -4.2]} color="#FFA439" intensity={6} distance={9} decay={2} />
    </>
  );
}

/** Confeti de victoria: una sola nube de puntos. */
function ConfetiVictoria() {
  const puntosRef = useRef<THREE.Points>(null);

  const { geo, mat } = useMemo(() => {
    const total = 70;
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    const paleta = ["#EF4444", "#3B82F6", "#10B981", "#FFC928", "#EC4899", "#8B5CF6"];
    const prng = crearPrng(778899);
    const c = new THREE.Color();
    for (let i = 0; i < total; i++) {
      pos[i * 3] = (prng() - 0.5) * 8;
      pos[i * 3 + 1] = 1 + prng() * 5;
      pos[i * 3 + 2] = (prng() - 0.5) * 8;
      c.set(paleta[i % paleta.length]);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { geo: g, mat: new THREE.PointsMaterial({ size: 0.16, vertexColors: true, transparent: true, opacity: 0.95 }) };
  }, []);

  useFrame((_, delta) => {
    if (!puntosRef.current) return;
    const dt = Math.min(delta, 0.05);
    const atributo = puntosRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = atributo.array as Float32Array;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3 + 1] -= dt * 2.2;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 4) * dt;
      if (arr[i * 3 + 1] < 0.1) arr[i * 3 + 1] = 5.5;
    }
    atributo.needsUpdate = true;
  });

  return <points ref={puntosRef} geometry={geo} material={mat} frustumCulled={false} />;
}

type Pieza = ReturnType<typeof construirExplorador>;

/** Mismas medidas que el explorador del valle: torso, brazos y piernas con sus pivotes. */
function Duelista({ pieza, brazoRef }: { pieza: Pieza; brazoRef?: React.RefObject<THREE.Group | null> }) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 }), []);
  return (
    <>
      <mesh geometry={pieza.cuerpo} material={material} position={[0, 0.76, 0]} />
      <mesh geometry={pieza.brazoI} material={material} position={[-0.31, 0.98, 0]} />
      <group ref={brazoRef} position={[0.31, 0.98, 0]}>
        <mesh geometry={pieza.brazoD} material={material} />
      </group>
      <mesh geometry={pieza.piernaI} material={material} position={[-0.13, 0.46, 0]} />
      <mesh geometry={pieza.piernaD} material={material} position={[0.13, 0.46, 0]} />
    </>
  );
}

/** Todo lo que usa useFrame vive aquí: esos hooks solo funcionan dentro del Canvas. */
function Coliseo({ phase, lastAnswer, userWon }: ArenaEscenaProps) {
  const geoColiseo = useMemo(() => crearGeometriaColiseo(), []);
  const exploradorYo = useMemo(() => construirExplorador(), []);
  const exploradorRival = useMemo(() => construirExplorador({ chaqueta: "#D9534F", gorra: "#2DBE70", ala: "#1B8A4F" }), []);

  const jugadorRef = useRef<THREE.Group>(null);
  const rivalRef = useRef<THREE.Group>(null);
  const brazoRef = useRef<THREE.Group>(null);
  const ondaRef = useRef<THREE.Mesh>(null);

  // La escena solo guarda qué pidió cada respuesta; los tiempos se fijan en el cuadro siguiente.
  const pedido = useRef<"acierto" | "fallo" | null>(null);
  const saltoDesde = useRef(-10);
  const encogidoHasta = useRef(-10);
  const celebraHasta = useRef(-10);

  useEffect(() => {
    if (lastAnswer) pedido.current = lastAnswer.correct ? "acierto" : "fallo";
  }, [lastAnswer]);

  const gano = phase === "duel_results" && Boolean(userWon);
  const rivalGano = phase === "duel_results" && userWon === false;

  useFrame((state) => {
    const ahora = state.clock.elapsedTime;

    if (pedido.current === "acierto") {
      saltoDesde.current = ahora;
      celebraHasta.current = ahora + CELEBRACION_S;
    } else if (pedido.current === "fallo") {
      encogidoHasta.current = ahora + ENCOGIDO_S;
    }
    pedido.current = null;

    const jugador = jugadorRef.current;
    const brazo = brazoRef.current;
    const onda = ondaRef.current;
    if (jugador && brazo && onda) {
      const salto = (ahora - saltoDesde.current) / 0.55; // de 0 a 1 mientras dura el salto
      onda.visible = salto >= 0 && salto < 1;
      jugador.scale.set(1, 1, 1);

      if (gano) {
        jugador.position.y = Math.abs(Math.sin(ahora * 6)) * 0.45;
        brazo.rotation.z = PI * 0.75 + Math.sin(ahora * 8) * 0.25;
      } else if (onda.visible) {
        const arco = Math.sin(salto * PI);
        jugador.position.y = arco * 0.65;
        brazo.rotation.z = arco * PI * 0.6;
        const escala = 1 + salto * 2.2;
        onda.scale.set(escala, escala, 1);
        (onda.material as THREE.MeshBasicMaterial).opacity = (1 - salto) * 0.8;
      } else if (ahora < encogidoHasta.current) {
        jugador.position.y = 0;
        jugador.scale.set(1.04, 0.92, 1.04);
        brazo.rotation.z = 0;
      } else {
        jugador.position.y = Math.sin(ahora * 2.5) * 0.025;
        brazo.rotation.z = 0;
      }
    }

    if (rivalRef.current) {
      rivalRef.current.position.y = rivalGano ? Math.abs(Math.sin(ahora * 6)) * 0.4 : Math.sin(ahora * 2.5 + 1) * 0.025;
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} color="#FFE6CC" />
      <directionalLight position={[5, 8, 4]} intensity={2.4} color="#FFF8E7" />
      <directionalLight position={[-5, 4, -4]} intensity={0.9} color="#94A3B8" />

      {/* Los muros circulares se ven por dentro: por eso las dos caras */}
      <mesh geometry={geoColiseo}>
        <meshStandardMaterial vertexColors roughness={0.65} metalness={0.08} side={THREE.DoubleSide} />
      </mesh>

      <Antorchas />
      <PublicoGradas celebraHasta={celebraHasta} victoria={gano} />

      <mesh ref={ondaRef} position={[-1.5, 0.04, 0]} rotation={[-PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.4, 0.6, 32]} />
        <meshBasicMaterial color="#FFC928" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <group ref={jugadorRef} position={[-1.5, 0, 0]} rotation={[0, PI / 2.6, 0]}>
        <Duelista pieza={exploradorYo} brazoRef={brazoRef} />
      </group>
      <group ref={rivalRef} position={[1.5, 0, 0]} rotation={[0, -PI / 2.6, 0]}>
        <Duelista pieza={exploradorRival} />
      </group>

      {gano ? <ConfetiVictoria /> : null}
    </>
  );
}

export default function ArenaEscena(props: ArenaEscenaProps) {
  return (
    <div className="isolate h-full w-full touch-none select-none">
      <Canvas camera={{ position: [0, 1.9, 6.1], fov: 34 }} dpr={[1, 1.5]} gl={{ antialias: true }} onCreated={({ camera }) => camera.lookAt(0, 0.95, 0)}>
        <color attach="background" args={["#BFE3F5"]} />
        <Coliseo {...props} />
      </Canvas>
    </div>
  );
}
