# Research: Result, Restart, and Final Validation

## Decision 1: End-of-game result state model

- Decision: Introduce an explicit finalized result payload in room snapshots with ordered rankings, top score, and winner or tie metadata.
- Rationale: A dedicated result payload keeps end-state interpretation deterministic and avoids client-side inference drift.
- Alternatives considered:
  - Client-calculated rankings from score maps: rejected because clients may diverge on ordering and tie display.
  - Reusing only existing score map without result metadata: rejected because acceptance requires consistent winner/tie presentation.

## Decision 2: Deterministic ranking and tie handling

- Decision: Rank by descending score, then stable deterministic tiebreak by participant join order; expose tied winners when top scores match.
- Rationale: Deterministic ordering is required for cross-client consistency and replayability.
- Alternatives considered:
  - Timestamp-based tiebreaks: rejected due to race sensitivity.
  - Random tiebreaks: rejected because outcomes must be reproducible.

## Decision 3: Restart authorization and lifecycle guard

- Decision: Allow restart only when room status is completed-results and requester is current host.
- Rationale: Prevents accidental or unauthorized state resets and aligns with host-led flow.
- Alternatives considered:
  - Allow any participant restart vote-less: rejected due to control ambiguity.
  - Allow restart during active round: rejected because it can invalidate in-flight scoring/events.

## Decision 4: Restart reset semantics

- Decision: Restart preserves room code and active participants but resets gameplay progress fields, result payload, round state, and score totals.
- Rationale: Supports quick replay with same group while guaranteeing fairness via clean state.
- Alternatives considered:
  - Create new room on restart: rejected because user story expects same room continuity.
  - Keep prior scores between games: rejected because acceptance requires no carry-over.

## Decision 5: Polling synchronization contract

- Decision: Expose result and restart-ready fields in GET room snapshot so all participants converge within one polling interval.
- Rationale: Polling is mandatory transport and already the source of truth for shared state.
- Alternatives considered:
  - Separate results endpoint only: rejected as unnecessary complexity for current architecture.
  - Push notifications: rejected by project constraints.

## Decision 6: Final validation checks

- Decision: Finalization marks results immutable until a valid restart and includes restart eligibility indicators for UI feedback.
- Rationale: Prevents post-finalization mutation ambiguity and supports explicit user-facing errors.
- Alternatives considered:
  - Implicit finalization from status alone: rejected because eligibility and failure feedback become inconsistent.

## Validation Notes

- Planned verification includes backend/frontend builds, backend/frontend tests, and two-browser restart/result consistency walkthrough.
- Error-path validation includes non-host restart rejection and invalid-state restart rejection.
