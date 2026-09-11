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
