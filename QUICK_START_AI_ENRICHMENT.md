# 🚀 AI 数据增强 - 快速开始

## 3 步完成部署

### 步骤 1: 创建 DynamoDB 表 (1 分钟)

```bash
aws dynamodb create-table \
    --table-name RiftLensStaticData \
    --attribute-definitions AttributeName=DataKey,AttributeType=S \
    --key-schema AttributeName=DataKey,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1
```

### 步骤 2: 运行增强爬虫 (5-10 分钟)

1. 更新 API 密钥：
```python
# 在 crawler_enhanced.py 第 12 行
RIOT_API_KEY = "RGAPI-your-key-here"
```

2. 运行爬虫：
```bash
python crawler_enhanced.py
```

爬虫会自动：
- ✅ 获取 Data Dragon 静态数据
- ✅ 爬取所有种子玩家的比赛
- ✅ 提取完整的 10 人数据
- ✅ 计算衍生指标
- ✅ 存储到 DynamoDB

### 步骤 3: 部署增强 Lambda (2 分钟)

```bash
# 创建部署包
mkdir lambda_package && cd lambda_package
pip install boto3 -t .
cp ../lambda_chatbot_enhanced.py lambda_function.py
zip -r lambda_deployment.zip .

# 更新 Lambda
aws lambda update-function-code \
    --function-name RiftLensAIChatbot \
    --zip-file fileb://lambda_deployment.zip \
    --region ap-southeast-2
```

## ✅ 完成！

现在你的 AI 可以：
- 🎯 对线对比分析（CS、伤害、视野差距）
- 📊 深度数据洞察（伤害构成、团队贡献）
- 🔍 装备和符文翻译
- 🌐 全局 10 人视角分析

## 🧪 测试

```javascript
// 前端调用示例
const response = await fetch('https://your-api-url/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    playerId: 'player_puuid',
    userMessage: '分析我的对线表现',
    chatHistory: []
  })
});
```

## 📚 详细文档

查看 `AI_DATA_ENRICHMENT_GUIDE.md` 了解完整的部署和使用说明。

## 🎉 新功能亮点

### 之前 ❌
- 只有玩家自己的数据
- 无法对比对手
- 缺少关键指标（野怪数、视野细节、伤害细分）
- AI 分析基于有限数据

### 现在 ✅
- **完整的 10 人比赛数据**
- **自动识别对线对手**
- **所有 AI 分析关键指标**
- **对线差距量化分析**
- **装备/技能中文翻译**
- **比赛时间戳和时长**

## 💡 使用建议

1. **每天运行一次爬虫** - 保持数据最新
2. **指定 matchId** - 分析特定比赛
3. **查看对线差距** - AI 会自动对比对手数据
4. **关注衍生指标** - csPerMin, visionPerMin, killParticipation

## 🔧 配置检查清单

- [ ] DynamoDB 表 `RiftLensStaticData` 已创建
- [ ] DynamoDB 表 `RiftLensPlayers` 存在
- [ ] Riot API 密钥已更新且有效
- [ ] AWS 凭证已配置
- [ ] Lambda 函数已更新
- [ ] Lambda 有 DynamoDB 访问权限

## 📞 需要帮助？

查看 `AI_DATA_ENRICHMENT_GUIDE.md` 的故障排查部分。
