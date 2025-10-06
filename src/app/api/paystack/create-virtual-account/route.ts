import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerEmail, amount } = await request.json();
    
    console.log('===== Virtual Account Creation Request =====');
    console.log('Order ID:', orderId);
    console.log('Customer Email:', customerEmail);
    console.log('Amount:', amount);

    if (!customerEmail || !orderId || !amount) {
      console.error('Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Customer email, order ID, and amount are required' },
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

    // Initialize Paystack transaction with bank transfer channel
    console.log('Initializing Paystack transaction...');
    
    const initResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerEmail,
        amount: amount * 100, // Convert to kobo
        currency: 'NGN',
        channels: ['bank_transfer'], // Only allow bank transfer
        metadata: {
          orderId,
          paymentMethod: 'transfer_on_delivery',
          custom_fields: [
            {
              display_name: 'Order ID',
              variable_name: 'order_id',
              value: orderId,
            }
          ]
        },
      }),
    });

    const initData = await initResponse.json();
    console.log('Transaction initialization response:', initData);

    if (!initResponse.ok || !initData.status) {
      console.error('Transaction initialization failed:', initData);
      throw new Error(initData.message || 'Failed to initialize transaction');
    }

    const reference = initData.data.reference;
    
    // Wait briefly for Paystack to generate the virtual account
    console.log('Waiting for virtual account generation...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify transaction to get bank transfer details
    console.log('Fetching bank transfer details...');
    
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const verifyData = await verifyResponse.json();
    console.log('Transaction verification response:', verifyData);

    if (!verifyResponse.ok || !verifyData.status) {
      throw new Error('Failed to fetch transfer details');
    }

    // Extract bank transfer details
    const bankTransfer = verifyData.data?.pay_with_bank_transfer;
    
    if (!bankTransfer) {
      console.log('Transfer details not immediately available');
      
      return NextResponse.json({
        success: true,
        virtualAccount: null,
        paymentUrl: initData.data.authorization_url,
        reference,
        message: 'Virtual account is being generated',
        note: 'Please check the payment URL or try again in a few seconds',
      });
    }

    const virtualAccount = {
      accountNumber: bankTransfer.account_number,
      bankName: bankTransfer.bank_name,
      accountName: bankTransfer.account_name || 'PAYSTACK-PAYMENTS',
      reference,
      currency: 'NGN',
      active: true,
      createdAt: new Date().toISOString(),
      expiresAt: bankTransfer.expires_at,
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
        details: 'Check server logs for details'
      },
      { status: 500 }
    );
  }
}
