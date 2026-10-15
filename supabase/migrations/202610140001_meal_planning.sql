begin;
create function public.goodeats_valid_menu(value jsonb) returns boolean
language plpgsql immutable strict set search_path = '' as $$
declare day jsonb; meal jsonb;
begin
  if jsonb_typeof(value) <> 'array' then return false; end if;
  if jsonb_array_length(value) <> 7 then return false; end if;
  for day in select jsonb_array_elements(value) loop
    if jsonb_typeof(day) <> 'array' then return false; end if;
    if jsonb_array_length(day) <> 3 then return false; end if;
    for meal in select jsonb_array_elements(day) loop
      if jsonb_typeof(meal) <> 'string' or length(meal #>> '{}') > 240 then return false; end if;
    end loop;
  end loop;
  return true;
end $$;
create table public.weekly_menus (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null check (extract(isodow from week_start) = 1),
  meals jsonb not null check (public.goodeats_valid_menu(meals)),
  primary key (user_id, week_start)
);
create table public.daily_recipes (
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_date date not null,
  title text not null default '' check (length(title) <= 120),
  ingredients text not null default '' check (length(ingredients) <= 4000),
  steps text not null default '' check (length(steps) <= 6000),
  check (length(trim(title)) > 0 or (ingredients = '' and steps = '')),
  primary key (user_id, recipe_date)
);
alter table public.weekly_menus enable row level security;
alter table public.daily_recipes enable row level security;
revoke all on public.weekly_menus, public.daily_recipes from anon, authenticated;
grant select, insert, update on public.weekly_menus, public.daily_recipes to authenticated;
create policy menus_read on public.weekly_menus for select to authenticated using ((select auth.uid()) = user_id);
create policy menus_insert on public.weekly_menus for insert to authenticated with check ((select auth.uid()) = user_id);
create policy menus_update on public.weekly_menus for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy recipes_read on public.daily_recipes for select to authenticated using ((select auth.uid()) = user_id);
create policy recipes_insert on public.daily_recipes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy recipes_update on public.daily_recipes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
commit;
