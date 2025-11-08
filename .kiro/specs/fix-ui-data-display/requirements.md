# Requirements Document

## Introduction

This feature addresses two main issues in the UI:
1. The Neural Analysis Core section is displaying empty/blank content instead of AI analysis data
2. Match History and Champions tabs are using placeholder icons instead of real game assets (champion portraits, item icons, summoner spells)

## Glossary

- **Neural Analysis Core**: The AI analysis panel showing strengths, weaknesses, and insights
- **Match History**: The tab showing recent game matches with details
- **Champions Tab**: The tab showing champion statistics and performance
- **Game Assets**: Real League of Legends images (champion portraits, item icons, summoner spell icons)
- **Data Dragon**: Riot Games' CDN for game assets
- **PlayerData**: The AWS data structure containing player statistics

## Requirements

### Requirement 1

**User Story:** As a player, I want to see my AI analysis (strengths, weaknesses, insights) in the Neural Analysis Core section, so that I can understand my performance.

#### Acceptance Criteria

1. WHEN the player data loads, THE Neural Analysis Core SHALL display the AI analysis from `aiAnalysis_DefaultRoast`
2. THE Neural Analysis Core SHALL parse and display strengths, weaknesses, and insights separately
3. THE Neural Analysis Core SHALL use cyberpunk styling consistent with the rest of the UI
4. WHEN no AI analysis is available, THE Neural Analysis Core SHALL display a placeholder message
5. THE Neural Analysis Core SHALL be visually appealing with proper formatting

### Requirement 2

**User Story:** As a player, I want to see real champion portraits in the Match History and Champions tabs, so that I can easily recognize which champions I played.

#### Acceptance Criteria

1. THE Match History SHALL display real champion portraits using Data Dragon CDN
2. THE Champions Tab SHALL display real champion portraits using Data Dragon CDN
3. WHEN a champion image fails to load, THE System SHALL display a fallback placeholder
4. THE champion images SHALL be properly sized and styled
5. THE champion images SHALL have hover effects for better UX

### Requirement 3

**User Story:** As a player, I want to see real item icons in the Match History, so that I can review my build choices.

#### Acceptance Criteria

1. THE Match History SHALL display real item icons using Data Dragon CDN
2. THE item icons SHALL be displayed in the correct order (item0 through item6)
3. WHEN an item slot is empty (value 0), THE System SHALL display an empty slot placeholder
4. THE item icons SHALL have tooltips showing item names
5. THE item icons SHALL be properly sized (32x32 or 40x40 pixels)

### Requirement 4

**User Story:** As a player, I want to see real summoner spell icons in the Match History, so that I can review my spell choices.

#### Acceptance Criteria

1. THE Match History SHALL display real summoner spell icons using Data Dragon CDN
2. THE summoner spell icons SHALL map summoner IDs to correct spell images
3. THE summoner spell icons SHALL be properly sized and positioned
4. WHEN a summoner spell ID is unknown, THE System SHALL display a placeholder
5. THE summoner spell icons SHALL have tooltips showing spell names

### Requirement 5

**User Story:** As a developer, I want a utility service for fetching game assets, so that asset loading is consistent across the application.

#### Acceptance Criteria

1. THE System SHALL provide a GameAssetsService utility
2. THE GameAssetsService SHALL handle champion portrait URLs
3. THE GameAssetsService SHALL handle item icon URLs
4. THE GameAssetsService SHALL handle summoner spell icon URLs
5. THE GameAssetsService SHALL use the latest Data Dragon version
6. THE GameAssetsService SHALL provide fallback images for missing assets
