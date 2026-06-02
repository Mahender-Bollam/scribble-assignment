import { randomUUID } from "node:crypto";
import type {
  CanvasState,
  FinalRankingEntry,
  FinalResult,
  GuessEntry,
  Participant,
  Room,
  RoomSnapshot,
  Stroke
} from "../models/game.js";
import {
  CORRECT_GUESS_POINTS,
  DEFAULT_CAN_RESTART,
  DRAWER_ROUND_POINTS,
  MAX_GUESS_LENGTH,
  RESTART_ELIGIBLE_STATUS,
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

export type RestartMutationError = "ROOM_NOT_FOUND" | "PLAYER_NOT_IN_ROOM" | "HOST_ONLY" | "INVALID_STATE";

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

function buildFinalRankings(room: Room): FinalRankingEntry[] {
  const participantsById = new Map(room.participants.map((participant) => [participant.id, participant]));

  const sorted = room.participants
    .map((participant) => ({
      participant,
      score: room.scores[participant.id] ?? 0
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.participant.joinedAt.localeCompare(right.participant.joinedAt);
    });

  let currentRank = 1;
  let previousScore: number | null = null;

  return sorted.map((entry, index) => {
    if (previousScore !== null && entry.score < previousScore) {
      currentRank = index + 1;
    }

    previousScore = entry.score;

    const participant = participantsById.get(entry.participant.id) ?? entry.participant;
    return {
      participantId: participant.id,
      participantName: participant.name,
      score: entry.score,
      rank: currentRank
    };
  });
}

function buildFinalResult(room: Room): FinalResult {
  const rankings = buildFinalRankings(room);
  const topScore = rankings[0]?.score ?? 0;
  const winnerParticipantIds = rankings.filter((entry) => entry.score === topScore).map((entry) => entry.participantId);

  return {
    rankings,
    topScore,
    winnerParticipantIds,
    isTie: winnerParticipantIds.length > 1,
    finalizedAt: now()
  };
}

export function listWords() {
  return [...STARTER_WORDS];
}

function pickDrawerParticipantId(room: Room) {
  if (room.participants.length === 0) {
    return null;
  }

  if (!room.lastDrawerParticipantId) {
    return room.participants[0].id;
  }

  const currentIndex = room.participants.findIndex((participant) => participant.id === room.lastDrawerParticipantId);
  if (currentIndex === -1) {
    return room.participants[0].id;
  }

  const nextIndex = (currentIndex + 1) % room.participants.length;
  return room.participants[nextIndex].id;
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
    result: null,
    canRestart: DEFAULT_CAN_RESTART,
    lastRestartedAt: null,
    lastDrawerParticipantId: null,
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
  room.lastDrawerParticipantId = drawerParticipantId;
  room.secretWord = selectDeterministicWord(seed);
  room.canvas = emptyCanvasState();
  room.guessHistory = [];
  room.scores = createScores(room.participants);
  room.result = null;
  room.canRestart = DEFAULT_CAN_RESTART;
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

    room.status = RESTART_ELIGIBLE_STATUS;
    room.result = buildFinalResult(room);
    room.canRestart = true;
  }

  room.updatedAt = now();
  rooms.set(normalizeRoomCode(room.code), room);

  return { room: cloneRoom(room), error: null };
}

export function restartGame(
  code: string,
  participantId: string
): { room: Room | null; error: RestartMutationError | null } {
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

  if (room.status !== RESTART_ELIGIBLE_STATUS || !room.canRestart) {
    return { room: null, error: "INVALID_STATE" };
  }

  room.status = "lobby";
  room.drawerParticipantId = null;
  room.secretWord = null;
  room.canvas = emptyCanvasState();
  room.guessHistory = [];
  room.scores = createScores(room.participants);
  room.result = null;
  room.canRestart = DEFAULT_CAN_RESTART;
  room.lastRestartedAt = now();
  room.awardedCorrectGuessParticipantId = null;
  room.nextGuessOrder = 1;
  room.updatedAt = now();
  rooms.set(normalizedCode, room);

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
    scores: { ...room.scores },
    result: room.result
      ? {
          rankings: room.result.rankings.map((entry) => ({ ...entry })),
          topScore: room.result.topScore,
          winnerParticipantIds: [...room.result.winnerParticipantIds],
          isTie: room.result.isTie,
          finalizedAt: room.result.finalizedAt
        }
      : null,
    canRestart: room.canRestart
  };

  if (room.status === "playing" && viewerRole === "drawer" && room.secretWord) {
    snapshot.secretWord = room.secretWord;
  }

  return snapshot;
}
