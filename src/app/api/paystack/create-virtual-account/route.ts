import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerEmail, amount } = await request.json();

    if (!customerEmail || !orderId) {
      return NextResponse.json(
        { success: false, error: 'Customer email and order ID are required' },
        { status: 400 }
      );
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Step 1: Create or get customer
    let customerCode: string;
    
    try {
      // Try to fetch existing customer first
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

      if (getCustomerResponse.ok) {
        const customerData = await getCustomerResponse.json();
        customerCode = customerData.data.customer_code;
        console.log('Using existing customer:', customerCode);
      } else {
        // Customer doesn't exist, create new one
        const createCustomerResponse = await fetch('https://api.paystack.co/customer', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: customerEmail,
            first_name: 'Customer',
            last_name: `Order ${orderId.slice(-8)}`,
          }),
        });

        if (!createCustomerResponse.ok) {
          const errorData = await createCustomerResponse.json();
          console.error('Failed to create customer:', errorData);
          throw new Error(errorData.message || 'Failed to create customer');
        }

        const customerData = await createCustomerResponse.json();
        customerCode = customerData.data.customer_code;
        console.log('Created new customer:', customerCode);
      }
    } catch (error) {
      console.error('Error handling customer:', error);
      throw new Error('Failed to get or create customer');
    }

    // Step 2: Create Dedicated Virtual Account using test-bank for test mode
    const createDVAResponse = await fetch('https://api.paystack.co/dedicated_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: customerCode,
        preferred_bank: 'test-bank', // Use 'test-bank' for test mode, or 'wema-bank'/'titan-paystack' for live
        // Optional: Add metadata for tracking
        metadata: {
          order_id: orderId,
          amount: amount,
        }
      }),
    });

    if (!createDVAResponse.ok) {
      const errorData = await createDVAResponse.json();
      console.error('Paystack DVA creation failed:', errorData);
      
      // Check if it's because DVA already exists
      if (errorData.message && errorData.message.includes('already')) {
        // Try to fetch existing DVA
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

        if (listDVAResponse.ok) {
          const listData = await listDVAResponse.json();
          if (listData.data && listData.data.length > 0) {
            const existingDVA = listData.data[0];
            const virtualAccount = {
              accountNumber: existingDVA.account_number,
              bankName: existingDVA.bank.name,
              accountName: existingDVA.account_name,
              reference: existingDVA.account_reference || existingDVA.id,
              customerId: existingDVA.customer.customer_code,
              currency: existingDVA.currency || 'NGN',
              active: existingDVA.active,
              createdAt: existingDVA.created_at,
            };

            console.log('Using existing DVA:', virtualAccount);
            
            return NextResponse.json({
              success: true,
              virtualAccount,
              note: 'Using existing dedicated virtual account',
            });
          }
        }
      }
      
      throw new Error(errorData.message || 'Failed to create dedicated virtual account');
    }

    const dvaData = await createDVAResponse.json();
    console.log('DVA created successfully:', dvaData);

    // Format the response
    const virtualAccount = {
      accountNumber: dvaData.data.account_number,
      bankName: dvaData.data.bank.name,
      accountName: dvaData.data.account_name,
      reference: dvaData.data.account_reference || dvaData.data.id,
      customerId: dvaData.data.customer.customer_code,
      currency: dvaData.data.currency || 'NGN',
      active: dvaData.data.active,
      createdAt: dvaData.data.created_at,
    };

    return NextResponse.json({
      success: true,
      virtualAccount,
      message: 'Dedicated virtual account created successfully. Transfer the exact amount to complete payment.',
    });

  } catch (error) {
    console.error('Error in virtual account creation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create virtual account',
        details: 'Please ensure PAYSTACK_SECRET_KEY is configured correctly and you have DVA enabled on your Paystack account.'
      },
      { status: 500 }
    );
  }
}
