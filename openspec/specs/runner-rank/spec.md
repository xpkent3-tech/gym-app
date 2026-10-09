# runner-rank Specification

## Purpose
Tells runners where they stand ("top X%") versus a reference marathon population of their sex and age group, honestly and motivationally.

## Requirements

### Requirement: Predicted marathon time
The system SHALL predict a marathon time from the runner's best qualifying effort (runs of at least 3 km) using the Riegel formula, falling back to the onboarding race result, and SHALL show no prediction when neither exists.

#### Scenario: Prediction from a 10K
- **WHEN** the best effort is 10 km in 50:00
- **THEN** the predicted marathon time is about 3:50 (Riegel exponent 1.06)

### Requirement: Performance percentile
The system SHALL convert the predicted time into a "top X%" ranking among marathon finishers of the same sex and age group, where X is between 1 and 99 and lower predicted time gives a lower X.

#### Scenario: Faster is better
- **WHEN** two runners of the same sex and age differ only in predicted time
- **THEN** the faster one has a smaller "top X%"

#### Scenario: Shown on Rank tab
- **WHEN** a prediction exists
- **THEN** the Rank tab shows "Top X%" with a tier name and the time needed to reach the next tier

### Requirement: Volume percentile
The system SHALL show a percentile of the runner's last-7-day distance versus recreational marathon trainees.

#### Scenario: No runs this week
- **WHEN** the runner has logged nothing in the last 7 days
- **THEN** the volume rank prompts them to log a run instead of showing a percentile
