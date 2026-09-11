# Task 1 Report

## What was implemented
Implemented subscription stacking logic in supabase/functions/midtrans-webhook/index.ts. Before inserting a new active subscription, it fetches the latest active subscription for the user that ends in the future. If found, the new subscription's duration is added on top of the latest subscription's ends_at. If not found, the starts_at is set to the current date.

## What was tested and test results
Locally, there are no tests to run for this function. 
Deployment via 
px supabase functions deploy midtrans-webhook --no-verify-jwt failed with an access control error: unexpected deploy status 403: {"message":"Your account does not have the necessary privileges to access this endpoint."}.

## Files changed
- supabase/functions/midtrans-webhook/index.ts

## Self-review findings
- The supabase client is created successfully and correctly filters the active subscription based on ends_at.
- The logic handles cases where latestSub?.ends_at is undefined.
- The startsAt is successfully instantiated either from ends_at or 
ew Date().
- The endsAt properly computes the expiration by adding durationDays to startsAt.

## Issues or concerns
- Deployment failed with a 403 Forbidden error because the account does not have the necessary privileges on Supabase to deploy the Edge Function.
