# Spec Delta

## Purpose

Lets runners connect with other runners so training, rankings and progress can be shared and compared.

## ADDED Requirements

### Requirement: Personal friend code
The system SHALL give every runner a stable, human-readable friend code (format `STR-` followed by 6 characters) that is shown on the Friends tab.

#### Scenario: Code is stable
- **WHEN** the user opens the Friends tab twice across app restarts
- **THEN** the same friend code is shown

### Requirement: Add friend by code
The system SHALL let the user add a friend by entering their friend code, case-insensitively, and SHALL reject unknown codes, their own code and existing friends with a clear message.

#### Scenario: Valid code
- **WHEN** the user enters the code of a known runner and taps Add
- **THEN** the runner appears in the friends list and a confirmation is shown

#### Scenario: Unknown code
- **WHEN** the user enters a code that matches no runner
- **THEN** "No runner found with that code" is shown and nothing is added

### Requirement: Search and suggestions
The system SHALL let the user search runners by name or handle and SHALL show suggested runners with a similar rank who are not yet friends, each with a one-tap Add.

#### Scenario: Search
- **WHEN** the user types "maya"
- **THEN** runners whose name or handle contains "maya" are listed with an Add button

### Requirement: Friend profile and removal
The system SHALL show a friend profile with their rank tier, top X%, last-7-day distance and recent runs, and SHALL allow removing the friend.

#### Scenario: Remove friend
- **WHEN** the user opens a friend's profile, taps Remove friend and confirms
- **THEN** the friend disappears from the friends list, feed and leaderboard
