// 测试所有3个 API Gateway
const APIs = [
  {
    name: 'RiftLensAPI (t4k80w31b3) - 当前使用',
    url: 'https://t4k80w31b3.execute-api.ap-southeast-2.amazonaws.com/v1/chat',
    created: '2025-11-02'
  },
  {
    name: 'riftlens-chat-API (qf48d92yo5)',
    url: 'https://qf48d92yo5.execute-api.ap-southeast-2.amazonaws.com/prod/chat',
    created: '2025-11-07'
  },
  {
    name: 'RiftLensChatbotLambda-API (zq215yrqck)',
    url: 'https://zq215yrqck.execute-api.ap-southeast-2.amazonaws.com/prod/chat',
    created: '2025-11-07'
  }
];

const testData = {
  question: "请用英文回复。使用 [WARNING], <item>, <champion>, <stat> 标签。Analyze my performance.",
  data: {
    PlayerID: "7LN0MfN51RJVbUlncFaZQC664RAMd9vNNwevKyB9hpFK9kwV3Gx_OL-dpPUKMWy5EuLpMGHIkPKcaw",
    playerId: "7LN0MfN51RJVbUlncFaZQC664RAMd9vNNwevKyB9hpFK9kwV3Gx_OL-dpPUKMWy5EuLpMGHIkPKcaw",
    chatHistory: []
  }
};

async function testAPI(api) {
  console.log('\n' + '='.repeat(80));
  console.log(`🔍 Testing: ${api.name}`);
  console.log(`📅 Created: ${api.created}`);
  console.log(`🌐 URL: ${api.url}`);
  console.log('='.repeat(80));

  try {
    const startTime = Date.now();
    const response = await fetch(api.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    const endTime = Date.now();

    console.log(`\n📊 Status: ${response.status} (${endTime - startTime}ms)`);

    const data = await response.json();

    if (data.aiResponse) {
      console.log('✅ SUCCESS! Got aiResponse\n');
      
      // 检查语言
      const isChinese = /[\u4e00-\u9fa5]/.test(data.aiResponse);
      const isEnglish = /[a-zA-Z]/.test(data.aiResponse);
      console.log(`🌍 Language: ${isChinese ? '中文 ❌' : ''} ${isEnglish ? '英文 ✅' : ''}`);
      
      // 检查格式
      const checks = {
        '[WARNING]': data.aiResponse.includes('[WARNING]'),
        '[CRITICAL]': data.aiResponse.includes('[CRITICAL]'),
        '<item>': data.aiResponse.includes('<item>'),
        '<champion>': data.aiResponse.includes('<champion>'),
        '<stat>': data.aiResponse.includes('<stat>'),
        'emoji': /[\u{1F300}-\u{1F9FF}]/u.test(data.aiResponse)
      };

      console.log('\n🎨 Format Check:');
      for (const [tag, found] of Object.entries(checks)) {
        console.log(`  ${found ? '✅' : '❌'} ${tag}`);
      }

      const allPassed = Object.values(checks).every(v => v);
      const hasEnglish = isEnglish && !isChinese;

      console.log('\n📝 Response Preview (first 300 chars):');
      console.log('─'.repeat(80));
      console.log(data.aiResponse.substring(0, 300));
      console.log('─'.repeat(80));

      if (allPassed && hasEnglish) {
        console.log('\n🎉 THIS IS THE CORRECT API! ✅✅✅');
        console.log('Update your .env.local to use this URL!');
      } else if (!hasEnglish) {
        console.log('\n⚠️  Response is in Chinese, not English');
      } else {
        console.log('\n⚠️  Missing some format tags');
      }

    } else if (data.error) {
      console.log(`❌ ERROR: ${data.error}`);
    } else {
      console.log('❌ Unexpected response format');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.log(`\n❌ FETCH ERROR: ${error.message}`);
    console.log('This API endpoint might not exist or is not configured correctly.');
  }
}

async function testAll() {
  console.log('\n🚀 Testing all API Gateways...\n');
  
  for (const api of APIs) {
    await testAPI(api);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('📋 SUMMARY');
  console.log('='.repeat(80));
  console.log('\nCheck the results above to find which API:');
  console.log('  ✅ Returns English responses');
  console.log('  ✅ Has all format tags ([WARNING], <item>, etc.)');
  console.log('  ✅ Contains emojis');
  console.log('\nThen update your .env.local with that API URL!');
  console.log('\n');
}

testAll();
