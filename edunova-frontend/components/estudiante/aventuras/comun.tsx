"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Lab3DType } from "@/lib/api/edunova-contract";
import { guardarMision } from "@/lib/api/offline-queue";
import { useSessionUser } from "@/lib/api/use-session";
import { soundManager } from "@/components/estudiante/juego/soundEffects";
import { ArrowLeftIcon, StarIcon } from "@/components/ui/icons";

export function decir(texto: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const voz = new SpeechSynthesisUtterance(texto);
  voz.lang = "es-PE";
  voz.rate = 0.95;
  window.speechSynthesis.speak(voz);
}

export function mezclar<T>(lista: T[]) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Sin WebGL no hay escena 3D: se ofrece otra actividad en vez de una pantalla en blanco (RNF-01). */
export function hayWebGL() {
  try {
    const lienzo = document.createElement("canvas");
    return Boolean(lienzo.getContext("webgl2") ?? lienzo.getContext("webgl"));
  } catch {
    return false;
  }
}

export function usePremio(labType: Lab3DType, juego: string) {
  const usuario = useSessionUser();

  return async function premiar(xp: number, coins: number) {
    if (usuario?.role !== "STUDENT") return "Inicia sesión como estudiante para guardar tus puntos.";
    const resultado = await guardarMision({
      studentId: usuario.id,
      labType,
      subtopicId: `aventura-${juego}`,
      rewardXP: xp,
      rewardCoins: coins,
    });
    if (resultado === "guardado") return "Tus puntos ya se guardaron.";
    if (resultado === "enCola") return "Sin internet: tus puntos se enviarán al volver la conexión.";
    return "No se pudieron guardar tus puntos.";
  };
}

export function MarcoJuego({ titulo, children }: { titulo: string; children: ReactNode }) {
  const [musica, setMusica] = useState(false);

  function alternarMusica() {
    soundManager.init();
    setMusica(soundManager.toggleBGM());
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#07061F] text-white">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-3 sm:px-5">
        <Link
          href="/estudiante/aventuras"
          className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/20"
        >
          <ArrowLeftIcon weight="bold" className="h-4 w-4" aria-hidden />
          Volver
        </Link>
        <h1 className="truncate font-[family-name:var(--font-fredoka)] text-lg font-semibold">{titulo}</h1>
        <button
          type="button"
          onClick={alternarMusica}
          aria-pressed={musica}
          className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/20"
        >
          Música
        </button>
      </header>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

export function PantallaInicio({
  titulo,
  texto,
  ayuda,
  onEmpezar,
}: {
  titulo: string;
  texto: string;
  ayuda: string;
  onEmpezar: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07061F]/70 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 text-center text-[#17164F]">
        <Image src="/assets/woebling.png" alt="" width={120} height={110} className="mx-auto h-auto w-24" />
        <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-2xl font-semibold">{titulo}</h2>
        <p className="mt-2">{texto}</p>
        <p className="mt-3 rounded-xl bg-[#F2EEFF] p-3 text-sm font-semibold text-[#5636D9]">{ayuda}</p>
        <button
          type="button"
          onClick={onEmpezar}
          className="mt-5 w-full rounded-2xl bg-[#5636D9] py-4 text-lg font-bold text-white hover:bg-[#4528b8]"
        >
          ¡A jugar!
        </button>
      </section>
    </div>
  );
}

export function PantallaFin({
  titulo,
  texto,
  xp,
  coins,
  aviso,
  onRepetir,
}: {
  titulo: string;
  texto: string;
  xp: number;
  coins: number;
  aviso: string;
  onRepetir: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#07061F]/70 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 text-center text-[#17164F]">
        <Image src="/assets/robot-saludando.png" alt="" width={120} height={135} className="mx-auto h-auto w-24" />
        <h2 className="mt-2 font-[family-name:var(--font-fredoka)] text-2xl font-semibold">{titulo}</h2>
        <p className="mt-1">{texto}</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-lg font-bold text-[#92400E]">
          <StarIcon weight="fill" className="h-6 w-6 text-[#FFC928]" aria-hidden />+{xp} XP y +{coins} NovaCoins
        </p>
        <p className="mt-1 text-sm text-[#5B5678]">{aviso}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" onClick={onRepetir} className="rounded-2xl bg-[#5636D9] py-3 font-bold text-white">
            Jugar otra vez
          </button>
          <Link href="/estudiante/aventuras" className="rounded-2xl bg-[#F2EEFF] py-3 font-bold text-[#5636D9]">
            Otros juegos
          </Link>
        </div>
      </section>
    </div>
  );
}

export function Burbuja({ etiqueta, texto, onEscuchar }: { etiqueta?: string; texto: string; onEscuchar: () => void }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 top-2 z-10 mx-auto flex max-w-xl items-start gap-2">
      <Image src="/assets/woebling.png" alt="" width={56} height={52} className="h-auto w-12 shrink-0" />
      <div className="pointer-events-auto min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[#17164F]" aria-live="polite">
        {etiqueta ? <span className="block text-xs font-bold text-[#5636D9]">{etiqueta}</span> : null}
        <span className="font-semibold">{texto}</span>
        <button type="button" onClick={onEscuchar} className="ml-2 text-sm font-bold text-[#5636D9] underline">
          Escuchar
        </button>
      </div>
    </div>
  );
}

export function SinWebGL() {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center">
      <p>
        Este dispositivo no puede mostrar juegos 3D.{" "}
        <Link href="/estudiante/flashcards" className="font-bold underline">
          Juega con las flashcards
        </Link>
        .
      </p>
    </div>
  );
}
