import type { CursoId } from "@/components/estudiante/data";
import type { QuizQuestion } from "@/components/estudiante/shared/quizTypes";

export type TileKind =
  | "salida"
  | "pregunta"
  | "desafio"
  | "recompensa"
  | "cooperacion"
  | "evento"
  | "descanso";

export type BoardTile = {
  id: number;
  kind: TileKind;
  label: string;
  color: string;
  icon: string;
};

export type Territory = {
  id: string;
  nombre: string;
  image: string;
  unlocked: boolean;
};

export type PlayerState = {
  id: string;
  name: string;
  avatarId: string;
  xp: number;
  position: number;
  ready: boolean;
  isHost: boolean;
  helps: number;
};

export type PendingAction =
  | { type: "pregunta" | "desafio" | "cooperacion" | "evento"; question: QuizQuestion }
  | { type: "recompensa"; xp: number; message: string }
  | { type: "descanso"; message: string }
  | null;

export type RoomPhase = "lobby" | "playing" | "finished";

export type GameRoom = {
  code: string;
  courseId: CursoId;
  topic: string;
  mission: string;
  maxPlayers: number;
  teamName: string;
  phase: RoomPhase;
  players: PlayerState[];
  turnIndex: number;
  dice: number | null;
  pending: PendingAction;
  territoriesUnlocked: string[];
  /** Casillas ya visitadas / completadas por el equipo */
  completedTiles: number[];
  updatedAt: number;
};

export type CreateRoomBody = {
  courseId: CursoId;
  topic: string;
  mission: string;
  maxPlayers: number;
  hostName: string;
  avatarId: string;
};

export type JoinRoomBody = {
  code: string;
  name: string;
  avatarId: string;
};
