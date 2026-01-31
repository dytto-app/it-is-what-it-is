import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.8.0?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
})

interface CheckoutRequest {
  cosmeticId: string
  cosmeticType: "frame" | "badge" | "title"
  price: number
  name: string
  userId: string
}

const cosmetics = {
  frames: [
    { id: "gold", name: "Golden Aura", price: 99 },
    { id: "diamond", name: "Diamond Elite", price: 299 },
    { id: "fire", name: "Blazing Fire", price: 199 },
    { id: "cosmic", name: "Cosmic Energy", price: 699 },
  ],
  badges: [
    { id: "star", name: "Rising Star", price: 99 },
    { id: "lightning", name: "Speed Demon", price: 149 },
    { id: "flame", name: "On Fire", price: 199 },
    { id: "diamond-badge", name: "Diamond Pro", price: 299 },
    { id: "shield", name: "Elite Guard", price: 349 },
  ],
  titles: [
    { id: "rookie", name: "The Rookie", price: 49 },
    { id: "grinder", name: "The Grinder", price: 99 },
    { id: "legend", name: "Living Legend", price: 199 },
    { id: "master", name: "Poop Master", price: 299 },
    { id: "emperor", name: "Toilet Emperor", price: 499 },
  ],
}

const ALLOWED_ORIGINS = [
  Deno.env.get("FRONTEND_URL") || "http://localhost:5173",
  "https://back-log.com",
  "https://www.back-log.com",
]

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || ""
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    })
  }

  try {
    const {
      cosmeticId,
      cosmeticType,
      price,
      name,
      userId,
    } = (await req.json()) as CheckoutRequest

    // Validate inputs
    if (!cosmeticId || !cosmeticType || !price || !name || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate price against our cosmetics list
    const pluralType = cosmeticType === 'frame' ? 'frames' : cosmeticType === 'badge' ? 'badges' : 'titles'
    const cosmeticsList = cosmetics[pluralType as keyof typeof cosmetics]
    const validCosmetic = cosmeticsList.find((c: any) => c.id === cosmeticId)

    if (!validCosmetic || validCosmetic.price !== price) {
      return new Response(
        JSON.stringify({ error: "Invalid cosmetic or price" }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${name} - ${cosmeticType}`,
              description: `backlog cosmetic: ${name}`,
              images: [
                "https://img.freepik.com/premium-vector/cosmetic-products-makeup-set_24911-1425.jpg",
              ],
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        Deno.env.get("FRONTEND_URL") || "http://localhost:5173"
      }/leaderboard?payment=success`,
      cancel_url: `${
        Deno.env.get("FRONTEND_URL") || "http://localhost:5173"
      }/leaderboard?payment=cancelled`,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
        cosmetic_id: cosmeticId,
        cosmetic_type: cosmeticType,
      },
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Checkout failed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    )
  }
})
