import { notFound } from "next/navigation";
import { CursoAventuraView } from "@/components/estudiante/CursoAventuraView";
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
  return <CursoAventuraView curso={curso} />;
}
