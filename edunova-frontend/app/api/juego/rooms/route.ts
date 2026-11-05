import { NextResponse } from "next/server";
import { createRoom } from "@/lib/juegoRoomStore";
import type { CreateRoomBody } from "@/components/estudiante/juego/gameTypes";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateRoomBody;
    if (!body.courseId || !body.hostName) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }
    const room = createRoom(body);
    const host = room.players[0];
    return NextResponse.json({ room, playerId: host.id });
  } catch {
    return NextResponse.json({ error: "No se pudo crear la sala" }, { status: 500 });
  }
}
