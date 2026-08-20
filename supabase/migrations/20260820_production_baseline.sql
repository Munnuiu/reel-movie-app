-- Run this once in the Supabase SQL Editor for an existing REEL project.
-- It is safe to run after supabase/schema.sql and does not delete movie data.

create index if not exists movies_status_created_at_idx
  on public.movies (status, created_at desc);
create index if not exists movies_featured_idx
  on public.movies (featured) where featured = true;
create index if not exists movies_trending_idx
  on public.movies (trending) where trending = true;
create index if not exists movie_videos_movie_id_idx
  on public.movie_videos (movie_id);
create index if not exists purchases_user_id_idx
  on public.purchases (user_id);
create index if not exists watch_progress_user_id_idx
  on public.watch_progress (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists movies_set_updated_at on public.movies;
create trigger movies_set_updated_at
before update on public.movies
for each row execute function public.set_updated_at();

-- SECURITY DEFINER prevents an RLS recursion when the function is evaluated
-- inside a policy on public.profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id uuid not null references public.movies(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

create index if not exists user_favorites_user_id_idx
  on public.user_favorites (user_id, created_at desc);

alter table public.user_favorites enable row level security;

drop policy if exists "users read own favorites" on public.user_favorites;
create policy "users read own favorites"
on public.user_favorites for select
using (user_id = auth.uid());

drop policy if exists "users manage own favorites" on public.user_favorites;
create policy "users manage own favorites"
on public.user_favorites for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
