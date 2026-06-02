import { randomUUID } from "node:crypto";
import type { Participant, Room, RoomSnapshot } from "../models/game.js";
import { STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";

const rooms = new Map<string, Room>();

export type StartGameError =
  | "ROOM_NOT_FOUND"
  | "PLAYER_NOT_IN_ROOM"
  | "HOST_ONLY"
  | "NOT_ENOUGH_PLAYERS"
  | "INVALID_STATE";

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

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName: string) {
  const participant = createParticipant(playerName, true);
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    participants: [participant],
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

  room.status = "playing";
  room.updatedAt = now();
  rooms.set(normalizedCode, room);

  return { room: cloneRoom(room), error: null };
}

export function toRoomSnapshot(room: Room, viewerParticipantId?: string): RoomSnapshot {
  void viewerParticipantId;

  return {
    code: room.code,
    status: room.status,
    participants: room.participants.map((participant) => ({ ...participant })),
    availableWords: listWords(),
    roles: [...STARTER_ROLES]
  };
}
