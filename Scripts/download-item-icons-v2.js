/**
 * 下载 League of Legends 装备图标到本地 (v2 - 从 item.json 获取真实ID)
 * 使用方法: node scripts/download-item-icons-v2.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DD_VERSION = '15.22.1';
const DD_CDN = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}`;
const ITEM_JSON_URL = `${DD_CDN}/data/en_US/item.json`;

// 创建目录
const itemsDir = path.join(__dirname, '..', 'public', 'items');
if (!fs.existsSync(itemsDir)) {
  fs.mkdirSync(itemsDir, { recursive: true });
}

// 获取 JSON 数据
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

// 下载单个图标
function downloadIcon(itemId) {
  return new Promise((resolve, reject) => {
    const url = `${DD_CDN}/img/item/${itemId}.png`;
    const filePath = path.join(itemsDir, `${itemId}.png`);

    // 如果文件已存在，跳过
    if (fs.existsSync(filePath)) {
      console.log(`✓ Skip ${itemId}.png (already exists)`);
      resolve();
      return;
    }

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✓ Downloaded ${itemId}.png`);
          resolve();
        });
      } else {
        console.log(`✗ Failed ${itemId}.png (${response.statusCode})`);
        resolve(); // 继续下载其他文件
      }
    }).on('error', (err) => {
      console.error(`✗ Error ${itemId}.png:`, err.message);
      resolve(); // 继续下载其他文件
    });
  });
}

// 主函数
async function downloadAll() {
  console.log(`📦 Fetching item data from Data Dragon v${DD_VERSION}...`);
  console.log(`🔗 ${ITEM_JSON_URL}\n`);

  try {
    // 获取装备数据
    const itemData = await fetchJSON(ITEM_JSON_URL);
    const itemIds = Object.keys(itemData.data);
    
    console.log(`✅ Found ${itemIds.length} items in the game\n`);
    console.log(`📁 Target directory: ${itemsDir}\n`);
    console.log(`⏳ Starting download...\n`);

    // 每次下载5个，避免并发过多
    const batchSize = 5;
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < itemIds.length; i += batchSize) {
      const batch = itemIds.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(async (itemId) => {
        const filePath = path.join(itemsDir, `${itemId}.png`);
        if (fs.existsSync(filePath)) {
          skipped++;
          return 'skip';
        }
        try {
          await downloadIcon(itemId);
          downloaded++;
          return 'success';
        } catch (err) {
          failed++;
          return 'fail';
        }
      }));
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Download complete!');
    console.log('='.repeat(50));
    console.log(`📊 Statistics:`);
    console.log(`   Total items: ${itemIds.length}`);
    console.log(`   Downloaded: ${downloaded}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`📁 Icons saved to: ${itemsDir}`);
    console.log('='.repeat(50));

  } catch (err) {
    console.error('❌ Error fetching item data:', err.message);
    console.log('\n⚠️  Falling back to manual item list...\n');
    
    // 如果 API 失败，使用备用列表
    const fallbackIds = [
      1001, 1004, 1006, 1011, 1018, 1026, 1027, 1028, 1029, 1031, 1033, 1036, 1037, 1038, 1042, 1043, 1052, 1053, 1054, 1055, 1056, 1057, 1058, 1082, 1083,
      2003, 2031, 2033, 2055, 2138, 2139, 2140,
      3003, 3004, 3006, 3009, 3011, 3020, 3024, 3026, 3031, 3033, 3035, 3036, 3040, 3042, 3046, 3047, 3050, 3051, 3053, 3057, 3065, 3066, 3067, 3068, 3071, 3072, 3074, 3075, 3076, 3077, 3078, 3082, 3085, 3086, 3087, 3089, 3091, 3094, 3095, 3100, 3102, 3105, 3107, 3108, 3109, 3110, 3113, 3114, 3115, 3116, 3119, 3121, 3124, 3133, 3134, 3135, 3139, 3142, 3143, 3145, 3152, 3153, 3155, 3156, 3157, 3158, 3161, 3165, 3172, 3181, 3184, 3190, 3193, 3211, 3222, 3504, 3508, 3742, 3748, 3801, 3802, 3803, 3814, 3850, 3851, 3853, 3854, 3855, 3857, 3858, 3859, 3860, 3862, 3863, 3864, 3865, 3866, 3867, 3868, 3869, 3870, 3871, 3876, 3877, 3901, 3902, 3903,
      4005, 4628, 4629, 4630, 4632, 4633, 4636, 4637, 4644, 4645,
      6609, 6610, 6616, 6617, 6620, 6621, 6630, 6631, 6632, 6653, 6655, 6656, 6657, 6662, 6664, 6665, 6667, 6671, 6672, 6673, 6675, 6676, 6691, 6692, 6693, 6694, 6695, 6696, 6697, 6698, 6699, 6700, 6701,
      7000, 7001, 7002, 7005, 7006, 7009, 7010, 7011, 7012, 7013, 7014, 7015, 7016, 7017, 7018, 7019, 7020, 7021, 7022, 7023
    ];
    
    console.log(`📦 Downloading ${fallbackIds.length} items from fallback list...\n`);
    
    const batchSize = 5;
    for (let i = 0; i < fallbackIds.length; i += batchSize) {
      const batch = fallbackIds.slice(i, i + batchSize);
      await Promise.all(batch.map(downloadIcon));
    }
    
    console.log('\n✅ Fallback download complete!');
  }
}

downloadAll().catch(console.error);
