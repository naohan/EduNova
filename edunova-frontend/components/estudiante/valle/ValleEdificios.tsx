"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  LUGARES_VALLE,
  PERSONAJES_GUIA,
  alturaSuelo,
  calcularAlturaTerreno,
  destinoAlcanzable,
  siguientePunto,
  validarMovimiento,
  type ClimaHora,
  type LugarValle,
  type LugarValleId,
  type PersonajeGuiaId,
} from "./valleData";
import {
  ANIMADOS,
  construirAldea,
  construirBanderin,
  construirCruz,
  construirCupula,
  construirDado,
  construirEstandarte,
  construirExplorador,
  construirGuia,
  construirPlaneta,
} from "./valleAldea";

interface Props {
  clima: ClimaHora;
  calidad: "alta" | "ligera";
  prefersReducedMotion: boolean;
  pausado: boolean;
  lugarCercano: LugarValleId | null;
  onLugarCercanoChange: (id: LugarValleId | null) => void;
  personajeCercano: PersonajeGuiaId | null;
  onPersonajeCercanoChange: (id: PersonajeGuiaId | null) => void;
  novedades: { escuela: number; casa: number };
  preguntasDisponibles: { elena: boolean; mateo: boolean; vega: boolean };
  /** La posición vive en una ref: guardarla en estado volvería a dibujar React en cada cuadro. */
  posicionRef: RefObject<[number, number, number]>;
  objetivoMovimiento: [number, number] | null;
  setObjetivoMovimiento: (obj: [number, number] | null) => void;
}

const VELOCIDAD = 6.5;
const ESCALA_EXPLORADOR = 1.3;

const LUZ_POR_HORA: Record<ClimaHora, number> = { dia: 0.12, atardecer: 1.05, noche: 2.1 };

// La cámara se queda detrás y arriba del explorador, y mira un poco más allá de él: así entra el cielo.
const CAMARA_ANCHA = { alto: 7.4, atras: 12.4, mira: 3.4, adelante: 4.2, fov: 50 };
const CAMARA_VERTICAL = { alto: 9, atras: 14.5, mira: 3.6, adelante: 4.2, fov: 64 };

const posCamara = new THREE.Vector3();
const posMira = new THREE.Vector3();

/** Material para partes que brillan solas de noche; respeta el color de cada ventana. */
function crearMaterialLuz() {
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    emissive: "#FFFFFF",
    emissiveIntensity: LUZ_POR_HORA.dia,
    roughness: 0.35,
  });
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      "#include <emissivemap_fragment>\n  totalEmissiveRadiance *= vColor;",
    );
  };
  material.customProgramCacheKey = () => "valle-luz";
  return material;
}

/** Cartel de un lugar. Se puede tocar: el explorador camina hasta la puerta. */
function CartelLugar({ lugar, onTocar }: { lugar: LugarValle; onTocar: () => void }) {
  const Icono = lugar.icon;
  return (
    <Html position={[lugar.posicion[0], lugar.posicion[1] + lugar.alturaCartel, lugar.posicion[2]]} center zIndexRange={[15, 0]}>
      <button
        type="button"
        onClick={onTocar}
        aria-label={`Ir a ${lugar.nombre}`}
        className="flex items-center gap-1.5 rounded-full border-2 bg-white py-1 pr-3 pl-1 whitespace-nowrap"
        style={{ borderColor: lugar.colorBorde }}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: lugar.colorFondo, color: lugar.colorBorde }}
        >
          <Icono className="h-4 w-4" weight="bold" />
        </span>
        <span className="text-sm font-bold text-[#17164F]">{lugar.nombre}</span>
      </button>
    </Html>
  );
}

/** Baliza sobre los lugares con novedades: se reconoce por forma, número y color. */
function Baliza3D({
  posicion,
  cantidad,
  color,
  reducido,
}: {
  posicion: [number, number, number];
  cantidad: number;
  color: string;
  reducido: boolean;
}) {
  const grupoRef = useRef<THREE.Group>(null);
  const cristalRef = useRef<THREE.Mesh>(null);
  const anilloRef = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    if (reducido) return;
    const t = state.clock.elapsedTime;
    if (grupoRef.current) grupoRef.current.position.y = posicion[1] + Math.sin(t * 2.2) * 0.16;
    if (cristalRef.current) cristalRef.current.rotation.y += dt * 0.8;
    if (anilloRef.current) {
      const pulso = (t * 0.6) % 1;
      anilloRef.current.scale.setScalar(1 + pulso * 0.9);
      (anilloRef.current.material as THREE.MeshBasicMaterial).opacity = 0.75 * (1 - pulso);
    }
  });

  return (
    <group ref={grupoRef} position={posicion}>
      <mesh ref={cristalRef}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} roughness={0.25} metalness={0.2} flatShading />
      </mesh>
      <mesh ref={anilloRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.74, 28]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Html position={[0, 1, 0]} center zIndexRange={[15, 0]} pointerEvents="none">
        <div
          className="flex items-center gap-1.5 rounded-full border-2 bg-white py-0.5 pr-2.5 pl-1 whitespace-nowrap"
          style={{ borderColor: color }}
        >
          <span
            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-black text-[#17164F]"
            style={{ backgroundColor: color }}
          >
            {cantidad}
          </span>
          <span className="text-xs font-bold text-[#17164F]">{cantidad === 1 ? "unidad" : "unidades"}</span>
        </div>
      </Html>
    </group>
  );
}

export function ValleEdificios({
  clima,
  calidad,
  prefersReducedMotion,
  pausado,
  lugarCercano,
  onLugarCercanoChange,
  personajeCercano,
  onPersonajeCercanoChange,
  novedades,
  preguntasDisponibles,
  posicionRef,
  objetivoMovimiento,
  setObjetivoMovimiento,
}: Props) {
  const { size } = useThree();
  const sombra = calidad === "alta";

  const aldea = useMemo(() => construirAldea(), []);
  const cupula = useMemo(() => construirCupula(), []);
  const planeta = useMemo(() => construirPlaneta(), []);
  const cruz = useMemo(() => construirCruz(), []);
  const dado = useMemo(() => construirDado(), []);
  const banderin = useMemo(() => construirBanderin(), []);
  const estandartes = useMemo(() => [construirEstandarte("#FFC928", "#2472CC"), construirEstandarte("#2472CC", "#FFC928")], []);
  const explorador = useMemo(() => construirExplorador(), []);
  const guias = useMemo(
    () => ({ elena: construirGuia("elena"), mateo: construirGuia("mateo"), vega: construirGuia("vega") }),
    [],
  );

  const materiales = useMemo(
    () => ({
      opaco: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, side: THREE.DoubleSide }),
      metal: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.72 }),
      luz: crearMaterialLuz(),
      humo: new THREE.MeshStandardMaterial({ color: "#F1F3F5", transparent: true, opacity: 0.6, roughness: 1, depthWrite: false }),
    }),
    [],
  );

  const geoHumo = useMemo(() => new THREE.IcosahedronGeometry(0.3, 1), []);

  const luzRef = useRef<THREE.Mesh>(null);
  const relojHorasRef = useRef<THREE.Mesh>(null);
  const relojMinutosRef = useRef<THREE.Mesh>(null);
  const banderinRef = useRef<THREE.Mesh>(null);
  const humoRef = useRef<THREE.Group>(null);
  const cupulaRef = useRef<THREE.Group>(null);
  const planetaRef = useRef<THREE.Mesh>(null);
  const cruzRef = useRef<THREE.Mesh>(null);
  const dadoRef = useRef<THREE.Mesh>(null);
  const estandartesRef = useRef<THREE.Group>(null);
  const anilloLugarRef = useRef<THREE.Mesh>(null);
  const marcaRef = useRef<THREE.Group>(null);

  const personajeRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const brazoIzqRef = useRef<THREE.Group>(null);
  const brazoDerRef = useRef<THREE.Group>(null);
  const piernaIzqRef = useRef<THREE.Group>(null);
  const piernaDerRef = useRef<THREE.Group>(null);
  const indicadorRef = useRef<THREE.Mesh>(null);

  const elenaRef = useRef<THREE.Group>(null);
  const mateoRef = useRef<THREE.Group>(null);
  const vegaRef = useRef<THREE.Group>(null);

  const estado = useRef({
    listo: false,
    x: 0,
    z: 0,
    rotacionY: Math.PI,
    cicloCaminar: 0,
    enMovimiento: false,
    atascado: 0,
    mira: new THREE.Vector3(),
    teclas: { arriba: false, abajo: false, izquierda: false, derecha: false },
  });

  // Teclado: flechas y WASD, relativos a la vista
  useEffect(() => {
    const direccion = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") return "arriba";
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") return "abajo";
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") return "izquierda";
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") return "derecha";
      return null;
    };
    const alBajar = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tecla = direccion(e);
      if (!tecla) return;
      estado.current.teclas[tecla] = true;
      setObjetivoMovimiento(null);
    };
    const alSubir = (e: KeyboardEvent) => {
      const tecla = direccion(e);
      if (tecla) estado.current.teclas[tecla] = false;
    };
    // Si la ventana pierde el foco no llega el keyup y el explorador seguiría caminando solo.
    const soltarTodo = () => {
      estado.current.teclas = { arriba: false, abajo: false, izquierda: false, derecha: false };
    };

    window.addEventListener("keydown", alBajar);
    window.addEventListener("keyup", alSubir);
    window.addEventListener("blur", soltarTodo);
    return () => {
      window.removeEventListener("keydown", alBajar);
      window.removeEventListener("keyup", alSubir);
      window.removeEventListener("blur", soltarTodo);
    };
  }, [setObjetivoMovimiento]);

  // En un celular vertical se abre el ángulo: con el mismo lente se vería muy poco del valle.
  const camaraDatos = size.width < size.height ? CAMARA_VERTICAL : CAMARA_ANCHA;

  useFrame((state, dtReal) => {
    // Un cuadro lento no debe hacer saltar al explorador a través de un muro.
    const dt = Math.min(dtReal, 0.05);
    const tiempo = state.clock.elapsedTime;
    const em = estado.current;

    if (!em.listo) {
      em.listo = true;
      em.x = posicionRef.current[0];
      em.z = posicionRef.current[2];
    }

    let dx = 0;
    let dz = 0;

    if (!pausado) {
      if (em.teclas.arriba) dz -= 1;
      if (em.teclas.abajo) dz += 1;
      if (em.teclas.izquierda) dx -= 1;
      if (em.teclas.derecha) dx += 1;

      if (objetivoMovimiento && dx === 0 && dz === 0) {
        const llegada = Math.hypot(objetivoMovimiento[0] - em.x, objetivoMovimiento[1] - em.z);
        if (llegada > 0.25) {
          const [px, pz] = siguientePunto(em.x, em.z, objetivoMovimiento[0], objetivoMovimiento[1]);
          dx = px - em.x;
          dz = pz - em.z;
        } else {
          setObjetivoMovimiento(null);
        }
      }
    }

    const magnitud = Math.hypot(dx, dz);
    if (magnitud > 0.02) {
      em.enMovimiento = true;
      const avance = VELOCIDAD * dt;
      const [nuevoX, nuevoZ] = validarMovimiento(em.x + (dx / magnitud) * avance, em.z + (dz / magnitud) * avance, em.x, em.z);

      // Si algo lo detiene, deja de insistir: caminar sin avanzar parece un error.
      const movido = Math.hypot(nuevoX - em.x, nuevoZ - em.z);
      em.atascado = movido < avance * 0.2 ? em.atascado + dt : 0;
      if (em.atascado > 0.35 && objetivoMovimiento) {
        em.atascado = 0;
        setObjetivoMovimiento(null);
      }

      em.x = nuevoX;
      em.z = nuevoZ;

      let dif = Math.atan2(dx, dz) - em.rotacionY;
      while (dif < -Math.PI) dif += Math.PI * 2;
      while (dif > Math.PI) dif -= Math.PI * 2;
      em.rotacionY += dif * Math.min(1, dt * 12);
      em.cicloCaminar += dt * 11;
    } else {
      em.enMovimiento = false;
    }

    const suelo = alturaSuelo(em.x, em.z);
    posicionRef.current[0] = em.x;
    posicionRef.current[1] = suelo;
    posicionRef.current[2] = em.z;

    if (personajeRef.current) {
      personajeRef.current.position.set(em.x, suelo, em.z);
      personajeRef.current.rotation.y = em.rotacionY;
    }

    const paso = em.enMovimiento && !prefersReducedMotion ? Math.sin(em.cicloCaminar) : 0;
    if (piernaIzqRef.current) piernaIzqRef.current.rotation.x = paso * 0.7;
    if (piernaDerRef.current) piernaDerRef.current.rotation.x = -paso * 0.7;
    if (brazoIzqRef.current) brazoIzqRef.current.rotation.x = -paso * 0.6;
    if (brazoDerRef.current) brazoDerRef.current.rotation.x = paso * 0.6;
    if (torsoRef.current) {
      const rebote = em.enMovimiento ? Math.abs(Math.sin(em.cicloCaminar)) * 0.06 : Math.sin(tiempo * 2) * 0.012;
      torsoRef.current.position.y = 0.76 + (prefersReducedMotion ? 0 : rebote);
    }
    if (indicadorRef.current && !prefersReducedMotion) {
      indicadorRef.current.position.y = 2.15 + Math.sin(tiempo * 3) * 0.08;
    }

    // Cercanía a los lugares
    let lugarDetectado: LugarValleId | null = null;
    let lugarEncuadre: LugarValle | null = null;
    for (const lugar of LUGARES_VALLE) {
      if (Math.hypot(em.x - lugar.posicion[0], em.z - lugar.posicion[2]) <= lugar.radio) {
        lugarDetectado = lugar.id;
        lugarEncuadre = lugar;
        break;
      }
    }
    if (lugarDetectado !== lugarCercano) onLugarCercanoChange(lugarDetectado);

    // Cercanía a los personajes guía
    let guiaDetectado: PersonajeGuiaId | null = null;
    for (const guia of PERSONAJES_GUIA) {
      if (Math.hypot(em.x - guia.posicion[0], em.z - guia.posicion[2]) < 3.2) {
        guiaDetectado = guia.id;
        break;
      }
    }
    if (guiaDetectado !== personajeCercano) onPersonajeCercanoChange(guiaDetectado);

    // Respiración y mirada de los guías
    const refsGuia = [elenaRef, mateoRef, vegaRef];
    PERSONAJES_GUIA.forEach((guia, i) => {
      const grupo = refsGuia[i].current;
      if (!grupo) return;
      const [cuerpo, cabeza, signo] = grupo.children;
      if (!prefersReducedMotion) {
        const aliento = 1 + Math.sin(tiempo * 1.8 + i) * 0.014;
        cuerpo.scale.set(1, aliento, 1);
        cabeza.position.y = guiaCabezaY[guia.id] * aliento;
        if (signo) signo.position.y = 2.5 + Math.sin(tiempo * 2.6 + i) * 0.09;
        if (signo) signo.rotation.y += dt * 1.4;
      }
      const distancia = Math.hypot(em.x - guia.posicion[0], em.z - guia.posicion[2]);
      const meta = distancia < 7 ? Math.atan2(em.x - guia.posicion[0], em.z - guia.posicion[2]) : 0;
      let dif = meta - cabeza.rotation.y;
      while (dif < -Math.PI) dif += Math.PI * 2;
      while (dif > Math.PI) dif -= Math.PI * 2;
      cabeza.rotation.y += dif * Math.min(1, dt * 5);
      cuerpo.rotation.y += (cabeza.rotation.y * 0.55 - cuerpo.rotation.y) * Math.min(1, dt * 3);
    });

    // Cámara con amortiguación. Cerca de un lugar la mirada se inclina suavemente hacia él.
    const { alto, atras, mira, adelante, fov } = camaraDatos;
    const lente = state.camera as THREE.PerspectiveCamera;
    if (lente.fov !== fov) {
      lente.fov = fov;
      lente.updateProjectionMatrix();
    }
    posCamara.set(em.x, suelo + alto, em.z + atras);
    posMira.set(em.x, suelo + mira, em.z - adelante);
    if (lugarEncuadre) {
      posMira.x += (lugarEncuadre.posicion[0] - em.x) * 0.24;
      posMira.z += (lugarEncuadre.posicion[2] - em.z) * 0.1;
    }
    const k = 1 - Math.exp(-dt * 5);
    state.camera.position.lerp(posCamara, em.mira.lengthSq() === 0 ? 1 : k);
    if (em.mira.lengthSq() === 0) em.mira.copy(posMira);
    em.mira.lerp(posMira, k);
    state.camera.lookAt(em.mira);

    // Luz de ventanas y faroles según la hora
    if (luzRef.current) {
      const m = luzRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, LUZ_POR_HORA[clima], Math.min(1, dt * 2.4));
    }

    // Anillos del suelo
    if (anilloLugarRef.current && !prefersReducedMotion) {
      anilloLugarRef.current.scale.setScalar(1 + Math.sin(tiempo * 3.4) * 0.07);
    }
    if (marcaRef.current && !prefersReducedMotion) {
      marcaRef.current.scale.setScalar(0.85 + ((tiempo * 1.5) % 1) * 0.5);
    }

    if (prefersReducedMotion) return;

    if (relojMinutosRef.current) relojMinutosRef.current.rotation.z = -tiempo * 0.4;
    if (relojHorasRef.current) relojHorasRef.current.rotation.z = -tiempo * 0.035;
    if (banderinRef.current) banderinRef.current.rotation.y = Math.sin(tiempo * 3.2) * 0.32;

    if (humoRef.current) {
      humoRef.current.children.forEach((puf, i) => {
        const fase = ((tiempo * 0.34 + i * 0.25) % 1) * 2.6;
        puf.position.set(Math.sin(fase * 2 + i) * 0.22 + fase * 0.12, fase * 1.05, 0);
        puf.scale.setScalar(0.5 + fase * 0.55);
      });
    }

    if (cupulaRef.current) cupulaRef.current.rotation.y += dt * 0.14;
    if (planetaRef.current) planetaRef.current.rotation.y += dt * 0.7;
    if (cruzRef.current) cruzRef.current.scale.setScalar(1 + Math.sin(tiempo * 3.4) * 0.06);
    if (dadoRef.current) {
      dadoRef.current.rotation.y += dt * 0.7;
      dadoRef.current.rotation.x += dt * 0.42;
      dadoRef.current.position.y = ANIMADOS.dado[1] + Math.sin(tiempo * 1.7) * 0.16;
    }
    if (estandartesRef.current) {
      estandartesRef.current.children.forEach((paño, i) => {
        paño.rotation.y = Math.sin(tiempo * 2.4 + i) * 0.3 + (i ? Math.PI : 0);
      });
    }
  });

  const irALugar = (lugar: LugarValle) => setObjetivoMovimiento([lugar.puntoEntrada[0], lugar.puntoEntrada[2]]);

  const lugarActivo = LUGARES_VALLE.find((l) => l.id === lugarCercano);
  const [escuela, casa] = LUGARES_VALLE;
  const signoColor = { elena: "#FFC928", mateo: "#2DBE70", vega: "#7C5CE6" };
  const hayPregunta = preguntasDisponibles;

  return (
    <>
      {/* Toques sobre edificios y personajes: el explorador va a su puerta en vez de chocar con el muro */}
      {LUGARES_VALLE.map((lugar) => {
        const radio = lugar.solido.forma === "circulo" ? lugar.solido.radio : Math.max(lugar.solido.mediaX, lugar.solido.mediaZ);
        return (
          <mesh
            key={lugar.id}
            visible={false}
            position={[lugar.posicion[0], lugar.posicion[1] + 3, lugar.posicion[2]]}
            onPointerDown={(e) => {
              e.stopPropagation();
              irALugar(lugar);
            }}
          >
            <cylinderGeometry args={[radio, radio, 7, 10]} />
            <meshBasicMaterial />
          </mesh>
        );
      })}

      {/* Piezas fijas del valle: tres llamadas de dibujo para todos los edificios */}
      <mesh geometry={aldea.opaca} material={materiales.opaco} castShadow={sombra} receiveShadow={sombra} />
      <mesh geometry={aldea.metal} material={materiales.metal} castShadow={sombra} />
      <mesh ref={luzRef} geometry={aldea.luz} material={materiales.luz} />

      {/* Reloj de la Escuela */}
      <group position={ANIMADOS.reloj}>
        <mesh ref={relojHorasRef}>
          <planeGeometry args={[0.07, 0.56]} />
          <meshBasicMaterial color="#17164F" />
        </mesh>
        <mesh ref={relojMinutosRef} position={[0, 0, 0.012]}>
          <planeGeometry args={[0.045, 0.82]} />
          <meshBasicMaterial color="#B85333" />
        </mesh>
      </group>

      <mesh ref={banderinRef} geometry={banderin} material={materiales.opaco} position={ANIMADOS.banderin} />

      {/* Humo de la chimenea */}
      <group ref={humoRef} position={ANIMADOS.humo}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} geometry={geoHumo} material={materiales.humo} />
        ))}
      </group>

      {/* Cúpula giratoria y planeta del Observatorio */}
      <group ref={cupulaRef} position={ANIMADOS.cupula}>
        <mesh geometry={cupula.metal} material={materiales.metal} castShadow={sombra} />
        <mesh geometry={cupula.detalle} material={materiales.opaco} />
      </group>
      <mesh ref={planetaRef} geometry={planeta} material={materiales.opaco} position={ANIMADOS.planeta} />

      <mesh ref={cruzRef} geometry={cruz} material={materiales.opaco} position={ANIMADOS.cruz} />

      {/* Dado que levita sobre su pedestal */}
      <mesh ref={dadoRef} geometry={dado} material={materiales.opaco} position={ANIMADOS.dado} castShadow={sombra} />

      <group ref={estandartesRef}>
        <mesh geometry={estandartes[0]} material={materiales.opaco} position={ANIMADOS.estandartes[0]} />
        <mesh geometry={estandartes[1]} material={materiales.opaco} position={ANIMADOS.estandartes[1]} />
      </group>

      {/* Anillo de luz en la puerta del lugar cercano */}
      {lugarActivo ? (
        <mesh
          ref={anilloLugarRef}
          position={[lugarActivo.puntoEntrada[0], alturaSuelo(lugarActivo.puntoEntrada[0], lugarActivo.puntoEntrada[2]) + 0.07, lugarActivo.puntoEntrada[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[1.25, 1.6, 40]} />
          <meshBasicMaterial color={lugarActivo.color} transparent opacity={0.9} depthWrite={false} />
        </mesh>
      ) : null}

      {/* Anillo en el punto tocado */}
      {objetivoMovimiento ? (
        <group
          ref={marcaRef}
          position={[objetivoMovimiento[0], calcularAlturaTerreno(objetivoMovimiento[0], objetivoMovimiento[1]) + 0.08, objetivoMovimiento[1]]}
        >
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.34, 0.5, 28]} />
            <meshBasicMaterial color="#FFC928" transparent opacity={0.95} depthWrite={false} />
          </mesh>
        </group>
      ) : null}

      {LUGARES_VALLE.map((lugar) => (
        <CartelLugar key={lugar.id} lugar={lugar} onTocar={() => irALugar(lugar)} />
      ))}

      {novedades.escuela > 0 ? (
        <Baliza3D
          posicion={[escuela.posicion[0] - 2.9, 7.6, escuela.posicion[2] + 1]}
          cantidad={novedades.escuela}
          color={escuela.color}
          reducido={prefersReducedMotion}
        />
      ) : null}
      {novedades.casa > 0 ? (
        <Baliza3D
          posicion={[casa.posicion[0] - 2.4, 6.6, casa.posicion[2] + 1]}
          cantidad={novedades.casa}
          color={casa.color}
          reducido={prefersReducedMotion}
        />
      ) : null}

      {/* Explorador */}
      <group ref={personajeRef} scale={ESCALA_EXPLORADOR}>
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.46, 24]} />
          <meshBasicMaterial color="#17164F" transparent opacity={0.28} depthWrite={false} />
        </mesh>
        <group ref={torsoRef} position={[0, 0.76, 0]}>
          <mesh geometry={explorador.cuerpo} material={materiales.opaco} castShadow={sombra} />
        </group>
        <group ref={brazoIzqRef} position={[-0.31, 0.98, 0]}>
          <mesh geometry={explorador.brazoI} material={materiales.opaco} castShadow={sombra} />
        </group>
        <group ref={brazoDerRef} position={[0.31, 0.98, 0]}>
          <mesh geometry={explorador.brazoD} material={materiales.opaco} castShadow={sombra} />
        </group>
        <group ref={piernaIzqRef} position={[-0.13, 0.46, 0]}>
          <mesh geometry={explorador.piernaI} material={materiales.opaco} castShadow={sombra} />
        </group>
        <group ref={piernaDerRef} position={[0.13, 0.46, 0]}>
          <mesh geometry={explorador.piernaD} material={materiales.opaco} castShadow={sombra} />
        </group>

        {/* Marca "aquí estás": se ve incluso detrás de un árbol o un muro */}
        <mesh ref={indicadorRef} position={[0, 2.15, 0]} rotation={[Math.PI, 0, 0]} renderOrder={20}>
          <coneGeometry args={[0.17, 0.3, 4]} />
          <meshBasicMaterial color="#FFC928" depthTest={false} transparent />
        </mesh>
      </group>

      {/* Personajes guía */}
      {PERSONAJES_GUIA.map((guia, i) => {
        const refGrupo = [elenaRef, mateoRef, vegaRef][i];
        const modelo = guias[guia.id];
        const y = calcularAlturaTerreno(guia.posicion[0], guia.posicion[2]);
        return (
          <group
            key={guia.id}
            ref={refGrupo}
            position={[guia.posicion[0], y, guia.posicion[2]]}
            scale={1.25}
            onPointerDown={(e) => {
              e.stopPropagation();
              setObjetivoMovimiento(destinoAlcanzable(guia.posicion[0], guia.posicion[2] + 1.6));
            }}
          >
            <mesh geometry={modelo.cuerpo} material={materiales.opaco} castShadow={sombra} />
            <mesh geometry={modelo.cabeza} material={materiales.opaco} castShadow={sombra} position={[0, guiaCabezaY[guia.id], 0]} />
            {hayPregunta[guia.id] ? (
              <mesh position={[0, 2.5, 0]}>
                <octahedronGeometry args={[0.2, 0]} />
                <meshStandardMaterial color={signoColor[guia.id]} emissive={signoColor[guia.id]} emissiveIntensity={0.8} flatShading />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </>
  );
}

const guiaCabezaY: Record<PersonajeGuiaId, number> = { elena: 1.46, mateo: 1.54, vega: 1.36 };
