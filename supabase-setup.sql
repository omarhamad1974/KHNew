-- KHIP client area: run ONCE in Supabase > SQL Editor > New query > paste > Run.
-- Safe to run again later: every statement is idempotent.
--
-- Before you run it, create your own admin login:
--   Authentication > Users > Add user > Create new user (tick "Auto Confirm User").
-- Then put that email in step 5 below.

-- 1. PRIVATE bucket for client files (50 MB per file is the free-plan ceiling)
insert into storage.buckets (id, name, public, file_size_limit)
values ('client-files', 'client-files', false, 52428800)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

-- 2. Who is an admin?
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- SECURITY DEFINER so the check works inside policies without recursion.
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins see the admin list" on public.admins;
create policy "Admins see the admin list"
on public.admins for select to authenticated
using (public.is_admin());
-- No insert/update/delete policies: admins are added from this SQL editor only.

-- 3. Clients: read ONLY inside the folder named after their own email (lowercase)
drop policy if exists "Users read their own folder" on storage.objects;
create policy "Users read their own folder"
on storage.objects for select to authenticated
using (
  bucket_id = 'client-files'
  and (storage.foldername(name))[1] = lower(auth.jwt() ->> 'email')
);

-- 4. Admins: full control of the bucket (upload, list, replace, delete)
drop policy if exists "Admins read all client files" on storage.objects;
create policy "Admins read all client files"
on storage.objects for select to authenticated
using (bucket_id = 'client-files' and public.is_admin());

drop policy if exists "Admins upload client files" on storage.objects;
create policy "Admins upload client files"
on storage.objects for insert to authenticated
with check (bucket_id = 'client-files' and public.is_admin());

drop policy if exists "Admins update client files" on storage.objects;
create policy "Admins update client files"
on storage.objects for update to authenticated
using (bucket_id = 'client-files' and public.is_admin())
with check (bucket_id = 'client-files' and public.is_admin());

drop policy if exists "Admins delete client files" on storage.objects;
create policy "Admins delete client files"
on storage.objects for delete to authenticated
using (bucket_id = 'client-files' and public.is_admin());

-- 5. Make yourself the first admin (change the email, then run the whole script)
insert into public.admins (user_id, email)
select id, email from auth.users
where lower(email) = lower('YOU@YOUR-DOMAIN.COM')
on conflict (user_id) do nothing;

-- Check: this should return one row with your email.
select * from public.admins;
