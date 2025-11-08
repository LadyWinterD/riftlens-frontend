# Requirements Document

## Introduction

This feature addresses the data contract mismatch between the frontend chat interface and the backend Lambda function (`RiftLensChatbotLambda`). Currently, the frontend sends `{ question, data }` while the Lambda expects `{ playerId, userMessage, chatHistory }`. This mismatch causes the Lambda to return 400 errors, preventing the multi-turn chat functionality from working correctly.

## Glossary

- **Frontend**: The Next.js React application that displays the chat interface
- **Backend Lambda**: The AWS Lambda function `RiftLensChatbotLambda` that processes chat requests
- **Chat API**: The API Gateway endpoint that connects the frontend to the backend Lambda
- **PlayerData**: The complete player statistics object retrieved from DynamoDB
- **ChatHistory**: An array of previous conversation messages in the format `[{role: 'user'|'assistant', content: string}]`
- **API Contract**: The agreed-upon data structure for request and response between frontend and backend

## Requirements

### Requirement 1

**User Story:** As a player, I want to ask questions about my game performance, so that I can receive AI-powered insights based on my actual statistics.

#### Acceptance Criteria

1. WHEN the user types a question in the chat interface, THE Frontend SHALL send a request to the Chat API with the player's ID and the question text
2. WHEN the Chat API receives a valid request, THE Backend Lambda SHALL retrieve the player's statistics from DynamoDB
3. WHEN the Backend Lambda has retrieved player statistics, THE Backend Lambda SHALL call AWS Bedrock to generate an AI response based on the player's data
4. WHEN the AI response is generated, THE Backend Lambda SHALL return the response to the Frontend with a 200 status code
5. WHEN the Frontend receives the AI response, THE Frontend SHALL display the response in the chat interface

### Requirement 2

**User Story:** As a player, I want to have multi-turn conversations with the AI, so that I can ask follow-up questions based on previous answers.

#### Acceptance Criteria

1. WHEN the user sends their first message, THE Frontend SHALL initialize the chat history with the default AI roast as the first assistant message
2. WHEN the user sends a subsequent message, THE Frontend SHALL include all previous conversation messages in the request
3. WHEN the Backend Lambda receives a request with chat history, THE Backend Lambda SHALL include the chat history in the Bedrock prompt to maintain conversation context
4. WHEN the Backend Lambda constructs the Bedrock prompt, THE Backend Lambda SHALL prepend a dummy user message if the chat history starts with an assistant message
5. WHEN the AI generates a response, THE Frontend SHALL append both the user message and AI response to the chat history

### Requirement 3

**User Story:** As a developer, I want the frontend and backend to use a consistent API contract, so that requests are processed correctly without validation errors.

#### Acceptance Criteria

1. THE Frontend SHALL send requests with the following structure: `{ playerId: string, userMessage: string, chatHistory: ChatMessage[] }`
2. THE Backend Lambda SHALL expect requests with the following structure: `{ playerId: string, userMessage: string, chatHistory: ChatMessage[] }`
3. WHEN the Backend Lambda receives a request missing required fields, THE Backend Lambda SHALL return a 400 error with a descriptive error message
4. THE Frontend SHALL NOT send redundant player data (annualStats, matchHistory) in the request body
5. THE Backend Lambda SHALL retrieve all necessary player data from DynamoDB using only the playerId

### Requirement 4

**User Story:** As a developer, I want proper error handling in the chat flow, so that users receive helpful feedback when something goes wrong.

#### Acceptance Criteria

1. WHEN the Backend Lambda cannot find a player in DynamoDB, THE Backend Lambda SHALL return a 404 error with message "Player not found in database"
2. WHEN the Backend Lambda encounters incomplete player data, THE Backend Lambda SHALL return a 500 error with message "Database item is incomplete"
3. WHEN the Frontend receives an error response, THE Frontend SHALL display the error message in the chat interface with an error indicator
4. WHEN a network error occurs, THE Frontend SHALL display a user-friendly error message indicating the AI is offline
5. WHEN an error occurs, THE Frontend SHALL NOT add the failed message to the chat history
