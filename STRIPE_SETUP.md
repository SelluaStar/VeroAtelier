# Stripe Integration Setup Guide

## ✅ What's Been Created

1. **Supabase Edge Functions**
   - `create-checkout-session` - Creates Stripe Checkout sessions
   - `stripe-webhook` - Handles payment confirmations and creates orders

2. **React Pages**
   - `/checkout` - Embedded Stripe Checkout page
   - `/checkout/success` - Order confirmation page

3. **Database Schema**
   - Orders table with RLS policies
   - Stock decrement function

---

## 🚀 Setup Instructions

### Step 1: Run Database Setup

Run this SQL in your Supabase SQL Editor:

```bash
# Copy the SQL from database-setup.sql and run it in Supabase Dashboard > SQL Editor
```

Or use Supabase CLI:
```bash
# If you have Supabase CLI installed
supabase db push
```

### Step 2: Deploy Supabase Edge Functions

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (use project ref: lplurvtmqctrdwhbxzwg)
supabase link --project-ref lplurvtmqctrdwhbxzwg

# Set secrets for Edge Functions
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# Deploy the Edge Functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### Step 3: Set Up Stripe Webhook

1. Go to Stripe Dashboard: https://dashboard.stripe.com/test/webhooks
2. Click **Add endpoint**
3. Set the endpoint URL to your webhook function:
   ```
   https://lplurvtmqctrdwhbxzwg.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to Supabase secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SIGNING_SECRET
   ```

### Step 4: Test the Integration

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Add items to cart and proceed to checkout

3. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

4. Complete checkout and verify:
   - Order appears in Supabase `orders` table
   - Product stock decreases
   - Success page shows confirmation

---

## 🧪 Testing Webhook Locally

To test webhooks during development:

1. Install Stripe CLI:
   ```bash
   # macOS/Linux
   brew install stripe/stripe-cli/stripe
   
   # Windows
   scoop install stripe
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local function:
   ```bash
   stripe listen --forward-to https://lplurvtmqctrdwhbxzwg.supabase.co/functions/v1/stripe-webhook
   ```

4. Use the webhook signing secret shown in terminal for local testing

---

## 📋 Environment Variables

Make sure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=https://lplurvtmqctrdwhbxzwg.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

---

## 🔒 Security Notes

- Never expose your `STRIPE_SECRET_KEY` on the frontend
- Always validate webhooks using the signing secret
- Use Supabase RLS policies to protect order data
- Test thoroughly with Stripe test mode before going live

---

## 🚢 Going to Production

When ready to accept real payments:

1. Get your **Live** keys from Stripe Dashboard
2. Update environment variables with live keys
3. Re-deploy Edge Functions with production secrets
4. Update webhook endpoint to production URL
5. Test with small real transaction first

---

## 📚 Resources

- [Stripe Embedded Checkout Docs](https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=embedded-page)
- [Stripe Webhooks Guide](https://docs.stripe.com/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Testing Cards](https://docs.stripe.com/testing)

---

## ❓ Troubleshooting

### Checkout page doesn't load
- Check browser console for errors
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
- Ensure Edge Function is deployed and accessible

### Webhook not receiving events
- Check Stripe Dashboard > Webhooks for failed deliveries
- Verify webhook URL is correct
- Ensure `STRIPE_WEBHOOK_SECRET` is set in Supabase secrets

### Orders not created in database
- Check Supabase Edge Function logs
- Verify database permissions (RLS policies)
- Check that `orders` table exists

---

## 🎉 You're Done!

Your Stripe integration is ready to accept payments!
