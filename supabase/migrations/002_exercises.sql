create table if not exists exercise_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  program_id text not null,
  exercises_completed text[] not null,
  duration_seconds integer not null,
  created_at timestamptz default now()
);

create table if not exists badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz default now()
);

alter table exercise_sessions enable row level security;
alter table badges enable row level security;
alter table push_subscriptions enable row level security;

create policy "Users own sessions" on exercise_sessions
  for all using (auth.uid() = user_id);
create policy "Users own badges" on badges
  for all using (auth.uid() = user_id);
create policy "Users own subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id);
