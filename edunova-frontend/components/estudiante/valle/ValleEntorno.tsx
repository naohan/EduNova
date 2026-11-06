"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sky, Stars, ContactShadows, Sparkles, Clouds, Cloud } from "@react-three/drei";
import * as THREE from "three";
import {
  type CalidadGrafica,
  type ClimaHora,
  RADIO_MUNDO_MAX,
} from "./valleData";

interface Props {
  clima: ClimaHora;
  calidad: CalidadGrafica;
  prefersReducedMotion: boolean;
  posicionJugador: [number, number, number];
}

/** Genera la data URL de una textura suave para nubes en memoria sin llamadas de red (RNF-01 / Drei offline). */
function generarDataUrlNube(): string {
  if (typeof document === "undefined") {
    return "";
  }
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    grad.addColorStop(0.35, "rgba(255, 255, 255, 0.65)");
    grad.addColorStop(0.7, "rgba(255, 255, 255, 0.15)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas.toDataURL("image/png");
}

/** Altura determinista del relieve: valle plano al centro, colina para el observatorio y montañas nevadas. */
export function calcularAlturaTerreno(x: number, z: number): number {
  const distCentro = Math.hypot(x, z);
  let h = 0;

  if (distCentro > 22) {
    const factorMontana = Math.pow((distCentro - 22) / 16, 1.8);
    const ruido =
      Math.sin(x * 0.12) * Math.cos(z * 0.12) * 2.2 +
      Math.sin(x * 0.28 + 1.2) * Math.sin(z * 0.22) * 1.2;
    h = factorMontana * (7.5 + ruido);
  } else {
    h = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 0.22;
  }

  // Colina baja para el observatorio en [-18, 12]
  const distObs = Math.hypot(x - -18, z - 12);
  if (distObs < 8) {
    h += Math.cos((distObs / 8) * (Math.PI / 2)) * 1.35;
  }

  // Cauce del río (x cerca de 8)
  const distRio = Math.abs(x - 8);
  if (distRio < 3.2 && distCentro < 28) {
    const factorRio = 1 - distRio / 3.2;
    h -= factorRio * 1.1;
  }

  return h;
}

/** Geometría del terreno con colores de vértices: arena, pasto esmeralda, laderas rocosas y nieve. */
function useGeometriaTerreno() {
  return useMemo(() => {
    const tamano = 86;
    const segmentos = 84;
    const geo = new THREE.PlaneGeometry(tamano, tamano, segmentos, segmentos);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colores: number[] = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = calcularAlturaTerreno(x, z);
      pos.setY(i, y);

      const distRio = Math.abs(x - 8);
      const esOrilla = distRio < 3.8 && distRio > 1.8 && y < 0.25;

      let r = 0.25;
      let g = 0.65;
      let b = 0.35;

      if (esOrilla) {
        // Arena cálida en orilla
        r = 0.82;
        g = 0.72;
        b = 0.52;
      } else if (y < 2.2) {
        // Pasto esmeralda con leve matiz
        const v = Math.sin(x * 0.5 + z * 0.3) * 0.03;
        r = 0.22 + v;
        g = 0.64 + v;
        b = 0.36 + v;
      } else if (y < 5.8) {
        // Roca gris en laderas
        const t = (y - 2.2) / 3.6;
        r = THREE.MathUtils.lerp(0.22, 0.48, t);
        g = THREE.MathUtils.lerp(0.64, 0.47, t);
        b = THREE.MathUtils.lerp(0.36, 0.45, t);
      } else {
        // Nieve en picos
        const t = Math.min(1, (y - 5.8) / 2.2);
        r = THREE.MathUtils.lerp(0.48, 0.95, t);
        g = THREE.MathUtils.lerp(0.47, 0.96, t);
        b = THREE.MathUtils.lerp(0.45, 0.98, t);
      }

      colores.push(r, g, b);
    }

    geo.setAttribute("color", new THREE.Float32BufferAttribute(colores, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);
}

/** Shader de agua ligera con ondas, espuma en orillas y reflejo solar */
function useMaterialAgua() {
  return useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uSunDir: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
        uDeepColor: { value: new THREE.Color("#1B6CA8") },
        uShallowColor: { value: new THREE.Color("#38B0DE") },
        uFoamColor: { value: new THREE.Color("#FFFFFF") },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float ola = sin(pos.x * 2.2 + uTime * 2.0) * 0.04 + cos(pos.y * 1.6 + uTime * 1.4) * 0.03;
          pos.z += ola;
          vNormal = normalize(vec3(-cos(pos.x * 2.2 + uTime * 2.0) * 0.1, sin(pos.y * 1.6 + uTime * 1.4) * 0.08, 1.0));
          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uSunDir;
        uniform vec3 uDeepColor;
        uniform vec3 uShallowColor;
        uniform vec3 uFoamColor;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
          float distBorde = min(vUv.x, 1.0 - vUv.x);
          float espumaRuido = sin(vUv.y * 28.0 + uTime * 2.5) * 0.035;
          float espuma = smoothstep(0.12 + espumaRuido, 0.03, distBorde);

          vec3 viewDir = normalize(cameraPosition - vWorldPosition);
          vec3 halfDir = normalize(uSunDir + viewDir);
          float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);

          vec3 agua = mix(uShallowColor, uDeepColor, smoothstep(0.0, 0.35, distBorde));
          agua += spec * 0.4;
          vec3 final = mix(agua, uFoamColor, espuma * 0.8);

          gl_FragColor = vec4(final, 0.88);
        }
      `,
    });
  }, []);
}

export function ValleEntorno({
  clima,
  calidad,
  prefersReducedMotion,
  posicionJugador,
}: Props) {
  const dataUrlNube = useMemo(() => generarDataUrlNube(), []);
  const geoTerreno = useGeometriaTerreno();
  const matAgua = useMaterialAgua();
  const matAguaRef = useRef<THREE.ShaderMaterial>(null);

  // Luces y Sol
  const solRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const esferaSolRef = useRef<THREE.Mesh>(null);
  const nubeGrupoRef = useRef<THREE.Group>(null);
  const arbolesFollajeRef = useRef<THREE.InstancedMesh>(null);

  // Parámetros objetivo de clima y hora
  const paramsClima = useMemo(() => {
    switch (clima) {
      case "atardecer":
        return {
          sunPos: new THREE.Vector3(38, 9, -15),
          sunColor: new THREE.Color("#FF7034"),
          sunIntensity: 2.1,
          hemiSky: new THREE.Color("#FFA07A"),
          hemiGround: new THREE.Color("#4A3228"),
          hemiIntensity: 0.65,
          fogColor: "#E28B73",
          fogDensity: 0.013,
          skyRayleigh: 3.2,
          skyTurbidity: 10,
          sparklesColor: "#FFB040",
          esferaSolColor: "#FFA54F",
          esferaSolVisible: true,
        };
      case "noche":
        return {
          sunPos: new THREE.Vector3(-18, 28, -20), // Posición de la luna suave
          sunColor: new THREE.Color("#7C98F8"),
          sunIntensity: 0.45,
          hemiSky: new THREE.Color("#182046"),
          hemiGround: new THREE.Color("#0C1124"),
          hemiIntensity: 0.35,
          fogColor: "#0D1326",
          fogDensity: 0.017,
          skyRayleigh: 0.1,
          skyTurbidity: 1,
          sparklesColor: "#68CFFF",
          esferaSolColor: "#C2D5FF",
          esferaSolVisible: true,
        };
      case "dia":
      default:
        return {
          sunPos: new THREE.Vector3(26, 40, 22),
          sunColor: new THREE.Color("#FFF9EB"),
          sunIntensity: 1.9,
          hemiSky: new THREE.Color("#BDE2FF"),
          hemiGround: new THREE.Color("#4C764D"),
          hemiIntensity: 0.75,
          fogColor: "#CBE4F7",
          fogDensity: 0.011,
          skyRayleigh: 0.55,
          skyTurbidity: 7,
          sparklesColor: "#FFE066",
          esferaSolColor: "#FFF4CC",
          esferaSolVisible: true,
        };
    }
  }, [clima]);

  // Posiciones deterministas para vegetación y rocas instanciadas (>130 elementos)
  const instancias = useMemo(() => {
    const pinos: { x: number; y: number; z: number; escala: number; rotY: number }[] = [];
    const frondosos: { x: number; y: number; z: number; escala: number; rotY: number }[] = [];
    const arbustos: { x: number; y: number; z: number; escala: number; rotY: number }[] = [];
    const rocas: { x: number; y: number; z: number; escala: number; rot: [number, number, number] }[] = [];
    const flores: { x: number; y: number; z: number; colorId: number }[] = [];

    // Generador pseudo-aleatorio determinista puro sin mutaciones de estado
    function rand(i: number, semilla = 1) {
      const v = Math.sin(i * 12.9898 + semilla * 78.233) * 43758.5453;
      return v - Math.floor(v);
    }

    // Pinos en las faldas de montañas y cerros (radio 20 a 34)
    for (let i = 0; i < 48; i++) {
      const angulo = rand(i, 2) * Math.PI * 2;
      const r = 21 + rand(i, 3) * 11;
      const x = Math.cos(angulo) * r;
      const z = Math.sin(angulo) * r;
      const y = calcularAlturaTerreno(x, z);
      pinos.push({ x, y, z, escala: 0.85 + rand(i, 4) * 0.4, rotY: rand(i, 5) * Math.PI * 2 });
    }

    // Árboles frondosos en el valle y cerca del río (evitando el centro exacto y edificios)
    for (let i = 0; i < 36; i++) {
      const angulo = rand(i, 6) * Math.PI * 2;
      const r = 8 + rand(i, 7) * 12;
      const x = Math.cos(angulo) * r;
      const z = Math.sin(angulo) * r;
      if (Math.abs(x - 8) > 2.8 && Math.hypot(x, z) > 4) {
        const y = calcularAlturaTerreno(x, z);
        frondosos.push({ x, y, z, escala: 0.8 + rand(i, 8) * 0.35, rotY: rand(i, 9) * Math.PI * 2 });
      }
    }

    // Arbustos por los bordes de senderos y cerca de Tu Casa
    for (let i = 0; i < 32; i++) {
      const angulo = rand(i, 10) * Math.PI * 2;
      const r = 5 + rand(i, 11) * 16;
      const x = Math.cos(angulo) * r;
      const z = Math.sin(angulo) * r;
      if (Math.abs(x - 8) > 2.5) {
        const y = calcularAlturaTerreno(x, z);
        arbustos.push({ x, y, z, escala: 0.6 + rand(i, 12) * 0.4, rotY: rand(i, 13) * Math.PI * 2 });
      }
    }

    // Rocas facetadas a lo largo de la ribera y cerros
    for (let i = 0; i < 28; i++) {
      const x = 5.2 + rand(i, 14) * 5.6;
      const z = (rand(i, 15) - 0.5) * 44;
      const y = calcularAlturaTerreno(x, z) - 0.15;
      rocas.push({
        x,
        y,
        z,
        escala: 0.45 + rand(i, 16) * 0.5,
        rot: [rand(i, 17) * Math.PI, rand(i, 18) * Math.PI, rand(i, 19) * Math.PI],
      });
    }

    // Flores multicolores en el prado central y jardín
    for (let i = 0; i < 40; i++) {
      const angulo = rand(i, 20) * Math.PI * 2;
      const r = 4 + rand(i, 21) * 13;
      const x = Math.cos(angulo) * r;
      const z = Math.sin(angulo) * r;
      if (Math.abs(x - 8) > 2.8) {
        const y = calcularAlturaTerreno(x, z);
        flores.push({ x, y, z, colorId: Math.floor(rand(i, 22) * 3) });
      }
    }

    return { pinos, frondosos, arbustos, rocas, flores };
  }, []);

  // Animación suave de transición de luz y viento
  useFrame((state, dt) => {
    // Interpolar luz solar
    if (solRef.current) {
      solRef.current.position.lerp(paramsClima.sunPos, dt * 2.5);
      solRef.current.color.lerp(paramsClima.sunColor, dt * 2.5);
      solRef.current.intensity = THREE.MathUtils.lerp(
        solRef.current.intensity,
        paramsClima.sunIntensity,
        dt * 2.5,
      );
    }
    // Interpolar esfera del sol/luna
    if (esferaSolRef.current) {
      esferaSolRef.current.position.lerp(paramsClima.sunPos, dt * 2.5);
    }
    // Interpolar luz ambiental
    if (hemiRef.current) {
      hemiRef.current.color.lerp(paramsClima.hemiSky, dt * 2.5);
      hemiRef.current.groundColor.lerp(paramsClima.hemiGround, dt * 2.5);
      hemiRef.current.intensity = THREE.MathUtils.lerp(
        hemiRef.current.intensity,
        paramsClima.hemiIntensity,
        dt * 2.5,
      );
    }

    // Actualizar tiempo en shader de agua a través de la ref mutable
    if (!prefersReducedMotion && matAguaRef.current) {
      matAguaRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      matAguaRef.current.uniforms.uSunDir.value.copy(paramsClima.sunPos).normalize();
    }

    // Nubes flotantes lentas
    if (nubeGrupoRef.current && !prefersReducedMotion) {
      nubeGrupoRef.current.position.x += dt * 0.35;
      if (nubeGrupoRef.current.position.x > 38) {
        nubeGrupoRef.current.position.x = -38;
      }
    }

    // Viento suave en follaje de árboles frondosos
    if (arbolesFollajeRef.current && !prefersReducedMotion) {
      const tiempo = state.clock.elapsedTime;
      arbolesFollajeRef.current.rotation.z = Math.sin(tiempo * 1.5) * 0.02;
    }
  });

  // Losas de piedra para senderos
  const losasCamino = useMemo(() => {
    const puntos: [number, number, number][] = [];
    function agregarTramo(desdeX: number, desdeZ: number, hastaX: number, hastaZ: number, pasos: number) {
      for (let i = 0; i <= pasos; i++) {
        const t = i / pasos;
        const x = THREE.MathUtils.lerp(desdeX, hastaX, t);
        const z = THREE.MathUtils.lerp(desdeZ, hastaZ, t);
        const y = calcularAlturaTerreno(x, z) + 0.03;
        puntos.push([x, y, z]);
      }
    }
    // Centro -> Escuela
    agregarTramo(0, 0, -15, -9, 14);
    // Centro -> Plaza dado
    agregarTramo(0, 0, -2, -14, 12);
    // Centro -> Arena
    agregarTramo(0, 0, -2, 14, 12);
    // Centro -> Observatorio
    agregarTramo(0, 0, -15, 9, 14);
    // Centro -> Puente
    agregarTramo(0, 0, 6, 0, 7);
    // Puente -> Tu casa
    agregarTramo(10, 0, 14, -10, 8);
    // Puente -> Consultorio
    agregarTramo(10, 0, 14, 11, 8);

    return puntos;
  }, []);

  return (
    <>
      {/* Niebla atmosférica suave para fundir montañas */}
      <fogExp2 attach="fog" args={[paramsClima.fogColor, paramsClima.fogDensity]} />

      {/* Cielo físico Drei */}
      {clima !== "noche" ? (
        <Sky
          distance={450000}
          sunPosition={paramsClima.sunPos.toArray()}
          turbidity={paramsClima.skyTurbidity}
          rayleigh={paramsClima.skyRayleigh}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
      ) : (
        <Stars radius={55} depth={25} count={1200} factor={3.5} saturation={0} fade speed={prefersReducedMotion ? 0 : 0.8} />
      )}

      {/* Esfera brillante del Sol o Luna */}
      <mesh ref={esferaSolRef} position={paramsClima.sunPos}>
        <sphereGeometry args={[2.8, 16, 16]} />
        <meshBasicMaterial color={paramsClima.esferaSolColor} />
      </mesh>

      {/* Luces principales */}
      <hemisphereLight ref={hemiRef} args={[paramsClima.hemiSky, paramsClima.hemiGround, paramsClima.hemiIntensity]} />
      <directionalLight
        ref={solRef}
        position={paramsClima.sunPos}
        intensity={paramsClima.sunIntensity}
        color={paramsClima.sunColor}
        castShadow={calidad === "alta"}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={95}
        shadow-camera-left={-RADIO_MUNDO_MAX}
        shadow-camera-right={RADIO_MUNDO_MAX}
        shadow-camera-top={RADIO_MUNDO_MAX}
        shadow-camera-bottom={-RADIO_MUNDO_MAX}
        shadow-bias={-0.0004}
      />

      {/* Terreno esculpido */}
      <mesh geometry={geoTerreno} receiveShadow={calidad === "alta"}>
        <meshStandardMaterial vertexColors roughness={0.82} metalness={0.05} />
      </mesh>

      {/* Río lateral con shader de ondas y espuma */}
      <mesh position={[8, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.8, 64, 32, 64]} />
        <primitive object={matAgua} ref={matAguaRef} attach="material" />
      </mesh>

      {/* Puente de piedra y madera sobre el río en [8, 0] */}
      <group position={[8, 0, 0]}>
        {/* Pilares de piedra */}
        <mesh position={[-2.4, -0.2, 0]} castShadow={calidad === "alta"}>
          <boxGeometry args={[0.9, 1.2, 4.4]} />
          <meshStandardMaterial color="#7D7D7D" roughness={0.9} />
        </mesh>
        <mesh position={[2.4, -0.2, 0]} castShadow={calidad === "alta"}>
          <boxGeometry args={[0.9, 1.2, 4.4]} />
          <meshStandardMaterial color="#7D7D7D" roughness={0.9} />
        </mesh>
        {/* Tablero curvo de madera */}
        <mesh position={[0, 0.22, 0]} castShadow={calidad === "alta"}>
          <boxGeometry args={[5.2, 0.24, 3.6]} />
          <meshStandardMaterial color="#8B5A2B" roughness={0.7} />
        </mesh>
        {/* Barandas laterales de madera */}
        <mesh position={[0, 0.65, -1.75]} castShadow={calidad === "alta"}>
          <boxGeometry args={[5.2, 0.55, 0.18]} />
          <meshStandardMaterial color="#6B4423" roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.65, 1.75]} castShadow={calidad === "alta"}>
          <boxGeometry args={[5.2, 0.55, 0.18]} />
          <meshStandardMaterial color="#6B4423" roughness={0.75} />
        </mesh>
        {/* Faroles en las 4 esquinas del puente */}
        {[
          [-2.3, 0.9, -1.8],
          [2.3, 0.9, -1.8],
          [-2.3, 0.9, 1.8],
          [2.3, 0.9, 1.8],
        ].map(([px, py, pz], idx) => (
          <group key={idx} position={[px, py, pz]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.08, 0.8, 6]} />
              <meshStandardMaterial color="#3A2518" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[0.22, 0.26, 0.22]} />
              <meshStandardMaterial
                color="#FFC928"
                emissive="#FFAA00"
                emissiveIntensity={clima === "noche" ? 1.6 : clima === "atardecer" ? 0.9 : 0.2}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Senderos de losas redondeadas */}
      <group>
        {losasCamino.map(([lx, ly, lz], i) => (
          <mesh key={i} position={[lx, ly, lz]} rotation={[-Math.PI / 2, 0, (i * 0.4) % Math.PI]}>
            <cylinderGeometry args={[0.65, 0.72, 0.06, 7]} />
            <meshStandardMaterial color="#C4B89D" roughness={0.88} />
          </mesh>
        ))}
      </group>

      {/* Faroles rústicos de madera junto a los senderos */}
      {[
        [-7, 0, -4.5],
        [-1, 0, -8],
        [-1, 0, 8],
        [-7, 0, 4.5],
        [4, 0, 0],
        [12, 0, -5],
        [12, 0, 5],
      ].map(([fx, , fz], idx) => {
        const fy = calcularAlturaTerreno(fx, fz);
        return (
          <group key={idx} position={[fx, fy, fz]}>
            <mesh position={[0, 0.9, 0]} castShadow={calidad === "alta"}>
              <cylinderGeometry args={[0.07, 0.09, 1.8, 6]} />
              <meshStandardMaterial color="#5C3A21" roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.75, 0]}>
              <boxGeometry args={[0.3, 0.34, 0.3]} />
              <meshStandardMaterial
                color="#FFC928"
                emissive="#FFAA00"
                emissiveIntensity={clima === "noche" ? 1.8 : clima === "atardecer" ? 1.0 : 0.2}
              />
            </mesh>
          </group>
        );
      })}

      {/* Vegetación instanciada: Pinos */}
      <group>
        {instancias.pinos.map((p, i) => (
          <group key={i} position={[p.x, p.y, p.z]} scale={p.escala} rotation={[0, p.rotY, 0]}>
            {/* Tronco */}
            <mesh position={[0, 0.7, 0]} castShadow={calidad === "alta"}>
              <cylinderGeometry args={[0.18, 0.28, 1.4, 6]} />
              <meshStandardMaterial color="#4A2E1B" roughness={0.85} />
            </mesh>
            {/* Niveles de follaje cónico */}
            <mesh position={[0, 1.8, 0]} castShadow={calidad === "alta"}>
              <coneGeometry args={[1.4, 1.6, 7]} />
              <meshStandardMaterial color="#1B5E38" roughness={0.75} />
            </mesh>
            <mesh position={[0, 2.7, 0]} castShadow={calidad === "alta"}>
              <coneGeometry args={[1.1, 1.4, 7]} />
              <meshStandardMaterial color="#216E42" roughness={0.75} />
            </mesh>
            <mesh position={[0, 3.5, 0]} castShadow={calidad === "alta"}>
              <coneGeometry args={[0.75, 1.2, 7]} />
              <meshStandardMaterial color="#2A8250" roughness={0.75} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Árboles frondosos */}
      <group ref={arbolesFollajeRef}>
        {instancias.frondosos.map((a, i) => (
          <group key={i} position={[a.x, a.y, a.z]} scale={a.escala} rotation={[0, a.rotY, 0]}>
            <mesh position={[0, 0.9, 0]} castShadow={calidad === "alta"}>
              <cylinderGeometry args={[0.22, 0.32, 1.8, 6]} />
              <meshStandardMaterial color="#5A3825" roughness={0.85} />
            </mesh>
            {/* Copa orgánica con esferas compuestas */}
            <mesh position={[0, 2.4, 0]} castShadow={calidad === "alta"}>
              <dodecahedronGeometry args={[1.3, 1]} />
              <meshStandardMaterial color="#389E46" roughness={0.8} />
            </mesh>
            <mesh position={[0.4, 2.8, 0.3]} castShadow={calidad === "alta"}>
              <dodecahedronGeometry args={[0.9, 1]} />
              <meshStandardMaterial color="#44B354" roughness={0.8} />
            </mesh>
            <mesh position={[-0.4, 2.7, -0.3]} castShadow={calidad === "alta"}>
              <dodecahedronGeometry args={[0.85, 1]} />
              <meshStandardMaterial color="#2E8B3B" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Arbustos orgánicos */}
      <group>
        {instancias.arbustos.map((ar, i) => (
          <group key={i} position={[ar.x, ar.y, ar.z]} scale={ar.escala} rotation={[0, ar.rotY, 0]}>
            <mesh position={[0, 0.45, 0]}>
              <dodecahedronGeometry args={[0.7, 1]} />
              <meshStandardMaterial color="#43A047" roughness={0.85} />
            </mesh>
            <mesh position={[0.3, 0.4, 0.2]}>
              <dodecahedronGeometry args={[0.5, 1]} />
              <meshStandardMaterial color="#55B85A" roughness={0.85} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Rocas facetadas */}
      <group>
        {instancias.rocas.map((r, i) => (
          <mesh
            key={i}
            position={[r.x, r.y, r.z]}
            scale={r.escala}
            rotation={r.rot}
            castShadow={calidad === "alta"}
          >
            <dodecahedronGeometry args={[0.9, 0]} />
            <meshStandardMaterial color="#78808A" roughness={0.9} flatShading />
          </mesh>
        ))}
      </group>

      {/* Flores multicolores */}
      <group>
        {instancias.flores.map((fl, i) => {
          const colorFlor = fl.colorId === 0 ? "#FFC928" : fl.colorId === 1 ? "#FF6B6B" : "#A06CD5";
          return (
            <group key={i} position={[fl.x, fl.y, fl.z]}>
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.24, 4]} />
                <meshStandardMaterial color="#2E7D32" />
              </mesh>
              <mesh position={[0, 0.25, 0]}>
                <dodecahedronGeometry args={[0.09, 0]} />
                <meshStandardMaterial color={colorFlor} roughness={0.6} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Nubes volumétricas que navegan el cielo con textura procedural local */}
      <group ref={nubeGrupoRef} position={[-15, 22, -10]}>
        {dataUrlNube && (
          <Clouds texture={dataUrlNube}>
            <Cloud
              segments={12}
              bounds={[18, 3, 18]}
              volume={8}
              color={clima === "atardecer" ? "#FFDAC7" : clima === "noche" ? "#445070" : "#FFFFFF"}
              opacity={clima === "noche" ? 0.35 : 0.65}
            />
          </Clouds>
        )}
        {/* Nubes compuestas diorama estilizadas (cero descarga de red) */}
        <group position={[18, 2, 12]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[2.4, 12, 12]} />
            <meshStandardMaterial
              color={clima === "atardecer" ? "#FFDAC7" : clima === "noche" ? "#445070" : "#FFFFFF"}
              roughness={1}
              transparent
              opacity={0.85}
            />
          </mesh>
          <mesh position={[1.8, -0.3, 0]}>
            <sphereGeometry args={[1.8, 12, 12]} />
            <meshStandardMaterial
              color={clima === "atardecer" ? "#FFDAC7" : clima === "noche" ? "#445070" : "#FFFFFF"}
              roughness={1}
              transparent
              opacity={0.85}
            />
          </mesh>
          <mesh position={[-1.7, -0.2, 0.4]}>
            <sphereGeometry args={[1.7, 12, 12]} />
            <meshStandardMaterial
              color={clima === "atardecer" ? "#FFDAC7" : clima === "noche" ? "#445070" : "#FFFFFF"}
              roughness={1}
              transparent
              opacity={0.85}
            />
          </mesh>
        </group>
      </group>

      {/* Partículas / Luciérnagas / Polen */}
      {calidad === "alta" && (
        <Sparkles
          count={55}
          scale={[36, 6, 36]}
          position={[0, 2.5, 0]}
          size={3.2}
          speed={prefersReducedMotion ? 0 : 0.6}
          color={paramsClima.sparklesColor}
          opacity={clima === "noche" ? 0.85 : 0.55}
        />
      )}

      {/* Sombras de contacto suaves para asentar el valle */}
      {calidad === "alta" && (
        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.55}
          scale={55}
          blur={2.0}
          far={8}
          resolution={512}
          frames={1}
        />
      )}

      {/* Sombra de contacto que sigue al personaje */}
      <mesh position={[posicionJugador[0], posicionJugador[1] + 0.03, posicionJugador[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, 0.55, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>
    </>
  );
}
