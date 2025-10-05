# 🔄 How to Update Your Local Code

## Method 1: Pull Latest Changes (Recommended)

```bash
# Navigate to your project directory
cd grundy-mvp

# Pull the latest changes from GitHub
git pull origin main

# Install any new dependencies
npm install

# Restart your development server
npm run dev
```

## Method 2: If You Have Local Changes

If you've made local changes that conflict:

```bash
# Save your current changes
git stash

# Pull latest changes
git pull origin main

# Apply your changes back (if needed)
git stash pop

# Install dependencies
npm install

# Restart server
npm run dev
```

## Method 3: Fresh Clone (If Issues Persist)

```bash
# Backup your .env.local file first
cp grundy-mvp/.env.local ~/env-backup.txt

# Remove old directory
rm -rf grundy-mvp

# Clone fresh copy
git clone https://github.com/Oluwaseun-XO/grundy-mvp.git
cd grundy-mvp

# Restore your environment variables
cp ~/env-backup.txt .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

## ✅ Verify Update

After updating, check that you have the latest features:
- Webhook endpoint at `/api/paystack/webhook`
- Updated payment flow
- New documentation files (PAYSTACK_SETUP.md)