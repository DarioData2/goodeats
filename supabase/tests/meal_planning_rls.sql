begin;
do $$
declare a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); affected integer;
begin
  insert into auth.users(id, email, aud, role) values
    (a, a::text || '@example.invalid', 'authenticated', 'authenticated'),
    (b, b::text || '@example.invalid', 'authenticated', 'authenticated');
  perform set_config('request.jwt.claim.sub', a::text, true);
  set local role authenticated;
  insert into public.weekly_menus values (a, '2026-10-12', '[["","Pan",""],["","",""],["","",""],["","",""],["","",""],["","",""],["","",""]]');
  insert into public.daily_recipes values (a, '2026-10-14', 'Pan', 'Harina', 'Hornear');
  update public.daily_recipes set title = 'Pan integral' where user_id = a;
  update public.weekly_menus set meals = meals where user_id = a;
  insert into public.daily_recipes values (a, '2026-10-14', 'Pan actualizado', 'Harina', 'Hornear')
    on conflict (user_id, recipe_date) do update set steps = excluded.steps;
  if (select count(*) from public.weekly_menus where user_id = a) <> 1 or
     not exists(select 1 from public.daily_recipes where user_id = a and title = 'Pan integral') then
    raise exception 'Owner CRUD failed';
  end if;
  begin
    insert into public.weekly_menus values (a, '2026-10-19', '[[],[],[],[],[],[],[]]');
    raise exception 'Invalid menu accepted';
  exception when check_violation then null; end;
  perform set_config('request.jwt.claim.sub', b::text, true);
  if exists(select 1 from public.weekly_menus where user_id = a) or exists(select 1 from public.daily_recipes where user_id = a) then
    raise exception 'Cross-account read allowed';
  end if;
  update public.weekly_menus set meals = meals where user_id = a;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-account menu update allowed'; end if;
  update public.daily_recipes set title = 'Forbidden' where user_id = a;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-account recipe update allowed'; end if;
  begin
    insert into public.daily_recipes values (a, '2026-10-15', 'Forbidden', '', '');
    raise exception 'Cross-account recipe insert allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.weekly_menus values (a, '2026-10-19', '[["","",""],["","",""],["","",""],["","",""],["","",""],["","",""],["","",""]]');
    raise exception 'Cross-account menu insert allowed';
  exception when insufficient_privilege then null; end;
  reset role;
  set local role anon;
  begin
    perform 1 from public.weekly_menus;
    raise exception 'Anonymous menus access allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from public.daily_recipes;
    raise exception 'Anonymous recipes access allowed';
  exception when insufficient_privilege then null; end;
  reset role;
end $$;
select 'PASS: propietarios, aislamiento entre cuentas y bloqueo anónimo' as result;
rollback;
