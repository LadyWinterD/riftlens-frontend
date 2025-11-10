# 🚀 AWS Amplify 部署指南 - Rift Rewind

## ✅ 准备工作检查

你的项目已经准备好了！所有文件都已提交到 Git。

---

## 📋 部署步骤（5-10分钟）

### 步骤 1：登录 AWS Console

1. 访问：**https://console.aws.amazon.com/amplify/**
2. 使用你的 AWS 账号登录
3. 选择区域（推荐：**us-east-1** 或 **eu-west-1**）

---

### 步骤 2：创建新应用

1. 点击橙色按钮 **"New app"**
2. 选择 **"Host web app"**
3. 在 Git provider 中选择 **"GitHub"**

![Amplify New App](https://docs.amplify.aws/images/console/amplify-gettingstarted-1.png)

---

### 步骤 3：连接 GitHub 仓库

1. 点击 **"Connect to GitHub"**
2. 授权 AWS Amplify 访问你的 GitHub 账号
3. 在仓库列表中找到你的项目仓库
4. 选择分支：**main** 或 **master**
5. 点击 **"Next"**

---

### 步骤 4：配置构建设置

Amplify 会自动检测到这是一个 Next.js 项目。

#### 4.1 确认构建配置

Amplify 会自动使用 `amplify.yml` 文件（我已经为你创建好了）：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

#### 4.2 配置环境变量（重要！）

点击 **"Advanced settings"** 展开高级设置。

在 **"Environment variables"** 部分添加：

| Key | Value | 说明 |
|-----|-------|------|
| `NEXT_PUBLIC_API_GATEWAY_URL` | 你的 API Gateway URL | 必需 |
| `NEXT_PUBLIC_AWS_REGION` | `us-east-1` 或你的区域 | 可选 |

**示例：**
```
NEXT_PUBLIC_API_GATEWAY_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_AWS_REGION=us-east-1
```

⚠️ **注意**：环境变量必须以 `NEXT_PUBLIC_` 开头才能在客户端使用！

---

### 步骤 5：保存并部署

1. 检查所有配置
2. 点击 **"Save and deploy"**
3. Amplify 开始构建你的应用

---

## ⏱️ 构建过程（3-5分钟）

你会看到以下阶段：

1. **Provision** - 准备构建环境
2. **Build** - 安装依赖并构建应用
3. **Deploy** - 部署到 CDN
4. **Verify** - 验证部署

### 实时日志

你可以点击每个阶段查看详细日志：

```
# 典型的构建日志
2024-01-15 10:30:00 | Starting build...
2024-01-15 10:30:15 | npm ci
2024-01-15 10:31:30 | npm run build
2024-01-15 10:33:45 | Build completed successfully
2024-01-15 10:34:00 | Deploying to CDN...
2024-01-15 10:34:30 | Deployment complete!
```

---

## 🎉 部署完成！

### 获取你的网站 URL

部署成功后，你会看到：

```
https://main.xxxxxxxxxxxxx.amplifyapp.com
```

这就是你的网站地址！🚀

---

## 🔧 后续配置

### 1. 自定义域名（可选）

1. 在 Amplify 控制台，点击 **"Domain management"**
2. 点击 **"Add domain"**
3. 输入你的域名（例如：`riftrewind.com`）
4. 按照指示配置 DNS 记录
5. 等待 SSL 证书自动配置（约15分钟）

### 2. 配置自动部署

✅ 已自动启用！每次你推送代码到 GitHub，Amplify 会自动：
- 检测代码变更
- 自动构建
- 自动部署

### 3. 设置通知（可选）

1. 点击 **"Notifications"**
2. 添加 Email 或 SNS 通知
3. 在构建成功/失败时接收通知

---

## 📊 监控和管理

### 查看部署历史

在 Amplify 控制台可以看到：
- 所有部署记录
- 构建日志
- 部署时间
- Git commit 信息

### 回滚到之前的版本

1. 在部署历史中找到想要回滚的版本
2. 点击 **"Redeploy this version"**
3. 确认回滚

---

## 🐛 故障排除

### 问题 1：构建失败

**错误信息**：`npm ERR! code ELIFECYCLE`

**解决方案**：
1. 检查 `package.json` 中的脚本
2. 确保本地构建成功：`npm run build`
3. 检查 Node.js 版本（Amplify 使用 Node 18）

### 问题 2：页面空白

**可能原因**：
- 环境变量未配置
- API URL 错误
- CORS 问题

**解决方案**：
1. 检查浏览器控制台错误
2. 验证环境变量配置
3. 检查 API Gateway CORS 设置

### 问题 3：图片不显示

**解决方案**：
- 确认 `next.config.mjs` 中配置了 Data Dragon CDN
- 检查图片 URL 是否正确

### 问题 4：构建时间过长

**优化方案**：
1. 启用缓存（已在 `amplify.yml` 中配置）
2. 减少依赖项
3. 使用 `npm ci` 而不是 `npm install`

---

## 💰 成本估算

### AWS Amplify 免费层

✅ **每月免费额度**：
- 1000 构建分钟
- 15 GB 存储
- 15 GB 数据传输

### 超出免费层后

- 构建：$0.01/分钟
- 存储：$0.023/GB/月
- 数据传输：$0.15/GB

**估算**：
- 小型项目（<1000访问/月）：**免费**
- 中型项目（5000访问/月）：**$5-10/月**
- 大型项目（50000访问/月）：**$20-50/月**

---

## 🔐 安全最佳实践

### 1. 保护环境变量

- ❌ 不要在代码中硬编码 API 密钥
- ✅ 使用 Amplify 环境变量
- ✅ 使用 `NEXT_PUBLIC_` 前缀区分客户端/服务器变量

### 2. 启用 HTTPS

✅ Amplify 自动提供 HTTPS（免费 SSL 证书）

### 3. 配置 CORS

确保你的 API Gateway 允许来自 Amplify 域名的请求：

```json
{
  "Access-Control-Allow-Origin": "https://main.xxxxx.amplifyapp.com",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

---

## 📈 性能优化

### 1. 启用缓存

✅ 已在 `amplify.yml` 中配置

### 2. 图片优化

Next.js 自动优化图片（Amplify 支持）

### 3. 代码分割

Next.js 自动进行代码分割

### 4. CDN 分发

✅ Amplify 自动使用 CloudFront CDN

---

## 🎯 下一步

1. ✅ 部署到 Amplify
2. ⬜ 测试所有功能
3. ⬜ 配置自定义域名
4. ⬜ 设置监控和告警
5. ⬜ 优化性能
6. ⬜ 添加 Google Analytics（可选）

---

## 📞 需要帮助？

### 有用的链接

- [AWS Amplify 文档](https://docs.amplify.aws/)
- [Next.js on Amplify](https://docs.amplify.aws/guides/hosting/nextjs/q/platform/js/)
- [Amplify 定价](https://aws.amazon.com/amplify/pricing/)

### 常见问题

查看 `AWS_DEPLOYMENT_GUIDE.md` 获取更多详细信息。

---

## ✨ 准备好了吗？

现在就去 AWS Amplify 控制台开始部署吧！

👉 **https://console.aws.amazon.com/amplify/**

祝你部署顺利！🚀🎮
