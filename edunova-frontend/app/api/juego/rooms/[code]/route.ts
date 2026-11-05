import { NextResponse } from "next/server";
import {
  addGuest,
  advanceLevel,
  getRoom,
  joinRoom,
  removeGuest,
  resolveAction,
  rollDice,
  setReady,
  startGame,
} from "@/lib/juegoRoomStore";

type Ctx = { params: Promise<{ code: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { code } = await ctx.params;
  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });
  return NextResponse.json({ room });
}

export async function POST(req: Request, ctx: Ctx) {
  const { code } = await ctx.params;
  const body = await req.json();
  const action = body.action as string;

  if (action === "join") {
    const result = joinRoom({
      code,
      name: body.name,
      avatarId: body.avatarId,
    });
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  }

  if (action === "ready") {
    const room = setReady(code, body.playerId, Boolean(body.ready));
    if (!room) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json({ room });
  }

  if (action === "addGuest") {
    const result = addGuest(code, body.playerId, {
      name: body.name,
      avatarId: body.avatarId,
    });
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  }

  if (action === "removeGuest") {
    const result = removeGuest(code, body.playerId, body.targetId);
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  }

  if (action === "start") {
    const result = startGame(code, body.playerId);
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  }

  if (action === "roll") {
    const result = rollDice(code, body.playerId, body.extraSteps ?? 0);
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  }

  if (action === "resolve") {
    const result = resolveAction(code, body.playerId, {
      correct: body.correct,
      xp: body.xp,
      coins: body.coins,
      lives: body.lives,
      combo: body.combo,
      usedAbility: body.usedAbility,
      skip: body.skip,
    });
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  }

  if (action === "advanceLevel") {
    const result = advanceLevel(code, body.playerId);
    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
}
