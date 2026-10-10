# Spec Delta

## ADDED Requirements

### Requirement: Sport ranks
The system SHALL rank, as "top X%" among people of the same sex: HYROX race time against the Open division (age adjusted); each CrossFit benchmark result (lower time is better, or more rounds for Cindy); and Football weekly session load (minutes × RPE over the last 7 days) against amateur players.

#### Scenario: HYROX
- **WHEN** a 30-year-old man has a HYROX race of 1:20:00
- **THEN** his HYROX rank is better than the top 50%

### Requirement: Hybrid rank
The system SHALL show a Hybrid rank equal to the rounded mean of the athlete's available sport percentiles once at least two sports have a rank.

#### Scenario: Two sports ranked
- **WHEN** running is top 20% and HYROX is top 30%
- **THEN** the Hybrid rank is top 25%
