# Research: Game Start and Drawer Flow

## Decision 1: Deterministic Drawer Assignment
- Decision: Assign the drawer deterministically from stable participant ordering at game start (first participant in room join order).
- Rationale: Existing participant order is stable in the in-memory room model and produces repeatable role assignment for the same room state.
- Alternatives considered:
  - Random drawer assignment: rejected because acceptance criteria require deterministic behavior.
  - Host-always-drawer: rejected because it couples role assignment to host privileges and reduces future round-rotation flexibility.

## Decision 2: Deterministic Secret Word Selection
- Decision: Select the first-round secret word deterministically from starter words using a stable room seed (room code + created timestamp) with modulo indexing.
- Rationale: Produces reproducible selection for identical start conditions while avoiding persistence or external state.
- Alternatives considered:
  - Runtime random choice (`Math.random`): rejected because output is non-deterministic for equivalent state.
  - Client-selected word: rejected because it weakens server authority and fairness.

## Decision 3: Drawer-Only Word Visibility in Snapshot Projection
- Decision: Keep secret word in server room state and project it conditionally in room snapshots only when the requesting participant is the assigned drawer.
- Rationale: Current fetch route already accepts `participantId`, so role-aware projection can be enforced without new transport mechanisms.
- Alternatives considered:
  - Return secret word to all clients and hide in UI: rejected because it leaks game-critical data.
  - Separate drawer-only endpoint: rejected for now as unnecessary API surface expansion.

## Decision 4: Start Preconditions and Mutation Safety
- Decision: Start-game mutation must remain atomic in service logic: validate requester membership, host status, minimum players, and room status before mutating drawer/word fields.
- Rationale: Prevents partial state updates and preserves deterministic outcomes under near-simultaneous requests.
- Alternatives considered:
  - Split validation/mutation between route and service: rejected because it increases drift risk and weakens invariants.

## Decision 5: Frontend Consumption Contract
- Decision: Frontend treats role and secret word fields as server-authoritative; drawer UI reads secret word from snapshot while guesser UI never expects it.
- Rationale: Keeps secrecy and role logic centralized on backend while supporting polling-based updates.
- Alternatives considered:
  - Derive drawer role only on client: rejected because it can diverge from authoritative server assignments.
