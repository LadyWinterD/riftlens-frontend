// 快速测试 API 连接
const CHAT_URL = 'https://t4k80w31b3.execute-api.ap-southeast-2.amazonaws.com/v1/chat';

const testData = {
  question: "请提供一个完整的战术分析。使用 [WARNING], [CRITICAL], <item>, <champion>, <stat> 标签，并包含 emoji。",
  data: {
    PlayerID: "7LN0MfN51RJVbUlncFaZQC664RAMd9vNNwevKyB9hpFK9kwV3Gx_OL-dpPUKMWy5EuLpMGHIkPKcaw",
    playerName: "TestPlayer",
    annualStats: {
      winRate: 0.52,
      avgKDA: 3.5,
      avgCsPerMin: 6.2,
      avgVisionPerMin: 1.2,
      totalGames: 100,
      championCounts: {
        "Volibear": 50,
        "Kayn": 30
      }
    },
    worstGameStats: {
      matchId: "TEST_123",
      championName: "Volibear",
      kills: 2,
      deaths: 10,
      assists: 3,
      kda: 0.5
    },
    chatHistory: []
  }
};

console.log('🔍 Testing API endpoint:', CHAT_URL);
console.log('📤 Sending request...\n');

fetch(CHAT_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
  .then(response => {
    console.log('📊 Response Status:', response.status);
    console.log('✅ Response OK:', response.ok);
    return response.json();
  })
  .then(data => {
    console.log('\n📥 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.aiResponse) {
      console.log('\n✅ SUCCESS! AI Response received:');
      console.log('─'.repeat(60));
      console.log(data.aiResponse);
      console.log('─'.repeat(60));
      
      // 检查格式化标签
      const hasWarning = data.aiResponse.includes('[WARNING]');
      const hasCritical = data.aiResponse.includes('[CRITICAL]');
      const hasItem = data.aiResponse.includes('<item>');
      const hasChampion = data.aiResponse.includes('<champion>');
      const hasStat = data.aiResponse.includes('<stat>');
      
      console.log('\n🎨 Format Check:');
      console.log('  [WARNING] tag:', hasWarning ? '✅' : '❌');
      console.log('  [CRITICAL] tag:', hasCritical ? '✅' : '❌');
      console.log('  <item> tag:', hasItem ? '✅' : '❌');
      console.log('  <champion> tag:', hasChampion ? '✅' : '❌');
      console.log('  <stat> tag:', hasStat ? '✅' : '❌');
      
      if (!hasWarning && !hasCritical && !hasItem) {
        console.log('\n⚠️  WARNING: Response does not contain formatting tags!');
        console.log('   This means the Lambda system prompt is not working.');
        console.log('   Please deploy lambda_chatbot_updated.py to AWS.');
      }
    } else if (data.error) {
      console.log('\n❌ ERROR:', data.error);
    } else {
      console.log('\n❌ Unexpected response format');
    }
  })
  .catch(error => {
    console.error('\n❌ FETCH ERROR:', error.message);
    console.error('\nPossible causes:');
    console.error('  1. API Gateway endpoint is incorrect');
    console.error('  2. CORS is not enabled');
    console.error('  3. Lambda function is not deployed');
    console.error('  4. Network connectivity issue');
  });
