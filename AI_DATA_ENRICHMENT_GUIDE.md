# AI 数据增强功能 - 部署和使用指南

## 📋 概述

这个增强功能为 RiftLens AI 添加了完整的 10 人比赛数据分析能力，包括：
- ✅ 比赛时间戳和时长
- ✅ 英雄等级、野怪数、视野细节
- ✅ 伤害细分（物理/魔法/承受/减免）
- ✅ 符文数据
- ✅ 团队贡献（推塔、抢龙）
- ✅ 对线对手对比分析
- ✅ 静态数据翻译（英雄名、装备名、技能名）

## 🚀 部署步骤

### 1. 创建 DynamoDB 表

#### 1.1 创建 StaticData 表

```bash
aws dynamodb create-table \
    --table-name RiftLensStaticData \
    --attribute-definitions AttributeName=DataKey,AttributeType=S \
    --key-schema AttributeName=DataKey,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

#### 1.2 更新 Players 表（如果需要）

如果你的现有表名不是 `RiftLensPlayers`，需要在 `crawler_enhanced.py` 中修改 `DYNAMODB_TABLE_NAME`。

### 2. 安装依赖

```bash
pip install boto3 requests
```

### 3. 配置 AWS 凭证

确保你的 AWS 凭证已配置：

```bash
aws configure
```

或者设置环境变量：

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### 4. 更新 API 密钥

在 `crawler_enhanced.py` 第 12 行，替换为你的有效 Riot API 密钥：

```python
RIOT_API_KEY = "RGAPI-your-actual-key-here"
```

### 5. 运行增强爬虫

```bash
python crawler_enhanced.py
```

爬虫会：
1. 首先获取并存储 Data Dragon 静态数据到 DynamoDB
2. 为每个种子玩家获取比赛列表
3. 为每场比赛提取完整的 10 人数据
4. 计算衍生指标（csPerMin, visionPerMin, killParticipation）
5. 存储到 DynamoDB，自动去重

### 6. 部署增强 Lambda 函数

#### 6.1 创建部署包

```bash
mkdir lambda_package
cd lambda_package
pip install boto3 -t .
cp ../lambda_chatbot_enhanced.py lambda_function.py
zip -r lambda_deployment.zip .
```

#### 6.2 更新 Lambda 函数

```bash
aws lambda update-function-code \
    --function-name RiftLensAIChatbot \
    --zip-file fileb://lambda_deployment.zip \
    --region ap-southeast-2
```

#### 6.3 更新环境变量

```bash
aws lambda update-function-configuration \
    --function-name RiftLensAIChatbot \
    --environment Variables={
        DYNAMODB_PLAYERS_TABLE=RiftLensPlayers,
        DYNAMODB_STATIC_TABLE=RiftLensStaticData,
        DYNAMODB_REGION=us-east-1
    } \
    --region ap-southeast-2
```

## 📊 数据结构

### DynamoDB Players 表结构

```json
{
  "PlayerID": "puuid_string",
  "playerName": "SummonerName#TAG",
  "matchHistory": [
    {
      "matchId": "EUW1_7557497334",
      "gameCreation": 1699123456789,
      "gameDuration": 1823,
      "gameMode": "CLASSIC",
      "queueId": 420,
      "participants": [
        {
          "puuid": "player_puuid",
          "summonerName": "PlayerName",
          "championName": "Yasuo",
          "champLevel": 18,
          "individualPosition": "MIDDLE",
          "teamId": 100,
          "win": true,
          "kills": 10,
          "deaths": 5,
          "assists": 8,
          "goldEarned": 15000,
          "totalMinionsKilled": 250,
          "neutralMinionsKilled": 20,
          "visionScore": 35,
          "wardsPlaced": 15,
          "wardsKilled": 8,
          "totalDamageDealtToChampions": 25000,
          "physicalDamageDealtToChampions": 20000,
          "magicDamageDealtToChampions": 5000,
          "totalDamageTaken": 18000,
          "damageSelfMitigated": 12000,
          "item0": 3031,
          "item1": 3153,
          "item2": 6672,
          "item3": 3046,
          "item4": 3172,
          "item5": 3036,
          "item6": 3340,
          "summoner1Id": 4,
          "summoner2Id": 14,
          "perks": {...},
          "turretKills": 3,
          "objectivesStolen": 1,
          "csPerMin": 8.2,
          "visionPerMin": 1.15,
          "killParticipation": 0.72
        }
        // ... 其他 9 名玩家
      ]
    }
    // ... 更多比赛
  ]
}
```

### StaticData 表结构

```json
{
  "DataKey": "DDRAGON_CHAMPIONS",
  "Data": "{...champion.json content...}",
  "Version": "14.23.1",
  "UpdatedAt": 1699123456
}
```

## 🎯 API 使用

### 前端调用示例

```javascript
const response = await fetch('https://your-api-gateway-url/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    playerId: 'player_puuid',
    matchId: 'EUW1_7557497334',  // 可选：指定要分析的比赛
    userMessage: '分析我的对线表现',
    chatHistory: []
  })
});

const data = await response.json();
console.log(data.aiResponse);
```

## 🔍 AI 分析能力

增强后的 AI 现在可以：

1. **对线对比分析**
   - 自动识别对线对手
   - 对比 CS、伤害、视野、金币差距
   - 提供具体的对线改进建议

2. **深度数据洞察**
   - 分析伤害构成（物理 vs 魔法）
   - 评估视野控制（插眼、排眼）
   - 评估团队贡献（推塔、抢龙、击杀参与率）

3. **装备和符文分析**
   - 翻译装备 ID 为中文名称
   - 分析出装路线
   - 评估符文选择

4. **全局视角**
   - 访问所有 10 名玩家的数据
   - 对比团队整体表现
   - 识别游戏关键转折点

## 📈 性能优化

### 静态数据缓存

Lambda 函数会在内存中缓存静态数据，避免重复查询 DynamoDB：

```python
static_data_cache = {}  # 全局缓存
```

### 爬虫去重

爬虫会自动检查 matchId 是否已存在，避免重复爬取：

```python
if match_data['matchId'] not in match_ids:
    match_history.append(match_data)
```

### API 限速

爬虫严格遵守 Riot API 限制（100 次/120 秒）：

```python
CALLS_PER_PERIOD = 100
PERIOD_IN_SECONDS = 121
```

## 🐛 故障排查

### 问题 1: DynamoDB 表不存在

**错误**: `ResourceNotFoundException: Requested resource not found`

**解决**: 确保已创建 `RiftLensStaticData` 表

```bash
aws dynamodb list-tables --region us-east-1
```

### 问题 2: Lambda 无法访问 DynamoDB

**错误**: `AccessDeniedException`

**解决**: 为 Lambda 执行角色添加 DynamoDB 权限

```json
{
  "Effect": "Allow",
  "Action": [
    "dynamodb:GetItem",
    "dynamodb:PutItem",
    "dynamodb:Query"
  ],
  "Resource": [
    "arn:aws:dynamodb:us-east-1:*:table/RiftLensPlayers",
    "arn:aws:dynamodb:us-east-1:*:table/RiftLensStaticData"
  ]
}
```

### 问题 3: 静态数据未翻译

**错误**: 显示 "Item 3031" 而不是装备名称

**解决**: 
1. 检查 StaticData 表是否有数据
2. 运行爬虫的静态数据获取部分
3. 检查 Lambda 日志中的 `[StaticData]` 消息

### 问题 4: API 密钥过期

**错误**: `401 Unauthorized`

**解决**: 更新 `crawler_enhanced.py` 中的 `RIOT_API_KEY`

## 📝 下一步

1. ✅ 运行 `crawler_enhanced.py` 爬取数据
2. ✅ 部署 `lambda_chatbot_enhanced.py`
3. ✅ 测试 API 调用
4. ✅ 在前端集成新的分析功能
5. ⏳ 添加更多 AI 分析维度（符文推荐、出装建议等）

## 💡 提示

- 爬虫可以多次运行，会自动去重
- 建议每天运行一次爬虫，保持数据最新
- Lambda 函数的静态数据缓存会在冷启动时清空
- 可以通过 `matchId` 参数指定要分析的特定比赛

## 🎉 完成！

你的 RiftLens AI 现在拥有了完整的 10 人比赛数据分析能力！AI 可以进行深度的对线对比分析，提供更精准的改进建议。
