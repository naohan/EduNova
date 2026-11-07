import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { TituloPantalla } from "@/components/estudiante/shared/kit";
import { PlayIcon } from "@/components/ui/icons";

const juegos = [
  {
    href: "/estudiante/aventuras/piloto",
    titulo: "Piloto Espacial",
    imagen: "/assets/cohete.png",
  },
  {
    href: "/estudiante/aventuras/ordena",
    titulo: "Ordena los Planetas",
    imagen: "/assets/landing/sistema-solar.webp",
  },
  {
    href: "/estudiante/aventuras/doctor",
    titulo: "Doctor Detective",
    imagen: "/assets/landing/corazon-3d.webp",
  },
];

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <TituloPantalla voz="Piloto Espacial: pilota tu cohete y esquiva asteroides. Ordena los Planetas: arrastra cada planeta a su órbita. Doctor Detective: toca los órganos para resolver casos.">
          Aventuras 3D
        </TituloPantalla>

        <ul className="grid gap-4 md:grid-cols-3">
          {juegos.map((j) => (
            <li key={j.href}>
              <Link href={j.href} className="card-tactil tactil-explorar-suave h-full flex-col overflow-hidden p-0">
                <span className="relative block h-40 bg-[#17164F]">
                  <Image src={j.imagen} alt="" fill sizes="(min-width: 768px) 300px, 100vw" className="object-contain p-3" />
                </span>
                <span className="flex items-center gap-3 p-3">
                  <span className="min-w-0 flex-1 font-[family-name:var(--font-fredoka)] text-xl font-bold text-[#17164F]">{j.titulo}</span>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4C9EFF] text-[#17164F]">
                    <PlayIcon weight="fill" className="h-6 w-6" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </EstudianteLayout>
  );
}
