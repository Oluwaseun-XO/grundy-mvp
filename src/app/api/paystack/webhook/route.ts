import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateOrderPaymentStatus, createTransaction } from '@/utils/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const event = JSON.parse(body);
    console.log('Paystack webhook received:', event.event);

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      
      case 'charge.failed':
        await handleFailedPayment(event.data);
        break;
      
      case 'transfer.success':
        await handleTransferSuccess(event.data);
        break;
      
      case 'transfer.failed':
        await handleTransferFailed(event.data);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(data: Record<string, unknown>) {
  try {
    const { reference, amount, metadata } = data;
    
    console.log(`Payment successful: ${reference} - ${(amount as number)/100}`);

    // Extract order ID from reference or metadata
    const orderId = (metadata as Record<string, unknown>)?.orderId || reference;

    if (orderId && typeof orderId === 'string') {
      // Update order status
      await updateOrderPaymentStatus(orderId, 'paid', 'confirmed');

      // Create transaction record
      await createTransaction({
        orderId,
        amount: (amount as number) / 100, // Convert from kobo to naira
        paymentMethod: 'online',
        status: 'paid',
        reference: reference as string,
        paystackData: data,
      });

      console.log(`Order ${orderId} marked as paid via webhook`);
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(data: Record<string, unknown>) {
  try {
    const { reference, metadata } = data;
    
    console.log(`Payment failed: ${reference}`);

    const orderId = (metadata as Record<string, unknown>)?.orderId || reference;

    if (orderId && typeof orderId === 'string') {
      await updateOrderPaymentStatus(orderId, 'failed', 'cancelled');
      console.log(`Order ${orderId} marked as failed via webhook`);
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function handleTransferSuccess(data: Record<string, unknown>) {
  try {
    console.log('Transfer successful:', data.reference);
    // Handle successful transfers to merchants (split payments)
  } catch (error) {
    console.error('Error handling transfer success:', error);
  }
}

async function handleTransferFailed(data: Record<string, unknown>) {
  try {
    console.log('Transfer failed:', data.reference);
    // Handle failed transfers to merchants
  } catch (error) {
    console.error('Error handling transfer failure:', error);
  }
}