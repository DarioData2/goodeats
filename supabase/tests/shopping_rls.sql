-- Disposable fixtures exist only within this transaction; no credentials are created.
begin;
do $$
declare
  user_a uuid := gen_random_uuid();
  user_b uuid := gen_random_uuid();
  list_a uuid := gen_random_uuid();
  list_b uuid := gen_random_uuid();
  item_a uuid := gen_random_uuid();
  item_b uuid := gen_random_uuid();
  affected integer;
begin
  insert into auth.users(id, email, aud, role) values
    (user_a, user_a::text || '@example.invalid', 'authenticated', 'authenticated'),
    (user_b, user_b::text || '@example.invalid', 'authenticated', 'authenticated');

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  set local role authenticated;
  insert into public.shopping_lists(id, user_id, name) values (list_a, user_a, 'GoodEats RLS test A');
  insert into public.shopping_items(id, shopping_list_id, name, quantity, unit)
    values (item_a, list_a, 'Producto de prueba A', 2, 'unidad');
  if (select count(*) from public.shopping_items where id = item_a) <> 1 then
    raise exception 'Owner cannot read inserted item';
  end if;
  update public.shopping_items set quantity = null, unit = null, purchased = true where id = item_a;
  if not exists (select 1 from public.shopping_items where id = item_a
    and quantity is null and unit is null and purchased and updated_at is not null) then
    raise exception 'Owner cannot edit or mark item';
  end if;

  perform set_config('request.jwt.claim.sub', user_b::text, true);
  if exists (select 1 from public.shopping_lists where id = list_a)
    or exists (select 1 from public.shopping_items where id = item_a) then
    raise exception 'Cross-user read is allowed';
  end if;
  update public.shopping_items set name = 'Forbidden' where id = item_a;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-user update is allowed'; end if;
  delete from public.shopping_items where id = item_a;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-user delete is allowed'; end if;
  begin
    insert into public.shopping_items(shopping_list_id, name) values (list_a, 'Forbidden');
    raise exception 'Cross-user insert is allowed';
  exception when insufficient_privilege then null;
  end;
  insert into public.shopping_lists(id, user_id, name) values (list_b, user_b, 'GoodEats RLS test B');
  insert into public.shopping_items(id, shopping_list_id, name) values (item_b, list_b, 'Producto de prueba B');
  perform set_config('request.jwt.claim.sub', user_a::text, true);
  if exists (select 1 from public.shopping_items where id = item_b) then
    raise exception 'Cross-user item B is visible';
  end if;
  -- Purchased cleanup must not remove pending items or another user's items.
  delete from public.shopping_items where shopping_list_id = list_a and purchased = true;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Owner cannot clear purchased items'; end if;
  perform set_config('request.jwt.claim.sub', user_b::text, true);
  if not exists (select 1 from public.shopping_items where id = item_b and purchased = false) then
    raise exception 'Cleanup removed another users item';
  end if;
  delete from public.shopping_items where id = item_b;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Owner cannot delete item'; end if;
  reset role;
  perform set_config('request.jwt.claim.sub', '', true);
  set local role anon;
  if exists (select 1 from public.shopping_lists where id in (list_a, list_b)) then
    raise exception 'Anonymous reads are allowed';
  end if;
  reset role;
end $$;
rollback;
select 'PASS: owner CRUD, purchased cleanup, cross-user isolation and anonymous access; all fixtures rolled back' as result;
