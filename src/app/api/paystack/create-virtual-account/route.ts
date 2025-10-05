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

    const data = await response.json();

    // Use actual Paystack test mode response
    const virtualAccount = {
      accountNumber: data.data.account_number,
      bankName: data.data.bank.name,
      accountName: data.data.account_name,
      reference: data.data.account_reference,
      customerId: data.data.customer.id,
      currency: data.data.currency,
      active: data.data.active,
      createdAt: data.data.created_at,
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