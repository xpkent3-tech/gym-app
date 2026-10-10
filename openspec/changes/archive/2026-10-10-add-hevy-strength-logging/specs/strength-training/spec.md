## MODIFIED Requirements
### Requirement: Log a strength session
The system SHALL let the user add exercises to a session, add sets with reps and optional weight in kg, remove sets, and finish the session, which is saved with today's date. Each set SHALL have a type (normal, warm-up, drop, failure), show the previous session's set for the same exercise, and be marked done with a check. Each exercise SHALL support a note and a rest timer; ticking a set done SHALL start the rest countdown. The header SHALL show elapsed time, volume and completed sets. A session with no completed sets SHALL NOT be saved.

#### Scenario: Finish session
- **WHEN** the user adds Hip Thrust with 3 sets of 10 reps at 60 kg and taps Finish
- **THEN** the session is saved and a workout summary is shown and glutes are shaded on the Body screen

#### Scenario: Previous set
- **WHEN** the user logged Hip Thrust 60 kg × 10 before and starts it again
- **THEN** the first set row shows "60kg × 10" as previous and tapping it fills the inputs

#### Scenario: Warm-up excluded
- **WHEN** a set is marked W
- **THEN** it does not count toward volume, PRs or muscle load

#### Scenario: Rest timer
- **WHEN** a set is ticked done on an exercise with a rest timer
- **THEN** a countdown bar appears and can be skipped

### Requirement: Strength XP
The system SHALL award 75 XP per saved strength session and 50 XP per exercise in which the session set a personal record.

#### Scenario: PR XP
- **WHEN** a session beats an exercise's previous best
- **THEN** total XP increases by 75 + 50

#### Scenario: XP
- **WHEN** a strength session is saved
- **THEN** total XP increases by 75
