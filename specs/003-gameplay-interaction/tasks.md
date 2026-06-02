# Tasks: Gameplay Interaction and Scoring

**Input**: Design documents from /specs/003-gameplay-interaction/

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/gameplay-interaction-api.yaml, quickstart.md

**Tests**: Test tasks are not included because the feature spec does not explicitly require a test-first workflow.

**Organization**: Tasks are grouped by user story to ensure each story is independently implementable and verifiable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align feature artifacts and contract baseline before coding.

- [X] T001 Validate and finalize gameplay contract definitions in specs/003-gameplay-interaction/contracts/gameplay-interaction-api.yaml
- [X] T002 Sync feature assumptions and validation flow across specs/003-gameplay-interaction/spec.md and specs/003-gameplay-interaction/plan.md and specs/003-gameplay-interaction/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared gameplay data structures and API contracts required by all stories.

**CRITICAL**: Complete this phase before starting user story implementation.

- [X] T003 Extend room and snapshot domain types with gameplay state fields in backend/src/models/game.ts
- [X] T004 [P] Define gameplay constants and deterministic score rule values in backend/src/seed/starterData.ts
- [X] T005 Add request schemas for stroke, clear-canvas, and guess submission in backend/src/api/schemas.ts
- [X] T006 Refactor room store base gameplay state initialization in backend/src/services/roomStore.ts
- [X] T007 [P] Extend frontend room snapshot contracts for canvas, guess history, and scores in frontend/src/services/api.ts
- [X] T008 [P] Add frontend state support for gameplay snapshot updates in frontend/src/state/roomStore.ts
- [X] T009 Add shared frontend gameplay view-model helpers in frontend/src/state/roomStore.ts

**Checkpoint**: Foundation ready for independent user story delivery.

---

## Phase 3: User Story 1 - Interactive Canvas and Clear Action (Priority: P1) 🎯 MVP

**Goal**: Enable drawer drawing interaction and clear-canvas behavior visible to all players via polling.

**Independent Test**: Drawer can add strokes and clear canvas; all participants observe synchronized canvas changes within one polling interval.

### Implementation for User Story 1

- [X] T010 [US1] Add stroke append and canvas clear mutation methods in backend/src/services/roomStore.ts
- [X] T011 [US1] Add POST /rooms/:code/canvas/strokes and POST /rooms/:code/canvas/clear routes in backend/src/api/rooms.ts
- [X] T012 [US1] Enforce drawer-only clear and playing-state guards in backend/src/services/roomStore.ts
- [X] T013 [P] [US1] Add API client methods for stroke and clear actions in frontend/src/services/api.ts
- [X] T014 [US1] Add room store actions for submitStroke and clearCanvas in frontend/src/state/roomStore.ts
- [X] T015 [P] [US1] Create interactive drawing canvas component in frontend/src/components/DrawingCanvas.tsx
- [X] T016 [US1] Integrate drawing and clear controls into frontend/src/pages/GamePage.tsx

**Checkpoint**: Canvas interaction and clear propagation are fully functional.

---

## Phase 4: User Story 2 - Guess Submission with Validation (Priority: P2)

**Goal**: Allow participants to submit validated guesses with clear feedback on invalid input.

**Independent Test**: Empty or whitespace-only guesses are rejected; valid guesses are accepted without breaking gameplay state.

### Implementation for User Story 2

- [X] T017 [US2] Implement backend guess validation and normalization logic in backend/src/services/roomStore.ts
- [X] T018 [US2] Add POST /rooms/:code/guesses route with domain error mapping in backend/src/api/rooms.ts
- [X] T019 [US2] Expand guess submission schema constraints and messages in backend/src/api/schemas.ts
- [X] T020 [P] [US2] Add guess submission API method in frontend/src/services/api.ts
- [X] T021 [US2] Wire validated guess submission flow in frontend/src/components/GuessForm.tsx and frontend/src/pages/GamePage.tsx
- [X] T022 [US2] Propagate guess validation errors through frontend store state in frontend/src/state/roomStore.ts

**Checkpoint**: Guess submission and validation behavior is complete and independently testable.

---

## Phase 5: User Story 3 - Synced Guess History via Polling (Priority: P3)

**Goal**: Keep a shared, ordered guess history synchronized for all participants through polling.

**Independent Test**: Guesses submitted from one participant appear in identical order for all participants within one polling interval.

### Implementation for User Story 3

- [X] T023 [US3] Persist ordered guess history entries in room state in backend/src/services/roomStore.ts
- [X] T024 [US3] Include guess history in room snapshot projection in backend/src/services/roomStore.ts
- [X] T025 [US3] Ensure polling GET /rooms/:code returns gameplay history fields in backend/src/api/rooms.ts
- [X] T026 [P] [US3] Add guess history rendering component in frontend/src/components/GuessHistory.tsx
- [X] T027 [US3] Integrate guess history panel with polling updates in frontend/src/pages/GamePage.tsx
- [X] T028 [US3] Ensure polling refresh keeps history state consistent in frontend/src/state/roomStore.ts

**Checkpoint**: Guess history sync is stable and consistent across participants.

---

## Phase 6: User Story 4 - Deterministic Scoring (Priority: P4)

**Goal**: Apply server-authoritative deterministic score updates from ordered guess events.

**Independent Test**: Replaying the same ordered guess sequence yields identical score totals for all players.

### Implementation for User Story 4

- [X] T029 [US4] Implement deterministic score calculation rules in backend/src/services/roomStore.ts
- [X] T030 [US4] Enforce idempotent score awarding for repeated correct-guess events in backend/src/services/roomStore.ts
- [X] T031 [US4] Include scores in room snapshot output and route responses in backend/src/services/roomStore.ts and backend/src/api/rooms.ts
- [X] T032 [P] [US4] Extend frontend room contracts and state for score maps in frontend/src/services/api.ts and frontend/src/state/roomStore.ts
- [X] T033 [US4] Render deterministic scoreboard values from polling snapshots in frontend/src/components/Scoreboard.tsx and frontend/src/pages/GamePage.tsx

**Checkpoint**: Deterministic scoring is fully implemented and visible to all participants.

---

## Phase 7: Polish and Cross-Cutting Concerns

**Purpose**: Final consistency checks, documentation updates, and end-to-end validation.

- [X] T034 [P] Update gameplay walkthrough and acceptance steps in specs/003-gameplay-interaction/quickstart.md
- [X] T035 Validate cross-artifact consistency in specs/003-gameplay-interaction/spec.md and specs/003-gameplay-interaction/plan.md and specs/003-gameplay-interaction/tasks.md and specs/003-gameplay-interaction/contracts/gameplay-interaction-api.yaml
- [X] T036 Run backend and frontend build and test commands and record results in specs/003-gameplay-interaction/plan.md

---

## Dependencies and Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup completion and blocks all user stories.
- User Story phases (Phase 3-6): depend on Foundational completion.
- Polish (Phase 7): depends on completion of targeted user stories.

### User Story Dependencies

- US1 (P1): starts after Foundational and delivers the first playable interaction slice.
- US2 (P2): depends on foundational schema/store work and can proceed after US1 core state is in place.
- US3 (P3): depends on US2 guess acceptance flow for synced history behavior.
- US4 (P4): depends on US2 and US3 ordered guess persistence to guarantee deterministic scoring.

### Task-Level Dependency Highlights

- T006 depends on T003 and T004.
- T007-T009 depend on T003 and T006.
- T010-T012 depend on T006.
- T014 depends on T013.
- T017-T022 depend on T005 and T006.
- T023-T028 depend on T017-T022.
- T029-T033 depend on T023-T028.
- T036 depends on completion of T010-T035.

---

## Parallel Opportunities

- Setup: T001 and T002 can run in parallel.
- Foundational: T004, T007, and T008 can run in parallel after T003.
- US1: T013 and T015 can run in parallel before integration tasks.
- US2: T020 can run in parallel with backend validation logic in T017-T019.
- US3: T026 can run in parallel with backend history exposure in T024-T025.
- US4: T032 can run in parallel with backend scoring rules in T029-T031.
- Polish: T034 can run in parallel with T035.

---

## Parallel Example by User Story

### US1

- Run T013 and T015 together, then merge on T014 and T016.

### US2

- Run T020 while T017-T019 are in progress, then integrate through T021 and T022.

### US3

- Run T026 in parallel with T024-T025, then integrate in T027.

### US4

- Run T032 in parallel with T029-T031, then finalize in T033.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 (Phase 3) and validate canvas interaction and clear behavior.
3. Use US1 as MVP checkpoint for initial gameplay interaction.

### Incremental Delivery

1. Deliver US1 interactive canvas and clear propagation.
2. Add US2 validated guess submission.
3. Add US3 synchronized guess history.
4. Add US4 deterministic scoring.
5. Complete Phase 7 polish and validation.

### Parallel Team Strategy

1. Backend-focused developer: T003-T006, T010-T012, T017-T019, T023-T025, T029-T031.
2. Frontend-focused developer: T007-T009, T013-T016, T020-T022, T026-T028, T032-T033.
3. Shared validation and artifact consistency: T034-T036.
