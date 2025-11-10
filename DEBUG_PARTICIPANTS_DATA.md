# 调试 Participants 数据问题

## 问题

你说数据已经爬完了，但是前端仍然显示 "SIMPLIFIED VIEW"，说明 `matchData.participants` 不存在或长度不是 10。

## 调试步骤

### 步骤 1: 检查 DynamoDB 中的原始数据

在 AWS Console 或使用 AWS CLI 检查一条比赛记录：

```bash
aws dynamodb get-item \
  --table-name PlayerReports \
  --key '{"PlayerID": {"S": "YOUR_PLAYER_ID"}}' \
  --region ap-southeast-2 \
  --output json > player_data.json
```

然后检查 `player_data.json` 中的 `matchHistory[0].participants`：

```bash
# 在 Windows PowerShell 中
cat player_data.json | jq '.Item.matchHistory.L[0].M.participants'
```

**预期结果**：应该看到一个包含 10 个对象的数组。

**如果没有 `participants` 字段**：
- 你的数据爬取脚本可能没有正确运行
- 或者你使用的是旧的爬取脚本（不包含 participants）

### 步骤 2: 检查前端接收到的数据

1. 打开浏览器（http://localhost:3000）
2. 打开开发者工具（F12）
3. 切换到 Console 标签
4. 搜索或加载玩家数据
5. 在控制台中输入：

```javascript
// 检查原始 playerData
console.log('Raw playerData:', playerData);
console.log('First match:', playerData.matchHistory[0]);
console.log('First match participants:', playerData.matchHistory[0].participants);
console.log('Participants length:', playerData.matchHistory[0].participants?.length);
```

**预期结果**：
- `participants` 应该存在
- `participants.length` 应该是 10

**如果 `participants` 是 `undefined`**：
- 数据在 DynamoDB 中不存在
- 或者 Lambda 读取数据时出错

### 步骤 3: 检查 Matches 数组转换

在控制台中检查转换后的 `Matches` 数组：

```javascript
// 在浏览器控制台中
console.log('Matches array:', Matches);
console.log('First match:', Matches[0]);
console.log('First match participants:', Matches[0].participants);
```

**预期结果**：
- `Matches[0].participants` 应该存在
- 长度应该是 10

**如果 `participants` 丢失了**：
- 检查 `page.js` 中的数据转换逻辑（第 341 行）
- 确保 `...match` 展开运算符正确保留了所有字段

### 步骤 4: 检查 selectedMatch

当你点击一场比赛时，在控制台中检查：

```javascript
// 点击比赛后，在控制台中
console.log('Selected match:', selectedMatch);
console.log('Selected match participants:', selectedMatch.participants);
console.log('Participants length:', selectedMatch.participants?.length);
```

**预期结果**：
- `selectedMatch.participants` 应该存在
- 长度应该是 10

**如果 `participants` 丢失了**：
- 检查 `setSelectedMatch(match)` 传递的 `match` 对象
- 确保 `match` 来自正确的数组（`Matches` 或 `selectedChampMatches`）

### 步骤 5: 检查 CyberMatchDetailModal 接收到的数据

打开比赛详情后，查看控制台日志：

```
[CyberMatchDetailModal] matchData: {...}
[CyberMatchDetailModal] participants: [...]
[CyberMatchDetailModal] participants length: 10
[CyberMatchDetailModal] participants type: object
[CyberMatchDetailModal] has participants: true
```

**如果 `participants` 是 `undefined`**：
- 问题在数据传递链的某个环节
- 回到步骤 2-4 逐步排查

---

## 常见问题和解决方案

### 问题 1: DynamoDB 中没有 participants

**原因**：使用了旧的爬取脚本

**解决方案**：运行增强版爬取脚本

```bash
# 使用增强版爬取脚本
python crawler_enhanced.py

# 或者运行数据增强脚本来更新现有数据
python data_enrichment_updater.py
```

### 问题 2: participants 是空数组

**原因**：Riot API 调用失败或数据解析错误

**解决方案**：
1. 检查 Riot API Key 是否有效
2. 检查爬取脚本的日志
3. 重新爬取该玩家的数据

### 问题 3: participants 长度不是 10

**原因**：数据不完整或解析错误

**解决方案**：
1. 检查爬取脚本的 `participants` 提取逻辑
2. 确保从 Riot API 获取的是完整比赛数据
3. 检查是否有特殊游戏模式（ARAM、自定义等）

### 问题 4: 前端转换时丢失了 participants

**原因**：`page.js` 中的数据转换逻辑有问题

**解决方案**：

检查 `src/app/page.js` 第 341 行：

```javascript
const Matches = (playerData.matchHistory || []).map(match => ({
  ...match,  // ← 这应该保留所有字段，包括 participants
  // 其他转换...
}));
```

如果需要，可以显式保留 `participants`：

```javascript
const Matches = (playerData.matchHistory || []).map(match => ({
  ...match,
  participants: match.participants || [],  // 显式保留
  // 其他转换...
}));
```

### 问题 5: 数据类型问题

**原因**：DynamoDB 返回的数据结构不符合预期

**解决方案**：

检查 Lambda 读取函数（`lambda_read.py` 或类似）：

```python
# 确保正确转换 DynamoDB 类型
def convert_dynamodb_to_json(item):
    # 处理 List 类型
    if 'participants' in item:
        participants = []
        for p in item['participants']:
            # 转换每个 participant...
            participants.append(convert_participant(p))
        item['participants'] = participants
    return item
```

---

## 快速验证脚本

创建一个测试脚本来快速检查数据：

```python
# test_participants.py
import boto3
import json

dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-2')
table = dynamodb.Table('PlayerReports')

# 替换为你的玩家 ID
player_id = 'YOUR_PLAYER_ID'

response = table.get_item(Key={'PlayerID': player_id})
item = response.get('Item')

if item:
    match_history = item.get('matchHistory', [])
    print(f"Total matches: {len(match_history)}")
    
    if match_history:
        first_match = match_history[0]
        print(f"\nFirst match ID: {first_match.get('matchId')}")
        print(f"Has participants: {'participants' in first_match}")
        
        if 'participants' in first_match:
            participants = first_match['participants']
            print(f"Participants count: {len(participants)}")
            print(f"First participant: {participants[0].get('championName')}")
        else:
            print("❌ No participants field found!")
            print(f"Available fields: {list(first_match.keys())}")
else:
    print(f"❌ Player {player_id} not found in database")
```

运行：
```bash
python test_participants.py
```

---

## 预期的数据结构

### DynamoDB 中的比赛数据应该是：

```json
{
  "matchId": "EUW1_123456",
  "championName": "Volibear",
  "kills": 5,
  "deaths": 3,
  "assists": 8,
  "participants": [
    {
      "puuid": "...",
      "championName": "Volibear",
      "teamId": 100,
      "kills": 5,
      "deaths": 3,
      "assists": 8,
      "position": "TOP",
      "totalDamageDealtToChampions": 25000,
      "totalDamageTaken": 30000
    },
    // ... 其他 9 名玩家
  ]
}
```

### 前端 matchData 应该是：

```javascript
{
  matchId: "EUW1_123456",
  championName: "Volibear",
  kills: 5,
  deaths: 3,
  assists: 8,
  participants: [
    {
      championName: "Volibear",
      teamId: 100,
      kills: 5,
      deaths: 3,
      assists: 8,
      position: "TOP",
      totalDamageDealtToChampions: 25000,
      totalDamageTaken: 30000
    },
    // ... 其他 9 名玩家
  ]
}
```

---

## 下一步

1. **运行步骤 1-5** 来定位问题
2. **根据发现的问题** 选择对应的解决方案
3. **重新测试** 确认修复

如果完成所有步骤后仍然有问题，请提供：
- 步骤 2 的控制台输出
- 步骤 5 的控制台日志
- 一个示例比赛的完整数据结构

这样我可以更精确地帮你定位问题！
