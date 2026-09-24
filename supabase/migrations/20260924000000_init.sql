create extension if not exists pgcrypto;
create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', type text not null check(type in ('pdf','image','video','audio','text','other')), file_url text, thumbnail_url text, file_size bigint, mime_type text, category text not null default 'Général', tags text[] not null default '{}', views bigint not null default 0, downloads bigint not null default 0, telegram_message_id bigint not null, telegram_chat_id bigint not null, created_at timestamptz not null default now(), is_visible boolean not null default true, constraint posts_telegram_unique unique(telegram_chat_id,telegram_message_id)
);
create index if not exists posts_public_date_idx on public.posts (created_at desc) where is_visible;
create index if not exists posts_category_idx on public.posts(category);
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.posts enable row level security;
alter table public.admins enable row level security;
revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert,update,delete on public.posts to authenticated;
create policy "Public visible posts" on public.posts for select to anon using (is_visible);
create policy "Authenticated visible or admin" on public.posts for select to authenticated using (is_visible or exists(select 1 from public.admins where user_id=(select auth.uid())));
create policy "Admins insert" on public.posts for insert to authenticated with check (exists(select 1 from public.admins where user_id=(select auth.uid())));
create policy "Admins update" on public.posts for update to authenticated using (exists(select 1 from public.admins where user_id=(select auth.uid()))) with check (exists(select 1 from public.admins where user_id=(select auth.uid())));
create policy "Admins delete" on public.posts for delete to authenticated using (exists(select 1 from public.admins where user_id=(select auth.uid())));
grant select on public.admins to authenticated;
create policy "Admin can read own membership" on public.admins for select to authenticated using (user_id=(select auth.uid()));
create or replace function public.increment_post_counter(post_id uuid,counter text) returns void language plpgsql security definer set search_path = '' as $$ begin if counter='views' then update public.posts set views=views+1 where id=post_id and is_visible; elsif counter='downloads' then update public.posts set downloads=downloads+1 where id=post_id and is_visible; else raise exception 'Invalid counter'; end if; end $$;
revoke all on function public.increment_post_counter(uuid,text) from public; grant execute on function public.increment_post_counter(uuid,text) to anon,authenticated;
insert into storage.buckets(id,name,public) values('content','content',true) on conflict(id) do update set public=true;
create policy "Public content download" on storage.objects for select to anon,authenticated using(bucket_id='content');
do $$ begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='posts') then alter publication supabase_realtime add table public.posts; end if; end $$;
