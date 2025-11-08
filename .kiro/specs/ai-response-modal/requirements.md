# Requirements Document

## Introduction

This feature adds a cyberpunk-styled full-screen modal dialog that displays AI responses with enhanced visual effects. When users ask questions to the AI assistant, instead of showing responses in the small chat panel, the system will open an immersive modal with typewriter animation, loading states, and cyberpunk aesthetics. This improves readability for long responses and provides a more engaging user experience.

## Glossary

- **AIResponseModal**: The full-screen modal component that displays AI responses
- **RiftAI Component**: The existing chat interface component in the bottom-right corner
- **Typewriter Effect**: Character-by-character text animation that simulates typing
- **Preset Questions**: Pre-defined questions with cached answers that appear instantly
- **Custom Questions**: User-input questions that require API calls to generate answers
- **Loading State**: Visual feedback shown while waiting for AI API response
- **Cyberpunk Style**: Visual design featuring neon colors (cyan #00ffff, magenta #ff00ff), scanlines, and tech aesthetics

## Requirements

### Requirement 1

**User Story:** As a player, I want to see AI responses in a large, easy-to-read modal, so that I can comfortably read long answers without scrolling in a small panel.

#### Acceptance Criteria

1. WHEN the user clicks a preset question, THE AIResponseModal SHALL open immediately and display the question and its cached answer
2. WHEN the user submits a custom question, THE AIResponseModal SHALL open immediately and display a loading state
3. WHEN the modal is open, THE AIResponseModal SHALL occupy the center of the screen with a maximum width of 4xl (896px)
4. WHEN the answer text exceeds the viewport height, THE AIResponseModal SHALL provide a scrollable area for the answer section
5. WHEN the user clicks the close button or backdrop, THE AIResponseModal SHALL close and return to the normal chat interface

### Requirement 2

**User Story:** As a player, I want to see a typewriter animation effect when AI answers appear, so that the experience feels more dynamic and engaging.

#### Acceptance Criteria

1. WHEN the modal displays an answer, THE AIResponseModal SHALL animate the text character-by-character at 15 milliseconds per character
2. WHILE the typewriter animation is playing, THE AIResponseModal SHALL display a blinking cursor after the last visible character
3. WHEN the typewriter animation completes, THE AIResponseModal SHALL remove the cursor and display the full text
4. WHEN the user clicks the "SKIP ANIMATION" button, THE AIResponseModal SHALL immediately display the complete answer text
5. WHEN the answer length exceeds 5000 characters, THE AIResponseModal SHALL skip the typewriter effect and display the full text immediately

### Requirement 3

**User Story:** As a player, I want to see a loading animation while waiting for AI responses, so that I know the system is processing my question.

#### Acceptance Criteria

1. WHEN a custom question is submitted, THE AIResponseModal SHALL display a loading state with animated visual elements
2. WHILE in loading state, THE AIResponseModal SHALL display a rotating gear icon animation
3. WHILE in loading state, THE AIResponseModal SHALL display an animated progress bar cycling from 0% to 100%
4. WHILE in loading state, THE AIResponseModal SHALL display rotating status text messages (e.g., "Analyzing...", "Cross-referencing...")
5. WHEN the AI response is received, THE AIResponseModal SHALL transition from loading state to typewriter animation state

### Requirement 4

**User Story:** As a player, I want the modal to have a cyberpunk aesthetic that matches the game theme, so that the interface feels cohesive and immersive.

#### Acceptance Criteria

1. THE AIResponseModal SHALL use a 4px cyan border (#00ffff) with a 60px glow shadow
2. THE AIResponseModal SHALL display magenta corner decorations (#ff00ff) at all four corners
3. THE AIResponseModal SHALL include animated scanline effects that cycle every 8 seconds
4. THE AIResponseModal SHALL use a dark background (#0a0e27) with semi-transparent overlays
5. THE AIResponseModal SHALL display the question section with a magenta-tinted background (#ff00ff with 5% opacity)

### Requirement 5

**User Story:** As a player, I want the modal to integrate seamlessly with the existing chat system, so that I can still access chat history and deep analysis features.

#### Acceptance Criteria

1. WHEN the modal opens, THE RiftAI Component SHALL remain functional and maintain its chat history state
2. WHEN the modal closes, THE RiftAI Component SHALL add the question and answer to the chat history
3. WHEN the user double-clicks a question, THE RiftAI Component SHALL open the deep analysis panel instead of the modal
4. THE AIResponseModal SHALL NOT interfere with the existing deep analysis functionality
5. THE RiftAI Component SHALL maintain separate state for modal display and chat panel display
