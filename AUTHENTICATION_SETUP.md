# HookScale - Authentication & Credits System Setup

Complete authentication, subscription, and credits system implementation.

## 🎯 Overview

The system now includes:
- ✅ Landing page
- ✅ Login/Register (email + password)
- ✅ Protected dashboard (requires active subscription)
- ✅ Credits system (videos = credits)
- ✅ Settings page with subscription info
- ✅ Upgrade/Downgrade handling
- ✅ Dynamic Stripe product creation
- ✅ Logout functionality

## 📁 New Files Created

### Pages
1. **`app/page.tsx`** - Landing page (public)
2. **`app/(auth)/login/page.tsx`** - Login/Register page
3. **`app/dashboard/page.tsx`** - Main dashboard (protected)
4. **`app/settings/page.tsx`** - Settings & subscription management
5. **`app/landing/page.tsx`** - Alternative landing page

### API Routes
1. **`app/api/auth/login/route.ts`** - Login endpoint
2. **`app/api/auth/register/route.ts`** - Registration endpoint
3. **`app/api/check-subscription/route.ts`** - Check user subscription status

### Database
1. **`UPDATE_DB_USERS.sql`** - Users table and relationships

## 🔄 User Flow

### 1. New User Registration
```
Landing Page → Click "Sign In" → Click "Create Account"
→ Enter email + password → Register
→ Redirect to /pricing → Choose plan → Stripe checkout
→ Success → Redirect to /dashboard
```

### 2. Existing User Login
```
Landing Page → Click "Sign In" → Enter credentials
→ Login → Check subscription:
   - Has active plan → /dashboard
   - No active plan → /pricing
```

### 3. Creating Videos (Dashboard)
```
Dashboard → Upload videos → Generate
→ Check credits (videos_remaining)
→ If enough credits → Create job & deduct credits
→ If not enough → Show error
```

### 4. Managing Subscription
```
Dashboard → Settings icon → View subscription details
→ Click "View All Plans" → /pricing
→ See current plan (disabled button)
→ Choose upgrade/downgrade → Stripe checkout
```

## 💳 Credits System

### How Credits Work

1. **Videos = Credits**: Each video generated = 1 credit minimum
2. **Duration blocks**: Rounded up to 5-minute blocks
   - 0-5 min = 1 credit
   - 5-10 min = 2 credits
   - 10-15 min = 3 credits, etc.

### Plans & Credits

| Plan     | Price  | Credits/Month | Reset       |
|----------|--------|---------------|-------------|
| Starter  | $29    | 50            | Monthly     |
| Premium  | $59    | 200           | Monthly     |
| Scale    | $199   | 2000          | Monthly     |

### Credit Tracking

**Location**: `subscriptions` table
```sql
video_limit: INTEGER     -- Total credits per month
videos_used: INTEGER     -- Credits used this period
```

**Display**: Badge in header showing remaining credits

## 🔄 Upgrade/Downgrade Logic

### Upgrade (e.g., Starter → Premium)
1. User clicks "Upgrade" on pricing page
2. Stripe checkout creates new subscription
3. Webhook cancels old subscription
4. **Credits ADD**: New plan credits added to account
5. Immediate access to new limits

**Example**:
- Current: Starter (50 credits, 30 used, 20 remaining)
- Upgrade to: Premium (200 credits)
- Result: 200 credits added → 220 total available

### Downgrade (e.g., Premium → Starter)
1. User clicks "Downgrade" on pricing page
2. Stripe checkout creates new subscription
3. Webhook cancels old subscription
4. **Credits RESET**: All credits reset to new plan limit
5. Changes take effect immediately

**Example**:
- Current: Premium (200 credits, 50 used, 150 remaining)
- Downgrade to: Starter (50 credits)
- Result: Reset to 50 credits, 0 used

### Same Plan
- Button disabled
- Shows "Current Plan"
- Cannot subscribe to same plan

## 🗄️ Database Schema Updates

### New Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- bcrypt hashed
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Updated Subscriptions Table
```sql
ALTER TABLE subscriptions 
  ADD COLUMN user_id UUID REFERENCES users(id);
```

### Updated Jobs Table
```sql
ALTER TABLE jobs 
  ADD COLUMN user_id UUID REFERENCES users(id);
```

## 🔐 Authentication

### Storage
- Client-side: `localStorage.setItem('user', JSON.stringify(userData))`
- Contains: `{ id, email }`

### Password Security
- Hashed with bcrypt (10 rounds)
- Never stored or transmitted in plain text

### Session Management
- Check on every protected page load
- Redirect to `/login` if no session
- Redirect to `/pricing` if no active subscription

## 🎨 UI/UX Features

### Header
```
- Logo (links to appropriate page based on auth status)
- Credits badge (visible when logged in)
- Settings icon (links to /settings)
- Logout button
- Theme toggle
```

### Settings Page
Shows:
- Email address
- Current plan badge
- Credits: remaining/total
- Credits used this period
- Billing cycle end date
- "Change Plan" button → /pricing

### Pricing Page
- Detects current user & subscription
- Disables current plan button
- Shows "Upgrade"/"Downgrade"/"Current Plan" based on context
- Prevents subscribing to same plan

## 🔧 Stripe Integration

### Dynamic Product Creation

Products are now created **automatically in code** (no need for manual setup):

```typescript
// lib/stripe.ts
export async function getOrCreatePrice(planId: PlanId): Promise<string> {
  // 1. Search for existing product
  // 2. Create if doesn't exist
  // 3. Search for price
  // 4. Create price if doesn't exist
  // 5. Return price ID
}
```

**No environment variables needed** for price IDs! Only `STRIPE_SECRET_KEY` required.

### Checkout Flow
1. User clicks plan button
2. API calls `getOrCreatePrice(planId)`
3. Creates Stripe checkout session
4. Redirects to Stripe
5. User completes payment
6. Webhook updates database
7. Redirect to success page

## 📋 Setup Checklist

### 1. Install Dependencies
```bash
npm install bcryptjs @types/bcryptjs
```

### 2. Update Database
```sql
-- Run in Supabase SQL Editor
-- Copy contents from UPDATE_DB_USERS.sql
```

### 3. Environment Variables
Only need:
```bash
STRIPE_SECRET_KEY=sk_test_...  # or sk_live_...
```

**No price IDs needed!** Products created automatically.

### 4. Test Flow

**Registration:**
```bash
1. Visit http://localhost:3000
2. Click "Sign In"
3. Click "Create Account"
4. Email: test@example.com, Password: test123
5. Should redirect to /pricing
```

**Subscription:**
```bash
1. Choose "Premium" plan
2. Use test card: 4242 4242 4242 4242
3. Complete checkout
4. Should redirect to /pricing/success
5. Then click "Start Creating Videos" → /dashboard
```

**Credits:**
```bash
1. In dashboard, upload 3 hooks + 2 bodies = 6 videos
2. Check header: should show "200 credits" (Premium plan)
3. Click "Generate"
4. Check credits: should now show "194 credits" (6 used)
```

## 🚀 Deployment

### Environment Variables (Production)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your-blob-token

# Stripe (ONLY THIS - products auto-created)
STRIPE_SECRET_KEY=sk_live_...

# Webhook (for production)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Deployment Steps

1. **Push to Git**
```bash
git add .
git commit -m "Add authentication and credits system"
git push
```

2. **Deploy to Vercel**
```bash
vercel --prod
```

3. **Update Stripe Webhook**
- URL: `https://yourdomain.com/api/stripe-webhook`
- Events: Same as before

4. **Test Production**
- Create test account
- Subscribe to Starter plan
- Generate videos
- Check credits deduction

## 🔍 Troubleshooting

### "No active subscription found"
- Check `subscriptions` table in Supabase
- Verify `user_id` matches logged-in user
- Check `status = 'active'`

### Credits not deducting
- Check webhook received `checkout.session.completed`
- Verify `videos_used` column updating
- Check API logs for errors

### Upgrade not working
- Verify webhook canceling old subscription
- Check `getOrCreatePrice()` creating products
- Review Stripe Dashboard for subscriptions

### User redirected to pricing after login
- Check subscription status in database
- Verify `hasActiveSubscription` logic in login API
- Check subscription expiry date

## 📊 Monitoring

### Key Metrics to Track

```sql
-- Active users
SELECT COUNT(*) FROM users;

-- Active subscriptions by plan
SELECT plan_id, COUNT(*) FROM subscriptions 
WHERE status = 'active' 
GROUP BY plan_id;

-- Average credits usage
SELECT plan_id, AVG(videos_used) as avg_usage 
FROM subscriptions 
WHERE status = 'active' 
GROUP BY plan_id;

-- Total revenue (approximate)
SELECT 
  SUM(CASE 
    WHEN plan_id = 'starter' THEN 29
    WHEN plan_id = 'premium' THEN 59
    WHEN plan_id = 'scale' THEN 199
  END) as monthly_revenue
FROM subscriptions 
WHERE status = 'active';
```

## 🎯 Next Steps

1. ✅ All features implemented
2. 🔄 Test thoroughly in development
3. 🚀 Deploy to production
4. 📊 Monitor usage and credits
5. 💰 Track revenue in Stripe Dashboard

## 💡 Tips

- **Credits display**: Always visible in header when logged in
- **Logout**: Available in header and settings
- **Settings**: Quick access to subscription info
- **Upgrades**: Instant access, credits added
- **Downgrades**: Instant, credits reset
- **Auto-renewal**: Handled by Stripe automatically
- **Credit reset**: Happens via webhook on successful payment

---

**Status**: ✅ Complete - Ready for Testing & Deployment
