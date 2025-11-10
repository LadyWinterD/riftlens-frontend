# 🚀 Lambda 部署检查清单

## ⚠️ 当前问题
API 测试显示 Lambda 正在运行**旧代码**。AI 回复缺少以下格式化标签：
- ❌ `<item>装备名</item>`
- ❌ `<champion>英雄名</champion>`
- ❌ `<stat>数值</stat>`
- ❌ `[WARNING]`, `[CRITICAL]` 等完整标签

## 📋 部署步骤

### 1. 准备代码
- [x] 代码文件：`lambda_chatbot_updated.py`
- [x] 代码已在本地准备好
- [ ] 代码已复制到剪贴板

### 2. 登录 AWS Console
1. 打开浏览器
2. 访问：https://console.aws.amazon.com/lambda/
3. 选择区域：**ap-southeast-2 (Sydney)**

### 3. 找到 Lambda 函数
1. 在函数列表中查找你的聊天机器人函数
2. 可能的函数名称：
   - `riftlens-chat`
   - `chatbot`
   - `riftlens-chatbot`
   - 或其他包含 "chat" 的名称

### 4. 更新代码
1. 点击函数名称进入详情页
2. 切换到 "Code" 标签
3. 在代码编辑器中：
   - 选择 `lambda_function.py` 或主文件
   - **全选** (Ctrl+A) 并**删除**所有现有代码
   - **粘贴** `lambda_chatbot_updated.py` 的完整内容
4. 点击 **"Deploy"** 按钮（橙色按钮）
5. 等待部署完成（看到 "Successfully deployed" 消息）

### 5. 验证配置
确认以下环境变量（在 "Configuration" → "Environment variables" 标签）：

```
DYNAMODB_TABLE_NAME = PlayerReports
DYNAMODB_REGION = ap-southeast-2
BEDROCK_REGION = ap-southeast-2
```

如果缺少，点击 "Edit" 添加。

### 6. 验证权限
在 "Configuration" → "Permissions" 标签，确认 IAM 角色有以下权限：
- ✅ DynamoDB:GetItem (读取 PlayerReports 表)
- ✅ Bedrock:InvokeModel (调用 Claude 模型)

### 7. 测试部署
在项目目录运行：

```bash
node test-api.js
```

**预期输出**：
```
✅ SUCCESS! AI Response received:
────────────────────────────────────────────────────────────
### TACTICAL ANALYSIS

[WARNING] Enemy has <stat>4 AD</stat> champions 🔥.
You need <item>Ninja Tabi</item> against <champion>Zed</champion>.

[CRITICAL] Your <stat>9 deaths</stat> 💀 are TOO MANY.
────────────────────────────────────────────────────────────

🎨 Format Check:
  [WARNING] tag: ✅
  [CRITICAL] tag: ✅
  <item> tag: ✅
  <champion> tag: ✅
  <stat> tag: ✅
```

### 8. 前端测试
1. 启动开发服务器：`npm run dev`
2. 打开浏览器：http://localhost:3000
3. 加载 Demo Dashboard
4. 点击任意比赛
5. 点击 "GET AI INSIGHTS"
6. 验证格式化效果：
   - ✅ 战术标签有颜色和图标
   - ✅ 数字高亮（黄色发光）
   - ✅ 装备/英雄标签有特殊样式

---

## 🔍 如何确认代码已更新

### 方法 1: 查看 Lambda 代码
在 Lambda 控制台，搜索以下关键字：

```python
# 应该能找到这些内容：
"VISUAL ENHANCEMENT RULES"
"<item>Item Name</item>"
"<champion>Champion Name</champion>"
"<stat>number</stat>"
```

### 方法 2: 查看 CloudWatch 日志
1. 在 Lambda 控制台点击 "Monitor" 标签
2. 点击 "View logs in CloudWatch"
3. 查看最新日志，应该看到：
```
[Lambda 冷启动] 成功初始化 DynamoDB 和 Bedrock 客户端。
[Lambda] 解析成功 - PlayerID: ...
[Lambda] 正在构建 Bedrock Prompt...
```

### 方法 3: API 测试响应
运行 `node test-api.js`，检查响应是否包含：
- `<item>` 标签
- `<champion>` 标签
- `<stat>` 标签
- emoji 表情

---

## ❌ 常见部署错误

### 错误 1: "Deploy" 按钮是灰色的
**原因**: 代码没有修改
**解决**: 先修改代码（哪怕只是添加一个空格），然后再点击 Deploy

### 错误 2: 部署后测试仍然失败
**原因**: Lambda 可能有多个版本
**解决**: 
1. 在 Lambda 控制台，点击 "Versions" 标签
2. 确认 "$LATEST" 版本是最新的
3. 如果使用了别名（Alias），更新别名指向最新版本

### 错误 3: "Module import error"
**原因**: 缺少依赖
**解决**: 
1. 确认 `boto3` 已安装（Lambda 默认包含）
2. 如果使用了其他库，需要创建 Lambda Layer

### 错误 4: "Timeout"
**原因**: Bedrock 调用超时
**解决**: 
1. 在 "Configuration" → "General configuration"
2. 增加 Timeout 到 30 秒或更多

---

## ✅ 部署成功标志

当你看到以下所有标志时，说明部署成功：

1. ✅ Lambda 控制台显示 "Successfully deployed"
2. ✅ `node test-api.js` 显示所有格式检查通过
3. ✅ 前端 GAME INSIGHTS 显示彩色标签
4. ✅ 浏览器 Console 没有错误
5. ✅ AI 回复包含 emoji 和特殊标签

---

## 📞 需要帮助？

如果部署后仍然不工作，请提供：

1. Lambda 函数名称
2. CloudWatch 日志截图
3. `node test-api.js` 的完整输出
4. 浏览器 Console 的错误信息

---

## 🎯 下一步

部署成功后：

1. 测试所有 AI 功能
2. 验证格式化效果
3. 检查性能和响应时间
4. 收集用户反馈
5. 根据需要调整 system prompt
