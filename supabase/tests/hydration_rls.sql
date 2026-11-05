begin;
do $$
declare a uuid := gen_random_uuid(); b uuid := gen_random_uuid(); affected integer;
  base jsonb := '{"version":1,"goalMl":1500,"days":{"2026-11-04":[{"id":"test-entry","ml":200,"at":"2026-11-04T12:00:00.000Z"}]}}';
begin
  insert into auth.users(id,email,aud,role) values
    (a,a::text || '@example.invalid','authenticated','authenticated'),
    (b,b::text || '@example.invalid','authenticated','authenticated');
  perform set_config('request.jwt.claim.sub',a::text,true);
  set local role authenticated;
  insert into public.hydration_profiles(user_id,payload) values(a,base);
  if not exists(select 1 from public.hydration_profiles where user_id=a and payload=base and revision=0) then raise exception 'Owner read failed'; end if;
  update public.hydration_profiles set payload=jsonb_set(payload,'{goalMl}','2000') where user_id=a and revision=0;
  if not exists(select 1 from public.hydration_profiles where user_id=a and revision=1 and payload->>'goalMl'='2000') then raise exception 'Owner CAS update failed'; end if;
  update public.hydration_profiles set payload=base where user_id=a and revision=0;
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Stale revision overwrote data'; end if;
  begin
    update public.hydration_profiles set payload='{"version":1,"goalMl":-1,"days":{}}' where user_id=a;
    raise exception 'Invalid goal accepted';
  exception when check_violation then null; end;
  begin
    update public.hydration_profiles set revision=100 where user_id=a;
    raise exception 'Revision can be forged';
  exception when insufficient_privilege then null; end;
  begin
    update public.hydration_profiles set user_id=b where user_id=a;
    raise exception 'Owner can be reassigned';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub',b::text,true);
  if exists(select 1 from public.hydration_profiles where user_id=a) then raise exception 'Cross-owner read allowed'; end if;
  update public.hydration_profiles set payload=base where user_id=a;
  get diagnostics affected=row_count;
  if affected<>0 then raise exception 'Cross-owner update allowed'; end if;
  begin
    insert into public.hydration_profiles(user_id,payload) values(a,base);
    raise exception 'Cross-owner insert allowed';
  exception when insufficient_privilege then null; end;
  reset role;
  set local role anon;
  begin
    perform 1 from public.hydration_profiles;
    raise exception 'Anonymous read allowed';
  exception when insufficient_privilege then null; end;
  reset role;
end $$;
select 'PASS: owner persistence, CAS, validation, account isolation and anonymous access' as result;
rollback;
