# Tasks: Room Setup and Lobby

**Input**: Design documents from /specs/001-room-setup-lobby/

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in the feature spec. This task list emphasizes implementation plus manual validation from quickstart.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare shared contracts and feature wiring before behavior changes.

- [X] T001 Confirm feature pointer in .specify/feature.json targets specs/001-room-setup-lobby
- [X] T002 Align frontend API base URL fallback and room snapshot typings in frontend/src/services/api.ts
- [X] T003 [P] Add clear feature-specific error-code mapping notes in specs/001-room-setup-lobby/contracts/lobby-room-api.yaml

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain and API primitives required by all user stories.

**CRITICAL**: No user story work should start until this phase is complete.

- [X] T004 Extend room and participant domain fields (host/status) in backend/src/models/game.ts
- [X] T005 Implement canonical room code normalization helper in backend/src/services/roomStore.ts
- [X] T006 Enforce input schemas for trimmed non-empty player names and start request payload in backend/src/api/schemas.ts
- [X] T007 [P] Standardize API error payload shape and status-code mapping in backend/src/api/router.ts
- [X] T008 Add room snapshot fields required by contract in backend/src/services/roomStore.ts
- [X] T009 Update frontend room state interfaces for host/status additions in frontend/src/state/roomStore.ts

**Checkpoint**: Foundational data contracts and validation are ready.

---

## Phase 3: User Story 1 - Host Tracking and Join Validation (Priority: P1) MVP

**Goal**: Ensure room creator is host and create/join validations return clear errors.

**Independent Test**: Create room and join room flows validate host assignment and input/room-code errors.

- [X] T010 [US1] Assign host on room creation and persist host flag in backend/src/services/roomStore.ts
- [X] T011 [US1] Reject invalid room-code joins with explicit message and code in backend/src/api/rooms.ts
- [X] T012 [US1] Return host flag in room snapshots from backend/src/services/roomStore.ts
- [X] T013 [US1] Render host indicator in lobby participant list in frontend/src/pages/LobbyPage.tsx
- [X] T014 [US1] Surface create/join validation errors with clear copy in frontend/src/pages/CreateRoomPage.tsx
- [X] T015 [US1] Surface create/join validation errors with clear copy in frontend/src/pages/JoinRoomPage.tsx
- [X] T016 [US1] Normalize room code input before join request dispatch in frontend/src/pages/JoinRoomPage.tsx

**Checkpoint**: Host tracking and join validation are functional and independently verifiable.

---

## Phase 4: User Story 2 - Lobby Polling and Room Isolation (Priority: P2)

**Goal**: Keep lobby synchronized via ~2 second polling while preserving room isolation.

**Independent Test**: Two lobbies in different rooms never leak participants; same-room joins appear automatically.

- [X] T017 [US2] Guard room reads/writes by normalized room code in backend/src/services/roomStore.ts
- [X] T018 [P] [US2] Ensure join/fetch routes consistently normalize room code in backend/src/api/rooms.ts
- [X] T019 [US2] Add lobby polling loop (~2s cadence) with cleanup on unmount in frontend/src/pages/LobbyPage.tsx
- [X] T020 [US2] Add fetch-room loading/error recovery behavior for polling failures in frontend/src/state/roomStore.ts
- [X] T021 [US2] Prevent stale updates after navigation by adding polling lifecycle guards in frontend/src/pages/LobbyPage.tsx

**Checkpoint**: Automatic lobby synchronization works and room isolation remains intact.

---

## Phase 5: User Story 3 - Host-Only Start with 2-Player Minimum (Priority: P3)

**Goal**: Enforce start-game authorization and minimum-player preconditions.

**Independent Test**: Non-host start is rejected; host start requires at least 2 participants; successful start updates room status.

- [X] T022 [US3] Implement start-game service operation with host and player-count checks in backend/src/services/roomStore.ts
- [X] T023 [US3] Add POST start-game route and error mappings in backend/src/api/rooms.ts
- [X] T024 [US3] Add startGame API client method in frontend/src/services/api.ts
- [X] T025 [US3] Add roomStore startGame action and state updates in frontend/src/state/roomStore.ts
- [X] T026 [US3] Restrict start button UI to host and disable when player count < 2 in frontend/src/pages/LobbyPage.tsx
- [X] T027 [US3] Show host-only and minimum-player start error messages in frontend/src/pages/LobbyPage.tsx
- [X] T028 [US3] Navigate to game route after successful start transition in frontend/src/pages/LobbyPage.tsx

**Checkpoint**: Host-only start behavior is complete and synchronized through room status updates.

---

## Final Phase: Polish and Cross-Cutting Concerns

**Purpose**: Final alignment, docs sync, and acceptance walkthrough.

- [X] T029 [P] Update quickstart validation wording to match implemented behavior in specs/001-room-setup-lobby/quickstart.md
- [X] T030 [P] Sync contract examples with final error codes/messages in specs/001-room-setup-lobby/contracts/lobby-room-api.yaml
- [X] T031 Run manual multi-tab acceptance walkthrough and record outcomes in specs/001-room-setup-lobby/research.md
- [X] T032 Run build validation commands and record completion in specs/001-room-setup-lobby/plan.md

---

## Dependencies and Execution Order

### Phase Dependencies

- Phase 1 has no dependencies and starts immediately.
- Phase 2 depends on Phase 1 and blocks all user stories.
- Phase 3, Phase 4, and Phase 5 depend on Phase 2.
- Final Phase depends on completion of all selected user stories.

### User Story Dependencies

- US1 (P1) starts first after Foundational and forms MVP behavior.
- US2 (P2) depends on Foundational and can proceed after US1 contract fields are available.
- US3 (P3) depends on Foundational and US1 host tracking fields.

### Within Each User Story

- Backend contract/state changes before frontend consumption.
- API client changes before page-level UI wiring.
- UI validation and error messaging after core action wiring.

## Parallel Opportunities

- T003 can run in parallel with T001 and T002.
- T007 and T009 can run in parallel after T004-T006 start.
- In US2, T018 can run in parallel with T019.
- In Final Phase, T029 and T030 can run in parallel.

## Parallel Example: User Story 1

- Parallel track A: T010, T011, T012
- Parallel track B: T014, T015
- Merge point: T013 and T016 after backend fields/messages stabilize

## Parallel Example: User Story 2

- Parallel track A: T017 and T018
- Parallel track B: T019 and T020
- Merge point: T021 after polling lifecycle and backend normalization are stable

## Parallel Example: User Story 3

- Parallel track A: T022 and T023
- Parallel track B: T024 and T025
- Merge point: T026, T027, T028 once start API and state action are available

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate host tracking and join validation before expanding scope.

### Incremental Delivery

1. Deliver US1 for host and join correctness.
2. Add US2 polling and isolation behavior.
3. Add US3 host-only start gating.
4. Finish with Final Phase polish and acceptance walkthrough.

### Team Parallel Strategy

1. One developer handles backend service/routes (T004-T008, T010-T012, T017-T018, T022-T023).
2. One developer handles frontend state/api/page wiring (T009, T013-T016, T019-T021, T024-T028).
3. Shared final pass on docs and acceptance (T029-T032).
