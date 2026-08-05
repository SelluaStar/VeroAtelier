# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

VeroAtelier is a React + Vite storefront for a luxury resale/consignment shop, backed by Supabase (Postgres, Auth, Edge Functions) and Stripe (Embedded Checkout) for payments.

## Important Rules:

### Rule 1: Confidence: 

- Do not make any changes until you have 95% confidence in what you need to build. Ask me follow-up questions until you reach that confidence.

### Rule 2: Applied Learning:

When something fails repeatedly, when Nate has to re-explain, or when a workaround is found for a platform/tool limitation, add a one-line bullet here. keep each buttlet under 15 words. No explainations. Only add things that will save time in future sessions.

- [Example bullet].

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # production build (outputs to dist/)
npm run preview   # preview the production build
npm run lint      # run oxlint (see .oxlintrc.json)
```

There is no test suite configured in this repo.

### Supabase Edge Functions (Deno, in `supabase/functions/`)

```bash
supabase link --project-ref <ref>
supabase functions deploy <function-name>
supabase secrets set STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=...
supabase functions logs <function-name> --project-ref <ref>
```

To test Stripe webhooks locally, use the Stripe CLI: `stripe listen --forward-to <edge-function-url>`.

## Architecture

### Data layer: two separate product sources — don't mix them up

- **`src/data/products.js`** is a static, hand-written mock dataset (camelCase fields: `originalPrice`, `images` array, `sizes` array). It's only used by `Home.jsx` and `Header.jsx` (e.g. search/featured display). Treat it as legacy/demo data, not the source of truth.
- **Supabase `products` table** is the real data source for the shop, product detail, and all admin pages (`Shop.jsx`, `ProductDetail.jsx`, `admin/Products.jsx`, `admin/ProductOrder.jsx`, `admin/Dashboard.jsx`). Its schema uses snake_case fields (`brand`, `category`, `subcategory`, `gender`, `size`, `condition`, `stock`, `featured`, `is_on_sale`, `discount_percentage`, `image_url`) — see `seed-products.js` for the canonical shape and `seed-output.sql` for generated seed SQL.

When touching product-related pages, check which data source that specific page uses before assuming a shape.

### Auth & profiles

- `src/context/AuthContext.jsx` wraps Supabase Auth (`supabase.auth`) and additionally manages a `profiles` table row per user (created after signup via the onboarding flow, not automatically on signup in the frontend — see `Onboarding.jsx`). Exposes `user`, `profile`, `loading`, `needsOnboarding`, `signUp`, `signIn`, `signOut`, `updateProfile`, `createProfile`.
- `needsOnboarding` is set when a `profiles` row lookup fails with Postgres "no rows" (`PGRST116`); routes should send such users to `/onboarding`.
- Admin access is gated purely on `profile.is_admin` (checked client-side in `AdminLayout.jsx`), not a separate role system. Any new admin page should read `is_admin` the same way, and real enforcement lives in Supabase RLS policies, not the client.
- Cart state (`src/context/CartContext.jsx`) is local-only, persisted to `localStorage` — it is not synced to Supabase.

### Routing (`src/App.jsx`)

Single `<Routes>` tree with three page classes toggled by pathname prefix, each hiding/showing chrome differently:
- **Auth pages** (`/signin`, `/signup`, `/verify-email`, `/onboarding`): no Header/Footer/CartDrawer.
- **Admin pages** (`/admin/*`): nested under `AdminLayout` (its own sidebar/header shell), no storefront Header/Footer/CartDrawer.
- **Checkout pages** (`/checkout*`): no storefront Header/CartDrawer, but keeps Footer... actually Footer is hidden for admin/auth only — check `isCheckoutPage` logic in `App.jsx` before assuming what chrome renders on a new route.

When adding a new top-level route, decide which of these three classes it belongs to (or none) and update the boolean checks in `AppContent()` accordingly.

### Payments (Stripe Embedded Checkout + Supabase Edge Functions)

Flow: `Cart.jsx` → `Checkout.jsx` (embedded Stripe Checkout UI) → Stripe hosted payment → `CheckoutSuccess.jsx`.

- **`create-checkout-session`** (JWT verification ON): builds Stripe line items from cart items and creates an embedded Checkout Session; stores `product_id` in Stripe line-item metadata so the webhook can map back to Supabase products.
- **`stripe-webhook`** (JWT verification OFF — Stripe doesn't send a Supabase JWT): verifies the Stripe signature, and on `checkout.session.completed` creates a row in `orders` and decrements stock via the `decrement_stock` Postgres RPC. Uses the Supabase **service role key**, bypassing RLS — this is the only place order rows get created for real purchases.
- **`get-checkout-session`**: fetches a session by ID for the success page.
- Guest checkout is supported: `orders.user_id` is null when no authenticated user is present at checkout time; `customer_email` is always captured from Stripe.
- Database schema for `orders` lives in `database-setup.sql`.

### Directory reference

- `src/pages/` — top-level routed pages; `src/pages/admin/` — admin dashboard pages (products, orders, users, coupons, product ordering/merchandising).
- `src/components/` — shared chrome/UI (Header, Footer, CartDrawer, modals, loading states, page transitions).
- `src/context/` — global React Context providers (Auth, Cart, Toast).
- `src/lib/supabase.js` — the single Supabase client instance, configured from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- `supabase/functions/` — Deno Edge Functions (Stripe integration).

## Known repo issues worth knowing about

- Several root-level `STRIPE_*.md` files contain a real (test-mode) Stripe secret key and Supabase project ref committed in plaintext. Don't propagate secrets like this into new docs — reference `.env` var names instead of literal values.
- `VeroAtelier-main/` is an empty directory at the repo root; don't assume it holds a nested copy of the project.

