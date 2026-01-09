import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get('customer_id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get subscription for customer
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('customer_id', customerId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      throw error;
    }

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        message: 'No active subscription found',
      });
    }

    // Check if they've exceeded their limit
    const hasCreditsRemaining = subscription.videos_used < subscription.video_limit;

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        planId: subscription.plan_id,
        planName: subscription.plan_name,
        videoLimit: subscription.video_limit,
        videosUsed: subscription.videos_used,
        videosRemaining: subscription.video_limit - subscription.videos_used,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
      },
      hasCreditsRemaining,
    });
  } catch (error) {
    console.error('Check subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
