const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing CoinTracker Mock API\n');

  try {
    // Test 1: Get initial wallets (should be empty)
    console.log('1. Getting initial wallets...');
    let response = await axios.get(`${BASE_URL}/wallets`);
    console.log('   Response:', response.data);
    console.log('   Status:', response.status);
    console.log('');

    // Test 2: Create first wallet
    console.log('2. Creating first wallet...');
    response = await axios.post(`${BASE_URL}/wallets`, {
      address: '0x1234567890abcdef'
    });
    console.log('   Response:', response.data);
    console.log('   Status:', response.status);
    const wallet1Id = response.data[0].id;
    console.log('');

    // Test 3: Create second wallet
    console.log('3. Creating second wallet...');
    response = await axios.post(`${BASE_URL}/wallets`, {
      address: '0xfedcba0987654321'
    });
    console.log('   Response:', response.data);
    console.log('   Status:', response.status);
    const wallet2Id = response.data[1].id;
    console.log('');

    // Test 4: Get all wallets
    console.log('4. Getting all wallets...');
    response = await axios.get(`${BASE_URL}/wallets`);
    console.log('   Response:', response.data);
    console.log('   Status:', response.status);
    console.log('');

    // Test 5: Get transactions for first wallet (should be empty)
    console.log('5. Getting transactions for first wallet...');
    response = await axios.get(`${BASE_URL}/wallets/${wallet1Id}`);
    console.log('   Response:', response.data);
    console.log('   Status:', response.status);
    console.log('');

    // Test 6: Test sync endpoint
    console.log('6. Testing sync endpoint...');
    response = await axios.get(`${BASE_URL}/wallets/sync`);
    console.log('   Response:', response.data);
    console.log('   Status:', response.status);
    console.log('');

    // Test 7: Try to create duplicate wallet (should fail)
    console.log('7. Trying to create duplicate wallet...');
    try {
      response = await axios.post(`${BASE_URL}/wallets`, {
        address: '0x1234567890abcdef'
      });
    } catch (error) {
      console.log('   Error:', error.response.data);
      console.log('   Status:', error.response.status);
    }
    console.log('');

    // Test 8: Delete first wallet
    console.log('8. Deleting first wallet...');
    response = await axios.delete(`${BASE_URL}/wallets/${wallet1Id}`);
    console.log('   Response:', response.data);
    console.log('   Status:', response.status);
    console.log('');

    // Test 9: Get remaining wallets
    console.log('9. Getting remaining wallets...');
    response = await axios.get(`${BASE_URL}/wallets`);
    console.log('   Response:', response.data);
    console.log('   Status:', response.status);
    console.log('');

    // Test 10: Try to access deleted wallet (should fail)
    console.log('10. Trying to access deleted wallet...');
    try {
      response = await axios.get(`${BASE_URL}/wallets/${wallet1Id}`);
    } catch (error) {
      console.log('   Error:', error.response.data);
      console.log('   Status:', error.response.status);
    }
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run tests
testAPI();
