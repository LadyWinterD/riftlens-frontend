# 修复缺失的 Participants 数据

## 问题

当你点击比赛详情并尝试获取 AI 战术分析时，出现错误：
```
Full 10-player data not available. Tactical analysis disabled.
```

## 原因

你的 `matchHistory` 数据是旧格式，不包含 `participants` 数组（10人完整数据）。

战术分析需要：
- 双方阵容（10个英雄）
- 每个玩家的 KDA、伤害、承伤等数据
- 用于分析敌方阵容类型（Full AD、Heavy AP 等）

## 解决方案

### 方案 1: 重新抓取数据（推荐）

运行数据增强脚本来为现有比赛添加 `participants` 字段：

```bash
python data_enrichment_updater.py
```

这个脚本会：
1. 扫描 DynamoDB 中的所有玩家
2. 检查每场比赛是否有 `participants` 字段
3. 如果没有，从 Riot API 重新获取完整比赛数据
4. 添加所有 10 名玩家的详细信息

**注意**: 这会消耗 Riot API 配额，每场比赛 1 次调用。

### 方案 2: 降级到简化分析（临时方案）

如果你不想重新抓取数据，可以修改前端，在没有 `participants` 数据时使用简化的分析模式。

修改 `src/components/CyberMatchDetailModal.tsx`：

```typescript
// AI Analysis function
const handleAIAnalysis = async () => {
  if (!fullPlayerData) {
    setAnalysisError('Player data not available. Cannot perform analysis.');
    return;
  }

  setIsAnalyzing(true);
  setAnalysisError(null);
  setAiAnalysis(null);

  try {
    const hasFullMatchData = matchData.participants && matchData.participants.length === 10;
    
    if (hasFullMatchData) {
      // 完整战术分析（有 10 人数据）
      const playerTeamId = matchData.teamId;
      const enemyTeamId = playerTeamId === 100 ? 200 : 100;
      
      // ... 构建 gameDataForAI ...
      
      const aiResponse = await getTacticalAnalysis(
        fullPlayerData.PlayerID || playerPuuid,
        gameDataForAI,
        [],
        fullPlayerData
      );
      
      setAiAnalysis(aiResponse);
    } else {
      // 简化分析（只有玩家自己的数据）
      const simplifiedQuestion = `Analyze my performance in this match:
      
Champion: ${matchData.championName}
Result: ${matchData.win ? 'Victory' : 'Defeat'}
KDA: ${matchData.kills}/${matchData.deaths}/${matchData.assists}
CS: ${matchData.cs} (${matchData.csPerMin?.toFixed(1)} per min)
Damage Dealt: ${matchData.damage?.toLocaleString()}
Damage Taken: ${matchData.totalDamageTaken?.toLocaleString()}
Vision Score: ${matchData.visionScore}
Game Duration: ${Math.floor((matchData.gameDurationInSec || 0) / 60)} minutes

Provide tactical insights based on this data.`;

      const aiResponse = await postStatefulChatMessage(
        fullPlayerData.PlayerID || playerPuuid,
        simplifiedQuestion,
        [],
        fullPlayerData
      );
      
      setAiAnalysis(aiResponse);
    }
  } catch (error: any) {
    console.error('AI Analysis error:', error);
    setAnalysisError(error.message || 'AI analysis failed. Please try again.');
  } finally {
    setIsAnalyzing(false);
  }
};
```

### 方案 3: 检查数据格式

在浏览器控制台中检查你的比赛数据：

```javascript
// 打开浏览器控制台（F12）
// 点击任意比赛
// 查看输出
console.log(matchData);
console.log(matchData.participants);
```

如果 `participants` 是 `undefined`，说明需要重新抓取数据。

## 验证修复

修复后，你应该能看到：

1. 点击比赛详情
2. 点击 "GET AI INSIGHTS"
3. AI 分析包含：
   - 🐉 THREAT ASSESSMENT（敌方阵容分析）
   - 🛡️ ROLE CONFIRMATION（你的团队角色）
   - ⚔️ LANE STRATEGY（对线策略）
   - 💀 EXECUTION & BUILD REVIEW（执行和装备评估）
   - 📊 WIN CONDITION ATTRIBUTION（胜负归因）

## 数据结构对比

### 旧格式（没有 participants）
```json
{
  "matchId": "EUW1_123456",
  "championName": "Volibear",
  "kills": 1,
  "deaths": 9,
  "assists": 2,
  "cs": 180,
  "damage": 15000
  // ❌ 没有 participants 字段
}
```

### 新格式（有 participants）
```json
{
  "matchId": "EUW1_123456",
  "championName": "Volibear",
  "kills": 1,
  "deaths": 9,
  "assists": 2,
  "cs": 180,
  "damage": 15000,
  "participants": [  // ✅ 包含所有 10 名玩家
    {
      "puuid": "...",
      "championName": "Volibear",
      "teamId": 100,
      "kills": 1,
      "deaths": 9,
      "assists": 2,
      "totalDamageDealtToChampions": 15000,
      "totalDamageTaken": 35000,
      "position": "TOP"
    },
    // ... 其他 9 名玩家
  ]
}
```

## 推荐行动

1. **立即**: 使用方案 2（降级分析）让功能先能用
2. **长期**: 运行 `data_enrichment_updater.py` 来增强所有比赛数据
3. **未来**: 确保新抓取的数据使用 `crawler_enhanced.py`（自动包含 participants）

## 相关文件

- `data_enrichment_updater.py` - 数据增强脚本
- `crawler_enhanced.py` - 增强版爬虫（新数据自动包含 participants）
- `src/components/CyberMatchDetailModal.tsx` - 前端比赛详情组件
- `lambda_chatbot_updated.py` - 后端 AI 分析 Lambda

---

修复完成后，你的战术分析功能就能正常工作了！🎉
