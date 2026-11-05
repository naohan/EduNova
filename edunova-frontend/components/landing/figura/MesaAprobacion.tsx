"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ARTE } from "./arte";
import "./iso.css";

type Paso = "inicio" | "escaner" | "espera" | "publicando" | "publicada";

const MENSAJE: Record<Paso, string> = {
  inicio: "Borrador: material recibido",
  escaner: "Borrador: la IA propone subtemas y rúbrica",
  espera: "Borrador: esperando al docente",
  publicando: "Aprobada por el docente",
  publicada: "Publicada para las tres edades",
};

const mover = ([x, y]: readonly number[]): CSSProperties => ({ transform: `translate(${x}px, ${y}px)` });
const sinMover: CSSProperties = { transform: "translate(0px, 0px)" };

export function MesaAprobacion() {
  const raiz = useRef<HTMLDivElement>(null);
  const [paso, setPaso] = useState<Paso>("inicio");
  const [corrida, setCorrida] = useState(0);
  const [visible, setVisible] = useState(false);
  // El carro se dibuja detrás de la compuerta hasta cruzarla y delante después.
  const [cruzo, setCruzo] = useState(false);

  useEffect(() => {
    const nodo = raiz.current;
    if (!nodo) return;
    const vigia = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.35 });
    vigia.observe(nodo);
    return () => vigia.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pausa = quieto ? 0 : 1;
    const t = [
      setTimeout(() => setPaso("escaner"), 500 * pausa),
      setTimeout(() => setPaso("espera"), 4400 * pausa),
    ];
    return () => t.forEach(clearTimeout);
  }, [visible, corrida]);

  function aprobar() {
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPaso("publicando");
    setTimeout(() => setCruzo(true), quieto ? 0 : 1300);
    setTimeout(() => setPaso("publicada"), quieto ? 0 : 2300);
  }

  function repetir() {
    setCruzo(false);
    setPaso("inicio");
    setCorrida((n) => n + 1);
  }

  const abierta = paso === "publicando" || paso === "publicada";
  const destino =
    paso === "inicio" ? ARTE.pos.inicio : paso === "escaner" ? ARTE.pos.escaner : paso === "espera" ? ARTE.pos.espera : ARTE.pos.final;
  const conRubrica = paso !== "inicio";

  const carro = (detras: boolean) => (
    <g className="fig-mueve fig-carro" style={{ ...mover(destino), opacity: cruzo === detras ? 0 : 1 }}>
      <g dangerouslySetInnerHTML={{ __html: ARTE.carro }} />
      <g
        className="fig-aparece"
        style={{ opacity: conRubrica ? 1 : 0 }}
        dangerouslySetInnerHTML={{ __html: ARTE.rubrica }}
      />
    </g>
  );

  return (
    <div ref={raiz} className="iso fig-mesa" data-theme="light" data-paso={paso}>
      <svg
        className="iso-svg"
        viewBox={`0 0 ${ARTE.width} ${ARTE.height}`}
        role="img"
        aria-label="Mesa de trabajo: una unidad pasa bajo el escáner de la IA y se detiene ante una compuerta, que solo sube cuando el docente presiona el botón. Después llega a tres plataformas, una por cada edad."
      >
        <g dangerouslySetInnerHTML={{ __html: ARTE.fondo }} />
        <g
          className="fig-aparece"
          style={{ opacity: paso === "escaner" ? 1 : 0 }}
          dangerouslySetInnerHTML={{ __html: ARTE.haz }}
        />
        {carro(true)}
        <g
          className="fig-mueve fig-lento"
          style={abierta ? mover(ARTE.subeCompuerta) : sinMover}
          dangerouslySetInnerHTML={{ __html: ARTE.compuerta }}
        />
        {carro(false)}
        <g dangerouslySetInnerHTML={{ __html: ARTE.frente }} />
        <g
          className="fig-mueve fig-rapido"
          style={abierta ? mover(ARTE.bajaBoton) : sinMover}
          dangerouslySetInnerHTML={{ __html: ARTE.boton }}
        />
        <g dangerouslySetInnerHTML={{ __html: ARTE.salida }} />
        {ARTE.tarjetas.map((html, i) => (
          <g
            key={i}
            className="fig-mueve"
            style={{
              ...(paso === "publicada" ? sinMover : mover(ARTE.subeTarjeta)),
              opacity: paso === "publicada" ? 1 : 0,
              transitionDelay: `${i * 120}ms`,
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E0FF] pt-4">
        <p className="min-h-6 font-bold text-[#17164F]" role="status" aria-live="polite">
          {MENSAJE[paso]}
        </p>
        {paso === "publicada" ? (
          <button
            type="button"
            onClick={repetir}
            className="rounded-xl border-2 border-[#E8E0FF] bg-white px-5 py-2.5 text-sm font-bold text-[#17164F] transition-colors hover:border-[#5636D9]"
          >
            Ver otra vez
          </button>
        ) : (
          <button
            type="button"
            onClick={aprobar}
            disabled={paso !== "espera"}
            className="btn-tactil rounded-xl bg-[#FFC928] px-5 py-2.5 text-sm font-bold text-[#17164F] disabled:cursor-not-allowed"
            style={{ "--tactil-borde": "#C98F00" } as CSSProperties}
          >
            Aprobar y publicar
          </button>
        )}
      </div>
    </div>
  );
}
