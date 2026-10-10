# muscle-map Specification

## Purpose
Shows which muscles the runner's training actually works, Hevy-style, so runners can see their load and spot neglected muscle groups before they cause injuries.

## Requirements

### Requirement: Muscle taxonomy and body map
The system SHALL model these muscle groups: chest, shoulders, biceps, triceps, forearms, traps, neck, upper back, lats, lower back, abs, obliques, hip flexors, glutes, adductors, quads, hamstrings, calves and tibialis. It SHALL render them on an anatomical body with front and back views and a control that rotates between them. The body SHALL match the profile's sex, and each muscle SHALL be shaded to read as three-dimensional. Muscles without a visible region (hip flexors) SHALL be listed and labelled as deep muscles.

#### Scenario: Rotate
- **WHEN** the user taps Rotate on the front view
- **THEN** the back view is shown, with glutes and hamstrings visible

#### Scenario: Female body
- **WHEN** a female profile opens the Body screen
- **THEN** the female anatomical body is rendered

### Requirement: Load from runs
The system SHALL attribute a load to muscles for every run, proportional to distance and weighted by run type, so that intervals load hamstrings and glutes more per km than easy runs, and every run loads calves and quads.

#### Scenario: Interval vs easy
- **WHEN** an intervals run and an easy run of equal distance are compared
- **THEN** the intervals run gives a higher hamstring load

### Requirement: Weekly muscle heatmap
The system SHALL show on the Body screen the muscles trained in the last 7 days, shaded by load relative to the most-trained muscle, with a list of muscles ranked by load that the user can tap to see which activities contributed.

#### Scenario: Inspect a muscle
- **WHEN** the user taps "Calves" in the list after logging a run
- **THEN** the run is listed as a contributor to calves

### Requirement: Runner balance insight
The system SHALL list the key runner muscles (glutes, hamstrings, core, calves, hip flexors) that had no strength work in the last 7 days and suggest exercises that target them, and SHALL congratulate the user once all are covered.

#### Scenario: No strength work
- **WHEN** the user has only run this week
- **THEN** the insight names glutes, hamstrings, core, calves and hip flexors and suggests exercises such as Hip Thrust

### Requirement: Run muscle summary
The system SHALL show a muscle map of the muscles worked on a run's detail screen.

#### Scenario: Run detail
- **WHEN** the user opens any run
- **THEN** a "Muscles worked" map is shown
