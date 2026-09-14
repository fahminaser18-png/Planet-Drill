-- Add onboarding fields to profiles table for marketing data collection
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school_name text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS referral_source text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.school_name IS 'Asal sekolah user, dikumpulkan saat onboarding';
COMMENT ON COLUMN public.profiles.phone_number IS 'Nomor HP user, dikumpulkan saat onboarding';
COMMENT ON COLUMN public.profiles.referral_source IS 'Sumber referral (Instagram, TikTok, dll), dikumpulkan saat onboarding';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Flag apakah user sudah mengisi form onboarding';
