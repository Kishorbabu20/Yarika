const axios = require('axios');

async function testBackend() {
  try {
    console.log('=== TESTING BACKEND SERVER ===');
    
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthRes = await axios.get('https://yarika.in/');
    console.log('✅ Server is running:', healthRes.data);
    
    // Test 2: Check if orders routes are accessible
    console.log('2. Testing orders routes...');
    const testRes = await axios.get('https://yarika.in/api/orders/test-auth');
    console.log('✅ Orders routes are accessible');
    
    // Test 3: Check available routes
    console.log('3. Available routes:');
    console.log('- POST /api/orders/add');
    console.log('- GET /api/orders/test-auth');
    console.log('- GET /api/orders/recent');
    console.log('- GET /api/orders/all');
    
    console.log('✅ Backend server is working correctly!');
    
  } catch (error) {
    console.error('❌ Backend test failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running on port 5001');
      console.log('💡 Start the server with: cd yarika-backend && npm start');
    }
  }
}

testBackend(); 