/**
 * 测试战术分析数据流
 * 
 * 这个脚本模拟前端发送的请求，验证 Lambda 是否正确路由
 */

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'YOUR_LAMBDA_URL_HERE';

// 模拟比赛数据
const mockGameData = {
  myTeam: [
    { championName: 'Volibear', role: 'TOP', kda: '1/9/2', totalDamageDealtToChampions: 15000, totalDamageTaken: 35000, teamId: 100 },
    { championName: 'Kayn', role: 'JUNGLE', kda: '5/3/8', totalDamageDealtToChampions: 25000, totalDamageTaken: 20000, teamId: 100 },
    { championName: 'Ahri', role: 'MIDDLE', kda: '8/2/6', totalDamageDealtToChampions: 30000, totalDamageTaken: 15000, teamId: 100 },
    { championName: 'Jinx', role: 'BOTTOM', kda: '12/5/4', totalDamageDealtToChampions: 40000, totalDamageTaken: 18000, teamId: 100 },
    { championName: 'Thresh', role: 'UTILITY', kda: '2/6/15', totalDamageDealtToChampions: 8000, totalDamageTaken: 22000, teamId: 100 }
  ],
  enemyTeam: [
    { championName: 'Darius', role: 'TOP', kda: '10/2/5', totalDamageDealtToChampions: 28000, totalDamageTaken: 25000, teamId: 200 },
    { championName: 'Graves', role: 'JUNGLE', kda: '7/4/8', totalDamageDealtToChampions: 22000, totalDamageTaken: 18000, teamId: 200 },
    { championName: 'Zed', role: 'MIDDLE', kda: '9/3/6', totalDamageDealtToChampions: 26000, totalDamageTaken: 16000, teamId: 200 },
    { championName: 'Draven', role: 'BOTTOM', kda: '11/4/7', totalDamageDealtToChampions: 35000, totalDamageTaken: 14000, teamId: 200 },
    { championName: 'Pyke', role: 'UTILITY', kda: '5/5/12', totalDamageDealtToChampions: 15000, totalDamageTaken: 20000, teamId: 200 }
  ],
  player: {
    championName: 'Volibear',
    role: 'TOP',
    scoreboard: {
      kda: '1/9/2',
      cs: 180,
      csPerMin: 5.2,
      gameDurationMinutes: 35,
      finalItems: [3047, 3075, 3111, 3143, 3065, 3068],
      damageDealt: 15000,
      damageTaken: 35000,
      visionScore: 25,
      championLevel: 16
    }
  },
  gameResult: 'Loss'
};

// 测试 1: 战术分析请求（应该路由到 Game Insights）
async function testTacticalAnalysis() {
  console.log('\n=== 测试 1: 战术分析请求 ===\n');
  
  const gameDataString = JSON.stringify(mockGameData, null, 2);
  
  const specialUserMessage = `Here is the match data. Please provide a BRUTALLY HONEST tactical analysis
based on my performance, my team comp, the enemy comp, and my build.
Follow the analysis categories from your system instructions.

<match_data>
${gameDataString}
</match_data>`;

  const requestBody = {
    question: specialUserMessage,
    data: {
      PlayerID: 'test-player-123',
      playerId: 'test-player-123',
      chatHistory: []
    }
  };

  console.log('📤 发送请求到:', CHAT_URL);
  console.log('📦 请求包含 <match_data> 标签:', specialUserMessage.includes('<match_data>'));
  console.log('📊 比赛数据:', {
    champion: mockGameData.player.championName,
    kda: mockGameData.player.scoreboard.kda,
    enemyTeam: mockGameData.enemyTeam.map(p => p.championName).join(', ')
  });

  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ 成功！Lambda 响应:');
      console.log('---');
      console.log(data.aiResponse.substring(0, 500) + '...');
      console.log('---');
      
      // 验证响应内容
      const aiResponse = data.aiResponse;
      const checks = {
        '包含 Volibear': aiResponse.includes('Volibear'),
        '包含 1/9/2 KDA': aiResponse.includes('1/9/2') || aiResponse.includes('1-9-2'),
        '包含敌方英雄': aiResponse.includes('Darius') || aiResponse.includes('Graves'),
        '包含战术标签': aiResponse.includes('[WARNING]') || aiResponse.includes('[CRITICAL]'),
        '提到装备': aiResponse.includes('item') || aiResponse.includes('build')
      };
      
      console.log('\n📋 内容验证:');
      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`  ${passed ? '✅' : '❌'} ${check}`);
      });
      
      const allPassed = Object.values(checks).every(v => v);
      if (allPassed) {
        console.log('\n🎉 所有检查通过！AI 正确分析了当前比赛数据。');
      } else {
        console.log('\n⚠️  部分检查失败。请检查 Lambda 是否正确路由到战术分析模式。');
      }
    } else {
      console.log('\n❌ 错误:', data.error);
    }
  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
    console.log('\n💡 提示: 请确保在 .env.local 中设置了 NEXT_PUBLIC_CHAT_API_URL');
  }
}

// 测试 2: 普通聊天请求（应该路由到 AI Bot）
async function testNormalChat() {
  console.log('\n=== 测试 2: 普通聊天请求 ===\n');
  
  const requestBody = {
    question: 'How is my overall performance this season?',
    data: {
      PlayerID: 'test-player-123',
      playerId: 'test-player-123',
      chatHistory: []
    }
  };

  console.log('📤 发送请求到:', CHAT_URL);
  console.log('📦 请求不包含 <match_data> 标签');
  console.log('💬 问题:', requestBody.question);

  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ 成功！Lambda 响应:');
      console.log('---');
      console.log(data.aiResponse.substring(0, 300) + '...');
      console.log('---');
      console.log('\n📋 这应该是基于 DynamoDB 年度数据的分析（不是单场比赛）');
    } else {
      console.log('\n❌ 错误:', data.error);
      if (data.error.includes('Player not found')) {
        console.log('💡 这是正常的 - 测试玩家不在 DynamoDB 中');
      }
    }
  } catch (error) {
    console.error('\n❌ 请求失败:', error.message);
  }
}

// 运行测试
async function runTests() {
  console.log('🧪 开始测试战术分析数据流...\n');
  console.log('=' .repeat(60));
  
  await testTacticalAnalysis();
  
  console.log('\n' + '='.repeat(60));
  
  await testNormalChat();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n✨ 测试完成！\n');
}

// 如果直接运行此脚本
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testTacticalAnalysis, testNormalChat };
