// Paystack Split Payment Utilities
// Handles the 10% platform fee split for Grundy LLC

export interface SplitConfig {
  type: 'percentage' | 'flat';
  currency: string;
  subaccounts: Array<{
    subaccount: string;
    share: number;
  }>;
  bearer_type: 'account' | 'subaccount' | 'all-proportional' | 'all';
  bearer_subaccount?: string;
}

export interface CreateSplitCodeRequest {
  name: string;
  type: 'percentage';
  currency: 'NGN';
  subaccounts: Array<{
    subaccount: string;
    share: number;
  }>;
  bearer_type: 'subaccount';
  bearer_subaccount: string;
}

export interface CreateSplitCodeResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    type: string;
    currency: string;
    integration: number;
    domain: string;
    split_code: string;
    active: boolean;
    bearer_type: string;
    bearer_subaccount: string;
    subaccounts: Array<{
      subaccount: {
        id: number;
        subaccount_code: string;
        business_name: string;
        description: string;
        primary_contact_name: string;
        primary_contact_email: string;
        primary_contact_phone: string;
        metadata: Record<string, unknown>;
        percentage_charge: number;
        settlement_bank: string;
        account_number: string;
      };
      share: number;
    }>;
    total_subaccounts: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Creates a split code for marketplace transactions
 * Grundy LLC gets 10% platform fee, merchant gets 90%
 */
export async function createSplitCode(
  merchantSubaccountCode: string,
  splitName: string
): Promise<string> {
  const splitData: CreateSplitCodeRequest = {
    name: splitName,
    type: 'percentage',
    currency: 'NGN',
    subaccounts: [
      {
        subaccount: merchantSubaccountCode,
        share: 90 // Merchant gets 90%
      }
      // Grundy LLC gets remaining 10% automatically as the main account
    ],
    bearer_type: 'subaccount',
    bearer_subaccount: merchantSubaccountCode // Merchant bears transaction fees
  };

  const response = await fetch('https://api.paystack.co/split', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(splitData),
  });

  if (!response.ok) {
    throw new Error('Failed to create split code');
  }

  const result: CreateSplitCodeResponse = await response.json();
  return result.data.split_code;
}

/**
 * Mock merchant subaccount codes for demo purposes
 * In production, these would be stored in your database
 */
export const MERCHANT_SUBACCOUNTS: Record<string, string> = {
  'Balogun Market': 'ACCT_test_balogun_market',
  'Alaba Grocery': 'ACCT_test_alaba_grocery', 
  'Makoko Fish Market': 'ACCT_test_makoko_fish'
};

/**
 * Gets the subaccount code for a merchant
 */
export function getMerchantSubaccount(merchantName: string): string {
  return MERCHANT_SUBACCOUNTS[merchantName] || 'ACCT_test_default_merchant';
}

/**
 * Calculates platform fee (10%) and merchant amount (90%)
 */
export function calculateSplit(totalAmount: number) {
  const platformFee = Math.round(totalAmount * 0.1); // 10% for Grundy LLC
  const merchantAmount = totalAmount - platformFee; // 90% for merchant
  
  return {
    totalAmount,
    platformFee,
    merchantAmount,
    platformFeePercentage: 10,
    merchantPercentage: 90
  };
}