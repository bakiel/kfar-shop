const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testVendorCreation() {
  console.log('🧪 Testing vendor creation API...\n');

  const testData = {
    storeName: 'Test Store ' + Date.now(),
    storeNameHe: 'חנות בדיקה',
    category: 'food',
    description: 'Test store description',
    descriptionHe: 'תיאור חנות בדיקה',
    logo: null,
    banner: null,
    phone: '+972-50-123-4567',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    address: '123 Test Street, Dimona',
    deliveryOptions: ['pickup', 'delivery'],
    businessHours: {
      sunday: { open: '09:00', close: '18:00' },
      monday: { open: '09:00', close: '18:00' }
    },
    products: [
      {
        id: 'prod-1',
        name: 'Test Product',
        nameHe: 'מוצר בדיקה',
        description: 'Test product description',
        price: 25.00,
        originalPrice: 30.00,
        category: 'food',
        image: null,
        isVegan: true,
        isKosher: true,
        inStock: true,
        stockQuantity: 100
      }
    ]
  };

  try {
    console.log('📤 Sending test vendor data to API...');
    console.log('Email:', testData.email);
    console.log('Store Name:', testData.storeName);
    
    const response = await fetch('http://localhost:3000/api/vendor/onboarding-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log('\n📥 API Response:');
    console.log('Status:', response.status);
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ Vendor creation successful!');
      console.log('Vendor ID:', result.vendorId);
      console.log('Store URL:', result.storeUrl);
      console.log('Dashboard URL:', result.dashboardUrl);
    } else {
      console.log('\n❌ Vendor creation failed!');
      console.log('Error:', result.error);
      if (result.details) {
        console.log('Details:', JSON.stringify(result.details, null, 2));
      }
    }

  } catch (error) {
    console.error('\n❌ Network error:', error.message);
  }
}

testVendorCreation();