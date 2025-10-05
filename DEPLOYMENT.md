# 🚀 Deployment Guide - Grundy MVP

This guide will walk you through deploying your Grundy MVP to Vercel step-by-step.

## Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account with the repository
- ✅ Vercel account (free tier works)
- ✅ Firebase project set up
- ✅ Paystack test account

## 🔧 Step 1: Environment Variables Setup

### 1.1 Firebase Configuration
1. Go to your Firebase Console
2. Navigate to Project Settings > General
3. Scroll down to "Your apps" and click the web app icon
4. Copy the configuration values

### 1.2 Paystack Configuration
1. Log into your Paystack Dashboard
2. Go to Settings > API Keys & Webhooks
3. Copy your Test Public Key and Test Secret Key

### 1.3 Create Environment Variables
You'll need these environment variables for Vercel:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
```

## 🌐 Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for beginners)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your `grundy-mvp` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `.next` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)

4. **Add Environment Variables**
   - In the deployment configuration, expand "Environment Variables"
   - Add each variable from Step 1.3:
     ```
     Name: NEXT_PUBLIC_FIREBASE_API_KEY
     Value: your_firebase_api_key
     ```
   - Repeat for all variables
   - Make sure to select "Production", "Preview", and "Development" for each

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (usually 2-3 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**
   ```bash
   cd grundy-mvp
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - What's your project's name? `grundy-mvp`
   - In which directory is your code located? `./`

5. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
   vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
   vercel env add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
   vercel env add PAYSTACK_SECRET_KEY
   ```

6. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

## 🔍 Step 3: Verify Deployment

1. **Check the deployment URL**
   - Vercel will provide a URL like `https://grundy-mvp-username.vercel.app`
   - Click on it to open your deployed app

2. **Test Core Functionality**
   - ✅ Homepage loads correctly
   - ✅ Customer app displays products
   - ✅ Cart functionality works
   - ✅ Checkout modal opens
   - ✅ Rider app displays orders
   - ✅ Payment split breakdown shows correctly

3. **Test Payment Integration (Optional)**
   - Use Paystack test cards for online payments
   - Test card: `4084084084084081`
   - CVV: `408`
   - Expiry: Any future date
   - PIN: `0000`
   - OTP: `123456`

## 🔧 Step 4: Configure Custom Domain (Optional)

1. **In Vercel Dashboard**
   - Go to your project
   - Click "Settings" > "Domains"
   - Add your custom domain
   - Follow DNS configuration instructions

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that all environment variables are set
   - Ensure Firebase configuration is correct
   - Check the build logs in Vercel dashboard

2. **Firebase Connection Issues**
   - Verify all Firebase environment variables
   - Check Firebase project permissions
   - Ensure Firestore rules allow read/write

3. **Paystack Integration Issues**
   - Verify Paystack keys are correct
   - Ensure you're using test keys for development
   - Check Paystack dashboard for API logs

4. **Environment Variables Not Working**
   - Ensure `NEXT_PUBLIC_` prefix for client-side variables
   - Redeploy after adding environment variables
   - Check variable names match exactly

### Getting Help:

1. **Check Vercel Logs**
   - Go to your project dashboard
   - Click on a deployment
   - Check "Functions" and "Build Logs" tabs

2. **Check Browser Console**
   - Open developer tools
   - Look for JavaScript errors
   - Check network tab for failed requests

## 🎉 Success!

Your Grundy MVP should now be live! Share the URL with others to test the marketplace functionality.

### Next Steps:
- Set up monitoring with Vercel Analytics
- Configure webhooks for production Paystack integration
- Set up proper Firebase security rules
- Add custom domain
- Set up continuous deployment

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel documentation
3. Check Firebase and Paystack documentation
4. Ensure all environment variables are correctly set

---

**Deployment URL**: Your app will be available at `https://grundy-mvp-[username].vercel.app`

**Repository**: https://github.com/Oluwaseun-XO/grundy-mvp