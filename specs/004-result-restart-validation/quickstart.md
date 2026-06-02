# Quickstart: Result, Restart, and Final Validation

## Goal

Implement and validate Feature Group 4:

- final results projection
- deterministic winner and tie handling
- host-only restart from results stage
- clean state reset for a new game
- final validation of end-of-game consistency

## Run

1. Start backend:
   - `cd backend && npm install && npm run dev`
2. Start frontend:
   - `cd frontend && npm install && npm run dev`

## Validation Steps

1. Create a room in Browser A and join from Browser B.
2. Play until the game reaches final results stage and verify both browsers show identical ranking, scores, and winner/tie outcome.
3. In a tied-top-score scenario, verify both browsers display the same tie result.
4. Attempt restart from Browser B as non-host and verify rejection feedback with no room-state mutation.
5. Restart from Browser A as host and verify room transitions to clean pre-game state with reset scores and cleared prior result.
6. Verify active participants remain in the room after restart.
7. Attempt restart before final results are available and verify invalid-state rejection.
8. Refresh Browser B during results and confirm finalized result remains unchanged until valid restart.
9. After restart, start a new game and confirm previous-game points do not carry over.
10. After restart and new game start, verify drawer assignment advances deterministically to the next participant.

## Build and Test Checks

1. `cd backend && npm run build`
2. `cd frontend && npm run build`
3. `cd backend && npm test`
4. `cd frontend && npm test`

## Out of Scope Guardrails

- No WebSockets
- No persistence or database
- No authentication/session features
- No matchmaking, tournament, or cross-room leaderboard logic
