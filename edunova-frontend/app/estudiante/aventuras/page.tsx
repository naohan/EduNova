import Image from "next/image";
import Link from "next/link";
import { EstudianteLayout } from "@/components/estudiante/EstudianteLayout";
import { ArrowRightIcon } from "@/components/ui/icons";

const juegos = [
  {
    href: "/estudiante/aventuras/piloto",
    titulo: "Piloto Espacial",
    texto: "Pilota tu cohete, esquiva asteroides y encuentra el planeta de cada pista.",
    imagen: "/assets/cohete.png",
  },
  {
    href: "/estudiante/aventuras/ordena",
    titulo: "Ordena los Planetas",
    texto: "Arrastra cada planeta hasta su órbita y arma el Sistema Solar.",
    imagen: "/assets/landing/sistema-solar.webp",
  },
  {
    href: "/estudiante/aventuras/doctor",
    titulo: "Doctor Detective",
    texto: "Resuelve casos tocando los órganos dentro de un cuerpo en 3D.",
    imagen: "/assets/landing/corazon-3d.webp",
  },
];

export default function Page() {
  return (
    <EstudianteLayout>
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <header className="mb-5">
          <h1 className="font-[family-name:var(--font-fredoka)] text-3xl font-semibold text-[#17164F]">Aventuras 3D</h1>
          <p className="mt-1 text-[#5B5678]">Se adaptan a tu edad: cambia el nivel arriba y mira qué pasa.</p>
        </header>

        <ul className="grid gap-4 md:grid-cols-3">
          {juegos.map((j) => (
            <li key={j.href}>
              <Link
                href={j.href}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E8E0FF] bg-white hover:border-[#5636D9]"
              >
                <div className="relative h-40 bg-[#17164F]">
                  <Image src={j.imagen} alt="" fill sizes="(min-width: 768px) 300px, 100vw" className="object-contain p-3" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">{j.titulo}</h2>
                  <p className="mt-1 flex-1 text-sm text-[#5B5678]">{j.texto}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 font-bold text-[#5636D9]">
                    Jugar
                    <ArrowRightIcon weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </EstudianteLayout>
  );
}
