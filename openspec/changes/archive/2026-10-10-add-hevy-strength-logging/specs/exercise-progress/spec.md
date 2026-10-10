## ADDED Requirements
### Requirement: Exercise progress
The system SHALL show per exercise a Summary tab (records and chart), a History tab (every session's sets) and a How-to tab (muscle diagram and cues). The chart SHALL offer Heaviest Weight, One Rep Max and Best Set Volume and show the latest value and date.

#### Scenario: Chart
- **WHEN** the user has logged an exercise on two days
- **THEN** the chart shows two points and the latest value

### Requirement: Personal records and one-rep max
The system SHALL compute estimated one-rep max with the Epley formula, record heaviest weight, best 1RM and best set volume, and flag PRs in a session against earlier sessions only.

#### Scenario: PR
- **WHEN** the user lifts 70 kg for an exercise whose previous heaviest was 60 kg
- **THEN** the workout summary shows a PR for that exercise

### Requirement: Custom exercises
The system SHALL let the user create exercises with a name, equipment and primary muscles, usable in the picker, logger and muscle map.

#### Scenario: Create
- **WHEN** the user creates "Sled Push" with Quads
- **THEN** it appears in search and lights quads when logged
