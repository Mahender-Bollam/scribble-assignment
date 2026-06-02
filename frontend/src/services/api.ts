export type ParticipantRole = "drawer" | "guesser";

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

export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: "lobby" | "playing" | "results";
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

interface ErrorResponse {
  message?: string;
  code?: string;
}

export class ApiError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({ message: "Request failed" }))) as ErrorResponse;

    throw new ApiError(errorBody.message ?? "Request failed", errorBody.code);
  }

  return (await response.json()) as T;
}

export const api = {
  createRoom(playerName: string) {
    return request<RoomSessionResponse>("/rooms", {
      method: "POST",
      body: JSON.stringify({ playerName })
    });
  },
  joinRoom(code: string, playerName: string) {
    return request<RoomSessionResponse>(`/rooms/${encodeURIComponent(code)}/join`, {
      method: "POST",
      body: JSON.stringify({ playerName })
    });
  },
  fetchRoom(code: string, participantId?: string) {
    const query = participantId ? `?participantId=${encodeURIComponent(participantId)}` : "";
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}${query}`);
  },
  startGame(code: string, participantId: string) {
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}/start`, {
      method: "POST",
      body: JSON.stringify({ participantId })
    });
  },
  submitStroke(code: string, payload: { participantId: string; x: number; y: number; color: string; size: number }) {
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}/canvas/strokes`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  clearCanvas(code: string, participantId: string) {
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}/canvas/clear`, {
      method: "POST",
      body: JSON.stringify({ participantId })
    });
  },
  submitGuess(code: string, participantId: string, text: string) {
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}/guesses`, {
      method: "POST",
      body: JSON.stringify({ participantId, text })
    });
  },
  restartGame(code: string, participantId: string) {
    return request<{ room: RoomSnapshot }>(`/rooms/${encodeURIComponent(code)}/restart`, {
      method: "POST",
      body: JSON.stringify({ participantId })
    });
  }
};
