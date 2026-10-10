# Spec Delta

## ADDED Requirements

### Requirement: Calories on Home
The system SHALL show on Home today's calories eaten against target with protein, carb and fat progress and a Log food shortcut, and SHALL show a set-up prompt instead when body size is not yet known.

#### Scenario: Targets known
- **WHEN** the user has set targets and logged 600 kcal of a 2,400 kcal target
- **THEN** Home shows 600 / 2,400 kcal and a Log food button

#### Scenario: Not set up
- **WHEN** body size is unknown
- **THEN** Home shows "Set up calorie targets" linking to the Food tab
