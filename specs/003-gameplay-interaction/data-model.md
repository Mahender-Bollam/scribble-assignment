# Data Model: Gameplay Interaction and Scoring

## Entity: Stroke
- Fields:
  - `id: string`
  - `x: number`
  - `y: number`
  - `color: string`
  - `size: number`
  - `createdAt: string`
- Validation rules:
  - Coordinates and brush size must be finite numeric values.
  - Stroke mutations are accepted only while room status is `playing`.

## Entity: CanvasState
- Fields:
  - `strokes: Stroke[]`
  - `lastClearedAt: string | null`
  - `version: number`
- Validation rules:
  - Clear action empties `strokes`, sets `lastClearedAt`, increments `version`.
  - Every accepted stroke increments `version`.

## Entity: GuessEntry
- Fields:
  - `id: string`
  - `participantId: string`
  - `participantName: string`
  - `text: string`
  - `normalizedText: string`
  - `isCorrect: boolean`
  - `createdAt: string`
  - `order: number`
- Validation rules:
  - `text` must be trimmed and non-empty.
  - `order` is monotonically increasing within room history.
  - Invalid guesses are not persisted.

## Entity: ScoreState
- Fields:
  - `pointsByParticipantId: Record<string, number>`
  - `awardedCorrectGuessParticipantId: string | null`
  - `drawerParticipantId: string | null`
  - `roundNumber: number`
- Validation rules:
  - Score mutations are server-authoritative only.
  - Scoring logic is idempotent per accepted correct-guess event.
  - Replaying identical ordered events yields identical totals.

## Entity: GameplaySnapshot
- Fields:
  - `canvas: CanvasState`
  - `guessHistory: GuessEntry[]`
  - `scores: Record<string, number>`
  - `drawerParticipantId: string | null`
  - `viewerRole: "drawer" | "guesser" | null`
  - `secretWord?: string`
- Validation rules:
  - Secret word appears only for drawer viewer.
  - Canvas and guess history are identical for all participants.

## State Transitions
1. `draw-stroke`: append stroke, increment canvas version.
2. `clear-canvas`: reset stroke list, set clear marker, increment canvas version.
3. `submit-guess` invalid: reject, no history/score mutation.
4. `submit-guess` valid incorrect: append history only.
5. `submit-guess` valid correct: append history and apply deterministic scoring once.
6. `fetch-room` projection: include canvas/history/scores, hide secret word for non-drawers.
