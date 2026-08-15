create extension if not exists "pgcrypto";

create type movie_status as enum ('draft', 'published');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  original_title text not null default '',
  year integer not null default extract(year from now())::integer,
  genres text[] not null default '{}',
  rating numeric(3,1) not null default 0,
  runtime text not null default '',
  age_rating text not null default 'PG',
  director text not null default '',
  cast text[] not null default '{}',
  description text not null default '',
  poster_url text not null default '',
  backdrop_url text not null default '',
  trailer_length text not null default '',
  featured boolean not null default false,
  trending boolean not null default false,
  progress integer,
  status movie_status not null default 'draft',
  price_mnt integer not null default 0,
  playback_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.movie_videos (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  provider text not null default 'external',
  provider_asset_id text,
  playback_url text,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id uuid not null references public.movies(id) on delete cascade,
  stripe_payment_intent_id text,
  amount_mnt integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status subscription_status not null default 'incomplete',
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.watch_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id uuid not null references public.movies(id) on delete cascade,
  position_seconds integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

alter table public.profiles enable row level security;
alter table public.movies enable row level security;
alter table public.movie_videos enable row level security;
alter table public.purchases enable row level security;
alter table public.subscriptions enable row level security;
alter table public.watch_progress enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create policy "published movies are readable"
on public.movies for select
using (status = 'published' or public.is_admin());

create policy "admins manage movies"
on public.movies for all
using (public.is_admin())
with check (public.is_admin());

create policy "users read own profile"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "users update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "admins update profiles"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

create policy "admins manage videos"
on public.movie_videos for all
using (public.is_admin())
with check (public.is_admin());

create policy "users read own purchases"
on public.purchases for select
using (user_id = auth.uid() or public.is_admin());

create policy "users read own subscriptions"
on public.subscriptions for select
using (user_id = auth.uid() or public.is_admin());

create policy "users manage own watch progress"
on public.watch_progress for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'viewer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
