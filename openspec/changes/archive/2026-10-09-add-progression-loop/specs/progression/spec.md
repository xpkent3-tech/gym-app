# Spec Delta

## Purpose

Rewards consistent, plan-aligned training with frequent visible wins (XP, levels, streaks, challenges, badges) without encouraging overtraining.

## ADDED Requirements

### Requirement: Experience points
The system SHALL award 10 XP per km run, 50 XP per completed plan session, 100 XP per personal record set, 150 XP per completed weekly challenge, 25 XP per friend and 50 XP per invite sent, all derived from the user's data.

#### Scenario: First run
- **WHEN** a new user logs a 10 km run that sets 5K and 10K records on a day with no plan session
- **THEN** their total XP is 300 (100 distance + 200 records)

### Requirement: Levels
The system SHALL compute a level from total XP, where reaching level L requires 50 × L × (L − 1) XP, and SHALL show progress to the next level.

#### Scenario: Level thresholds
- **WHEN** the user has 300 XP
- **THEN** they are level 3 with 0 of 300 XP towards level 4

### Requirement: Weekly streak
The system SHALL count consecutive Monday-based weeks with at least 3 runs, ending with the current week if it already qualifies, otherwise with the previous week; rest days SHALL NOT break a streak.

#### Scenario: Current week in progress
- **WHEN** the last two complete weeks each had 3 runs and the current week has 1 run so far
- **THEN** the streak is 2 weeks

### Requirement: Weekly challenge
The system SHALL set a weekly distance challenge equal to the current plan week's target (or the profile's weekly km before the plan starts), at least 10 km, and SHALL show progress and mark it complete when the week's distance reaches it.

#### Scenario: Challenge progress
- **WHEN** the challenge is 30 km and 12 km has been run this week
- **THEN** the challenge shows 12 / 30 km and 18 km to go

### Requirement: Badges
The system SHALL provide badges for milestones (first run, first 10K, half and marathon distance runs, 100 and 500 km total, 4- and 12-week streaks, reaching Advanced and Sub-Elite tiers, 3 friends, first invite), showing each as unlocked or locked with how to earn it.

#### Scenario: Badge grid
- **WHEN** the user opens Profile after their first run
- **THEN** "First Steps" is unlocked and "Century" shows how many km remain

### Requirement: Post-run celebration
The system SHALL show on the summary of a newly saved run the XP that run earned, any level reached, any badges it unlocked and any improvement in rank tier.

#### Scenario: Level up and badge
- **WHEN** a new user saves their first 10 km run
- **THEN** the summary shows "+300 XP", "Level 3" and the "First Steps" badge
