begin;

-- RLS is already enabled. Keep existing write policies and limit reading to owners.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public'
      and tablename = 'shopping_items' and policyname = 'GoodEats owners read items'
  ) then
    create policy "GoodEats owners read items" on public.shopping_items
      for select to authenticated using (
        exists (select 1 from public.shopping_lists
          where shopping_lists.id = shopping_items.shopping_list_id
            and shopping_lists.user_id = (select auth.uid()))
      );
  end if;
end $$;

create or replace function public.goodeats_touch_shopping_item()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger
    where tgrelid = 'public.shopping_items'::regclass
      and tgname = 'goodeats_touch_shopping_item' and not tgisinternal) then
    create trigger goodeats_touch_shopping_item before update on public.shopping_items
      for each row execute function public.goodeats_touch_shopping_item();
  end if;
end $$;

commit;
