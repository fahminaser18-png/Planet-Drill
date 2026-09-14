import { getSupabaseBrowserClient } from "../supabase/browser-client";

type OnboardingData = {
  userId: string;
  fullName: string;
  schoolName: string;
  phoneNumber: string;
  referralSource: string;
};

type OnboardingClient = Pick<
  ReturnType<typeof getSupabaseBrowserClient>,
  "from" | "auth"
>;

export async function submitOnboardingData(
  data: OnboardingData,
  client: OnboardingClient = getSupabaseBrowserClient(),
) {
  const { error: profileError } = await client
    .from("profiles")
    .update({
      full_name: data.fullName,
      school_name: data.schoolName,
      phone_number: data.phoneNumber,
      referral_source: data.referralSource,
      onboarding_completed: true,
    })
    .eq("id", data.userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  // Also update auth user metadata so full_name is synced
  const { error: authError } = await client.auth.updateUser({
    data: { full_name: data.fullName },
  });

  if (authError) {
    throw new Error(authError.message);
  }
}

export async function checkOnboardingStatus(
  client: OnboardingClient = getSupabaseBrowserClient(),
): Promise<boolean> {
  const { data, error } = await client
    .from("profiles")
    .select("onboarding_completed")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data?.onboarding_completed ?? false;
}
