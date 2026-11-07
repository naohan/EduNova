"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckIcon, SpeakerHighIcon, XIcon } from "@/components/ui/icons";
import { hasSpeech, noopSubscribe, speak, stopSpeech } from "@/lib/speech";

// Piezas compartidas de las pantallas del estudiante. La regla es que un niño que casi no lee pueda
// usarlas: un icono o imagen por acción, una palabra como máximo y la voz para todo lo demás.

export type Seccion = "explorar" | "juego" | "cooperar" | "magia" | "refuerzo";

/** Lee en voz alta. Sin voz en el navegador no se muestra: un botón mudo confunde más que ayuda. */
export function BotonVoz({
  texto,
  etiqueta = "Escuchar",
  oscuro = false,
  className = "",
}: {
  texto: string;
  etiqueta?: string;
  oscuro?: boolean;
  className?: string;
}) {
  const disponible = useSyncExternalStore(noopSubscribe, hasSpeech, () => false);
  const [hablando, setHablando] = useState(false);

  useEffect(() => stopSpeech, []);

  if (!disponible) return null;

  function alternar() {
    if (hablando) {
      stopSpeech();
      setHablando(false);
      return;
    }
    const inicio = speak(texto, {
      rate: 0.95,
      onEnd: () => setHablando(false),
      onError: () => setHablando(false),
    });
    setHablando(inicio);
  }

  const color = hablando
    ? "bg-[#5636D9] text-white"
    : oscuro
      ? "bg-white/15 text-white hover:bg-white/25"
      : "bg-[#F2EEFF] text-[#5636D9] hover:bg-[#E8E0FF]";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={etiqueta}
      aria-pressed={hablando}
      title={etiqueta}
      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${color} ${className}`}
    >
      <SpeakerHighIcon weight="fill" className="h-6 w-6" aria-hidden />
    </button>
  );
}

/** La salida de cualquier ejercicio: siempre la misma X, siempre arriba a la derecha. */
export function BotonSalir({
  href,
  onClick,
  etiqueta = "Salir",
  oscuro = false,
}: {
  href?: string;
  onClick?: () => void;
  etiqueta?: string;
  oscuro?: boolean;
}) {
  const cls = `inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${
    oscuro ? "bg-white/15 text-white hover:bg-white/25" : "bg-white text-[#17164F] hover:bg-[#F2EEFF]"
  }`;
  const icono = <XIcon weight="bold" className="h-6 w-6" aria-hidden />;
  if (href) {
    return (
      <Link href={href} aria-label={etiqueta} title={etiqueta} className={cls}>
        {icono}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={etiqueta} title={etiqueta} className={cls}>
      {icono}
    </button>
  );
}

/** Avance contado en puntos: se entiende sin leer "Pregunta 2 de 5". */
export function PuntosAvance({
  actual,
  total,
  oscuro = false,
  etiqueta = "Avance",
}: {
  actual: number;
  total: number;
  oscuro?: boolean;
  etiqueta?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={actual}
      className="flex min-w-0 flex-1 items-center gap-1.5"
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          className={`h-2.5 max-w-12 flex-1 rounded-full transition-colors ${
            i < actual ? "bg-[#2DBE70]" : i === actual ? "bg-[#FFC928]" : oscuro ? "bg-white/20" : "bg-[#E8E0FF]"
          }`}
        />
      ))}
    </div>
  );
}

export type EstadoOpcion = "normal" | "bien" | "mal" | "fuera";

const estiloOpcion: Record<EstadoOpcion, string> = {
  normal: "border-[#E8E0FF] border-b-[#CFC4F5] bg-white text-[#17164F] hover:border-[#5636D9] hover:bg-[#F7F4FF]",
  bien: "border-[#1B8A4F] bg-[#E3F8EC] text-[#17164F]",
  mal: "border-[#D9583F] bg-[#FFEDE8] text-[#17164F]",
  fuera: "border-[#E8E0FF] bg-[#F7F4FF] text-[#17164F]/40 line-through",
};

/** Una respuesta. Se pulsa una vez y el color y el icono dicen cómo te fue. */
export function Opcion({
  estado = "normal",
  disabled,
  onClick,
  children,
}: {
  estado?: EstadoOpcion;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled || estado === "fuera"}
      onClick={onClick}
      className={`flex min-h-[64px] w-full items-center justify-between gap-3 rounded-2xl border-2 border-b-4 px-5 py-3 text-left text-lg font-bold transition-colors ${estiloOpcion[estado]}`}
    >
      <span className="min-w-0">{children}</span>
      {estado === "bien" ? <CheckIcon weight="bold" className="h-7 w-7 shrink-0 text-[#1B8A4F]" aria-hidden /> : null}
      {estado === "mal" ? <XIcon weight="bold" className="h-7 w-7 shrink-0 text-[#D9583F]" aria-hidden /> : null}
    </button>
  );
}

/** Puerta a una pantalla: dibujo grande, una palabra, el color de su sección. */
export function Mosaico({
  href,
  etiqueta,
  seccion,
  imagen,
  children,
  descripcion,
  className = "",
}: {
  href: string;
  etiqueta: string;
  seccion: Seccion;
  imagen?: string;
  /** Un icono, si no hay imagen. */
  children?: ReactNode;
  /** Para lectores de pantalla: el niño ve solo la palabra. */
  descripcion?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={descripcion ?? etiqueta}
      className={`card-tactil tactil-${seccion}-suave min-h-[148px] flex-col items-center justify-center gap-3 p-4 text-center ${className}`}
    >
      {imagen ? <Image src={imagen} alt="" width={96} height={96} className="h-20 w-20 object-contain sm:h-24 sm:w-24" /> : children}
      <span className="font-[family-name:var(--font-fredoka)] text-lg font-bold text-[#17164F]">{etiqueta}</span>
    </Link>
  );
}

/** Título de pantalla: una línea y, si hace falta, la voz para explicarla. */
export function TituloPantalla({ children, voz }: { children: ReactNode; voz?: string }) {
  return (
    <header className="mb-5 flex items-center justify-between gap-3">
      <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">{children}</h1>
      {voz ? <BotonVoz texto={voz} /> : null}
    </header>
  );
}
