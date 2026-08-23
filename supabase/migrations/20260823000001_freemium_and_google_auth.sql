-- 1. Update subscription package check constraints
alter table public.payment_submissions
  drop constraint if exists payment_submissions_package_code_check;

update public.payment_submissions set package_code = '1_bulan' where package_code = 'pro_30_hari';
update public.payment_submissions set package_code = '1_bulan' where package_code = 'sprint_14_hari';

alter table public.payment_submissions
  add constraint payment_submissions_package_code_check
  check (package_code in ('1_bulan', '6_bulan', '1_tahun'));

alter table public.subscriptions
  drop constraint if exists subscriptions_package_code_check;

update public.subscriptions set package_code = '1_bulan' where package_code = 'pro_30_hari';
update public.subscriptions set package_code = '1_bulan' where package_code = 'sprint_14_hari';

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
