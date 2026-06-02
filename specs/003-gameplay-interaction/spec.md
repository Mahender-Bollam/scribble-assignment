## Feature: Gameplay Interaction and Scoring

### User Stories

- As a drawer, I want an interactive canvas with clear controls so that I can quickly sketch and restart a drawing when needed.
- As a guesser, I want to submit guesses with input validation so that only meaningful guesses are accepted.
- As a player, I want synced guess history via polling so that everyone sees the same conversation flow.
- As a player, I want deterministic scoring so that points are fair and consistent for the same gameplay events.

### Acceptance Criteria

- Players can see drawing updates and clear-canvas results reflected in the shared game state through polling.
- Clear canvas action resets the current drawing state for all players without resetting room membership or round status.
- Guess submission rejects empty or whitespace-only input and returns clear feedback.
- Accepted guesses are appended to guess history and become visible to all participants through polling.
- Scoring outcomes are deterministic for the same ordered sequence of valid guesses and round events.
- Invalid guess submissions do not alter guess history or score totals.

### Success Criteria

- 100% of empty or whitespace-only guesses are rejected with user-facing feedback.
- 95% of valid guess submissions appear in all participant histories within one polling interval.
- For repeated replays of the same event sequence, final scoreboard values are identical across all participants.
- Canvas clear state is reflected to all participants within one polling interval after the clear action.

### Edge Cases

- Multiple players submit guesses at nearly the same moment.
- Drawer clears the canvas while guesses are being submitted.
- Duplicate guesses arrive from the same player in quick succession.
- Polling responses arrive out of order on one client.
- A participant reconnects mid-round and must receive current canvas, history, and score state.

### Assumptions

- Polling remains the synchronization mechanism for gameplay state updates.
- Feature scope focuses on round interaction behavior, not authentication or persistence.
- Deterministic scoring rules are fully server-authoritative.

### Non-Goals

- Real-time push transport such as WebSockets.
- Persistent storage of drawings, guesses, or scores.
- Multi-round tournament rules, matchmaking, or ranking systems.
- Authentication, social profiles, or moderation features.
