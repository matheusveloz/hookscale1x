import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createSubscription(session: any, userId?: string) {
  const { error } = await supabase.from('subscriptions').insert({
    customer_id: session.customer as string,
    subscription_id: session.subscription as string,
    user_id: userId || null,
    plan_id: session.metadata?.planId,
    plan_name: session.metadata?.planName,
    video_limit: parseInt(session.metadata?.videoLimit || '0'),
    status: 'active',
    current_period_start: new Date(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    videos_used: 0,
  });

  if (error) {
    console.error('Error creating subscription:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const isUpgrade = session.metadata?.isUpgrade === 'true';
        const userId = session.metadata?.userId;
        
        // Check if user already has a subscription
        if (userId && isUpgrade) {
          // Get current subscription
          const { data: currentSub } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

          if (currentSub) {
            // Cancel old subscription in Stripe
            try {
              await stripe.subscriptions.cancel(currentSub.subscription_id);
            } catch (e) {
              console.error('Error canceling old subscription:', e);
            }

            // Calculate new credits (upgrade adds credits)
            const newVideoLimit = parseInt(session.metadata?.videoLimit || '0');
            const creditsToAdd = newVideoLimit;
            const newVideosUsed = Math.max(0, currentSub.videos_used - creditsToAdd);

            // Update subscription with new plan and ADD credits
            await supabase
              .from('subscriptions')
              .update({
                subscription_id: session.subscription as string,
                customer_id: session.customer as string,
                plan_id: session.metadata?.planId,
                plan_name: session.metadata?.planName,
                video_limit: newVideoLimit,
                videos_used: newVideosUsed,
                status: 'active',
                current_period_start: new Date(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              })
              .eq('id', currentSub.id);
          } else {
            // Create new subscription
            await createSubscription(session, userId);
          }
        } else {
          // New subscription
          await createSubscription(session, userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        
        // Update subscription in database
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: subscription.current_period_start 
              ? new Date(subscription.current_period_start * 1000)
              : new Date(),
            current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          })
          .eq('subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        // Mark subscription as canceled
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date(),
          })
          .eq('subscription_id', subscription.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        
        // Reset monthly usage on successful payment
        if (invoice.billing_reason === 'subscription_cycle') {
          await supabase
            .from('subscriptions')
            .update({
              videos_used: 0,
              current_period_start: new Date(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            })
            .eq('subscription_id', invoice.subscription);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        
        // Mark subscription as past_due
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
          })
          .eq('subscription_id', invoice.subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
