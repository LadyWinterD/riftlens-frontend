// 测试可能导致错误的问题
const CHAT_URL = 'https://t4k80w31b3.execute-api.ap-southeast-2.amazonaws.com/v1/chat';

const testQuestions = [
  "What am I doing wrong?",
  "How can I improve?",
  "Analyze my performance",
  "Give me tips",
  "What should I focus on?",
  ""  // 空问题
];

async function testQuestion(question, index) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Test ${index + 1}/${testQuestions.length}: "${question}"`);
  console.log('='.repeat(80));

  const testData = {
    question: question,
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

    console.log(`Status: ${response.status} (${endTime - startTime}ms)`);

    const data = await response.json();

    if (data.aiResponse) {
      console.log('✅ SUCCESS!');
      console.log('\nResponse preview (first 200 chars):');
      console.log('─'.repeat(80));
      console.log(data.aiResponse.substring(0, 200));
      console.log('─'.repeat(80));
      
      // 检查是否包含 <player_stats> 泄露
      if (data.aiResponse.includes('<player_stats>') || data.aiResponse.includes('</player_stats>')) {
        console.log('\n⚠️  WARNING: Response contains <player_stats> tags!');
        console.log('This means the system prompt is leaking into the response.');
      }
      
      // 检查语言
      const isChinese = /[\u4e00-\u9fa5]/.test(data.aiResponse);
      if (isChinese) {
        console.log('\n⚠️  WARNING: Response contains Chinese characters!');
      }
      
    } else if (data.error) {
      console.log(`❌ ERROR: ${data.error}`);
      if (data.errorType) {
        console.log(`Error Type: ${data.errorType}`);
      }
    } else {
      console.log('❌ Unexpected response format');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.log(`❌ FETCH ERROR: ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 Testing potentially problematic questions...\n');
  
  for (let i = 0; i < testQuestions.length; i++) {
    await testQuestion(testQuestions[i], i);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log('\nAll questions should:');
  console.log('  ✅ Return 200 status');
  console.log('  ✅ Have aiResponse field');
  console.log('  ✅ Be in English');
  console.log('  ✅ NOT contain <player_stats> tags');
  console.log('  ✅ Contain format tags ([WARNING], <item>, etc.)');
  console.log('\n');
}

runTests();
