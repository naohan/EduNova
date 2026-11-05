"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CursoId } from "@/components/estudiante/data";
import type { GameRoom } from "./gameTypes";

const PLAYER_KEY = "edunova-juego-player-v1";

export function useGameRoom() {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const codeRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PLAYER_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { playerId: string; code: string };
      setPlayerId(parsed.playerId);
      codeRef.current = parsed.code;
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (code: string, pid: string) => {
    sessionStorage.setItem(PLAYER_KEY, JSON.stringify({ code, playerId: pid }));
    codeRef.current = code;
    setPlayerId(pid);
  };

  const poll = useCallback(async () => {
    const code = codeRef.current;
    if (!code) return;
    try {
      const res = await fetch(`/api/juego/rooms/${code}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setRoom(data.room as GameRoom);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!room && !codeRef.current) return;
    const id = setInterval(poll, 1500);
    return () => clearInterval(id);
  }, [room, poll]);

  async function createRoom(input: {
    courseId: CursoId;
    topic: string;
    mission: string;
    maxPlayers: number;
    hostName: string;
    avatarId: string;
  }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/juego/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setRoom(data.room);
      persist(data.room.code, data.playerId);
      return data.room as GameRoom;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom(input: {
    code: string;
    name: string;
    avatarId: string;
  }) {
    setBusy(true);
    setError(null);
    try {
      const code = input.code.toUpperCase().trim();
      const res = await fetch(`/api/juego/rooms/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          name: input.name,
          avatarId: input.avatarId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setRoom(data.room);
      persist(code, data.playerId);
      return data.room as GameRoom;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al unirse");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function action(
    payload: Record<string, unknown>,
    opts?: { silentBusy?: boolean },
  ) {
    const code = codeRef.current;
    if (!code || !playerId) return null;
    if (!opts?.silentBusy) setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/juego/rooms/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, playerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setRoom(data.room);
      return data.room as GameRoom;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      return null;
    } finally {
      if (!opts?.silentBusy) setBusy(false);
    }
  }

  function leave() {
    sessionStorage.removeItem(PLAYER_KEY);
    codeRef.current = null;
    setRoom(null);
    setPlayerId(null);
  }

  const me = room?.players.find((p) => p.id === playerId) ?? null;
  const isMyTurn =
    !!room &&
    room.phase === "playing" &&
    room.players[room.turnIndex]?.id === playerId;
  /** Anfitrión controla todos los turnos (dados y casillas de compañeros) */
  const canControlTurn =
    !!room &&
    room.phase === "playing" &&
    (isMyTurn || Boolean(me?.isHost));

  return {
    room,
    playerId,
    me,
    isMyTurn,
    canControlTurn,
    error,
    busy,
    createRoom,
    joinRoom,
    action,
    leave,
    poll,
  };
}
