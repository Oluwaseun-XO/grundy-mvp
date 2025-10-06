import { VirtualAccount } from '@/types';

export const initializePaystackPayment = (
  email: string,
  amount: number,
  reference: string,
  onSuccess: (reference: Record<string, unknown>) => void,
  onClose: () => void,
  metadata?: Record<string, unknown>
) => {
  const splitCode = process.env.NEXT_PUBLIC_PAYSTACK_SPLIT_CODE;
  
  // Build config object conditionally
  const config: any = {
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // Paystack expects amount in kobo
    ref: reference,
    metadata: metadata || {},
    onClose: onClose,
    callback: function(response: Record<string, unknown>) {
      console.log('Paystack payment successful:', response);
      onSuccess(response);
    },
  };
  
  // Only add split_code if it's defined and not empty
  if (splitCode && splitCode.trim() !== '') {
    config.split_code = splitCode;
    console.log('Using split code:', splitCode);
  } else {
    console.log('No split code configured - proceeding without split');
  }
  
  // @ts-expect-error PaystackPop is loaded from external script
  const handler = PaystackPop.setup(config);
  
  handler.openIframe();
};

export const generateReference = (): string => {
  return `grundy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

export const createVirtualAccount = async (
  orderId: string,
  customerEmail: string,
  amount: number
): Promise<VirtualAccount | null> => {
  try {
    const response = await fetch('/api/paystack/create-virtual-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        customerEmail,
        amount,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create virtual account');
    }

    const data = await response.json();
    return data.virtualAccount;
  } catch (error) {
    console.error('Error creating virtual account:', error);
    return null;
  }
};

export const verifyPayment = async (reference: string) => {
  try {
    const response = await fetch(`/api/paystack/verify-payment?reference=${reference}`);
    
    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return null;
  }
};
