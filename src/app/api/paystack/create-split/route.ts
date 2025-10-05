import { NextRequest, NextResponse } from 'next/server';
import { createSplitCode, getMerchantSubaccount } from '@/utils/paystack-split';

export async function POST(request: NextRequest) {
  try {
    const { merchantName, orderId } = await request.json();

    if (!merchantName || !orderId) {
      return NextResponse.json(
        { success: false, error: 'Merchant name and order ID are required' },
        { status: 400 }
      );
    }

    // Get merchant subaccount code
    const merchantSubaccount = getMerchantSubaccount(merchantName);
    
    // Create split name
    const splitName = `Order ${orderId} - ${merchantName}`;

    // For demo purposes, we'll return a mock split code
    // In production, you would call the actual Paystack API
    const mockSplitCode = `SPL_${orderId}_${Date.now()}`;

    // Uncomment below to use actual Paystack API
    // const splitCode = await createSplitCode(merchantSubaccount, splitName);

    return NextResponse.json({
      success: true,
      splitCode: mockSplitCode,
      merchantSubaccount,
      splitName,
      note: 'Using mock split code for demo. Enable actual Paystack API in production.'
    });

  } catch (error) {
    console.error('Error creating split code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create split code' },
      { status: 500 }
    );
  }
}