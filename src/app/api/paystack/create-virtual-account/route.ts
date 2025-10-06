import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerEmail, amount } = await request.json();
    
    console.log('===== Payment Request Initialization =====');
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

    // Initialize Paystack transaction with bank transfer only
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
        channels: ['bank_transfer'], // Only show bank transfer option
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
    const authorizationUrl = initData.data.authorization_url;
    const accessCode = initData.data.access_code;

    console.log('Payment initialized successfully');
    console.log('Reference:', reference);
    console.log('Authorization URL:', authorizationUrl);
    console.log('===== Initialization Complete =====');

    return NextResponse.json({
      success: true,
      reference,
      authorizationUrl,
      accessCode,
      amount,
      message: 'Payment link generated. Show this to customer.',
    });

  } catch (error) {
    console.error('===== Payment Initialization Error =====');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.error('==========================================');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize payment',
        details: 'Check server logs for details'
      },
      { status: 500 }
    );
  }
}
