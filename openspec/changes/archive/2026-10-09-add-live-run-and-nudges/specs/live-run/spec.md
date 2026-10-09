# Spec Delta

## Purpose

Lets runners time a run as it happens, Hevy-style, so logging is a by-product of running rather than a chore afterwards.

## ADDED Requirements

### Requirement: Live stopwatch
The system SHALL show elapsed time updating at least once per second, with Pause/Resume, and paused time SHALL NOT count.

#### Scenario: Pause
- **WHEN** the user starts a run, pauses it, waits, and resumes
- **THEN** the elapsed time excludes the paused interval

### Requirement: Laps
The system SHALL record a lap split each time Lap is tapped and list the splits newest-first.

#### Scenario: Lap recorded
- **WHEN** the user taps Lap twice
- **THEN** "Lap 1" and "Lap 2" are listed with their split times

### Requirement: Finish hands off to logging
The system SHALL, on Finish, open the Log form with the elapsed time prefilled, the planned type and distance prefilled when started from today's session, and the lap splits in the notes.

#### Scenario: Finish
- **WHEN** the user finishes a live run started from today's plan session
- **THEN** the Log form shows the elapsed time and the planned distance, ready to save

### Requirement: Discard
The system SHALL ask for confirmation before discarding a live run.

#### Scenario: Discard
- **WHEN** the user taps Discard and confirms
- **THEN** nothing is logged and the previous screen is shown
