# Spec Delta

## Purpose

Keeps runners accountable and motivated by showing friends' training and letting them cheer each other on.

## ADDED Requirements

### Requirement: Friends activity feed
The system SHALL show a Friends segment on Home listing friends' runs from the last 14 days, newest first, each with the friend's name, run type, distance, time and pace.

#### Scenario: No friends
- **WHEN** the user has no friends and selects the Friends segment
- **THEN** an empty state invites them to add or invite friends

### Requirement: Kudos
The system SHALL let the user give kudos to a friend's run once, show the kudos count, and toggle it off on a second tap.

#### Scenario: Give kudos
- **WHEN** the user taps the kudos button on a friend's run
- **THEN** the button shows as given and the count increases by one
