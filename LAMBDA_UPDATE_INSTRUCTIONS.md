# 🔧 Lambda 更新说明

## 问题

API Gateway 的验证器期望旧格式 `{ question, data }`，但新的 Lambda 代码只支持新格式 `{ playerId, userMessage, chatHistory }`。

错误信息：
```
Error: Request body must be JSON with "question" and "data"
```

## 解决方案

更新 Lambda 代码以同时支持新旧两种格式。

## 📋 更新步骤

### 1. 备份当前 Lambda 代码

在 AWS Lambda Console 中：
1. 打开你的 Lambda 函数（`RiftLensChatbotLambda`）
2. 复制当前代码并保存到本地作为备份

### 2. 替换 Lambda 代码

1. 打开项目根目录的 `lambda_chatbot_updated.py` 文件
2. 复制全部内容
3. 在 AWS Lambda Console 中，粘贴到代码编辑器
4. 点击 "Deploy" 保存

### 3. 测试

部署后，Lambda 将自动检测请求格式：

**新格式（推荐）：**
```json
{
  "playerId": "abc123...",
  "userMessage": "What am I doing wrong?",
  "chatHistory": [
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "..." }
  ]
}
```

**旧格式（兼容）：**
```json
{
  "question": "What am I doing wrong?",
  "data": {
    "PlayerID": "abc123...",
    "chatHistory": [...]
  }
}
```

## 🔍 主要更改

### 兼容性检测逻辑

```python
# 尝试新格式
if 'playerId' in body and 'userMessage' in body:
    print("[Lambda] 检测到新格式: { playerId, userMessage, chatHistory }")
    player_id = body.get('playerId')
    user_message = body.get('userMessage')
    chat_history = body.get('chatHistory', [])

# 尝试旧格式
elif 'question' in body and 'data' in body:
    print("[Lambda] 检测到旧格式: { question, data }")
    data = body.get('data', {})
    player_id = data.get('PlayerID') or data.get('playerId')
    user_message = body.get('question')
    chat_history = data.get('chatHistory', [])
```

### 改进的错误处理

- 更详细的日志输出
- 更清晰的错误消息
- 添加了 traceback 以便调试

## ✅ 验证

部署后，在浏览器控制台应该看到：

```
[Lambda] 检测到新格式: { playerId, userMessage, chatHistory }
[Lambda] 解析成功 - PlayerID: abc123..., Message: What am I doing wrong?...
[Lambda] 正在从 DDB 检索 PlayerID: abc123... 的数据...
[Lambda] 正在构建 Bedrock Prompt...
[Lambda] 正在实时调用 Bedrock (Haiku)...
[Lambda] Bedrock 成功响应: ...
```

## 🎯 前端状态

前端代码已更新为使用新格式：
- ✅ `awsService.ts` - 发送新格式请求
- ✅ `RiftAI.tsx` - 正确管理聊天历史
- ✅ 错误处理已改进

## 📊 兼容性矩阵

| 前端格式 | Lambda V2 (旧) | Lambda V3 (新) | API Gateway 验证器 |
|---------|---------------|---------------|-------------------|
| 新格式   | ❌ 失败       | ✅ 成功        | ❌ 拒绝           |
| 旧格式   | ✅ 成功       | ✅ 成功        | ✅ 通过           |

**结论：** Lambda V3 同时支持两种格式，解决了兼容性问题！

## 🚀 下一步（可选）

部署 Lambda V3 后，你可以选择：

### 选项 A：保持现状（推荐）
- Lambda 同时支持新旧格式
- 无需修改 API Gateway
- 向后兼容

### 选项 B：更新 API Gateway 验证器
如果你想强制使用新格式：

1. 进入 API Gateway Console
2. 找到 `/chat` POST 方法
3. 点击 "Method Request"
4. 将 "Request Validator" 设置为 "None"
5. 或更新验证模型为新格式
6. 部署 API

## 🆘 故障排除

### 问题：仍然收到 400 错误

**检查：**
1. Lambda 代码是否已部署？
2. 查看 CloudWatch Logs 中的 Lambda 日志
3. 确认前端发送的格式

### 问题：Lambda 超时

**检查：**
1. DynamoDB 表名是否正确？
2. Bedrock 权限是否配置？
3. 增加 Lambda 超时时间（建议 30 秒）

### 问题：找不到玩家

**检查：**
1. PlayerID 是否正确（应该是 PUUID）
2. DynamoDB 中是否有该玩家的数据
3. 查看 Lambda 日志中的 PlayerID

## 📝 文件清单

- ✅ `lambda_chatbot_updated.py` - 更新后的 Lambda 代码
- ✅ `src/services/awsService.ts` - 前端 API 服务
- ✅ `src/components/RiftAI.tsx` - 聊天组件
- ✅ `LAMBDA_UPDATE_INSTRUCTIONS.md` - 本文档

---

**更新完成后，聊天功能应该可以正常工作了！** 🎉
