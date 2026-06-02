export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "playing" | "results";

export interface Stroke {
  id: string;
  participantId: string;
  x: number;
  y: number;
  color: string;
  size: number;
  createdAt: string;
}

export interface CanvasState {
  strokes: Stroke[];
  lastClearedAt: string | null;
  version: number;
}

export interface GuessEntry {
  id: string;
  participantId: string;
  participantName: string;
  text: string;
  normalizedText: string;
  isCorrect: boolean;
  createdAt: string;
  order: number;
}

export interface FinalRankingEntry {
  participantId: string;
  participantName: string;
  score: number;
  rank: number;
}

export interface FinalResult {
  rankings: FinalRankingEntry[];
  topScore: number;
  winnerParticipantIds: string[];
  isTie: boolean;
  finalizedAt: string;
}

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}

export interface Room {
  code: string;
  status: RoomStatus;
  participants: Participant[];
  drawerParticipantId: string | null;
  secretWord: string | null;
  canvas: CanvasState;
  guessHistory: GuessEntry[];
  scores: Record<string, number>;
  result: FinalResult | null;
  canRestart: boolean;
  lastRestartedAt: string | null;
  lastDrawerParticipantId: string | null;
  awardedCorrectGuessParticipantId: string | null;
  nextGuessOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  participants: Participant[];
  drawerParticipantId: string | null;
  viewerRole: ParticipantRole | null;
  canvas: CanvasState;
  guessHistory: GuessEntry[];
  scores: Record<string, number>;
  result: FinalResult | null;
  canRestart: boolean;
  secretWord?: string;
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
