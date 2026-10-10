# Spec Delta

## MODIFIED Requirements

### Requirement: Weekly streak
The system SHALL count consecutive Monday-based weeks with at least 3 training sessions of any sport (runs, strength sessions and sport sessions), ending with the current week if it already qualifies, otherwise with the previous week; rest days SHALL NOT break a streak.

#### Scenario: Current week in progress
- **WHEN** the last two complete weeks each had 3 sessions and the current week has 1 so far
- **THEN** the streak is 2 weeks

#### Scenario: Mixed sports count
- **WHEN** a week has one run, one CrossFit WOD and one football match
- **THEN** that week counts towards the streak
