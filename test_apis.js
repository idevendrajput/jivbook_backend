const axios = require('axios');

// Base URL of your API
const BASE_URL = 'http://localhost:5000/api';

// Test authentication endpoint
async function testAuth() {
  console.log('\n=== Testing Authentication API ===');
  
  try {
    // Test registration/login with phone
    const authResponse = await axios.post(`${BASE_URL}/auth`, {
      phone: '+919876543210'
    });
    
    console.log('Auth Response:', JSON.stringify(authResponse.data, null, 2));
    
    return authResponse.data.data.token;
  } catch (error) {
    console.error('Auth Error:', error.response?.data || error.message);
    return null;
  }
}

// Test profile update endpoint
async function testProfileUpdate(token, userId) {
  console.log('\n=== Testing Profile Update API ===');
  
  try {
    const profileResponse = await axios.put(`${BASE_URL}/profile`, {
      id: userId,
      name: 'Updated Name',
      username: 'updated_username_' + Date.now()
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Profile Update Response:', JSON.stringify(profileResponse.data, null, 2));
  } catch (error) {
    console.error('Profile Update Error:', error.response?.data || error.message);
  }
}

// Test get profile endpoint
async function testGetProfile(token) {
  console.log('\n=== Testing Get Profile API ===');
  
  try {
    const profileResponse = await axios.get(`${BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Get Profile Response:', JSON.stringify(profileResponse.data, null, 2));
  } catch (error) {
    console.error('Get Profile Error:', error.response?.data || error.message);
  }
}

// Test refresh token endpoint
async function testRefreshToken(refreshToken) {
  console.log('\n=== Testing Refresh Token API ===');
  
  try {
    const refreshResponse = await axios.post(`${BASE_URL}/refresh-token`, {
      refreshToken: refreshToken
    });
    
    console.log('Refresh Token Response:', JSON.stringify(refreshResponse.data, null, 2));
  } catch (error) {
    console.error('Refresh Token Error:', error.response?.data || error.message);
  }
}

// Test get all users endpoint
async function testGetAllUsers() {
  console.log('\n=== Testing Get All Users API ===');
  
  try {
    const usersResponse = await axios.get(`${BASE_URL}/users`);
    
    console.log('Get All Users Response:', JSON.stringify(usersResponse.data, null, 2));
  } catch (error) {
    console.error('Get All Users Error:', error.response?.data || error.message);
  }
}

// Main test function
async function runTests() {
  console.log('Starting API Tests...');
  
  // Test authentication
  const token = await testAuth();
  
  if (token) {
    // Extract user ID from token payload (basic decoding)
    const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const userId = tokenPayload.id;
    
    // Test profile operations
    await testGetProfile(token);
    await testProfileUpdate(token, userId);
    
    // Test refresh token (we would need to extract this from the auth response)
    // For now, we'll skip this test
    
    // Test get all users
    await testGetAllUsers();
  }
  
  console.log('\nAPI Tests Completed!');
}

// Check if axios is available
if (typeof require !== 'undefined') {
  try {
    require('axios');
    runTests();
  } catch (e) {
    console.log('Please install axios first: npm install axios');
    console.log('Then run: node test_apis.js');
  }
} else {
  console.log('This script requires Node.js to run');
}

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let testUserId = null;

// Test data
const testData = {
  email: 'testuser@example.com',
  phone: '+919876543210',
  updatedProfile: {
    name: 'Test User Updated',
    address: 'Mumbai, Maharashtra',
    latitude: 19.0760,
    longitude: 72.8777,
    preferencePetType: 'Dog',
    preferenceCategories: 'Pets,Training'
  }
};

console.log('🚀 Starting API Tests for JivBook Backend\n');

// Test 1: Authentication with Email (New User Registration)
async function testAuthWithEmail() {
  try {
    console.log('📧 Testing Authentication with Email...');
    const response = await axios.post(`${BASE_URL}/api/auth`, {
      email: testData.email
    });
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.user && response.data.user._id) {
      testUserId = response.data.user._id;
      console.log('💾 Saved User ID:', testUserId);
    }
    
    console.log('✅ Email Authentication Test PASSED\n');
    return response.data;
  } catch (error) {
    console.log('❌ Email Authentication Test FAILED');
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('');
  }
}

// Test 2: Authentication with Phone (Login Existing User)
async function testAuthWithPhone() {
  try {
    console.log('📱 Testing Authentication with Phone...');
    const response = await axios.post(`${BASE_URL}/api/auth`, {
      phone: testData.phone
    });
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    console.log('✅ Phone Authentication Test PASSED\n');
    return response.data;
  } catch (error) {
    console.log('❌ Phone Authentication Test FAILED');
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('');
  }
}

// Test 3: Authentication with Both Email and Phone
async function testAuthWithBoth() {
  try {
    console.log('📧📱 Testing Authentication with Both Email and Phone...');
    const response = await axios.post(`${BASE_URL}/api/auth`, {
      email: 'another@example.com',
      phone: '+919123456789'
    });
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    console.log('✅ Both Email & Phone Authentication Test PASSED\n');
    return response.data;
  } catch (error) {
    console.log('❌ Both Email & Phone Authentication Test FAILED');
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('');
  }
}

// Test 4: Profile Update
async function testProfileUpdate() {
  if (!testUserId) {
    console.log('❌ Profile Update Test SKIPPED - No User ID available\n');
    return;
  }
  
  try {
    console.log('👤 Testing Profile Update...');
    const response = await axios.put(`${BASE_URL}/api/profile`, {
      id: testUserId,
      ...testData.updatedProfile
    });
    
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    console.log('✅ Profile Update Test PASSED\n');
    return response.data;
  } catch (error) {
    console.log('❌ Profile Update Test FAILED');
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('');
  }
}

// Test 5: Profile Update with Invalid User ID
async function testProfileUpdateInvalid() {
  try {
    console.log('🚫 Testing Profile Update with Invalid User ID...');
    const response = await axios.put(`${BASE_URL}/api/profile`, {
      id: '64abc123def456789invalid',
      name: 'Should Fail'
    });
    
    console.log('❌ This should have failed but passed:', response.status);
    console.log('');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Invalid User ID Test PASSED - Correctly returned 404');
      console.log('✅ Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ Invalid User ID Test FAILED - Wrong error type');
      console.log('❌ Error:', error.response?.data || error.message);
    }
    console.log('');
  }
}

// Test 6: Server Health Check
async function testServerHealth() {
  try {
    console.log('🏥 Testing Server Health...');
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server is responding');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running on port 5000');
    } else {
      console.log('⚠️ Server responded but no root route defined');
    }
  }
  console.log('');
}

// Main test function
async function runAllTests() {
  console.log('=' .repeat(50));
  console.log('      JIVBOOK BACKEND API TESTS');
  console.log('=' .repeat(50));
  console.log('');
  
  await testServerHealth();
  await testAuthWithEmail();
  await testAuthWithPhone();
  await testAuthWithBoth();
  await testProfileUpdate();
  await testProfileUpdateInvalid();
  
  console.log('=' .repeat(50));
  console.log('      TESTS COMPLETED');
  console.log('=' .repeat(50));
  console.log('');
  console.log('💡 Tips:');
  console.log('- Make sure your server is running on http://localhost:5000');
  console.log('- Check MongoDB connection if auth tests fail');
  console.log('- User ID is needed for profile update tests');
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testAuthWithEmail,
  testAuthWithPhone,
  testAuthWithBoth,
  testProfileUpdate,
  testProfileUpdateInvalid
};
