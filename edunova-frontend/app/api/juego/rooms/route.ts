import { NextResponse } from "next/server";
import { createRoom } from "@/lib/juegoRoomStore";
import type { CreateRoomBody } from "@/components/estudiante/juego/gameTypes";
import type { QuizQuestion } from "@/components/estudiante/shared/quizTypes";

function sanitizeUnitQuestions(raw: unknown): QuizQuestion[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const valid: QuizQuestion[] = [];
  for (const item of raw.slice(0, 50)) {
    if (!item || typeof item !== "object") continue;
    const q = item as Partial<QuizQuestion>;
    if (typeof q.id !== "string" || !q.id.trim()) continue;
    if (q.type !== "multiple") continue;
    if (typeof q.enunciado !== "string" || !q.enunciado.trim()) continue;
    if (!Array.isArray(q.opciones) || q.opciones.length < 2) continue;
    if (!q.opciones.every((opt) => typeof opt === "string" && opt.trim().length > 0)) continue;
    if (new Set(q.opciones).size !== q.opciones.length) continue;
    if (typeof q.respuesta !== "string" || !q.opciones.includes(q.respuesta)) continue;

    valid.push({
      id: q.id,
      type: "multiple",
      enunciado: q.enunciado,
      opciones: q.opciones,
      respuesta: q.respuesta,
      pista: typeof q.pista === "string" ? q.pista : undefined,
      explicacion: typeof q.explicacion === "string" ? q.explicacion : "¡Respuesta correcta!",
      xp: typeof q.xp === "number" ? q.xp : 20,
      subtopicId: typeof q.subtopicId === "string" ? q.subtopicId : undefined,
    });
  }
  return valid.length > 0 ? valid : undefined;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateRoomBody;
    if (!body.courseId || !body.hostName) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }
    if (body.unitQuestions) {
      body.unitQuestions = sanitizeUnitQuestions(body.unitQuestions);
    }
    const room = createRoom(body);
    const host = room.players[0];
    return NextResponse.json({ room, playerId: host.id });
  } catch {
    return NextResponse.json({ error: "No se pudo crear la sala" }, { status: 500 });
  }
}
