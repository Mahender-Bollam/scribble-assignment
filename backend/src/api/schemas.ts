import { z } from "zod";

export const createRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Player name is required").max(32)
});

export const joinRoomSchema = z.object({
  playerName: z.string().trim().min(1, "Player name is required").max(32)
});

export const startGameSchema = z.object({
  participantId: z.string().trim().min(1, "participantId is required")
});

export const roomCodeParamsSchema = z.object({
  code: z.string().trim().min(1, "Room code is required")
});

export const roomViewerQuerySchema = z.object({
  participantId: z.string().optional()
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
