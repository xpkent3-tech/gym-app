# Spec Delta

## MODIFIED Requirements

### Requirement: First-run onboarding
The system SHALL show onboarding on first launch and SHALL NOT show the main tabs until onboarding is completed. Onboarding SHALL ask which sports the athlete does (at least one), and SHALL only ask running-specific questions (race date, recent race) when Running is selected.

#### Scenario: New user completes onboarding
- **WHEN** a user with no saved profile opens the app, enters a name, sex, age and sports, and taps "Start training"
- **THEN** the profile is saved and the Home tab is shown with a personalised greeting

#### Scenario: Missing name
- **WHEN** the user taps "Start training" with an empty name
- **THEN** the button is disabled and no profile is saved

#### Scenario: Non-runner
- **WHEN** the user selects only HYROX
- **THEN** the race-date and recent-race questions are hidden

### Requirement: Reset data
The system SHALL let the user erase all local data from Settings (reached from Profile) after confirming.

#### Scenario: Reset
- **WHEN** the user opens Settings, taps "Reset all data" and confirms
- **THEN** all workouts and the profile are deleted and onboarding is shown
