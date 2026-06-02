# Data Model: Game Start and Drawer Flow

## Entity: Participant
- Fields:
  - `id: string` (UUID)
  - `name: string` (trimmed, non-empty)
  - `isHost: boolean`
  - `joinedAt: string` (ISO-8601)
- Validation rules:
  - `name` must be trimmed and at least 1 visible character.
  - Exactly one participant per room has `isHost = true`.

## Entity: Room
- Existing fields:
  - `code: string`
  - `status: "lobby" | "playing"`
  - `participants: Participant[]`
  - `createdAt: string`
  - `updatedAt: string`
- New feature fields:
  - `drawerParticipantId: string | null`
  - `secretWord: string | null`
- Validation rules:
  - `drawerParticipantId` is required when status is `playing`.
  - `secretWord` is required when status is `playing`.
  - `drawerParticipantId` must reference an existing participant when assigned.

## Entity: RoomSnapshot
- Fields:
  - `code: string`
  - `status: "lobby" | "playing"`
  - `participants: Participant[]`
  - `drawerParticipantId: string | null`
  - `viewerRole: "drawer" | "guesser" | null`
  - `secretWord?: string` (present only for drawer view)
- Validation rules:
  - Non-drawer viewers must not receive `secretWord`.
  - Drawer viewer must receive `secretWord` when room is `playing`.

## Entity: StartGameAttempt
- Fields:
  - `roomCode: string`
  - `participantId: string`
  - `result: "started" | "host_only" | "min_players" | "not_found" | "not_member" | "invalid_state"`
  - `message: string`
- Validation rules:
  - Participant must belong to room.
  - Participant must be host.
  - Room must be in `lobby` with at least two participants.
  - Failed attempts must not mutate room start fields.

## Deterministic Selection Inputs
- Drawer selection input: stable participant order at the moment of successful start.
- Secret-word selection input: stable room seed (`room.code` + `room.createdAt`) and fixed starter word list.

## State Transitions
1. `create-room`: no room -> `Room(status=lobby, drawerParticipantId=null, secretWord=null)`
2. `join-room`: `Room(status=lobby)` -> append participant
3. `start-game` success:
   - Preconditions satisfied
   - Assign deterministic `drawerParticipantId`
   - Assign deterministic `secretWord`
   - Transition `status` to `playing`
4. `start-game` failure:
   - Keep `status`, `drawerParticipantId`, `secretWord` unchanged
5. `fetch-room` projection:
   - Drawer viewer receives `secretWord`
   - Guesser viewer does not receive `secretWord`
