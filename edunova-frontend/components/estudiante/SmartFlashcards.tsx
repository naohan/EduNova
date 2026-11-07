"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getUnit } from "@/lib/api/client";
import type { Flashcard } from "@/lib/api/edunova-contract";
import { registrarEvento } from "@/lib/api/learning-events";
import { guardarProgreso } from "@/lib/api/offline-queue";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";
import { ArrowCounterClockwiseIcon, CheckIcon, DiamondIcon, HouseIcon, PlayIcon, QuestionIcon, StarIcon } from "@/components/ui/icons";
import { BotonSalir, BotonVoz, PuntosAvance } from "./shared/kit";
import { armarCola, avanzarCola, guardarRepaso, leerRepaso, unirTarjetas } from "./flashcardQueue";

const XP_POR_TARJETA = 10;
const COINS_POR_SESION = 10;

type Fin = { total: number; aRepasar: number; aviso: string };

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
    const subtema =
      unidad.status === "ok"
        ? unidad.data.subtopics.find((s) => s.stages.practice.flashcards.some((t) => t.id === cola[0].id))
        : undefined;
    registrarEvento({
      activity: "FLASHCARD",
      correct: laSabia,
      subtopicId: subtema?.id,
      questionId: cola[0].id,
      attempt: yaFallo ? 2 : 1,
      hintsUsed: 0,
      timeMs: 0,
    });
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
      <section className="flex min-h-[80dvh] flex-col items-center justify-center text-center">
        <Image src="/assets/woebling.png" alt="" width={140} height={128} className="h-auto w-32" />
        <h1 className="mt-4 font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">¡Terminaste!</h1>
        <p className="mt-3 flex items-center gap-5 text-xl font-black text-[#17164F]">
          <span className="inline-flex items-center gap-1.5">
            <StarIcon weight="fill" className="h-6 w-6 text-[#FFC928]" aria-hidden />+{fin.total * XP_POR_TARJETA}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <DiamondIcon weight="fill" className="h-6 w-6 text-[#C98F00]" aria-hidden />+{COINS_POR_SESION}
          </span>
        </p>
        <p className="mt-2 text-sm font-semibold text-[#17164F]/75">{fin.aviso}</p>
        <div className="mt-6 grid w-full max-w-xs grid-cols-[auto_1fr] gap-3">
          <Link
            href="/estudiante"
            aria-label="Volver al inicio"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#17164F]"
          >
            <HouseIcon weight="fill" className="h-6 w-6" aria-hidden />
          </Link>
          <button type="button" onClick={empezar} className="btn-tactil tactil-refuerzo gap-2 py-3 text-lg text-[#17164F]">
            <ArrowCounterClockwiseIcon weight="bold" className="h-6 w-6" aria-hidden />
            Otra vez
          </button>
        </div>
      </section>
    );
  }

  if (!cola) {
    return (
      <section className="flex min-h-[90dvh] flex-col">
        <div className="flex items-center justify-between">
          <BotonVoz texto="Piensa la respuesta, voltea la tarjeta y di si la sabías. Si fallas no pierdes puntos: la tarjeta vuelve para que la practiques." etiqueta="Cómo se juega" />
          <BotonSalir href="/estudiante" etiqueta="Salir" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Image src="/assets/woebling-estudiando.png" alt="" width={180} height={166} className="h-auto w-40" />
          <h1 className="mt-4 font-[family-name:var(--font-fredoka)] text-3xl font-bold text-[#17164F]">Repasar</h1>
          <button
            type="button"
            onClick={empezar}
            disabled={unidad.status === "loading"}
            aria-label="Empezar"
            className="btn-tactil tactil-refuerzo mt-6 w-full max-w-xs py-4 text-[#17164F]"
          >
            <PlayIcon weight="fill" className="h-8 w-8" aria-hidden />
          </button>
        </div>
      </section>
    );
  }

  const tarjeta = cola[0];
  if (!tarjeta) return null;
  const hechas = total - new Set(cola.map((t) => t.front)).size;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <PuntosAvance actual={hechas} total={total} etiqueta="Tarjetas terminadas" />
        <BotonVoz key={`${tarjeta.front}-${volteada}`} texto={volteada ? tarjeta.back : tarjeta.front} />
        <BotonSalir href="/estudiante" etiqueta="Salir" />
      </div>

      <button
        type="button"
        onClick={() => setVolteada((v) => !v)}
        aria-label={volteada ? `Respuesta: ${tarjeta.back}. Toca para ver la pregunta.` : `${tarjeta.front} Toca para ver la respuesta.`}
        className="block h-72 w-full [perspective:1000px] sm:h-80"
      >
        <span
          className={`relative block h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
            volteada ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-[#E8E0FF] bg-white p-6 [backface-visibility:hidden]">
            <span className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F] sm:text-3xl">
              {tarjeta.front}
            </span>
            <ArrowCounterClockwiseIcon weight="bold" className="h-8 w-8 text-[#D9583F]" aria-hidden />
          </span>
          <span className="absolute inset-0 flex items-center justify-center rounded-3xl bg-[#5636D9] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="font-[family-name:var(--font-fredoka)] text-3xl font-semibold text-white sm:text-4xl">
              {tarjeta.back}
            </span>
          </span>
        </span>
      </button>

      {volteada ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => responder(false)}
            aria-label="Tengo dudas"
            className="btn-tactil tactil-refuerzo-suave gap-2 py-3.5 text-lg text-[#17164F]"
          >
            <QuestionIcon weight="bold" className="h-7 w-7" aria-hidden />
            Dudas
          </button>
          <button
            type="button"
            onClick={() => responder(true)}
            aria-label="La sabía"
            className="btn-tactil tactil-cooperar gap-2 py-3.5 text-lg text-[#17164F]"
          >
            <CheckIcon weight="bold" className="h-7 w-7" aria-hidden />
            ¡La sabía!
          </button>
        </div>
      ) : null}
    </div>
  );
}
