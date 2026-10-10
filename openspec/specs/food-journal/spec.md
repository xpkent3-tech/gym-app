# food-journal Specification

## Purpose
Lets athletes log what they eat in seconds (photo, words, search or numbers) and see calories and macros against targets that follow their training.

## Requirements

### Requirement: Daily targets
The system SHALL compute a daily calorie target from BMR (Katch-McArdle when body fat is known, otherwise Mifflin-St Jeor) × 1.35, plus 70 % of the day's estimated training energy, adjusted −20 % for "lose" and +10 % for "gain". Protein SHALL be 1.8 g/kg, fat 25 % of calories, and carbohydrates the remainder.

#### Scenario: Maintain on a rest day
- **WHEN** a 75 kg, 180 cm, 30-year-old man with a maintain goal has no training today
- **THEN** the target is about 2,335 kcal with 135 g protein

### Requirement: Day view
The system SHALL show, for the selected day, calories eaten vs target as a ring, protein/carb/fat progress, and entries grouped by meal, with navigation to previous days.

#### Scenario: Empty day
- **WHEN** nothing is logged today
- **THEN** each meal shows an Add button and the ring shows the full target remaining

### Requirement: Log by description
The system SHALL turn a free-text meal description into food items with quantities, using the AI service when configured and otherwise the on-device parser, and SHALL show the items for review before saving.

#### Scenario: Offline parser
- **WHEN** the AI service is not configured and the user describes "2 eggs and a banana"
- **THEN** the review lists 2 eggs and 1 banana with their calories and macros

### Requirement: Log by photo
The system SHALL let the user take or pick a photo and, when the AI service is configured, show the estimated items for review. When it is not configured, it SHALL explain that photo AI is unavailable and offer Describe instead.

#### Scenario: Not configured
- **WHEN** the AI service URL is not set and the user taps Snap
- **THEN** a message explains photo AI is unavailable and offers Describe

### Requirement: Search and quick add
The system SHALL let the user search a built-in food database by name and add a portion, or enter calories and macros manually.

#### Scenario: Search
- **WHEN** the user searches "chicken" and adds "Chicken breast, cooked" at 150 g
- **THEN** about 248 kcal and 47 g protein are added to the chosen meal

### Requirement: Review and adjust
The system SHALL let the user change each item's grams (scaling its calories and macros proportionally) or remove it before saving, and SHALL allow deleting saved entries.

#### Scenario: Scale portion
- **WHEN** an item of 100 g / 200 kcal is changed to 150 g
- **THEN** it shows 300 kcal

### Requirement: AI estimation service
The system SHALL provide a server endpoint that accepts a base64 image and/or a text description and returns JSON items `{name, grams, kcal, protein_g, carbs_g, fat_g}` plus a confidence of low, medium or high. The model API key SHALL stay on the server.

#### Scenario: Non-food photo
- **WHEN** the photo contains no food
- **THEN** the service returns an empty item list with a note, and the app says no food was found
