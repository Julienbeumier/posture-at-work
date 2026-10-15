-- Tables manquantes (features qui échouaient silencieusement) + suivi des actions RH.
-- À exécuter dans Supabase → SQL Editor. Idempotent.

-- ── Retours utilisateurs ────────────────────────────────────────────────
create table if not exists public.feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  nps integer check (nps >= 0 and nps <= 10),
  score_questionnaire integer check (score_questionnaire between 1 and 5),
  score_recommandations integer check (score_recommandations between 1 and 5),
  score_video integer check (score_video between 1 and 5),
  score_exercices integer check (score_exercices between 1 and 5),
  commentaire text,
  created_at timestamptz default now()
);
alter table public.feedback enable row level security;
drop policy if exists "Users insert own feedback" on public.feedback;
create policy "Users insert own feedback" on public.feedback
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users see own feedback" on public.feedback;
create policy "Users see own feedback" on public.feedback
  for select to authenticated using ((select auth.uid()) = user_id);

-- ── Séances d'exercices ─────────────────────────────────────────────────
create table if not exists public.exercise_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  program_id text not null,
  exercises_completed text[] not null,
  duration_seconds integer not null,
  created_at timestamptz default now()
);
create index if not exists exercise_sessions_user_idx on public.exercise_sessions(user_id);
alter table public.exercise_sessions enable row level security;
drop policy if exists "Users own sessions" on public.exercise_sessions;
create policy "Users own sessions" on public.exercise_sessions
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ── Badges ──────────────────────────────────────────────────────────────
create table if not exists public.badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz default now(),
  unique (user_id, badge_id)
);
alter table public.badges enable row level security;
drop policy if exists "Users own badges" on public.badges;
create policy "Users own badges" on public.badges
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ── Notifications push (écrites côté serveur, clé service) ─────────────
create table if not exists public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  subscription text not null,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;

-- ── Séquence d'emails (serveur uniquement) ──────────────────────────────
create table if not exists public.email_sequences (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  firstname text,
  scores jsonb,
  sequence_step integer default 1,
  last_sent_at timestamptz default now(),
  next_send_at timestamptz,
  unsubscribed boolean default false,
  created_at timestamptz default now()
);
create index if not exists email_sequences_next_send_idx on public.email_sequences(next_send_at);
alter table public.email_sequences enable row level security;
revoke all on public.email_sequences from anon, authenticated;

-- ── Suivi des actions RH ────────────────────────────────────────────────
create table if not exists public.company_actions (
  id uuid default gen_random_uuid() primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  notes text check (notes is null or char_length(notes) <= 1000),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  owner text check (owner is null or char_length(owner) <= 100),
  due_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists company_actions_company_idx on public.company_actions(company_id);
alter table public.company_actions enable row level security;
drop policy if exists "Admins manage company actions" on public.company_actions;
create policy "Admins manage company actions" on public.company_actions
  for all to authenticated
  using (private.is_company_admin(company_id))
  with check (private.is_company_admin(company_id));
revoke all on public.company_actions from anon;
grant select, insert, update, delete on public.company_actions to authenticated;
