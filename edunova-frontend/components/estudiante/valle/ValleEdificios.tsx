"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  type ClimaHora,
  type LugarValleId,
  type PersonajeGuiaId,
  LUGARES_VALLE,
  PERSONAJES_GUIA,
  validarMovimiento,
} from "./valleData";
import { calcularAlturaTerreno } from "./ValleEntorno";

interface Props {
  clima: ClimaHora;
  calidad: "alta" | "ligera";
  prefersReducedMotion: boolean;
  lugarCercano: LugarValleId | null;
  onLugarCercanoChange: (id: LugarValleId | null) => void;
  personajeCercano: PersonajeGuiaId | null;
  onPersonajeCercanoChange: (id: PersonajeGuiaId | null) => void;
  novedades: { escuela: number; casa: number };
  preguntasDisponibles: { elena: boolean; mateo: boolean; vega: boolean };
  posicionJugador: [number, number, number];
  setPosicionJugador: (pos: [number, number, number]) => void;
  objetivoMovimiento: [number, number] | null;
  setObjetivoMovimiento: (obj: [number, number] | null) => void;
}

/** Baliza 3D flotante sobre edificios con novedades publicadas (forma, texto y color) */
function Baliza3D({
  posicion,
  cantidad,
  color,
}: {
  posicion: [number, number, number];
  cantidad: number;
  color: string;
}) {
  const grupoRef = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (grupoRef.current) {
      const t = state.clock.elapsedTime;
      grupoRef.current.position.y = posicion[1] + Math.sin(t * 2.5) * 0.16;
      grupoRef.current.rotation.y += dt * 0.7;
    }
  });

  return (
    <group ref={grupoRef} position={posicion}>
      <mesh>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.75, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <Html position={[0, 0.85, 0]} distanceFactor={14} center>
        <div
          className="flex items-center gap-1.5 rounded-full border-2 bg-white px-3 py-0.5 font-bold shadow-md"
          style={{ borderColor: color, color: "#17164F" }}
        >
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-black text-white"
            style={{ backgroundColor: color }}
          >
            {cantidad}
          </span>
          <span className="text-xs font-bold">
            {cantidad === 1 ? "unidad" : "unidades"}
          </span>
        </div>
      </Html>
    </group>
  );
}

export function ValleEdificios({
  clima,
  calidad,
  prefersReducedMotion,
  lugarCercano,
  onLugarCercanoChange,
  personajeCercano,
  onPersonajeCercanoChange,
  novedades,
  preguntasDisponibles,
  posicionJugador,
  setPosicionJugador,
  objetivoMovimiento,
  setObjetivoMovimiento,
}: Props) {
  const { camera } = useThree();

  // Nivel de emisión para ventanas y faroles según la hora
  const intensidadEmissive =
    clima === "noche" ? 1.6 : clima === "atardecer" ? 0.9 : 0.15;

  // Refs de animaciones arquitectónicas
  const relojHorasRef = useRef<THREE.Mesh>(null);
  const relojMinutosRef = useRef<THREE.Mesh>(null);
  const banderinEscuelaRef = useRef<THREE.Mesh>(null);
  const humoRef = useRef<THREE.Group>(null);
  const cupulaObsRef = useRef<THREE.Group>(null);
  const anillosObsRef = useRef<THREE.Group>(null);
  const cruzDoctorRef = useRef<THREE.Mesh>(null);
  const estandartesArenaRef = useRef<THREE.Group>(null);

  // Refs de personajes guía (P15)
  const elenaRef = useRef<THREE.Group>(null);
  const mateoRef = useRef<THREE.Group>(null);
  const vegaRef = useRef<THREE.Group>(null);

  // Refs del avatar explorador
  const personajeRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const brazoIzqRef = useRef<THREE.Group>(null);
  const brazoDerRef = useRef<THREE.Group>(null);
  const piernaIzqRef = useRef<THREE.Group>(null);
  const piernaDerRef = useRef<THREE.Group>(null);

  // Estado interno de movimiento del avatar
  const estadoMovimiento = useRef({
    x: posicionJugador[0],
    z: posicionJugador[2],
    rotacionY: 0,
    cicloCaminar: 0,
    enMovimiento: false,
    teclas: {
      arriba: false,
      abajo: false,
      izquierda: false,
      derecha: false,
    },
  });

  // Mantener sincronizado si cambia la posición inicial desde afuera
  useEffect(() => {
    estadoMovimiento.current.x = posicionJugador[0];
    estadoMovimiento.current.z = posicionJugador[2];
  }, [posicionJugador]);

  // Manejo de teclado (WASD y flechas)
  useEffect(() => {
    const alBajar = (e: KeyboardEvent) => {
      // Ignorar si el foco está en un input o diálogo
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      const t = estadoMovimiento.current.teclas;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") t.arriba = true;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") t.abajo = true;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") t.izquierda = true;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") t.derecha = true;

      // Si usa teclado, cancelar objetivo de clic
      if (t.arriba || t.abajo || t.izquierda || t.derecha) {
        setObjetivoMovimiento(null);
      }
    };

    const alSubir = (e: KeyboardEvent) => {
      const t = estadoMovimiento.current.teclas;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") t.arriba = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") t.abajo = false;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") t.izquierda = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") t.derecha = false;
    };

    window.addEventListener("keydown", alBajar);
    window.addEventListener("keyup", alSubir);
    return () => {
      window.removeEventListener("keydown", alBajar);
      window.removeEventListener("keyup", alSubir);
    };
  }, [setObjetivoMovimiento]);

  // Bucle principal de físicas, movimiento, colisiones, cámara y animaciones
  useFrame((state, dt) => {
    const tiempo = state.clock.elapsedTime;
    const em = estadoMovimiento.current;
    let dx = 0;
    let dz = 0;

    // 1. Control por teclado
    if (em.teclas.arriba) dz -= 1;
    if (em.teclas.abajo) dz += 1;
    if (em.teclas.izquierda) dx -= 1;
    if (em.teclas.derecha) dx += 1;

    // 2. Control por toque / ratón (clic en suelo)
    if (objetivoMovimiento && dx === 0 && dz === 0) {
      const tox = objetivoMovimiento[0] - em.x;
      const toz = objetivoMovimiento[1] - em.z;
      const distObj = Math.hypot(tox, toz);

      if (distObj > 0.25) {
        dx = tox / distObj;
        dz = toz / distObj;
      } else {
        // Llegó al objetivo
        setObjetivoMovimiento(null);
      }
    }

    // Normalizar vector de movimiento
    const magnitud = Math.hypot(dx, dz);
    const velocidad = 7.0; // unidades por segundo

    if (magnitud > 0.05) {
      em.enMovimiento = true;
      const normX = (dx / magnitud) * velocidad * dt;
      const normZ = (dz / magnitud) * velocidad * dt;

      // Validar colisiones con edificios, río y montañas
      const [nuevoX, nuevoZ] = validarMovimiento(
        em.x + normX,
        em.z + normZ,
        em.x,
      );
      em.x = nuevoX;
      em.z = nuevoZ;

      // Rotación suave del avatar hacia donde camina
      const anguloDestino = Math.atan2(dx, dz);
      // Interpolación angular
      let difAngulo = anguloDestino - em.rotacionY;
      while (difAngulo < -Math.PI) difAngulo += Math.PI * 2;
      while (difAngulo > Math.PI) difAngulo -= Math.PI * 2;
      em.rotacionY += difAngulo * Math.min(1, dt * 14);

      // Ciclo de animación de caminar
      em.cicloCaminar += dt * 10;
    } else {
      em.enMovimiento = false;
    }

    // Calcular altura real del terreno en los pies del avatar
    const alturaY = calcularAlturaTerreno(em.x, em.z);

    // Actualizar posición del grupo del personaje
    if (personajeRef.current) {
      personajeRef.current.position.set(em.x, alturaY, em.z);
      personajeRef.current.rotation.y = em.rotacionY;
    }

    // Articulaciones y rebote del personaje explorador
    if (em.enMovimiento && !prefersReducedMotion) {
      const paso = Math.sin(em.cicloCaminar);
      if (piernaIzqRef.current) piernaIzqRef.current.rotation.x = paso * 0.65;
      if (piernaDerRef.current) piernaDerRef.current.rotation.x = -paso * 0.65;
      if (brazoIzqRef.current) brazoIzqRef.current.rotation.x = -paso * 0.55;
      if (brazoDerRef.current) brazoDerRef.current.rotation.x = paso * 0.55;
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.55 + Math.abs(Math.sin(em.cicloCaminar * 2)) * 0.08;
      }
    } else {
      // Reposo con respiración suave
      if (piernaIzqRef.current) piernaIzqRef.current.rotation.x = 0;
      if (piernaDerRef.current) piernaDerRef.current.rotation.x = 0;
      if (brazoIzqRef.current) brazoIzqRef.current.rotation.x = 0;
      if (brazoDerRef.current) brazoDerRef.current.rotation.x = 0;
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.55 + Math.sin(tiempo * 2) * 0.02;
      }
    }

    // Comprobar cercanía a los 6 edificios
    let lugarDetectado: LugarValleId | null = null;
    let lugarParaEncuadre: (typeof LUGARES_VALLE)[0] | null = null;

    for (const lugar of LUGARES_VALLE) {
      const dist = Math.hypot(em.x - lugar.posicion[0], em.z - lugar.posicion[2]);
      if (dist <= lugar.radio) {
        lugarDetectado = lugar.id;
        lugarParaEncuadre = lugar;
        break;
      }
    }

    if (lugarDetectado !== lugarCercano) {
      onLugarCercanoChange(lugarDetectado);
    }

    // Comprobar cercanía a los 3 personajes guía (P15)
    let charDetectado: PersonajeGuiaId | null = null;
    for (const pg of PERSONAJES_GUIA) {
      const distChar = Math.hypot(em.x - pg.posicion[0], em.z - pg.posicion[2]);
      if (distChar < 3.2) {
        charDetectado = pg.id;
        break;
      }
    }
    if (charDetectado !== personajeCercano) {
      onPersonajeCercanoChange(charDetectado);
    }

    // Giro suave de cabeza/cuerpo de los personajes hacia el jugador cuando se acerca (P15)
    const mirarJugador = (ref: React.RefObject<THREE.Group | null>, posChar: [number, number, number]) => {
      if (!ref.current) return;
      const distChar = Math.hypot(em.x - posChar[0], em.z - posChar[2]);
      if (distChar < 6.5) {
        const anguloDeseado = Math.atan2(em.x - posChar[0], em.z - posChar[2]);
        let dif = anguloDeseado - ref.current.rotation.y;
        while (dif < -Math.PI) dif += Math.PI * 2;
        while (dif > Math.PI) dif -= Math.PI * 2;
        ref.current.rotation.y += dif * Math.min(1, dt * 6.0);
      }
    };
    mirarJugador(elenaRef, PERSONAJES_GUIA[0].posicion);
    mirarJugador(mateoRef, PERSONAJES_GUIA[1].posicion);
    mirarJugador(vegaRef, PERSONAJES_GUIA[2].posicion);

    // Notificar posición al padre periódicamente para HUD o marcadores
    setPosicionJugador([em.x, alturaY, em.z]);

    // Cámara con seguimiento diagonal amortiguado
    const offsetCam = new THREE.Vector3(0, 15, 16);
    const targetCamPos = new THREE.Vector3(em.x, alturaY, em.z).add(offsetCam);
    camera.position.lerp(targetCamPos, Math.min(1, dt * 4.5));

    // Encuadre sutil hacia el edificio si está cerca
    const targetLookAt = new THREE.Vector3(em.x, alturaY + 1.2, em.z);
    if (lugarParaEncuadre) {
      const posEdificio = new THREE.Vector3(...lugarParaEncuadre.posicion);
      targetLookAt.lerp(posEdificio, 0.22);
    }
    camera.lookAt(targetLookAt);

    // Animaciones arquitectónicas
    if (!prefersReducedMotion) {
      // Reloj de la escuela
      if (relojMinutosRef.current) relojMinutosRef.current.rotation.z = -tiempo * 0.4;
      if (relojHorasRef.current) relojHorasRef.current.rotation.z = -tiempo * 0.035;

      // Banderín de la escuela ondeando
      if (banderinEscuelaRef.current) {
        banderinEscuelaRef.current.rotation.y = Math.sin(tiempo * 3.2) * 0.28;
      }

      // Chimenea de Tu Casa: bocanadas de humo animadas
      if (humoRef.current) {
        humoRef.current.children.forEach((puf, idx) => {
          const tPuf = (tiempo * 0.9 + idx * 0.6) % 2.5;
          puf.position.y = 3.6 + tPuf * 0.8;
          puf.position.x = Math.sin(tPuf * 2 + idx) * 0.2;
          const escala = Math.min(1, tPuf * 0.7);
          puf.scale.setScalar(escala);
        });
      }

      // Observatorio: cúpula metálica rotando lentamente y anillos de entrada
      if (cupulaObsRef.current) {
        cupulaObsRef.current.rotation.y += dt * 0.14;
      }
      if (anillosObsRef.current) {
        anillosObsRef.current.rotation.z = Math.sin(tiempo * 1.2) * 0.25;
        anillosObsRef.current.rotation.x = Math.cos(tiempo * 0.9) * 0.2;
      }

      // Consultorio: emblema médico con latido suave
      if (cruzDoctorRef.current) {
        const latido = 1 + Math.sin(tiempo * 3.5) * 0.06;
        cruzDoctorRef.current.scale.setScalar(latido);
      }

      // Arena: estandartes ondeando al viento
      if (estandartesArenaRef.current) {
        estandartesArenaRef.current.children.forEach((est, idx) => {
          est.rotation.y = Math.sin(tiempo * 2.8 + idx) * 0.22;
        });
      }
    }
  });

  return (
    <>
      {/* Marcador táctil / objetivo de movimiento en el suelo */}
      {objetivoMovimiento && (
        <group position={[objetivoMovimiento[0], calcularAlturaTerreno(objetivoMovimiento[0], objetivoMovimiento[1]) + 0.04, objetivoMovimiento[1]]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.5, 24]} />
            <meshBasicMaterial color="#FFC928" transparent opacity={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.15, 16]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.9} />
          </mesh>
        </group>
      )}

      {/* ============================================================== */}
      {/* 1. ESCUELA (/estudiante/unidades) en [-15, 0, -12]             */}
      {/* ============================================================== */}
      <group position={LUGARES_VALLE[0].posicion}>
        {/* Anillo de luz en la base cuando el jugador entra al radio */}
        {lugarCercano === "escuela" && (
          <mesh position={[0, 0.05, 4.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.3, 1.7, 32]} />
            <meshBasicMaterial color="#4C9EFF" transparent opacity={0.85} />
          </mesh>
        )}

        {/* Base de piedra */}
        <mesh position={[0, 0.2, 0]} castShadow={calidad === "alta"}>
          <boxGeometry args={[7.2, 0.4, 5.8]} />
          <meshStandardMaterial color="#8A8A8A" roughness={0.88} />
        </mesh>

        {/* Muros principales de estuco crema */}
        <mesh position={[0, 2.0, 0]} castShadow={calidad === "alta"}>
          <boxGeometry args={[6.8, 3.2, 5.4]} />
          <meshStandardMaterial color="#F7F3E6" roughness={0.7} />
        </mesh>

        {/* Pórtico de madera con columnas al frente */}
        <group position={[0, 0, 2.8]}>
          <mesh position={[-1.6, 1.4, 0]} castShadow={calidad === "alta"}>
            <cylinderGeometry args={[0.16, 0.18, 2.6, 8]} />
            <meshStandardMaterial color="#7A4B27" roughness={0.75} />
          </mesh>
          <mesh position={[1.6, 1.4, 0]} castShadow={calidad === "alta"}>
            <cylinderGeometry args={[0.16, 0.18, 2.6, 8]} />
            <meshStandardMaterial color="#7A4B27" roughness={0.75} />
          </mesh>
          {/* Tejadillo del pórtico */}
          <mesh position={[0, 2.7, 0]} rotation={[0.2, 0, 0]} castShadow={calidad === "alta"}>
            <boxGeometry args={[4.2, 0.2, 1.2]} />
            <meshStandardMaterial color="#B85333" roughness={0.65} />
          </mesh>
          {/* Puerta doble de madera */}
          <mesh position={[0, 1.2, -0.05]}>
            <boxGeometry args={[1.6, 2.2, 0.1]} />
            <meshStandardMaterial color="#503117" roughness={0.8} />
          </mesh>
        </group>

        {/* Ventanas con luz cálida interior */}
        {[
          [-2.2, 2.2, 2.72],
          [2.2, 2.2, 2.72],
          [-3.42, 2.2, 0],
          [3.42, 2.2, 0],
        ].map(([wx, wy, wz], i) => (
          <group key={i} position={[wx, wy, wz]} rotation={[0, Math.abs(wx) > 3 ? Math.PI / 2 : 0, 0]}>
            {/* Marco de madera blanca */}
            <mesh>
              <boxGeometry args={[0.9, 1.2, 0.08]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
            </mesh>
            {/* Vidrio iluminado */}
            <mesh position={[0, 0, 0.02]}>
              <planeGeometry args={[0.7, 1.0]} />
              <meshStandardMaterial
                color="#FFE6A3"
                emissive="#FFAA00"
                emissiveIntensity={intensidadEmissive}
              />
            </mesh>
          </group>
        ))}

        {/* Techo a dos aguas de tejas terracota */}
        <mesh position={[0, 4.3, 0]} rotation={[0, 0, 0]} castShadow={calidad === "alta"}>
          <coneGeometry args={[4.8, 1.8, 4]} />
          <meshStandardMaterial color="#B85333" roughness={0.65} />
        </mesh>

        {/* Campanario superior con reloj funcional */}
        <group position={[0, 5.6, 0]}>
          <mesh position={[0, 0.7, 0]} castShadow={calidad === "alta"}>
            <boxGeometry args={[1.6, 1.5, 1.6]} />
            <meshStandardMaterial color="#F7F3E6" roughness={0.7} />
          </mesh>
          {/* Campana de bronce en su vano */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.2, 0.35, 0.45, 10]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Esfera del reloj al frente */}
          <mesh position={[0, 0.7, 0.82]}>
            <circleGeometry args={[0.42, 20]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Manecillas del reloj animadas */}
          <mesh ref={relojHorasRef} position={[0, 0.7, 0.83]}>
            <planeGeometry args={[0.06, 0.22]} />
            <meshBasicMaterial color="#17164F" />
          </mesh>
          <mesh ref={relojMinutosRef} position={[0, 0.7, 0.84]}>
            <planeGeometry args={[0.04, 0.32]} />
            <meshBasicMaterial color="#B85333" />
          </mesh>
          {/* Chapitel cónico del campanario */}
          <mesh position={[0, 2.0, 0]} castShadow={calidad === "alta"}>
            <coneGeometry args={[1.2, 1.4, 4]} />
            <meshStandardMaterial color="#4C9EFF" roughness={0.5} />
          </mesh>
          {/* Mástil y banderín ondeando */}
          <mesh position={[0, 2.9, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.6, 6]} />
            <meshStandardMaterial color="#D4AF37" metalness={0.8} />
          </mesh>
          <mesh ref={banderinEscuelaRef} position={[0.25, 3.1, 0]}>
            <planeGeometry args={[0.5, 0.28]} />
            <meshStandardMaterial color="#4C9EFF" side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Baliza 3D flotante si hay unidades publicadas (P15) */}
        {novedades.escuela > 0 && (
          <Baliza3D
            posicion={[0, 9.8, 0]}
            cantidad={novedades.escuela}
            color="#4C9EFF"
          />
        )}

        {/* Cartel flotante legible */}
        <Html position={[0, 8.8, 0]} distanceFactor={15} center>
          <div className="flex items-center gap-2 rounded-full border-2 border-[#2472CC] bg-white px-3 py-1 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E6F2FF] text-[#2472CC]">
              {LUGARES_VALLE[0].icon({ className: "w-4 h-4", weight: "bold" })}
            </span>
            <span className="text-sm font-bold text-[#17164F]">Escuela</span>
          </div>
        </Html>
      </group>

      {/* ============================================================== */}
      {/* 2. TU CASA (/estudiante/unidades) en [17, 0, -12]              */}
      {/* ============================================================== */}
      <group position={LUGARES_VALLE[1].posicion}>
        {lugarCercano === "casa" && (
          <mesh position={[-3.5, 0.05, 2.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.2, 1.6, 32]} />
            <meshBasicMaterial color="#2DBE70" transparent opacity={0.85} />
          </mesh>
        )}

        {/* Base de piedra rústica */}
        <mesh position={[0, 0.3, 0]} castShadow={calidad === "alta"}>
          <boxGeometry args={[5.8, 0.6, 4.8]} />
          <meshStandardMaterial color="#7A756D" roughness={0.92} />
        </mesh>

        {/* Muros de madera y adobe blanco */}
        <mesh position={[0, 1.8, 0]} castShadow={calidad === "alta"}>
          <boxGeometry args={[5.4, 2.4, 4.4]} />
          <meshStandardMaterial color="#F3EDE2" roughness={0.78} />
        </mesh>

        {/* Vigas de madera a la vista */}
        {[-2.68, 2.68].map((vx, i) => (
          <mesh key={i} position={[vx, 1.8, 0]} castShadow={calidad === "alta"}>
            <boxGeometry args={[0.2, 2.4, 4.45]} />
            <meshStandardMaterial color="#6E4423" roughness={0.8} />
          </mesh>
        ))}

        {/* Puerta rústica con farolito */}
        <mesh position={[-1.2, 1.2, 2.22]}>
          <boxGeometry args={[1.2, 1.8, 0.1]} />
          <meshStandardMaterial color="#5A341A" roughness={0.85} />
        </mesh>

        {/* Ventana con jardinera */}
        <group position={[1.4, 1.6, 2.22]}>
          <mesh>
            <boxGeometry args={[1.1, 1.1, 0.1]} />
            <meshStandardMaterial
              color="#FFE4A0"
              emissive="#FFAA00"
              emissiveIntensity={intensidadEmissive}
            />
          </mesh>
          {/* Jardinera con flores */}
          <mesh position={[0, -0.65, 0.15]}>
            <boxGeometry args={[1.2, 0.25, 0.35]} />
            <meshStandardMaterial color="#6E4423" />
          </mesh>
        </group>

        {/* Techo a dos aguas de madera campestre con aleros amplios */}
        <mesh position={[0, 3.5, 0]} rotation={[0, 0, 0]} castShadow={calidad === "alta"}>
          <coneGeometry args={[4.2, 1.6, 4]} />
          <meshStandardMaterial color="#5E381C" roughness={0.75} />
        </mesh>

        {/* Chimenea de ladrillo */}
        <mesh position={[1.8, 3.6, -0.8]} castShadow={calidad === "alta"}>
          <boxGeometry args={[0.7, 2.2, 0.7]} />
          <meshStandardMaterial color="#94422A" roughness={0.85} />
        </mesh>

        {/* Bocanadas de humo animadas saliendo de la chimenea */}
        <group ref={humoRef} position={[1.8, 1.0, -0.8]}>
          {[0, 1, 2, 3].map((idx) => (
            <mesh key={idx}>
              <sphereGeometry args={[0.28, 8, 8]} />
              <meshStandardMaterial color="#ECEFF1" transparent opacity={0.65} roughness={1} />
            </mesh>
          ))}
        </group>

        {/* Jardín cercado con huerto */}
        <group position={[-0.5, 0, 3.2]}>
          {/* Valla de estacas */}
          {[-2.2, -1.5, -0.8, 1.2, 1.9, 2.6].map((fx, i) => (
            <mesh key={i} position={[fx, 0.45, 1.2]}>
              <boxGeometry args={[0.1, 0.9, 0.05]} />
              <meshStandardMaterial color="#D7C9B1" roughness={0.8} />
            </mesh>
          ))}
          {/* Travesaño de la cerca */}
          <mesh position={[0.2, 0.5, 1.2]}>
            <boxGeometry args={[5.2, 0.08, 0.04]} />
            <meshStandardMaterial color="#C8B89E" roughness={0.8} />
          </mesh>
        </group>

        {/* Baliza 3D flotante si hay unidades familiares (P15) */}
        {novedades.casa > 0 && (
          <Baliza3D
            posicion={[0, 7.4, 0]}
            cantidad={novedades.casa}
            color="#2DBE70"
          />
        )}

        {/* Cartel flotante */}
        <Html position={[0, 6.4, 0]} distanceFactor={15} center>
          <div className="flex items-center gap-2 rounded-full border-2 border-[#1B8A4F] bg-white px-3 py-1 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E3F8EC] text-[#1B8A4F]">
              {LUGARES_VALLE[1].icon({ className: "w-4 h-4", weight: "bold" })}
            </span>
            <span className="text-sm font-bold text-[#17164F]">Tu casa</span>
          </div>
        </Html>
      </group>

      {/* ============================================================== */}
      {/* 3. OBSERVATORIO (/estudiante/aventuras/piloto) en [-18, 1.3, 12]*/}
      {/* ============================================================== */}
      <group position={LUGARES_VALLE[2].posicion}>
        {lugarCercano === "observatorio" && (
          <mesh position={[3.0, 0.05, -3.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.3, 1.7, 32]} />
            <meshBasicMaterial color="#5636D9" transparent opacity={0.85} />
          </mesh>
        )}

        {/* Base circular de mampostería */}
        <mesh position={[0, 0.3, 0]} castShadow={calidad === "alta"}>
          <cylinderGeometry args={[3.2, 3.4, 0.6, 20]} />
          <meshStandardMaterial color="#6B657A" roughness={0.88} />
        </mesh>

        {/* Torre cilíndrica del observatorio */}
        <mesh position={[0, 2.4, 0]} castShadow={calidad === "alta"}>
          <cylinderGeometry args={[2.8, 3.0, 3.6, 20]} />
          <meshStandardMaterial color="#E8E4F0" roughness={0.65} />
        </mesh>

        {/* Entrada con arco y anillos planetarios ornamentales */}
        <group position={[2.1, 1.2, -1.8]} rotation={[0, -Math.PI / 4, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 2.1, 0.2]} />
            <meshStandardMaterial color="#2E234A" />
          </mesh>
          {/* Anillos planetarios girando sobre la entrada */}
          <group ref={anillosObsRef} position={[0, 1.6, 0.2]}>
            <mesh rotation={[1.1, 0, 0]}>
              <ringGeometry args={[0.55, 0.72, 24]} />
              <meshStandardMaterial color="#FFC928" metalness={0.7} roughness={0.3} side={THREE.DoubleSide} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.26, 12, 12]} />
              <meshStandardMaterial color="#5636D9" roughness={0.4} />
            </mesh>
          </group>
        </group>

        {/* Cúpula plateada metálica con ranura y telescopio giratorio */}
        <group ref={cupulaObsRef} position={[0, 4.2, 0]}>
          <mesh castShadow={calidad === "alta"}>
            <sphereGeometry args={[2.7, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#D4D9E2" metalness={0.85} roughness={0.22} />
          </mesh>
          {/* Ranura del telescopio */}
          <mesh position={[0, 1.1, 1.8]} rotation={[-0.7, 0, 0]}>
            <boxGeometry args={[0.6, 1.6, 0.3]} />
            <meshStandardMaterial color="#17164F" />
          </mesh>
          {/* Tubo del telescopio de bronce asomando */}
          <mesh position={[0, 1.4, 2.1]} rotation={[-0.75, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.24, 2.0, 12]} />
            <meshStandardMaterial color="#CD7F32" metalness={0.75} roughness={0.28} />
          </mesh>
        </group>

        {/* Cartel flotante */}
        <Html position={[0, 8.2, 0]} distanceFactor={15} center>
          <div className="flex items-center gap-2 rounded-full border-2 border-[#3B229D] bg-white px-3 py-1 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F2EEFF] text-[#5636D9]">
              {LUGARES_VALLE[2].icon({ className: "w-4 h-4", weight: "bold" })}
            </span>
            <span className="text-sm font-bold text-[#17164F]">Observatorio</span>
          </div>
        </Html>
      </group>

      {/* ============================================================== */}
      {/* 4. CONSULTORIO (/estudiante/aventuras/doctor) en [17, 0, 13]   */}
      {/* ============================================================== */}
      <group position={LUGARES_VALLE[3].posicion}>
        {lugarCercano === "consultorio" && (
          <mesh position={[-3.5, 0.05, -2.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.3, 1.7, 32]} />
            <meshBasicMaterial color="#25CFE0" transparent opacity={0.85} />
          </mesh>
        )}

        {/* Base moderna */}
        <mesh position={[0, 0.2, 0]} castShadow={calidad === "alta"}>
          <boxGeometry args={[6.4, 0.4, 5.4]} />
          <meshStandardMaterial color="#DEE6E4" roughness={0.7} />
        </mesh>

        {/* Muros blancos modernos */}
        <mesh position={[0, 1.8, 0]} castShadow={calidad === "alta"}>
          <boxGeometry args={[6.0, 2.8, 5.0]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
        </mesh>

        {/* Techo curvo verde menta */}
        <mesh position={[0, 3.4, 0]} rotation={[0, 0, Math.PI / 2]} castShadow={calidad === "alta"}>
          <cylinderGeometry args={[2.6, 2.6, 6.2, 20, 1, false, 0, Math.PI]} />
          <meshStandardMaterial color="#52B788" roughness={0.45} />
        </mesh>

        {/* Puerta acristalada y vitrales translúcidos */}
        <mesh position={[-1.2, 1.3, 2.52]}>
          <boxGeometry args={[1.6, 2.2, 0.08]} />
          <meshStandardMaterial color="#25CFE0" transparent opacity={0.75} roughness={0.2} />
        </mesh>

        {/* Emblema médico 3D brillante en fachada */}
        <group position={[1.4, 2.2, 2.55]}>
          <mesh ref={cruzDoctorRef}>
            {/* Cruz médica verde menta / esmeralda */}
            <boxGeometry args={[0.7, 0.25, 0.15]} />
            <meshStandardMaterial color="#2DBE70" emissive="#2DBE70" emissiveIntensity={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.25, 0.7, 0.15]} />
            <meshStandardMaterial color="#2DBE70" emissive="#2DBE70" emissiveIntensity={0.6} />
          </mesh>
        </group>

        {/* Jardineras botánicas con plantas curativas */}
        {[-2.2, 2.2].map((jx, i) => (
          <group key={i} position={[jx, 0.4, 2.8]}>
            <mesh castShadow={calidad === "alta"}>
              <boxGeometry args={[1.2, 0.5, 0.6]} />
              <meshStandardMaterial color="#6E4423" />
            </mesh>
            <mesh position={[0, 0.4, 0]}>
              <dodecahedronGeometry args={[0.3, 0]} />
              <meshStandardMaterial color="#2DBE70" roughness={0.7} />
            </mesh>
          </group>
        ))}

        {/* Cartel flotante */}
        <Html position={[0, 6.8, 0]} distanceFactor={15} center>
          <div className="flex items-center gap-2 rounded-full border-2 border-[#1B8A4F] bg-white px-3 py-1 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E3F8EC] text-[#1B8A4F]">
              {LUGARES_VALLE[3].icon({ className: "w-4 h-4", weight: "bold" })}
            </span>
            <span className="text-sm font-bold text-[#17164F]">Consultorio</span>
          </div>
        </Html>
      </group>

      {/* ============================================================== */}
      {/* 5. PLAZA DEL DADO (/estudiante/juegos) en [-2, 0, -18]         */}
      {/* ============================================================== */}
      <group position={LUGARES_VALLE[4].posicion}>
        {lugarCercano === "dado" && (
          <mesh position={[0, 0.05, 5.0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.3, 1.7, 32]} />
            <meshBasicMaterial color="#FFC928" transparent opacity={0.85} />
          </mesh>
        )}

        {/* Glorieta octogonal elevada */}
        <mesh position={[0, 0.25, 0]} castShadow={calidad === "alta"}>
          <cylinderGeometry args={[4.2, 4.5, 0.5, 8]} />
          <meshStandardMaterial color="#E8E2D3" roughness={0.8} />
        </mesh>

        {/* Piso de tablero de juego / mosaico tipo ajedrez */}
        <mesh position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 3.8, 8]} />
          <meshStandardMaterial color="#FFC928" roughness={0.6} />
        </mesh>

        {/* 8 columnas de madera en el perímetro */}
        {Array.from({ length: 8 }).map((_, i) => {
          const ang = (i * Math.PI * 2) / 8;
          const px = Math.cos(ang) * 3.6;
          const pz = Math.sin(ang) * 3.6;
          return (
            <mesh key={i} position={[px, 1.8, pz]} castShadow={calidad === "alta"}>
              <cylinderGeometry args={[0.12, 0.15, 2.6, 8]} />
              <meshStandardMaterial color="#7A4B27" roughness={0.75} />
            </mesh>
          );
        })}

        {/* Pérgolas y banderines festivos */}
        <mesh position={[0, 3.2, 0]} castShadow={calidad === "alta"}>
          <torusGeometry args={[3.6, 0.12, 6, 8]} />
          <meshStandardMaterial color="#5E381C" roughness={0.7} />
        </mesh>

        {/* Pedestal de piedra en el centro */}
        <mesh position={[0, 0.9, 0]} castShadow={calidad === "alta"}>
          <cylinderGeometry args={[0.7, 0.9, 0.8, 8]} />
          <meshStandardMaterial color="#7D7D7D" roughness={0.85} />
        </mesh>

        {/* Dado 3D biselado levitando y girando sobre el pedestal */}
        <Float speed={2} rotationIntensity={0.8} floatIntensity={0.6}>
          <group position={[0, 2.3, 0]}>
            {/* Cuerpo del dado blanco marfil */}
            <mesh castShadow={calidad === "alta"}>
              <boxGeometry args={[1.2, 1.2, 1.2]} />
              <meshStandardMaterial color="#FFF9E6" roughness={0.3} metalness={0.05} />
            </mesh>
            {/* Puntos en relieve (dots) */}
            {/* Cara frontal (1 punto) */}
            <mesh position={[0, 0, 0.61]}>
              <circleGeometry args={[0.13, 16]} />
              <meshBasicMaterial color="#17164F" />
            </mesh>
            {/* Cara superior (6 puntos) */}
            {[
              [-0.32, 0.61, -0.32],
              [-0.32, 0.61, 0],
              [-0.32, 0.61, 0.32],
              [0.32, 0.61, -0.32],
              [0.32, 0.61, 0],
              [0.32, 0.61, 0.32],
            ].map(([dx, dy, dz], i) => (
              <mesh key={i} position={[dx, dy, dz]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.08, 12]} />
                <meshBasicMaterial color="#C98F00" />
              </mesh>
            ))}
          </group>
        </Float>

        {/* Cartel flotante */}
        <Html position={[0, 5.2, 0]} distanceFactor={15} center>
          <div className="flex items-center gap-2 rounded-full border-2 border-[#C98F00] bg-white px-3 py-1 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFF6D6] text-[#C98F00]">
              {LUGARES_VALLE[4].icon({ className: "w-4 h-4", weight: "bold" })}
            </span>
            <span className="text-sm font-bold text-[#17164F]">Plaza del dado</span>
          </div>
        </Html>
      </group>

      {/* ============================================================== */}
      {/* 6. ARENA (/estudiante/duelo) en [-2, 0, 18]                    */}
      {/* ============================================================== */}
      <group position={LUGARES_VALLE[5].posicion}>
        {lugarCercano === "arena" && (
          <mesh position={[0, 0.05, -5.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.4, 1.8, 32]} />
            <meshBasicMaterial color="#FF8A73" transparent opacity={0.85} />
          </mesh>
        )}

        {/* Muro exterior circular con arcos de piedra clara */}
        <mesh position={[0, 1.4, 0]} castShadow={calidad === "alta"}>
          <cylinderGeometry args={[5.2, 5.4, 2.6, 24, 1, true]} />
          <meshStandardMaterial color="#E5D9C5" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>

        {/* Graderías concéntricas interiores */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[4.8, 5.1, 0.7, 24]} />
          <meshStandardMaterial color="#C8BEAC" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[3.8, 4.2, 0.7, 24]} />
          <meshStandardMaterial color="#C8BEAC" roughness={0.9} />
        </mesh>

        {/* Plataforma central de combate / saberes con runa iluminada */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[2.4, 2.6, 0.35, 20]} />
          <meshStandardMaterial color="#8F8578" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.39, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 1.9, 20]} />
          <meshStandardMaterial
            color="#FF8A73"
            emissive="#FF8A73"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Estandartes dorados y azules ondeando */}
        <group ref={estandartesArenaRef}>
          {[-4.8, 4.8].map((ex, i) => (
            <group key={i} position={[ex, 2.6, 0]}>
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
                <meshStandardMaterial color="#50453B" metalness={0.6} />
              </mesh>
              <mesh position={[0.4, 0.7, 0]}>
                <planeGeometry args={[0.8, 1.2]} />
                <meshStandardMaterial
                  color={i === 0 ? "#FFC928" : "#2472CC"}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          ))}
        </group>

        {/* Cartel flotante */}
        <Html position={[0, 5.8, 0]} distanceFactor={15} center>
          <div className="flex items-center gap-2 rounded-full border-2 border-[#D9583F] bg-white px-3 py-1 shadow-md">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FFEDE8] text-[#D9583F]">
              {LUGARES_VALLE[5].icon({ className: "w-4 h-4", weight: "bold" })}
            </span>
            <span className="text-sm font-bold text-[#17164F]">Arena</span>
          </div>
        </Html>
      </group>

      {/* ============================================================== */}
      {/* 7. AVATAR EXPLORADOR ESTILIZADO                                */}
      {/* ============================================================== */}
      <group ref={personajeRef} position={posicionJugador}>
        {/* Torso con chaleco y mochila */}
        <group ref={torsoRef} position={[0, 0.55, 0]}>
          {/* Pecho / Chaqueta del explorador */}
          <mesh castShadow={calidad === "alta"}>
            <boxGeometry args={[0.48, 0.52, 0.32]} />
            <meshStandardMaterial color="#5636D9" roughness={0.6} />
          </mesh>
          {/* Cuello / Pañuelo aventura */}
          <mesh position={[0, 0.24, 0.1]}>
            <boxGeometry args={[0.3, 0.1, 0.14]} />
            <meshStandardMaterial color="#FFC928" roughness={0.5} />
          </mesh>
          {/* Mochila exploradora a la espalda */}
          <mesh position={[0, 0.04, -0.22]} castShadow={calidad === "alta"}>
            <boxGeometry args={[0.38, 0.42, 0.22]} />
            <meshStandardMaterial color="#8B5A2B" roughness={0.8} />
          </mesh>
          {/* Aislante / Bolsa enrollada sobre la mochila */}
          <mesh position={[0, 0.27, -0.22]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.09, 0.09, 0.4, 8]} />
            <meshStandardMaterial color="#2DBE70" roughness={0.7} />
          </mesh>

          {/* Cabeza expresiva con gorra de explorador */}
          <group position={[0, 0.48, 0]}>
            {/* Cara estilizada */}
            <mesh castShadow={calidad === "alta"}>
              <sphereGeometry args={[0.26, 16, 14]} />
              <meshStandardMaterial color="#F7D3BA" roughness={0.75} />
            </mesh>
            {/* Ojos expresivos */}
            <mesh position={[-0.08, 0.02, 0.23]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#17164F" />
            </mesh>
            <mesh position={[0.08, 0.02, 0.23]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#17164F" />
            </mesh>
            {/* Gorra de explorador */}
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.27, 0.29, 0.18, 14]} />
              <meshStandardMaterial color="#4C9EFF" roughness={0.65} />
            </mesh>
            {/* Visera de la gorra */}
            <mesh position={[0, 0.08, 0.24]} rotation={[0.25, 0, 0]}>
              <boxGeometry args={[0.34, 0.04, 0.2]} />
              <meshStandardMaterial color="#2472CC" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* Brazo Izquierdo articulado */}
        <group ref={brazoIzqRef} position={[-0.32, 0.72, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow={calidad === "alta"}>
            <cylinderGeometry args={[0.07, 0.08, 0.36, 8]} />
            <meshStandardMaterial color="#5636D9" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#F7D3BA" />
          </mesh>
        </group>

        {/* Brazo Derecho articulado */}
        <group ref={brazoDerRef} position={[0.32, 0.72, 0]}>
          <mesh position={[0, -0.18, 0]} castShadow={calidad === "alta"}>
            <cylinderGeometry args={[0.07, 0.08, 0.36, 8]} />
            <meshStandardMaterial color="#5636D9" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color="#F7D3BA" />
          </mesh>
        </group>

        {/* Pierna Izquierda articulada */}
        <group ref={piernaIzqRef} position={[-0.14, 0.38, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow={calidad === "alta"}>
            <cylinderGeometry args={[0.08, 0.08, 0.32, 8]} />
            <meshStandardMaterial color="#2E234A" roughness={0.8} />
          </mesh>
          {/* Bota */}
          <mesh position={[0, -0.34, 0.04]} castShadow={calidad === "alta"}>
            <boxGeometry args={[0.16, 0.12, 0.24]} />
            <meshStandardMaterial color="#4A2E1B" roughness={0.85} />
          </mesh>
        </group>

        {/* Pierna Derecha articulada */}
        <group ref={piernaDerRef} position={[0.14, 0.38, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow={calidad === "alta"}>
            <cylinderGeometry args={[0.08, 0.08, 0.32, 8]} />
            <meshStandardMaterial color="#2E234A" roughness={0.8} />
          </mesh>
          {/* Bota */}
          <mesh position={[0, -0.34, 0.04]} castShadow={calidad === "alta"}>
            <boxGeometry args={[0.16, 0.12, 0.24]} />
            <meshStandardMaterial color="#4A2E1B" roughness={0.85} />
          </mesh>
        </group>
      </group>

      {/* ============================================================== */}
      {/* 8. PERSONAJES GUÍA VIVOS (P15)                                 */}
      {/* ============================================================== */}
      {/* Maestra Elena (junto a Escuela) */}
      <group ref={elenaRef} position={PERSONAJES_GUIA[0].posicion}>
        {preguntasDisponibles.elena && (
          <Float speed={3} rotationIntensity={1} floatIntensity={0.5}>
            <mesh position={[0, 2.05, 0]}>
              <octahedronGeometry args={[0.22, 0]} />
              <meshStandardMaterial color="#FFC928" emissive="#FFAA00" emissiveIntensity={0.85} />
            </mesh>
          </Float>
        )}
        {/* Cuerpo / Vestimenta académica cálida */}
        <mesh position={[0, 0.45, 0]} castShadow={calidad === "alta"}>
          <cylinderGeometry args={[0.22, 0.32, 0.9, 10]} />
          <meshStandardMaterial color="#8E2845" roughness={0.7} />
        </mesh>
        {/* Cuello / Bufanda beige */}
        <mesh position={[0, 0.92, 0]}>
          <torusGeometry args={[0.18, 0.06, 6, 12]} />
          <meshStandardMaterial color="#F7F3E6" roughness={0.8} />
        </mesh>
        {/* Cabeza con moño y gafas */}
        <group position={[0, 1.15, 0]}>
          <mesh castShadow={calidad === "alta"}>
            <sphereGeometry args={[0.22, 14, 12]} />
            <meshStandardMaterial color="#F7D3BA" roughness={0.8} />
          </mesh>
          {/* Cabello castaño oscuro con moño */}
          <mesh position={[0, 0.08, -0.06]}>
            <sphereGeometry args={[0.23, 12, 10]} />
            <meshStandardMaterial color="#3D2314" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.22, -0.16]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#3D2314" roughness={0.8} />
          </mesh>
          {/* Lentes / gafas */}
          <mesh position={[0, 0.02, 0.21]}>
            <boxGeometry args={[0.28, 0.07, 0.03]} />
            <meshStandardMaterial color="#17164F" metalness={0.4} />
          </mesh>
        </group>
        {/* Libro en mano izquierda */}
        <group position={[-0.3, 0.65, 0.15]} rotation={[0.4, 0.3, -0.2]}>
          <mesh castShadow={calidad === "alta"}>
            <boxGeometry args={[0.25, 0.35, 0.08]} />
            <meshStandardMaterial color="#2472CC" roughness={0.6} />
          </mesh>
          <mesh position={[0.02, 0, 0]}>
            <boxGeometry args={[0.23, 0.33, 0.06]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
        </group>
        {/* Brazo derecho en reposo */}
        <mesh position={[0.28, 0.65, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.06, 0.07, 0.45, 8]} />
          <meshStandardMaterial color="#8E2845" roughness={0.7} />
        </mesh>
      </group>

      {/* Sabio Mateo (junto a Tu casa) */}
      <group ref={mateoRef} position={PERSONAJES_GUIA[1].posicion}>
        {preguntasDisponibles.mateo && (
          <Float speed={3} rotationIntensity={1} floatIntensity={0.5}>
            <mesh position={[0, 2.05, 0]}>
              <octahedronGeometry args={[0.22, 0]} />
              <meshStandardMaterial color="#2DBE70" emissive="#1B8A4F" emissiveIntensity={0.85} />
            </mesh>
          </Float>
        )}
        {/* Poncho andino tradicional */}
        <mesh position={[0, 0.55, 0]} castShadow={calidad === "alta"}>
          <coneGeometry args={[0.48, 0.85, 4]} />
          <meshStandardMaterial color="#C85A32" roughness={0.85} />
        </mesh>
        {/* Guarda decorativa del poncho */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.72, 0.12, 0.72]} />
          <meshStandardMaterial color="#FFC928" roughness={0.8} />
        </mesh>
        {/* Pantalón oscuro */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.18, 0.2, 0.25, 8]} />
          <meshStandardMaterial color="#3A2F2B" roughness={0.85} />
        </mesh>
        {/* Cabeza con chullo andino */}
        <group position={[0, 1.12, 0]}>
          <mesh castShadow={calidad === "alta"}>
            <sphereGeometry args={[0.22, 14, 12]} />
            <meshStandardMaterial color="#D7A17A" roughness={0.8} />
          </mesh>
          {/* Barba sabia */}
          <mesh position={[0, -0.1, 0.16]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#E8E8E8" roughness={0.9} />
          </mesh>
          {/* Chullo con orejeras */}
          <mesh position={[0, 0.14, 0]}>
            <coneGeometry args={[0.25, 0.35, 12]} />
            <meshStandardMaterial color="#2DBE70" roughness={0.85} />
          </mesh>
          {/* Orejeras */}
          <mesh position={[-0.2, -0.04, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.06, 0.2, 0.12]} />
            <meshStandardMaterial color="#C85A32" roughness={0.85} />
          </mesh>
          <mesh position={[0.2, -0.04, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.06, 0.2, 0.12]} />
            <meshStandardMaterial color="#C85A32" roughness={0.85} />
          </mesh>
        </group>
        {/* Morral de saberes cruzado */}
        <mesh position={[0.26, 0.38, 0.14]} rotation={[0.2, -0.3, 0]}>
          <boxGeometry args={[0.22, 0.24, 0.12]} />
          <meshStandardMaterial color="#8B5A2B" roughness={0.8} />
        </mesh>
      </group>

      {/* Astrónoma Vega (junto al Observatorio) */}
      <group ref={vegaRef} position={PERSONAJES_GUIA[2].posicion}>
        {preguntasDisponibles.vega && (
          <Float speed={3} rotationIntensity={1} floatIntensity={0.5}>
            <mesh position={[0, 2.05, 0]}>
              <octahedronGeometry args={[0.22, 0]} />
              <meshStandardMaterial color="#5636D9" emissive="#3B229D" emissiveIntensity={0.85} />
            </mesh>
          </Float>
        )}
        {/* Chaqueta estelar azul noche */}
        <mesh position={[0, 0.55, 0]} castShadow={calidad === "alta"}>
          <boxGeometry args={[0.44, 0.65, 0.3]} />
          <meshStandardMaterial color="#1B263B" roughness={0.65} />
        </mesh>
        {/* Insignia / Galón estelar dorado */}
        <mesh position={[0.1, 0.65, 0.16]}>
          <circleGeometry args={[0.06, 10]} />
          <meshStandardMaterial color="#FFC928" metalness={0.7} />
        </mesh>
        {/* Pantalón espacial */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.3, 8]} />
          <meshStandardMaterial color="#0D1B2A" roughness={0.75} />
        </mesh>
        {/* Cabeza con visor celestial */}
        <group position={[0, 1.12, 0]}>
          <mesh castShadow={calidad === "alta"}>
            <sphereGeometry args={[0.22, 14, 12]} />
            <meshStandardMaterial color="#F7D3BA" roughness={0.75} />
          </mesh>
          {/* Cabello recogido */}
          <mesh position={[0, 0.08, -0.1]}>
            <sphereGeometry args={[0.22, 10, 10]} />
            <meshStandardMaterial color="#2B1D0C" roughness={0.8} />
          </mesh>
          {/* Visor celestial translúcido cian */}
          <mesh position={[0, 0.06, 0.2]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.32, 0.1, 0.08]} />
            <meshStandardMaterial color="#25CFE0" transparent opacity={0.85} roughness={0.2} metalness={0.6} />
          </mesh>
        </group>
        {/* Cilindro con mapa estelar en el cinto */}
        <mesh position={[-0.24, 0.38, 0]} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.35, 8]} />
          <meshStandardMaterial color="#CD7F32" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </>
  );
}

