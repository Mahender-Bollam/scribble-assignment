import { randomUUID } from "node:crypto";
import type { CanvasState, GuessEntry, Participant, Room, RoomSnapshot, Stroke } from "../models/game.js";
import {
  CORRECT_GUESS_POINTS,
  DRAWER_ROUND_POINTS,
  MAX_GUESS_LENGTH,
  STARTER_WORDS,
  buildWordSeed,
  selectDeterministicWord
} from "../seed/starterData.js";

const rooms = new Map<string, Room>();

export type StartGameError =
  | "ROOM_NOT_FOUND"
  | "PLAYER_NOT_IN_ROOM"
  | "HOST_ONLY"
  | "NOT_ENOUGH_PLAYERS"
  | "INVALID_STATE";

export type GameplayMutationError =
  | "ROOM_NOT_FOUND"
  | "PLAYER_NOT_IN_ROOM"
  | "DRAWER_ONLY"
  | "INVALID_STATE"
  | "GUESS_REJECTED";

function now() {
  return new Date().toISOString();
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

export function normalizeRoomCode(code: string) {
  return code.trim().toUpperCase();
}

function displayName(name: string) {
  return name.trim();
}

function createParticipant(name: string, isHost: boolean): Participant {
  return {
    id: randomUUID(),
    name: displayName(name),
    isHost,
    joinedAt: now()
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

function normalizeGuessText(text: string) {
  return text.trim().toLowerCase();
}

function emptyCanvasState(): CanvasState {
  return {
    strokes: [],
    lastClearedAt: null,
    version: 0
  };
}

function createScores(participants: Participant[]) {
  return participants.reduce<Record<string, number>>((accumulator, participant) => {
    accumulator[participant.id] = 0;
    return accumulator;
  }, {});
}

function syncScores(room: Room) {
  for (const participant of room.participants) {
    if (typeof room.scores[participant.id] !== "number") {
      room.scores[participant.id] = 0;
    }
  }
}

function requesterRole(room: Room, participantId: string) {
  return room.drawerParticipantId === participantId ? "drawer" : "guesser";
}

export function listWords() {
  return [...STARTER_WORDS];
}

function pickDrawerParticipantId(room: Room) {
  return room.participants[0]?.id ?? null;
}

export function createRoom(playerName: string) {
  const participant = createParticipant(playerName, true);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    participants: [participant],
    drawerParticipantId: null,
    secretWord: null,
    canvas: emptyCanvasState(),
    guessHistory: [],
    scores: createScores([participant]),
    awardedCorrectGuessParticipantId: null,
    nextGuessOrder: 1,
    createdAt: now(),
    updatedAt: now()
  };

  rooms.set(room.code, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function joinRoom(code: string, playerName: string) {
  const normalizedCode = normalizeRoomCode(code);
  const room = rooms.get(normalizedCode);

  if (!room || room.status !== "lobby") {
    return null;
  }

  const participant = createParticipant(playerName, false);
  room.participants.push(participant);
  room.scores[participant.id] = 0;
  room.updatedAt = now();
  rooms.set(normalizedCode, room);

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function getRoom(code: string) {
  const normalizedCode = normalizeRoomCode(code);
  const room = rooms.get(normalizedCode);
  return room ? cloneRoom(room) : null;
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(normalizeRoomCode(room.code), cloneRoom(room));
  return getRoom(room.code);
}

export function startGame(code: string, participantId: string): { room: Room | null; error: StartGameError | null } {
  const normalizedCode = normalizeRoomCode(code);
  const room = rooms.get(normalizedCode);

  if (!room) {
    return { room: null, error: "ROOM_NOT_FOUND" };
  }

  const requester = room.participants.find((participant) => participant.id === participantId);

  if (!requester) {
    return { room: null, error: "PLAYER_NOT_IN_ROOM" };
  }

  if (!requester.isHost) {
    return { room: null, error: "HOST_ONLY" };
  }

  if (room.status !== "lobby") {
    return { room: null, error: "INVALID_STATE" };
  }

  if (room.participants.length < 2) {
    return { room: null, error: "NOT_ENOUGH_PLAYERS" };
  }

  const drawerParticipantId = pickDrawerParticipantId(room);

  if (!drawerParticipantId) {
    return { room: null, error: "INVALID_STATE" };
  }

  const seed = buildWordSeed(room.code, room.createdAt);
  room.status = "playing";
  room.drawerParticipantId = drawerParticipantId;
  room.secretWord = selectDeterministicWord(seed);
  room.canvas = emptyCanvasState();
  room.guessHistory = [];
  room.scores = createScores(room.participants);
  room.awardedCorrectGuessParticipantId = null;
  room.nextGuessOrder = 1;
  room.updatedAt = now();
  rooms.set(normalizedCode, room);

  return { room: cloneRoom(room), error: null };
}

function resolveGameplayContext(code: string, participantId: string): { room: Room | null; error: GameplayMutationError | null } {
  const normalizedCode = normalizeRoomCode(code);
  const room = rooms.get(normalizedCode);

  if (!room) {
    return { room: null, error: "ROOM_NOT_FOUND" };
  }

  const participant = room.participants.find((item) => item.id === participantId);
  if (!participant) {
    return { room: null, error: "PLAYER_NOT_IN_ROOM" };
  }

  if (room.status !== "playing") {
    return { room: null, error: "INVALID_STATE" };
  }

  return { room, error: null };
}

export function addStroke(
  code: string,
  participantId: string,
  input: { x: number; y: number; color: string; size: number }
): { room: Room | null; error: GameplayMutationError | null } {
  const context = resolveGameplayContext(code, participantId);
  if (context.error || !context.room) {
    return context;
  }

  const room = context.room;
  if (requesterRole(room, participantId) !== "drawer") {
    return { room: null, error: "DRAWER_ONLY" };
  }

  const stroke: Stroke = {
    id: randomUUID(),
    participantId,
    x: input.x,
    y: input.y,
    color: input.color,
    size: input.size,
    createdAt: now()
  };

  room.canvas.strokes.push(stroke);
  room.canvas.version += 1;
  room.updatedAt = now();
  rooms.set(normalizeRoomCode(room.code), room);

  return { room: cloneRoom(room), error: null };
}

export function clearCanvas(code: string, participantId: string): { room: Room | null; error: GameplayMutationError | null } {
  const context = resolveGameplayContext(code, participantId);
  if (context.error || !context.room) {
    return context;
  }

  const room = context.room;
  if (requesterRole(room, participantId) !== "drawer") {
    return { room: null, error: "DRAWER_ONLY" };
  }

  room.canvas.strokes = [];
  room.canvas.lastClearedAt = now();
  room.canvas.version += 1;
  room.updatedAt = now();
  rooms.set(normalizeRoomCode(room.code), room);

  return { room: cloneRoom(room), error: null };
}

export function submitGuess(
  code: string,
  participantId: string,
  text: string
): { room: Room | null; error: GameplayMutationError | null } {
  const context = resolveGameplayContext(code, participantId);
  if (context.error || !context.room) {
    return context;
  }

  const room = context.room;
  const participant = room.participants.find((item) => item.id === participantId);
  if (!participant) {
    return { room: null, error: "PLAYER_NOT_IN_ROOM" };
  }

  if (requesterRole(room, participantId) === "drawer") {
    return { room: null, error: "GUESS_REJECTED" };
  }

  const trimmedText = text.trim();
  if (!trimmedText || trimmedText.length > MAX_GUESS_LENGTH) {
    return { room: null, error: "GUESS_REJECTED" };
  }

  syncScores(room);

  const normalizedText = normalizeGuessText(trimmedText);
  const normalizedSecret = room.secretWord ? normalizeGuessText(room.secretWord) : "";
  const isCorrect = normalizedSecret.length > 0 && normalizedText === normalizedSecret;

  const guessEntry: GuessEntry = {
    id: randomUUID(),
    participantId,
    participantName: participant.name,
    text: trimmedText,
    normalizedText,
    isCorrect,
    createdAt: now(),
    order: room.nextGuessOrder
  };

  room.nextGuessOrder += 1;
  room.guessHistory.push(guessEntry);

  if (isCorrect && !room.awardedCorrectGuessParticipantId) {
    room.awardedCorrectGuessParticipantId = participantId;
    room.scores[participantId] = (room.scores[participantId] ?? 0) + CORRECT_GUESS_POINTS;
    if (room.drawerParticipantId) {
      room.scores[room.drawerParticipantId] = (room.scores[room.drawerParticipantId] ?? 0) + DRAWER_ROUND_POINTS;
    }
  }

  room.updatedAt = now();
  rooms.set(normalizeRoomCode(room.code), room);

  return { room: cloneRoom(room), error: null };
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  const viewerRole =
    viewerParticipantId && room.drawerParticipantId && viewerParticipantId === room.drawerParticipantId
      ? "drawer"
      : viewerParticipantId
        ? "guesser"
        : null;

  const snapshot: RoomSnapshot = {
    code: room.code,
    status: room.status,
    participants: room.participants.map((participant) => ({ ...participant })),
    drawerParticipantId: room.drawerParticipantId,
    viewerRole,
    canvas: {
      strokes: room.canvas.strokes.map((stroke) => ({ ...stroke })),
      lastClearedAt: room.canvas.lastClearedAt,
      version: room.canvas.version
    },
    guessHistory: room.guessHistory.map((guess) => ({ ...guess })),
    scores: { ...room.scores }
  };

  if (room.status === "playing" && viewerRole === "drawer" && room.secretWord) {
    snapshot.secretWord = room.secretWord;
  }

  return snapshot;
}
