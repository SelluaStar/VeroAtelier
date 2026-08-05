# Stripe Payment Integration - Complete ✓

## What's Been Set Up

### 1. Database Schema ✓
- **Orders table** updated with Stripe columns:
  - `stripe_session_id` (unique identifier for Stripe checkout session)
  - `stripe_payment_intent` (Stripe payment intent ID)
  - `customer_email`, `customer_name`, `customer_phone`
  - `shipping_address` (JSONB for full address)
  - `currency` (defaults to 'usd')
  - `items` (JSONB array of order items)

- **Indexes created** for optimal query performance:
  - `idx_orders_stripe_session` on stripe_session_id
  - `idx_orders_user_id` on user_id
  - `idx_orders_status` on status
  - `idx_orders_created_at` on created_at

- **Database function**:
  - `decrement_stock(product_id, quantity)` - automatically reduces product stock when orders complete

### 2. Supabase Edge Functions ✓

**create-checkout-session** (JWT verification: ON)
- URL: `https://lplurvtmqctrdwhbxzwg.supabase.co/functions/v1/create-checkout-session`
- Creates Stripe Embedded Checkout sessions
- Accepts cart items and customer email
- Returns client secret for frontend

**stripe-webhook** (JWT verification: OFF)
- URL: `https://lplurvtmqctrdwhbxzwg.supabase.co/functions/v1/stripe-webhook`
- Handles `checkout.session.completed` events
- Creates orders in database
- Decrements product stock automatically
- Validates Stripe webhook signatures for security

### 3. Environment Variables ✓

**Supabase Secrets (set via CLI):**
- `STRIPE_SECRET_KEY`: set via `supabase secrets set STRIPE_SECRET_KEY=...` (see Stripe Dashboard)
- `STRIPE_WEBHOOK_SECRET`: set via `supabase secrets set STRIPE_WEBHOOK_SECRET=...` (see Stripe Dashboard webhook config)

**Frontend (.env):**
- `VITE_STRIPE_PUBLISHABLE_KEY`: pk_test_51U0hukK4zwNijCNvFW7...

### 4. Frontend Pages ✓
- **Checkout.jsx**: Embedded Stripe Checkout page
- **CheckoutSuccess.jsx**: Order confirmation page
- **Cart.jsx**: Navigate to checkout button configured
- **App.jsx**: Routes set up, header/footer hidden on checkout pages

## Next Steps: Configure Stripe Webhook

### 1. Add Webhook Endpoint in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://lplurvtmqctrdwhbxzwg.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - ✓ `checkout.session.completed`
   - ✓ `payment_intent.payment_failed` (optional)
5. Click **"Add endpoint"**

**Note:** The webhook secret is already configured in Supabase (see `STRIPE_WEBHOOK_SECRET` in Supabase secrets).

### 2. Test the Integration

#### Test Checkout Flow:
1. Add items to cart on your site
2. Navigate to `/checkout`
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify order created in Supabase orders table
6. Verify product stock was decremented

#### Test Cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

### 3. Monitor Webhook Events

Check webhook delivery in Stripe Dashboard:
- Go to: https://dashboard.stripe.com/test/webhooks
- Click on your webhook endpoint
- View recent deliveries and responses

Check Edge Function logs in Supabase:
```bash
npx supabase functions logs stripe-webhook --project-ref lplurvtmqctrdwhbxzwg
```

## Important Notes

### Product Metadata
For the webhook to properly track inventory, each Stripe product should have metadata with the `product_id` from your Supabase products table. When creating checkout sessions, the create-checkout-session function should set this metadata.

### Guest Checkout
The integration supports guest checkout - orders will have `user_id` set to null for guests. The customer email is always captured.

### Shipping
Shipping address collection is enabled for: US, CA, GB, AU. Modify in `create-checkout-session/index.ts` if you need different countries.

### Security
- Webhook endpoint validates Stripe signatures
- JWT verification is OFF for webhooks (Stripe doesn't use JWT)
- JWT verification is ON for create-checkout-session (requires authenticated users)
- Service role key used for database operations in webhook (bypasses RLS)

## Deployment Status

✅ Database schema updated
✅ Edge Functions deployed
✅ Secrets configured
✅ Frontend code ready
✅ RLS policies configured

**Ready to test! 🚀**
