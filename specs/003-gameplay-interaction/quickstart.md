# Quickstart: Gameplay Interaction and Scoring

## Goal
Implement and validate Feature Group 3:
- interactive drawing canvas updates
- clear canvas propagation
- guess submission validation
- synced guess history via polling
- deterministic scoring

## Run
1. Start backend:
   - `cd backend && npm install && npm run dev`
2. Start frontend:
   - `cd frontend && npm install && npm run dev`

## Validation Steps
1. Create a room in Browser A and join from Browser B.
2. Start game as host and confirm both participants enter playing state.
3. Draw multiple strokes in Browser A and verify Browser B sees updates within one polling interval.
4. Trigger clear canvas and verify both browsers show cleared canvas while game/participants remain unchanged.
5. Submit empty or whitespace-only guesses and verify user-facing validation errors with no history update.
6. Submit valid incorrect guesses and verify both browsers show identical ordered history.
7. Submit valid correct guess and verify deterministic score changes for drawer and guesser.
8. Replay same ordered guess sequence in a new room and verify identical scoreboard outcome.
9. Refresh Browser B mid-round and verify canvas, guess history, and scores restore from server state.

## Build and Test Checks
1. `cd backend && npm run build`
2. `cd frontend && npm run build`
3. `cd backend && npm test`
4. `cd frontend && npm test`

## Out of Scope Guardrails
- No WebSockets
- No persistence or database
- No authentication/session features
- No matchmaking or tournament logic
