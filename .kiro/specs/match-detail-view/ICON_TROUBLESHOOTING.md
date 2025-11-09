# Icon Display Troubleshooting Guide 🔍

## Common Issues & Solutions

### Issue 1: Item Icons Not Loading

**Symptoms:**
- Empty boxes where item icons should be
- Only item IDs showing (numbers like "3174")

**Possible Causes:**

1. **Data Dragon Version Mismatch**
   - Current version: `14.23.1`
   - Some items might not exist in this version
   - Solution: Update to latest version or use `latest` keyword

2. **CORS Issues**
   - Browser blocking cross-origin requests
   - Check browser console for CORS errors
   - Solution: Use Next.js Image component or proxy

3. **Invalid Item IDs**
   - Item ID is 0 or undefined
   - Item was removed from the game
   - Solution: Already handled - shows empty slot

4. **Network Issues**
   - Slow connection
   - CDN temporarily down
   - Solution: Add loading states and retry logic

### Issue 2: Champion Icons Not Loading

**Symptoms:**
- Champion portraits not showing
- Only champion level number visible

**Solutions:**

1. **Check Champion Name Mapping**
   ```typescript
   const nameMap: Record<string, string> = {
     'Lee Sin': 'LeeSin',
     'Twisted Fate': 'TwistedFate',
     // ... etc
   };
   ```

2. **Verify URL Format**
   ```
   https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/LeeSin.png
   ```

### Current Implementation

#### Fallback System
When an icon fails to load:
1. Image is hidden
2. Item ID is displayed as text
3. Cyan color (#00ffff) for visibility

#### Example URLs Being Used

**Items:**
```
https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/3174.png
https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/6692.png
```

**Champions:**
```
https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/Kayn.png
https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/LeeSin.png
```

## Testing Steps

### 1. Check Browser Console
```javascript
// Open browser console (F12)
// Look for errors like:
// - "Failed to load resource"
// - "CORS policy"
// - "404 Not Found"
```

### 2. Test Individual URLs
Open these URLs directly in browser:
- https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/3174.png
- https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/Kayn.png

If they don't load, the version might be wrong.

### 3. Check Latest Version
Visit: https://ddragon.leagueoflegends.com/api/versions.json

This returns an array like:
```json
["14.23.1", "14.22.1", "14.21.1", ...]
```

Use the first one (latest).

### 4. Verify Item IDs
Check if item IDs in your data are valid:
```javascript
// In browser console on your app:
console.log(matchData.item0); // Should be a number > 0
console.log(matchData.item1); // etc.
```

## Quick Fixes

### Fix 1: Update to Latest Version

In all components, change:
```typescript
const DD_VERSION = '14.23.1';
```

To:
```typescript
const DD_VERSION = 'latest'; // Always use latest
```

Or fetch dynamically:
```typescript
const DD_VERSION = '14.24.1'; // Update to current patch
```

### Fix 2: Add Better Error Handling

Already implemented! When icons fail:
- Item ID shows as text
- Cyan color for visibility
- No broken image icon

### Fix 3: Use Next.js Image Component

Replace `<img>` with Next.js `<Image>`:
```typescript
import Image from 'next/image';

<Image
  src={`${DD_CDN}/img/item/${id}.png`}
  alt={`Item ${id}`}
  width={56}
  height={56}
  unoptimized // For external URLs
  onError={...}
/>
```

### Fix 4: Add Image Proxy

Create `next.config.js`:
```javascript
module.exports = {
  images: {
    domains: ['ddragon.leagueoflegends.com'],
  },
}
```

## Debugging Commands

### Check if images are accessible:
```bash
# Test item icon
curl -I https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/3174.png

# Test champion icon
curl -I https://ddragon.leagueoflegends.com/cdn/14.23.1/img/champion/Kayn.png
```

### Check Data Dragon API:
```bash
# Get latest version
curl https://ddragon.leagueoflegends.com/api/versions.json

# Get all items
curl https://ddragon.leagueoflegends.com/cdn/14.23.1/data/en_US/item.json
```

## Expected Behavior

### When Icons Load Successfully:
- ✅ Item images display clearly
- ✅ Champion portraits show
- ✅ Hover shows item name (future feature)

### When Icons Fail to Load:
- ✅ Item ID shows as text (e.g., "3174")
- ✅ Cyan color for visibility
- ✅ No broken image icon
- ✅ Layout doesn't break

## Files to Check

1. **`src/components/CyberMatchDetailModal.tsx`**
   - Line ~18: DD_VERSION constant
   - Line ~340: Item icon rendering

2. **`src/components/TeamRosterDisplay.tsx`**
   - Line ~10: DD_VERSION constant
   - Line ~170: Item icon rendering

3. **`src/components/CyberMatchCard.tsx`**
   - Check if it also uses icons

## Next Steps

If icons still don't show:

1. **Check your data**
   ```javascript
   console.log('Match data:', matchData);
   console.log('Item 0:', matchData.item0);
   ```

2. **Verify network**
   - Open Network tab in DevTools
   - Filter by "img"
   - See which requests fail

3. **Try different version**
   - Change `14.23.1` to `14.22.1`
   - Or use `latest`

4. **Check participants data**
   ```javascript
   console.log('Has participants:', matchData.participants?.length);
   console.log('First player items:', matchData.participants?.[0]);
   ```

---

**Last Updated:** 2025-11-09  
**Status:** Fallback system implemented  
**Version:** v1.2.0
