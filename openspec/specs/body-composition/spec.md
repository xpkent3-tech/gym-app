# body-composition Specification

## Purpose
Tracks the athlete's body composition (weight, body fat, lean mass) from Apple Health or manual entry, and feeds it into nutrition targets.

## Requirements

### Requirement: Manual body metrics
The system SHALL let the user record weight (kg) and optionally body fat %, and SHALL list entries newest first.

#### Scenario: Add weigh-in
- **WHEN** the user enters 76.4 kg and 15 % and saves
- **THEN** the history's newest entry shows 76.4 kg · 15 % and the latest weight shows 76.4 kg

### Requirement: Derived metrics
The system SHALL show lean mass (weight × (1 − body fat)), BMI (weight / height²) and FFMI (lean mass / height² + 6.1 × (1.8 − height in m)) when the inputs are known.

#### Scenario: FFMI
- **WHEN** weight is 80 kg, body fat 15 % and height 180 cm
- **THEN** lean mass is 68 kg, BMI 24.7 and FFMI 21.0

### Requirement: Targets follow body composition
The system SHALL update the profile's weight (and body fat when known) from the newest body entry so nutrition targets use it.

#### Scenario: Body fat recorded
- **WHEN** a body fat % is recorded
- **THEN** the Food tab target is computed with lean-mass-based BMR

### Requirement: Apple Health connection
The system SHALL, on iPhone, request read access to body mass, body fat %, lean body mass, height, resting heart rate, VO₂max, steps and active energy, and SHALL import the latest values on Connect and on Sync. On other platforms it SHALL state that Apple Health is available on iPhone and offer manual entry.

#### Scenario: Not on iPhone
- **WHEN** the user opens Body composition on web or Android
- **THEN** the Apple Health card says it is available on iPhone and manual entry is shown
