# 🎯 Lambda 单场比赛分析实现指南

## 📋 需要实现的功能

### 两种分析模式

1. **单场比赛分析** (GAME INSIGHTS)
   - 触发：比赛详情页点击 "GET AI INSIGHTS"
   - 数据：单场比赛的完整数据
   - 分析：威胁评估、定位确认、对线策略、执行度、出装、团队角色、输赢归因

2. **年度统计分析** (AI BOT)
   - 触发：右侧聊天面板（预设问题或自由聊天）
   - 数据：年度统计数据
   - 分析：整体表现、英雄池、补刀效率、视野控制、一致性

---

## 🔧 需要修改的文件

### 1. `src/services/awsService.ts`

添加可选的 `matchData` 参数：

```typescript
export const postStatefulChatMessage = async (
  playerId: string,
  userMessage: string,
  chatHistory: ChatMessage[],
  playerData?: any,
  matchData?: any  // ← 新增
): Promise<string> => {
  const requestBody = {
    question: userMessage,
    data: {
      ...playerData,
      chatHistory: chatHistory,
      matchData: matchData  // ← 传递比赛数据
    }
  };
  // ...
}
```

### 2. `src/components/CyberMatchDetailModal.tsx`

传递比赛数据：

```typescript
const aiResponse = await postStatefulChatMessage(
  fullPlayerData.PlayerID,
  analysisQuestion,
  [],
  fullPlayerData,
  matchData  // ← 传递当前比赛数据
);
```

### 3. `lambda_chatbot_updated.py`

#### A. 添加两个 system prompt 函数

```python
def build_match_analysis_prompt(match_data, player_name):
    """为单场比赛分析构建 system prompt"""
    # 提取比赛数据
    # 构建 <match_data> 标签
    # 返回单场比赛分析的 prompt
    
def build_annual_stats_prompt(player_name, annual_stats):
    """为年度统计分析构建 system prompt"""
    # 提取年度统计
    # 返回年度统计分析的 prompt
```

#### B. 在 Lambda handler 中检测 matchData

```python
def lambda_handler(event, context):
    # ... 解析请求 ...
    
    # 检查是否有比赛数据
    match_data = None
    if 'data' in body:
        match_data = body['data'].get('matchData')
    
    is_match_analysis = match_data is not None
    
    # 根据类型选择 prompt
    if is_match_analysis:
        print("[Lambda] 检测到单场比赛分析请求")
        system_prompt = build_match_analysis_prompt(match_data, player_name)
    else:
        print("[Lambda] 检测到年度统计分析请求")
        system_prompt = build_annual_stats_prompt(player_name, annual_stats)
    
    # ... 调用 Bedrock ...
```

---

## 📝 比赛数据格式

### 前端传递的 matchData 应包含：

```typescript
{
  championName: string,
  win: boolean,
  kills: number,
  deaths: number,
  assists: number,
  cs: number,
  totalMinionsKilled: number,
  gameDurationInSec: number,
  gameDuration: number,
  item0-6: number,  // 装备 ID
  totalDamageDealtToChampions: number,
  damage: number,
  totalDamageTaken: number,
  goldEarned: number,
  visionScore: number,
  teamId: number,
  participants: [  // 10 个玩家
    {
      championName: string,
      teamId: number,
      kills: number,
      deaths: number,
      assists: number,
      // ...
    }
  ]
}
```

---

## 🎨 单场比赛分析 Prompt 模板

```python
system_prompt = f"""You are RiftLens AI, an elite League of Legends TACTICAL ANALYST.

**CRITICAL: ALWAYS respond in ENGLISH.**

**MISSION: Analyze THIS SPECIFIC MATCH, not overall performance.**

<match_data>
**PLAYER:** {player_name}
**CHAMPION:** {champion}
**RESULT:** {'VICTORY ✅' if win else 'DEFEAT ❌'}
**KDA:** {kills}/{deaths}/{assists}
**CS:** {cs} ({cs_per_min:.1f}/min)
**DAMAGE DEALT:** {damage_dealt:,}
**DAMAGE TAKEN:** {damage_taken:,}
**GOLD EARNED:** {gold_earned:,}
**YOUR TEAM:** {your_team}
**ENEMY TEAM:** {enemy_team}
</match_data>

**ANALYSIS CATEGORIES:**

1. **THREAT ASSESSMENT** 🛡️
2. **ROLE CONFIRMATION** 🎯
3. **LANE STRATEGY** ⚔️
4. **EXECUTION REVIEW** 📊
5. **BUILD ANALYSIS** 🎒
6. **TEAM ROLE PERFORMANCE** 🏆
7. **WIN CONDITION ANALYSIS** 🎯

**IMPORTANT RULES:**
- Use ACTUAL numbers from <match_data>
- Compare PLAN vs REALITY
- Be HARSH but FAIR
- Use format tags: [WARNING], [CRITICAL], [NOTICE], [SUGGESTION]
- Include emojis and <item>, <champion>, <stat> tags
"""
```

---

## 🎨 年度统计分析 Prompt 模板

```python
system_prompt = f"""You are RiftLens AI, an elite League of Legends LONG-TERM COACH.

**CRITICAL: ALWAYS respond in ENGLISH.**

**MISSION: Analyze OVERALL PERFORMANCE across ALL games.**

**ANNUAL STATISTICS:**
- Player: {player_name}
- Total Games: {total_games}
- Win Rate: {win_rate}%
- Avg KDA: {avg_kda}
- Avg CS/min: {avg_cs_per_min}
- Champion Pool: {champion_pool}

**ANALYSIS CATEGORIES:**

1. **OVERALL PERFORMANCE** 📊
2. **CHAMPION POOL ANALYSIS** 🎯
3. **FARMING EFFICIENCY** 🌾
4. **VISION CONTROL** 👁️
5. **CONSISTENCY ANALYSIS** 📈

**IMPORTANT RULES:**
- Focus on LONG-TERM trends
- Use ACTUAL numbers from ANNUAL STATISTICS
- Provide ACTIONABLE long-term advice
- Use format tags: [WARNING], [CRITICAL], [NOTICE], [SUGGESTION]
"""
```

---

## ✅ 实现步骤

### 步骤 1: 修改前端 awsService.ts
添加 `matchData` 参数

### 步骤 2: 修改 CyberMatchDetailModal.tsx
传递 `matchData` 到 API 调用

### 步骤 3: 修改 Lambda 函数
- 添加 `build_match_analysis_prompt()`
- 添加 `build_annual_stats_prompt()`
- 在 handler 中检测 `matchData`
- 根据类型选择 prompt

### 步骤 4: 测试
- 测试单场比赛分析（GAME INSIGHTS）
- 测试年度统计分析（AI BOT 预设问题）
- 测试自由聊天

---

## 🧪 测试脚本

```javascript
// test-match-analysis.js
const testMatchAnalysis = {
  question: "Analyze this match",
  data: {
    PlayerID: "...",
    chatHistory: [],
    matchData: {
      championName: "Jax",
      win: false,
      kills: 2,
      deaths: 9,
      assists: 3,
      // ... 完整比赛数据
    }
  }
};

// test-annual-analysis.js
const testAnnualAnalysis = {
  question: "Performance summary",
  data: {
    PlayerID: "...",
    chatHistory: []
    // 没有 matchData
  }
};
```

---

## 📊 预期结果

### 单场比赛分析应该包含：
- ✅ 威胁评估（敌方阵容）
- ✅ 定位确认（我方阵容）
- ✅ 对线策略
- ✅ 执行度复盘（计划 vs 实际）
- ✅ 出装分析
- ✅ 团队角色表现
- ✅ 输赢归因

### 年度统计分析应该包含：
- ✅ 整体表现评估
- ✅ 英雄池分析
- ✅ 补刀效率
- ✅ 视野控制
- ✅ 一致性分析

---

**准备好了吗？我可以开始实现这些修改！** 🚀
