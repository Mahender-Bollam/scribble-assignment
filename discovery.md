# Discovery Notes

## Bugs

1. Frontend API base URL has an invalid default suffix.

- Impact: API requests fail if VITE_API_URL is not explicitly set.
- Evidence: frontend/src/services/api.ts:22 uses http://localhost:3001/bug.
- Relevant files: frontend/src/services/api.ts

## Incomplete Behaviors

1. Room lifecycle supports lobby only.

- Impact: Cannot represent game-in-progress or result states.
- Evidence: backend/src/models/game.ts:2 defines RoomStatus as lobby only.
- Relevant files: backend/src/models/game.ts

2. Backend API does not expose gameplay lifecycle endpoints.

- Impact: No server path for start game, submit guess, scoring, drawing sync, or restart.
- Evidence: backend/src/api/rooms.ts:14-63 only defines create room, join room, and fetch room.
- Relevant files: backend/src/api/rooms.ts

3. Room domain state is missing gameplay fields.

- Impact: No source of truth for drawer, secret word, guesses, or score.
- Evidence: backend/src/models/game.ts:10-24 room/snapshot include code, status, participants, words, roles only.
- Relevant files: backend/src/models/game.ts

4. Snapshot personalization is not implemented.

- Impact: Viewer-specific rules (for example drawer-only secret visibility) cannot be enforced.
- Evidence: backend/src/services/roomStore.ts:99-100 ignores viewerParticipantId with void.
- Relevant files: backend/src/services/roomStore.ts

5. Lobby synchronization is manual refresh only.

- Impact: Players do not auto-see join/leave updates unless Refresh is clicked.
- Evidence: frontend/src/pages/LobbyPage.tsx:20-27 uses manual handleRefresh; no polling loop present.
- Relevant files: frontend/src/pages/LobbyPage.tsx, frontend/src/state/roomStore.ts

## Assumptions

1. Player name is optional and fallback naming is acceptable.

- Evidence: backend/src/api/schemas.ts:3-9 allows optional playerName.
- Evidence: backend/src/services/roomStore.ts:32-34 defaults name to Player.
- Relevant files: backend/src/api/schemas.ts, backend/src/services/roomStore.ts

2. Participant identity is ephemeral and sessionless.

- Evidence: frontend/src/state/roomStore.ts:13-15 keeps participantId in volatile in-memory state only.
- Evidence: backend/src/services/roomStore.ts:36-41 creates new random participant IDs per join.
- Relevant files: frontend/src/state/roomStore.ts, backend/src/services/roomStore.ts

3. Client error contract assumes message field shape.

- Evidence: frontend/src/services/api.ts:34-39 expects errorBody.message and falls back to Request failed.
- Relevant files: frontend/src/services/api.ts

4. Room code validation is intentionally loose at schema level.

- Evidence: backend/src/api/schemas.ts:11-13 validates code only as string.
- Relevant files: backend/src/api/schemas.ts

## Anomalies

1. Roles and words are present in snapshots without participant-role mapping.

- Impact: roles array does not indicate who is drawer vs guesser.
- Evidence: backend/src/services/roomStore.ts:102-108 returns participants and static roles list independently.
- Relevant files: backend/src/services/roomStore.ts, backend/src/models/game.ts

2. Validation feedback is flattened for Zod errors.

- Impact: Clients receive generic invalid payload message without field-level detail.
- Evidence: backend/src/api/router.ts:32-34 always responds with Invalid request payload for ZodError.
- Relevant files: backend/src/api/router.ts

3. Room store has no cleanup path for abandoned rooms.

- Impact: In-memory map can grow for long-running processes.
- Evidence: backend/src/services/roomStore.ts:5 defines global rooms map; no expiry/removal path in file.
- Relevant files: backend/src/services/roomStore.ts
