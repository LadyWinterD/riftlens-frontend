# Requirements Document

## Introduction

This feature adds a detailed match view that displays comprehensive 10-player data, lane matchup comparisons, and AI-powered analysis. When users click on a match from their match history, they can see all participants' performance, compare themselves to their lane opponent, and get AI coaching recommendations.

## Glossary

- **Match Detail View**: A page/modal showing comprehensive data for a single match
- **Lane Opponent**: The enemy player in the same position (e.g., both TOP laners)
- **Participants**: All 10 players in a match (5 per team)
- **Match Stats**: Performance metrics like KDA, CS, damage, vision, gold
- **AI Analysis**: Claude AI-powered coaching based on match data
- **Data Translation**: Converting IDs to Chinese names (champions, items, summoner spells)

## Requirements

### Requirement 1: Match Detail View Display

**User Story:** As a player, I want to view detailed information about a specific match, so that I can understand what happened in that game.

#### Acceptance Criteria

1. WHEN the user clicks on a match in Match Log or Champions section, THE System SHALL display a match detail view
2. WHEN the match detail view opens, THE System SHALL display match metadata including game creation time, game duration, and game mode
3. WHEN the match detail view opens, THE System SHALL display the user's champion, level, position, and win/loss status
4. WHEN the match detail view opens, THE System SHALL display the user's KDA, CS, gold, damage, and vision score
5. WHEN the match detail view opens, THE System SHALL display the user's items with Chinese translated names
6. WHEN the match detail view opens, THE System SHALL display the user's summoner spells with Chinese translated names

### Requirement 2: 10-Player Data Display

**User Story:** As a player, I want to see all 10 players' performance in the match, so that I can understand the overall game context.

#### Acceptance Criteria

1. WHEN the match detail view displays, THE System SHALL show two teams (Team 100 and Team 200) with 5 players each
2. FOR each player, THE System SHALL display summoner name, champion name, position, and KDA
3. FOR each player, THE System SHALL display CS, gold earned, damage dealt, and vision score
4. FOR each player, THE System SHALL display items and summoner spells
5. WHEN displaying player data, THE System SHALL highlight the current user's row
6. WHEN displaying player data, THE System SHALL sort players by position (TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY)

### Requirement 3: Lane Opponent Comparison

**User Story:** As a player, I want to see how I performed compared to my lane opponent, so that I can identify where I won or lost the lane.

#### Acceptance Criteria

1. WHEN the match detail view displays, THE System SHALL identify the user's lane opponent based on position and team
2. WHEN a lane opponent is identified, THE System SHALL display a comparison section showing both players side by side
3. WHEN displaying the comparison, THE System SHALL show CS difference with a visual indicator (positive/negative)
4. WHEN displaying the comparison, THE System SHALL show damage difference with a visual indicator
5. WHEN displaying the comparison, THE System SHALL show vision score difference with a visual indicator
6. WHEN displaying the comparison, THE System SHALL show gold difference with a visual indicator
7. WHEN no lane opponent exists (e.g., position mismatch), THE System SHALL display a message indicating no direct opponent

### Requirement 4: AI Analysis Integration

**User Story:** As a player, I want to get AI-powered analysis of my match performance, so that I can learn what to improve.

#### Acceptance Criteria

1. WHEN the match detail view displays, THE System SHALL show an "AI Analysis" button
2. WHEN the user clicks the AI Analysis button, THE System SHALL call the Lambda function with the match ID and player ID
3. WHEN calling the Lambda function, THE System SHALL pass the complete participants array for context
4. WHEN the Lambda function returns, THE System SHALL display the AI response in a modal or expandable section
5. WHEN the AI analysis is loading, THE System SHALL show a loading indicator
6. WHEN the Lambda function fails, THE System SHALL display an error message and allow retry

### Requirement 5: Data Translation and Formatting

**User Story:** As a Chinese-speaking player, I want to see champion names, item names, and spell names in Chinese, so that I can easily understand the data.

#### Acceptance Criteria

1. WHEN displaying champion names, THE System SHALL translate champion IDs to Chinese names using StaticData
2. WHEN displaying item names, THE System SHALL translate item IDs to Chinese names using StaticData
3. WHEN displaying summoner spell names, THE System SHALL translate spell IDs to Chinese names using StaticData
4. WHEN displaying timestamps, THE System SHALL format game creation time as a readable date and time
5. WHEN displaying game duration, THE System SHALL format duration as minutes and seconds (e.g., "25:30")
6. WHEN displaying large numbers, THE System SHALL format with thousand separators (e.g., "15,000")

### Requirement 6: Responsive Design and UX

**User Story:** As a player, I want the match detail view to be visually appealing and easy to navigate, so that I can quickly find the information I need.

#### Acceptance Criteria

1. WHEN the match detail view displays, THE System SHALL use a consistent cyber/gaming theme matching the existing UI
2. WHEN displaying on mobile devices, THE System SHALL adapt the layout for smaller screens
3. WHEN the user wants to close the match detail view, THE System SHALL provide a clear close button
4. WHEN displaying team data, THE System SHALL use distinct colors for winning and losing teams
5. WHEN displaying stat differences, THE System SHALL use green for positive differences and red for negative differences
6. WHEN the match detail view loads, THE System SHALL animate the entrance for a smooth user experience
