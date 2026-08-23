-- 1. Update upsert_scheduled_tryout_event RPC to support is_free_access
create or replace function public.upsert_scheduled_tryout_event(
  target_event_id uuid,
  payload jsonb
)
returns public.scheduled_tryout_events
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_event public.scheduled_tryout_events%rowtype;
  incoming_existing_question_ids uuid[] := '{}'::uuid[];
  question_payload jsonb;
  current_question_id uuid;
  current_block_id uuid;
  current_topic_id uuid;
  next_question_order integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Silakan login terlebih dahulu sebelum menyimpan event try out terjadwal.'
      using errcode = '42501';
  end if;

  if not public.can_manage_scheduled_tryouts() then
    raise exception 'Akses kelola event try out terjadwal hanya tersedia untuk mentor atau admin.'
      using errcode = '42501';
  end if;

  if payload is null then
    raise exception 'Payload event try out terjadwal tidak boleh kosong.'
      using errcode = 'P0001';
  end if;

  if target_event_id is null then
    insert into public.scheduled_tryout_events (
      title,
      description,
      editorial_status,
      is_free_access,
      access_start_at,
      access_end_at,
      created_by,
      updated_by
    )
    values (
      payload->>'title',
      coalesce(payload->>'description', ''),
      payload->>'editorialStatus',
      coalesce((payload->>'isFreeAccess')::boolean, false),
      (payload->>'accessStartAt')::timestamptz,
      (payload->>'accessEndAt')::timestamptz,
      nullif(payload->>'createdBy', '')::uuid,
      coalesce(nullif(payload->>'updatedBy', '')::uuid, nullif(payload->>'createdBy', '')::uuid)
    )
    returning *
    into saved_event;
  else
    update public.scheduled_tryout_events
    set
      title = payload->>'title',
      description = coalesce(payload->>'description', ''),
      editorial_status = payload->>'editorialStatus',
      is_free_access = coalesce((payload->>'isFreeAccess')::boolean, false),
      access_start_at = (payload->>'accessStartAt')::timestamptz,
      access_end_at = (payload->>'accessEndAt')::timestamptz,
      updated_by = nullif(payload->>'updatedBy', '')::uuid
    where id = target_event_id
    returning *
    into saved_event;

    if not found then
      raise exception 'Event try out terjadwal tidak ditemukan.'
        using errcode = 'P0002';
    end if;
  end if;

  select coalesce(array_agg(nullif(question_item->>'id', '')::uuid), '{}'::uuid[])
  into incoming_existing_question_ids
  from jsonb_array_elements(coalesce(payload->'questions', '[]'::jsonb)) as question(question_item)
  where nullif(question_item->>'id', '') is not null;

  delete from public.scheduled_tryout_event_questions
  where event_id = saved_event.id
    and not (id = any(incoming_existing_question_ids));

  for question_payload in
    select value
    from jsonb_array_elements(coalesce(payload->'questions', '[]'::jsonb))
  loop
    next_question_order := next_question_order + 1;
    current_block_id := nullif(question_payload->'block'->>'id', '')::uuid;
    current_topic_id := nullif(question_payload->'topic'->>'id', '')::uuid;

    if current_block_id is null and nullif(question_payload->'block'->>'name', '') is not null then
      insert into public.question_blocks (name)
      values (question_payload->'block'->>'name')
      on conflict (name) do update set name = excluded.name
      returning id into current_block_id;
    end if;

    if current_topic_id is null and current_block_id is not null and nullif(question_payload->'topic'->>'name', '') is not null then
      insert into public.question_topics (block_id, name)
      values (current_block_id, question_payload->'topic'->>'name')
      on conflict (block_id, name) do update set name = excluded.name
      returning id into current_topic_id;
    end if;

    insert into public.scheduled_tryout_event_questions (
      id,
      event_id,
      sort_order,
      stem,
      question_image_path,
      explanation_text,
      explanation_image_path,
      block_id,
      topic_id,
      correct_option_key
    )
    values (
      coalesce(nullif(question_payload->>'id', '')::uuid, gen_random_uuid()),
      saved_event.id,
      next_question_order,
      question_payload->>'stem',
      question_payload->>'questionImagePath',
      question_payload->>'explanationText',
      question_payload->>'explanationImagePath',
      current_block_id,
      current_topic_id,
      question_payload->>'correctOptionKey'
    )
    on conflict (id) do update
    set
      sort_order = excluded.sort_order,
      stem = excluded.stem,
      question_image_path = excluded.question_image_path,
      explanation_text = excluded.explanation_text,
      explanation_image_path = excluded.explanation_image_path,
      block_id = excluded.block_id,
      topic_id = excluded.topic_id,
      correct_option_key = excluded.correct_option_key
    returning id
    into current_question_id;

    if jsonb_array_length(coalesce(question_payload->'options', '[]'::jsonb)) > 0 then
      delete from public.scheduled_tryout_event_question_options
      where question_id = current_question_id;

      insert into public.scheduled_tryout_event_question_options (
        question_id,
        option_key,
        option_text,
        sort_order
      )
      select
        current_question_id,
        option_item->>'key',
        option_item->>'text',
        (row_number() over (order by (select null)))
      from jsonb_array_elements(question_payload->'options') as option_item;
    end if;
  end loop;

  update public.scheduled_tryout_events
  set total_questions = next_question_order
  where id = saved_event.id;
  saved_event.total_questions := next_question_order;

  return saved_event;
end;
$$;
