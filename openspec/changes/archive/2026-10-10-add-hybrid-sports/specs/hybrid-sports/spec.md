# Spec Delta

## Purpose

Supports hybrid athletes by giving each discipline (running, strength, HYROX, CrossFit, football) its own workouts, log forms and results, while unifying them in one feed, muscle map, streak and rank.

## ADDED Requirements

### Requirement: Sports profile
The system SHALL let the athlete choose one or more sports from Running, Strength, HYROX, CrossFit and Football, and SHALL order sport choices in logging and planning by the athlete's sports first.

#### Scenario: Change sports
- **WHEN** the athlete adds Football on Profile
- **THEN** Football appears in the log hub among their sports

### Requirement: Workout library per sport
The system SHALL provide each of HYROX, CrossFit and Football with its own library of workouts, each having a name, format (time, rounds or duration), description and muscle profile.

#### Scenario: HYROX library
- **WHEN** the athlete opens HYROX workouts
- **THEN** "HYROX Race / Simulation", "Compromised Running" and "Station Practice" are listed

### Requirement: Format-specific logging
The system SHALL log a sport session with date, duration and RPE, plus a result appropriate to the workout format: a finish time for time-based workouts, rounds + reps for AMRAP, and none for duration workouts. HYROX race SHALL accept optional splits for the 8 stations, and Football SHALL accept minutes played and goals.

#### Scenario: Fran for time
- **WHEN** the athlete logs Fran with a time of 4:30
- **THEN** the session is saved with a 4:30 result and shown in the feed as "Fran · 4:30"

#### Scenario: Invalid result
- **WHEN** a time-based workout is saved without a parseable time
- **THEN** saving is disabled with a hint

### Requirement: Sessions count everywhere
The system SHALL include sport sessions in the You feed, in muscle load (by the workout's muscle profile × duration × RPE) and in XP (75 per session).

#### Scenario: Football match on the map
- **WHEN** a 90-minute football match is logged
- **THEN** quads, hamstrings and adductors are shaded on the Body screen

### Requirement: Weekly sport suggestions
The system SHALL show on the Plan tab, for each non-running sport of the athlete, two suggested workouts for the week with a one-tap Log action.

#### Scenario: CrossFit athlete
- **WHEN** a CrossFit athlete opens Plan
- **THEN** a CrossFit section lists two workouts with Log buttons
