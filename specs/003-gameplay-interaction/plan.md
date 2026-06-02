# Implementation Plan: Gameplay Interaction and Scoring

**Branch**: `scribble-lab` | **Date**: 2026-06-03 | **Spec**: `specs/003-gameplay-interaction/spec.md`

**Input**: Feature specification from `/specs/003-gameplay-interaction/spec.md`

## Summary

Implement gameplay interaction for drawing and guessing by adding polling-visible canvas state,
clear-canvas behavior, validated guess submission, synchronized guess history, and deterministic
scoring on server-authoritative ordered events. The approach extends the current room snapshot and
in-memory room store with gameplay sub-state while preserving existing HTTP polling architecture.

## Technical Context

**Language/Version**: TypeScript (backend + frontend), Node.js 18+, ES Modules

**Primary Dependencies**: Express, Zod, React 18, React Router 6, Vite

**Storage**: In-memory room/game state only (`Map`-based backend store)

**Testing**: Vitest suites (backend/frontend) + manual two-browser polling walkthrough

**Target Platform**: Browser clients + local Node.js backend

**Project Type**: Web application (monorepo with `backend` and `frontend`)

**Performance Goals**:
- Canvas, guess history, and score updates visible to participants within one polling interval.
- Deterministic scoring consistency for identical ordered event sequences.

**Constraints**:
- No WebSockets/push transport.
- No persistence/database.
- No auth/session additions.
- Deterministic scoring and history ordering must remain server-authoritative.

**Scale/Scope**:
- Small multiplayer rooms in local assignment workflows.
- Single feature group covering in-round interaction and scoring.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Research Gate Review

- Scope control: PASS. Design remains HTTP polling and in-memory only.
- Stack compliance: PASS. No stack deviation from TypeScript/Express/React baseline.
- Validation and errors: PASS. Guess/canvas actions include validation and coded error paths.
- Review discipline: PASS. Artifacts include behavior and regression checks for sync and fairness.
- Determinism: PASS. Scoring and ordering rules are explicitly deterministic and testable.
- Verification: PASS. Build/test and two-browser walkthrough steps are defined.

### Post-Design Gate Re-Check

- Scope control: PASS. Contract, quickstart, and model keep forbidden capabilities out of scope.
- Stack compliance: PASS. Proposed files align with existing project structure and APIs.
- Validation and errors: PASS. Contracts specify invalid input and invalid-state responses.
- Review discipline: PASS. Data model/quickstart include concurrency and ordering edge cases.
- Determinism: PASS. Ordered guess history and server-side scoring rules are explicit.
- Verification: PASS. Quickstart includes reproducible sync and deterministic-score checks.

## Project Structure

### Documentation (this feature)

```text
specs/003-gameplay-interaction/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── gameplay-interaction-api.yaml
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
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── state/

specs/
└── 003-gameplay-interaction/
    ├── plan.md
    ├── research.md
    ├── data-model.md
    ├── quickstart.md
    └── contracts/gameplay-interaction-api.yaml
```

**Structure Decision**: Keep the current backend/frontend split and implement gameplay
interaction as incremental extensions to room state, room routes, and polling-consumed frontend
state/page components.

## Phase Outputs

### Phase 0 (Research)

- `research.md` produced decisions for stroke synchronization, clear-canvas semantics,
  guess-validation rules, ordered history handling, and deterministic scoring.

### Phase 1 (Design & Contracts)

- `data-model.md` defines gameplay entities (canvas state, guess history, score state).
- `contracts/gameplay-interaction-api.yaml` defines draw/clear/guess/poll interfaces.
- `quickstart.md` defines build/test checks and two-browser interaction walkthrough.
- Agent context updated by pointing `.github/copilot-instructions.md` to this plan.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations identified; no complexity exceptions required.

## Implementation Validation Log

- `cd backend && npm run build`: PASS
- `cd frontend && npm run build`: PASS
- `cd backend && npm test`: PASS
- `cd frontend && npm test`: PASS
- Manual two-browser walkthrough: NOT RUN in this session
