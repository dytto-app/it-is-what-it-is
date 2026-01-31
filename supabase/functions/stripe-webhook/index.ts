import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.8.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

/**
 * Stripe Webhook Handler
 * 
 * Listens for checkout.session.completed events from Stripe,
 * verifies the webhook signature, and grants cosmetic ownership.
 * 
 * Fixes: https://github.com/Ayaan-P/back-log/issues/2
 * 
 * Environment variables required:
 * - STRIPE_SECRET_KEY: Stripe secret key
 * - STRIPE_WEBHOOK_SECRET: Webhook endpoint signing secret
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (bypasses RLS)
 */

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
})

const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""

serve(async (req) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    // Get the raw body for signature verification
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
      console.error("No stripe-signature header")
      return new Response("No signature", { status: 400 })
    }

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured")
      return new Response("Webhook not configured", { status: 500 })
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return new Response(`Webhook Error: ${err instanceof Error ? err.message : "Unknown"}`, {
        status: 400,
      })
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.metadata?.user_id
      const cosmeticId = session.metadata?.cosmetic_id
      const cosmeticType = session.metadata?.cosmetic_type

      if (!userId || !cosmeticId || !cosmeticType) {
        console.error("Missing metadata in checkout session:", session.id)
        return new Response("Missing metadata", { status: 400 })
      }

      // Verify payment was actually completed
      if (session.payment_status !== "paid") {
        console.log(`Payment not completed for session ${session.id}, status: ${session.payment_status}`)
        return new Response("Payment not completed", { status: 200 })
      }

      // Use service role client to bypass RLS
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Grant the cosmetic to the user
      const { error: insertError } = await supabase
        .from("user_cosmetics")
        .upsert(
          {
            user_id: userId,
            cosmetic_id: cosmeticId,
            purchased_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,cosmetic_id",
          }
        )

      if (insertError) {
        console.error("Failed to grant cosmetic:", insertError)
        return new Response("Database error", { status: 500 })
      }

      console.log(`✅ Granted cosmetic ${cosmeticId} (${cosmeticType}) to user ${userId}`)
    }

    // Return 200 for all events (Stripe expects this)
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})
