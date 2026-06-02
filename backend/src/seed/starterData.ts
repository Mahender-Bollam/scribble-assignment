import type { ParticipantRole } from "../models/game.js";

export const STARTER_WORDS = [
  "rocket",
  "pizza",
  "castle",
  "guitar",
  "sunflower"
] as const;

export const STARTER_ROLES: ParticipantRole[] = ["drawer", "guesser"];

export const WORD_HASH_MULTIPLIER = 31;
export const CORRECT_GUESS_POINTS = 10;
export const DRAWER_ROUND_POINTS = 5;
export const MAX_GUESS_LENGTH = 64;
export const DEFAULT_STROKE_COLOR = "#111827";
export const DEFAULT_STROKE_SIZE = 4;
export const RESTART_ELIGIBLE_STATUS = "results" as const;
export const DEFAULT_CAN_RESTART = false;

export function buildWordSeed(roomCode: string, createdAt: string) {
  return `${roomCode}:${createdAt}`;
}

export function selectDeterministicWord(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * WORD_HASH_MULTIPLIER + seed.charCodeAt(index)) | 0;
  }

  const wordIndex = Math.abs(hash) % STARTER_WORDS.length;
  return STARTER_WORDS[wordIndex];
}
