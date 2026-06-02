# Implementation Plan: Room Setup and Lobby

**Branch**: `scribble-lab` | **Date**: 2026-06-03 | **Spec**: `specs/001-room-setup-lobby/spec.md`

**Input**: Feature specification from `/specs/001-room-setup-lobby/spec.md`

## Summary

Implement Feature Group 1 by adding host tracking on room creation, robust join validation,
room isolation guarantees, automatic lobby polling (~2s), and host-only start with a 2-player
minimum. The approach is an incremental extension of existing REST + in-memory patterns using
strict backend validation and frontend polling lifecycle control.

## Technical Context

**Language/Version**: TypeScript (backend + frontend), Node.js 18+, ES Modules

**Primary Dependencies**: Express, Zod, React 18, React Router 6, Vite

**Storage**: In-memory room store (`Map`) only

**Testing**: Vitest (backend and frontend), plus manual multi-tab validation for polling behavior

**Target Platform**: Local web app (browser client + Node.js backend)

**Project Type**: Web application (frontend + backend monorepo)

**Performance Goals**:
- Lobby updates reflected within ~2 seconds under normal local development conditions
- No cross-room contamination in state snapshots

**Constraints**:
- No WebSockets
- No databases/persistence
- No authentication/session additions
- Keep implementation deterministic and scoped to room setup/lobby behaviors

**Scale/Scope**:
- Two to several concurrent players across multiple rooms in local/assignment scenarios
- Single feature group covering setup, lobby sync, and start preconditions

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Research Gate Review

- Scope control: PASS. Plan uses polling over existing HTTP routes and in-memory state only.
- Stack compliance: PASS. Uses current TypeScript/ESM, Express, Zod, React stack.
- Validation and errors: PASS. Includes strict join/create/start input validation and explicit error semantics.
- Review discipline: PASS. Design includes behavioral verification for host rules, polling, and isolation.
- Determinism: PASS. Start preconditions and room state transitions are explicitly defined.
- Verification: PASS. Includes build checks and two/multi-tab validation steps.

### Post-Design Gate Re-Check

- Scope control: PASS. Contract and quickstart keep WebSockets/database/auth out of scope.
- Stack compliance: PASS. No new architecture or forbidden dependencies introduced in design.
- Validation and errors: PASS. Contracts define error response shape and relevant statuses.
- Review discipline: PASS. Artifacts provide traceable requirements and explicit validation workflow.
- Determinism: PASS. Data model includes explicit transition constraints for start behavior.
- Verification: PASS. Quickstart contains reproducible acceptance validation steps.

## Project Structure

### Documentation (this feature)

```text
specs/001-room-setup-lobby/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── lobby-room-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── rooms.ts
│   │   └── schemas.ts
│   ├── models/
│   │   └── game.ts
│   └── services/
│       └── roomStore.ts

frontend/
├── src/
│   ├── pages/
│   │   └── LobbyPage.tsx
│   ├── services/
│   │   └── api.ts
│   └── state/
│       └── roomStore.ts
```

**Structure Decision**: Use the existing web app structure (backend + frontend) and implement
only the files required to satisfy Feature Group 1 behaviors.

## Phase Outputs

### Phase 0 (Research)

- `research.md` produced with decisions for host modeling, validation semantics, polling strategy,
  start preconditions, room isolation checks, and error contract.

### Phase 1 (Design & Contracts)

- `data-model.md` defines Room, Participant, LobbySnapshot, StartAttempt and transitions.
- `contracts/lobby-room-api.yaml` defines create/join/fetch/start interfaces and error responses.
- `quickstart.md` defines two/multi-tab verification plus build checks.
- Agent context update completed by pointing `.github/copilot-instructions.md` to this plan.

## Complexity Tracking

No constitution violations identified; no complexity exceptions required.

## Implementation Validation Log

- `cd backend && npm run build`: PASS
- `cd frontend && npm run build`: PASS
- Manual multi-tab acceptance walkthrough: PASS (host assignment, join sync, host-only start rejection, valid host start transition).
