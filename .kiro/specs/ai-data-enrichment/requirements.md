# Requirements Document

## Introduction

This feature enhances the RiftLens AI coaching system by implementing a comprehensive data crawling and storage strategy. The system will maximize the value of the 24-hour Riot API key by crawling rich match data for all 10 players in each game, storing it in DynamoDB, and enabling the AI to perform deep contextual analysis including lane matchups, team contribution, and build optimization.

## Glossary

- **Crawler**: The Python script that fetches player and match data from Riot API
- **DynamoDB**: AWS NoSQL database storing player profiles and match history
- **Data Dragon**: Riot's static data service providing champion, item, and rune dictionaries
- **Match Participant**: One of the 10 players in a League of Legends match
- **PUUID**: Permanent Unique User ID - the primary identifier for players
- **Lambda AI Processor**: AWS Lambda function that analyzes player data using Claude AI
- **Vision Score**: A metric measuring ward placement and map awareness
- **KDA**: Kill/Death/Assist ratio
- **Lane Matchup**: The comparison between two opposing players in the same position

## Requirements

### Requirement 1: Static Data Dictionary Management

**User Story:** As a data analyst, I want the system to maintain up-to-date static data dictionaries, so that the AI can translate IDs into meaningful names and descriptions.

#### Acceptance Criteria

1. WHEN the Crawler initializes, THE Crawler SHALL fetch champion.json from Data Dragon API
2. WHEN the Crawler initializes, THE Crawler SHALL fetch item.json from Data Dragon API
3. WHEN the Crawler initializes, THE Crawler SHALL fetch summoner.json from Data Dragon API
4. WHEN the Crawler initializes, THE Crawler SHALL fetch runesReforged.json from Data Dragon API
5. WHEN static data is fetched, THE Crawler SHALL store the data in DynamoDB StaticData table with keys such as DDRAGON_CHAMPIONS, DDRAGON_ITEMS, DDRAGON_SUMMONERS, and DDRAGON_RUNES

### Requirement 2: Enhanced Match Data Collection

**User Story:** As an AI coach, I want comprehensive match data for all 10 players in each game, so that I can provide contextual analysis comparing player performance against opponents and teammates.

#### Acceptance Criteria

1. WHEN the Crawler fetches match details, THE Crawler SHALL extract data for all 10 participants in the match
2. WHEN the Crawler fetches match details, THE Crawler SHALL extract match metadata including gameCreation timestamp and gameDuration
3. FOR each participant, THE Crawler SHALL extract basic stats including championName, champLevel, individualPosition, teamId, and win status
4. FOR each participant, THE Crawler SHALL extract KDA data including kills, deaths, and assists
5. FOR each participant, THE Crawler SHALL extract economy data including goldEarned, totalMinionsKilled, and neutralMinionsKilled
6. FOR each participant, THE Crawler SHALL extract vision data including visionScore, wardsPlaced, and wardsKilled
7. FOR each participant, THE Crawler SHALL extract damage data including totalDamageDealtToChampions, physicalDamageDealtToChampions, magicDamageDealtToChampions, totalDamageTaken, and damageSelfMitigated
8. FOR each participant, THE Crawler SHALL extract build data including item0 through item6, summoner1Id, summoner2Id, and perks object
9. FOR each participant, THE Crawler SHALL extract team contribution data including turretKills and objectivesStolen

### Requirement 3: DynamoDB Schema Enhancement

**User Story:** As a system architect, I want the DynamoDB schema to store complete 10-player match data, so that the AI can perform comparative analysis across all participants.

#### Acceptance Criteria

1. WHEN storing match data, THE Crawler SHALL use PUUID as the primary key for player records
2. FOR each player record, THE Crawler SHALL store a matchHistory field as a list of match objects
3. FOR each match object, THE Crawler SHALL store a participants array containing data for all 10 players
4. FOR each participant in the array, THE Crawler SHALL store all fields defined in Requirement 2
5. WHEN storing match data, THE Crawler SHALL calculate team total kills in a first pass, then calculate and store derived metrics including csPerMin, visionPerMin, and killParticipation for each participant in a second pass

### Requirement 4: StaticData Table Access

**User Story:** As a Lambda AI Processor, I want to access static data dictionaries from DynamoDB, so that I can translate IDs into human-readable names for AI analysis.

#### Acceptance Criteria

1. WHEN the Lambda AI Processor needs to translate champion IDs, THE Lambda AI Processor SHALL query the StaticData table with key DDRAGON_CHAMPIONS
2. WHEN the Lambda AI Processor needs to translate item IDs, THE Lambda AI Processor SHALL query the StaticData table with key DDRAGON_ITEMS
3. WHEN the Lambda AI Processor needs to translate summoner spell IDs, THE Lambda AI Processor SHALL query the StaticData table with key DDRAGON_SUMMONERS
4. WHEN the Lambda AI Processor needs to translate rune IDs, THE Lambda AI Processor SHALL query the StaticData table with key DDRAGON_RUNES
5. WHEN static data is not found in DynamoDB, THE Lambda AI Processor SHALL log a warning and continue with ID values

### Requirement 5: AI Analysis Enhancement

**User Story:** As a player seeking improvement, I want the AI to provide contextual analysis comparing my performance to my lane opponent, so that I can understand where I lost or won the matchup.

#### Acceptance Criteria

1. WHEN the Lambda AI Processor receives a player query, THE Lambda AI Processor SHALL retrieve match data including all 10 participants
2. WHEN analyzing a specific match, THE Lambda AI Processor SHALL provide all 10 participants data to the AI and allow the AI to identify the most likely lane opponent based on position and teamId
3. WHEN comparing performance, THE Lambda AI Processor SHALL include all participants stats in the system prompt to enable flexible opponent matching
4. WHEN generating analysis, THE Lambda AI Processor SHALL reference comparative metrics such as CS差距, damage差距, and vision差距
5. WHEN the AI identifies performance gaps, THE Lambda AI Processor SHALL provide specific recommendations based on the data

### Requirement 6: Crawler Rate Limiting and Efficiency

**User Story:** As a system operator, I want the crawler to maximize data collection within API rate limits, so that we gather the most valuable data during the 24-hour API key validity period.

#### Acceptance Criteria

1. WHEN the Crawler makes API calls, THE Crawler SHALL respect the 100 calls per 120 seconds rate limit
2. WHEN the rate limit is approached, THE Crawler SHALL automatically pause execution until the rate window resets
3. WHEN crawling match details, THE Crawler SHALL prioritize ranked games (queueId 420) over other game types
4. WHEN storing data, THE Crawler SHALL avoid duplicate API calls for already-fetched matches
5. WHEN the Crawler completes execution, THE Crawler SHALL log statistics including total players crawled, total matches fetched, and API calls made
