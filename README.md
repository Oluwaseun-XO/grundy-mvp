# Grundy MVP - Multi-Payment E-commerce Platform

A comprehensive food delivery MVP built with Next.js, Firebase, and Paystack integration featuring customer app, rider app, and multiple payment methods.

## 🚀 Features

### Customer App
- **Product Catalog**: Browse 15+ hardcoded products with images, descriptions, and pricing
- **Shopping Cart**: Add/remove items, adjust quantities, view total
- **Multiple Payment Methods**:
  - **Online Checkout**: Instant payment with Paystack
  - **Bank Transfer on Delivery**: Virtual account generation via Paystack API
  - **Terminal on Delivery**: POS terminal simulation
- **Order Tracking**: Real-time order status updates
- **Receipt Generation**: Automatic email receipts for all orders

### Rider App
- **Order Management**: View all customer orders in real-time
- **Order Status Updates**: Track orders from pending to delivered
- **Payment Processing**: 
  - Generate virtual accounts for bank transfers
  - Simulate POS terminal payments
  - Confirm payment receipts
- **Delivery Confirmation**: Update order status and payment confirmation

### Payment Integration
- **Paystack Integration**: Full test mode integration with public/secret keys
- **Virtual Accounts**: Dynamic generation for bank transfer orders
- **Transaction Tracking**: Complete audit trail for all payments
- **Receipt System**: Automated receipt generation and email delivery

## 🛠 Tech Stack

- **Frontend**: Next.js 15 + TypeScript + TailwindCSS
- **Backend**: Firebase (Firestore + Cloud Functions)
- **Payment**: Paystack API (Test Mode)
- **Deployment**: Vercel
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Project Structure

```
grundy-mvp/
├── src/
│   ├── app/
│   │   ├── api/paystack/          # Paystack API routes
│   │   ├── customer/              # Customer app pages
│   │   ├── rider/                 # Rider app pages
│   │   ├── layout.tsx             # Root layout with providers
│   │   └── page.tsx               # Landing page
│   ├── components/
│   │   ├── customer/              # Customer-specific components
│   │   ├── rider/                 # Rider-specific components
│   │   └── ui/                    # Reusable UI components
│   ├── contexts/
│   │   └── CartContext.tsx        # Shopping cart state management
│   ├── data/
│   │   └── products.ts            # Hardcoded product catalog
│   ├── lib/
│   │   └── firebase.ts            # Firebase configuration
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── utils/
│       ├── firebase.ts            # Firebase utility functions
│       └── paystack.ts            # Paystack utility functions
├── .env.local                     # Environment variables
├── next.config.ts                 # Next.js configuration
└── package.json                   # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase project created
- Paystack account (test mode)
- Git installed

### 1. Clone the Repository

```bash
git clone https://github.com/Oluwaseun-XO/grundy-mvp.git
cd grundy-mvp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Paystack Configuration (Test Mode)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
```

### 4. Firebase Setup

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `grundy-mvp`
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Step 2: Enable Firestore
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode"
4. Select your preferred location
5. Click "Done"

#### Step 3: Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon to add a web app
4. Register app with name: `grundy-mvp`
5. Copy the config values to your `.env.local`

#### Step 4: Set Firestore Rules (Optional for Production)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

### 5. Paystack Setup

#### Step 1: Create Paystack Account
1. Go to [Paystack](https://paystack.com/)
2. Sign up for an account
3. Complete verification process

#### Step 2: Get API Keys
1. Login to Paystack Dashboard
2. Go to Settings > API Keys & Webhooks
3. Copy your **Test** Public Key and Secret Key
4. Add them to your `.env.local` file

#### Step 3: Test Virtual Account Creation
The app uses Paystack's Dedicated Virtual Account API. In test mode:
- Virtual accounts are simulated
- No real money transactions occur
- Use test card numbers for online payments

### 6. Run the Application

```bash
npm run dev
```

The application will be available at:
- **Local**: http://localhost:3000
- **Customer App**: http://localhost:3000/customer
- **Rider App**: http://localhost:3000/rider

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Testing Payment Methods

#### 1. Online Checkout (Paystack)
- Use test card: `4084084084084081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `123456`

#### 2. Bank Transfer on Delivery (Paystack Virtual Account)
- Uses Paystack's actual Dedicated Virtual Account API in test mode
- Order is placed with "pending" payment status
- Virtual account is generated using `test-bank` as preferred bank
- Account details are real test accounts from Paystack's API response
- To test transfers, use Paystack's demo bank application at: https://demo.paystack.com/
- Rider can generate virtual account details when customer chooses this payment method
- Use the generated account number and bank details to simulate transfer
- Rider confirms payment manually in the app (simulating webhook confirmation)

#### 3. Terminal on Delivery
- Order is placed with "pending" payment status
- Rider can simulate POS terminal payment
- Confirm payment in rider app

## 🚀 Deployment to Vercel

### Step 1: Prepare for Deployment

```bash
# Build the project to check for errors
npm run build
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: grundy-mvp
# - Directory: ./
# - Override settings? No
```

#### Option B: GitHub Integration
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Deploy

### Step 3: Configure Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Click "Settings" > "Environment Variables"
3. Add all variables from your `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - `PAYSTACK_SECRET_KEY`

### Step 4: Redeploy
After adding environment variables, trigger a new deployment:
```bash
vercel --prod
```

## 📱 Usage Guide

### For Customers
1. Visit the customer app
2. Browse products and add to cart
3. Click "Proceed to Checkout"
4. Fill in customer information
5. Choose payment method:
   - **Online**: Pay immediately with Paystack
   - **Bank Transfer**: Pay when rider arrives with virtual account
   - **Terminal**: Pay when rider arrives with POS terminal
6. Track order status in real-time

### For Riders
1. Visit the rider app
2. View all orders with status filters
3. Update order status as you process them
4. For delivery payments:
   - **Bank Transfer**: Generate virtual account and confirm payment
   - **Terminal**: Simulate POS payment and confirm
5. Mark orders as delivered when complete

## 🔍 API Endpoints

### Paystack Integration
- `POST /api/paystack/create-virtual-account` - Create virtual account for order
- `GET /api/paystack/verify-payment` - Verify payment status

### Firebase Collections
- `orders` - Customer orders with payment and delivery info
- `transactions` - Payment transaction records
- `receipts` - Generated receipts for orders

## 🐛 Troubleshooting

### Common Issues

#### 1. Firebase Connection Error
- Check if Firebase config is correct in `.env.local`
- Ensure Firestore is enabled in Firebase Console
- Verify Firestore rules allow read/write access

#### 2. Paystack Payment Fails
- Confirm you're using test keys (start with `pk_test_` and `sk_test_`)
- Check if test card details are correct
- Ensure Paystack account is verified

#### 3. Images Not Loading
- Check if Unsplash domain is allowed in `next.config.ts`
- Verify internet connection for external images

#### 4. Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Development Tips

1. **Hot Reload**: The app supports hot reload for instant development feedback
2. **TypeScript**: All components are fully typed for better development experience
3. **Responsive Design**: The app works on desktop, tablet, and mobile devices
4. **Error Handling**: Comprehensive error handling with user-friendly messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Paystack](https://paystack.com/) - Payment processing
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Lucide React](https://lucide.dev/) - Icons
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the [Next.js documentation](https://nextjs.org/docs)
3. Check [Firebase documentation](https://firebase.google.com/docs)
4. Review [Paystack documentation](https://paystack.com/docs)
5. Open an issue on GitHub

---

**Happy coding! 🚀**
