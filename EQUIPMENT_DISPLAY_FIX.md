# 🔧 装备图标显示问题修复

## 问题描述

你说装备图标没有显示真实图片，仍然显示emoji。

## 原因分析

CyberMatchCard组件已经支持真实图片，但需要确保：

1. **数据格式正确** - `items` 必须是数字数组
2. **championId 字段存在** - 用于加载英雄头像
3. **rune 是数字** - 用于加载符文图标

## 当前代码状态

### ✅ CyberMatchCard.tsx - 已支持
```typescript
// 已经支持数字装备ID
items: (string | number)[]  // 可以接受数字或字符串
rune: string | number        // 可以接受数字或字符串

// 渲染逻辑
if (typeof item === 'number' && item > 0) {
  // 显示真实装备图标
  <img src={`${DD_CDN}/img/item/${item}.png`} />
}
```

### ✅ page.js - 已更新
```javascript
items={match.items || [0, 0, 0, 0, 0, 0]}  // 数字数组
rune={match.rune || 0}                      // 数字
championId={match.championId}               // 英雄ID
```

## 问题可能在哪里？

### 1. AWS数据格式检查

你的AWS Lambda返回的数据应该是这样的：

```javascript
{
  matchHistory: [
    {
      championName: "Volibear",
      championId: "Volibear",     // ← 必须有这个字段！
      items: [1001, 3078, 3065, 3153, 3074, 3742],  // ← 数字数组
      rune: 8010,                 // ← 数字
      // ...
    }
  ]
}
```

### 2. 检查实际数据

打开浏览器控制台（F12），搜索玩家后查看：

```javascript
// 应该看到这样的日志
[AWS] Report successfully received!
[AWS] Data keys: ["PlayerID", "playerName", "matchHistory", ...]
[AWS] annualStats: {...}

// 检查 matchHistory
console.log(data.matchHistory[0].items)  // 应该是 [1001, 3078, ...]
console.log(data.matchHistory[0].rune)   // 应该是 8010
```

### 3. 如果数据是字符串

如果你的DynamoDB返回的是字符串格式：

```javascript
items: "[1001, 3078, 3065]"  // ❌ 字符串
rune: "8010"                  // ❌ 字符串
```

需要在Lambda中转换：

```python
# Lambda中
match_data = {
    "items": json.loads(match["items"]) if isinstance(match["items"], str) else match["items"],
    "rune": int(match["rune"]) if isinstance(match["rune"], str) else match["rune"]
}
```

## 解决方案

### 方案1：修复Lambda返回数据

确保Lambda返回正确的数据类型：

```python
# lambda_function.py
def format_match_data(match):
    return {
        "championName": match.get("championName"),
        "championId": match.get("championId") or match.get("championName"),  # 后备
        "items": match.get("items", []),  # 确保是数组
        "rune": match.get("rune", 0),     # 确保是数字
        # ...
    }
```

### 方案2：前端数据转换

如果无法修改Lambda，在前端转换：

```javascript
// src/app/page.js
const Matches = (playerData.matchHistory || []).map(match => ({
  ...match,
  items: Array.isArray(match.items) 
    ? match.items 
    : typeof match.items === 'string' 
      ? JSON.parse(match.items) 
      : [0, 0, 0, 0, 0, 0],
  rune: typeof match.rune === 'number' 
    ? match.rune 
    : parseInt(match.rune) || 0,
  championId: match.championId || match.championName
}));
```

## 测试步骤

### 1. 检查数据
```javascript
// 在浏览器控制台
console.log(playerData.matchHistory[0])
```

应该看到：
```javascript
{
  championName: "Volibear",
  championId: "Volibear",
  items: [1001, 3078, 3065, 3153, 3074, 3742],  // 数字数组
  rune: 8010,  // 数字
  // ...
}
```

### 2. 检查图片URL
```javascript
// 应该生成这样的URL
https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/1001.png
https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Volibear.png
```

### 3. 检查网络请求
- 打开开发者工具 → Network标签
- 搜索玩家
- 查看是否有404错误（图片不存在）
- 查看是否有CORS错误

## 常见问题

### Q1: 图片显示404
**原因：** 装备ID或英雄ID不正确

**解决：**
- 检查装备ID是否有效（1001-7000范围）
- 检查英雄ID拼写（Lee Sin → LeeSin）

### Q2: 图片不加载
**原因：** 网络问题或CDN被墙

**解决：**
- 检查网络连接
- 尝试访问：https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/1001.png
- 如果无法访问，可能需要VPN

### Q3: 仍然显示emoji
**原因：** 数据格式不对或后备逻辑触发

**解决：**
- 检查 `typeof match.items[0]` 是否是 `'number'`
- 检查 `match.items[0] > 0` 是否为 `true`
- 如果是0，会显示空格（正常）
- 如果是字符串，会显示emoji（需要转换）

## 快速诊断

在浏览器控制台运行：

```javascript
// 1. 检查数据类型
const match = playerData.matchHistory[0];
console.log('Items type:', typeof match.items);
console.log('Items value:', match.items);
console.log('First item type:', typeof match.items[0]);
console.log('Rune type:', typeof match.rune);
console.log('Rune value:', match.rune);

// 2. 检查图片URL
const DD_CDN = 'https://ddragon.leagueoflegends.com/cdn/14.1.1';
console.log('Item URL:', `${DD_CDN}/img/item/${match.items[0]}.png`);
console.log('Champion URL:', `${DD_CDN}/img/champion/${match.championId}.png`);

// 3. 测试图片加载
const img = new Image();
img.onload = () => console.log('✅ Image loaded successfully');
img.onerror = () => console.log('❌ Image failed to load');
img.src = `${DD_CDN}/img/item/1001.png`;
```

## 需要我做什么？

请告诉我：

1. **浏览器控制台显示什么？**
   - 运行上面的诊断代码
   - 截图或复制输出

2. **AWS返回的数据格式是什么？**
   - `match.items` 是数组还是字符串？
   - `match.rune` 是数字还是字符串？

3. **Network标签显示什么？**
   - 有404错误吗？
   - 有CORS错误吗？

告诉我这些信息，我就能精确修复问题！🔧
