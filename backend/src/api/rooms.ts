import { Router } from "express";
import {
  createRoomSchema,
  HttpError,
  joinRoomSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema,
  startGameSchema
} from "./schemas.js";
import { createRoom, getRoom, joinRoom, normalizeRoomCode, startGame, toRoomSnapshot } from "../services/roomStore.js";

export function createRoomsRouter() {
  const router = Router();

  router.post("/", (request, response, next) => {
    try {
      const { playerName } = createRoomSchema.parse(request.body);
      const result = createRoom(playerName);

      response.status(201).json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/join", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { playerName } = joinRoomSchema.parse(request.body);
      const normalizedCode = normalizeRoomCode(code);
      const result = joinRoom(normalizedCode, playerName);

      if (!result) {
        throw new HttpError(404, "Room code is invalid or room does not exist", "ROOM_NOT_FOUND");
      }

      response.json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:code", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const room = getRoom(normalizeRoomCode(code));

      if (!room) {
        throw new HttpError(404, "Unable to load room", "ROOM_NOT_FOUND");
      }

      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/start", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = startGameSchema.parse(request.body);
      const result = startGame(normalizeRoomCode(code), participantId);

      if (result.error) {
        if (result.error === "ROOM_NOT_FOUND" || result.error === "PLAYER_NOT_IN_ROOM") {
          throw new HttpError(404, "Room or participant not found", result.error);
        }

        if (result.error === "HOST_ONLY") {
          throw new HttpError(403, "Only the host can start the game", result.error);
        }

        if (result.error === "NOT_ENOUGH_PLAYERS") {
          throw new HttpError(409, "At least 2 players are required to start", result.error);
        }

        throw new HttpError(409, "Room is not in a startable state", "INVALID_STATE");
      }

      if (!result.room) {
        throw new HttpError(500, "Unable to start game", "START_FAILED");
      }

      response.json({
        room: toRoomSnapshot(result.room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
