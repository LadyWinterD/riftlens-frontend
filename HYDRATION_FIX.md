# 🔧 Hydration 错误修复

## 问题描述

在加载界面中，浮动粒子使用了 `Math.random()` 来生成随机位置，这导致服务端渲染（SSR）和客户端渲染的HTML不匹配，产生 hydration 错误。

## 错误信息
```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

## 解决方案

### 1. 添加客户端挂载状态
```typescript
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);
```

### 2. 条件渲染浮动粒子
```typescript
{/* Floating Particles */}
{isMounted && [...Array(20)].map((_, i) => (
  <motion.div
    key={i}
    className="absolute w-1 h-1 bg-[#00ffff] rounded-full"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }}
    // ...
  />
))}
```

## 原理

- **服务端渲染（SSR）**：`isMounted` 初始值为 `false`，不渲染粒子
- **客户端挂载**：`useEffect` 执行，设置 `isMounted` 为 `true`
- **客户端渲染**：现在可以安全使用 `Math.random()`，因为只在客户端执行

## 其他修复

### 搜索名称修复
确保演示模式使用正确的召唤师名称：
```javascript
await handleSearch("Suger 99", "EUW");  // 正确的名称
```

## 测试

```bash
npm run dev
```

刷新页面，应该不再看到 hydration 警告。

## 最佳实践

在 Next.js 中，避免在 SSR 组件中使用：
- `Math.random()`
- `Date.now()`
- `window` 对象
- 浏览器 API

如果必须使用，请：
1. 使用 `useEffect` 延迟到客户端
2. 使用 `'use client'` 指令
3. 使用条件渲染（如本例）

## ✅ 修复完成

- [x] Hydration 错误已修复
- [x] 浮动粒子正常显示
- [x] 搜索功能正常工作
- [x] 无控制台警告
