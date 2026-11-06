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

export type CharacterClass = "aventurera" | "explorador" | "cientifico" | "gamer";

export type CharacterProfile = {
  id: CharacterClass;
  avatarId: string;
  name: string;
  archetype: string;
  avatarSrc: string;
  color: string;
  accent: string;
  stats: {
    vida: number; // 3 o 4
    logica: number; // 1 a 5
    energia: number; // 1 a 5
    cooperacion: number; // 1 a 5
  };
  passiveName: string;
  passiveDesc: string;
  activeName: string;
  activeDesc: string;
  activeShort: string;
};

export type GameLevel = {
  level: number;
  name: string;
  subtitle: string;
  theme: "bosque" | "cristal" | "volcan" | "castillo";
  skyGradient: string;
  islandGradient: string;
  starsOpacity: number;
  requiredTerritories: number;
  rewardCoins: number;
  rewardXP: number;
  badge: string;
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
  /** Sistema de vidas (3 corazones por defecto) */
  lives: number;
  maxLives: number;
  /** Escudos de protección */
  shields: number;
  /** Rol/Clase de personaje */
  characterClass: CharacterClass;
  /** Nivel del jugador en la partida */
  level: number;
  /** Monedas NovaCoins ganadas para la Tienda */
  novaCoins: number;
  /** Racha de respuestas correctas consecutivas */
  combo: number;
  /** Si ya usó su habilidad activa en este nivel */
  usedAbility: boolean;
};

export type PendingAction =
  | { type: "pregunta" | "desafio" | "cooperacion" | "evento"; question: QuizQuestion }
  | { type: "recompensa"; xp: number; coins?: number; message: string }
  | { type: "descanso"; message: string; heal?: boolean }
  | null;

export type RoomPhase = "lobby" | "playing" | "level_complete" | "finished";

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
  /** Nivel actual del juego (1 al 4) */
  currentLevel: number;
  /** Multiplicador de combo colectivo */
  comboMultiplier: number;
  /** Total de NovaCoins recolectados por el equipo */
  totalCoins: number;
  updatedAt: number;
};

export type CreateRoomBody = {
  courseId: CursoId;
  topic: string;
  mission: string;
  maxPlayers: number;
  hostName: string;
  avatarId: string;
  characterClass?: CharacterClass;
};

export type JoinRoomBody = {
  code: string;
  name: string;
  avatarId: string;
  characterClass?: CharacterClass;
};
