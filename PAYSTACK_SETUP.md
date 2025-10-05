# 🔐 Paystack Integration Setup Guide

This guide explains how to set up Paystack integration with webhooks and callback URLs for the Grundy MVP.

## 📋 Overview

### What We Implemented:
- ✅ **Popup/Inline Payments** - No callback URL needed
- ✅ **Webhook Endpoint** - For reliable payment notifications
- ✅ **Split Payments** - Automatic 10% platform fee
- ✅ **Virtual Accounts** - For bank transfer payments
- ✅ **Transaction Tracking** - Complete audit trail

### What You Need:
- **Callback URL**: ❌ Not needed (we use popup payments)
- **Webhook URL**: ✅ Required for production reliability

## 🔧 Paystack Dashboard Setup

### Step 1: Get Your API Keys

1. **Login to Paystack Dashboard**
   - Go to [paystack.com](https://paystack.com)
   - Sign in to your account

2. **Navigate to API Keys**
   - Go to Settings > API Keys & Webhooks
   - Copy your **Test Public Key** (starts with `pk_test_`)
   - Copy your **Test Secret Key** (starts with `sk_test_`)

### Step 2: Configure Webhook URL

1. **In Paystack Dashboard**
   - Go to Settings > API Keys & Webhooks
   - Scroll down to "Webhooks"
   - Click "Add Webhook"

2. **Add Webhook Details**
   ```
   Webhook URL: https://your-domain.vercel.app/api/paystack/webhook
   Events: Select all or these specific ones:
   - charge.success
   - charge.failed
   - transfer.success
   - transfer.failed
   ```

3. **For Local Development**
   ```
   Use ngrok to expose your local server:
   
   # Install ngrok
   npm install -g ngrok
   
   # In one terminal, start your app
   npm run dev
   
   # In another terminal, expose port 3000
   ngrok http 3000
   
   # Use the ngrok URL for webhook
   https://abc123.ngrok.io/api/paystack/webhook
   ```

## 🔄 How Our Payment Flow Works

### 1. Online Checkout (Popup Payment)
```
Customer clicks "Pay Now"
    ↓
Order created with "pending" status
    ↓
Paystack popup opens
    ↓
Customer completes payment
    ↓
JavaScript callback updates order to "paid"
    ↓
Webhook confirms payment (backup)
    ↓
Receipt sent to customer
```

**Why no Callback URL needed:**
- We use Paystack's popup/inline payment
- JavaScript callback handles the response directly
- User never leaves our website

### 2. Bank Transfer on Delivery
```
Customer selects "Bank Transfer"
    ↓
Order created with "pending" status
    ↓
Virtual account generated via Paystack API
    ↓
Rider sees virtual account details
    ↓
Customer transfers money when rider arrives
    ↓
Webhook receives transfer notification
    ↓
Order status updated to "paid"
```

### 3. Terminal on Delivery (POS Simulation)
```
Customer selects "Terminal"
    ↓
Order created with "pending" status
    ↓
Rider arrives with POS terminal
    ↓
Customer pays via card/tap
    ↓
Rider manually confirms payment
    ↓
Order status updated to "paid"
```

## 🔗 Webhook Implementation

### Our Webhook Endpoint: `/api/paystack/webhook`

**What it does:**
- Verifies webhook signature for security
- Handles different payment events
- Updates order status automatically
- Creates transaction records
- Provides backup payment confirmation

**Events we handle:**
```typescript
charge.success    → Update order to "paid"
charge.failed     → Update order to "failed"
transfer.success  → Log successful merchant transfer
transfer.failed   → Log failed merchant transfer
```

**Security Features:**
- ✅ Signature verification using HMAC SHA512
- ✅ Secret key validation
- ✅ Error handling and logging
- ✅ Idempotent processing

## 🧪 Testing Your Setup

### Test Cards (Paystack Test Mode)
```
Successful Payment:
Card: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456

Failed Payment:
Card: 4084084084084081
CVV: 123
Expiry: Any future date
```

### Test Virtual Account Transfer
1. Create an order with "Bank Transfer" payment
2. Note the virtual account details
3. In Paystack Dashboard, go to "Transactions"
4. Simulate a transfer to the virtual account
5. Check if webhook updates the order status

### Test Webhook Locally
```bash
# Use ngrok to expose your local server
ngrok http 3000

# Update webhook URL in Paystack dashboard
https://your-ngrok-url.ngrok.io/api/paystack/webhook

# Make a test payment and check logs
```

## 🚀 Production Deployment

### Environment Variables Required
```env
# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key

# For production, use live keys:
# NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
# PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
```

### Webhook URL for Production
```
Production Webhook URL: https://your-domain.vercel.app/api/paystack/webhook
```

### Going Live Checklist
- [ ] Switch to live API keys
- [ ] Update webhook URL to production domain
- [ ] Test all payment methods in live mode
- [ ] Verify webhook signature validation
- [ ] Monitor webhook delivery in Paystack dashboard
- [ ] Set up proper error monitoring

## 🔍 Monitoring & Debugging

### Check Webhook Delivery
1. **Paystack Dashboard**
   - Go to Settings > API Keys & Webhooks
   - Click on your webhook
   - View delivery logs and responses

2. **Vercel Function Logs**
   - Go to your Vercel dashboard
   - Click on your project
   - Go to Functions tab
   - Check `/api/paystack/webhook` logs

### Common Issues

1. **Webhook Not Receiving Events**
   - Check webhook URL is correct
   - Verify webhook is active in Paystack
   - Check if your server is accessible

2. **Signature Verification Fails**
   - Ensure `PAYSTACK_SECRET_KEY` is correct
   - Check for extra spaces in environment variables
   - Verify webhook body is not modified

3. **Orders Not Updating**
   - Check Firebase permissions
   - Verify order ID is passed correctly
   - Check webhook processing logs

## 📞 Support Resources

- **Paystack Documentation**: https://paystack.com/docs
- **Webhook Guide**: https://paystack.com/docs/payments/webhooks
- **API Reference**: https://paystack.com/docs/api
- **Test Cards**: https://paystack.com/docs/payments/test-payments

## 🎯 Summary

**What you need to do:**
1. ✅ Get Paystack API keys (already done)
2. ✅ Add webhook URL in Paystack dashboard
3. ✅ Test payments with test cards
4. ✅ Deploy to production
5. ✅ Switch to live keys when ready

**What's already implemented:**
- ✅ Complete webhook endpoint
- ✅ Payment processing logic
- ✅ Order status management
- ✅ Transaction tracking
- ✅ Error handling
- ✅ Security measures

Your Grundy MVP is production-ready with robust payment processing! 🚀