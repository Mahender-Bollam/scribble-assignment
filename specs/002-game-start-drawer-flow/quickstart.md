# Quickstart: Game Start and Drawer Flow

## Goal
Implement and validate Feature Group 2:
- trim/validate player names
- deterministic drawer assignment on start
- deterministic secret word selection
- drawer-only secret word visibility in snapshots

## Run
1. Start backend:
   - `cd backend && npm install && npm run dev`
2. Start frontend:
   - `cd frontend && npm install && npm run dev`

## Validation Steps
1. In Browser A, create a room with a valid name.
2. In Browser B, join the same room with a valid name.
3. Attempt create/join with whitespace-only name and verify user-facing validation error.
4. Start game as host from Browser A.
5. Confirm exactly one drawer is assigned and remains stable across repeated room fetches.
6. Confirm secret word is visible to drawer view only.
7. Confirm secret word is absent from non-drawer view, including repeated polling/fetch attempts.
8. Repeat start request after game is already playing and verify no mutation and invalid-state response.

## API-Level Spot Checks (Optional)
1. Host starts game:
   - `POST /rooms/{code}/start` with host participantId returns `200` and room status `playing`.
2. Non-host starts game:
   - returns `403` with `HOST_ONLY` code.
3. Guesser room fetch:
   - `GET /rooms/{code}?participantId={guesserId}` response omits `secretWord`.
4. Drawer room fetch:
   - `GET /rooms/{code}?participantId={drawerId}` response includes `secretWord`.

## Build Checks
1. `cd backend && npm run build`
2. `cd frontend && npm run build`

## Out of Scope Guardrails
- No WebSockets
- No database
- No authentication/session features
- No scoring or multi-round logic in this feature group
