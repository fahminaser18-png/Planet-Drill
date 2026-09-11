# Subscription Stacking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to stack subscription durations (e.g. buying 6 months while having 4 months left gives 10 months) and prevent the cron job from prematurely demoting users with stacked subscriptions.

**Architecture:** 
The Midtrans webhook will query for the user's latest active subscription. If one exists and ends in the future, the new subscription's `starts_at` will be the old `ends_at`. The cron job logic will be updated with a `NOT IN` clause to ensure users aren't demoted if they have an active future subscription.

**Tech Stack:** Supabase Edge Functions (Deno/TypeScript), PostgreSQL (pg_cron).

## Global Constraints

- Do not modify frontend UI components.
- Existing Midtrans webhook payload parsing must remain intact.
- The cron schedule `0 0 * * *` remains the same, only the `command` is updated.

---

### Task 1: Update Webhook Stacking Logic

**Files:**
- Modify: `supabase/functions/midtrans-webhook/index.ts`

**Interfaces:**
- Consumes: Midtrans payload `custom_field1` (userId) and `custom_field2` (packageCode).
- Produces: A new row in `subscriptions` with correctly stacked `starts_at` and `ends_at`.

- [ ] **Step 1: Write the updated webhook implementation**

```typescript
// Insert this logic before inserting the subscription record in supabase/functions/midtrans-webhook/index.ts

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
```

- [ ] **Step 2: Apply the changes to the webhook file**

```bash
# This will be done via tool editing the index.ts file directly.
```

- [ ] **Step 3: Deploy the updated webhook**

```bash
npx supabase functions deploy midtrans-webhook --no-verify-jwt
```
Expected: PASS with "Deployed Function midtrans-webhook"

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/midtrans-webhook/index.ts
git commit -m "feat(webhook): implement subscription stacking logic"
```

### Task 2: Update Cron Job Logic

**Files:**
- Modify: `supabase/migrations/20260905000000_subscription_cron.sql` (Update the migration file to reflect the new state for version control)
- Test: Direct SQL execution to update the live cron job

**Interfaces:**
- Consumes: `cron.job` configuration.
- Produces: Updated SQL command for the `expire_subscriptions` job.

- [ ] **Step 1: Update the migration file**

Modify `supabase/migrations/20260905000000_subscription_cron.sql` to include the `NOT IN` clause in the first `UPDATE` statement:

```sql
UPDATE public.profiles
SET role = ''pendaftar_baru''
WHERE role = ''pro''
  AND id IN (
    SELECT user_id
    FROM public.subscriptions
    WHERE ends_at < timezone(''utc'', now())
  )
  AND id NOT IN (
    SELECT user_id
    FROM public.subscriptions
    WHERE state = ''active'' AND ends_at > timezone(''utc'', now())
  );
```

- [ ] **Step 2: Run SQL query to update the live cron job**

```bash
npx supabase db query "
select cron.schedule(
  'expire_subscriptions',
  '0 0 * * *',
  \$\$
  update public.profiles
  set role = 'pendaftar_baru'
  where role = 'pro'
    and id in (
      select user_id
      from public.subscriptions
      where ends_at < timezone('utc', now())
    )
    and id not in (
      select user_id
      from public.subscriptions
      where state = 'active' and ends_at > timezone('utc', now())
    );
    
  update public.subscriptions
  set state = 'expired'
  where state = 'active'
    and ends_at < timezone('utc', now());
  \$\$
);
" --linked
```
Expected: PASS showing the jobid of the updated cron job.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260905000000_subscription_cron.sql
git commit -m "fix(cron): prevent demotion for stacked active subscriptions"
```
