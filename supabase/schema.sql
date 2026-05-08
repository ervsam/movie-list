-- Run this in the Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

create table if not exists movies (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  category   text not null,
  year       int,
  rating     numeric(3,1),
  poster_url text,
  tmdb_id    int,
  created_at timestamptz default now() not null
);

create table if not exists categories (
  name      text not null,
  user_id   uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (name, user_id)
);

-- Index for fast per-user queries
create index if not exists movies_user_id_idx on movies (user_id);

-- Row-level security: each user can only see and modify their own data
alter table movies enable row level security;
alter table categories enable row level security;

create policy "users_own_movies" on movies
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users_own_categories" on categories
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
