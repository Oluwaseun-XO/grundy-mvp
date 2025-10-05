import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerEmail } = await request.json();

    const response = await fetch('https://api.paystack.co/dedicated_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: customerEmail,
        preferred_bank: 'test-bank',
        subaccount: orderId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create virtual account');
    }

    await response.json();

    // For demo purposes, we'll create a mock virtual account
    // In production, you would use the actual Paystack response
    const virtualAccount = {
      accountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      bankName: 'Test Bank',
      accountName: `GRUNDY/${orderId.toUpperCase()}`,
      reference: orderId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    };

    return NextResponse.json({
      success: true,
      virtualAccount,
    });
  } catch (error) {
    console.error('Error creating virtual account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create virtual account' },
      { status: 500 }
    );
  }
}