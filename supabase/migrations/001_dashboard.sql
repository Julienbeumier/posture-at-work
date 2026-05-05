-- PostureAtWork — Migration 001 : Dashboard & Daily Check-ins
-- Run this in your Supabase SQL editor

-- ── assessments ────────────────────────────────────────────────────────────────
create table if not exists assessments (
  id           uuid         default gen_random_uuid() primary key,
  user_id      uuid         references auth.users(id) on delete cascade,
  email        text,
  created_at   timestamptz  default now(),
  scores       jsonb        not null,
  answers      jsonb        not null,
  video_analysis jsonb,
  global_score integer      not null
);

-- ── daily_checkins ────────────────────────────────────────────────────────────
create table if not exists daily_checkins (
  id              uuid    default gen_random_uuid() primary key,
  user_id         uuid    references auth.users(id) on delete cascade,
  date            date    default current_date,
  exercises_done  boolean default false,
  water_goal_met  boolean default false,
  breaks_taken    integer default 0,
  pain_level      integer default 0,
  created_at      timestamptz default now(),
  unique(user_id, date)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table assessments    enable row level security;
alter table daily_checkins enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Users see own assessments"    on assessments;
drop policy if exists "Users see own checkins"       on daily_checkins;

create policy "Users see own assessments" on assessments
  for all using (auth.uid() = user_id);

create policy "Users see own checkins" on daily_checkins
  for all using (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists assessments_user_created
  on assessments(user_id, created_at desc);

create index if not exists checkins_user_date
  on daily_checkins(user_id, date desc);
