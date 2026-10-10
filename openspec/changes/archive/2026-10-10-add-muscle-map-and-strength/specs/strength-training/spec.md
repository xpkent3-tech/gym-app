# Spec Delta

## Purpose

Lets runners log the strength work their marathon plan needs, Hevy-style, with every exercise showing the muscles it trains.

## ADDED Requirements

### Requirement: Runner exercise library
The system SHALL provide at least 15 runner-relevant exercises, each with primary and secondary muscles, coaching cues and why runners do it, searchable by name and filterable by muscle.

#### Scenario: Filter by muscle
- **WHEN** the user filters the exercise picker by Glutes
- **THEN** only exercises with glutes as a primary or secondary muscle are listed

### Requirement: Exercise detail
The system SHALL show an exercise's primary muscles at full highlight and secondary muscles at partial highlight on the body map.

#### Scenario: Hip thrust
- **WHEN** the user opens Hip Thrust
- **THEN** glutes are shown as primary and hamstrings as secondary

### Requirement: Log a strength session
The system SHALL let the user add exercises to a session, add sets with reps and optional weight in kg, remove sets, and finish the session, which is saved with today's date. A session with no completed sets SHALL NOT be saved.

#### Scenario: Finish session
- **WHEN** the user adds Hip Thrust with 3 sets of 10 reps at 60 kg and taps Finish
- **THEN** the session appears in the You feed and glutes are shaded on the Body screen

### Requirement: Strength XP
The system SHALL award 75 XP per saved strength session.

#### Scenario: XP
- **WHEN** a strength session is saved
- **THEN** total XP increases by 75
