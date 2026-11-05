import { notFound, redirect } from "next/navigation";
import { cursosAprender, getCurso } from "@/components/estudiante/data";

export function generateStaticParams() {
  return cursosAprender.map((c) => ({ id: c.id }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const curso = getCurso(id);
  if (!curso) notFound();
  // Ir directo al mapa / experiencia 3D (sin pantalla intermedia)
  redirect(curso.ctaHref);
}
