# Data Model: Room Setup and Lobby

## Entity: Participant
- Fields:
  - `id: string` (UUID)
  - `name: string` (trimmed, non-empty)
  - `isHost: boolean`
  - `joinedAt: string` (ISO-8601)
- Validation rules:
  - Name MUST be trimmed and length >= 1.
  - Exactly one participant per room has `isHost = true`.

## Entity: Room
- Fields:
  - `code: string` (normalized uppercase, fixed length as generated)
  - `status: "lobby" | "playing"` (for this feature group)
  - `participants: Participant[]`
  - `createdAt: string` (ISO-8601)
  - `updatedAt: string` (ISO-8601)
- Validation rules:
  - Room code MUST uniquely identify a room.
  - Participant list mutations MUST be scoped to this room code only.
  - Start transition allowed only from `lobby`.

## Entity: LobbySnapshot
- Fields:
  - `code: string`
  - `status: "lobby" | "playing"`
  - `participants: Participant[]`
- Validation rules:
  - Snapshot returns only participants from requested room code.
  - Snapshot remains safe for periodic polling.

## Entity: StartAttempt
- Fields:
  - `roomCode: string`
  - `participantId: string`
  - `result: "started" | "host_only" | "min_players" | "not_found" | "not_member" | "invalid_state"`
  - `message: string`
- Validation rules:
  - `participantId` must belong to room.
  - Requester must have `isHost = true`.
  - `participants.length >= 2` required for success.

## State Transitions
1. `create-room`: no room -> `Room(status=lobby, participants=[host])`
2. `join-room`: `Room(status=lobby)` -> append participant
3. `start-game`: `Room(status=lobby, participants>=2, requester=host)` -> `Room(status=playing)`
4. Invalid start attempts do not mutate room state.
