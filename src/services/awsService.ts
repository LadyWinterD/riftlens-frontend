// [!!] V21 兼容的 AWS 服务层 [!!]

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_API_URL;

// ##############################################################
// 1. 数据 API
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
    return data;
    
  } catch (error) {
    console.error('[V21 searchSummoner] Network or Fetch Error:', error);
    throw error;
  }
};

// ##############################################################
// 2. 聊天 API (有状态)
// ##############################################################

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
 * [V21] 调用 'riftlens-chat' Lambda (POST /chat) 以获取"有状态"的回复
 */
export const postStatefulChatMessage = async (
  playerId: string,
  userMessage: string,
  chatHistory: ChatMessage[],
  playerData?: any
): Promise<string> => {
  if (!CHAT_URL) {
    console.error('[V21 postStatefulChatMessage] CHAT_URL is not defined. Check .env.local');
    return "[FATAL ERROR] AI Chat URL not configured.";
  }

  console.log(`[V21 postStatefulChatMessage] Calling: ${CHAT_URL}`);
  console.log(`[V21 postStatefulChatMessage] PlayerID: ${playerId}`);
  
  const requestBody = {
    question: userMessage,
    data: playerData ? {
      ...playerData,
      chatHistory: chatHistory
    } : {
      PlayerID: playerId,
      playerId: playerId,
      chatHistory: chatHistory
    }
  };
  
  console.log(`[V21 postStatefulChatMessage] Request body:`, JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const responseData: ChatResponse | ErrorResponse = await response.json();

    if (!response.ok) {
      const errorMsg = (responseData as ErrorResponse).error || 'AI analysis failed';
      throw new Error(`[${response.status}] ${errorMsg}`);
    }
    
    const aiResponse = (responseData as ChatResponse).aiResponse || (responseData as any).aiAnswer;
    return aiResponse || '[AI ERROR] Received empty response.';

  } catch (error) {
    console.error('[V21 postStatefulChatMessage] Network or Fetch Error:', error);
    throw error;
  }
};

// ##############################################################
// 3. 战术分析 API
// ##############################################################

interface ScoreboardData {
  kda: string;
  cs: number;
  csPerMin: number;
  gameDurationMinutes: number;
  finalItems: (number | string)[];
  damageDealt: number;
  damageTaken: number;
  visionScore: number;
  championLevel: number;
}

interface TeamParticipant {
  championName: string;
  role: string;
  kda: string;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
}

interface GameAnalysisData {
  myTeam: TeamParticipant[];
  enemyTeam: TeamParticipant[];
  player: {
    championName: string;
    role: string;
    scoreboard: ScoreboardData;
  };
  gameResult: "Win" | "Loss";
}

/**
 * 获取单场比赛的战术分析
 * @param playerId - 玩家 ID
 * @param gameData - 比赛详细数据
 * @param chatHistory - 聊天历史
 * @param playerData - 完整玩家数据
 * @returns AI 战术分析结果
 */
export const getTacticalAnalysis = async (
  playerId: string,
  gameData: GameAnalysisData,
  chatHistory: ChatMessage[],
  playerData?: any
): Promise<string> => {
  const gameDataString = JSON.stringify(gameData, null, 2);
  
  const specialUserMessage = `Here is the match data. Please provide a BRUTALLY HONEST tactical analysis
based on my performance, my team comp, the enemy comp, and my build.
Follow the analysis categories from your system instructions.

<match_data>
${gameDataString}
</match_data>`;

  return postStatefulChatMessage(
    playerId,
    specialUserMessage,
    chatHistory,
    playerData
  );
};
