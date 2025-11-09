/**
 * 下载 League of Legends 召唤师技能图标到本地
 * 使用方法: node scripts/download-summoner-spells.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DD_VERSION = '15.22.1';
const DD_CDN = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}`;
const SUMMONER_JSON_URL = `${DD_CDN}/data/en_US/summoner.json`;

// 创建目录
const spellsDir = path.join(__dirname, '..', 'public', 'spells');
if (!fs.existsSync(spellsDir)) {
  fs.mkdirSync(spellsDir, { recursive: true });
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
function downloadIcon(spellKey, spellName) {
  return new Promise((resolve, reject) => {
    const url = `${DD_CDN}/img/spell/${spellKey}.png`;
    const filePath = path.join(spellsDir, `${spellKey}.png`);

    // 如果文件已存在，跳过
    if (fs.existsSync(filePath)) {
      console.log(`✓ Skip ${spellKey}.png (already exists)`);
      resolve();
      return;
    }

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✓ Downloaded ${spellKey}.png - ${spellName}`);
          resolve();
        });
      } else {
        console.log(`✗ Failed ${spellKey}.png (${response.statusCode})`);
        resolve();
      }
    }).on('error', (err) => {
      console.error(`✗ Error ${spellKey}.png:`, err.message);
      resolve();
    });
  });
}

// 主函数
async function downloadAll() {
  console.log(`📦 Fetching summoner spell data from Data Dragon v${DD_VERSION}...`);
  console.log(`🔗 ${SUMMONER_JSON_URL}\n`);

  try {
    // 获取召唤师技能数据
    const summonerData = await fetchJSON(SUMMONER_JSON_URL);
    const spells = Object.values(summonerData.data);
    
    console.log(`✅ Found ${spells.length} summoner spells\n`);
    console.log(`📁 Target directory: ${spellsDir}\n`);
    console.log(`⏳ Starting download...\n`);

    // 生成 ID 映射表
    const idMapping = {};
    spells.forEach(spell => {
      idMapping[spell.key] = {
        id: spell.id,
        name: spell.name,
        description: spell.description
      };
    });

    // 下载所有图标
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const spell of spells) {
      const filePath = path.join(spellsDir, `${spell.id}.png`);
      if (fs.existsSync(filePath)) {
        skipped++;
        console.log(`✓ Skip ${spell.id}.png (already exists)`);
      } else {
        try {
          await downloadIcon(spell.id, spell.name);
          downloaded++;
        } catch (err) {
          failed++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Download complete!');
    console.log('='.repeat(60));
    console.log(`📊 Statistics:`);
    console.log(`   Total spells: ${spells.length}`);
    console.log(`   Downloaded: ${downloaded}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`📁 Icons saved to: ${spellsDir}`);
    console.log('='.repeat(60));

    // 生成映射文件
    const mappingFilePath = path.join(__dirname, 'summoner-spell-mapping.json');
    fs.writeFileSync(mappingFilePath, JSON.stringify(idMapping, null, 2));
    console.log(`\n📝 ID mapping saved to: ${mappingFilePath}`);

    // 生成 TypeScript 代码
    console.log('\n📋 TypeScript mapping code:');
    console.log('='.repeat(60));
    console.log('const SUMMONER_SPELL_MAP: Record<number, string> = {');
    Object.entries(idMapping)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .forEach(([key, value]) => {
        console.log(`  ${key}: '${value.id}',  // ${value.name}`);
      });
    console.log('};');
    console.log('='.repeat(60));

  } catch (err) {
    console.error('❌ Error fetching summoner spell data:', err.message);
  }
}

downloadAll().catch(console.error);
