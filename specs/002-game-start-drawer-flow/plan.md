# Implementation Plan: Game Start and Drawer Flow

**Branch**: `scribble-lab` | **Date**: 2026-06-03 | **Spec**: `specs/002-game-start-drawer-flow/spec.md`

**Input**: Feature specification from `/specs/002-game-start-drawer-flow/spec.md`

## Summary

Implement Feature Group 2 by introducing deterministic round initialization at game start:
assign exactly one drawer, select one deterministic secret word, and enforce drawer-only word
visibility in room snapshots while preserving polling-based synchronization. The approach extends
the existing in-memory room store and room snapshot projection with explicit per-round fields and
viewer-aware response shaping.

## Technical Context

**Language/Version**: TypeScript (backend + frontend), Node.js 18+, ES Modules

**Primary Dependencies**: Express, Zod, React 18, React Router 6, Vite

**Storage**: In-memory room state (`Map`) only

**Testing**: Vitest (backend and frontend), plus manual two-tab multiplayer validation

**Target Platform**: Local web app (browser clients + Node.js backend)

**Project Type**: Web application (monorepo with backend + frontend)

**Performance Goals**:

- Keep lobby/game polling behavior responsive at current 2-second cadence
- Keep snapshot projection deterministic for identical room/viewer inputs

**Constraints**:

- No WebSockets or push channels
- No database/persistence layer
- No authentication/session features
- No non-deterministic role/word assignment for the same start state

**Scale/Scope**:

- Local assignment usage with small rooms (2 to several participants)
- Single-round start initialization and visibility rules only

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Research Gate Review

- Scope control: PASS. Design remains polling-based and in-memory only.
- Stack compliance: PASS. No framework or runtime changes outside current TypeScript stack.
- Validation and errors: PASS. Start and snapshot flows retain Zod validation and coded error semantics.
- Review discipline: PASS. Artifacts include behavior-first and regression checks for secrecy rules.
- Determinism: PASS. Drawer and secret word assignment are specified as deterministic functions.
- Verification: PASS. Plan includes build checks and two-tab drawer/guesser walkthrough.

### Post-Design Gate Re-Check

- Scope control: PASS. Contracts and quickstart explicitly avoid WebSockets, database, and auth.
- Stack compliance: PASS. All planned changes fit existing backend/frontend module layout.
- Validation and errors: PASS. API contract defines request validation and domain error responses.
- Review discipline: PASS. Data model and quickstart include regression checks for visibility leaks.
- Determinism: PASS. State transitions and deterministic seed inputs are documented in data model.
- Verification: PASS. Validation workflow includes repeat fetch checks for non-drawer secrecy.

## Project Structure

### Documentation (this feature)

```text
specs/002-game-start-drawer-flow/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── game-start-drawer-api.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/

frontend/
├── src/
│   ├── pages/
│   ├── services/
│   └── state/

specs/
└── 002-game-start-drawer-flow/
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    └── contracts/game-start-drawer-api.yaml
```

**Structure Decision**: Use the existing web application split (`backend` + `frontend`)
and confine changes to room model/service/API snapshot shaping plus frontend API/state/game-page
consumption for drawer/guesser visibility.

## Phase Outputs

### Phase 0 (Research)

- `research.md` captures deterministic drawer assignment, deterministic secret word selection,
  and viewer-specific secret-word projection decisions.

### Phase 1 (Design and Contracts)

- `data-model.md` defines round initialization fields and state transition constraints.
- `contracts/game-start-drawer-api.yaml` defines start/fetch response shapes and error semantics.
- `quickstart.md` defines reproducible local verification, including non-drawer secrecy checks.
- Agent context updated by pointing `.github/copilot-instructions.md` to this plan.

## Complexity Tracking

No constitution violations identified; no complexity exceptions required.

## Implementation Validation Log

- `cd backend && npm run build`: PASS
- `cd frontend && npm run build`: PASS
- `cd backend && npm test`: PASS
- `cd frontend && npm test`: PASS
