@echo off
echo ========================================
echo   RiftLens AI - Quick Fix Script
echo ========================================
echo.

echo [1/3] Checking environment variables...
findstr "NEXT_PUBLIC_CHAT_API_URL" .env.local
echo.

echo [2/3] Testing API endpoint...
node test-api.js
echo.

echo [3/3] Instructions:
echo.
echo ✅ If API test passed, do the following:
echo    1. Stop the dev server (Ctrl+C)
echo    2. Clear browser cache (Ctrl+Shift+Delete)
echo    3. Restart dev server: npm run dev
echo    4. Hard refresh browser (Ctrl+Shift+R)
echo.
echo ❌ If API test failed, check:
echo    1. Lambda function is deployed
echo    2. API Gateway is configured
echo    3. .env.local has correct URL
echo.

pause
