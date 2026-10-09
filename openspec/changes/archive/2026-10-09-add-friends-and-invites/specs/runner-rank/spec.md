# Spec Delta

## ADDED Requirements

### Requirement: Friends leaderboard
The system SHALL show a friends leaderboard on the Rank tab ranking the user and their friends by last-7-day distance or by predicted marathon time, highlighting the user's row and stating how many friends they are ahead of.

#### Scenario: Ranked by weekly distance
- **WHEN** the user has two friends with 20 km and 50 km this week and has run 30 km
- **THEN** the user is 2nd and the board says "You're ahead of 1 of 2 friends"

#### Scenario: Next target nudge
- **WHEN** the user is not first on the board
- **THEN** the board names the friend directly above and the distance (or marathon time) needed to pass them

#### Scenario: No friends
- **WHEN** the user has no friends
- **THEN** the leaderboard shows an invite call-to-action instead of rows
