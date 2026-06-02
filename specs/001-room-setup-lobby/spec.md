## Feature: Room Setup and Lobby

### User Stories
- As a host, I want to create a room and be marked as host so that lobby control is clearly owned.
- As a player, I want clear validation errors for invalid name or room code so that I can fix input quickly.
- As a player, I want lobby updates to appear automatically about every 2 seconds so that I can see who joined without manual refresh.
- As a host, I want game start to be allowed only with at least two players so that rounds begin in a valid state.
- As a non-host, I want start attempts to be blocked so that host-only control is enforced.

### Acceptance Criteria
- Room creation assigns exactly one host in that room.
- Create/join requests with empty or whitespace-only player names are rejected with clear user-facing messages.
- Join with unknown or invalid room code is rejected with clear user-facing messaging.
- Room state is isolated by room code; participants from one room never appear in another room's lobby.
- Lobby participant list auto-refreshes on a cadence near 2 seconds while the lobby is open.
- On transient polling failure, lobby polling continues and state recovers on a later successful poll.
- Non-host start attempts are rejected with host-only error messaging.
- Host start attempts with fewer than two players are rejected with minimum-player messaging.
- Host start attempts with at least two players transition room status out of lobby and become visible to all room participants via polling.

### Edge Cases
- Two players attempt to join the same room at nearly the same time.
- Player submits room code in lowercase or with surrounding whitespace.
- Poll request times out or fails intermittently while user remains on lobby page.
- Host and non-host rapidly retry start action in parallel.

### Non-Goals
- Drawing interaction, guess submission, scoring, and results workflow.
- Multi-round gameplay, drawer rotation, timers, or speed bonuses.
- WebSockets or push-based real-time transport.
- Database or persistent storage.
- Authentication, user accounts, or session systems.
