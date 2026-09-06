import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const prices: Record<string, number> = {
  "1_bulan": 70000,
  "6_bulan": 250000,
  "1_tahun": 500000,
}

const packageNames: Record<string, string> = {
  "1_bulan": "Planet Drill Pro - 1 Bulan",
  "6_bulan": "Planet Drill Pro - 6 Bulan",
  "1_tahun": "Planet Drill Pro - 1 Tahun",
}

/**
 * Decode JWT payload without verification.
 * Safe here because the Supabase API gateway already validated the token
 * before forwarding the request to this Edge Function.
 */
function decodeJwtPayload(token: string): Record<string, any> {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error("Invalid JWT format")
  // base64url → base64 → decode
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = atob(base64)
  return JSON.parse(json)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error("Missing or invalid Authorization header")
    }

    const jwt = authHeader.replace('Bearer ', '')
    const payload = decodeJwtPayload(jwt)

    const userId = payload.sub
    const userEmail = payload.email
    if (!userId) throw new Error("Invalid token: no user ID")

    const { packageCode } = await req.json()
    if (!prices[packageCode]) {
      throw new Error("Invalid package code")
    }

    const price = prices[packageCode]
    // Midtrans order_id max 50 chars. Use short format.
    const shortId = userId.replace(/-/g, '').substring(0, 8)
    const orderId = `PD-${shortId}-${packageCode}-${Date.now()}`

    const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY')
    if (!midtransServerKey) throw new Error("MIDTRANS_SERVER_KEY not set in Edge Function secrets")

    const authString = btoa(`${midtransServerKey}:`)

    const midtransResponse = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${authString}`
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderId,
          gross_amount: price
        },
        item_details: [
          {
            id: packageCode,
            price: price,
            quantity: 1,
            name: packageNames[packageCode],
          }
        ],
        customer_details: {
          email: userEmail,
        },
        custom_field1: userId,
        custom_field2: packageCode,
      })
    })

    const midtransData = await midtransResponse.json()
    if (!midtransResponse.ok) {
      console.error("Midtrans error:", midtransData)
      throw new Error("Failed to create Midtrans transaction")
    }

    return new Response(JSON.stringify(midtransData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error("Function error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
