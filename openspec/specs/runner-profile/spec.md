# runner-profile Specification

## Purpose
Captures who the runner is (demographics, experience, goal race) so plans and rankings are personalised.

## Requirements

### Requirement: First-run onboarding
The system SHALL show onboarding on first launch and SHALL NOT show the main tabs until onboarding is completed.

#### Scenario: New user completes onboarding
- **WHEN** a user with no saved profile opens the app and enters a name, sex, age, experience, weekly kilometres and race date, then taps "Start training"
- **THEN** the profile is saved and the Home tab is shown with a personalised greeting

#### Scenario: Missing name
- **WHEN** the user taps "Start training" with an empty name
- **THEN** the button is disabled and no profile is saved

### Requirement: Profile persistence
The system SHALL persist the profile and all runs on-device so they survive app restarts.

#### Scenario: Relaunch
- **WHEN** a user who completed onboarding relaunches the app
- **THEN** the Home tab is shown without onboarding

### Requirement: Reset data
The system SHALL let the user erase all local data from the Profile tab after confirming.

#### Scenario: Reset
- **WHEN** the user taps "Reset all data" and confirms
- **THEN** all runs and the profile are deleted and onboarding is shown
