-- Run once in Supabase: SQL Editor > New query > paste > Run

-- 1. A PRIVATE bucket for client files
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do nothing;

-- 2. Signed-in users may only read files inside the folder named after their own email (lowercase)
create policy "Users read their own folder"
on storage.objects for select to authenticated
using (
  bucket_id = 'client-files'
  and (storage.foldername(name))[1] = lower(auth.jwt() ->> 'email')
);
-- No insert/update/delete policies: only you (dashboard) can upload or remove files.
