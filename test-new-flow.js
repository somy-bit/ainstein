// Test script to verify the new registration flow
const BASE_URL = 'http://localhost:3001/api/v1';

async function testFlow() {
  console.log('🧪 Testing new registration flow...\n');

  try {
    // Step 1: Create organization via admin panel
    console.log('1️⃣ Creating organization...');
    const orgResponse = await fetch(`${BASE_URL}/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real scenario, this would need authentication
      },
      body: JSON.stringify({
        orgData: {
          name: 'Test Company Inc.',
          companyId: 'TC123456',
          address: '123 Test Street',
          city: 'Test City',
          province: 'Test Province',
          postalCode: '12345',
          country: 'United States',
          industry: 'Technology',
          taxId: 'TAX123456',
          billingEmail: 'billing@testcompany.com'
        },
        adminData: {
          name: 'John',
          lastNamePaternal: 'Doe',
          lastNameMaternal: 'Smith',
          email: 'admin@testcompany.com',
          phone: '+1234567890',
          country: 'United States',
          username: 'admin_test',
          password: 'SecurePassword123!'
        }
      })
    });

    if (!orgResponse.ok) {
      throw new Error(`Organization creation failed: ${orgResponse.status}`);
    }

    const orgResult = await orgResponse.json();
    console.log('✅ Organization created:', orgResult.organization.name);
    console.log('✅ Admin user created:', orgResult.admin.username);

    // Step 2: Get list of organizations for registration
    console.log('\n2️⃣ Fetching organizations for registration...');
    const orgsResponse = await fetch(`${BASE_URL}/organizations`);
    
    if (!orgsResponse.ok) {
      throw new Error(`Failed to fetch organizations: ${orgsResponse.status}`);
    }

    const organizations = await orgsResponse.json();
    console.log('✅ Available organizations:', organizations.length);

    // Step 3: Register user with existing organization
    console.log('\n3️⃣ Registering user with existing organization...');
    const userResponse = await fetch(`${BASE_URL}/auth/register-trial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userData: {
          orgId: orgResult.organization.id,
          username: 'testuser',
          name: 'Jane',
          lastNamePaternal: 'Doe',
          lastNameMaternal: 'Johnson',
          email: 'jane@testcompany.com',
          phone: '+1987654321',
          country: 'United States',
          password: 'UserPassword123!'
        },
        selectedPlan: 'basic',
        paymentMethodId: 'pm_test_payment_method', // Mock payment method
        paymentMethodData: {
          last4: '4242',
          cardholderName: 'Jane Doe'
        }
      })
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      throw new Error(`User registration failed: ${JSON.stringify(errorData)}`);
    }

    const userResult = await userResponse.json();
    console.log('✅ User registered successfully:', userResult.user.username);
    console.log('✅ Subscription status:', userResult.subscriptionStatus);

    console.log('\n🎉 All tests passed! New flow is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFlow();
