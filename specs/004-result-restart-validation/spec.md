## Feature: Result, Restart, and Final Validation

### User Stories

- As a player, I want a clear final results view so that I can understand who won and why.
- As a host, I want to restart the game from the results stage so that the same group can quickly play again.
- As a player, I want restart behavior to reset game progress consistently so that the next game starts fairly.
- As a participant, I want the game to finalize outcomes only after all end-of-game checks are complete so that the final results are trustworthy.

### Acceptance Criteria

- At game completion, all participants can view the same final ranking, total points, and winner outcome.
- If two or more players share the highest final points, the game presents a tie outcome consistently to all participants.
- A host-triggered restart returns the room to a new pre-game state while preserving room membership for currently connected players.
- Restart resets gameplay progress and scoring for the new game without carrying over prior-game points.
- Restart attempts in invalid states are rejected with clear user-facing feedback and do not alter room state.
- Finalized results remain stable and unchanged until a valid restart is completed.

### User Scenarios & Testing

#### Primary Scenario

A room finishes a game, every player sees the same final results, and the host restarts into a clean new game setup with all remaining players.

#### Acceptance Scenarios

1. Given a completed game, when any participant opens the results stage, then ranking, points, and winner are identical across participants.
2. Given a completed game with tied top scores, when results are shown, then all tied players are identified consistently as tied winners.
3. Given a completed game, when the host restarts, then the next game starts with reset gameplay progress and zeroed scores.
4. Given a non-host participant in the results stage, when they try to restart, then the request is denied and room state does not change.
5. Given an invalid restart trigger before results are finalized, when restart is attempted, then the request is rejected and the current game state remains unchanged.

### Functional Requirements

- FR-001: The system MUST provide a final results stage after game completion that includes participant ranking and total points.
- FR-002: The system MUST compute and display winner outcomes deterministically, including tie handling when top scores are equal.
- FR-003: The system MUST expose the same finalized result data to all active participants in the room.
- FR-004: The system MUST allow restart initiation only by the host.
- FR-005: The system MUST reset game-progress fields and scoring fields when restart is accepted.
- FR-006: The system MUST retain active room membership during restart unless a participant has left the room.
- FR-007: The system MUST reject restart requests that arrive in an invalid lifecycle stage.
- FR-008: The system MUST provide explicit feedback for failed restart attempts.
- FR-009: The system MUST keep finalized result data immutable from finalization until a valid restart occurs.

### Success Criteria

- 100% of completed games show identical final ranking and point totals for all active participants.
- 100% of restart attempts by non-host participants are rejected without state mutation.
- 95% of valid host restart actions transition the room to a clean new game state within one polling interval.
- 100% of tied top-score outcomes are represented consistently to all participants.

### Key Entities

- FinalResult: End-of-game aggregate containing ordered participants, point totals, and winner or tie outcome.
- RestartRequest: Intent to begin a new game from a completed game context, including requester role and room lifecycle context.
- RoomLifecycleState: Stage indicator that controls when result display is final, when restart is allowed, and when reset has completed.

### Edge Cases

- Two or more participants finish with identical top scores.
- Host disconnects during the results stage before initiating restart.
- A restart request is submitted multiple times in rapid succession.
- A participant reconnects during results and must see the same finalized outcome.
- A participant leaves immediately before restart and should not be included in the next game state.
- Drawer assignment after restart must be deterministic and fair for the next game start.

### Assumptions

- Polling remains the synchronization mechanism for room and gameplay updates.
- Restart occurs within the same room context rather than creating a new room.
- Final validation refers to completion checks for consistent end-state outcomes and restart readiness.

### Non-Goals

- Persistent storage of historical game results across sessions.
- Matchmaking, tournament brackets, or cross-room leaderboards.
- Authentication, user accounts, or role-management systems beyond existing host behavior.
- Real-time push synchronization outside the existing polling model.
