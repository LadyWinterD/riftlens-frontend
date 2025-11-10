// 测试预设问题是否基于年度统计分析
const CHAT_URL = 'https://t4k80w31b3.execute-api.ap-southeast-2.amazonaws.com/v1/chat';

const presetQuestions = [
  {
    name: "Performance Summary",
    question: "Performance summary",
    expectedKeywords: ["win rate", "KDA", "annual", "overall", "games", "52%", "3.5"]
  },
  {
    name: "Champion Pool Analysis",
    question: "Champion pool analysis",
    expectedKeywords: ["Volibear", "Kayn", "champion", "games", "win rate", "focus"]
  },
  {
    name: "Full System Diagnostic",
    question: "Full system diagnostic",
    expectedKeywords: ["win rate", "KDA", "CS", "vision", "champion", "overall"]
  },
  {
    name: "What Am I Doing Wrong",
    question: "What am I doing wrong?",
    expectedKeywords: ["improve", "focus", "practice", "win rate", "KDA"]
  }
];

async function testPresetQuestion(preset) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 Testing: ${preset.name}`);
  console.log(`📝 Question: "${preset.question}"`);
  console.log('='.repeat(80));

  const testData = {
    question: preset.question,
    data: {
      PlayerID: "7LN0MfN51RJVbUlncFaZQC664RAMd9vNNwevKyB9hpFK9kwV3Gx_OL-dpPUKMWy5EuLpMGHIkPKcaw",
      chatHistory: []
    }
  };

  try {
    const startTime = Date.now();
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    const endTime = Date.now();

    console.log(`\n📊 Status: ${response.status} (${endTime - startTime}ms)`);

    const data = await response.json();

    if (data.aiResponse) {
      console.log('✅ SUCCESS! Got response\n');
      
      // 检查是否基于年度统计
      const response_lower = data.aiResponse.toLowerCase();
      
      // 检查关键词
      console.log('🔍 Checking for annual statistics keywords:');
      let foundCount = 0;
      for (const keyword of preset.expectedKeywords) {
        const found = response_lower.includes(keyword.toLowerCase());
        console.log(`  ${found ? '✅' : '❌'} "${keyword}"`);
        if (found) foundCount++;
      }
      
      const percentage = (foundCount / preset.expectedKeywords.length * 100).toFixed(0);
      console.log(`\n📈 Keyword Match: ${foundCount}/${preset.expectedKeywords.length} (${percentage}%)`);
      
      // 检查是否提到单场比赛（不应该）
      const singleMatchKeywords = ['this match', 'this game', 'in this game', 'match id'];
      const mentionsSingleMatch = singleMatchKeywords.some(kw => response_lower.includes(kw));
      
      if (mentionsSingleMatch) {
        console.log('\n⚠️  WARNING: Response mentions single match analysis!');
        console.log('   This should be ANNUAL statistics analysis.');
      } else {
        console.log('\n✅ Good: No single match references found.');
      }
      
      // 检查格式标签
      const hasWarning = data.aiResponse.includes('[WARNING]');
      const hasCritical = data.aiResponse.includes('[CRITICAL]');
      const hasNotice = data.aiResponse.includes('[NOTICE]');
      const hasSuggestion = data.aiResponse.includes('[SUGGESTION]');
      
      console.log('\n🎨 Format Tags:');
      console.log(`  ${hasWarning ? '✅' : '❌'} [WARNING]`);
      console.log(`  ${hasCritical ? '✅' : '❌'} [CRITICAL]`);
      console.log(`  ${hasNotice ? '✅' : '❌'} [NOTICE]`);
      console.log(`  ${hasSuggestion ? '✅' : '❌'} [SUGGESTION]`);
      
      // 显示回复预览
      console.log('\n📝 Response Preview (first 500 chars):');
      console.log('─'.repeat(80));
      console.log(data.aiResponse.substring(0, 500));
      console.log('─'.repeat(80));
      
      // 总体评估
      if (percentage >= 60 && !mentionsSingleMatch && (hasWarning || hasCritical)) {
        console.log('\n🎉 EXCELLENT! This response analyzes ANNUAL statistics correctly!');
      } else if (percentage >= 40) {
        console.log('\n⚠️  PARTIAL: Response has some annual stats but could be better.');
      } else {
        console.log('\n❌ FAILED: Response does not focus on annual statistics.');
      }
      
    } else if (data.error) {
      console.log(`❌ ERROR: ${data.error}`);
    } else {
      console.log('❌ Unexpected response format');
    }

  } catch (error) {
    console.log(`❌ FETCH ERROR: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing Preset Questions - Annual Statistics Analysis\n');
  console.log('These questions should analyze OVERALL performance, not single matches.\n');
  
  for (const preset of presetQuestions) {
    await testPresetQuestion(preset);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log('\nAll preset questions should:');
  console.log('  ✅ Mention annual statistics (win rate, KDA, CS/min, etc.)');
  console.log('  ✅ Reference champion pool and game counts');
  console.log('  ✅ Provide long-term improvement advice');
  console.log('  ✅ NOT mention single match analysis');
  console.log('  ✅ Include format tags ([WARNING], [CRITICAL], etc.)');
  console.log('\n');
}

runTests();
