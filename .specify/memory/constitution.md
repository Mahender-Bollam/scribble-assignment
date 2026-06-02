<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
	- [PRINCIPLE_1_NAME] -> I. Engineering First Principles
	- [PRINCIPLE_2_NAME] -> II. AI-Assisted Development Rules
	- [PRINCIPLE_3_NAME] -> III. Review Discipline (Non-Negotiable)
	- [PRINCIPLE_4_NAME] -> IV. Code Quality and Validation Gates
	- [PRINCIPLE_5_NAME] -> V. Simplicity, Determinism, and Scope Control
- Added sections:
	- Technology Stack and Hard Constraints
	- Delivery Workflow and Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ .specify/templates/plan-template.md
	- ✅ .specify/templates/spec-template.md (validated, no change required)
	- ✅ .specify/templates/tasks-template.md (validated, no change required)
- Command docs reviewed:
	- ✅ .specify/extensions/git/commands/speckit.git.initialize.md
	- ✅ .specify/extensions/git/commands/speckit.git.feature.md
	- ✅ .specify/extensions/git/commands/speckit.git.commit.md
	- ✅ .specify/extensions/git/commands/speckit.git.validate.md
	- ✅ .specify/extensions/git/commands/speckit.git.remote.md
- Follow-up TODOs:
	- None
-->

# Scribble Lab Constitution

## Core Principles

### I. Engineering First Principles

All changes MUST map to a defined scenario, acceptance criteria, or explicit bug fix.
Implementations MUST preserve deterministic game behavior and room isolation across
multiple rooms. Backend state MUST remain in-memory and minimal, and stale room state
MUST be explicitly eligible for cleanup. Rationale: The lab evaluates disciplined,
traceable engineering, not feature volume.

### II. AI-Assisted Development Rules

AI outputs MUST be treated as drafts and validated by file-level review before merge.
Developers MUST verify generated code against current repository constraints,
especially no WebSockets, no database, and no authentication additions. AI-generated
changes MUST remain small, auditable, and aligned with existing folder structure.
Rationale: AI accelerates delivery but can introduce policy drift if unchecked.

### III. Review Discipline (Non-Negotiable)

Every meaningful change MUST pass a two-part review: behavioral review (does it satisfy
the scenario and edge cases?) and regression review (what can it break?). Reviews MUST
prioritize bugs, behavioral regressions, and missing validations before style feedback.
Each PR MUST document what was changed, why, and what was intentionally deferred.
Rationale: Review quality is a core learning objective of this lab.

### IV. Code Quality and Validation Gates

TypeScript strictness MUST be preserved end-to-end; avoid any unless unavoidable and
prefer unknown with narrowing. All request payloads and key responses on the backend
MUST be validated with Zod. Error handling MUST return clear user-facing messages while
keeping internals centralized. Before handoff, backend and frontend builds MUST pass,
and changed flows MUST be manually verified in two browser contexts when multiplayer
behavior is affected. Rationale: correctness and clarity are mandatory for shared state
systems.

### V. Simplicity, Determinism, and Scope Control

Choose the simplest implementation that satisfies current scenarios. Deterministic rules
(word selection, scoring behavior, state transitions) MUST be explicit and testable.
Out-of-scope capabilities (real-time push, persistence, auth, unrelated refactors)
MUST NOT be introduced. Rationale: controlled scope improves delivery reliability and
keeps artifacts consistent.

## Technology Stack and Hard Constraints

- Backend stack MUST remain Node.js + Express + TypeScript + Zod with ES modules.
- Frontend stack MUST remain React 18 + React Router 6 + Vite + TypeScript.
- Synchronization MUST use HTTP polling only.
- Persistent storage MUST NOT be added; all room and game state is in-memory.
- Authentication/session systems MUST NOT be added.
- New top-level dependencies SHOULD be avoided unless clearly justified in plan/tasks.

## Delivery Workflow and Quality Gates

1. Discovery notes MUST be updated with gaps, assumptions, and impacted files before
   substantial implementation.
2. Spec, plan, and tasks artifacts MUST stay internally consistent before coding starts.
3. Implement incrementally by scenario priority and keep commits focused and explainable.
4. On each slice, validate acceptance criteria and key edge cases before moving forward.
5. For multiplayer flows, verify behavior with at least two browser tabs/windows.
6. Deviations from spec or constitution MUST be documented in the PR/change summary.

## Governance

This constitution supersedes conflicting local conventions for this repository.
Amendments require: (1) explicit change rationale, (2) impact analysis across spec/plan/
tasks templates, and (3) version update using semantic rules below.

Versioning policy:

- MAJOR: incompatible governance changes or principle removals/redefinitions.
- MINOR: new principle/section or materially expanded mandatory guidance.
- PATCH: wording clarifications and non-semantic refinements.

Compliance review policy:

- Every plan MUST include a Constitution Check with concrete pass/fail gates.
- Every implementation review MUST verify conformance to Core Principles and constraints.
- Non-conformant changes MUST be corrected before completion unless explicitly waived and
  documented with justification.

**Version**: 1.0.0 | **Ratified**: 2026-06-03 | **Last Amended**: 2026-06-03
