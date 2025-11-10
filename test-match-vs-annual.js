// 测试单场比赛分析 vs 年度统计分析
const CHAT_URL = 'https://t4k80w31b3.execute-api.ap-southeast-2.amazonaws.com/v1/chat';
const PLAYER_ID = '7LN0MfN51RJVbUlncFaZQC664RAMd9vNNwevKyB9hpFK9kwV3Gx_OL-dpPUKMWy5EuLpMGHIkPKcaw';

// 模拟比赛数据
const mockMatchData = {
  championName: 'Jax',
  win: false,
  kills: 2,
  deaths: 9,
  assists: 3,
  cs: 120,
  totalMinionsKilled: 120,
  gameDurationInSec: 1800,  // 30 minutes
  gameDuration: 1800,
  item0: 3047,  // Ninja Tabi
  item1: 3078,  // Trinity Force
  item2: 3153,  // BOTRK
  item3: 0,
  item4: 0,
  item5: 0,
  item6: 0,
  totalDamageDealtToChampions: 15000,
  damage: 15000,
  totalDamageTaken: 25000,
  goldEarned: 10000,
  visionScore: 15,
  teamId: 100,
  participants: [
    // Your team (100)
    { championName: 'Jax', teamId: 100, kills: 2, deaths: 9, assists: 3, totalDamageDealtToChampions: 15000 },
    { championName: 'Teemo', teamId: 100, kills: 1, deaths: 8, assists: 2, totalDamageDealtToChampions: 8000 },
    { championName: 'Master Yi', teamId: 100, kills: 3, deaths: 7, assists: 1, totalDamageDealtToChampions: 12000 },
    { championName: 'Ashe', teamId: 100, kills: 2, deaths: 8, assists: 4, totalDamageDealtToChampions: 10000 },
    { championName: 'Lux', teamId: 100, kills: 1, deaths: 9, assists: 3, totalDamageDealtToChampions: 9000 },
    // Enemy team (200)
    { championName: 'Darius', teamId: 200, kills: 8, deaths: 2, assists: 5, totalDamageDealtToChampions: 20000 },
    { championName: 'Zed', teamId: 200, kills: 9, deaths: 1, assists: 6, totalDamageDealtToChampions: 25000 },
    { championName: 'Talon', teamId: 200, kills: 7, deaths: 2, assists: 7, totalDamageDealtToChampions: 18000 },
    { championName: 'Draven', teamId: 200, kills: 10, deaths: 1, assists: 4, totalDamageDealtToChampions: 30000 },
    { championName: 'Pyke', teamId: 200, kills: 6, deaths: 3, assists: 8, totalDamageDealtToChampions: 12000 }
  ]
};

async function testMatchAnalysis() {
  console.log('\n' + '='.repeat(80));
  console.log('🎮 测试 1: 单场比赛分析 (GAME INSIGHTS)');
  console.log('='.repeat(80));
  console.log('传递 matchData → 应该分析这场比赛的战术');
  console.log('预期：威胁评估、定位确认、对线策略、执行度、出装、团队角色、输赢归因\n');

  const requestBody = {
    question: "Analyze this match and provide tactical insights.",
    data: {
      PlayerID: PLAYER_ID,
      chatHistory: [],
      matchData: mockMatchData  // ← 关键：传递比赛数据
    }
  };

  try {
    const startTime = Date.now();
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    const endTime = Date.now();

    console.log(`📊 Status: ${response.status} (${endTime - startTime}ms)`);

    const data = await response.json();

    if (data.aiResponse) {
      console.log('✅ SUCCESS! Got response\n');
      
      // 检查是否包含单场比赛分析的关键词
      const response_lower = data.aiResponse.toLowerCase();
      
      const matchKeywords = [
        'threat assessment',
        'role confirmation',
        'lane strategy',
        'execution review',
        'build analysis',
        'team role',
        'win condition',
        'enemy team',
        'your team',
        'jax',  // 英雄名
        '2/9/3',  // KDA
        'full ad',  // 敌方阵容
        '菜刀队'
      ];
      
      console.log('🔍 检查单场比赛分析关键词:');
      let foundCount = 0;
      for (const keyword of matchKeywords) {
        const found = response_lower.includes(keyword.toLowerCase());
        if (found) {
          console.log(`  ✅ "${keyword}"`);
          foundCount++;
        }
      }
      console.log(`\n📈 关键词匹配: ${foundCount}/${matchKeywords.length}`);
      
      // 检查是否错误地提到年度统计
      const annualKeywords = ['annual', 'overall performance', 'total games', 'champion pool'];
      const mentionsAnnual = annualKeywords.some(kw => response_lower.includes(kw));
      
      if (mentionsAnnual) {
        console.log('\n⚠️  WARNING: Response mentions annual statistics!');
        console.log('   This should be SINGLE MATCH analysis only.');
      } else {
        console.log('\n✅ Good: No annual statistics references found.');
      }
      
      // 显示回复预览
      console.log('\n📝 Response Preview (first 800 chars):');
      console.log('─'.repeat(80));
      console.log(data.aiResponse.substring(0, 800));
      console.log('─'.repeat(80));
      
      if (foundCount >= 5 && !mentionsAnnual) {
        console.log('\n🎉 EXCELLENT! This is a proper SINGLE MATCH analysis!');
      } else {
        console.log('\n❌ FAILED: Response does not focus on single match analysis.');
      }
      
    } else if (data.error) {
      console.log(`❌ ERROR: ${data.error}`);
    }

  } catch (error) {
    console.log(`❌ FETCH ERROR: ${error.message}`);
  }
}

async function testAnnualAnalysis() {
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 测试 2: 年度统计分析 (AI BOT)');
  console.log('='.repeat(80));
  console.log('不传递 matchData → 应该分析整体表现');
  console.log('预期：整体表现、英雄池、补刀效率、视野控制、一致性\n');

  const requestBody = {
    question: "Performance summary",
    data: {
      PlayerID: PLAYER_ID,
      chatHistory: []
      // 没有 matchData
    }
  };

  try {
    const startTime = Date.now();
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    const endTime = Date.now();

    console.log(`📊 Status: ${response.status} (${endTime - startTime}ms)`);

    const data = await response.json();

    if (data.aiResponse) {
      console.log('✅ SUCCESS! Got response\n');
      
      // 检查是否包含年度统计分析的关键词
      const response_lower = data.aiResponse.toLowerCase();
      
      const annualKeywords = [
        'overall performance',
        'champion pool',
        'farming efficiency',
        'vision control',
        'consistency',
        'win rate',
        'total games',
        'average',
        'volibear',
        'kayn'
      ];
      
      console.log('🔍 检查年度统计分析关键词:');
      let foundCount = 0;
      for (const keyword of annualKeywords) {
        const found = response_lower.includes(keyword.toLowerCase());
        if (found) {
          console.log(`  ✅ "${keyword}"`);
          foundCount++;
        }
      }
      console.log(`\n📈 关键词匹配: ${foundCount}/${annualKeywords.length}`);
      
      // 检查是否错误地提到单场比赛
      const matchKeywords = ['this match', 'this game', 'enemy team had', 'your team had'];
      const mentionsMatch = matchKeywords.some(kw => response_lower.includes(kw));
      
      if (mentionsMatch) {
        console.log('\n⚠️  WARNING: Response mentions single match analysis!');
        console.log('   This should be ANNUAL STATISTICS analysis only.');
      } else {
        console.log('\n✅ Good: No single match references found.');
      }
      
      // 显示回复预览
      console.log('\n📝 Response Preview (first 800 chars):');
      console.log('─'.repeat(80));
      console.log(data.aiResponse.substring(0, 800));
      console.log('─'.repeat(80));
      
      if (foundCount >= 5 && !mentionsMatch) {
        console.log('\n🎉 EXCELLENT! This is a proper ANNUAL STATISTICS analysis!');
      } else {
        console.log('\n❌ FAILED: Response does not focus on annual statistics.');
      }
      
    } else if (data.error) {
      console.log(`❌ ERROR: ${data.error}`);
    }

  } catch (error) {
    console.log(`❌ FETCH ERROR: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 测试单场比赛分析 vs 年度统计分析\n');
  
  await testMatchAnalysis();
  await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒
  
  await testAnnualAnalysis();

  console.log('\n\n' + '='.repeat(80));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log('\n单场比赛分析应该包含:');
  console.log('  ✅ 威胁评估 (Threat Assessment)');
  console.log('  ✅ 定位确认 (Role Confirmation)');
  console.log('  ✅ 对线策略 (Lane Strategy)');
  console.log('  ✅ 执行度复盘 (Execution Review)');
  console.log('  ✅ 出装分析 (Build Analysis)');
  console.log('  ✅ 团队角色 (Team Role Performance)');
  console.log('  ✅ 输赢归因 (Win Condition Analysis)');
  console.log('\n年度统计分析应该包含:');
  console.log('  ✅ 整体表现 (Overall Performance)');
  console.log('  ✅ 英雄池分析 (Champion Pool Analysis)');
  console.log('  ✅ 补刀效率 (Farming Efficiency)');
  console.log('  ✅ 视野控制 (Vision Control)');
  console.log('  ✅ 一致性分析 (Consistency Analysis)');
  console.log('\n');
}

runTests();
