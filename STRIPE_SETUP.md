# Stripe Integration Setup

This guide will help you set up Stripe integration for HookScale billing.

## Prerequisites

- Stripe account (US-based)
- Access to Stripe Dashboard
- Supabase database configured

## Step 1: Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create a US-based account
3. Complete account verification

## Step 2: Create Products and Prices

### In Stripe Dashboard:

1. Go to **Products** → **Add Product**

2. Create three products:

#### Starter Plan
- **Name**: HookScale Starter
- **Description**: 50 unique creatives per month
- **Pricing**: 
  - Price: $29.00 USD
  - Billing: Monthly recurring
  - Currency: USD
- **Payment method**: Card (any card type)
- Copy the **Price ID** (starts with `price_`)

#### Premium Plan
- **Name**: HookScale Premium
- **Description**: 200 unique creatives per month
- **Pricing**: 
  - Price: $59.00 USD
  - Billing: Monthly recurring
  - Currency: USD
- **Payment method**: Card (any card type)
- Copy the **Price ID** (starts with `price_`)

#### Scale Plan
- **Name**: HookScale Scale
- **Description**: 2,000 unique creatives per month
- **Pricing**: 
  - Price: $199.00 USD
  - Billing: Monthly recurring
  - Currency: USD
- **Payment method**: Card (any card type)
- Copy the **Price ID** (starts with `price_`)

## Step 3: Get API Keys

### Test Mode (for development):

1. Go to **Developers** → **API keys**
2. Copy **Publishable key** (starts with `pk_test_`)
3. Copy **Secret key** (starts with `sk_test_`)

### Live Mode (for production):

1. Toggle to **Live mode** in Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Copy **Publishable key** (starts with `pk_live_`)
4. Copy **Secret key** (starts with `sk_live_`)

## Step 4: Set Up Webhook

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe-webhook`
4. **Events to listen to**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

## Step 5: Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_... # or sk_live_... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_... for production

# Stripe Price IDs
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PREMIUM=price_...
STRIPE_PRICE_ID_SCALE=price_...

# Stripe Webhook
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL (for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000 # or your production URL
```

## Step 6: Update Database

Run the subscription schema update:

```bash
# Using Supabase SQL Editor
# Copy contents from UPDATE_DB_SUBSCRIPTIONS.sql and run in Supabase SQL Editor
```

Or if you have direct database access:

```bash
psql $DATABASE_URL < UPDATE_DB_SUBSCRIPTIONS.sql
```

## Step 7: Test Integration

### Test Mode:

1. Use test mode API keys
2. Go to `/pricing` page
3. Click on any plan
4. Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any postal code
5. Complete checkout
6. Verify webhook received in Stripe Dashboard → Webhooks
7. Check subscription in Supabase database

### Test Card Numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

## Step 8: Go Live

1. Complete Stripe account verification
2. Switch to **Live mode** in Stripe Dashboard
3. Update environment variables with live keys
4. Update webhook endpoint URL to production
5. Test with real card (small amount)
6. Monitor webhooks and subscriptions

## Card Verification Settings

To accept any card type:

1. Go to **Settings** → **Payment methods**
2. Under **Card payments**, enable:
   - Visa
   - Mastercard
   - American Express
   - Discover
   - Diners Club
   - JCB
   - Union Pay
3. Save changes

## Security Notes

- Never commit API keys to Git
- Use environment variables for all sensitive data
- Enable Stripe webhook signature verification (already implemented)
- Use HTTPS in production
- Regularly rotate API keys
- Monitor Stripe Dashboard for suspicious activity

## Subscription Management

### Check Usage:

```sql
SELECT * FROM subscriptions WHERE customer_id = 'cus_...';
```

### Reset Monthly Usage:

This is handled automatically by the webhook when `invoice.payment_succeeded` event fires with `billing_reason: 'subscription_cycle'`.

### Cancel Subscription:

Customers can cancel through Stripe Customer Portal, or you can cancel via Stripe Dashboard.

## Troubleshooting

### Webhook Not Receiving Events:

1. Check endpoint URL is publicly accessible
2. Verify webhook secret is correct
3. Check Stripe Dashboard → Webhooks → Recent deliveries
4. Review server logs for errors

### Checkout Session Fails:

1. Verify price IDs are correct
2. Check API keys are valid
3. Ensure products are active in Stripe
4. Review browser console for errors

### Database Errors:

1. Verify subscriptions table exists
2. Check Supabase service role key is set
3. Review RLS policies if enabled
4. Check database logs in Supabase

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Test Cards Reference](https://stripe.com/docs/testing)
