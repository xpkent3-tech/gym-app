# Spec Delta

## Purpose

Generates and tracks a periodised marathon plan so the runner always knows what to run today.

## ADDED Requirements

### Requirement: Plan generation
The system SHALL generate a plan of 12 to 20 weeks ending on the race date, with base, build, peak and taper phases, a cut-back week every fourth week, and a final-week marathon session.

#### Scenario: 16 weeks out
- **WHEN** the race is 16 weeks away and weekly mileage is 30 km
- **THEN** the plan has 16 weeks, peak weekly volume is higher than week 1, week 4 has less volume than week 3, and the last two weeks taper

#### Scenario: Race too close or too far
- **WHEN** the race is fewer than 12 or more than 20 weeks away
- **THEN** the plan is clamped to 12 or 20 weeks respectively

### Requirement: Today's session
The system SHALL highlight today's planned session on Home and Plan, and SHALL let the user log it with type and distance prefilled.

#### Scenario: Log planned session
- **WHEN** the user taps "Log this run" on today's session
- **THEN** the logging screen opens with the planned type and distance prefilled

### Requirement: Session completion
The system SHALL mark a planned session complete when a run is logged on that date, and SHALL show weekly completion progress.

#### Scenario: Completed session
- **WHEN** a run is logged on a day with a planned session
- **THEN** that session shows a check mark and the week's progress increases
