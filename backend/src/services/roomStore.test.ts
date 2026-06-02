import { describe, expect, it } from "vitest";
import { createRoom, joinRoom, restartGame, startGame, submitGuess } from "./roomStore.js";

describe("roomStore", () => {
  it("createRoom returns a room with a 4-character uppercase code", () => {
    const result = createRoom("Alice");

    expect(result.room.code).toMatch(/^[A-Z0-9]{4}$/);
    expect(result.room.participants).toHaveLength(1);
    expect(result.room.participants[0].name).toBe("Alice");
    expect(result.participantId).toBeDefined();
  });

  it("joinRoom returns null for an unknown room code", () => {
    const result = joinRoom("ZZZZ", "Bob");

    expect(result).toBeNull();
  });

  it("rotates drawer to next participant after a restart", () => {
    const host = createRoom("Alice");
    const guest = joinRoom(host.room.code, "Bob");

    expect(guest).not.toBeNull();
    if (!guest) {
      return;
    }

    const startedFirst = startGame(host.room.code, host.participantId);
    expect(startedFirst.error).toBeNull();
    expect(startedFirst.room?.drawerParticipantId).toBe(host.participantId);

    const secretWord = startedFirst.room?.secretWord ?? "";
    const guessed = submitGuess(host.room.code, guest.participantId, secretWord);
    expect(guessed.error).toBeNull();
    expect(guessed.room?.status).toBe("results");

    const restarted = restartGame(host.room.code, host.participantId);
    expect(restarted.error).toBeNull();
    expect(restarted.room?.status).toBe("lobby");

    const startedSecond = startGame(host.room.code, host.participantId);
    expect(startedSecond.error).toBeNull();
    expect(startedSecond.room?.drawerParticipantId).toBe(guest.participantId);
  });
});
