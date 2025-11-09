# 🎮 装备图标本地化设置指南

## 问题说明

装备图标从 Data Dragon CDN 加载可能会失败，导致显示不完整。

## 解决方案

将装备图标下载到本地 `public/items/` 目录，优先使用本地图标。

## 📥 下载装备图标

### 方法 1: 使用自动脚本（推荐）

```bash
node scripts/download-item-icons.js
```

这个脚本会：
- 自动创建 `public/items/` 目录
- 下载 200+ 个常用装备图标
- 跳过已存在的文件
- 显示下载进度

### 方法 2: 手动下载

如果你只需要特定装备的图标：

1. 创建目录：
```bash
mkdir -p public/items
```

2. 访问 Data Dragon CDN 下载图标：
```
https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/{ITEM_ID}.png
```

例如：
- 幽梦之灵: `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/3142.png`
- 黑色切割者: `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/3071.png`

3. 将下载的图标保存到 `public/items/` 目录，文件名为 `{ITEM_ID}.png`

## 🔄 图标加载逻辑

代码会按以下顺序尝试加载图标：

1. **本地图标**: `/items/{ITEM_ID}.png`
2. **CDN 备用**: `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/{ITEM_ID}.png`
3. **最终后备**: 显示装备ID数字

## 📁 目录结构

```
your-project/
├── public/
│   └── items/           # 装备图标目录
│       ├── 1001.png     # 鞋子
│       ├── 1037.png     # 长剑
│       ├── 3142.png     # 幽梦之灵
│       └── ...
├── scripts/
│   └── download-item-icons.js  # 下载脚本
└── src/
    └── components/
        └── CyberMatchCard.tsx  # 使用图标的组件
```

## ✅ 验证安装

下载完成后，检查：

```bash
# Windows
dir public\items

# Linux/Mac
ls -la public/items
```

你应该看到类似这样的输出：
```
1001.png
1004.png
1006.png
...
3142.png
3071.png
...
```

## 🎯 常见装备ID参考

| 装备名称 | ID |
|---------|-----|
| 鞋子 | 1001 |
| 长剑 | 1037 |
| 暴风大剑 | 1038 |
| 幽梦之灵 | 3142 |
| 黑色切割者 | 3071 |
| 无尽之刃 | 3031 |
| 破败王者之刃 | 3153 |
| 守护天使 | 3026 |
| 饮血剑 | 3072 |
| 三相之力 | 3078 |

## 🔧 故障排除

### 图标仍然不显示？

1. **检查文件路径**：确保图标在 `public/items/` 目录
2. **检查文件名**：文件名必须是 `{ITEM_ID}.png`（例如 `3142.png`）
3. **重启开发服务器**：
   ```bash
   # 停止服务器 (Ctrl+C)
   npm run dev
   ```
4. **清除浏览器缓存**：按 `Ctrl+Shift+R` 强制刷新

### 下载脚本失败？

如果网络问题导致下载失败，可以：
1. 使用 VPN
2. 手动下载最常用的装备图标
3. 使用镜像 CDN（如果有）

## 📊 性能优化

本地图标的优势：
- ✅ 加载速度更快
- ✅ 不依赖外部CDN
- ✅ 离线也能显示
- ✅ 减少网络请求

## 🔄 更新图标

当游戏版本更新时：

1. 修改 `scripts/download-item-icons.js` 中的版本号：
   ```javascript
   const DD_VERSION = '14.2.1'; // 更新版本
   ```

2. 删除旧图标：
   ```bash
   # Windows
   rmdir /s /q public\items
   
   # Linux/Mac
   rm -rf public/items
   ```

3. 重新下载：
   ```bash
   node scripts/download-item-icons.js
   ```

## 💡 提示

- 脚本会自动跳过已存在的文件，可以安全地多次运行
- 如果只需要部分图标，可以编辑 `commonItemIds` 数组
- 图标文件很小（每个约 1-3 KB），下载全部也不会占用太多空间

---

**完成后，装备图标应该能正常显示了！** 🎉
