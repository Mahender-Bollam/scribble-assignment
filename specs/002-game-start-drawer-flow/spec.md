## Feature: Game Start and Drawer Flow

### User Stories

- As a player, I want my name to be trimmed and validated so that empty names are rejected with clear feedback.
- As a host, I want the game start action to assign a drawer deterministically so that everyone has a clear first-round role.
- As a drawer, I want to see the secret word for the round so that I can start drawing correctly.
- As a guesser, I want the secret word hidden from me so that gameplay remains fair.

### Acceptance Criteria

- Player name input is trimmed before validation, and empty or whitespace-only names are rejected with a clear user-facing message.
- Starting a game assigns exactly one drawer for the room and marks that role consistently across room snapshots.
- Secret word selection for the first round is deterministic for the same room state and start conditions.
- Secret word is visible only to the assigned drawer in room snapshots.
- Secret word is not visible to non-drawer participants at any point during this feature scope.
- If game start preconditions are not met, game start is rejected without mutating room role or word state.

### Edge Cases

- Name contains only spaces, tabs, or mixed whitespace characters.
- Two start requests are submitted nearly at the same time.
- Drawer disconnects or leaves immediately after assignment.
- Drawer and guesser fetch room snapshots at nearly the same time while word visibility rules are enforced.
- Repeated fetches by a guesser must never reveal the secret word.

### Non-Goals

- Drawing interactions, stroke sync, and canvas clear behavior.
- Guess submission, scoring, and result panels.
- Multi-round rotation logic, timers, and bonus rules.
- WebSocket or push-based real-time transport.
- Persistent storage, authentication, or account systems.
