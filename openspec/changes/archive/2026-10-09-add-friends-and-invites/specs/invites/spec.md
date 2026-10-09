# Spec Delta

## Purpose

Turns proud moments into growth by making it one tap to invite friends, and makes accepting an invite seamless even for brand-new users.

## ADDED Requirements

### Requirement: Share invite
The system SHALL let the user share an invite containing their name, their current rank (when available) and an invite link with their friend code, via the system share sheet, falling back to copying the link to the clipboard.

#### Scenario: Copy fallback
- **WHEN** the user taps Invite on a platform without a share sheet
- **THEN** the invite link is copied and "Invite link copied" is shown

### Requirement: Invite entry points
The system SHALL offer the invite action on the Friends tab, on the empty friends state, on the Rank tab's friends leaderboard and on the post-run summary when a PR is set.

#### Scenario: Invite after a PR
- **WHEN** a saved run sets a personal record
- **THEN** the summary screen offers "Challenge a friend"

### Requirement: Accept invite
The system SHALL handle an invite link by showing the inviter's name and rank and an Accept button, and accepting SHALL add the inviter as a friend.

#### Scenario: Onboarded user accepts
- **WHEN** an onboarded user opens `/invite/<code>` for a known runner and taps Accept
- **THEN** that runner is added as a friend and the Friends tab is shown

#### Scenario: Invalid invite
- **WHEN** the code matches no runner
- **THEN** the screen says the invite is invalid and offers to go Home

### Requirement: Invite before onboarding
The system SHALL remember an accepted invite opened before onboarding and add the inviter as a friend when onboarding completes.

#### Scenario: New user via invite
- **WHEN** a user without a profile opens an invite, taps "Join", and completes onboarding
- **THEN** the inviter is already in their friends list
