-- PAW — durcissement RLS (à exécuter dans Supabase > SQL Editor, projet wmgglwymkbprfiounhxq)
-- Prérequis : le code déployé (commit 245b0fe ou plus récent) passe déjà par les routes API serveur.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_company_member(cid uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (select 1 from public.company_memberships m
                 where m.company_id = cid and m.user_id = (select auth.uid()));
$$;
create or replace function private.is_company_admin(cid uuid)
returns boolean language sql security definer stable set search_path = '' as $$
  select exists (select 1 from public.company_memberships m
                 where m.company_id = cid and m.user_id = (select auth.uid()) and m.role = 'admin');
$$;
revoke all on function private.is_company_member(uuid) from public, anon;
revoke all on function private.is_company_admin(uuid) from public, anon;
grant execute on function private.is_company_member(uuid) to authenticated;
grant execute on function private.is_company_admin(uuid) to authenticated;

-- 1) Suppression des policies dangereuses (accès public total / écritures non contrôlées)
drop policy if exists "Service role manages admin_invites" on public.admin_invites;
drop policy if exists "Service role manages signals" on public.signals;
drop policy if exists "Users can insert own signals" on public.signals;
drop policy if exists "Service role manages signals" on public.company_signals;
drop policy if exists "Employees insert signals" on public.company_signals;
drop policy if exists "Service role manages purchases" on public.purchases;
drop policy if exists "Users can read own purchases" on public.purchases;
drop policy if exists "Service role manages sessions" on public.video_sessions;
drop policy if exists "Anyone can read valid sessions" on public.video_sessions;
drop policy if exists "Invites lisibles par tous" on public.company_invites;
drop policy if exists "Authenticated users créent des invites" on public.company_invites;
drop policy if exists "Companies insert" on public.companies;
drop policy if exists "Companies select" on public.companies;
drop policy if exists "Companies update" on public.companies;
drop policy if exists "Authenticated users peuvent rejoindre" on public.company_memberships;
drop policy if exists "Users gèrent leurs memberships" on public.company_memberships;
drop policy if exists "Users own profile" on public.profiles;
drop policy if exists "Users see own assessments" on public.assessments;
drop policy if exists "Users see own checkins" on public.daily_checkins;

-- 2) Politiques minimales (les écritures sensibles passent par les routes API / clé service)
create policy "Membres lisent leurs memberships" on public.company_memberships
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Membres lisent leur entreprise" on public.companies
  for select to authenticated using (private.is_company_member(id));
create policy "Profil : lecture du sien" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Bilans : accès aux siens" on public.assessments
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and (company_id is null or private.is_company_member(company_id)));
create policy "Check-ins : accès aux siens" on public.daily_checkins
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Achats : lecture des siens" on public.purchases
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Signalements : les membres en créent" on public.signals
  for insert to authenticated with check (private.is_company_member(company_id));
create policy "Signalements : lus par les admins de l'entreprise" on public.signals
  for select to authenticated using (private.is_company_admin(company_id));
-- admin_invites, company_invites, company_signals, video_sessions : aucune policy = accès uniquement via la clé service

-- 3) Plus d'accès anonyme aux tables (supprime aussi l'exposition GraphQL anonyme)
revoke all on public.admin_invites, public.assessments, public.companies, public.company_invites,
  public.company_memberships, public.company_signals, public.daily_checkins, public.profiles,
  public.purchases, public.signals, public.video_sessions from anon;

-- 4) Index sur les clés étrangères
create index if not exists idx_admin_invites_company_id on public.admin_invites(company_id);
create index if not exists idx_company_invites_company_id on public.company_invites(company_id);
create index if not exists idx_company_invites_used_by on public.company_invites(used_by);
create index if not exists idx_company_memberships_user_id on public.company_memberships(user_id);
create index if not exists idx_company_memberships_company_id on public.company_memberships(company_id);
create index if not exists idx_company_signals_company_id on public.company_signals(company_id);
create index if not exists idx_purchases_user_id on public.purchases(user_id);
create index if not exists idx_signals_company_id on public.signals(company_id);
create index if not exists idx_video_sessions_assessment_id on public.video_sessions(assessment_id);
create index if not exists idx_video_sessions_user_id on public.video_sessions(user_id);
create index if not exists idx_assessments_user_id on public.assessments(user_id);
create index if not exists idx_assessments_company_id on public.assessments(company_id);
