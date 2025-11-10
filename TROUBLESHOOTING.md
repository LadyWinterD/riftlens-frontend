# 🔧 故障排查指南

## 问题 1: AI 回复显示 Anthropic 默认消息

### 症状
```
"I'm afraid I don't actually have a full system diagnostic capability. 
I'm an AI assistant created by Anthropic..."
```

### 原因
这说明请求**没有到达你的 Lambda 函数**，而是直接调用了 Bedrock API。

### 解决步骤

#### 步骤 1: 检查环境变量
打开 `.env.local` 文件，确认以下配置：

```env
NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-id.execute-api.ap-southeast-2.amazonaws.com/prod
NEXT_PUBLIC_CHAT_API_URL=https://your-api-id.execute-api.ap-southeast-2.amazonaws.com/prod/chat
```

**重要**: 
- `NEXT_PUBLIC_CHAT_API_URL` 必须指向你的 Lambda 函数的 API Gateway 端点
- 如果这个变量未设置或错误，AI 将无法工作

#### 步骤 2: 验证 Lambda 函数已部署
1. 登录 AWS Console
2. 进入 Lambda 服务
3. 找到你的聊天机器人 Lambda 函数
4. 确认代码已更新为 `lambda_chatbot_updated.py`
5. 点击 "Deploy" 保存

#### 步骤 3: 测试 Lambda 函数
在 Lambda 控制台创建测试事件：

```json
{
  "body": "{\"question\":\"测试\",\"data\":{\"PlayerID\":\"test123\",\"chatHistory\":[]}}"
}
```

点击 "Test"，查看响应是否包含 `aiResponse` 字段。

#### 步骤 4: 检查 API Gateway
1. 进入 API Gateway 服务
2. 找到你的 API
3. 确认有 `/chat` 路由
4. 确认路由方法为 POST
5. 确认集成类型为 Lambda Function
6. 确认 CORS 已启用

#### 步骤 5: 重启开发服务器
环境变量更改后，必须重启：

```bash
# 停止当前服务器 (Ctrl+C)
npm run dev
```

---

## 问题 2: GAME INSIGHTS 格式没有改变

### 症状
AI 回复没有显示彩色标签、emoji、高亮数字等特效。

### 原因
1. Lambda 的 system prompt 没有更新
2. 前端格式化函数没有正确应用

### 解决步骤

#### 步骤 1: 更新 Lambda System Prompt
确认 `lambda_chatbot_updated.py` 中的 `build_system_prompt` 函数包含以下内容：

```python
**VISUAL ENHANCEMENT RULES:**
- Use LOTS of emojis: 🛡️ (defense), ⚔️ (attack), 💀 (deaths), 🎯 (accuracy)
- Mark important items with <item>Item Name</item>
- Mark champion names with <champion>Champion Name</champion>
- Mark key stats with <stat>number</stat>
- Use ALL CAPS for emphasis on critical words
- Add emojis to make it engaging and visual
```

#### 步骤 2: 验证前端格式化
打开浏览器开发者工具 (F12)，查看 Console 标签：

1. 搜索 `[V21 postStatefulChatMessage] Response data:`
2. 查看 AI 的原始回复
3. 确认回复包含特殊标签：`[WARNING]`, `<item>`, `<champion>` 等

如果没有这些标签，说明 Lambda 的 prompt 没有生效。

#### 步骤 3: 测试格式化函数
在浏览器 Console 中测试：

```javascript
// 测试文本
const testText = `
### TACTICAL ANALYSIS
[WARNING] Enemy has <stat>4 AD</stat> champions.
You need <item>Ninja Tabi</item> and <champion>Malphite</champion>.
Your <stat>9 deaths</stat> are TOO MANY.
`;

// 应该看到彩色格式化的输出
```

---

## 问题 3: 如何验证配置正确

### 快速检查清单

#### ✅ 环境变量
```bash
# 在项目根目录运行
cat .env.local | grep CHAT
```

应该看到：
```
NEXT_PUBLIC_CHAT_API_URL=https://...
```

#### ✅ Lambda 函数
1. AWS Console → Lambda
2. 找到你的函数
3. 查看 "Code" 标签
4. 确认代码包含 `build_system_prompt` 函数
5. 确认 system prompt 包含 `VISUAL ENHANCEMENT RULES`

#### ✅ API Gateway
1. AWS Console → API Gateway
2. 找到你的 API
3. 查看 Resources
4. 确认有 `/chat` POST 方法
5. 点击 "Test" 测试端点

#### ✅ 前端代码
1. 打开 `src/components/CyberMatchDetailModal.tsx`
2. 搜索 `renderTacticalTag` 函数
3. 确认函数存在且包含标签配置

---

## 问题 4: 浏览器控制台错误

### 常见错误及解决方案

#### 错误 1: "CHAT_URL is not defined"
**解决**: 在 `.env.local` 中添加 `NEXT_PUBLIC_CHAT_API_URL`

#### 错误 2: "CORS policy blocked"
**解决**: 在 Lambda 响应中添加 CORS 头：
```python
'headers': {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}
```

#### 错误 3: "404 Not Found"
**解决**: 检查 API Gateway 路由配置

#### 错误 4: "500 Internal Server Error"
**解决**: 查看 Lambda CloudWatch 日志

---

## 调试技巧

### 1. 查看 Lambda 日志
```bash
# 在 AWS Console
CloudWatch → Log groups → /aws/lambda/your-function-name
```

### 2. 查看浏览器网络请求
1. 打开开发者工具 (F12)
2. 切换到 "Network" 标签
3. 点击 "GET AI INSIGHTS" 按钮
4. 查找 `/chat` 请求
5. 检查 Request Payload 和 Response

### 3. 添加调试日志
在 `src/services/awsService.ts` 中已经有详细的日志：

```typescript
console.log(`[V21 postStatefulChatMessage] Calling: ${CHAT_URL}`);
console.log(`[V21 postStatefulChatMessage] Response data:`, responseData);
```

查看这些日志可以帮助定位问题。

---

## 完整测试流程

### 1. 测试环境变量
```bash
# 在项目根目录
echo $NEXT_PUBLIC_CHAT_API_URL
# 或
cat .env.local
```

### 2. 测试 Lambda 函数
在 AWS Lambda 控制台使用测试事件。

### 3. 测试 API Gateway
使用 Postman 或 curl：

```bash
curl -X POST https://your-api-id.execute-api.ap-southeast-2.amazonaws.com/prod/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "分析我的表现",
    "data": {
      "PlayerID": "test123",
      "chatHistory": []
    }
  }'
```

### 4. 测试前端
1. 启动开发服务器: `npm run dev`
2. 打开浏览器: `http://localhost:3000`
3. 加载 Demo Dashboard
4. 点击任意比赛
5. 点击 "GET AI INSIGHTS"
6. 打开开发者工具查看 Console 和 Network

---

## 预期的正确行为

### ✅ 正确的 AI 回复格式
```
### TACTICAL ANALYSIS

[WARNING] Enemy has 4 AD champions 🔥.
You MUST build Ninja Tabi + Randuin's Omen.

[CRITICAL] Your 9 deaths 💀 show you did NOT follow strategy.

[SUGGESTION]: Focus on FARMING instead of fighting.
```

### ✅ 正确的浏览器 Console 输出
```
[V21 postStatefulChatMessage] Calling: https://...
[V21 postStatefulChatMessage] Response status: 200
[V21 postStatefulChatMessage] Response has aiResponse: true
```

### ✅ 正确的视觉效果
- `[WARNING]` 显示为橙色标签带 ⚠️ 图标
- 数字 `4`, `9` 显示为黄色发光
- `Ninja Tabi` 显示为紫色标签带 🎒 图标
- `FARMING` 显示为青色加粗

---

## 还是不工作？

### 联系信息
如果按照以上步骤仍然无法解决，请提供：

1. `.env.local` 文件内容（隐藏敏感信息）
2. 浏览器 Console 的完整输出
3. Lambda CloudWatch 日志
4. API Gateway 配置截图

### 临时解决方案
如果 Lambda 暂时无法工作，可以使用本地模拟数据：

在 `src/services/awsService.ts` 中添加：

```typescript
// 临时：使用模拟数据
if (!CHAT_URL || CHAT_URL.includes('localhost')) {
  return `### TACTICAL ANALYSIS

[WARNING] This is MOCK data for testing.

[CRITICAL] Your <stat>9 deaths</stat> 💀 are TOO MANY.

[SUGGESTION]: Build <item>Ninja Tabi</item> against AD teams.`;
}
```
