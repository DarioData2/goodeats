begin;
create function public.goodeats_valid_hydration(value jsonb) returns boolean
language plpgsql immutable strict set search_path = '' as $$
declare day_key text; entries jsonb; entry jsonb; goal numeric; amount numeric;
begin
  if jsonb_typeof(value) <> 'object' or not (value ?& array['version','goalMl','days']) then return false; end if;
  if value->'version' <> '1'::jsonb or jsonb_typeof(value->'days') <> 'object' then return false; end if;
  if jsonb_typeof(value->'goalMl') <> 'null' then
    if jsonb_typeof(value->'goalMl') <> 'number' then return false; end if;
    goal := (value->>'goalMl')::numeric;
    if goal < 1 or goal > 10000 or trunc(goal) <> goal then return false; end if;
  end if;
  for day_key, entries in select * from jsonb_each(value->'days') loop
    if day_key !~ '^\d{4}-\d{2}-\d{2}$' or (day_key::date)::text <> day_key then return false; end if;
    if jsonb_typeof(entries) <> 'array' then return false; end if;
    if jsonb_array_length(entries) > 1000 then return false; end if;
    if exists(select 1 from jsonb_array_elements(entries) e group by e->>'id' having count(*) > 1) then return false; end if;
    for entry in select jsonb_array_elements(entries) loop
      if jsonb_typeof(entry) <> 'object' or not (entry ?& array['id','ml','at']) then return false; end if;
      if jsonb_typeof(entry->'id') <> 'string' or length(entry->>'id') not between 1 and 128 then return false; end if;
      if jsonb_typeof(entry->'ml') <> 'number' or jsonb_typeof(entry->'at') <> 'string' then return false; end if;
      amount := (entry->>'ml')::numeric;
      if amount < 1 or amount > 10000 or trunc(amount) <> amount then return false; end if;
      if (entry->>'at') !~ '^\d{4}-\d{2}-\d{2}T' then return false; end if;
      perform (entry->>'at')::timestamptz;
    end loop;
  end loop;
  return true;
exception when others then return false;
end $$;
create table public.hydration_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (octet_length(payload::text) <= 1048576 and public.goodeats_valid_hydration(payload)),
  revision bigint not null default 0 check (revision between 0 and 9007199254740991),
  updated_at timestamptz not null default now()
);
create function public.goodeats_hydration_revision() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.revision := old.revision + 1;
  new.updated_at := now();
  return new;
end $$;
create trigger hydration_revision before update on public.hydration_profiles
for each row execute function public.goodeats_hydration_revision();
alter table public.hydration_profiles enable row level security;
revoke all on public.hydration_profiles from anon, authenticated;
grant select on public.hydration_profiles to authenticated;
grant insert(user_id, payload), update(payload) on public.hydration_profiles to authenticated;
create policy hydration_read_own on public.hydration_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy hydration_insert_own on public.hydration_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy hydration_update_own on public.hydration_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on function public.goodeats_valid_hydration(jsonb) from public, anon;
grant execute on function public.goodeats_valid_hydration(jsonb) to authenticated;
revoke all on function public.goodeats_hydration_revision() from public, anon, authenticated;
commit;
