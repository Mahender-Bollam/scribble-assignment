# Quickstart: Room Setup and Lobby

## Goal
Implement and validate Feature Group 1:
- host tracking on room creation
- join validation with clear errors
- room isolation
- automatic lobby polling (~2 seconds)
- host-only start with 2-player minimum

## Run
1. Start backend:
   - `cd backend && npm install && npm run dev`
2. Start frontend:
   - `cd frontend && npm install && npm run dev`

## Validation Steps
1. Create room in Browser A with valid name.
2. Confirm creator appears as host in lobby participant list (Host label).
3. Attempt create/join with empty or whitespace name; verify clear error message.
4. Join same room from Browser B with valid room code; verify lobby auto-updates in about 2 seconds in both browsers without clicking Refresh.
5. Create second room in Browser C; verify participants from room C never appear in room A/B.
6. Attempt start as non-host; verify button is not enabled for starting and host-only error is shown if request is attempted.
7. Attempt start as host with only one player; verify minimum-player error.
8. Start as host with two players; verify room status transitions from lobby and appears to both participants via polling.

## Build Checks
1. `cd backend && npm run build`
2. `cd frontend && npm run build`

## Out of Scope Guardrails
- No WebSockets
- No database
- No authentication/session features
