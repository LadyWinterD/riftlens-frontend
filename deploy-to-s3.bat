@echo off
REM ========================================
REM Rift Rewind - AWS S3 部署脚本
REM ========================================

echo.
echo ========================================
echo   RIFT REWIND - AWS S3 部署
echo ========================================
echo.

REM 检查 AWS CLI 是否安装
where aws >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] AWS CLI 未安装！
    echo 请访问: https://aws.amazon.com/cli/
    pause
    exit /b 1
)

echo [1/5] 检查 AWS CLI 配置...
aws sts get-caller-identity >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] AWS CLI 未配置！
    echo 请运行: aws configure
    pause
    exit /b 1
)
echo [✓] AWS CLI 已配置

echo.
echo [2/5] 构建 Next.js 应用...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 构建失败！
    pause
    exit /b 1
)
echo [✓] 构建成功

echo.
echo [3/5] 准备部署文件...
if not exist "out" (
    echo [错误] out 目录不存在！请确保使用静态导出模式。
    pause
    exit /b 1
)
echo [✓] 文件准备完成

echo.
set /p BUCKET_NAME="请输入 S3 Bucket 名称 (例如: rift-rewind-app): "
if "%BUCKET_NAME%"=="" (
    echo [错误] Bucket 名称不能为空！
    pause
    exit /b 1
)

echo.
echo [4/5] 上传文件到 S3...
aws s3 sync out/ s3://%BUCKET_NAME% --delete
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 上传失败！
    pause
    exit /b 1
)
echo [✓] 文件上传成功

echo.
echo [5/5] 设置 Content-Type...
aws s3 sync out/ s3://%BUCKET_NAME% --exclude "*" --include "*.html" --content-type "text/html" --metadata-directive REPLACE
aws s3 sync out/ s3://%BUCKET_NAME% --exclude "*" --include "*.js" --content-type "application/javascript" --metadata-directive REPLACE
aws s3 sync out/ s3://%BUCKET_NAME% --exclude "*" --include "*.css" --content-type "text/css" --metadata-directive REPLACE
echo [✓] Content-Type 设置完成

echo.
echo ========================================
echo   部署完成！
echo ========================================
echo.
echo 网站 URL: http://%BUCKET_NAME%.s3-website-us-east-1.amazonaws.com
echo.
echo 下一步:
echo 1. 配置 CloudFront 以获得 HTTPS 和更好的性能
echo 2. 设置自定义域名
echo 3. 配置缓存策略
echo.
pause
