# 🚀 AWS 部署指南 - Rift Rewind

## 方案 1：AWS Amplify（推荐 ⭐）

### 为什么选择 Amplify？
- ✅ 最简单的部署方式
- ✅ 自动 CI/CD
- ✅ 支持 Next.js SSR
- ✅ 免费层额度（每月 1000 构建分钟）
- ✅ 自动 HTTPS
- ✅ 全球 CDN

### 部署步骤

#### 1. 准备代码仓库
首先确保你的代码在 GitHub 上：

```bash
# 如果还没有推送到 GitHub
git add .
git commit -m "Ready for AWS deployment"
git push origin main
```

#### 2. 在 AWS Amplify 控制台部署

1. **登录 AWS Console**
   - 访问：https://console.aws.amazon.com/amplify/
   - 选择你的区域（推荐：us-east-1 或 eu-west-1）

2. **创建新应用**
   - 点击 "New app" → "Host web app"
   - 选择 "GitHub"（或你使用的 Git 提供商）
   - 授权 AWS Amplify 访问你的仓库

3. **选择仓库**
   - 选择你的 `riftlens-frontend` 仓库
   - 选择分支（通常是 `main` 或 `master`）

4. **配置构建设置**
   Amplify 会自动检测 Next.js，但你需要添加环境变量：
   
   ```yaml
   # amplify.yml (Amplify 会自动生成，但你可以自定义)
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
   ```

5. **添加环境变量**
   在 "Environment variables" 部分添加：
   
   ```
   NEXT_PUBLIC_API_GATEWAY_URL=你的API Gateway URL
   NEXT_PUBLIC_AWS_REGION=你的AWS区域
   ```

6. **保存并部署**
   - 点击 "Save and deploy"
   - 等待构建完成（通常 3-5 分钟）

7. **获取 URL**
   - 部署完成后，你会得到一个 URL：`https://xxxxx.amplifyapp.com`
   - 可以在设置中添加自定义域名

---

## 方案 2：AWS S3 + CloudFront（静态导出）

### 适用场景
- 纯静态网站（不需要 SSR）
- 更低成本
- 完全控制 CDN 配置

### 部署步骤

#### 1. 修改 Next.js 配置为静态导出

更新 `next.config.mjs`：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 添加这一行
  images: {
    unoptimized: true,  // 静态导出需要这个
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ddragon.leagueoflegends.com',
        port: '',
        pathname: '/cdn/**',
      },
    ],
  },
};

export default nextConfig;
```

#### 2. 构建静态文件

```bash
npm run build
```

这会在 `out/` 目录生成静态文件。

#### 3. 创建 S3 Bucket

```bash
# 使用 AWS CLI
aws s3 mb s3://rift-rewind-app --region us-east-1

# 配置为静态网站托管
aws s3 website s3://rift-rewind-app --index-document index.html --error-document 404.html
```

#### 4. 上传文件到 S3

```bash
# 上传 out 目录的所有文件
aws s3 sync out/ s3://rift-rewind-app --delete

# 设置正确的 Content-Type
aws s3 sync out/ s3://rift-rewind-app --exclude "*" --include "*.html" --content-type "text/html" --metadata-directive REPLACE
aws s3 sync out/ s3://rift-rewind-app --exclude "*" --include "*.js" --content-type "application/javascript" --metadata-directive REPLACE
aws s3 sync out/ s3://rift-rewind-app --exclude "*" --include "*.css" --content-type "text/css" --metadata-directive REPLACE
```

#### 5. 配置 Bucket 策略（公开访问）

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
      "Resource": "arn:aws:s3:::rift-rewind-app/*"
    }
  ]
}
```

应用策略：

```bash
aws s3api put-bucket-policy --bucket rift-rewind-app --policy file://bucket-policy.json
```

#### 6. 创建 CloudFront 分发

1. 访问 CloudFront 控制台
2. 创建新分发
3. 配置：
   - Origin Domain: `rift-rewind-app.s3-website-us-east-1.amazonaws.com`
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD, OPTIONS
   - Cache Policy: CachingOptimized
   - Default Root Object: `index.html`

4. 配置自定义错误页面：
   - 404 → /404.html
   - 403 → /index.html（用于 SPA 路由）

---

## 方案 3：AWS Elastic Beanstalk

### 适用场景
- 需要完整的 Node.js 环境
- 需要 SSR 和 API 路由
- 需要更多服务器控制

### 部署步骤

#### 1. 安装 EB CLI

```bash
pip install awsebcli
```

#### 2. 初始化 Elastic Beanstalk

```bash
eb init -p node.js rift-rewind-app --region us-east-1
```

#### 3. 创建环境并部署

```bash
eb create rift-rewind-production
eb deploy
```

#### 4. 配置环境变量

```bash
eb setenv NEXT_PUBLIC_API_GATEWAY_URL=你的API_URL
```

---

## 🔧 部署前检查清单

- [ ] 所有环境变量已配置
- [ ] API Gateway URL 已更新
- [ ] `.env.local` 文件不会被提交（已在 .gitignore）
- [ ] 构建成功：`npm run build`
- [ ] 本地测试通过：`npm run start`
- [ ] 所有图片和资源路径正确
- [ ] CORS 配置正确（API Gateway）

---

## 📊 成本估算

### AWS Amplify
- 免费层：1000 构建分钟/月，15GB 存储，15GB 流量
- 超出后：$0.01/构建分钟，$0.023/GB 存储，$0.15/GB 流量

### S3 + CloudFront
- S3：$0.023/GB 存储，$0.09/GB 流量
- CloudFront：前 10TB $0.085/GB
- 估计成本：$5-20/月（取决于流量）

### Elastic Beanstalk
- EC2 实例：t3.micro $0.0104/小时 ≈ $7.5/月
- 负载均衡器：$16/月
- 估计成本：$25-50/月

---

## 🎯 推荐配置

**对于你的项目，我推荐：**

1. **开发/演示阶段**：AWS Amplify
   - 最快部署
   - 免费层足够使用
   - 自动 CI/CD

2. **生产环境**：S3 + CloudFront
   - 成本最低
   - 性能最好
   - 可扩展性强

---

## 🔗 有用的链接

- [AWS Amplify 文档](https://docs.amplify.aws/)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [AWS S3 静态网站托管](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront 文档](https://docs.aws.amazon.com/cloudfront/)

---

## 🆘 常见问题

### Q: 部署后页面空白？
A: 检查浏览器控制台，通常是 API URL 配置问题或 CORS 错误。

### Q: 图片不显示？
A: 确保 `next.config.mjs` 中配置了 `images.unoptimized: true`（静态导出）。

### Q: 路由 404 错误？
A: CloudFront 需要配置错误页面重定向到 `index.html`。

### Q: 构建失败？
A: 检查 Node.js 版本（推荐 18.x 或 20.x）和依赖项。

---

## 📝 下一步

1. 选择部署方案
2. 按照步骤操作
3. 测试部署的网站
4. 配置自定义域名（可选）
5. 设置监控和日志

需要帮助？随时问我！🚀
