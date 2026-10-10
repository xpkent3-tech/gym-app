# Spec Delta

## ADDED Requirements

### Requirement: Body style
The system SHALL offer two body styles, Realistic (default) and Classic. Realistic SHALL render exposed muscle with fibre striations and pale tendons, and SHALL show training intensity by brightening the trained muscles from dull maroon through red to glowing orange. Classic SHALL keep the diagram colours. The choice SHALL persist and apply to every body map and legend.

#### Scenario: Default realistic
- **WHEN** a new user opens the Body screen
- **THEN** the realistic style and its flesh-tone legend (Rest … Max) are shown

#### Scenario: Switch to classic
- **WHEN** the user selects Classic in Settings → Body style
- **THEN** body maps use the diagram colours and the legend changes accordingly, and the choice survives a relaunch
