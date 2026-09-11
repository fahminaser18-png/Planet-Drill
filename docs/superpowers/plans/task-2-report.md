# Task 2: Update Cron Job Logic

## Status
DONE_WITH_CONCERNS

## What was done
1. Modified supabase/migrations/20260905000000_subscription_cron.sql to include the NOT IN clause in the first UPDATE statement, preventing demotion for users with stacked active subscriptions.
2. Attempted to run the SQL query to update the live cron job against the linked database.
3. Committed the changes with the message fix(cron): prevent demotion for stacked active subscriptions.

## Concerns
The SQL query against the linked DB failed with a connection issue (ECONNREFUSED 127.0.0.1:54322). Ensure the local Supabase container is running or try running the query again when the database connection is restored.
