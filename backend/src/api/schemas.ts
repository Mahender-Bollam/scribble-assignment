import { z } from "zod";

export const createRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Player name is required").max(32)
});

export const joinRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Player name is required").max(32)
});

export const startGameSchema = z.object({
  participantId: z.string().trim().min(1, "participantId is required").max(128)
});

export const roomCodeParamsSchema = z.object({
  code: z.string().trim().min(1, "Room code is required")
});

export const roomViewerQuerySchema = z.object({
  participantId: z.string().trim().min(1).optional()
});

export const drawStrokeSchema = z.object({
  participantId: z.string().trim().min(1, "participantId is required").max(128),
  x: z.number().finite(),
  y: z.number().finite(),
  color: z.string().trim().min(1, "color is required").max(24),
  size: z.number().finite().min(1).max(32)
});

export const clearCanvasSchema = z.object({
  participantId: z.string().trim().min(1, "participantId is required").max(128)
});

export const submitGuessSchema = z.object({
  participantId: z.string().trim().min(1, "participantId is required").max(128),
  text: z.string().trim().min(1, "Guess is required").max(64, "Guess is too long")
});

export const restartGameSchema = z.object({
  participantId: z.string().trim().min(1, "participantId is required").max(128)
});

export class HttpError extends Error {
  statusCode: number;
  code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}
