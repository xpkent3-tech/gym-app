# run-logging Specification

## Purpose
Lets runners record runs in seconds and review their history and personal records, mirroring Hevy's logging loop.

## Requirements

### Requirement: Log a run
The system SHALL let the user log a run with a type, distance in km, duration (h:mm:ss or mm:ss), effort 1–10 and optional notes, and SHALL show the derived pace before saving.

#### Scenario: Valid run
- **WHEN** the user selects "Tempo", enters 10 km and 50:00 and taps Save
- **THEN** the run is stored with pace 5:00 /km and appears at the top of the history feed

#### Scenario: Invalid input
- **WHEN** distance is 0 or duration cannot be parsed
- **THEN** Save is disabled and an inline hint explains what is missing

### Requirement: History feed
The system SHALL show logged runs newest-first on Home, each card showing type, date, distance, duration and pace.

#### Scenario: Empty state
- **WHEN** no runs are logged
- **THEN** Home shows an empty state with a call-to-action to log the first run

### Requirement: Run detail and deletion
The system SHALL show a detail screen for a run and SHALL allow deleting it.

#### Scenario: Delete run
- **WHEN** the user opens a run and taps Delete
- **THEN** the run is removed from history, stats and records

### Requirement: Personal records
The system SHALL compute best efforts for 5K, 10K, half marathon and marathon from runs whose distance is at least the record distance, using the run's average pace.

#### Scenario: New PR flagged
- **WHEN** a saved run produces a faster time for a record distance than any previous run
- **THEN** the run is flagged with a "PR" badge naming the distance
