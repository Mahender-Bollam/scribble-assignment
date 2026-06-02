# Tasks: Result, Restart, and Final Validation

**Input**: Design documents from /specs/004-result-restart-validation/

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/result-restart-api.yaml, quickstart.md

**Tests**: Test tasks are not included because the feature spec does not explicitly require a test-first workflow.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align feature artifacts and baseline contracts before coding.

- [X] T001 Validate and finalize result and restart contract definitions in specs/004-result-restart-validation/contracts/result-restart-api.yaml
- [X] T002 Sync feature assumptions and final validation flow across specs/004-result-restart-validation/spec.md and specs/004-result-restart-validation/plan.md and specs/004-result-restart-validation/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared lifecycle/result structures required by all user stories.

**CRITICAL**: Complete this phase before any user story implementation.

- [X] T003 Extend room and snapshot domain types for results lifecycle fields in backend/src/models/game.ts
- [X] T004 [P] Define restart and result lifecycle constants in backend/src/seed/starterData.ts
- [X] T005 Add request schema for restart action in backend/src/api/schemas.ts
- [X] T006 Refactor room store to initialize and project result/restart state in backend/src/services/roomStore.ts
- [X] T007 [P] Extend frontend room snapshot contracts for result and restart metadata in frontend/src/services/api.ts
- [X] T008 [P] Add frontend state support for results lifecycle projection in frontend/src/state/roomStore.ts
- [X] T009 Add shared frontend result/restart view-model helpers in frontend/src/state/roomStore.ts

**Checkpoint**: Foundation is ready for independent story delivery.

---

## Phase 3: User Story 1 - Final Results View (Priority: P1) 🎯 MVP

**Goal**: Show deterministic final results (ranking, scores, winner/tie) identically to all participants.

**Independent Test**: In completed game state, all participants see the same final ranking, scores, and winner/tie outcome within one polling interval.

### Implementation for User Story 1

- [X] T010 [US1] Implement deterministic final ranking and tie projection logic in backend/src/services/roomStore.ts
- [X] T011 [US1] Include finalized result payload in room snapshot projection in backend/src/services/roomStore.ts
- [X] T012 [US1] Ensure GET /rooms/:code lifecycle projection supports results state in backend/src/api/rooms.ts
- [X] T013 [P] [US1] Add frontend result types and accessors in frontend/src/services/api.ts
- [X] T014 [P] [US1] Create final results panel component in frontend/src/components/FinalResultPanel.tsx
- [X] T015 [US1] Integrate final results panel into gameplay route in frontend/src/pages/GamePage.tsx
- [X] T016 [US1] Render deterministic winner and tie display in frontend/src/components/Scoreboard.tsx and frontend/src/components/FinalResultPanel.tsx

**Checkpoint**: Final results are visible and consistent for all participants.

---

## Phase 4: User Story 2 - Host-Only Restart (Priority: P2)

**Goal**: Allow only host to restart from results stage, with explicit rejection feedback for unauthorized attempts.

**Independent Test**: Host restart succeeds from results stage, while non-host restart attempts are rejected without state mutation.

### Implementation for User Story 2

- [X] T017 [US2] Implement host-only restart authorization and lifecycle guards in backend/src/services/roomStore.ts
- [X] T018 [US2] Add POST /rooms/:code/restart route with authorization and state error mapping in backend/src/api/rooms.ts
- [X] T019 [US2] Add restart schema constraints and messages in backend/src/api/schemas.ts
- [X] T020 [P] [US2] Add restart API client method in frontend/src/services/api.ts
- [X] T021 [US2] Add restart action and error propagation in frontend/src/state/roomStore.ts
- [X] T022 [US2] Add restart control UI with host-only visibility/disabled behavior in frontend/src/pages/GamePage.tsx
- [X] T023 [US2] Show user-facing restart failure feedback for unauthorized and invalid states in frontend/src/pages/GamePage.tsx

**Checkpoint**: Restart control is host-authoritative with explicit failure paths.

---

## Phase 5: User Story 3 - Clean Game Reset on Restart (Priority: P3)

**Goal**: Restart returns the room to a clean next-game state while preserving active membership.

**Independent Test**: After valid restart, room members remain, scores reset, prior result payload clears, and game progress fields reset.

### Implementation for User Story 3

- [X] T024 [US3] Implement restart reset mutation for gameplay progress and scores in backend/src/services/roomStore.ts
- [X] T025 [US3] Ensure participant retention and disconnected-user exclusion during restart in backend/src/services/roomStore.ts
- [X] T026 [US3] Reset canvas, guess history, drawer, and per-round markers on restart in backend/src/services/roomStore.ts
- [X] T027 [P] [US3] Extend frontend state hydration to consume post-restart clean snapshot in frontend/src/state/roomStore.ts
- [X] T028 [US3] Clear stale result UI and restore pre-game controls after restart in frontend/src/pages/GamePage.tsx
- [X] T029 [US3] Ensure polling refresh converges all clients to same clean restart state in frontend/src/pages/GamePage.tsx and frontend/src/state/roomStore.ts

**Checkpoint**: Restart produces a clean, fair next-game baseline.

---

## Phase 6: User Story 4 - Final Validation Stability (Priority: P4)

**Goal**: Keep finalized outcomes immutable until valid restart and preserve consistency through refresh/reconnect flows.

**Independent Test**: Result state remains unchanged across polling/reload until a valid host restart, with deterministic outcomes preserved.

### Implementation for User Story 4

- [X] T030 [US4] Enforce result immutability between finalization and accepted restart in backend/src/services/roomStore.ts
- [X] T031 [US4] Add restart eligibility flags and finalization metadata projection in backend/src/services/roomStore.ts
- [X] T032 [US4] Ensure invalid-state restart attempts return consistent conflict semantics in backend/src/api/rooms.ts
- [X] T033 [P] [US4] Add frontend selectors for restart eligibility and immutable result display in frontend/src/state/roomStore.ts
- [X] T034 [US4] Preserve stable result rendering through polling and page refresh in frontend/src/pages/GamePage.tsx and frontend/src/components/FinalResultPanel.tsx
- [X] T035 [US4] Render validation-oriented status messaging for finalization and restart readiness in frontend/src/components/ResultPanel.tsx and frontend/src/pages/GamePage.tsx

**Checkpoint**: Final validation behavior is deterministic and stable across client updates.

---

## Phase 7: Polish and Cross-Cutting Concerns

**Purpose**: Final consistency checks, documentation updates, and end-to-end validation.

- [X] T036 [P] Update result and restart walkthrough and validation steps in specs/004-result-restart-validation/quickstart.md
- [X] T037 Validate cross-artifact consistency in specs/004-result-restart-validation/spec.md and specs/004-result-restart-validation/plan.md and specs/004-result-restart-validation/tasks.md and specs/004-result-restart-validation/contracts/result-restart-api.yaml
- [X] T038 Run backend and frontend build and test commands and record results in specs/004-result-restart-validation/plan.md

---

## Dependencies and Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup completion and blocks all user stories.
- User Story phases (Phase 3-6): depend on Foundational completion.
- Polish (Phase 7): depends on completion of targeted user stories.

### User Story Dependencies

- US1 (P1): starts after Foundational and delivers MVP result visibility.
- US2 (P2): depends on foundational lifecycle fields and benefits from US1 result projection.
- US3 (P3): depends on US2 authorized restart flow.
- US4 (P4): depends on US1-US3 to validate immutability and restart-readiness behavior.

### Task-Level Dependency Highlights

- T006 depends on T003 and T004.
- T007-T009 depend on T003 and T006.
- T010-T012 depend on T006.
- T021 depends on T020.
- T024-T026 depend on T017-T019.
- T028-T029 depend on T027 and T024-T026.
- T030-T035 depend on T010-T029.
- T038 depends on completion of T010-T037.

---

## Parallel Opportunities

- Setup: T001 and T002 can run in parallel.
- Foundational: T004, T007, and T008 can run in parallel after T003.
- US1: T013 and T014 can run in parallel before T015-T016 integration.
- US2: T020 can run in parallel with backend route logic in T017-T019.
- US3: T027 can run in parallel with backend reset logic in T024-T026.
- US4: T033 can run in parallel with backend immutability work in T030-T032.
- Polish: T036 can run in parallel with T037.

---

## Parallel Example by User Story

### US1

- Run T013 and T014 together, then integrate on T015 and T016.

### US2

- Run T020 while T017-T019 are in progress, then merge via T021-T023.

### US3

- Run T027 in parallel with T024-T026, then merge via T028-T029.

### US4

- Run T033 in parallel with T030-T032, then finalize via T034-T035.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 (Phase 3) and validate deterministic final result visibility.
3. Use US1 as MVP checkpoint for feature readiness.

### Incremental Delivery

1. Deliver US1 final result projection.
2. Add US2 host-only restart control and rejection paths.
3. Add US3 clean restart reset behavior.
4. Add US4 final validation immutability and readiness behavior.
5. Complete Phase 7 polish and end-to-end validation.

### Parallel Team Strategy

1. Backend-focused developer: T003-T006, T010-T012, T017-T019, T024-T026, T030-T032.
2. Frontend-focused developer: T007-T009, T013-T016, T020-T023, T027-T029, T033-T035.
3. Shared validation and artifact consistency: T036-T038.
