# Spec Delta

## ADDED Requirements

### Requirement: Next best action
The system SHALL show at most one nudge on Home, choosing the first that applies: streak at risk (the user has a streak, this week is short of 3 runs, and enough days remain to finish it), challenge nearly done (25% or less of it remaining), or level nearly reached (60 XP or less to go).

#### Scenario: Streak at risk
- **WHEN** the user has a 2-week streak, has run once this week, and it is Friday
- **THEN** Home says "Run 2 more times by Sunday to keep your 2-week streak"

#### Scenario: Nothing urgent
- **WHEN** no condition applies
- **THEN** no nudge is shown
