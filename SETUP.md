# Local Development Setup Guide

This guide will help you set up the Grundy MVP for local development on your machine.

## Prerequisites

Make sure you have these installed:
- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Oluwaseun-XO/grundy-mvp.git

# Navigate to the project directory
cd grundy-mvp

# Install dependencies
npm install
```

## Step 2: Firebase Setup

### 2.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `grundy-mvp` (or your preferred name)
4. Disable Google Analytics (optional for MVP)
5. Click "Create project"

### 2.2 Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### 2.3 Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app with nickname: `grundy-mvp-web`
5. Copy the configuration object

### 2.4 Set Up Firebase Security Rules
In Firestore Database > Rules, replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for development
    // In production, implement proper security rules
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 💳 Step 3: Paystack Setup

### 3.1 Create Paystack Account
1. Go to [Paystack](https://paystack.com/)
2. Sign up for a free account
3. Complete account verification

### 3.2 Get API Keys
1. Log into Paystack Dashboard
2. Go to Settings > API Keys & Webhooks
3. Copy your **Test Public Key** (starts with `pk_test_`)
4. Copy your **Test Secret Key** (starts with `sk_test_`)

### 3.3 Test Cards for Development
Use these test cards for testing payments:
- **Card Number**: `4084084084084081`
- **CVV**: `408`
- **Expiry**: Any future date (e.g., `12/25`)
- **PIN**: `0000`
- **OTP**: `123456`

## Step 4: Environment Variables

### 4.1 Create Environment File
In the project root, create a file named `.env.local`:

```bash
# Create the environment file
touch .env.local
```

### 4.2 Add Configuration
Open `.env.local` and add your configuration:

```env
# Firebase Configuration (replace with your values)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Paystack Configuration (replace with your test keys)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
```

**Important**: 
- Replace all placeholder values with your actual Firebase and Paystack credentials
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- Use only TEST keys for development

## 🏃‍♂️ Step 5: Run the Application

### 5.1 Start Development Server
```bash
npm run dev
```

### 5.2 Open in Browser
- Open [http://localhost:3000](http://localhost:3000)
- You should see the Grundy homepage

### 5.3 Test the Application
1. **Homepage**: Should load with Customer and Rider app links
2. **Customer App**: Browse products, add to cart, test checkout
3. **Rider App**: View orders, test delivery confirmation
4. **Payment Flow**: Test all three payment methods

## 🧪 Step 6: Testing Features

### 6.1 Customer App Testing
1. Go to `/customer`
2. Browse products from different merchants
3. Add items to cart
4. Click checkout and fill customer information
5. Test each payment method:
   - **Online**: Uses Paystack popup
   - **Bank Transfer**: Generates virtual account
   - **Terminal**: Shows POS simulation

### 6.2 Rider App Testing
1. Go to `/rider`
2. Place an order from customer app first
3. Refresh rider app to see new orders
4. Test delivery confirmation
5. Test payment confirmation for delivery methods

### 6.3 Split Payment Testing
1. Add items from multiple merchants to cart
2. Check checkout modal for payment split breakdown
3. Verify 10% platform fee calculation
4. Check order details in Firestore

## 📁 Project Structure Overview

```
grundy-mvp/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   ├── customer/          # Customer app page
│   │   ├── rider/             # Rider app page
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── customer/          # Customer-specific components
│   │   ├── rider/             # Rider-specific components
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React contexts
│   ├── data/                  # Static data (products)
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── public/                    # Static assets
├── .env.local                 # Environment variables (create this)
├── package.json               # Dependencies and scripts
└── README.md                  # Project documentation
```

## 🔧 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🚨 Troubleshooting

### Common Issues:

1. **"Module not found" errors**
   ```bash
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Firebase connection issues**
   - Check that all Firebase environment variables are set correctly
   - Verify Firebase project ID matches your actual project
   - Ensure Firestore is enabled and rules allow access

3. **Paystack integration not working**
   - Verify you're using TEST keys (not live keys)
   - Check that keys don't have extra spaces or characters
   - Ensure popup blockers aren't blocking Paystack

4. **Port 3000 already in use**
   ```bash
   # Use a different port
   npm run dev -- -p 3001
   ```

5. **TypeScript errors**
   ```bash
   # Check types
   npm run type-check
   ```

### Getting Help:

1. **Check the console**: Open browser developer tools and check for errors
2. **Check the terminal**: Look for error messages in your development server
3. **Verify environment variables**: Make sure all required variables are set
4. **Check Firebase**: Verify data is being written to Firestore
5. **Test Paystack**: Use the test cards provided above

Your local development server will be available at: http://localhost:3000
