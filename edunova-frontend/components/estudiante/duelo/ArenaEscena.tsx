"use client";

import { useMemo, useRef, useEffect } from "react";
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

function crearPrng(semilla = 123456789) {
  let s = semilla >>> 0;
  return () => {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >>> 17)) >>> 0;
    s = (s ^ (s << 5)) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

/** Interior arquitectónico del Coliseo (1 sola llamada de dibujo vía Obra) */
function crearGeometriaColiseo(): THREE.BufferGeometry {
  const o = new Obra();

  // Suelo circular de arena
  o.cilindro(7.2, 7.2, 0.4, 36, "#DFC59E", [0, -0.2, 0]);

  // Círculo central luminoso de combate
  o.corona(2.0, 2.18, 36, "#FFC928", [0, 0.02, 0]);

  // Gradas concéntricas escalonadas
  o.tubo(7.2, 0.6, 36, "#B8AC9C", [0, 0.3, 0]);
  o.corona(7.2, 8.4, 36, "#C8BEB0", [0, 0.6, 0]);

  o.tubo(8.4, 0.7, 36, "#AFA393", [0, 0.95, 0]);
  o.corona(8.4, 9.6, 36, "#BFB5A5", [0, 1.3, 0]);

  o.tubo(9.6, 0.7, 36, "#9E9283", [0, 1.65, 0]);
  o.corona(9.6, 10.8, 36, "#B4AA9B", [0, 2.0, 0]);

  // Muro exterior con 12 columnas y arcos de piedra clara
  const totalColumnas = 12;
  for (let i = 0; i < totalColumnas; i++) {
    const ang = (i * PI * 2) / totalColumnas;
    const x = Math.cos(ang) * 10.4;
    const z = Math.sin(ang) * 10.4;

    // Columna
    o.cilindro(0.32, 0.36, 3.2, 12, "#EAE3D5", [x, 3.6, z]);
    // Capitel
    o.caja(0.85, 0.25, 0.85, "#F2ECE2", [x, 5.2, z], [0, ang, 0]);

    // Estandartes romanos colgantes (alternando azul y oro)
    const colorEstandarte = i % 2 === 0 ? "#2563EB" : "#E2B93B";
    const franja = i % 2 === 0 ? "#FFC928" : "#1D4ED8";
    o.caja(0.7, 1.4, 0.04, colorEstandarte, [x * 0.92, 3.2, z * 0.92], [0, ang, 0]);
    o.caja(0.7, 0.16, 0.05, franja, [x * 0.92, 3.5, z * 0.92], [0, ang, 0]);
  }

  // Cornisa superior continua del Coliseo
  o.tubo(10.5, 0.45, 36, "#D5CABE", [0, 5.4, 0]);

  // 4 pebeteros de hierro perimetrales para antorchas
  const posPebeteros = [
    [-4.2, 0, -4.2],
    [4.2, 0, -4.2],
    [-4.2, 0, 4.2],
    [4.2, 0, 4.2],
  ];
  for (const [px, py, pz] of posPebeteros) {
    o.cilindro(0.24, 0.18, 0.9, 10, "#332F38", [px, py + 0.45, pz]);
    o.cilindro(0.42, 0.22, 0.35, 10, "#48434F", [px, py + 1.05, pz]);
  }

  return o.geometria();
}

/** 36 Espectadores estilizados en gradas (1 único InstancedMesh) */
function PublicoGradas({
  celebrandoRef,
  victoria = false,
}: {
  celebrandoRef?: React.RefObject<boolean>;
  victoria?: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { geo, count, baseMatrices } = useMemo(() => {
    const o = new Obra();
    // Cuerpo espectador
    o.cilindro(0.16, 0.2, 0.48, 8, "#FFFFFF", [0, 0.24, 0]);
    // Cabeza
    o.esfera(0.14, "#F2C9A8", [0, 0.58, 0], undefined, 1);
    // Sombrero / pelo estilizado
    o.esfera(0.15, "#3D2314", [0, 0.65, 0], [1, 0.7, 1], 1);
    const g = o.geometria();

    const matrices: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();
    const colores = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

    // 3 filas en las gradas
    const filas = [
      { radio: 7.8, y: 0.6, cantidad: 10 },
      { radio: 9.0, y: 1.3, cantidad: 12 },
      { radio: 10.2, y: 2.0, cantidad: 14 },
    ];

    let total = 0;
    filas.forEach((f) => {
      total += f.cantidad;
    });

    return { geo: g, count: total, baseMatrices: matrices, filas, dummy, colores };
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const coloresHex = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];
    let idx = 0;

    const filas = [
      { radio: 7.8, y: 0.6, cantidad: 10 },
      { radio: 9.0, y: 1.3, cantidad: 12 },
      { radio: 10.2, y: 2.0, cantidad: 14 },
    ];

    filas.forEach((f) => {
      for (let i = 0; i < f.cantidad; i++) {
        // Dejamos el frente despejado para la cámara
        const ang = -PI * 0.75 + (i / (f.cantidad - 1)) * PI * 1.5;
        const x = Math.cos(ang) * f.radio;
        const z = Math.sin(ang) * f.radio;

        dummy.position.set(x, f.y, z);
        dummy.lookAt(0, 0.8, 0);
        dummy.updateMatrix();

        meshRef.current!.setMatrixAt(idx, dummy.matrix);
        meshRef.current!.setColorAt(idx, new THREE.Color(coloresHex[idx % coloresHex.length]));
        idx++;
      }
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [baseMatrices]);

  useFrame((state) => {
    const estaCelebrando = (celebrandoRef ? celebrandoRef.current : false) || victoria;
    if (!meshRef.current || !estaCelebrando) return;
    const ahora = state.clock.elapsedTime;
    const dummy = new THREE.Object3D();
    const mat = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const sca = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      meshRef.current.getMatrixAt(i, mat);
      mat.decompose(pos, quat, sca);
      // Salto festivo en gradas
      const salto = Math.abs(Math.sin(ahora * 8 + i * 0.5)) * 0.18;
      dummy.position.copy(pos);
      dummy.position.y += Math.sin(ahora * 12 + i) * 0.015 + (salto > 0.05 ? 0.02 : -0.01);
      dummy.quaternion.copy(quat);
      dummy.scale.copy(sca);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geo, undefined, count]}>
      <meshStandardMaterial vertexColors roughness={0.6} />
    </instancedMesh>
  );
}

/** Antorchas con fuego animado */
function Antorchas() {
  const fuegoRef = useRef<THREE.Group>(null);
  const posPebeteros: [number, number, number][] = [
    [-4.2, 1.25, -4.2],
    [4.2, 1.25, -4.2],
    [-4.2, 1.25, 4.2],
    [4.2, 1.25, 4.2],
  ];

  useFrame((state) => {
    if (!fuegoRef.current) return;
    const escala = 1 + Math.sin(state.clock.elapsedTime * 14) * 0.12;
    fuegoRef.current.children.forEach((child, i) => {
      child.scale.set(escala, escala * (1 + (i % 2 === 0 ? 0.08 : -0.08)), escala);
    });
  });

  return (
    <group ref={fuegoRef}>
      {posPebeteros.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <pointLight color="#FFA439" intensity={1.8} distance={7} decay={2} />
          {/* Llama estilizada */}
          <mesh position={[0, 0.18, 0]}>
            <coneGeometry args={[0.22, 0.5, 8]} />
            <meshBasicMaterial color="#FF7A18" />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <coneGeometry args={[0.12, 0.32, 8]} />
            <meshBasicMaterial color="#FFDD44" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Confeti 3D multicolor para la victoria final */
function ConfetiVictoria({ activo }: { activo: boolean }) {
  const puntosRef = useRef<THREE.Points>(null);

  const { geo, mat } = useMemo(() => {
    const cant = 70;
    const pos = new Float32Array(cant * 3);
    const col = new Float32Array(cant * 3);
    const paleta = ["#EF4444", "#3B82F6", "#10B981", "#FFC928", "#EC4899", "#8B5CF6"];

    const prng = crearPrng(778899);
    for (let i = 0; i < cant; i++) {
      pos[i * 3] = (prng() - 0.5) * 8;
      pos[i * 3 + 1] = 1 + prng() * 5;
      pos[i * 3 + 2] = (prng() - 0.5) * 8;

      const c = new THREE.Color(paleta[i % paleta.length]);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));

    const m = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    return { geo: g, mat: m };
  }, []);

  useFrame((_, dt) => {
    if (!activo || !puntosRef.current) return;
    const attr = puntosRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3 + 1] -= dt * 2.2;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 4) * 0.02;
      if (arr[i * 3 + 1] < 0.1) {
        arr[i * 3 + 1] = 5.5;
      }
    }
    attr.needsUpdate = true;
  });

  if (!activo) return null;

  return <primitive object={new THREE.Points(geo, mat)} ref={puntosRef} />;
}

/** Escena 3D del Coliseo y Duelistas */
export default function ArenaEscena({ phase, lastAnswer, userWon }: ArenaEscenaProps) {
  const geoColiseo = useMemo(() => crearGeometriaColiseo(), []);
  const exploradorYo = useMemo(() => construirExplorador(), []);
  const exploradorRival = useMemo(() => construirExplorador(), []);

  const jugadorRef = useRef<THREE.Group>(null);
  const rivalRef = useRef<THREE.Group>(null);
  const brazoDerJugadorRef = useRef<THREE.Mesh>(null);
  const ondaRef = useRef<THREE.Mesh>(null);

  const tiempoSalto = useRef(0);
  const celebrandoPublico = useRef(false);

  // Reacción instantánea ante la respuesta por refs
  useEffect(() => {
    if (!lastAnswer) return;
    if (lastAnswer.correct) {
      tiempoSalto.current = 1.0;
      celebrandoPublico.current = true;
      setTimeout(() => {
        celebrandoPublico.current = false;
      }, 1400);
    } else {
      // Pequeño encogimiento amable
      tiempoSalto.current = -0.5;
      setTimeout(() => {
        tiempoSalto.current = 0;
      }, 400);
    }
  }, [lastAnswer]);

  useFrame((state, dt) => {
    const ahora = state.clock.elapsedTime;

    // Animación del Jugador
    if (jugadorRef.current) {
      if (phase === "duel_results" && userWon) {
        // Celebración continua de victoria final
        jugadorRef.current.position.y = Math.abs(Math.sin(ahora * 6)) * 0.45;
        if (brazoDerJugadorRef.current) {
          brazoDerJugadorRef.current.rotation.z = PI * 0.75 + Math.sin(ahora * 8) * 0.25;
        }
      } else if (tiempoSalto.current > 0) {
        // Salto de acierto
        tiempoSalto.current = Math.max(0, tiempoSalto.current - dt * 2.5);
        const y = Math.sin((1 - tiempoSalto.current) * PI) * 0.65;
        jugadorRef.current.position.y = y;
        if (brazoDerJugadorRef.current) {
          brazoDerJugadorRef.current.rotation.z = Math.sin((1 - tiempoSalto.current) * PI) * PI * 0.6;
        }
        if (ondaRef.current) {
          ondaRef.current.visible = true;
          const escala = 1 + (1 - tiempoSalto.current) * 2.2;
          ondaRef.current.scale.set(escala, escala, 1);
          (ondaRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, tiempoSalto.current * 0.8);
        }
      } else if (tiempoSalto.current < 0) {
        // Encogimiento amable en fallo
        jugadorRef.current.position.y = -0.08;
        if (brazoDerJugadorRef.current) brazoDerJugadorRef.current.rotation.z = 0;
        if (ondaRef.current) ondaRef.current.visible = false;
      } else {
        // Respiración base
        jugadorRef.current.position.y = Math.sin(ahora * 2.5) * 0.025;
        if (brazoDerJugadorRef.current) brazoDerJugadorRef.current.rotation.z = 0;
        if (ondaRef.current) ondaRef.current.visible = false;
      }
    }

    // Animación del Rival
    if (rivalRef.current) {
      if (phase === "duel_results" && !userWon) {
        rivalRef.current.position.y = Math.abs(Math.sin(ahora * 6)) * 0.4;
      } else {
        rivalRef.current.position.y = Math.sin(ahora * 2.5 + 1) * 0.025;
      }
    }
  });

  return (
    <div className="isolate h-full w-full select-none touch-none">
      <Canvas
        camera={{ position: [0, 3.4, 7.8], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#100E26"]} />

        {/* Iluminación dramática del coliseo */}
        <ambientLight intensity={0.9} color="#FFE6CC" />
        <directionalLight position={[5, 8, 4]} intensity={1.8} color="#FFF8E7" castShadow={false} />
        <directionalLight position={[-5, 4, -4]} intensity={0.7} color="#94A3B8" />

        {/* Arquitectura del Coliseo */}
        <mesh geometry={geoColiseo}>
          <meshStandardMaterial vertexColors roughness={0.65} metalness={0.08} />
        </mesh>

        {/* Antorchas animadas */}
        <Antorchas />

        {/* Público instanciado en las gradas */}
        <PublicoGradas celebrandoRef={celebrandoPublico} victoria={phase === "duel_results" && Boolean(userWon)} />

        {/* Onda de choque de acierto en los pies del jugador */}
        <mesh ref={ondaRef} position={[-1.5, 0.02, 0]} rotation={[-PI / 2, 0, 0]} visible={false}>
          <ringGeometry args={[0.4, 0.6, 32]} />
          <meshBasicMaterial color="#FFC928" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>

        {/* DUELISTA 1: Jugador (Izquierda, mirando al centro) */}
        <group ref={jugadorRef} position={[-1.5, 0, 0]} rotation={[0, PI / 2.6, 0]}>
          <mesh geometry={exploradorYo.cuerpo}>
            <meshStandardMaterial vertexColors roughness={0.5} />
          </mesh>
          <mesh geometry={exploradorYo.brazoI} position={[-0.26, 0.28, 0]}>
            <meshStandardMaterial vertexColors roughness={0.5} />
          </mesh>
          <mesh ref={brazoDerJugadorRef} geometry={exploradorYo.brazoD} position={[0.26, 0.28, 0]}>
            <meshStandardMaterial vertexColors roughness={0.5} />
          </mesh>
          <mesh geometry={exploradorYo.piernaI} position={[-0.11, -0.28, 0]}>
            <meshStandardMaterial vertexColors roughness={0.5} />
          </mesh>
          <mesh geometry={exploradorYo.piernaD} position={[0.11, -0.28, 0]}>
            <meshStandardMaterial vertexColors roughness={0.5} />
          </mesh>
        </group>

        {/* DUELISTA 2: Rival (Derecha, mirando al centro) */}
        <group ref={rivalRef} position={[1.5, 0, 0]} rotation={[0, -PI / 2.6, 0]}>
          <mesh geometry={exploradorRival.cuerpo}>
            <meshStandardMaterial vertexColors roughness={0.5} />
          </mesh>
          <mesh geometry={exploradorRival.brazoI} position={[-0.26, 0.28, 0]}>
            <meshStandardMaterial vertexColors roughness={0.5} />
          </mesh>
          <mesh geometry={exploradorRival.brazoD} position={[0.26, 0.28, 0]}>
            <meshStandardMaterial vertexColors roughness={0.5} />
          </mesh>
          <mesh geometry={exploradorRival.piernaI} position={[-0.11, -0.28, 0]}>
            <meshStandardMaterial vertexColors roughness={0.5} />
          </mesh>
          <mesh geometry={exploradorRival.piernaD} position={[0.11, -0.28, 0]}>
            <meshStandardMaterial vertexColors roughness={0.5} />
          </mesh>
        </group>

        {/* Confeti de victoria final */}
        <ConfetiVictoria activo={phase === "duel_results" && Boolean(userWon)} />
      </Canvas>
    </div>
  );
}

