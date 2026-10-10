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

### Requirement: Body style
The system SHALL offer two body styles, Realistic (default) and Classic. Realistic SHALL render exposed muscle with fibre striations and pale tendons, and SHALL show training intensity by brightening the trained muscles from dull maroon through red to glowing orange. Classic SHALL keep the diagram colours. The choice SHALL persist and apply to every body map and legend.

#### Scenario: Default realistic
- **WHEN** a new user opens the Body screen
- **THEN** the realistic style and its flesh-tone legend (Rest … Max) are shown

#### Scenario: Switch to classic
- **WHEN** the user selects Classic in Settings → Body style
- **THEN** body maps use the diagram colours and the legend changes accordingly, and the choice survives a relaunch

### Requirement: Consistent, centred body rendering
The system SHALL render male and female bodies centred in their frame, with front and back views at the same scale, and SHALL draw hands, feet, ankles and knees as smooth skin-toned shapes without separate finger outlines. The female body SHALL have an athletic V-taper (shoulders and glutes broader than the waist) and a ponytail hairstyle.

#### Scenario: Rotate does not jump
- **WHEN** the user rotates the female body from front to back
- **THEN** the figure keeps the same size and position

### Requirement: Connected body
The system SHALL render the realistic body on a continuous full-body silhouette so that neck, limbs, hands and feet are connected to the muscles, SHALL show hands and feet as skin with natural fingers and toes, and SHALL draw the female figure with a feminine silhouette, a head, and hair pulled back into a ponytail.

#### Scenario: Hands and feet
- **WHEN** the Body screen is opened for any profile
- **THEN** each hand is attached at the wrist to the forearm and each foot is attached to the lower leg, both in skin tone
