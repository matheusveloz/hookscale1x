-- Add subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  subscription_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  video_limit INTEGER NOT NULL DEFAULT 50,
  videos_used INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_subscription_id ON subscriptions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Add customer_id column to jobs table to track usage
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS customer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);

-- Update schema.sql with subscriptions table
COMMENT ON TABLE subscriptions IS 'Stores Stripe subscription information for billing and usage tracking';
COMMENT ON COLUMN subscriptions.customer_id IS 'Stripe customer ID';
COMMENT ON COLUMN subscriptions.subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN subscriptions.plan_id IS 'Plan identifier (starter, premium, scale)';
COMMENT ON COLUMN subscriptions.video_limit IS 'Maximum number of videos allowed per billing period';
COMMENT ON COLUMN subscriptions.videos_used IS 'Number of videos used in current billing period';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status (active, past_due, canceled, etc.)';
