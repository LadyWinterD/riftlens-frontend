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
  playerId: string, // [!! 关键 !!] 我们只发送 ID
  userMessage: string,
  chatHistory: ChatMessage[] // [!! 关键 !!] 我们发送聊天记录
): Promise<string> => {

  if (!CHAT_URL) {
    console.error('[V21 postStatefulChatMessage] CHAT_URL is not defined. Check .env.local');
    return "[FATAL ERROR] AI Chat URL not configured.";
  }

  console.log(`[V21 postStatefulChatMessage] Calling: ${CHAT_URL}`);

  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // 100% 遵循 V21 Lambda (V2 版) 的要求
        playerId: playerId,
        userMessage: userMessage,
        chatHistory: chatHistory 
      })
    });

    const responseData: ChatResponse | ErrorResponse = await response.json();

    if (!response.ok) {
      const errorMsg = (responseData as ErrorResponse).error || 'AI analysis failed';
      console.error('[V21 postStatefulChatMessage] API Error Response:', errorMsg);
      throw new Error(`[${response.status}] ${errorMsg}`);
    }
    
    // 100% 遵循 V21 Lambda (V2 版) 的返回格式
    return (responseData as ChatResponse).aiResponse || '[AI ERROR] Received empty response.';

  } catch (error) {
    console.error('[V21 postStatefulChatMessage] Network or Fetch Error:', error);
    throw error;
  }
};