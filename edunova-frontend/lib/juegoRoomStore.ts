import { BOARD_TILES, GAME_LEVELS, TERRITORIES, getCharacterProfileByAvatar, pickQuestion } from "@/components/estudiante/juego/boardData";
import type {
  CharacterClass,
  CreateRoomBody,
  GameRoom,
  JoinRoomBody,
  PlayerState,
} from "@/components/estudiante/juego/gameTypes";
import { codeGenerator } from "@/components/estudiante/juego/boardData";

type GlobalRooms = { __edunovaRooms?: Map<string, GameRoom> };

function store() {
  const g = globalThis as unknown as GlobalRooms;
  if (!g.__edunovaRooms) g.__edunovaRooms = new Map();
  return g.__edunovaRooms;
}

function touch(room: GameRoom) {
  room.updatedAt = Date.now();
  return room;
}

export function createRoom(body: CreateRoomBody): GameRoom {
  const rooms = store();
  let code = codeGenerator();
  while (rooms.has(code)) code = codeGenerator();

  const profile = getCharacterProfileByAvatar(body.avatarId);
  const characterClass = (body.characterClass ?? profile.id) as CharacterClass;
  const initialMaxLives = profile.stats.vida ?? 3;

  const host: PlayerState = {
    id: crypto.randomUUID(),
    name: body.hostName.trim() || "Anfitrión",
    avatarId: body.avatarId,
    xp: 50,
    position: 0,
    ready: true,
    isHost: true,
    helps: 0,
    lives: initialMaxLives,
    maxLives: initialMaxLives,
    shields: 0,
    characterClass,
    level: 1,
    novaCoins: 80,
    combo: 0,
    usedAbility: false,
  };

  const room: GameRoom = {
    code,
    courseId: body.courseId,
    topic: body.topic,
    mission: body.mission,
    maxPlayers: Math.min(6, Math.max(2, body.maxPlayers)),
    teamName: "Equipo Galaxia",
    phase: "lobby",
    players: [host],
    turnIndex: 0,
    dice: null,
    pending: null,
    territoriesUnlocked: [],
    completedTiles: [0],
    currentLevel: 1,
    comboMultiplier: 1,
    totalCoins: 80,
    updatedAt: Date.now(),
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): GameRoom | null {
  return store().get(code.toUpperCase()) ?? null;
}

export function joinRoom(body: JoinRoomBody): { room: GameRoom; playerId: string } | { error: string } {
  const room = getRoom(body.code);
  if (!room) return { error: "Sala no encontrada" };
  if (room.phase !== "lobby") return { error: "La partida ya comenzó" };
  if (room.players.length >= room.maxPlayers) return { error: "Sala llena" };

  const profile = getCharacterProfileByAvatar(body.avatarId);
  const characterClass = (body.characterClass ?? profile.id) as CharacterClass;
  const initialMaxLives = profile.stats.vida ?? 3;

  const player: PlayerState = {
    id: crypto.randomUUID(),
    name: body.name.trim() || "Jugador",
    avatarId: body.avatarId,
    xp: 50,
    position: 0,
    ready: false,
    isHost: false,
    helps: 0,
    lives: initialMaxLives,
    maxLives: initialMaxLives,
    shields: 0,
    characterClass,
    level: 1,
    novaCoins: 80,
    combo: 0,
    usedAbility: false,
  };
  room.players.push(player);
  room.totalCoins = (room.totalCoins ?? 0) + 80;
  touch(room);
  return { room, playerId: player.id };
}

export function setReady(code: string, playerId: string, ready: boolean) {
  const room = getRoom(code);
  if (!room) return null;
  const p = room.players.find((x) => x.id === playerId);
  if (!p) return null;
  p.ready = ready;
  return touch(room);
}

const GUEST_NAMES = [
  "Beatriz",
  "Nadia",
  "Carlos",
  "Lucía",
  "Mateo",
  "Sofía",
  "Diego",
  "Valentina",
];

const GUEST_AVATARS = ["reina", "nino", "estudiante", "auriculares"];

/** El anfitrión agrega un compañero a un hueco vacío (mismo dispositivo / demo) */
export function addGuest(
  code: string,
  hostId: string,
  opts?: { name?: string; avatarId?: string },
): { room: GameRoom } | { error: string } {
  const room = getRoom(code);
  if (!room) return { error: "Sala no encontrada" };
  if (room.phase !== "lobby") return { error: "La partida ya comenzó" };
  const host = room.players.find((p) => p.id === hostId);
  if (!host?.isHost) return { error: "Solo el anfitrión puede agregar compañeros" };
  if (room.players.length >= room.maxPlayers) return { error: "Sala llena" };

  const usedNames = new Set(room.players.map((p) => p.name.toLowerCase()));
  const name =
    opts?.name?.trim() ||
    GUEST_NAMES.find((n) => !usedNames.has(n.toLowerCase())) ||
    `Jugador ${room.players.length + 1}`;

  const avatarId =
    opts?.avatarId ||
    GUEST_AVATARS[room.players.length % GUEST_AVATARS.length];

  const profile = getCharacterProfileByAvatar(avatarId);
  const characterClass = profile.id as CharacterClass;

  room.players.push({
    id: crypto.randomUUID(),
    name,
    avatarId,
    xp: 50,
    position: 0,
    ready: true,
    isHost: false,
    helps: 0,
    lives: profile.stats.vida ?? 3,
    maxLives: profile.stats.vida ?? 3,
    shields: 0,
    characterClass,
    level: 1,
    novaCoins: 80,
    combo: 0,
    usedAbility: false,
  });
  room.totalCoins = (room.totalCoins ?? 0) + 80;
  return { room: touch(room) };
}

/** Quitar un compañero invitado (no el anfitrión) */
export function removeGuest(
  code: string,
  hostId: string,
  targetId: string,
): { room: GameRoom } | { error: string } {
  const room = getRoom(code);
  if (!room) return { error: "Sala no encontrada" };
  if (room.phase !== "lobby") return { error: "La partida ya comenzó" };
  const host = room.players.find((p) => p.id === hostId);
  if (!host?.isHost) return { error: "Solo el anfitrión puede quitar jugadores" };
  const target = room.players.find((p) => p.id === targetId);
  if (!target) return { error: "Jugador no encontrado" };
  if (target.isHost) return { error: "No puedes quitar al anfitrión" };
  room.players = room.players.filter((p) => p.id !== targetId);
  return { room: touch(room) };
}

export function startGame(code: string, playerId: string) {
  const room = getRoom(code);
  if (!room) return { error: "Sala no encontrada" };
  const host = room.players.find((p) => p.id === playerId);
  if (!host?.isHost) return { error: "Solo el anfitrión puede iniciar" };
  if (room.players.length < 2) return { error: "Se necesitan al menos 2 jugadores" };
  if (!room.players.every((p) => p.ready)) return { error: "Todos deben estar listos" };
  room.phase = "playing";
  room.turnIndex = 0;
  room.dice = null;
  room.pending = null;
  room.currentLevel = 1;
  return { room: touch(room) };
}

function canActAs(room: GameRoom, actorId: string, turnPlayerId: string) {
  if (actorId === turnPlayerId) return true;
  const actor = room.players.find((p) => p.id === actorId);
  return Boolean(actor?.isHost);
}

export function rollDice(code: string, playerId: string, extraSteps = 0) {
  const room = getRoom(code);
  if (!room || (room.phase !== "playing" && room.phase !== "level_complete")) return { error: "Partida no activa" };
  if (room.pending) return { error: "Hay una actividad pendiente" };
  const current = room.players[room.turnIndex];
  if (!current || !canActAs(room, playerId, current.id)) {
    return { error: "No puedes lanzar en este turno" };
  }

  const baseDice = Math.floor(Math.random() * 6) + 1;
  const turbo = extraSteps > 0 && !current.usedAbility ? extraSteps : 0;
  if (turbo) current.usedAbility = true;
  const dice = baseDice + turbo;
  room.dice = dice;
  const from = current.position;
  const nextPos = (from + dice) % BOARD_TILES.length;
  current.position = nextPos;
  const tile = BOARD_TILES[nextPos];
  if (!room.completedTiles) room.completedTiles = [0];
  if (!room.completedTiles.includes(nextPos)) {
    room.completedTiles.push(nextPos);
  }

  if (tile.kind === "salida") {
    current.xp += 50;
    current.novaCoins = (current.novaCoins ?? 0) + 50;
    room.totalCoins = (room.totalCoins ?? 0) + 50;
    room.pending = { type: "recompensa", xp: 50, coins: 50, message: "¡Pasaste por la salida! +50 XP y +50 NovaCoins" };
  } else if (tile.kind === "recompensa") {
    const xp = 30;
    const coins = 60;
    current.xp += xp;
    current.novaCoins = (current.novaCoins ?? 0) + coins;
    room.totalCoins = (room.totalCoins ?? 0) + coins;
    room.pending = { type: "recompensa", xp, coins, message: "¡Cofre del tesoro! Ganas +30 XP y +60 NovaCoins." };
  } else if (tile.kind === "descanso") {
    // Regenera vida no punitivamente
    if (current.lives < (current.maxLives ?? 3)) {
      current.lives += 1;
    }
    current.xp += 20;
    current.helps += 1;
    room.pending = {
      type: "descanso",
      message: "Descanso y cooperación: ¡Recuperas +1 Vida (❤️) y ganas +20 XP de Superación!",
      heal: true,
    };
  } else if (tile.kind === "cooperacion") {
    const q = pickQuestion(room.courseId);
    room.pending = { type: "cooperacion", question: q };
  } else if (tile.kind === "evento" || tile.kind === "desafio" || tile.kind === "pregunta") {
    const q = pickQuestion(room.courseId);
    room.pending = { type: tile.kind === "desafio" ? "desafio" : tile.kind === "evento" ? "evento" : "pregunta", question: q };
  }

  return { room: touch(room) };
}

export function resolveAction(
  code: string,
  playerId: string,
  payload: {
    correct?: boolean;
    xp?: number;
    coins?: number;
    lives?: number;
    combo?: number;
    usedAbility?: boolean;
    skip?: boolean;
  },
) {
  const room = getRoom(code);
  if (!room || (room.phase !== "playing" && room.phase !== "level_complete")) return { error: "Partida no activa" };
  const current = room.players[room.turnIndex];
  if (!current || !canActAs(room, playerId, current.id)) {
    return { error: "No puedes resolver esta casilla" };
  }
  if (!room.pending) return { error: "No hay actividad pendiente" };

  const pending = room.pending;

  if (pending.type === "recompensa" || pending.type === "descanso") {
    maybeUnlockTerritory(room);
    room.pending = null;
    room.dice = null;
    room.turnIndex = (room.turnIndex + 1) % room.players.length;
    checkWin(room);
    return { room: touch(room) };
  }

  if (payload.skip) {
    room.pending = null;
    room.dice = null;
    room.turnIndex = (room.turnIndex + 1) % room.players.length;
    return { room: touch(room) };
  }

  // Actualizar vidas y combo de manera no punitiva
  if (typeof payload.lives === "number") {
    current.lives = Math.max(1, payload.lives); // Siempre al menos 1 vida tras rescate
  }
  if (typeof payload.combo === "number") {
    current.combo = payload.combo;
  }
  if (payload.usedAbility) {
    current.usedAbility = true;
  }

  if (payload.correct) {
    const xp = payload.xp ?? pending.question.xp;
    const coins = payload.coins ?? 40;
    current.xp += xp;
    current.novaCoins = (current.novaCoins ?? 0) + coins;
    room.totalCoins = (room.totalCoins ?? 0) + coins;

    if (pending.type === "cooperacion") current.helps += 1;
    maybeUnlockTerritory(room);
  } else {
    // Esfuerzo premiado sin puntos negativos
    current.xp += 10;
  }

  room.pending = null;
  room.dice = null;
  room.turnIndex = (room.turnIndex + 1) % room.players.length;
  checkWin(room);
  return { room: touch(room) };
}

function maybeUnlockTerritory(room: GameRoom) {
  const next = TERRITORIES.find((t) => !room.territoriesUnlocked.includes(t.id));
  if (!next) return;

  const totalXp = room.players.reduce((s, p) => s + p.xp, 0);
  const should = room.territoriesUnlocked.length < Math.floor(totalXp / 120);

  if (should || Math.random() < 0.4) {
    if (!room.territoriesUnlocked.includes(next.id)) {
      room.territoriesUnlocked.push(next.id);

      // Chequear si sube de nivel según territorios desbloqueados
      const unlockedCount = room.territoriesUnlocked.length;
      if (unlockedCount >= 6) {
        room.currentLevel = 4;
      } else if (unlockedCount >= 4) {
        room.currentLevel = 3;
      } else if (unlockedCount >= 2) {
        room.currentLevel = 2;
      }
    }
  }
}

function checkWin(room: GameRoom) {
  if (room.territoriesUnlocked.length >= TERRITORIES.length) {
    room.phase = "finished";
  }
}

export function advanceLevel(code: string, playerId: string) {
  const room = getRoom(code);
  if (!room) return { error: "Sala no encontrada" };
  const host = room.players.find((p) => p.id === playerId);
  if (!host?.isHost) return { error: "Solo el anfitrión puede avanzar de nivel" };

  if (room.currentLevel < 4) {
    room.currentLevel += 1;
    // Restaurar vidas y habilidades para el nuevo nivel
    room.players.forEach((p) => {
      p.lives = p.maxLives ?? 3;
      p.usedAbility = false;
    });
  }
  room.phase = "playing";
  return { room: touch(room) };
}
