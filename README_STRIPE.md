# HookScale - Stripe Integration Guide

Complete guide for setting up Stripe billing in HookScale.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Testing](#testing)
5. [Going Live](#going-live)
6. [Troubleshooting](#troubleshooting)

## 🎯 Overview

HookScale uses Stripe for subscription billing with three plans:

| Plan     | Price  | Videos/Month | Price/Video |
|----------|--------|--------------|-------------|
| Starter  | $29    | 50           | $0.58       |
| Premium  | $59    | 200          | $0.30       |
| Scale    | $199   | 2,000        | $0.10       |

### Features

- ✅ Dynamic checkout with Stripe
- ✅ Subscription management
- ✅ Usage tracking
- ✅ Automatic billing
- ✅ Webhook integration
- ✅ Multi-card support (US account)

## 🚀 Quick Start

### 1. Install Dependencies

Already included in `package.json`:
```bash
npm install stripe @stripe/stripe-js
```

### 2. Set Up Stripe Account

1. Create a [Stripe account](https://dashboard.stripe.com/register) (US-based)
2. Complete identity verification
3. Configure payment methods to accept any card type

### 3. Create Products

In [Stripe Dashboard → Products](https://dashboard.stripe.com/products):

**Starter Plan:**
- Name: `HookScale Starter`
- Price: $29.00 USD/month
- Copy Price ID → `STRIPE_PRICE_ID_STARTER`

**Premium Plan:**
- Name: `HookScale Premium`
- Price: $59.00 USD/month
- Copy Price ID → `STRIPE_PRICE_ID_PREMIUM`

**Scale Plan:**
- Name: `HookScale Scale`
- Price: $199.00 USD/month
- Copy Price ID → `STRIPE_PRICE_ID_SCALE`

### 4. Get API Keys

[Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys):

- Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Secret key → `STRIPE_SECRET_KEY`

### 5. Set Up Webhook

[Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks):

1. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
2. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
3. Copy signing secret → `STRIPE_WEBHOOK_SECRET`

### 6. Configure Environment

Create `.env.local`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Price IDs
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PREMIUM=price_...
STRIPE_PRICE_ID_SCALE=price_...

# Webhook
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7. Update Database

Run in Supabase SQL Editor:

```sql
-- Copy contents from UPDATE_DB_SUBSCRIPTIONS.sql
```

Or use psql:

```bash
psql $DATABASE_URL < UPDATE_DB_SUBSCRIPTIONS.sql
```

## 🔧 Detailed Setup

### Database Schema

The integration adds a `subscriptions` table:

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  customer_id TEXT UNIQUE,      -- Stripe customer ID
  subscription_id TEXT UNIQUE,   -- Stripe subscription ID
  plan_id TEXT,                  -- starter/premium/scale
  plan_name TEXT,                -- Display name
  video_limit INTEGER,           -- Monthly video limit
  videos_used INTEGER,           -- Current usage
  status TEXT,                   -- active/past_due/canceled
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### API Routes

**Checkout Session:** `/api/create-checkout-session`
- Creates Stripe checkout session
- Redirects to Stripe payment page
- Handles success/cancel URLs

**Webhook Handler:** `/api/stripe-webhook`
- Receives Stripe events
- Updates subscription status
- Tracks usage and billing

**Check Subscription:** `/api/check-subscription`
- Validates active subscription
- Returns usage information
- Checks credit availability

### Pages

**Pricing:** `/pricing`
- Displays all plans
- FAQ section
- Checkout integration

**Success:** `/pricing/success`
- Post-checkout confirmation
- Account activation status

## 🧪 Testing

### Local Testing with Stripe CLI

1. Install Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
```

2. Login and forward webhooks:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

3. Copy the webhook secret from CLI output

4. Run your app:

```bash
npm run dev
```

### Test Cards

Use these in checkout:

| Card Number         | Scenario                    |
|--------------------|-----------------------------|
| 4242 4242 4242 4242 | Success                     |
| 4000 0000 0000 0002 | Card declined               |
| 4000 0025 0000 3155 | Requires authentication     |
| 4000 0000 0000 9995 | Insufficient funds          |

Any future expiry, any CVC, any postal code.

### Testing Flow

1. Visit `http://localhost:3000/pricing`
2. Click on any plan
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify webhook in Stripe CLI output
6. Check database:

```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;
```

## 🌐 Going Live

### Pre-Launch Checklist

- [ ] Complete Stripe account verification
- [ ] Activate live mode in Stripe
- [ ] Create production products/prices
- [ ] Update webhook endpoint to production URL
- [ ] Configure live API keys
- [ ] Test with real payment (small amount)
- [ ] Set up monitoring/alerts
- [ ] Configure customer emails
- [ ] Review Stripe settings

### Switch to Production

1. **Get Live Keys:**
   - Toggle to "Live mode" in Stripe
   - Copy live publishable key
   - Copy live secret key

2. **Update Environment Variables:**

```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID_STARTER=price_live_...
STRIPE_PRICE_ID_PREMIUM=price_live_...
STRIPE_PRICE_ID_SCALE=price_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

3. **Update Webhook:**
   - Create new webhook for production
   - URL: `https://yourdomain.com/api/stripe-webhook`
   - Copy new signing secret

4. **Deploy:**
   - Push to production
   - Verify webhook is receiving events
   - Test with real card (refund after)

### Card Type Configuration

In Stripe Dashboard → Settings → Payment methods:

Enable all card types:
- ✅ Visa
- ✅ Mastercard
- ✅ American Express
- ✅ Discover
- ✅ Diners Club
- ✅ JCB
- ✅ UnionPay

## 🔍 Troubleshooting

### Webhook Not Working

**Symptoms:** Subscriptions not saving, events not processing

**Solutions:**
1. Check webhook URL is publicly accessible
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Review webhook logs in Stripe Dashboard
4. Check server logs for errors
5. Use Stripe CLI for local testing

### Checkout Fails

**Symptoms:** Error when clicking plan button

**Solutions:**
1. Verify all price IDs are set correctly
2. Check API keys are valid
3. Ensure products are active in Stripe
4. Review browser console for errors
5. Check network tab for API responses

### Database Errors

**Symptoms:** Subscription not appearing in database

**Solutions:**
1. Verify `subscriptions` table exists
2. Check Supabase connection
3. Verify service role key is set
4. Review database logs
5. Check RLS policies

### Usage Not Tracking

**Symptoms:** Videos created but usage not incrementing

**Solutions:**
1. Check `customer_id` is set in jobs
2. Verify webhook handles `invoice.payment_succeeded`
3. Review subscription update logic
4. Check database triggers

## 📊 Monitoring

### Key Metrics to Track

1. **Subscription Metrics:**
   ```sql
   SELECT 
     plan_id,
     COUNT(*) as subscriptions,
     SUM(videos_used) as total_videos
   FROM subscriptions
   WHERE status = 'active'
   GROUP BY plan_id;
   ```

2. **Usage Patterns:**
   ```sql
   SELECT 
     plan_id,
     AVG(videos_used) as avg_usage,
     MAX(videos_used) as max_usage
   FROM subscriptions
   WHERE status = 'active'
   GROUP BY plan_id;
   ```

3. **Revenue:**
   - Check Stripe Dashboard → Revenue
   - Set up revenue recognition
   - Monitor MRR (Monthly Recurring Revenue)

### Stripe Dashboard

Monitor:
- Successful payments
- Failed payments
- Subscription churn
- Webhook delivery
- Dispute rate

## 🔒 Security

### Best Practices

1. **Never expose secret keys**
   - Use environment variables
   - Don't commit to Git
   - Rotate if compromised

2. **Validate webhooks**
   - Always verify signatures
   - Already implemented in code

3. **Use HTTPS**
   - Required for production
   - Stripe enforces this

4. **Monitor for fraud**
   - Review Stripe Radar
   - Set up alerts
   - Monitor unusual patterns

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Security Guidelines](https://stripe.com/docs/security)

## 💡 Tips

1. **Start with Test Mode:** Always test thoroughly before going live
2. **Use Webhooks:** Don't rely on client-side confirmations
3. **Handle Failures:** Implement retry logic for failed payments
4. **Email Receipts:** Stripe sends these automatically
5. **Customer Portal:** Consider adding Stripe Customer Portal for self-service

## 🆘 Support

If you need help:

1. Check [Stripe Documentation](https://stripe.com/docs)
2. Review [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed steps
3. Check [STRIPE_ENV_VARS.md](./STRIPE_ENV_VARS.md) for configuration
4. Contact [Stripe Support](https://support.stripe.com/)
