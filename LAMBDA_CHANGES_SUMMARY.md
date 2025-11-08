# 📝 Lambda 代码更改摘要

## 🎯 核心更改

在 `lambda_handler` 函数中添加了格式检测逻辑，使 Lambda 同时支持新旧两种请求格式。

## 🔄 更改对比

### 旧代码（V2）- 只支持新格式

```python
def lambda_handler(event, context):
    print(f"[Lambda] 收到事件: {json.dumps(event)}")
    
    try:
        # 1. [解析] 从 API Gateway 获取前端发送的数据
        body = json.loads(event.get('body', '{}'))
        player_id = body.get('playerId')
        user_message = body.get('userMessage')
        chat_history = body.get('chatHistory', [])
        
        if not player_id or not user_message:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Missing "playerId" or "userMessage" in request body.'
                })
            }
        
        # ... 继续处理
```

### 新代码（V3）- 支持新旧两种格式

```python
def lambda_handler(event, context):
    print(f"[Lambda] 收到事件: {json.dumps(event)}")
    
    try:
        # 1. [解析] 从 API Gateway 获取前端发送的数据
        body = json.loads(event.get('body', '{}'))
        
        # ============================================================
        # [!! V3 新增 !!] 兼容新旧两种格式
        # ============================================================
        player_id = None
        user_message = None
        chat_history = []
        
        # 尝试新格式: { playerId, userMessage, chatHistory }
        if 'playerId' in body and 'userMessage' in body:
            print("[Lambda] 检测到新格式: { playerId, userMessage, chatHistory }")
            player_id = body.get('playerId')
            user_message = body.get('userMessage')
            chat_history = body.get('chatHistory', [])
        
        # 尝试旧格式: { question, data }
        elif 'question' in body and 'data' in body:
            print("[Lambda] 检测到旧格式: { question, data }")
            data = body.get('data', {})
            player_id = data.get('PlayerID') or data.get('playerId')
            user_message = body.get('question')
            chat_history = data.get('chatHistory', [])
        
        # 都不匹配
        else:
            print(f"[Lambda] 错误: 无法识别的请求格式。Body: {json.dumps(body)}")
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Invalid request format. Expected either { playerId, userMessage, chatHistory } or { question, data }'
                })
            }
        
        # 验证必需字段
        if not player_id or not user_message:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Missing "playerId" or "userMessage" in request body.'
                })
            }
        
        print(f"[Lambda] 解析成功 - PlayerID: {player_id}, Message: {user_message[:50]}...")
        # ============================================================
        
        # ... 继续处理（其余代码不变）
```

## 📊 支持的格式

### 格式 1：新格式（推荐）

```json
{
  "playerId": "abc123xyz...",
  "userMessage": "What am I doing wrong?",
  "chatHistory": [
    {
      "role": "assistant",
      "content": "Your main issue is..."
    },
    {
      "role": "user",
      "content": "Why?"
    }
  ]
}
```

**优点：**
- ✅ 清晰的字段名
- ✅ 扁平结构
- ✅ 符合 RESTful 最佳实践

### 格式 2：旧格式（兼容）

```json
{
  "question": "What am I doing wrong?",
  "data": {
    "PlayerID": "abc123xyz...",
    "chatHistory": [
      {
        "role": "assistant",
        "content": "Your main issue is..."
      }
    ]
  }
}
```

**优点：**
- ✅ 通过 API Gateway 验证器
- ✅ 向后兼容旧代码

## 🔍 检测逻辑

Lambda 使用以下逻辑检测格式：

```python
# 检测新格式
if 'playerId' in body and 'userMessage' in body:
    # 使用新格式解析
    
# 检测旧格式
elif 'question' in body and 'data' in body:
    # 使用旧格式解析
    
# 无法识别
else:
    # 返回 400 错误
```

## 🎨 改进的错误处理

### 旧代码

```python
except Exception as e:
    print(f"[Lambda] 发生严重错误: {str(e)}")
    return {
        'statusCode': 500,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': f'Internal Server Error: {str(e)}'})
    }
```

### 新代码

```python
except Exception as e:
    print(f"[Lambda] 发生严重错误: {str(e)}")
    import traceback
    traceback.print_exc()  # 添加完整的堆栈跟踪
    return {
        'statusCode': 500,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': f'Internal Server Error: {str(e)}'})
    }
```

**改进：**
- ✅ 添加了 `traceback.print_exc()` 以便在 CloudWatch 中查看完整错误
- ✅ 更详细的日志输出

## 📈 日志输出示例

### 新格式请求

```
[Lambda] 收到事件: {...}
[Lambda] 检测到新格式: { playerId, userMessage, chatHistory }
[Lambda] 解析成功 - PlayerID: abc123..., Message: What am I doing wrong?...
[Lambda] 正在从 DDB 检索 PlayerID: abc123... 的数据...
[Lambda] 正在构建 Bedrock Prompt...
[Lambda] 正在实时调用 Bedrock (Haiku)...
[Lambda] Bedrock 成功响应: Your main issue is...
```

### 旧格式请求

```
[Lambda] 收到事件: {...}
[Lambda] 检测到旧格式: { question, data }
[Lambda] 解析成功 - PlayerID: abc123..., Message: What am I doing wrong?...
[Lambda] 正在从 DDB 检索 PlayerID: abc123... 的数据...
[Lambda] 正在构建 Bedrock Prompt...
[Lambda] 正在实时调用 Bedrock (Haiku)...
[Lambda] Bedrock 成功响应: Your main issue is...
```

## ✅ 测试清单

部署后，测试以下场景：

- [ ] 使用新格式发送请求
- [ ] 使用旧格式发送请求
- [ ] 发送缺少必需字段的请求（应返回 400）
- [ ] 发送无效格式的请求（应返回 400）
- [ ] 发送不存在的 PlayerID（应返回 404）
- [ ] 多轮对话测试
- [ ] 以 assistant 消息开头的聊天历史

## 🚀 部署后验证

1. **查看 CloudWatch Logs**
   - 确认看到 "检测到新格式" 或 "检测到旧格式"
   - 确认没有错误

2. **测试前端**
   - 打开浏览器控制台
   - 发送聊天消息
   - 确认收到 AI 响应

3. **检查响应时间**
   - 应该在 2-5 秒内收到响应
   - 如果超时，检查 Lambda 配置

## 📝 其他未更改的部分

以下部分保持不变：
- ✅ `build_system_prompt()` 函数
- ✅ DynamoDB 查询逻辑
- ✅ Bedrock API 调用
- ✅ 聊天历史处理
- ✅ CORS 头配置
- ✅ 响应格式 `{ aiResponse: string }`

---

**总结：只添加了 30 行代码来支持格式检测，其余逻辑完全不变！** ✨
