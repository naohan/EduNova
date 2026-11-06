import Link from "next/link";
import Image from "next/image";
import { SaberesDeCasa } from "@/components/familia/SaberesDeCasa";

export const metadata = {
  title: "Saberes de casa | EduNova Familia",
  description: "Enseña a tu hijo lo que la escuela no enseña: comparte tus saberes y la IA los organiza en una lección aprobada por ti.",
};

export default function SaberesPage() {
  return (
    <div className="min-h-screen bg-[#F7F4FF] text-[#17164F]">
      <header className="sticky top-0 z-40 border-b border-[#E8E0FF] bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/familia" className="flex items-center gap-2.5">
            <Image src="/assets/Logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-[family-name:var(--font-fredoka)] text-xl font-semibold">EduNova Familia</span>
          </Link>
          <Link href="/familia" className="text-xs font-bold text-[#5636D9] hover:underline">
            ← Volver al portal
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <SaberesDeCasa />
      </main>
    </div>
  );
}
