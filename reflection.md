# Reflection

## What Did the Starter App Already Have?

- Monorepo structure with separate TypeScript backend and frontend apps.
- Basic room creation and room join flows.
- Lobby/game routing scaffold and foundational UI components.
- In-memory room store foundation and starter word seed logic.
- Build/test setup for both backend and frontend.

## What Did You Add?

- Four complete feature groups from room setup through result/restart lifecycle.
- Host-controlled game start and deterministic secret-word/drawer behavior.
- Interactive drawing canvas, clear-canvas action, validated guess submission, and synced guess history.
- Deterministic scoring and final result projection with winner/tie handling.
- Host-only restart flow with invalid-state/authorization guards.
- Clean restart reset logic plus deterministic drawer rotation after restart.
- Additional documentation updates in feature specs/plan/tasks/quickstart and reflection evidence.

## What Was Built

This project delivered four feature groups for the multiplayer Scribble workflow:

1. Room setup and lobby flow.
2. Host-controlled game start with deterministic drawer/word setup.
3. Drawing, guess submission, synchronized guess history, and deterministic scoring.
4. Final result, host-only restart, clean reset behavior, and deterministic drawer rotation across restarts.

## Key Engineering Decisions

- Kept backend state fully in-memory and server-authoritative.
- Used HTTP polling for synchronization (no WebSockets).
- Validated request payloads and response behavior through shared contracts and TypeScript typing.
- Preferred deterministic rules for scoring, result ranking, and drawer assignment to prevent drift across clients.

## What Went Well

- Speckit artifacts (spec/plan/tasks) provided clear implementation traceability.
- Build and test feedback loops were fast and helped catch regressions early.
- End-to-end feature slices remained aligned with scope constraints.

## Challenges and Resolutions

- Restart edge cases initially left ambiguous drawer ownership.
- Resolution: implemented round-robin drawer rotation after restart with a regression test.
- Temporary UI state after restart briefly showed "Unassigned" drawer copy.
- Resolution: added GamePage status guards and lobby redirect on restart completion.

## Lessons Learned

- Deterministic multiplayer systems need explicit lifecycle transitions and ownership rules.
- Documenting edge cases in spec artifacts prevents late-cycle ambiguity.
- UI should defensively handle transitional states even when backend logic is correct.

## Next Improvements

- Add broader integration tests for restart/result lifecycles.
- Add user-facing hint for next drawer before round start.
- Expand automated checks to validate critical multiplayer transitions beyond build/test pass criteria.
