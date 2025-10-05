import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerEmail, amount } = await request.json();
    
    console.log('\n🚀 ===== VIRTUAL ACCOUNT CREATION START =====');
    console.log('📋 Order ID:', orderId);
    console.log('📧 Email:', customerEmail);
    console.log('💰 Amount:', amount);

    // Validate inputs
    if (!customerEmail || !orderId) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Customer email and order ID are required' },
        { status: 400 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error - PAYSTACK_SECRET_KEY missing'
        },
        { status: 500 }
      );
    }

    const isTestMode = paystackSecretKey.startsWith('sk_test_');
    console.log(`🔑 Mode: ${isTestMode ? '🧪 TEST' : '🔴 LIVE'}`);
    console.log(`🔑 Key: ${paystackSecretKey.substring(0, 10)}...`);

    // STEP 1: Create or Get Customer
    console.log('\n👤 STEP 1: Creating/fetching customer...');
    
    let customerCode: string;
    
    try {
      const createCustomerResponse = await fetch('https://api.paystack.co/customer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          first_name: 'Customer',
          last_name: 'Name',
        }),
      });

      const customerData = await createCustomerResponse.json();
      console.log('📥 Customer API Status:', createCustomerResponse.status);
      console.log('📥 Customer API Response:', JSON.stringify(customerData, null, 2));

      if (createCustomerResponse.ok) {
        customerCode = customerData.data.customer_code;
        console.log('✅ Customer created:', customerCode);
      } else if (customerData.message?.toLowerCase().includes('already')) {
        console.log('👤 Customer exists, fetching...');
        
        const getResponse = await fetch(
          `https://api.paystack.co/customer/${encodeURIComponent(customerEmail)}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${paystackSecretKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const existingData = await getResponse.json();
        console.log('📥 Existing customer:', JSON.stringify(existingData, null, 2));

        if (!getResponse.ok) {
          throw new Error(`Failed to fetch customer: ${existingData.message}`);
        }

        customerCode = existingData.data.customer_code;
        console.log('✅ Found customer:', customerCode);
      } else {
        throw new Error(`Customer creation failed: ${customerData.message || JSON.stringify(customerData)}`);
      }
    } catch (err) {
      console.error('❌ Customer step failed:', err);
      throw err;
    }

    // STEP 2: Check for Existing DVA
    console.log('\n🔍 STEP 2: Checking for existing DVA...');
    
    try {
      const listResponse = await fetch(
        `https://api.paystack.co/dedicated_account?customer=${customerCode}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const listData = await listResponse.json();
      console.log('📥 DVA List Status:', listResponse.status);
      console.log('📥 DVA List Response:', JSON.stringify(listData, null, 2));

      if (listResponse.ok && listData.data && listData.data.length > 0) {
        const existing = listData.data[0];
        
        const virtualAccount = {
          accountNumber: existing.account_number,
          bankName: existing.bank?.name || existing.bank_name || 'Bank',
          accountName: existing.account_name,
          reference: existing.account_reference || existing.id?.toString(),
          customerId: customerCode,
          currency: existing.currency || 'NGN',
          active: existing.active,
          createdAt: existing.created_at,
        };

        console.log('✅ Found existing DVA!');
        console.log('📋 Account:', virtualAccount);
        console.log('🎉 ===== REQUEST COMPLETE (EXISTING) =====\n');
        
        return NextResponse.json({
          success: true,
          virtualAccount,
          message: `Transfer ₦${amount.toLocaleString()} to ${virtualAccount.accountNumber} (${virtualAccount.bankName})`,
          isExisting: true,
        });
      }
      
      console.log('ℹ️  No existing DVA found, will create new one');
    } catch (err) {
      console.log('⚠️  Could not check existing DVA, will try to create:', err);
    }

    // STEP 3: Check Available Providers (IMPORTANT FOR TEST MODE)
    console.log('\n🏦 STEP 3: Checking available providers...');
    
    let preferredBank = isTestMode ? 'test-bank' : 'wema-bank';
    
    try {
      const providersResponse = await fetch(
        'https://api.paystack.co/dedicated_account/available_providers',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const providersData = await providersResponse.json();
      console.log('📥 Providers Status:', providersResponse.status);
      console.log('📥 Providers Response:', JSON.stringify(providersData, null, 2));

      if (!providersResponse.ok) {
        console.error('❌ Failed to fetch providers');
        
        // Check for common issues
        if (providersData.message?.toLowerCase().includes('not enabled') ||
            providersData.message?.toLowerCase().includes('not activated') ||
            providersData.message?.toLowerCase().includes('not available')) {
          
          return NextResponse.json({
            success: false,
            error: 'DVA not enabled on your account',
            details: providersData.message,
            helpText: isTestMode 
              ? '🧪 TEST MODE: You need to enable Dedicated Virtual Accounts in your Paystack dashboard first. Go to Settings → Preferences → Dedicated Accounts'
              : '🔴 LIVE MODE: Your business must be verified and DVA must be enabled.',
            isTestMode,
          }, { status: 400 });
        }
        
        throw new Error(`Providers fetch failed: ${providersData.message}`);
      }

      // Verify test-bank is available in test mode
      if (isTestMode && Array.isArray(providersData.data)) {
        const testBank = providersData.data.find((p: any) => 
          p.provider_slug === 'test-bank' || p.slug === 'test-bank'
        );
        
        if (testBank) {
          console.log('✅ test-bank is available');
          preferredBank = 'test-bank';
        } else {
          console.warn('⚠️  test-bank NOT found in providers!');
          console.log('Available providers:', providersData.data.map((p: any) => p.provider_slug || p.slug));
          // Still try with test-bank
        }
      }
      
      console.log(`🏦 Will use: ${preferredBank}`);
      
    } catch (err) {
      console.error('❌ Providers check failed:', err);
      throw err;
    }

    // STEP 4: Create DVA
    console.log(`\n💳 STEP 4: Creating DVA with ${preferredBank}...`);
    
    try {
      const dvaPayload = {
        customer: customerCode,
        preferred_bank: preferredBank,
      };
      
      console.log('📤 DVA Request:', dvaPayload);
      
      const createResponse = await fetch('https://api.paystack.co/dedicated_account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dvaPayload),
      });

      const dvaData = await createResponse.json();
      console.log('📥 DVA Create Status:', createResponse.status);
      console.log('📥 DVA Create Response:', JSON.stringify(dvaData, null, 2));

      if (!createResponse.ok) {
        console.error('❌ DVA creation failed');
        
        // Provide helpful error messages
        let helpText = '';
        if (isTestMode) {
          helpText = `
🧪 TEST MODE TROUBLESHOOTING:
1. Ensure DVA is enabled in Dashboard → Settings → Preferences
2. You must use 'test-bank' as preferred_bank in test mode
3. Some Paystack accounts need DVA manually activated by support
4. Try contacting Paystack support to enable DVA for your test account
          `.trim();
        } else {
          helpText = `
🔴 LIVE MODE REQUIREMENTS:
1. Your business must be fully verified
2. DVA must be enabled in your dashboard
3. Contact Paystack support if issues persist
          `.trim();
        }
        
        return NextResponse.json({
          success: false,
          error: 'Failed to create virtual account',
          paystackMessage: dvaData.message,
          paystackError: dvaData,
          helpText,
          isTestMode,
        }, { status: 500 });
      }

      // Success!
      const virtualAccount = {
        accountNumber: dvaData.data.account_number,
        bankName: dvaData.data.bank?.name || dvaData.data.bank_name || 'Test Bank',
        accountName: dvaData.data.account_name,
        reference: dvaData.data.account_reference || dvaData.data.id?.toString(),
        customerId: customerCode,
        currency: dvaData.data.currency || 'NGN',
        active: dvaData.data.active,
        createdAt: dvaData.data.created_at,
      };

      console.log('✅ DVA CREATED SUCCESSFULLY!');
      console.log('📋 Account Details:', virtualAccount);
      console.log('🎉 ===== REQUEST COMPLETE (NEW) =====\n');

      return NextResponse.json({
        success: true,
        virtualAccount,
        message: `Transfer ₦${amount.toLocaleString()} to ${virtualAccount.accountNumber} (${virtualAccount.bankName})`,
        isExisting: false,
      });
      
    } catch (err) {
      console.error('❌ DVA creation step failed:', err);
      throw err;
    }

  } catch (error) {
    console.error('\n💥 ===== FATAL ERROR =====');
    console.error('Error Type:', error?.constructor?.name);
    console.error('Error Message:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack Trace:', error.stack);
    }
    console.error('========================\n');
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: {
        '1️⃣': 'Check if PAYSTACK_SECRET_KEY is correctly set in .env.local',
        '2️⃣': 'For test mode: Use sk_test_... key',
        '3️⃣': 'Enable DVA: Dashboard → Settings → Preferences → Dedicated Accounts',
        '4️⃣': 'Check server console logs above for detailed error info',
        '5️⃣': 'Contact Paystack support to enable DVA for your account',
      }
    }, { status: 500 });
  }
}
