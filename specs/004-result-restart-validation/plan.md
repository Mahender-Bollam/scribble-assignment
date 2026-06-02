# Implementation Plan: Result, Restart, and Final Validation

**Branch**: `scribble-lab` | **Date**: 2026-06-03 | **Spec**: `specs/004-result-restart-validation/spec.md`

**Input**: Feature specification from `/specs/004-result-restart-validation/spec.md`

## Summary

Implement end-of-game result finalization and host-controlled restart so participants see
consistent final outcomes (including ties) and can begin a clean new game in the same room.
The approach extends server-authoritative room snapshot data with finalized result metadata,
adds restart lifecycle guards, and preserves polling-based synchronization.

## Technical Context

**Language/Version**: TypeScript (backend + frontend), Node.js 18+, ES Modules

**Primary Dependencies**: Express, Zod, React 18, React Router 6, Vite

**Storage**: In-memory room/game state only (`Map`-based backend store)

**Testing**: Vitest suites (backend/frontend) + manual two-browser polling walkthrough

**Target Platform**: Browser clients + local Node.js backend

**Project Type**: Web application (monorepo with `backend` and `frontend`)

**Performance Goals**:

- Final result and restart state visible to participants within one polling interval.
- Restart transitions complete without stale previous-game score/result data.

**Constraints**:

- No WebSockets/push transport.
- No persistence/database.
- No auth/session additions.
- Result ranking and tie handling remain deterministic and server-authoritative.

**Scale/Scope**:

- Small multiplayer rooms in local assignment workflows.
- Single feature group covering result finalization, restart, and final validation flow.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Research Gate Review

- Scope control: PASS. Design remains polling-only and in-memory only.
- Stack compliance: PASS. No deviation from TypeScript/Express/React baseline.
- Validation and errors: PASS. Restart authorization/state guards and explicit failures are required.
- Review discipline: PASS. Flow includes behavior and regression checks for result stability.
- Determinism: PASS. Ranking, winner, and tie rules are explicit and reproducible.
- Verification: PASS. Build/test and two-browser validation steps are included.

### Post-Design Gate Re-Check

- Scope control: PASS. Contracts and quickstart keep forbidden capabilities out of scope.
- Stack compliance: PASS. Planned changes align with current backend/frontend structure.
- Validation and errors: PASS. Contract defines host-only and invalid-state restart responses.
- Review discipline: PASS. Data model covers replay/idempotency edge paths.
- Determinism: PASS. Final ordering and tie representation are server-defined.
- Verification: PASS. Quickstart defines deterministic and multi-client validation checks.

## Project Structure

### Documentation (this feature)

```text
specs/004-result-restart-validation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── result-restart-api.yaml
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
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── state/

specs/
└── 004-result-restart-validation/
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    └── contracts/result-restart-api.yaml
```

**Structure Decision**: Keep the existing backend/frontend split and implement result and
restart behavior as incremental extensions to room models, room store lifecycle logic,
room routes, and polling-consumed frontend state/pages.

## Phase Outputs

### Phase 0 (Research)

- `research.md` produced decisions for finalized result representation, deterministic ranking,
  host-only restart authorization, restart reset semantics, and polling synchronization.

### Phase 1 (Design & Contracts)

- `data-model.md` defines FinalResult, RestartRequest, lifecycle state, and restart snapshot rules.
- `contracts/result-restart-api.yaml` defines restart endpoint and room snapshot result fields.
- `quickstart.md` defines build/test checks and two-browser result/restart walkthrough.
- Agent context updated by pointing `.github/copilot-instructions.md` to this plan.

## Complexity Tracking

No constitution violations identified; no complexity exceptions required.

## Implementation Validation Log

- `cd backend && npm run build`: PASS
- `cd frontend && npm run build`: PASS
- `cd backend && npm test`: PASS
- `cd frontend && npm test`: PASS
- Manual two-browser walkthrough: NOT RUN in this session
