# Registration & Freemium Subscription Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the feature-based freemium subscription model, update duration packages (1/6/12 months), and add Google OAuth integration.

**Architecture:** Database migrations to adjust subscription constraints and add `is_free_access` to scheduled events. Frontend updates to integrate Google login, adjust paywalls for unlimited tryouts, and manage free access logic.

**Tech Stack:** React, TypeScript, Supabase (PostgreSQL, Auth).

## Global Constraints

- Never use `cat` to modify files. Use provided file editing tools.
- Maintain existing coding styles and component library usage.

---

### Task 1: Database Migration - Packages & Freemium Event

**Files:**
- Create: `supabase/migrations/20260823000001_freemium_and_google_auth.sql`

**Interfaces:**
- Produces: Updated constraints on `subscriptions` and `payment_submissions`. Updated `subscription_package_duration_days`. New column `is_free_access` on `scheduled_tryout_events`. Updated `start_scheduled_tryout_attempt` RPC.

- [ ] **Step 1: Write migration SQL**

```sql
-- 1. Update subscription package check constraints
alter table public.payment_submissions
  drop constraint if exists payment_submissions_package_code_check;

alter table public.payment_submissions
  add constraint payment_submissions_package_code_check
  check (package_code in ('1_bulan', '6_bulan', '1_tahun'));

alter table public.subscriptions
  drop constraint if exists subscriptions_package_code_check;

alter table public.subscriptions
  add constraint subscriptions_package_code_check
  check (package_code in ('1_bulan', '6_bulan', '1_tahun'));

-- 2. Update duration function
create or replace function public.subscription_package_duration_days(package_code text)
returns integer
language plpgsql
immutable
as $$
begin
  case package_code
    when '1_bulan' then
      return 30;
    when '6_bulan' then
      return 180;
    when '1_tahun' then
      return 365;
    else
      raise exception 'Kode paket langganan tidak valid.'
        using errcode = '22023';
  end case;
end;
$$;

-- 3. Add is_free_access to scheduled_tryout_events
alter table public.scheduled_tryout_events
  add column is_free_access boolean not null default false;

-- 4. Update start_scheduled_tryout_attempt RPC to check is_free_access
create or replace function public.start_scheduled_tryout_attempt(
  target_event_id uuid
)
returns public.scheduled_tryout_attempts
language plpgsql
security definer
set search_path = public
as $$
declare
  event_row public.scheduled_tryout_events%rowtype;
  active_attempt public.scheduled_tryout_attempts%rowtype;
  created_attempt public.scheduled_tryout_attempts%rowtype;
  submitted_attempt_count integer;
  is_privileged_user boolean;
begin
  if auth.uid() is null then
    raise exception 'Silakan login terlebih dahulu sebelum memulai try out terjadwal.'
      using errcode = '42501';
  end if;

  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role::text in ('pro', 'mentor')
  ) into is_privileged_user;

  select *
  into event_row
  from public.scheduled_tryout_events
  where id = target_event_id
    and editorial_status = 'published'
    and access_start_at <= timezone('utc', now())
    and access_end_at > timezone('utc', now());

  if not found then
    raise exception 'Event try out terjadwal tidak aktif atau belum dipublikasikan.'
      using errcode = 'P0002';
  end if;

  if not event_row.is_free_access and not is_privileged_user then
    raise exception 'Akses mulai try out terjadwal ini hanya tersedia untuk pengguna pro atau mentor.'
      using errcode = '42501';
  end if;

  select *
  into active_attempt
  from public.scheduled_tryout_attempts
  where event_id = event_row.id
    and event_cycle = event_row.current_cycle
    and user_id = auth.uid()
    and status in ('in_progress', 'paused')
  order by created_at desc, id desc
  limit 1;

  if found then
    perform public.sync_scheduled_tryout_attempt(active_attempt.id);

    select *
    into active_attempt
    from public.scheduled_tryout_attempts
    where id = active_attempt.id;

    return active_attempt;
  end if;

  select count(*)
  into submitted_attempt_count
  from public.scheduled_tryout_attempts
  where event_id = event_row.id
    and event_cycle = event_row.current_cycle
    and user_id = auth.uid()
    and status = 'submitted';

  if submitted_attempt_count >= 3 then
    raise exception 'Kesempatan try out terjadwal untuk siklus ini sudah habis.'
      using errcode = 'P0001';
  end if;

  begin
    insert into public.scheduled_tryout_attempts (
      event_id,
      event_cycle,
      user_id,
      status,
      started_at,
      time_limit_seconds,
      elapsed_seconds,
      last_resumed_at,
      paused_at,
      total_questions
    )
    values (
      event_row.id,
      event_row.current_cycle,
      auth.uid(),
      'in_progress',
      timezone('utc', now()),
      0,
      0,
      timezone('utc', now()),
      null,
      0
    )
    returning *
    into created_attempt;
  exception
    when unique_violation then
      select *
      into active_attempt
      from public.scheduled_tryout_attempts
      where event_id = event_row.id
        and event_cycle = event_row.current_cycle
        and user_id = auth.uid()
        and status in ('in_progress', 'paused')
      order by created_at desc, id desc
      limit 1;

      if found then
        perform public.sync_scheduled_tryout_attempt(active_attempt.id);

        select *
        into active_attempt
        from public.scheduled_tryout_attempts
        where id = active_attempt.id;

        return active_attempt;
      end if;

      raise;
  end;

  return created_attempt;
end;
$$;
```

- [ ] **Step 2: Commit**
```bash
git add supabase/migrations/20260823000001_freemium_and_google_auth.sql
git commit -m "feat: db migration for freemium model and new packages"
```

### Task 2: Code Updates - Packages API & UI

**Files:**
- Modify: `src/lib/api/subscription-api.ts`
- Modify: `src/mocks/subscription-content.ts` (if it exists and defines packages)

**Interfaces:**
- Consumes: Package codes updated in DB.
- Produces: Updated API for frontend.

- [ ] **Step 1: Modify `src/lib/api/subscription-api.ts`**
Replace `subscriptionPackageOptions` with the new values.

```typescript
export const subscriptionPackageOptions: SubscriptionPackageOption[] = [
  {
    code: "1_bulan",
    name: "1 Bulan",
    durationDays: 30,
  },
  {
    code: "6_bulan",
    name: "6 Bulan",
    durationDays: 180,
  },
  {
    code: "1_tahun",
    name: "1 Tahun",
    durationDays: 365,
  },
];
```

- [ ] **Step 2: Modify `src/mocks/subscription-content.ts`** (Check file for `subscriptionPackages` and update prices).
Ensure prices are 50k, 250k, 450k accordingly. Let the subagent figure out the exact lines.

- [ ] **Step 3: Test and Commit**
```bash
npm run test -- src/lib/api/subscription-api.test.ts
git add src/lib/api/subscription-api.ts src/mocks/subscription-content.ts
git commit -m "feat: update subscription packages"
```

### Task 3: Google Login Integration

**Files:**
- Modify: `src/lib/api/auth-api.ts`
- Modify: `src/pages/auth/login-page.tsx`

**Interfaces:**
- Produces: Google login button on the auth page.

- [ ] **Step 1: Add loginWithGoogle to `auth-api.ts`**
```typescript
export async function loginWithGoogle(
  {
    client = getSupabaseBrowserClient(),
  }: {
    client?: AuthClient;
  } = {}
) {
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/app`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}
```

- [ ] **Step 2: Update `login-page.tsx`**
Import `loginWithGoogle` and add a button above the email/password form to "Lanjutkan dengan Google".

- [ ] **Step 3: Commit**
```bash
git add src/lib/api/auth-api.ts src/pages/auth/login-page.tsx
git commit -m "feat: add Google OAuth login"
```
