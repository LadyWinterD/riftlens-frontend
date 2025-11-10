// 检查 Lambda 是否已更新为强制英文版本
const CHAT_URL = 'https://t4k80w31b3.execute-api.ap-southeast-2.amazonaws.com/v1/chat';

const testData = {
  question: "测试：请用中文回答这个问题。", // 故意用中文问题
  data: {
    PlayerID: "7LN0MfN51RJVbUlncFaZQC664RAMd9vNNwevKyB9hpFK9kwV3Gx_OL-dpPUKMWy5EuLpMGHIkPKcaw",
    chatHistory: []
  }
};

console.log('🔍 Testing if Lambda enforces English responses...\n');
console.log('📝 Sending Chinese question to test language enforcement:\n');
console.log(`   Question: "${testData.question}"\n`);
console.log('⏳ Waiting for response...\n');

fetch(CHAT_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData)
})
  .then(response => response.json())
  .then(data => {
    if (data.aiResponse) {
      const isChinese = /[\u4e00-\u9fa5]/.test(data.aiResponse);
      const isEnglish = /[a-zA-Z]/.test(data.aiResponse);
      
      console.log('📥 Response received!\n');
      console.log('─'.repeat(80));
      console.log(data.aiResponse.substring(0, 500));
      console.log('─'.repeat(80));
      console.log('\n🌍 Language Detection:');
      console.log(`   Contains Chinese: ${isChinese ? '❌ YES' : '✅ NO'}`);
      console.log(`   Contains English: ${isEnglish ? '✅ YES' : '❌ NO'}`);
      
      if (isEnglish && !isChinese) {
        console.log('\n✅✅✅ SUCCESS! Lambda is enforcing English! ✅✅✅');
        console.log('\nThe Lambda code has been updated correctly.');
        console.log('Even with a Chinese question, it responded in English.');
      } else if (isChinese) {
        console.log('\n❌❌❌ FAILED! Lambda is still responding in Chinese! ❌❌❌');
        console.log('\n🔧 ACTION REQUIRED:');
        console.log('   1. Open AWS Lambda Console');
        console.log('   2. Find your chat Lambda function');
        console.log('   3. Replace ALL code with lambda_chatbot_updated.py');
        console.log('   4. Click "Deploy" button');
        console.log('   5. Wait 10 seconds');
        console.log('   6. Run this test again: node check-lambda-updated.js');
      } else {
        console.log('\n⚠️  Unexpected response format');
      }
      
      // Check format tags
      const hasWarning = data.aiResponse.includes('[WARNING]');
      const hasCritical = data.aiResponse.includes('[CRITICAL]');
      const hasItem = data.aiResponse.includes('<item>');
      const hasChampion = data.aiResponse.includes('<champion>');
      
      console.log('\n🎨 Format Tags:');
      console.log(`   [WARNING]: ${hasWarning ? '✅' : '❌'}`);
      console.log(`   [CRITICAL]: ${hasCritical ? '✅' : '❌'}`);
      console.log(`   <item>: ${hasItem ? '✅' : '❌'}`);
      console.log(`   <champion>: ${hasChampion ? '✅' : '❌'}`);
      
    } else if (data.error) {
      console.log(`❌ ERROR: ${data.error}`);
    }
  })
  .catch(error => {
    console.error(`❌ FETCH ERROR: ${error.message}`);
  });
