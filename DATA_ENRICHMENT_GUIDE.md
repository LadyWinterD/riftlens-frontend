# 📊 数据增强更新指南

## 概述

这个脚本会**保持你现有的数据结构**，只添加 AI 分析需要的缺失字段。

## ✅ 会添加的字段

### 比赛元数据
- `gameCreation` - 比赛时间戳
- `gameDuration` - 比赛时长

### 玩家数据
- `champLevel` - 英雄等级
- `teamId` - 队伍 ID
- `neutralMinionsKilled` - 野怪数
- `totalMinionsKilled` - 总补刀
- `goldEarned` - 金币

### 视野数据
- `wardsPlaced` - 插眼数
- `wardsKilled` - 排眼数

### 伤害数据
- `physicalDamageDealtToChampions` - 物理伤害
- `magicDamageDealtToChampions` - 魔法伤害
- `totalDamageTaken` - 承受伤害
- `damageSelfMitigated` - 伤害减免

### 团队贡献
- `turretKills` - 推塔数
- `objectivesStolen` - 抢龙数

### 符文
- `perks` - 符文对象

### 全部 10 人数据（关键！）
- `participants` - 数组，包含该场比赛所有 10 名玩家的数据

## 🚀 使用步骤

### 步骤 1: 创建 StaticData 表

```bash
aws dynamodb create-table \
    --table-name RiftLensStaticData \
    --attribute-definitions AttributeName=DataKey,AttributeType=S \
    --key-schema AttributeName=DataKey,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region ap-southeast-2
```

### 步骤 2: 更新 API 密钥

在 `data_enrichment_updater.py` 第 11 行：

```python
RIOT_API_KEY = "RGAPI-your-actual-key-here"
```

### 步骤 3: 运行脚本

```bash
python data_enrichment_updater.py
```

脚本会：
1. ✅ 获取 Data Dragon 静态数据
2. ✅ 扫描 `PlayerReports` 表中的所有玩家
3. ✅ 为每场比赛添加缺失字段
4. ✅ 添加全部 10 人数据（用于 AI 对比分析）
5. ✅ 更新回 DynamoDB

## 📊 数据结构对比

### 之前 ❌
```json
{
  "matchId": "EUW1_7557497334",
  "win": false,
  "championName": "Shaco",
  "kills": 4,
  "deaths": 4,
  "assists": 1,
  "visionScore": 11,
  "cs": 99,
  "gold": 7076,
  "damage": 5322,
  "position": "JUNGLE"
}
```

### 之后 ✅
```json
{
  "matchId": "EUW1_7557497334",
  "win": false,
  "championName": "Shaco",
  "kills": 4,
  "deaths": 4,
  "assists": 1,
  "visionScore": 11,
  "cs": 99,
  "gold": 7076,
  "damage": 5322,
  "position": "JUNGLE",
  
  // 新增字段
  "gameCreation": 1699123456789,
  "gameDuration": 1823,
  "champLevel": 18,
  "teamId": 100,
  "neutralMinionsKilled": 20,
  "wardsPlaced": 15,
  "wardsKilled": 8,
  "physicalDamageDealtToChampions": 4000,
  "magicDamageDealtToChampions": 1322,
  "totalDamageTaken": 18000,
  "damageSelfMitigated": 12000,
  "turretKills": 2,
  "objectivesStolen": 1,
  "perks": {...},
  
  // 全部 10 人数据（用于 AI 对比）
  "participants": [
    {
      "puuid": "player1_puuid",
      "summonerName": "Player1",
      "championName": "Shaco",
      "position": "JUNGLE",
      "teamId": 100,
      "kills": 4,
      "deaths": 4,
      "assists": 1,
      // ... 完整数据
    },
    {
      "puuid": "player2_puuid",
      "summonerName": "Opponent",
      "championName": "Lee Sin",
      "position": "JUNGLE",
      "teamId": 200,
      "kills": 10,
      "deaths": 2,
      "assists": 8,
      // ... 完整数据
    }
    // ... 其他 8 名玩家
  ]
}
```

## 🎯 AI 分析能力

有了 `participants` 数组后，AI 可以：

1. **自动识别对线对手**
   - 找到相同位置、不同队伍的玩家
   - 对比 CS、伤害、视野、金币

2. **量化对线差距**
   ```
   你的 CS: 99
   对手 CS: 150
   差距: -51 刀
   ```

3. **提供具体建议**
   ```
   "你的对手 Lee Sin 比你多 51 刀，建议：
   - 对线期多用 Q 补刀
   - 避免被 Lee Sin 反野
   - 控制河道蟹视野"
   ```

## ⚠️ 注意事项

### API 调用量
- 每场比赛需要 1 次 API 调用
- 如果你有 100 个玩家，每人 10 场比赛 = 1000 次调用
- 限速: 100 次/120 秒
- 预计时间: ~20 分钟（1000 场比赛）

### 数据安全
- 脚本会保留所有现有数据
- 只添加新字段，不删除任何内容
- 如果 API 调用失败，保留原数据

### 去重机制
- 如果比赛已经有 `participants` 字段，会跳过
- 可以多次运行脚本，只处理未增强的比赛

## 🔍 验证

运行完成后，检查 DynamoDB：

```python
import boto3
dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2')
table = dynamodb.Table('PlayerReports')

response = table.get_item(Key={'PlayerID': 'your_puuid'})
player = response['Item']

# 检查第一场比赛
first_match = player['matchHistory'][0]
print('gameCreation' in first_match)  # 应该是 True
print('participants' in first_match)  # 应该是 True
print(len(first_match['participants']))  # 应该是 10
```

## 📞 故障排查

### 问题 1: 表不存在
```
错误: ResourceNotFoundException
解决: 运行步骤 1 创建 StaticData 表
```

### 问题 2: API 密钥无效
```
错误: 401 Unauthorized
解决: 更新 RIOT_API_KEY
```

### 问题 3: 权限不足
```
错误: AccessDeniedException
解决: 检查 AWS 凭证 (aws configure)
```

## ✅ 完成后

1. 数据已增强 ✅
2. AI 可以做对线对比分析 ✅
3. 可以部署增强版 Lambda ✅

查看 `lambda_chatbot_enhanced.py` 了解如何使用增强后的数据。
