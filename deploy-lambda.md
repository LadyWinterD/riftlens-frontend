# 部署 Lambda 函数指南

## 方法一：AWS Console（推荐新手）

1. 登录 AWS Console: https://console.aws.amazon.com
2. 搜索并进入 "Lambda" 服务
3. 找到你的函数（可能叫 `riftlens-chat`）
4. 点击 "Code" 标签
5. 复制 `lambda_chatbot_updated.py` 的全部内容
6. 粘贴到编辑器中，替换原有代码
7. 点击 "Deploy" 按钮
8. 测试一下，看 AI 回复是否使用新格式

## 方法二：使用 AWS CLI（如果已安装）

```bash
# 1. 打包代码
zip lambda_function.zip lambda_chatbot_updated.py

# 2. 上传到 Lambda
aws lambda update-function-code \
  --function-name riftlens-chat \
  --zip-file fileb://lambda_function.zip \
  --region ap-southeast-2

# 3. 如果有第二个函数（增强版）
zip lambda_enhanced.zip lambda_chatbot_enhanced.py
aws lambda update-function-code \
  --function-name riftlens-chat-enhanced \
  --zip-file fileb://lambda_enhanced.zip \
  --region ap-southeast-2
```

## 两个文件的区别

- **lambda_chatbot_updated.py**: 基础聊天功能，使用年度统计数据
- **lambda_chatbot_enhanced.py**: 增强版，可以分析单场比赛的详细数据

你可能只需要部署其中一个，取决于你的 API 调用哪个函数。

## 验证部署

部署后，在前端测试：
1. 搜索一个玩家
2. 点击 AI 聊天
3. 问一个问题，比如 "分析我的表现"
4. 看 AI 回复是否使用新的卡片格式（### 标题）

## 注意事项

- 确保 Lambda 函数的 Handler 设置为 `lambda_function.lambda_handler`
- 如果文件名改了，Handler 也要改（比如 `lambda_chatbot_updated.lambda_handler`）
- 部署后可能需要等待几秒钟才能生效
