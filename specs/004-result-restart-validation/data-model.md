# Data Model: Result, Restart, and Final Validation

## Entity: FinalResult

- Fields:
  - `rankings: FinalRankingEntry[]`
  - `topScore: number`
  - `winnerParticipantIds: string[]`
  - `isTie: boolean`
  - `finalizedAt: string`
- Validation rules:
  - `rankings` sorted deterministically by score desc and stable tie ordering.
  - `winnerParticipantIds` contains one or more participants with `topScore`.
  - `isTie` is true iff `winnerParticipantIds.length > 1`.

## Entity: FinalRankingEntry

- Fields:
  - `participantId: string`
  - `participantName: string`
  - `score: number`
  - `rank: number`
- Validation rules:
  - `score` is integer and non-negative.
  - Participants with equal score share consistent ordering and rank display rules.

## Entity: RestartRequest

- Fields:
  - `participantId: string`
  - `requestedAt: string`
- Validation rules:
  - `participantId` must belong to active room participant set.
  - Requester must be host for accepted transition.

## Entity: RoomLifecycleState

- Fields:
  - `status: "lobby" | "playing" | "results"`
  - `canRestart: boolean`
  - `lastRestartedAt: string | null`
- Validation rules:
  - `canRestart` is true only when `status` is `results` and result finalization exists.
  - Restart transitions set `status` back to `lobby` and clear result-specific data.

## Entity: RestartSnapshot

- Fields:
  - `participants: Participant[]`
  - `scores: Record<string, number>`
  - `drawerParticipantId: string | null`
  - `secretWord: string | null`
  - `roundState: string`
  - `result: FinalResult | null`
- Validation rules:
  - On accepted restart, all `scores` reset to zero and `result` becomes null.
  - Participant membership reflects currently connected room members only.

## State Transitions

1. `playing -> results`: finalize immutable `FinalResult` from authoritative score state.
2. `results + host restart`: clear gameplay progress, reset scores, clear final result, transition to `lobby`.
3. `results + non-host restart`: reject with authorization error; no state mutation.
4. `non-results + restart`: reject with invalid-state error; no state mutation.
5. `poll room snapshot`: always expose stable finalized result during `results` until valid restart completes.
