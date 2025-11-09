# Debug Guide - Champions & Icons Not Showing 🔍

## 问题症状

1. **某些 Champions 记录没有显示**
2. **某些装备图标不见了**

## 调试步骤

### Step 1: 打开浏览器控制台

按 `F12` 打开开发者工具，查看 Console 标签。

### Step 2: 查看调试日志

当你点击一个比赛卡片时，应该看到：

```javascript
[CyberMatchDetailModal] matchData: {...}
[CyberMatchDetailModal] championName: "Kayn"
[CyberMatchDetailModal] items: [3174, 6692, 3071, ...]
```

### Step 3: 检查数据

#### 检查 Champion 名称
```javascript
// 在控制台输入：
console.log(matchData.championName);
// 应该输出: "Kayn", "Lee Sin", 等等
```

#### 检查装备 IDs
```javascript
// 在控制台输入：
console.log(matchData.item0, matchData.item1, matchData.item2);
// 应该输出: 3174 6692 3071 (数字)
// 如果输出 undefined 或 null，说明数据有问题
```

### Step 4: 检查图标 URL

在 Network 标签中：
1. 筛选 "img"
2. 查看失败的请求（红色）
3. 点击查看详情

常见失败原因：
- **404 Not Found** - 装备 ID 不存在或版本不对
- **CORS Error** - 跨域问题
- **Timeout** - 网络慢

## 常见问题 & 解决方案

### 问题 1: Champions 不显示

**可能原因：**
1. `championName` 字段缺失
2. Champion 名称映射错误（如 "Lee Sin" vs "LeeSin"）
3. 数据为 null 或 undefined

**解决方案：**
```javascript
// 检查数据
console.log('All matches:', Matches);
console.log('Match 0 champion:', Matches[0]?.championName);

// 如果 championName 是 undefined，检查原始数据
console.log('Raw match data:', playerData.matchHistory[0]);
```

### 问题 2: 装备图标不显示

**可能原因：**
1. `item0-item6` 是字符串而不是数字
2. 装备 ID 是 0（空槽位）
3. Data Dragon 版本不对
4. 图片加载失败

**解决方案：**

#### A. 检查装备 ID 类型
```javascript
console.log(typeof matchData.item0); // 应该是 "number"
console.log(matchData.item0); // 应该是数字，如 3174
```

#### B. 测试图标 URL
在浏览器新标签页打开：
```
https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/3174.png
```

如果打不开，尝试：
```
https://ddragon.leagueoflegends.com/cdn/14.22.1/img/item/3174.png
```

或使用 latest：
```
https://ddragon.leagueoflegends.com/cdn/latest/img/item/3174.png
```

#### C. 检查是否有备用显示
如果图标加载失败，应该显示装备 ID（如 "3174"）。
如果连 ID 都没显示，说明数据本身有问题。

### 问题 3: 只有部分比赛显示

**可能原因：**
1. 某些比赛数据不完整
2. 过滤条件太严格
3. 数据转换错误

**解决方案：**
```javascript
// 检查所有比赛
console.log('Total matches:', Matches.length);

// 检查每场比赛的必需字段
Matches.forEach((match, idx) => {
  if (!match.championName) {
    console.log(`Match ${idx} missing championName:`, match);
  }
  if (!match.kills && match.kills !== 0) {
    console.log(`Match ${idx} missing kills:`, match);
  }
});
```

## 数据结构检查清单

### ✅ 必需字段（Match History）
```javascript
{
  matchId: "EUW1_7557497334",
  championName: "Kayn",        // ✅ 必需
  win: true,                   // ✅ 必需
  kills: 13,                   // ✅ 必需
  deaths: 4,                   // ✅ 必需
  assists: 6,                  // ✅ 必需
  cs: 288,                     // ✅ 必需
  gold: 16227,                 // ✅ 必需
  damage: 28384,               // ✅ 必需
  visionScore: 11,             // ✅ 必需
  position: "JUNGLE",          // ✅ 必需
  item0: 3174,                 // ⚠️ 可选，但应该是数字
  item1: 6692,
  item2: 3071,
  item3: 3161,
  item4: 3065,
  item5: 0,
  item6: 3364,
  gameDurationInSec: 2280      // ✅ 必需
}
```

### ✅ 可选字段（增强数据）
```javascript
{
  championLevel: 18,           // 可选
  csPerMin: "7.78",           // 可选
  participants: [...]          // 可选（10人数据）
}
```

## 快速修复

### 修复 1: 更新 Data Dragon 版本

在所有组件中，将：
```typescript
const DD_VERSION = '14.23.1';
```

改为：
```typescript
const DD_VERSION = '14.24.1'; // 或最新版本
```

### 修复 2: 添加数据验证

在 `page.js` 中，添加数据过滤：
```javascript
const Matches = (playerData.matchHistory || [])
  .filter(match => match.championName && match.kills !== undefined)
  .map(match => ({
    ...match,
    items: [
      Number(match.item0) || 0,
      Number(match.item1) || 0,
      Number(match.item2) || 0,
      Number(match.item3) || 0,
      Number(match.item4) || 0,
      Number(match.item5) || 0
    ],
  }));
```

### 修复 3: 添加错误边界

在 Modal 中添加错误处理：
```typescript
if (!matchData.championName) {
  return (
    <div className="text-red-500">
      Error: Champion name missing
    </div>
  );
}
```

## 测试命令

### 在浏览器控制台运行：

```javascript
// 1. 检查玩家数据
console.log('Player data:', playerData);

// 2. 检查比赛数据
console.log('Matches:', Matches);

// 3. 检查第一场比赛
console.log('First match:', Matches[0]);

// 4. 检查装备
console.log('First match items:', [
  Matches[0].item0,
  Matches[0].item1,
  Matches[0].item2,
  Matches[0].item3,
  Matches[0].item4,
  Matches[0].item5,
  Matches[0].item6
]);

// 5. 测试图标 URL
const testUrl = `https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/${Matches[0].item0}.png`;
console.log('Test URL:', testUrl);
// 复制 URL 到新标签页测试
```

## 下一步

如果问题仍然存在，请提供：

1. **控制台日志截图**
2. **Network 标签中失败的请求**
3. **一个有问题的比赛数据示例**

然后我可以提供更具体的修复方案。

---

**Last Updated:** 2025-11-09  
**Status:** Debug logging added  
**Version:** v1.3.0
