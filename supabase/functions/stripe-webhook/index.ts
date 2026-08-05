import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Retrieve full session with line items
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'line_items.data.price.product'],
        })

        // Extract order data
        const lineItems = fullSession.line_items?.data || []
        const items = lineItems.map((item: any) => ({
          product_id: item.price?.product?.metadata?.product_id || null,
          name: item.description,
          quantity: item.quantity,
          price: item.amount_total / 100,
        }))

        // Generate order number
        const orderNumber = 'VA' + Math.floor(100000 + Math.random() * 900000).toString()

        // Create order in database
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: session.metadata?.user_id || null,
            order_number: orderNumber,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent,
            customer_email: session.customer_details?.email,
            customer_name: session.customer_details?.name,
            customer_phone: session.customer_details?.phone,
            shipping_address: session.shipping_details?.address,
            total_amount: session.amount_total / 100,
            subtotal: session.amount_subtotal / 100,
            currency: session.currency,
            status: 'paid',
            items: items,
          })
          .select()
          .single()

        if (orderError) {
          console.error('Error creating order:', orderError)
          throw orderError
        }

        console.log('Order created:', order.id)

        // Update product stock (reduce quantity)
        for (const item of items) {
          if (item.product_id) {
            await supabase.rpc('decrement_stock', {
              product_id: item.product_id,
              quantity: item.quantity,
            })
          }
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object
        console.log('Payment failed:', paymentIntent.id)
        // Handle failed payment if needed
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
