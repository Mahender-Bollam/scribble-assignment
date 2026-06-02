# Research: Room Setup and Lobby

## Decision 1: Host Tracking Model
- Decision: Persist host identity as a boolean flag on participant (`isHost`) and enforce exactly one host per room at create time.
- Rationale: Minimal change to current in-memory room model and straightforward for UI/start authorization checks.
- Alternatives considered:
  - Separate `hostParticipantId` room field only: rejected for this slice because participant-scoped host visibility is useful for lobby rendering and easier client consumption.
  - Role array indexing: rejected because it can drift from participant order and is less explicit.

## Decision 2: Join Validation and Error Semantics
- Decision: Validate `playerName` and `roomCode` with Zod using trim + non-empty constraints and return explicit error messages for invalid payload vs room-not-found conditions.
- Rationale: Distinguishes user-correctable input problems from domain state failures and supports clear UX messaging.
- Alternatives considered:
  - Frontend-only validation: rejected because backend must enforce contract integrity.
  - Generic 400/404 without message semantics: rejected because acceptance criteria require clear error messages.

## Decision 3: Polling Strategy
- Decision: Implement client-side interval polling at ~2s cadence while lobby route is mounted, reusing existing fetch-room endpoint.
- Rationale: Meets non-WebSocket constraint and avoids introducing additional transport complexity.
- Alternatives considered:
  - Server-sent events / WebSocket: rejected by project constraints.
  - Manual refresh only: rejected because this feature explicitly requires auto polling.

## Decision 4: Start Authorization and Preconditions
- Decision: Add dedicated start endpoint that checks (1) requester belongs to room, (2) requester is host, (3) room has at least 2 players, then transitions status.
- Rationale: Centralizes authorization and precondition enforcement in backend, preventing client-side bypass.
- Alternatives considered:
  - Trigger start entirely client-side: rejected due to trust and consistency risks.
  - Implicit start during polling when count >= 2: rejected because explicit host action is required.

## Decision 5: Room Isolation Verification
- Decision: Verify isolation by ensuring all room mutations and reads are keyed by normalized room code and by validating with two-room manual scenario.
- Rationale: Existing architecture is map-based per code; formalizing isolation avoids accidental cross-room leakage.
- Alternatives considered:
  - Additional namespace/session partitioning: rejected as unnecessary for this in-memory scope.

## Decision 6: Error Shape
- Decision: Use a stable error response shape with `message` and optional machine-readable `code` for domain failures.
- Rationale: Frontend already consumes `message`; adding `code` improves deterministic UI behavior without breaking compatibility.
- Alternatives considered:
  - Message-only responses: acceptable but less reliable for condition-specific UI treatment.

## Validation Notes
- Backend build validation: PASS (`npm run build`)
- Frontend build validation: PASS (`npm run build`)
- Manual multi-tab walkthrough: PASS
  - Created room as `HostAlpha`; host label shown in lobby participant list.
  - Joined same room as `GuestBeta` from second tab; participant list synced in both tabs.
  - Non-host start request returned `403` with `HOST_ONLY` code.
  - Host start request returned `200` and transitioned room status to `playing`.
  - Repeated start attempt returned `409` (`Room is not in a startable state`) confirming state-gating behavior.
