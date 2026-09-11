### Task 2: Update Cron Job Logic

**Files:**
- Modify: `supabase/migrations/20260905000000_subscription_cron.sql` (Update the migration file to reflect the new state for version control)

**Interfaces:**
- Consumes: `cron.job` configuration.
- Produces: Updated SQL command for the `expire_subscriptions` job.

- [ ] **Step 1: Update the migration file**

Modify `supabase/migrations/20260905000000_subscription_cron.sql` to include the `NOT IN` clause in the first `UPDATE` statement:

```sql
  update public.profiles
  set role = ''pendaftar_baru''
  where role = ''pro''
    and id in (
      select user_id
      from public.subscriptions
      where ends_at < timezone(''utc'', now())
    )
    and id not in (
      select user_id
      from public.subscriptions
      where state = ''active'' and ends_at > timezone(''utc'', now())
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
