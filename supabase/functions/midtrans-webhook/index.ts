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
        const { error: profileError } = await supabase.from('profiles').update({ role: 'pro' }).eq('id', userId)
        if (profileError) console.error("Profile update error:", profileError)

        // Find the latest active subscription for this user
        const { data: latestSub, error: fetchSubError } = await supabase
          .from('subscriptions')
          .select('ends_at')
          .eq('user_id', userId)
          .eq('state', 'active')
          .gt('ends_at', new Date().toISOString())
          .order('ends_at', { ascending: false })
          .limit(1)
          .single()

        if (fetchSubError && fetchSubError.code !== 'PGRST116') {
          console.error("Error fetching latest sub:", fetchSubError)
        }

        const startsAt = latestSub?.ends_at ? new Date(latestSub.ends_at) : new Date()
        const endsAt = new Date(startsAt.getTime() + durationDays * 24 * 60 * 60 * 1000)

        // Insert subscription record
        const { error: subError } = await supabase.from('subscriptions').insert({
          user_id: userId,
          package_code: packageCode,
          state: 'active',
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString()
        })
        if (subError) console.error("Subscription insert error:", subError)
      }
    }

    return new Response("OK", { status: 200 })
  } catch (error: any) {
    console.error("Webhook error:", error)
    // Always return 200 so Midtrans stops retrying on failure
    return new Response("OK", { status: 200 })
  }
})
