-- Private profile photos. Names and the object path live in Supabase Auth user_metadata.
begin;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', false, 524288, array['image/jpeg'])
on conflict (id) do nothing;

do $$
begin
  if exists (select 1 from storage.buckets where id = 'profile-avatars'
    and (public or file_size_limit is distinct from 524288::bigint or allowed_mime_types is distinct from array['image/jpeg'])) then
    raise exception 'Existing profile-avatars bucket has a different configuration; review it before migrating.';
  end if;
end $$;

create policy "profile_avatars_read_own" on storage.objects for select to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "profile_avatars_insert_own" on storage.objects for insert to authenticated
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "profile_avatars_delete_own" on storage.objects for delete to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
commit;
