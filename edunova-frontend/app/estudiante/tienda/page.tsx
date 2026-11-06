"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { TituloPantalla } from "@/components/estudiante/shared/kit";
import { DiamondIcon } from "@/components/ui/icons";
import { buyItem, getShopItems, getStudentProfile, toggleItem, type ApiResult } from "@/lib/api/client";
import type { AvatarSlot, Inventory, ShopItem } from "@/lib/api/edunova-contract";
import { useApi } from "@/lib/api/use-api";
import { useSessionUser } from "@/lib/api/use-session";

// Mismo catálogo que el backend (services/shop.ts): se muestra si el servidor no responde.
const catalogoEjemplo: ShopItem[] = [
  { id: "gorra-exploradora", name: "Gorra exploradora", emoji: "🧢", price: 200, slot: "CABEZA" },
  { id: "corona-supernova", name: "Corona Supernova", emoji: "👑", price: 800, slot: "CABEZA" },
  { id: "lentes-astronauta", name: "Lentes de astronauta", emoji: "🕶️", price: 300, slot: "CARA" },
  { id: "bufanda-estelar", name: "Bufanda estelar", emoji: "🧣", price: 150, slot: "CUELLO" },
  { id: "mochila-cohete", name: "Mochila cohete", emoji: "🎒", price: 500, slot: "ESPALDA" },
];

const posiciones: Record<AvatarSlot, string> = {
  CABEZA: "left-[20%] top-[-8%] text-5xl",
  CARA: "left-[20%] top-[14%] text-5xl",
  CUELLO: "left-[24%] top-[42%] text-4xl",
  ESPALDA: "left-[4%] top-[42%] text-4xl",
};

function Mascota({ puestos }: { puestos: ShopItem[] }) {
  return (
    <div className="relative mx-auto h-52 w-52" aria-label="Tu mascota con sus accesorios" role="img">
      <Image src="/assets/woebling.png" alt="" fill sizes="208px" className="object-contain" />
      {puestos.map((p) => (
        <span key={p.id} aria-hidden className={`absolute ${posiciones[p.slot]}`}>
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

const sinSesion: ApiResult<never> = { ok: false, status: 401, error: "sin sesión" };

export default function Page() {
  const usuario = useSessionUser();
  const studentId = usuario?.role === "STUDENT" ? usuario.id : undefined;
  const catalogo = useApi(getShopItems, []);
  const perfil = useApi(() => (studentId ? getStudentProfile(studentId) : Promise.resolve(sinSesion)), [studentId]);
  const [cambios, setCambios] = useState<Inventory | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const items = catalogo.status === "ok" ? catalogo.data : catalogoEjemplo;
  const inventario: Inventory | null =
    cambios ??
    (studentId && perfil.status === "ok"
      ? {
          novaCoins: perfil.data.novaCoins,
          ownedItems: perfil.data.ownedItems ?? [],
          equippedItems: perfil.data.equippedItems,
        }
      : null);
  const puestos = items.filter((i) => inventario?.equippedItems.includes(i.id));

  async function accion(item: ShopItem, llamada: (id: string) => Promise<ApiResult<Inventory>>) {
    setOcupado(item.id);
    setError(null);
    const r = await llamada(item.id);
    if (r.ok) setCambios(r.data);
    else setError(r.status ? r.error : "No se pudo conectar con el servidor. Intenta de nuevo.");
    setOcupado(null);
  }

  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <TituloPantalla voz="Usa tus monedas para darle estilo a tu robot.">Tienda</TituloPantalla>

        {error ? (
          <p role="alert" className="mb-4 rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
            {error}
          </p>
        ) : null}
        {catalogo.status === "error" ? (
          <p role="status" className="mb-4 rounded-xl bg-[#FEF3C7] px-4 py-3 text-sm text-[#92400E]">
            Sin conexión: por ahora no se puede comprar.
          </p>
        ) : null}

        <div className="grid gap-5 md:grid-cols-[260px_1fr]">
          <section className="rounded-2xl border border-[#E8E0FF] bg-white p-5 text-center">
            <Mascota puestos={puestos} />
            {inventario ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-2xl font-black text-[#17164F]" aria-label={`Tienes ${inventario.novaCoins} monedas`}>
                <DiamondIcon weight="fill" className="h-6 w-6 text-[#C98F00]" aria-hidden />
                {inventario.novaCoins.toLocaleString("es-PE")}
              </p>
            ) : null}
            {usuario !== undefined && !studentId ? (
              <Link
                href="/login"
                className="mt-3 inline-block rounded-xl bg-[#5636D9] px-4 py-2.5 text-sm font-bold text-white"
              >
                Entrar
              </Link>
            ) : null}
          </section>

          <ul className="grid grid-cols-2 gap-3">
            {items.map((item) => {
              const tengo = inventario?.ownedItems.includes(item.id) ?? false;
              const puesto = inventario?.equippedItems.includes(item.id) ?? false;
              const alcanza = (inventario?.novaCoins ?? 0) >= item.price;
              const bloqueado = !inventario || catalogo.status !== "ok" || ocupado !== null;
              return (
                <li key={item.id} className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center">
                  <span aria-hidden className="text-5xl">
                    {item.emoji}
                  </span>
                  <span className="font-bold text-[#17164F]">{item.name}</span>
                  {tengo ? (
                    <button
                      type="button"
                      aria-label={`${puesto ? "Quitar" : "Poner"} ${item.name}`}
                      disabled={bloqueado}
                      onClick={() => accion(item, toggleItem)}
                      className={`btn-tactil mt-auto w-full py-2.5 text-base ${
                        puesto ? "tactil-blanco text-[#17164F]" : "tactil-cooperar text-[#17164F]"
                      }`}
                    >
                      {puesto ? "Quitar" : "Poner"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Comprar ${item.name}`}
                      disabled={bloqueado || !alcanza}
                      onClick={() => accion(item, buyItem)}
                      className="btn-tactil tactil-juego mt-auto w-full gap-1.5 py-2.5 text-base text-[#17164F]"
                    >
                      <DiamondIcon weight="fill" className="h-5 w-5 text-[#C98F00]" aria-hidden />
                      {ocupado === item.id ? "..." : item.price}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </EstudianteLayout>
  );
}
