-- Run after the avatar migration. All fixtures roll back; no real user photos are read.
rollback;
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
insert into storage.objects (bucket_id, name) values ('profile-avatars', '11111111-1111-4111-8111-111111111111/profile-rls-test.jpg');
do $$ begin
  begin
    insert into storage.objects (bucket_id, name) values ('profile-avatars', '22222222-2222-4222-8222-222222222222/profile-rls-test.jpg');
    raise exception 'FAIL: cross-account insert allowed';
  exception when insufficient_privilege then null;
  end;
  if (select count(*) from storage.objects where bucket_id = 'profile-avatars' and name = '11111111-1111-4111-8111-111111111111/profile-rls-test.jpg') <> 1 then
    raise exception 'FAIL: own photo not visible';
  end if;
end $$;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
do $$ begin
  if exists (select 1 from storage.objects where bucket_id = 'profile-avatars' and name = '11111111-1111-4111-8111-111111111111/profile-rls-test.jpg') then
    raise exception 'FAIL: other account can read photo';
  end if;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  if exists (select 1 from storage.objects where bucket_id = 'profile-avatars' and name = '11111111-1111-4111-8111-111111111111/profile-rls-test.jpg') then
    raise exception 'FAIL: anonymous read allowed';
  end if;
end $$;
-- Storage protects DELETE statements even when no rows match; never bypass that guard.
-- Deletion is covered in service mocks through the Storage API, not direct SQL.
select 'PASS: own insert/read, cross-account insert/read denied, anonymous read denied' as result;
rollback;
