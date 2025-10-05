import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerEmail, amount } = await request.json();
    
    console.log('===== Virtual Account Creation Request =====');
    console.log('Order ID:', orderId);
    console.log('Customer Email:', customerEmail);
    console.log('Amount:', amount);

    if (!customerEmail || !orderId) {
      console.error('Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Customer email and order ID are required' },
        { status: 400 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured in environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error - missing Paystack secret key' },
        { status: 500 }
      );
    }

    console.log('Using Paystack key type:', paystackSecretKey.startsWith('sk_test_') ? 'TEST MODE' : 'LIVE MODE');

    // Step 1: Create customer (required for DVA)
    console.log('Creating/fetching customer...');
    
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

    const customerResponseData = await createCustomerResponse.json();
    console.log('Customer API response:', customerResponseData);

    let customerCode: string;

    if (createCustomerResponse.ok) {
      customerCode = customerResponseData.data.customer_code;
      console.log('✓ Customer code:', customerCode);
    } else if (customerResponseData.message && customerResponseData.message.includes('already')) {
      // Customer already exists, extract code from error message or fetch it
      console.log('Customer already exists, fetching...');
      
      const getCustomerResponse = await fetch(
        `https://api.paystack.co/customer/${encodeURIComponent(customerEmail)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!getCustomerResponse.ok) {
        throw new Error('Failed to fetch existing customer');
      }

      const existingCustomerData = await getCustomerResponse.json();
      customerCode = existingCustomerData.data.customer_code;
      console.log('✓ Existing customer code:', customerCode);
    } else {
      throw new Error(customerResponseData.message || 'Failed to create/fetch customer');
    }

    // Step 2: Fetch available DVA providers
    console.log('Fetching DVA providers...');
    
    const providersResponse = await fetch('https://api.paystack.co/dedicated_account/available_providers', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
    });

    const providersData = await providersResponse.json();
    console.log('Available providers:', providersData);

    // Determine which provider to use
    let preferredBank = 'wema-bank'; // Default for live mode
    
    if (paystackSecretKey.startsWith('sk_test_')) {
      // In test mode, check if test-bank is available
      if (providersData.data && Array.isArray(providersData.data)) {
        const testBankProvider = providersData.data.find((p: any) => 
          p.provider_slug === 'test-bank' || p.slug === 'test-bank'
        );
        if (testBankProvider) {
          preferredBank = 'test-bank';
          console.log('✓ Using test-bank for test mode');
        } else {
          console.log('⚠ test-bank not available, using wema-bank');
          preferredBank = 'wema-bank';
        }
      }
    }

    // Step 3: Create Dedicated Virtual Account
    console.log('Creating DVA with bank:', preferredBank);
    
    const dvaPayload = {
      customer: customerCode,
      preferred_bank: preferredBank,
      // Optionally include customer details to update them
      first_name: 'Customer',
      last_name: 'Name',
      phone: '+2348000000000', // Optional
    };
    
    console.log('DVA request payload:', dvaPayload);
    
    const createDVAResponse = await fetch('https://api.paystack.co/dedicated_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dvaPayload),
    });

    const dvaData = await createDVAResponse.json();
    console.log('DVA API response:', dvaData);

    if (!createDVAResponse.ok) {
      console.error('DVA creation failed:', dvaData);
      
      // Check if customer already has a DVA
      if (dvaData.message && (
        dvaData.message.includes('already') || 
        dvaData.message.includes('existing') ||
        dvaData.message.includes('Customer already has')
      )) {
        console.log('Customer already has DVA, fetching it...');
        
        // Fetch existing DVA
        const listDVAResponse = await fetch(
          `https://api.paystack.co/dedicated_account?customer=${customerCode}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${paystackSecretKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const listData = await listDVAResponse.json();
        console.log('Existing DVA list:', listData);

        if (listDVAResponse.ok && listData.data && listData.data.length > 0) {
          const existingDVA = listData.data[0];
          
          const virtualAccount = {
            accountNumber: existingDVA.account_number,
            bankName: existingDVA.bank?.name || existingDVA.bank_name || 'Bank',
            accountName: existingDVA.account_name,
            reference: existingDVA.account_reference || existingDVA.id?.toString(),
            customerId: customerCode,
            currency: existingDVA.currency || 'NGN',
            active: existingDVA.active,
            createdAt: existingDVA.created_at || new Date().toISOString(),
          };

          console.log('✓ Using existing DVA:', virtualAccount);
          
          return NextResponse.json({
            success: true,
            virtualAccount,
            note: 'Using existing dedicated virtual account for this customer',
          });
        }
      }
      
      throw new Error(dvaData.message || 'Failed to create dedicated virtual account');
    }

    // Success - format the response
    console.log('✓ DVA created successfully');

    const virtualAccount = {
      accountNumber: dvaData.data.account_number,
      bankName: dvaData.data.bank?.name || dvaData.data.bank_name || 'Bank',
      accountName: dvaData.data.account_name,
      reference: dvaData.data.account_reference || dvaData.data.id?.toString(),
      customerId: customerCode,
      currency: dvaData.data.currency || 'NGN',
      active: dvaData.data.active,
      createdAt: dvaData.data.created_at || new Date().toISOString(),
    };

    console.log('Virtual account details:', virtualAccount);
    console.log('===== Virtual Account Creation Complete =====');

    return NextResponse.json({
      success: true,
      virtualAccount,
      message: `Transfer ₦${amount.toLocaleString()} to account ${virtualAccount.accountNumber} (${virtualAccount.bankName})`,
    });

  } catch (error) {
    console.error('===== Virtual Account Creation Error =====');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.error('==========================================');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create virtual account',
        details: 'Check server logs for details. Ensure: 1) PAYSTACK_SECRET_KEY is correct, 2) DVA is enabled on your Paystack account, 3) You have a verified business (required for live mode DVA)'
      },
      { status: 500 }
    );
  }
}
