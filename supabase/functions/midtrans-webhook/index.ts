import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

serve(async (req) => {
  try {
    const payload = await req.json()
    const { order_id, transaction_status, gross_amount, status_code, signature_key, payment_type } = payload

    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY') ?? ''
    
    // Convert hash string correctly
    const encoder = new TextEncoder();
    const data = encoder.encode(order_id + status_code + gross_amount + serverKey);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (expectedSignature !== signature_key) {
      return new Response("Invalid signature", { status: 401 })
    }

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      const userId = payload.custom_field1
      const packageCode = payload.custom_field2
      
      if (userId && packageCode) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Calculate duration based on packageCode
        let durationDays = 30
        if (packageCode === '6_bulan') durationDays = 180
        if (packageCode === '1_tahun') durationDays = 365
        
        // Update profile role first so they get access immediately
        await supabase.from('profiles').update({ role: 'pro' }).eq('id', userId)

        // Then insert subscription with correct columns (state, starts_at, ends_at)
        // Note: We don't insert package_code if it's not in ('sprint_14_hari', 'pro_30_hari')
        // to avoid check constraint errors. We use 'pro_30_hari' as a safe fallback for the database constraint.
        const safePackageCode = (packageCode === '1_bulan' || packageCode === '6_bulan' || packageCode === '1_tahun') 
          ? 'pro_30_hari' 
          : packageCode;

        await supabase.from('subscriptions').insert({
          user_id: userId,
          package_code: safePackageCode,
          state: 'active',
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
        })
      }
    }

    return new Response("OK", { status: 200 })
  } catch (error: any) {
    console.error("Webhook error:", error)
    // Always return 200 so Midtrans stops retrying on failure
    return new Response("OK", { status: 200 })
  }
})
