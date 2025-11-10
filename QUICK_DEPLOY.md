# 🚀 快速部署指南

## 最快的方式：AWS Amplify（5分钟部署）

### 步骤 1：推送代码到 GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 步骤 2：在 AWS Amplify 部署

1. 访问：https://console.aws.amazon.com/amplify/
2. 点击 **"New app"** → **"Host web app"**
3. 选择 **GitHub** 并授权
4. 选择你的仓库和分支
5. Amplify 会自动检测 Next.js 配置
6. 点击 **"Save and deploy"**

### 步骤 3：等待部署完成

- 构建时间：约 3-5 分钟
- 完成后你会得到一个 URL：`https://xxxxx.amplifyapp.com`

### 步骤 4：配置环境变量（如果需要）

在 Amplify 控制台：
1. 进入你的应用
2. 点击 **"Environment variables"**
3. 添加：
   ```
   NEXT_PUBLIC_API_GATEWAY_URL=你的API_URL
   ```
4. 重新部署

---

## 方案 2：S3 静态托管（更便宜）

### 前提条件

安装 AWS CLI：
```bash
# Windows (使用 MSI 安装器)
# 下载：https://awscli.amazonaws.com/AWSCLIV2.msi

# 配置 AWS CLI
aws configure
```

### 步骤 1：切换到静态导出模式

```bash
# 备份当前配置
copy next.config.mjs next.config.backup.mjs

# 使用静态导出配置
copy next.config.static.mjs next.config.mjs
```

### 步骤 2：构建

```bash
npm run build
```

### 步骤 3：创建 S3 Bucket

```bash
# 替换 YOUR-BUCKET-NAME 为你的 bucket 名称
aws s3 mb s3://YOUR-BUCKET-NAME --region us-east-1

# 配置为静态网站
aws s3 website s3://YOUR-BUCKET-NAME ^
  --index-document index.html ^
  --error-document 404.html
```

### 步骤 4：运行部署脚本

```bash
deploy-to-s3.bat
```

按提示输入你的 Bucket 名称。

### 步骤 5：配置公开访问

创建 `bucket-policy.json`：
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

应用策略：
```bash
aws s3api put-bucket-policy --bucket YOUR-BUCKET-NAME --policy file://bucket-policy.json
```

### 步骤 6：访问网站

```
http://YOUR-BUCKET-NAME.s3-website-us-east-1.amazonaws.com
```

---

## 🎯 推荐选择

| 方案 | 优点 | 缺点 | 成本 | 推荐场景 |
|------|------|------|------|----------|
| **Amplify** | 最简单，自动CI/CD | 成本稍高 | 免费层足够 | 开发/演示 |
| **S3 + CloudFront** | 最便宜，性能好 | 需要手动配置 | $5-10/月 | 生产环境 |

---

## ⚠️ 重要提示

### 如果使用静态导出（S3）：

1. **API 调用**：确保所有 API 调用都在客户端进行
2. **环境变量**：使用 `NEXT_PUBLIC_` 前缀
3. **图片优化**：需要设置 `images.unoptimized: true`
4. **动态路由**：不支持 SSR，只支持静态路由

### 如果使用 Amplify：

1. **完整支持**：支持 SSR、API Routes、动态路由
2. **自动构建**：每次 push 自动部署
3. **环境变量**：在控制台配置

---

## 🔧 故障排除

### 问题：构建失败
```bash
# 清理缓存
rm -rf .next node_modules
npm install
npm run build
```

### 问题：页面空白
- 检查浏览器控制台错误
- 确认 API URL 配置正确
- 检查 CORS 设置

### 问题：图片不显示
- 静态导出需要 `images.unoptimized: true`
- 检查图片路径是否正确

---

## 📞 需要帮助？

查看完整文档：`AWS_DEPLOYMENT_GUIDE.md`

或者直接问我！😊
