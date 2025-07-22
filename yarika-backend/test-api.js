const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API endpoint...');
    
    // Test the exact API call that the frontend is making
    const response = await axios.get('https://yarika.in/api/products?categoryType=readymade-blouse&category=embroidery-blouse');
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data Length:', response.data.length);
    
    if (response.data.length > 0) {
      const product = response.data[0];
      console.log('First Product seoUrl:', product.seoUrl);
      console.log('First Product seoUrl type:', typeof product.seoUrl);
      console.log('First Product all fields:', Object.keys(product));
      console.log('First Product full object:', JSON.stringify(product, null, 2));
    }
    
  } catch (error) {
    console.error('API Test Error:', error.response ? error.response.data : error.message);
  }
}

testAPI(); 