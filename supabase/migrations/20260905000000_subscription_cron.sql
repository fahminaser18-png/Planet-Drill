-- Setup pg_cron extension
create extension if not exists pg_cron;

-- Create the cron job to run at midnight every day
select cron.schedule(
  'expire_subscriptions',
  '0 0 * * *',
  $$
    -- Demote role to pendaftar_baru for anyone whose subscription has expired
    update public.profiles
    set role = 'pendaftar_baru'
    where role = 'pro'
      and id in (
        select user_id
        from public.subscriptions
        where ends_at < timezone('utc', now())
      );
      
    -- Also update the subscription state to expired
    update public.subscriptions
    set state = 'expired'
    where state = 'active'
      and ends_at < timezone('utc', now());
  $$
);
