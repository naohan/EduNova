"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import { LIMITE_MUNDO, PLANETAS, RADIO_SOL, posicionDe, type ConfigPiloto, type IdPlaneta } from "./espacioData";
import { HtmlInicial } from "./HtmlInicial";
import {
  Asteroide3D,
  CoheteVisual,
  EstrellaMoneda3D,
  GalaxiaEspiral,
  PlanetaVisual,
  SolVisual,
} from "./espacioVisual";

type Props = {
  config: ConfigPiloto;
  objetivo: IdPlaneta | null;
  celebracion: number;
  onPlaneta: (id: IdPlaneta) => void;
  onEstrella: () => void;
  onChoque: () => void;
  /** Punto del radar que sigue al cohete. Se mueve sin pasar por React: cambia en cada cuadro. */
  marcador: RefObject<SVGCircleElement | null>;
};

const CAMARA = new THREE.Vector3(0, 24, 17);
const INICIO = new THREE.Vector3(9, 0, 8);
const TOTAL_ESTRELLAS = 34;
const TOTAL_CHISPAS = 48;
const ESPERA_TOQUE_S = 1.6;
const ATURDIDO_S = 0.9;
const TECLAS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  KeyW: [0, -1],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0],
};

function crearPrng(semilla = 123456789) {
  let s = semilla >>> 0;
  return () => {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >>> 17)) >>> 0;
    s = (s ^ (s << 5)) >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

const prngEstrellas = crearPrng(314159);
function puntoAlAzar() {
  const angulo = prngEstrellas() * Math.PI * 2;
  const radio = 9 + prngEstrellas() * (LIMITE_MUNDO - 12);
  return new THREE.Vector3(Math.cos(angulo) * radio, 0, Math.sin(angulo) * radio);
}

const prngChispas = crearPrng(271828);
const PUNTOS_ESTRELLA = Array.from({ length: TOTAL_ESTRELLAS }, puntoAlAzar);
const DIRECCION_CHISPAS = Array.from({ length: TOTAL_CHISPAS }, () =>
  new THREE.Vector3(prngChispas() - 0.5, prngChispas() * 0.8, prngChispas() - 0.5).normalize(),
);

// Objetos de trabajo de cada cuadro: crearlos en el bucle generaría basura 60 veces por segundo.
const PLANO = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const punto = new THREE.Vector3();
const deseo = new THREE.Vector3();
const auxiliar = new THREE.Vector3();
const matriz = new THREE.Object3D();

/** Quita la parte de la velocidad que va contra la superficie: la nave rodea el obstáculo sin trabarse. */
function deslizar(velocidad: THREE.Vector3, normal: THREE.Vector3) {
  const contra = velocidad.dot(normal);
  if (contra < 0) velocidad.addScaledVector(normal, -contra);
}

function Mundo({ config, objetivo, celebracion, onPlaneta, onEstrella, onChoque, marcador }: Props) {
  const nave = useRef<THREE.Group>(null);
  const flecha = useRef<THREE.Group>(null);
  const estrellas = useRef<THREE.Group>(null);
  const rocas = useRef<THREE.Group>(null);
  const chispas = useRef<THREE.InstancedMesh>(null);
  const ondaCelebracion = useRef<THREE.Mesh>(null);

  const velocidad = useRef(new THREE.Vector3());
  const posicion = useRef(INICIO.clone());
  const teclas = useRef(new Set<string>());
  const presionado = useRef(false);
  const toques = useRef(new Map<string, number>());
  const aturdidoHasta = useRef(0);
  const inicioChispas = useRef(-10);
  const eventos = useRef({ onPlaneta, onEstrella, onChoque, objetivo });

  const asteroides = useMemo(
    () =>
      Array.from({ length: config.asteroides }, (_, i) => ({
        radio: 13 + ((i * 47) % 50),
        angulo: i * 2.4,
        giro: (i % 2 ? 1 : -1) * (0.09 + (i % 5) * 0.03),
        tamano: 0.9 + (i % 3) * 0.45,
      })),
    [config.asteroides],
  );

  useEffect(() => {
    eventos.current = { onPlaneta, onEstrella, onChoque, objetivo };
  }, [onPlaneta, onEstrella, onChoque, objetivo]);

  useEffect(() => {
    if (celebracion) inicioChispas.current = -1; // se fija en el próximo cuadro
  }, [celebracion]);

  useEffect(() => {
    const bajar = (e: KeyboardEvent) => {
      if (!(e.code in TECLAS)) return;
      e.preventDefault();
      teclas.current.add(e.code);
    };
    const subir = (e: KeyboardEvent) => teclas.current.delete(e.code);
    const presionar = () => (presionado.current = true);
    const soltar = () => (presionado.current = false);
    window.addEventListener("keydown", bajar);
    window.addEventListener("keyup", subir);
    window.addEventListener("pointerdown", presionar);
    window.addEventListener("pointerup", soltar);
    window.addEventListener("pointercancel", soltar);
    return () => {
      window.removeEventListener("keydown", bajar);
      window.removeEventListener("keyup", subir);
      window.removeEventListener("pointerdown", presionar);
      window.removeEventListener("pointerup", soltar);
      window.removeEventListener("pointercancel", soltar);
    };
  }, []);

  useFrame((estado, delta) => {
    const dt = Math.min(delta, 0.05);
    const ahora = estado.clock.elapsedTime;
    const pos = posicion.current;
    const vel = velocidad.current;

    // Control: flechas o mantener presionado hacia donde se quiere ir.
    deseo.set(0, 0, 0);
    for (const tecla of teclas.current) {
      const [x, z] = TECLAS[tecla];
      deseo.x += x;
      deseo.z += z;
    }
    if (presionado.current) {
      estado.raycaster.setFromCamera(estado.pointer, estado.camera);
      if (estado.raycaster.ray.intersectPlane(PLANO, punto)) {
        auxiliar.subVectors(punto, pos);
        if (auxiliar.length() > 1) deseo.add(auxiliar.normalize());
      }
    }
    if (deseo.lengthSq() > 0) deseo.normalize();
    const aturdido = ahora < aturdidoHasta.current;
    deseo.multiplyScalar(config.velocidad * (aturdido ? 0.35 : 1));
    vel.lerp(deseo, 1 - Math.exp(-dt * 3.5));
    pos.addScaledVector(vel, dt);
    if (pos.length() > LIMITE_MUNDO) pos.setLength(LIMITE_MUNDO);

    // El Sol y los planetas no dejan pasar, pero chocar no castiga.
    if (pos.length() < RADIO_SOL + 1) {
      pos.setLength(RADIO_SOL + 1);
      deslizar(vel, auxiliar.copy(pos).normalize());
    }
    for (const planeta of PLANETAS) {
      const [x, z] = posicionDe(planeta);
      auxiliar.set(pos.x - x, 0, pos.z - z);
      const contacto = planeta.radio + 1.1;
      if (auxiliar.length() >= contacto) continue;
      pos.set(x, 0, z).addScaledVector(auxiliar.normalize(), contacto);
      deslizar(vel, auxiliar);
      if (ahora - (toques.current.get(planeta.id) ?? -9) > ESPERA_TOQUE_S) {
        toques.current.set(planeta.id, ahora);
        eventos.current.onPlaneta(planeta.id);
      }
    }

    marcador.current?.setAttribute("cx", pos.x.toFixed(1));
    marcador.current?.setAttribute("cy", pos.z.toFixed(1));

    if (nave.current) {
      nave.current.position.copy(pos);
      const guia = deseo.lengthSq() > 0 ? deseo : vel;
      if (guia.lengthSq() > 0.2) {
        const rumbo = Math.atan2(guia.x, guia.z);
        const giro = ((rumbo - nave.current.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        nave.current.rotation.y += giro * Math.min(1, dt * 10);
      }
      nave.current.position.y = Math.sin(ahora * 3) * 0.15;
      nave.current.rotation.z = aturdido ? Math.sin(ahora * 30) * 0.3 : 0;
    }

    if (flecha.current) {
      const destino = PLANETAS.find((p) => p.id === eventos.current.objetivo);
      flecha.current.visible = config.flecha && Boolean(destino);
      if (destino) {
        const [x, z] = posicionDe(destino);
        flecha.current.position.set(pos.x, 1.8, pos.z);
        flecha.current.rotation.y = Math.atan2(x - pos.x, z - pos.z);
      }
    }

    estrellas.current?.children.forEach((estrella) => {
      estrella.rotation.y += dt * 2;
      if (estrella.position.distanceTo(pos) < 1.8) {
        estrella.position.copy(puntoAlAzar());
        eventos.current.onEstrella();
      }
    });

    rocas.current?.children.forEach((roca, i) => {
      const a = asteroides[i];
      const angulo = a.angulo + ahora * a.giro;
      roca.position.set(Math.cos(angulo) * a.radio, 0, Math.sin(angulo) * a.radio);
      roca.rotation.x += dt;
      roca.rotation.y += dt * 0.7;
      if (roca.position.distanceTo(pos) < a.tamano + 1 && !aturdido) {
        aturdidoHasta.current = ahora + ATURDIDO_S;
        vel.multiplyScalar(-0.8);
        eventos.current.onChoque();
      }
    });

    if (chispas.current) {
      if (inicioChispas.current === -1) inicioChispas.current = ahora;
      const t = ahora - inicioChispas.current;
      chispas.current.visible = t < 1.3;
      if (chispas.current.visible) {
        DIRECCION_CHISPAS.forEach((dir, i) => {
          matriz.position.copy(pos).addScaledVector(dir, 2 + t * 9);
          matriz.position.y += 1.5 - t * t * 5;
          matriz.scale.setScalar(Math.max(0, 0.45 * (1 - t / 1.3)));
          matriz.updateMatrix();
          chispas.current!.setMatrixAt(i, matriz.matrix);
        });
        chispas.current.instanceMatrix.needsUpdate = true;
      }
    }

    if (ondaCelebracion.current) {
      const t = ahora - inicioChispas.current;
      ondaCelebracion.current.visible = t >= 0 && t < 1.3;
      if (ondaCelebracion.current.visible) {
        const s = 1 + t * 14;
        ondaCelebracion.current.position.copy(pos);
        ondaCelebracion.current.scale.set(s, s, 1);
        (ondaCelebracion.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.85 * (1 - t / 1.3));
      }
    }

    estado.camera.position.lerp(auxiliar.copy(pos).add(CAMARA), 1 - Math.exp(-dt * 4));
    estado.camera.lookAt(pos);
  });

  return (
    <>
      <ambientLight intensity={0.65} color="#C4D0FF" />
      <pointLight position={[0, 8, 0]} intensity={2.6} decay={0} color="#FFF2DD" />
      <Stars radius={120} depth={40} count={1800} factor={4} fade speed={0.5} />
      <GalaxiaEspiral />

      <SolVisual />

      {PLANETAS.map((p) => (
        <mesh key={p.id} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[p.orbita - 0.06, p.orbita + 0.06, 128]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.16} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {PLANETAS.map((p) => {
        const [x, z] = posicionDe(p);
        return (
          <group key={p.id} position={[x, 0, z]}>
            <PlanetaVisual
              id={p.id}
              radio={p.radio}
              esObjetivo={config.flecha && objetivo === p.id}
            >
              {config.etiquetas ? (
                <Html center position={[0, p.radio + 1.2, 0]} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
                  <span className="rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold whitespace-nowrap text-white">
                    {p.nombre}
                  </span>
                </Html>
              ) : null}
            </PlanetaVisual>
          </group>
        );
      })}

      <group ref={estrellas}>
        {PUNTOS_ESTRELLA.map((inicio, i) => (
          <EstrellaMoneda3D key={i} position={inicio} />
        ))}
      </group>

      <group ref={rocas}>
        {asteroides.map((a, i) => (
          <group key={i} scale={a.tamano}>
            <Asteroide3D />
          </group>
        ))}
      </group>

      <group ref={nave} position={INICIO}>
        <CoheteVisual velocidad={velocidad.current.length()} />
      </group>

      <group ref={flecha} visible={false}>
        <mesh position={[0, 0, 2.6]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.6, 1.4, 4]} />
          <meshBasicMaterial color="#FFC928" />
        </mesh>
      </group>

      <mesh ref={ondaCelebracion} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.5, 0.7, 48]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <instancedMesh ref={chispas} args={[undefined, undefined, TOTAL_CHISPAS]} visible={false}>
        <octahedronGeometry args={[1]} />
        <meshBasicMaterial color="#FFC928" />
      </instancedMesh>
    </>
  );
}

export default function PilotoEscena(props: Props) {
  return (
    <div className="isolate h-full w-full touch-none select-none">
      <Canvas camera={{ position: [9, 24, 25], fov: 50, far: 400 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <color attach="background" args={["#07061F"]} />
        <HtmlInicial />
        <Mundo {...props} />
      </Canvas>
    </div>
  );
}
