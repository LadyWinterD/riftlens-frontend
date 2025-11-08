// [!!] V21 兼容的 AWS 服务层 [!!]

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_API_URL;

// ##############################################################
// 1. 数据 API (您的 searchSummoner 保持不变)
// ##############################################################

/**
 * [V7.3] 从 'riftlens-read' Lambda (GET /report) 获取玩家数据
 */
export const searchSummoner = async (playerID: string) => {

  const endpoint = `${API_URL}/report?playerID=${playerID}`;

  console.log(`[V21 searchSummoner] Calling: ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`[${response.status}] ${errorData.message || 'Failed to fetch player data'}`);
    }

    const data = await response.json();
    console.log('[V21 searchSummoner] AWS Data Received:', data);
    return data; // (这是完整的 'PlayerReports' 表中的 JSON)
    
  } catch (error) {
    console.error('[V21 searchSummoner] Network or Fetch Error:', error);
    throw error;
  }
};


// ##############################################################
// 2. 聊天 API (有状态)
// ##############################################################

// (定义与 Lambda V2 匹配的类型)
export interface ChatMessage {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

interface ChatResponse {
  aiResponse: string;
}

interface ErrorResponse {
  error: string;
}

/**
 * [V21] 调用 'riftlens-chat' Lambda (POST /chat) 以获取“有状态”的回复
 * * 这 *替换* 了您 V7.3 的 getAIResponse，
 * 因为它现在 100% 兼容我们的 Lambda V2
 */
export const postStatefulChatMessage = async (
  playerId: string,
  userMessage: string,
  chatHistory: ChatMessage[],
  playerData?: any  // 添加可选的完整玩家数据以兼容旧 Lambda
): Promise<string> => {

  if (!CHAT_URL) {
    console.error('[V21 postStatefulChatMessage] CHAT_URL is not defined. Check .env.local');
    return "[FATAL ERROR] AI Chat URL not configured.";
  }

  console.log(`[V21 postStatefulChatMessage] Calling: ${CHAT_URL}`);
  console.log(`[V21 postStatefulChatMessage] PlayerID: ${playerId}`);
  
  // 临时使用旧格式以通过 API Gateway 验证器
  // 如果提供了完整的 playerData，使用它；否则只发送 PlayerID
  const requestBody = {
    question: userMessage,
    data: playerData ? {
      ...playerData,  // 包含完整的玩家数据（annualStats, worstGameStats 等）
      chatHistory: chatHistory
    } : {
      PlayerID: playerId,
      playerId: playerId,
      chatHistory: chatHistory
    }
  };
  
  console.log(`[V21 postStatefulChatMessage] Request body (OLD FORMAT):`, JSON.stringify(requestBody, null, 2));
  console.log(`[V21 postStatefulChatMessage] Chat history length:`, chatHistory.length);

  try {

    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    console.log(`[V21 postStatefulChatMessage] Response status: ${response.status}`);
    console.log(`[V21 postStatefulChatMessage] Response ok: ${response.ok}`);
    
    const responseData: ChatResponse | ErrorResponse = await response.json();
    console.log(`[V21 postStatefulChatMessage] Response data:`, JSON.stringify(responseData, null, 2));
    console.log(`[V21 postStatefulChatMessage] Response has aiResponse:`, 'aiResponse' in responseData);
    console.log(`[V21 postStatefulChatMessage] Response has error:`, 'error' in responseData);

    if (!response.ok) {
      const errorMsg = (responseData as ErrorResponse).error || 'AI analysis failed';
      console.error('[V21 postStatefulChatMessage] API Error Response:', errorMsg);
      console.error('[V21 postStatefulChatMessage] Full error response:', JSON.stringify(responseData, null, 2));
      throw new Error(`[${response.status}] ${errorMsg}`);
    }
    
    // Lambda 可能返回 aiResponse 或 aiAnswer 字段（兼容性）
    const aiResponse = (responseData as ChatResponse).aiResponse || (responseData as any).aiAnswer;
    return aiResponse || '[AI ERROR] Received empty response.';

  } catch (error) {
    console.error('[V21 postStatefulChatMessage] Network or Fetch Error:', error);
    throw error;
  }
};