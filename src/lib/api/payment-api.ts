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
