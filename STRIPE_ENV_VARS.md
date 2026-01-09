# Stripe Environment Variables

Add these environment variables to your `.env.local` file:

## Required Variables

```bash
# Stripe API Keys
# Get from: https://dashboard.stripe.com/test/apikeys (test mode)
# or https://dashboard.stripe.com/apikeys (live mode)
STRIPE_SECRET_KEY=sk_test_51...  # or sk_live_51... for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...  # or pk_live_51... for production

# Stripe Price IDs
# Create products in Stripe Dashboard and copy the price IDs
STRIPE_PRICE_ID_STARTER=price_1...  # $29/month - 50 videos
STRIPE_PRICE_ID_PREMIUM=price_2...  # $59/month - 200 videos
STRIPE_PRICE_ID_SCALE=price_3...  # $199/month - 2000 videos

# Stripe Webhook Secret
# Get from: https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL (for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Update to your production URL
```

## How to Get These Values

### 1. Stripe API Keys

**Test Mode (Development):**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy the **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Click "Reveal test key" and copy **Secret key** → `STRIPE_SECRET_KEY`

**Live Mode (Production):**
1. Toggle to "Live mode" in Stripe Dashboard
2. Go to https://dashboard.stripe.com/apikeys
3. Copy the **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Click "Reveal live key" and copy **Secret key** → `STRIPE_SECRET_KEY`

### 2. Create Products and Get Price IDs

1. Go to https://dashboard.stripe.com/products
2. Click "Add product"

**For each plan (Starter, Premium, Scale):**

- Name: `HookScale [Plan Name]`
- Pricing model: Standard pricing
- Price: Enter the amount ($29, $59, or $199)
- Billing period: Monthly
- Currency: USD
- Click "Save product"
- Copy the **Price ID** (e.g., `price_1ABC...`)

**Plan Details:**
- **Starter**: $29/month, 50 videos → `STRIPE_PRICE_ID_STARTER`
- **Premium**: $59/month, 200 videos → `STRIPE_PRICE_ID_PREMIUM`
- **Scale**: $199/month, 2000 videos → `STRIPE_PRICE_ID_SCALE`

### 3. Webhook Secret

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://yourdomain.com/api/stripe-webhook`
   - For local testing: Use ngrok or similar to expose localhost
4. **Events to listen to**:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 4. App URL

- **Development**: `http://localhost:3000`
- **Production**: Your actual domain (e.g., `https://hookscale.ai`)

## Testing Locally

To test Stripe webhooks locally:

1. Install Stripe CLI:
   ```bash
   # Windows (PowerShell)
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to localhost:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

4. Copy the webhook signing secret from the CLI output:
   ```
   whsec_... → STRIPE_WEBHOOK_SECRET
   ```

5. In another terminal, run your Next.js app:
   ```bash
   npm run dev
   ```

## Test Card Numbers

Use these test cards in Stripe Checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`
- **Insufficient funds**: `4000 0000 0000 9995`

For any test card:
- Use any future expiry date
- Use any 3-digit CVC
- Use any postal code

## Security Notes

⚠️ **NEVER commit these values to Git!**

- Add `.env.local` to `.gitignore`
- Use environment variables in production (Vercel, etc.)
- Rotate keys if they're ever exposed
- Use test keys for development
- Use live keys only in production

## Vercel Deployment

If deploying to Vercel:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all the variables above
4. Redeploy your application

## Validation

To verify your setup:

1. Check that all variables are set:
   ```bash
   # In your terminal
   node -e "require('dotenv').config({path:'.env.local'}); console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✓ Set' : '✗ Missing')"
   ```

2. Test the checkout flow:
   - Visit `/pricing`
   - Click any plan
   - Complete checkout with test card
   - Check Stripe Dashboard for the session
   - Verify webhook received

3. Check database:
   ```sql
   SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
   ```

## Troubleshooting

### "No such price" error
- Verify price IDs are correct in `.env.local`
- Make sure you're using the right mode (test vs live)

### Webhook signature verification failed
- Check `STRIPE_WEBHOOK_SECRET` matches the endpoint
- Use Stripe CLI for local testing
- Verify endpoint URL is correct

### Checkout session not creating
- Check all environment variables are set
- Verify Stripe secret key has write permissions
- Review browser console for errors
