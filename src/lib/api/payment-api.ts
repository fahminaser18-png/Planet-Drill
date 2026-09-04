import { getSupabaseBrowserClient } from "../supabase/browser-client";

export async function createMidtransTransaction(packageCode: string) {
  const client = getSupabaseBrowserClient();
  const { data, error } = await client.functions.invoke('midtrans-create-transaction', {
    body: { packageCode }
  });

  if (error) {
    throw new Error(error.message);
  }
  
  if (data?.error) {
    throw new Error(data.error);
  }

  return data; // { token, redirect_url }
}

export async function getCurrentSubscription() {
  const client = getSupabaseBrowserClient();
  const { data, error } = await client
    .from("subscriptions")
    .select("starts_at, ends_at, package_code, state")
    .eq("state", "active")
    .order("ends_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") { // Ignore if not found
    throw new Error(error.message);
  }

  return data;
}
