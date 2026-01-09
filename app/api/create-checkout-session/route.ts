import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PLANS, type PlanId, getOrCreatePrice } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    console.log('[Checkout] Starting checkout session creation');
    
    const body = await request.json();
    const { planId, userId, isUpgrade } = body;

    console.log('[Checkout] Request data:', { planId, userId, isUpgrade });

    if (!planId || !(planId in STRIPE_PLANS)) {
      console.error('[Checkout] Invalid plan:', planId);
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    const plan = STRIPE_PLANS[planId as PlanId];
    console.log('[Checkout] Plan selected:', plan);

    // Verify Stripe key is set
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Checkout] STRIPE_SECRET_KEY not set!');
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    // Get or create Stripe price dynamically
    console.log('[Checkout] Getting/creating price...');
    const priceId = await getOrCreatePrice(planId as PlanId);
    console.log('[Checkout] Price ID:', priceId);

    // Get the origin for the success/cancel URLs
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        planId,
        planName: plan.name,
        videoLimit: plan.videos.toString(),
        userId: userId || '',
        isUpgrade: isUpgrade ? 'true' : 'false',
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_creation: 'always',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
