# ✅ AWS Amplify 部署检查清单

## 📋 部署前检查

### 1. 代码准备
- [x] 所有代码已提交到 Git
- [x] `amplify.yml` 配置文件已创建
- [x] `next.config.mjs` 配置正确
- [x] 本地构建成功 (`npm run build`)

### 2. 环境变量准备
准备好以下信息（在 Amplify 控制台需要配置）：

```
NEXT_PUBLIC_API_GATEWAY_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_CHAT_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod/chat
NEXT_PUBLIC_AWS_REGION=us-east-1
```

⚠️ **重要**：替换 `xxxxx` 为你的实际 API Gateway ID

### 3. AWS 账号准备
- [ ] AWS 账号已创建
- [ ] 已登录 AWS Console
- [ ] 有权限创建 Amplify 应用

---

## 🚀 部署步骤

### 步骤 1：访问 Amplify 控制台
```
https://console.aws.amazon.com/amplify/
```

### 步骤 2：创建新应用
1. [ ] 点击 "New app" → "Host web app"
2. [ ] 选择 "GitHub"
3. [ ] 授权 AWS Amplify

### 步骤 3：连接仓库
1. [ ] 选择你的仓库
2. [ ] 选择分支 (main/master)
3. [ ] 点击 "Next"

### 步骤 4：配置构建
1. [ ] 确认 Amplify 检测到 Next.js
2. [ ] 展开 "Advanced settings"
3. [ ] 添加环境变量：
   - [ ] `NEXT_PUBLIC_API_GATEWAY_URL`
   - [ ] `NEXT_PUBLIC_CHAT_API_URL`
   - [ ] `NEXT_PUBLIC_AWS_REGION`

### 步骤 5：部署
1. [ ] 点击 "Save and deploy"
2. [ ] 等待构建完成（3-5分钟）
3. [ ] 记录你的 Amplify URL

---

## 🧪 部署后测试

### 1. 基本功能测试
- [ ] 网站可以访问
- [ ] 加载界面正常显示
- [ ] 可以搜索召唤师
- [ ] 数据正常加载

### 2. 标签页测试
- [ ] AI REPORT 标签正常
- [ ] MATCH HISTORY 标签正常
- [ ] CHAMPIONS 标签正常
- [ ] ABOUT 标签正常

### 3. 功能测试
- [ ] 比赛详情弹窗正常
- [ ] AI 聊天功能正常
- [ ] 图片和图标正常显示
- [ ] 动画效果正常

### 4. 性能测试
- [ ] 页面加载速度 < 3秒
- [ ] 没有控制台错误
- [ ] 移动端显示正常

---

## 🔧 常见问题解决

### 问题 1：构建失败
```bash
# 检查本地构建
npm run build

# 查看 Amplify 构建日志
# 在 Amplify 控制台点击失败的构建查看详细日志
```

### 问题 2：页面空白
**检查项**：
- [ ] 浏览器控制台有错误吗？
- [ ] 环境变量配置正确吗？
- [ ] API Gateway URL 可以访问吗？

**解决方案**：
```bash
# 测试 API
curl https://your-api-url/report?playerID=test

# 检查 CORS 设置
# 确保 API Gateway 允许来自 Amplify 域名的请求
```

### 问题 3：环境变量不生效
**解决方案**：
1. 在 Amplify 控制台重新检查环境变量
2. 确保变量名以 `NEXT_PUBLIC_` 开头
3. 重新部署应用

### 问题 4：图片不显示
**检查项**：
- [ ] `next.config.mjs` 配置了 Data Dragon CDN
- [ ] 图片 URL 正确
- [ ] 网络请求成功

---

## 📊 监控和维护

### 1. 设置告警
- [ ] 配置构建失败通知
- [ ] 配置部署成功通知

### 2. 定期检查
- [ ] 每周检查构建日志
- [ ] 每月检查使用量和成本
- [ ] 定期更新依赖项

### 3. 性能优化
- [ ] 启用缓存（已配置）
- [ ] 监控加载时间
- [ ] 优化图片大小

---

## 💰 成本监控

### 免费层额度
- 1000 构建分钟/月
- 15 GB 存储
- 15 GB 数据传输

### 检查使用量
1. 访问 Amplify 控制台
2. 查看 "Usage" 标签
3. 监控是否接近免费层限制

---

## 🎯 下一步

### 立即完成
- [ ] 部署到 Amplify
- [ ] 测试所有功能
- [ ] 分享 URL 给团队

### 可选优化
- [ ] 配置自定义域名
- [ ] 添加 Google Analytics
- [ ] 设置 CDN 缓存策略
- [ ] 配置 WAF（Web Application Firewall）

---

## 📞 获取帮助

### 文档
- `AMPLIFY_DEPLOYMENT.md` - 详细部署指南
- `AWS_DEPLOYMENT_GUIDE.md` - 完整 AWS 部署方案
- `.env.example` - 环境变量示例

### 在线资源
- [AWS Amplify 文档](https://docs.amplify.aws/)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [AWS Support](https://console.aws.amazon.com/support/)

---

## ✨ 准备好了！

你的项目已经完全准备好部署到 AWS Amplify！

现在就开始吧：
👉 **https://console.aws.amazon.com/amplify/**

祝你部署顺利！🚀🎮
