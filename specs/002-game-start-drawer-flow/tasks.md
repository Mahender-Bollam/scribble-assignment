# Tasks: Game Start and Drawer Flow

**Input**: Design documents from /specs/002-game-start-drawer-flow/

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/game-start-drawer-api.yaml, quickstart.md

**Tests**: Test tasks are not included because this spec does not explicitly require TDD or new automated tests.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align feature artifacts and API contract baseline before implementation.

- [X] T001 Validate and finalize feature contract details in specs/002-game-start-drawer-flow/contracts/game-start-drawer-api.yaml
- [X] T002 Sync plan assumptions and quickstart validation steps in specs/002-game-start-drawer-flow/plan.md and specs/002-game-start-drawer-flow/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared model/snapshot structures required by all user stories.

**CRITICAL**: No user story implementation starts before this phase is complete.

- [X] T003 Extend room domain model with round-start fields in backend/src/models/game.ts
- [X] T004 [P] Add deterministic selection helpers and seed usage constants in backend/src/seed/starterData.ts
- [X] T005 Refactor snapshot and projection primitives for viewer-aware fields in backend/src/services/roomStore.ts
- [X] T006 [P] Expand API schema and payload contracts for start/fetch responses in backend/src/api/schemas.ts
- [X] T007 Update frontend API types for drawer and secret-word snapshot fields in frontend/src/services/api.ts
- [X] T008 [P] Adjust frontend room state types/selectors for new snapshot shape in frontend/src/state/roomStore.ts

**Checkpoint**: Foundation ready for independent user story delivery.

---

## Phase 3: User Story 1 - Trim and Validate Player Names (Priority: P1) 🎯 MVP

**Goal**: Reject empty or whitespace-only player names with clear feedback.

**Independent Test**: Create/join with whitespace-only names from UI and direct API payloads; confirm rejection with user-facing validation message.

### Implementation for User Story 1

- [X] T009 [US1] Enforce strict trimmed non-empty player name validation for create/join inputs in backend/src/api/schemas.ts
- [X] T010 [US1] Guarantee participant display name normalization at room mutation boundaries in backend/src/services/roomStore.ts
- [X] T011 [US1] Normalize and surface validation failures with stable error codes in backend/src/api/router.ts
- [X] T012 [P] [US1] Apply trimmed client-side submit validation and message mapping in frontend/src/pages/CreateRoomPage.tsx
- [X] T013 [P] [US1] Apply trimmed client-side submit validation and message mapping in frontend/src/pages/JoinRoomPage.tsx
- [X] T014 [US1] Ensure client API error propagation remains consistent for validation failures in frontend/src/services/api.ts

**Checkpoint**: Name validation behavior is complete and independently verifiable.

---

## Phase 4: User Story 2 - Deterministic Drawer Assignment and Word Selection (Priority: P2)

**Goal**: On valid game start, assign exactly one deterministic drawer and deterministic first-round secret word.

**Independent Test**: Start the same room state and confirm the same drawer participant and same secret word are selected every time valid start conditions are met.

### Implementation for User Story 2

- [X] T015 [US2] Implement deterministic drawer selection strategy in backend/src/services/roomStore.ts
- [X] T016 [US2] Implement deterministic secret-word selection strategy in backend/src/services/roomStore.ts
- [X] T017 [US2] Persist drawer and secret-word fields during successful start transition in backend/src/services/roomStore.ts
- [X] T018 [US2] Preserve start precondition invariants and no-mutation failures in backend/src/services/roomStore.ts
- [X] T019 [US2] Map start outcomes to contract-compliant status codes and errors in backend/src/api/rooms.ts

**Checkpoint**: Deterministic start initialization works independently and is contract-compliant.

---

## Phase 5: User Story 3 - Drawer-Only Secret Word Visibility (Priority: P3)

**Goal**: The assigned drawer can see the secret word in room snapshots and game UI.

**Independent Test**: Fetch room as drawer and confirm secret word is present in API response and visible in game screen.

### Implementation for User Story 3

- [X] T020 [US3] Add viewer-aware room snapshot projection that includes secret word for drawer only in backend/src/services/roomStore.ts
- [X] T021 [US3] Ensure GET room route passes viewer identity to snapshot projection in backend/src/api/rooms.ts
- [X] T022 [P] [US3] Extend frontend API contracts to consume drawer-visible secret word field in frontend/src/services/api.ts
- [X] T023 [US3] Render drawer role and secret word panel in game screen in frontend/src/pages/GamePage.tsx
- [X] T024 [US3] Update lobby-to-game flow handling for drawer metadata readiness in frontend/src/pages/LobbyPage.tsx

**Checkpoint**: Drawer sees the correct secret word end-to-end.

---

## Phase 6: User Story 4 - Hide Secret Word from Guessers (Priority: P4)

**Goal**: Guessers never receive or display the secret word.

**Independent Test**: Fetch room repeatedly as non-drawer participant and confirm secret word is always absent from response and UI.

### Implementation for User Story 4

- [X] T025 [US4] Enforce non-drawer secret-word omission in room snapshot serialization in backend/src/services/roomStore.ts
- [X] T026 [US4] Verify participant-scoped room fetch behavior for guessers across polling calls in backend/src/api/rooms.ts
- [X] T027 [P] [US4] Add defensive client guards to prevent accidental guesser word rendering in frontend/src/pages/GamePage.tsx
- [X] T028 [US4] Keep polling/state refresh path secret-safe for guesser sessions in frontend/src/state/roomStore.ts

**Checkpoint**: Guesser secrecy is preserved under repeated fetch and polling behavior.

---

## Phase 7: Polish and Cross-Cutting Concerns

**Purpose**: Final consistency, docs sync, and acceptance verification across stories.

- [X] T029 [P] Update acceptance walkthrough and curl examples for drawer/guesser checks in specs/002-game-start-drawer-flow/quickstart.md
- [X] T030 Validate contract/spec/plan/tasks consistency for feature 002 in specs/002-game-start-drawer-flow/spec.md and specs/002-game-start-drawer-flow/plan.md and specs/002-game-start-drawer-flow/tasks.md
- [X] T031 Run backend and frontend build verification commands and capture results in specs/002-game-start-drawer-flow/plan.md

---

## Dependencies and Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies.
- Foundational (Phase 2): depends on Setup completion and blocks all user stories.
- User Story phases (Phase 3-6): depend on Foundational completion.
- Polish (Phase 7): depends on completion of all targeted user stories.

### User Story Dependencies

- US1 (P1): can start immediately after Phase 2.
- US2 (P2): can start after Phase 2 and should follow US1 for clearer validation baseline.
- US3 (P3): depends on US2 because drawer/word data must exist before drawer visibility.
- US4 (P4): depends on US2 and can proceed alongside late US3 UI work once snapshot omission is implemented.

### Task-Level Dependency Highlights

- T005 depends on T003 and T004.
- T007 and T008 depend on T005.
- T015-T019 depend on T005.
- T020-T024 depend on T015-T019.
- T025-T028 depend on T020-T021.
- T031 depends on completion of T009-T030.

---

## Parallel Opportunities

- Setup: T001 and T002 can run in parallel.
- Foundational: T004, T006, T008 can run in parallel once T003 starts.
- US1: T012 and T013 can run in parallel after T009-T011.
- US3: T022 can run in parallel with T023 after backend projection tasks are complete.
- US4: T027 can run in parallel with T026.
- Polish: T029 can run in parallel with T030.

---

## Parallel Example by User Story

### US1

- Run T012 and T013 together after backend validation tasks are complete.

### US2

- Keep T015-T019 mostly sequential due to shared service mutation logic in backend/src/services/roomStore.ts.

### US3

- Run T022 in parallel with T023 after T020-T021 are complete.

### US4

- Run T027 in parallel with T026, then merge on T028.

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 (Phase 3) and validate independently.
3. Complete US2 (Phase 4) and validate deterministic start behavior.
4. Treat US1 + US2 as MVP for reliable game start initialization.

### Incremental Delivery

1. Deliver US1 validation hardening.
2. Deliver US2 deterministic start assignment.
3. Deliver US3 drawer visibility.
4. Deliver US4 guesser secrecy enforcement.
5. Finish with Phase 7 polish and end-to-end validation.

### Team Parallelization

1. One developer handles backend domain/start logic (T003-T006, T015-T021, T025-T026).
2. One developer handles frontend API/state/UI integration (T007-T008, T012-T014, T022-T024, T027-T028).
3. Collaborate on final polish and validation tasks (T029-T031).
