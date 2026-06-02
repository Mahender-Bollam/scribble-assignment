# Research: Gameplay Interaction and Scoring

## Decision 1: Canvas state synchronization model
- Decision: Represent canvas as an ordered in-memory stroke list per room and expose it through polling snapshots.
- Rationale: Polling is a hard constraint and an ordered stroke list keeps merge/render behavior deterministic for all participants.
- Alternatives considered:
  - Image/frame snapshots only: rejected because full-frame updates are less efficient and harder to apply incrementally.
  - WebSocket streaming: rejected due to project constraints.

## Decision 2: Clear canvas behavior
- Decision: Clear action resets only room canvas state and records a clear event marker while preserving room status, participants, and scoring state.
- Rationale: Acceptance criteria require drawing reset without changing round lifecycle or membership.
- Alternatives considered:
  - Full room game-state reset: rejected because it mutates unrelated state.
  - Client-local clear only: rejected because all participants must observe clear.

## Decision 3: Guess submission validation
- Decision: Validate guess text with trim + non-empty + max-length constraints on backend and mirror basic checks on frontend.
- Rationale: Backend enforces contract integrity while frontend provides immediate user feedback.
- Alternatives considered:
  - Frontend-only validation: rejected because server authority is required.
  - No length bound: rejected due to abuse/performance risk in polling payloads.

## Decision 4: Guess history synchronization
- Decision: Store accepted guesses in ordered per-room history with timestamps and participant metadata, returned in room snapshots.
- Rationale: Polling clients need canonical shared history, and ordered append-only entries simplify deterministic behavior.
- Alternatives considered:
  - Per-client local guess logs: rejected because histories diverge.
  - Separate guess-history endpoint only: rejected for now since room snapshots already power polling.

## Decision 5: Deterministic scoring strategy
- Decision: Scoring is computed by server-side deterministic rules over accepted guess sequence (first correct guess bonus, drawer assist points, and idempotent once-per-round awarding).
- Rationale: Deterministic rules must produce identical outcomes for identical event ordering and prevent duplicate award paths.
- Alternatives considered:
  - Client-calculated scoring: rejected because clients can drift.
  - Non-deterministic tie-breaking (timing jitter): rejected because replay consistency is required.

## Decision 6: Ordering and concurrency handling
- Decision: Treat guess submissions as sequential mutations in room store and stamp each accepted guess with monotonic insertion order.
- Rationale: Near-simultaneous guesses must still produce deterministic scoring and history ordering.
- Alternatives considered:
  - Timestamp-only ordering: rejected due to potential collisions and clock variance.

## Validation Notes
- Planned verification includes backend/frontend build checks, backend/frontend tests, and two-browser polling walkthrough.
- API spot checks remain localhost-only and aligned with existing development workflow.
