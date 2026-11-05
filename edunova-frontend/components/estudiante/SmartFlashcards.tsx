"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getUnit } from "@/lib/api/client";
import type { Flashcard } from "@/lib/api/edunova-contract";
import { guardarProgreso } from "@/lib/api/offline-queue";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";
import { CheckIcon, QuestionIcon, StarIcon } from "@/components/ui/icons";
import { armarCola, avanzarCola, guardarRepaso, leerRepaso, unirTarjetas } from "./flashcardQueue";

const XP_POR_TARJETA = 10;
const COINS_POR_SESION = 10;

type Fin = { total: number; aRepasar: number; aviso: string };

function escuchar(texto: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const voz = new SpeechSynthesisUtterance(texto);
  voz.lang = "es-PE";
  window.speechSynthesis.speak(voz);
}

/** HU-08 y RF-03: tarjetas que reaparecen si fallas, también sin internet. */
export function SmartFlashcards() {
  const usuario = useSessionUser();
  const unidad = useApi(() => getUnit("unit-solar-system"), []);
  const [cola, setCola] = useState<Flashcard[] | null>(null);
  const [total, setTotal] = useState(0);
  const [volteada, setVolteada] = useState(false);
  const [falladas, setFalladas] = useState<string[]>([]);
  const [repaso, setRepaso] = useState<string[]>([]);
  const [fin, setFin] = useState<Fin | null>(null);

  function empezar() {
    const delServidor = unidad.status === "ok" ? unidad.data.subtopics.flatMap((s) => s.stages.practice.flashcards) : [];
    const tarjetas = unirTarjetas(delServidor);
    const pendientes = leerRepaso();
    setRepaso(pendientes);
    setCola(armarCola(tarjetas, pendientes));
    setTotal(tarjetas.length);
    setFalladas([]);
    setVolteada(false);
    setFin(null);
  }

  async function terminar(aRepasar: string[]) {
    const xp = total * XP_POR_TARJETA;
    setFin({ total, aRepasar: aRepasar.length, aviso: "Guardando tus puntos…" });
    if (usuario?.role !== "STUDENT") {
      setFin({ total, aRepasar: aRepasar.length, aviso: "Inicia sesión como estudiante para guardar tus puntos." });
      return;
    }
    const resultado = await guardarProgreso(usuario.id, [{ xp, coins: COINS_POR_SESION }]);
    const avisos = {
      guardado: "Tus puntos ya se guardaron.",
      enCola: "Sin internet: tus puntos se enviarán al volver la conexión.",
      error: "No se pudieron guardar tus puntos.",
    };
    setFin({ total, aRepasar: aRepasar.length, aviso: avisos[resultado] });
  }

  function responder(laSabia: boolean) {
    if (!cola?.[0]) return;
    const pregunta = cola[0].front;
    const yaFallo = falladas.includes(pregunta);
    const nuevasFalladas = laSabia || yaFallo ? falladas : [...falladas, pregunta];
    // Sale del repaso solo si la acierta sin fallar en esta sesión.
    const nuevoRepaso = laSabia && !yaFallo
      ? repaso.filter((p) => p !== pregunta)
      : [...new Set([...repaso, pregunta])];
    const nuevaCola = avanzarCola(cola, laSabia);

    setFalladas(nuevasFalladas);
    setRepaso(nuevoRepaso);
    guardarRepaso(nuevoRepaso);
    setVolteada(false);
    setCola(nuevaCola);
    if (!nuevaCola.length) void terminar(nuevoRepaso);
  }

  if (fin) {
    return (
      <section className="rounded-2xl border border-[#E8E0FF] bg-white p-6 text-center">
        <Image src="/assets/woebling.png" alt="" width={120} height={110} className="mx-auto h-auto w-24" />
        <h2 className="mt-3 font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
          ¡Terminaste las {fin.total} tarjetas!
        </h2>
        <p className="mt-2 inline-flex items-center gap-1.5 font-bold text-[#92400E]">
          <StarIcon weight="fill" className="h-5 w-5 text-[#FFC928]" aria-hidden />+{fin.total * XP_POR_TARJETA} XP y +
          {COINS_POR_SESION} NovaCoins
        </p>
        <p className="mt-1 text-sm text-[#5B5678]">{fin.aviso}</p>
        {fin.aRepasar > 0 ? (
          <p className="mt-3 rounded-xl bg-[#F2EEFF] p-3 text-sm text-[#17164F]">
            {fin.aRepasar === 1 ? "1 tarjeta aparecerá" : `${fin.aRepasar} tarjetas aparecerán`} primero la próxima vez.
            Equivocarse también es aprender.
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={empezar} className="rounded-xl bg-[#5636D9] px-5 py-3 text-sm font-bold text-white">
            Jugar otra vez
          </button>
          <Link href="/estudiante" className="rounded-xl px-4 py-3 text-sm font-semibold text-[#5636D9]">
            Volver al inicio
          </Link>
        </div>
      </section>
    );
  }

  if (!cola) {
    return (
      <section className="rounded-2xl border border-[#E8E0FF] bg-white p-6 text-center">
        <Image src="/assets/woebling-estudiando.png" alt="" width={140} height={130} className="mx-auto h-auto w-28" />
        <p className="mt-3 text-[#17164F]">
          Piensa la respuesta, voltea la tarjeta y di si la sabías. Si fallas no pierdes puntos: la tarjeta vuelve para que
          la practiques.
        </p>
        <button
          type="button"
          onClick={empezar}
          disabled={unidad.status === "loading"}
          className="mt-5 w-full rounded-2xl bg-[#5636D9] py-4 text-base font-bold text-white disabled:opacity-50"
        >
          {unidad.status === "loading" ? "Preparando tarjetas…" : "Empezar"}
        </button>
      </section>
    );
  }

  const tarjeta = cola[0];
  if (!tarjeta) return null;
  const hechas = total - new Set(cola.map((t) => t.front)).size;
  const esRepaso = repaso.includes(tarjeta.front);

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 flex justify-between text-sm font-semibold text-[#5B5678]">
          <span>
            {hechas} de {total}
          </span>
          {esRepaso ? <span className="text-[#5636D9]">Repaso</span> : null}
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-[#E8E0FF]"
          role="progressbar"
          aria-valuenow={hechas}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Tarjetas terminadas"
        >
          <div className="h-full rounded-full bg-[#5636D9] transition-[width]" style={{ width: `${(hechas / total) * 100}%` }} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setVolteada((v) => !v)}
        aria-label={volteada ? `Respuesta: ${tarjeta.back}. Toca para ver la pregunta.` : `${tarjeta.front} Toca para ver la respuesta.`}
        className="block h-64 w-full [perspective:1000px] sm:h-72"
      >
        <span
          className={`relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
            volteada ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <span className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-[#E8E0FF] bg-white p-6 [backface-visibility:hidden]">
            <span className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F] sm:text-3xl">
              {tarjeta.front}
            </span>
            <span className="mt-4 text-sm font-semibold text-[#5636D9]">Toca para voltear</span>
          </span>
          <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#5636D9] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="font-[family-name:var(--font-fredoka)] text-3xl font-semibold text-white sm:text-4xl">
              {tarjeta.back}
            </span>
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => escuchar(volteada ? tarjeta.back : tarjeta.front)}
        className="w-full rounded-xl border border-[#E8E0FF] bg-white py-2.5 text-sm font-bold text-[#5636D9]"
      >
        Escuchar
      </button>

      {volteada ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => responder(false)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#FEF3C7] py-4 text-base font-bold text-[#92400E]"
          >
            <QuestionIcon weight="bold" className="h-5 w-5" aria-hidden />
            Tengo dudas
          </button>
          <button
            type="button"
            onClick={() => responder(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#2DBE70] py-4 text-base font-bold text-[#0B3D22]"
          >
            <CheckIcon weight="bold" className="h-5 w-5" aria-hidden />
            ¡La sabía!
          </button>
        </div>
      ) : null}
    </div>
  );
}
