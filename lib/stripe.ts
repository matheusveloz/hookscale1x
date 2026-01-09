import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

export const STRIPE_PLANS = {
  starter: {
    name: 'HookScale Starter',
    price: 2900, // $29.00 in cents
    videos: 50,
  },
  premium: {
    name: 'HookScale Premium',
    price: 5900, // $59.00 in cents
    videos: 200,
  },
  scale: {
    name: 'HookScale Scale',
    price: 19900, // $199.00 in cents
    videos: 2000,
  },
} as const;

export type PlanId = keyof typeof STRIPE_PLANS;

// Function to get or create a Stripe price for a plan
export async function getOrCreatePrice(planId: PlanId): Promise<string> {
  const plan = STRIPE_PLANS[planId];
  
  try {
    console.log(`[Stripe] Getting/creating price for plan: ${planId}`);
    
    // Search for existing product by name
    const products = await stripe.products.search({
      query: `name:'${plan.name}'`,
    });

    let productId: string;

    if (products.data.length > 0) {
      // Product exists, use it
      productId = products.data[0].id;
      console.log(`[Stripe] Found existing product: ${productId}`);
    } else {
      // Create new product
      console.log(`[Stripe] Creating new product: ${plan.name}`);
      const product = await stripe.products.create({
        name: plan.name,
        description: `${plan.videos} unique creatives per month`,
      });
      productId = product.id;
      console.log(`[Stripe] Created product: ${productId}`);
    }

    // Search for existing price for this product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    if (prices.data.length > 0) {
      // Return existing price
      console.log(`[Stripe] Found existing price: ${prices.data[0].id}`);
      return prices.data[0].id;
    }

    // Create new price
    console.log(`[Stripe] Creating new price: $${plan.price / 100}`);
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: plan.price,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
    });

    console.log(`[Stripe] Created price: ${price.id}`);
    return price.id;
  } catch (error: any) {
    console.error('[Stripe] Error creating/getting price:', {
      planId,
      error: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code,
    });
    throw new Error(`Failed to setup payment: ${error.message}`);
  }
}
