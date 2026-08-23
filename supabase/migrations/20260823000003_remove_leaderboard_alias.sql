create or replace function public.get_leaderboard(target_category text default 'overall')
returns table (
  rank bigint,
  user_id uuid,
  alias text,
  score numeric(5,2),
  time_used_seconds integer,
  attempt_id uuid,
  submitted_at timestamptz,
  category text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_category text := lower(coalesce(target_category, 'overall'));
  target_block_name text;
begin
  if normalized_category = 'overall' then
    target_block_name := null;
  else
    target_block_name := target_category;
  end if;

  return query
  with overall_attempt_scores as (
    select
      attempt.user_id,
      coalesce(
        nullif(profiles.full_name, ''),
        'Peserta-' || upper(substr(replace(attempt.user_id::text, '-', ''), 1, 4))
      ) as alias,
      attempt_result.score::numeric(5, 2) as score,
      attempt_result.time_used_seconds,
      attempt.id as attempt_id,
      attempt.submitted_at
    from public.attempts as attempt
    join public.attempt_results as attempt_result
      on attempt_result.attempt_id = attempt.id
    join public.profiles as profiles
      on profiles.id = attempt.user_id
    where attempt.status = 'submitted'
      and attempt.submitted_at is not null
      and profiles.role = 'pro'
  ),
  block_attempt_scores as (
    select
      attempt.user_id,
      coalesce(
        nullif(profiles.full_name, ''),
        'Peserta-' || upper(substr(replace(attempt.user_id::text, '-', ''), 1, 4))
      ) as alias,
      round(
        (
          count(*) filter (
            where answer.selected_option_key = item.correct_option_key
          )::numeric
          / count(*)::numeric
        ) * 100,
        2
      )::numeric(5, 2) as score,
      attempt_result.time_used_seconds,
      attempt.id as attempt_id,
      attempt.submitted_at
    from public.attempt_items as item
    join public.attempts as attempt
      on attempt.id = item.attempt_id
    join public.attempt_results as attempt_result
      on attempt_result.attempt_id = attempt.id
    join public.profiles as profiles
      on profiles.id = attempt.user_id
    left join public.answers as answer
      on answer.attempt_item_id = item.id
    where attempt.status = 'submitted'
      and attempt.submitted_at is not null
      and profiles.role = 'pro'
      and item.block_name = target_block_name
    group by
      attempt.user_id,
      profiles.full_name,
      attempt_result.time_used_seconds,
      attempt.id,
      attempt.submitted_at
  ),
  candidate_scores as (
    select
      overall_attempt_scores.user_id,
      overall_attempt_scores.alias,
      overall_attempt_scores.score,
      overall_attempt_scores.time_used_seconds,
      overall_attempt_scores.attempt_id,
      overall_attempt_scores.submitted_at
    from overall_attempt_scores
    where normalized_category = 'overall'

    union all

    select
      block_attempt_scores.user_id,
      block_attempt_scores.alias,
      block_attempt_scores.score,
      block_attempt_scores.time_used_seconds,
      block_attempt_scores.attempt_id,
      block_attempt_scores.submitted_at
    from block_attempt_scores
    where normalized_category <> 'overall'
  ),
  best_per_user as (
    select
      candidate_scores.user_id,
      candidate_scores.alias,
      candidate_scores.score,
      candidate_scores.time_used_seconds,
      candidate_scores.attempt_id,
      candidate_scores.submitted_at,
      row_number() over (
        partition by candidate_scores.user_id
        order by
          candidate_scores.score desc,
          candidate_scores.time_used_seconds asc,
          candidate_scores.submitted_at asc,
          candidate_scores.attempt_id asc
      ) as best_row
    from candidate_scores
  ),
  ranked_scores as (
    select
      dense_rank() over (
        order by
          best_per_user.score desc,
          best_per_user.time_used_seconds asc
      ) as rank,
      best_per_user.user_id,
      best_per_user.alias,
      best_per_user.score,
      best_per_user.time_used_seconds,
      best_per_user.attempt_id,
      best_per_user.submitted_at,
      normalized_category as category,
      row_number() over (
        order by
          best_per_user.score desc,
          best_per_user.time_used_seconds asc,
          best_per_user.submitted_at asc,
          best_per_user.attempt_id asc
      ) as leaderboard_row
    from best_per_user
    where best_per_user.best_row = 1
  )
  select
    ranked_scores.rank,
    ranked_scores.user_id,
    ranked_scores.alias,
    ranked_scores.score,
    ranked_scores.time_used_seconds,
    ranked_scores.attempt_id,
    ranked_scores.submitted_at,
    ranked_scores.category
  from ranked_scores
  where ranked_scores.leaderboard_row <= 100
  order by ranked_scores.leaderboard_row
  limit 100;
end;
$$;


create or replace function public.get_scheduled_tryout_event_leaderboard(
  target_event_id uuid,
  target_event_cycle integer default null
)
returns table (
  rank bigint,
  event_id uuid,
  event_cycle integer,
  user_id uuid,
  alias text,
  best_score numeric(5,2),
  best_score_attempt_number integer,
  attempt_id uuid,
  submitted_at timestamptz,
  leaderboard_state text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  event_row public.scheduled_tryout_events%rowtype;
  resolved_event_cycle integer;
begin
  select *
  into event_row
  from public.scheduled_tryout_events
  where id = target_event_id
    and editorial_status = 'published';

  if not found then
    raise exception 'Event try out terjadwal tidak ditemukan.'
      using errcode = 'P0002';
  end if;

  select current_cycle
  into resolved_event_cycle
  from public.scheduled_tryout_events
  where id = target_event_id;

  resolved_event_cycle := coalesce(target_event_cycle, resolved_event_cycle);

  return query
  with event_context as (
    select
      event.id,
      resolved_event_cycle as event_cycle,
      case
        when timezone('utc', now()) < event.access_end_at then 'live'
        else 'final'
      end as leaderboard_state
    from public.scheduled_tryout_events as event
    where event.id = target_event_id
  ),
  submitted_attempts as (
    select
      attempt.id,
      attempt.event_id,
      attempt.event_cycle,
      attempt.user_id,
      attempt.submitted_at,
      result.score_percentage::numeric(5,2) as score_percentage,
      coalesce(
        nullif(profiles.full_name, ''),
        'Apoteker-' || upper(substr(replace(attempt.user_id::text, '-', ''), 1, 4))
      ) as alias
    from public.scheduled_tryout_attempts as attempt
    join public.scheduled_tryout_attempt_results as result
      on result.attempt_id = attempt.id
    join public.profiles as profiles
      on profiles.id = attempt.user_id
    join event_context
      on event_context.id = attempt.event_id
      and event_context.event_cycle = attempt.event_cycle
    where attempt.status = 'submitted'
      and attempt.submitted_at is not null
      and profiles.role = 'pro'
  ),
  attempt_numbered as (
    select
      attempt.id,
      attempt.event_id,
      attempt.event_cycle,
      attempt.user_id,
      attempt.submitted_at,
      attempt.score_percentage,
      attempt.alias,
      row_number() over ( partition by attempt.user_id order by attempt.submitted_at asc, attempt.id asc ) as attempt_number
    from submitted_attempts as attempt
  ),
  best_score_per_user as (
    select
      attempt.user_id,
      max(attempt.score_percentage)::numeric(5,2) as best_score
    from attempt_numbered as attempt
    group by attempt.user_id
  ),
  first_best_score_attempt as (
    select
      attempt.event_id,
      attempt.event_cycle,
      attempt.user_id,
      attempt.alias,
      best_score_per_user.best_score,
      attempt.attempt_number as best_score_attempt_number,
      attempt.id as attempt_id,
      attempt.submitted_at,
      row_number() over (
        partition by attempt.user_id
        order by
          attempt.score_percentage desc,
          attempt.submitted_at asc,
          attempt.id asc
      ) as rn
    from attempt_numbered as attempt
    join best_score_per_user
      on best_score_per_user.user_id = attempt.user_id
  ),
  deduplicated_best_score as (
    select
      first_best_score_attempt.event_id,
      first_best_score_attempt.event_cycle,
      first_best_score_attempt.user_id,
      first_best_score_attempt.alias,
      first_best_score_attempt.best_score,
      first_best_score_attempt.best_score_attempt_number,
      first_best_score_attempt.attempt_id,
      first_best_score_attempt.submitted_at
    from first_best_score_attempt
    where first_best_score_attempt.rn = 1
  )
  select
    dense_rank() over ( order by deduplicated_best_score.best_score desc ) as rank,
    deduplicated_best_score.event_id,
    deduplicated_best_score.event_cycle,
    deduplicated_best_score.user_id,
    deduplicated_best_score.alias,
    deduplicated_best_score.best_score,
    deduplicated_best_score.best_score_attempt_number,
    deduplicated_best_score.attempt_id,
    deduplicated_best_score.submitted_at,
    event_context.leaderboard_state
  from deduplicated_best_score
  cross join event_context
  order by
    deduplicated_best_score.best_score desc,
    deduplicated_best_score.submitted_at asc,
    deduplicated_best_score.attempt_id asc;
end;
$$;
