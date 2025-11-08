# Implementation Plan

- [x] 1. Update frontend service layer to match Lambda API contract

  - [x] 1.1 Modify `postStatefulChatMessage` function signature in `awsService.ts`


    - Remove `playerData` parameter
    - Keep only `playerId`, `userMessage`, and `chatHistory` parameters
    - _Requirements: 3.1, 3.4_
  
  - [x] 1.2 Update request body structure in `postStatefulChatMessage`

    - Change from `{ question, data }` to `{ playerId, userMessage, chatHistory }`
    - Remove all references to `playerData` object in request body
    - _Requirements: 3.1, 3.2_
  
  - [x] 1.3 Fix response field name handling

    - Change from `aiAnswer` to `aiResponse`
    - Remove fallback to `aiAnswer` field
    - _Requirements: 1.5, 3.2_
  
  - [x] 1.4 Improve error handling in `postStatefulChatMessage`

    - Parse error responses correctly
    - Throw descriptive errors with status codes
    - _Requirements: 4.3, 4.4_

- [x] 2. Update chat component to use new service layer API

  - [x] 2.1 Modify `handleSendMessage` function in `RiftAI.tsx`


    - Update `postStatefulChatMessage` call to pass only `playerId`, `userMessage`, and `chatHistory`
    - Remove `playerData` parameter from the call
    - _Requirements: 1.1, 2.2, 3.1_
  
  - [x] 2.2 Fix chat history management

    - Ensure current user message is NOT included in `chatHistory` parameter
    - Add current user message to local state before API call
    - Add AI response to chat history after successful response
    - _Requirements: 2.2, 2.5_
  
  - [x] 2.3 Improve error handling in chat component

    - Display error messages in chat interface with error role
    - Prevent failed messages from being added to chat history
    - Show user-friendly error messages for network failures
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 3. Verify Lambda compatibility and add logging

  - [x] 3.1 Review Lambda code to confirm expected request structure


    - Verify Lambda expects `playerId`, `userMessage`, `chatHistory`
    - Verify Lambda returns `aiResponse` field
    - Confirm error response formats match frontend expectations
    - _Requirements: 3.2, 3.3_
  
  - [x] 3.2 Add console logging for debugging

    - Log request body structure in `awsService.ts`
    - Log PlayerID extraction in `RiftAI.tsx`
    - Log chat history state changes
    - _Requirements: 1.1, 2.2_

- [x] 4. Test the complete chat flow


  - [x] 4.1 Test initial chat load with DefaultRoast

    - Verify DefaultRoast appears as first assistant message
    - Verify chat window opens automatically
    - _Requirements: 2.1_
  
  - [x] 4.2 Test single-turn conversation

    - Send a predefined question
    - Verify request structure is correct
    - Verify AI response is displayed
    - Verify chat history is updated correctly
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 4.3 Test multi-turn conversation

    - Send first question and verify response
    - Send follow-up question
    - Verify chat history includes previous messages
    - Verify AI maintains conversation context
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 4.4 Test error scenarios

    - Test with invalid player ID (should show 404 error)
    - Test with network disconnected (should show offline error)
    - Verify error messages are user-friendly
    - Verify failed messages don't corrupt chat history
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
