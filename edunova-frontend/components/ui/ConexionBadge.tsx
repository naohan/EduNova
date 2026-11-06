"use client";

import { useConexion } from "@/lib/use-conexion";

/** HU-08: solo se ve cuando hay algo que contar. Con internet y todo enviado no ocupa lugar. */
export function ConexionBadge() {
  const { online, pendientes } = useConexion();

  if (online && pendientes === 0) {
    return (
      <span role="status" className="sr-only">
        Con internet
      </span>
    );
  }

  const estado = !online
    ? { texto: "Sin internet", punto: "bg-[#F59E0B]", caja: "bg-[#FEF3C7] text-[#92400E]" }
    : { texto: `Enviando ${pendientes}`, punto: "bg-[#5636D9]", caja: "bg-[#F2EEFF] text-[#5636D9]" };

  return (
    <span
      role="status"
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${estado.caja}`}
    >
      <span aria-hidden className={`h-2 w-2 rounded-full ${estado.punto}`} />
      {estado.texto}
      {!online && pendientes > 0 ? ` (${pendientes})` : null}
    </span>
  );
}
