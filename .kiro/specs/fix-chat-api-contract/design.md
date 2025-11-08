# Design Document

## Overview

This design addresses the API contract mismatch between the frontend (`awsService.ts` and `RiftAI.tsx`) and the backend Lambda (`RiftLensChatbotLambda`). The solution involves modifying the frontend to send the correct data structure that matches what the Lambda expects, eliminating redundant data transmission, and ensuring proper chat history management.

## Architecture

### Current Flow (Broken)
```
Frontend (RiftAI.tsx)
  ↓ calls postStatefulChatMessage()
awsService.ts
  ↓ sends { question, data: { PlayerID, annualStats, matchHistory, ... } }
API Gateway
  ↓ forwards request
RiftLensChatbotLambda
  ↓ expects { playerId, userMessage, chatHistory }
  ↓ returns 400 Bad Request (missing fields)
```

### New Flow (Fixed)
```
Frontend (RiftAI.tsx)
  ↓ calls postStatefulChatMessage(playerId, userMessage, chatHistory)
awsService.ts
  ↓ sends { playerId, userMessage, chatHistory }
API Gateway
  ↓ forwards request
RiftLensChatbotLambda
  ↓ validates request
  ↓ queries DynamoDB for player data
  ↓ calls Bedrock with system prompt + chat history
  ↓ returns { aiResponse: string }
Frontend
  ↓ displays AI response
  ↓ updates chat history
```

## Components and Interfaces

### 1. Frontend Service Layer (`awsService.ts`)

**Current Implementation Issues:**
- Sends `{ question, data }` structure
- Includes entire `playerData` object (redundant)
- Expects `aiAnswer` field in response (should be `aiResponse`)

**New Implementation:**
```typescript
export const postStatefulChatMessage = async (
  playerId: string,
  userMessage: string,
  chatHistory: ChatMessage[]
): Promise<string> => {
  
  const requestBody = {
    playerId: playerId,        // Changed from data.PlayerID
    userMessage: userMessage,  // Changed from question
    chatHistory: chatHistory   // New field
  };
  
  const response = await fetch(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  
  const responseData = await response.json();
  
  if (!response.ok) {
    throw new Error(responseData.error || 'AI analysis failed');
  }
  
  return responseData.aiResponse;  // Changed from aiAnswer
};
```

**Key Changes:**
- Remove `playerData` parameter (no longer needed)
- Send only `playerId`, `userMessage`, `chatHistory`
- Expect `aiResponse` field in response
- Remove fallback to `aiAnswer` field

### 2. Frontend Chat Component (`RiftAI.tsx`)

**Current Implementation Issues:**
- Passes entire `playerData` object to `postStatefulChatMessage`
- Initializes chat history with `DefaultRoast` but doesn't manage it properly

**New Implementation:**
```typescript
const handleSendMessage = async (message: string) => {
  if (isProcessing || !message || !playerData) return;

  const newUserMessage: ChatMessage = { role: 'user', content: message };
  const updatedHistory = [...chatHistory, newUserMessage];
  setChatHistory(updatedHistory);
  setCustomQuestion('');
  setIsProcessing(true);

  try {
    const aiResponse = await postStatefulChatMessage(
      playerData.PlayerID,     // Only send PlayerID
      message,                 // The user's question
      chatHistory              // Previous conversation (NOT including current message)
    );
    
    setChatHistory([
      ...updatedHistory,
      { role: 'assistant', content: aiResponse }
    ]);
  } catch (error: any) {
    setChatHistory([
      ...updatedHistory,
      { role: 'error', content: `[AI OFFLINE] ${error.message}` }
    ]);
  } finally {
    setIsProcessing(false);
  }
};
```

**Key Changes:**
- Pass only `playerData.PlayerID` (not entire object)
- Send `chatHistory` without the current user message (Lambda will add it)
- Maintain proper chat history state management

### 3. Backend Lambda (No Changes Required)

The Lambda code is already correctly implemented. It expects:
```python
player_id = body.get('playerId')
user_message = body.get('userMessage')
chat_history = body.get('chatHistory', [])
```

And returns:
```python
{
  'statusCode': 200,
  'body': json.dumps({'aiResponse': ai_response_text})
}
```

## Data Models

### Request Schema
```typescript
interface ChatRequest {
  playerId: string;           // Player's unique identifier (PUUID)
  userMessage: string;        // The user's current question
  chatHistory: ChatMessage[]; // Previous conversation messages
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
```

### Response Schema
```typescript
interface ChatResponse {
  aiResponse: string;  // The AI-generated response
}

interface ErrorResponse {
  error: string;       // Error message
}
```

### Chat History Management

**Initial State (when playerData loads):**
```typescript
chatHistory = [
  {
    role: 'assistant',
    content: playerData.aiAnalysis_DefaultRoast
  }
]
```

**After User Asks First Question:**
```typescript
chatHistory = [
  {
    role: 'assistant',
    content: playerData.aiAnalysis_DefaultRoast
  },
  {
    role: 'user',
    content: "What am I doing wrong?"
  },
  {
    role: 'assistant',
    content: "Based on your stats, your main issue is..."
  }
]
```

## Error Handling

### Frontend Error Handling

**Network Errors:**
```typescript
catch (error: any) {
  setChatHistory([
    ...updatedHistory,
    { role: 'error', content: `[AI OFFLINE] ${error.message}` }
  ]);
}
```

**API Errors (400, 404, 500):**
```typescript
if (!response.ok) {
  const errorMsg = responseData.error || 'AI analysis failed';
  throw new Error(`[${response.status}] ${errorMsg}`);
}
```

### Backend Error Responses

**Missing Fields (400):**
```python
if not player_id or not user_message:
    return {
        'statusCode': 400,
        'body': json.dumps({'error': 'Missing "playerId" or "userMessage" in request body.'})
    }
```

**Player Not Found (404):**
```python
if 'Item' not in db_response:
    return {
        'statusCode': 404,
        'body': json.dumps({'error': 'Player not found in database.'})
    }
```

**Incomplete Data (500):**
```python
if not annual_stats or not worst_game_stats:
    return {
        'statusCode': 500,
        'body': json.dumps({'error': 'Database item is incomplete. Missing stats.'})
    }
```

## Testing Strategy

### Unit Testing
- Test `postStatefulChatMessage` with valid and invalid inputs
- Test chat history state management in `RiftAI.tsx`
- Test error handling for network failures and API errors

### Integration Testing
- Test complete flow: user question → API call → Lambda → Bedrock → response
- Test multi-turn conversation with chat history
- Test error scenarios (missing player, network failure, etc.)

### Manual Testing Checklist
1. Load player data and verify `DefaultRoast` appears in chat
2. Ask a predefined question and verify AI responds
3. Ask a follow-up question and verify context is maintained
4. Test with invalid player ID and verify error handling
5. Test with network disconnected and verify error message
6. Test rapid-fire questions to ensure proper state management

## Performance Considerations

### Optimizations
- **Reduced Payload Size**: By removing redundant `playerData` from requests, we reduce payload size by ~90% (from ~50KB to ~5KB)
- **Server-Side Data Fetching**: Lambda fetches fresh data from DynamoDB, ensuring consistency
- **Efficient Chat History**: Only send necessary conversation context (last N messages if needed)

### Potential Future Improvements
- Implement chat history truncation for very long conversations (keep last 10 messages)
- Add request debouncing to prevent duplicate API calls
- Implement optimistic UI updates (show user message immediately)
- Add retry logic for transient network errors

## Security Considerations

- **Data Validation**: Lambda validates all required fields before processing
- **CORS Configuration**: Proper CORS headers are set in Lambda responses
- **Error Message Sanitization**: Error messages don't expose sensitive system information
- **Player ID Verification**: Lambda verifies player exists in DynamoDB before processing

## Migration Notes

### Breaking Changes
- `postStatefulChatMessage` function signature changes (removes `playerData` parameter)
- Request body structure changes completely
- Response field name changes from `aiAnswer` to `aiResponse`

### Backward Compatibility
- No backward compatibility needed (this is a bug fix, not a feature change)
- Old API endpoint (if exists) can remain for other purposes

### Deployment Steps
1. Update frontend code (`awsService.ts` and `RiftAI.tsx`)
2. Test locally with development Lambda endpoint
3. Deploy frontend to production
4. Verify chat functionality works end-to-end
5. Monitor CloudWatch logs for any errors
