# Spec Delta

## MODIFIED Requirements

### Requirement: Muscle taxonomy and body map
The system SHALL model these muscle groups: chest, shoulders, biceps, triceps, forearms, traps, neck, upper back, lats, lower back, abs, obliques, hip flexors, glutes, adductors, quads, hamstrings, calves and tibialis. It SHALL render them on an anatomical body with front and back views and a control that rotates between them. The body SHALL match the profile's sex, and each muscle SHALL be shaded to read as three-dimensional. Muscles without a visible region (hip flexors) SHALL be listed and labelled as deep muscles.

#### Scenario: Rotate
- **WHEN** the user taps Rotate on the front view
- **THEN** the back view is shown, with glutes and hamstrings visible

#### Scenario: Female body
- **WHEN** a female profile opens the Body screen
- **THEN** the female anatomical body is rendered
