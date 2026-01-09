# HookScale - Complete Setup Guide

Everything you need to get HookScale running from scratch.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Database Setup](#database-setup)
3. [Stripe Setup](#stripe-setup)
4. [Environment Variables](#environment-variables)
5. [Running Locally](#running-locally)
6. [Testing](#testing)
7. [Deployment](#deployment)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Stripe account (US-based)
- Vercel account (for Blob storage)

### Installation

```bash
# Clone repository
git clone <your-repo>
cd hookscale

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to initialize
4. Copy project URL and keys

### 2. Run Database Migrations

In Supabase SQL Editor, run these files in order:

**Step 1: Base Schema**
```sql
-- Copy and run contents from: lib/schema.sql
```

**Step 2: Add ZIP Support**
```sql
-- Copy and run contents from: UPDATE_DB_ZIP.sql
```

**Step 3: Add Structure Support**
```sql
-- Copy and run contents from: UPDATE_DB_STRUCTURE.sql
```

**Step 4: Add Subscriptions**
```sql
-- Copy and run contents from: UPDATE_DB_SUBSCRIPTIONS.sql
```

**Step 5: Add Users & Auth**
```sql
-- Copy and run contents from: UPDATE_DB_USERS.sql
```

### 3. Verify Tables

Run this query to verify all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Should show:
- `combinations`
- `jobs`
- `subscriptions`
- `users`
- `videos`

## 💳 Stripe Setup

### 1. Create Stripe Account

1. Visit [stripe.com/register](https://stripe.com/register)
2. Select **United States** as country
3. Complete verification

### 2. Get API Keys

**Test Mode (Development):**
1. Go to Dashboard → Developers → API keys
2. Copy **Publishable key** (starts with `pk_test_`)
3. Copy **Secret key** (starts with `sk_test_`)

**Live Mode (Production):**
1. Complete account verification
2. Toggle to "Live mode"
3. Copy **Publishable key** (starts with `pk_live_`)
4. Copy **Secret key** (starts with `sk_live_`)

### 3. Configure Webhook

**For Local Development:**

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Copy the webhook secret shown (starts with `whsec_`)

**For Production:**

1. Go to Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://yourdomain.com/api/stripe-webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret**

### 4. Products (Auto-Created!)

**No manual setup needed!** Products are created automatically when users subscribe.

The system creates:
- **HookScale Starter** - $29/month
- **HookScale Premium** - $59/month
- **HookScale Scale** - $199/month

## ⚙️ Environment Variables

Create `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Stripe (ONLY SECRET KEY NEEDED - Products auto-created!)
STRIPE_SECRET_KEY=sk_test_xxxxx

# Stripe Webhook
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Each Variable

#### Supabase Variables
1. Go to Supabase Dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

#### Vercel Blob Token
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (or create one)
3. Go to Storage → Create → Blob
4. Copy the token → `BLOB_READ_WRITE_TOKEN`

#### Stripe Keys
See [Stripe Setup](#stripe-setup) above

## 🏃 Running Locally

### 1. Start Development Server

```bash
npm run dev
```

### 2. Start Stripe Webhook Listener (separate terminal)

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

### 3. Open Browser

Visit: http://localhost:3000

## 🧪 Testing

### Test User Registration

1. Click "Sign In"
2. Click "Create Account"
3. Email: `test@example.com`
4. Password: `test123`
5. Should redirect to `/pricing`

### Test Subscription

1. Choose any plan
2. Use test card: `4242 4242 4242 4242`
3. Expiry: any future date
4. CVC: any 3 digits
5. ZIP: any valid ZIP
6. Complete checkout
7. Should redirect to `/pricing/success`
8. Click "Start Creating Videos"
9. Should see dashboard with credits in header

### Test Video Generation

1. In dashboard:
   - Step 1: Choose aspect ratio (e.g., 9:16)
   - Step 2: Upload videos
     - Upload 2 hooks
     - Upload 2 bodies
     - Should show "4 combinations"
2. Click "Generate"
3. Check header: credits should decrease by 4
4. Should redirect to job page

### Test Credits

**Before generation:**
```
Premium plan: 200 credits shown in header
```

**After generating 6 videos:**
```
Header should show: 194 credits
```

**Check in database:**
```sql
SELECT * FROM subscriptions WHERE status = 'active';
-- videos_used should be 6
-- videos_remaining = video_limit - videos_used = 194
```

### Test Upgrade

1. Go to Settings
2. Click "View All Plans"
3. Choose higher plan (e.g., Starter → Premium)
4. Button shows "Upgrade"
5. Complete checkout
6. Credits should increase (add new plan credits)

### Test Downgrade

1. Go to Settings
2. Click "View All Plans"
3. Choose lower plan (e.g., Premium → Starter)
4. Button shows "Downgrade"
5. Complete checkout
6. Credits reset to new plan limit

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Set Environment Variables

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from `.env.local`
5. **Important**: Use **live** Stripe keys for production

### Update Stripe Webhook

1. Go to Stripe Dashboard → Webhooks
2. Update endpoint URL to: `https://yourdomain.com/api/stripe-webhook`
3. Use **live** mode webhook secret

### Switch to Live Mode

Update `.env` in Vercel:
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx  # Live key
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Live webhook secret
```

## 📊 Post-Deployment Checklist

- [ ] Database tables created
- [ ] Environment variables set
- [ ] Stripe webhook configured
- [ ] Test registration works
- [ ] Test subscription flow works
- [ ] Test video generation works
- [ ] Test credits deduction works
- [ ] Test upgrade/downgrade works
- [ ] Check Stripe Dashboard for subscriptions
- [ ] Monitor application logs
- [ ] Set up error tracking (optional)

## 🐛 Troubleshooting

### "Failed to create account"
- Check Supabase connection
- Verify `users` table exists
- Check console for errors

### "No active subscription found"
- Verify webhook is running
- Check Stripe Dashboard → Events
- Check `subscriptions` table in Supabase

### Credits not deducting
- Check `videos_used` in database
- Verify user_id in jobs table
- Check API logs

### Webhook not receiving events
- Verify webhook URL is correct
- Check webhook secret matches
- Use Stripe CLI for local testing
- Check Stripe Dashboard → Webhooks → Events

### Products not creating
- Check Stripe API key has write permissions
- Verify `STRIPE_SECRET_KEY` is set
- Check API logs for errors

## 📚 Documentation Files

- **`README_STRIPE.md`** - Complete Stripe integration guide
- **`STRIPE_SETUP.md`** - Step-by-step Stripe configuration
- **`STRIPE_ENV_VARS.md`** - Environment variables details
- **`AUTHENTICATION_SETUP.md`** - Auth & credits system
- **`INTEGRATION_SUMMARY.md`** - Stripe integration summary

## 💡 Tips

1. **Always test with Stripe test mode first**
2. **Use Stripe CLI for local webhook testing**
3. **Monitor Stripe Dashboard for issues**
4. **Check Supabase logs for database errors**
5. **Keep test and live keys separate**
6. **Never commit `.env.local` to Git**

## 🆘 Support

If you encounter issues:

1. Check this guide first
2. Review the troubleshooting section
3. Check Stripe Dashboard for errors
4. Check Supabase logs
5. Review browser console errors
6. Check API response in Network tab

---

**Ready to launch!** 🚀

Follow this guide step-by-step and you'll have HookScale running in no time.
