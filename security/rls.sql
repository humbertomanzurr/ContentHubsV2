-- ═══════════════════════════════════════════════════════════════════════════
-- THECONTENTHUB V2 (shvbedzlxkqfvrsvarzl) — ROW LEVEL SECURITY
--
-- Before this file runs, every table in this database is readable AND
-- writable by anyone on the internet holding the anon key, which ships in
-- plain sight inside the app's JavaScript bundle. That key is meant to be
-- public; RLS is the thing that was supposed to be standing behind it.
--
-- Run the whole file at once in the Supabase SQL Editor. It is idempotent —
-- running it twice is harmless. To undo, run security/rls-rollback.sql.
--
-- Every policy below was written against the actual queries in src/, not
-- against a guess at the schema. The queries each one exists to permit are
-- named in the comments so the next person can tell whether a change is safe.
-- ═══════════════════════════════════════════════════════════════════════════


-- ── HELPERS ────────────────────────────────────────────────────────────────
-- These are SECURITY DEFINER on purpose. A policy on workspace_members that
-- queries workspace_members recurses infinitely and takes the whole table
-- down with it. Running the lookup as the definer skips RLS inside the
-- function body, which breaks the cycle. search_path is pinned so the
-- elevated body can't be redirected at a shadowed table.

create or replace function public.user_workspace_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id from workspace_members where user_id = auth.uid()
  union
  -- An owner without a members row is still an agency. getWorkspaceMember()
  -- in lib/supabase.jsx falls back to workspaces.owner_id for exactly this
  -- case, so the policies have to agree with it.
  select id from workspaces where owner_id = auth.uid()
$$;

create or replace function public.is_workspace_admin(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from workspace_members
    where workspace_id = ws and user_id = auth.uid() and role = 'admin'
  ) or exists (
    select 1 from workspaces where id = ws and owner_id = auth.uid()
  )
$$;

-- Used by the profiles policies. Settings.jsx joins profiles onto the member
-- list to turn uuids into names, so "self only" would show the team as a
-- column of uuids.
create or replace function public.shares_workspace_with(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target = auth.uid() or exists (
    select 1 from workspace_members m
    where m.user_id = target
      and m.workspace_id in (
        select workspace_id from workspace_members where user_id = auth.uid()
      )
  )
$$;

revoke all on function public.user_workspace_ids()      from anon;
revoke all on function public.is_workspace_admin(uuid)  from anon;
revoke all on function public.shares_workspace_with(uuid) from anon;


-- ── WORKSPACES ─────────────────────────────────────────────────────────────
alter table public.workspaces enable row level security;

drop policy if exists ws_select on public.workspaces;
create policy ws_select on public.workspaces
  for select to authenticated
  using (id in (select public.user_workspace_ids()));

-- createWorkspace() in lib/supabase.jsx — a new agency makes its own.
drop policy if exists ws_insert on public.workspaces;
create policy ws_insert on public.workspaces
  for insert to authenticated
  with check (owner_id = auth.uid());

-- Settings.jsx:299 renames the workspace. Admins only — otherwise any member
-- can rename the agency out from under everyone.
drop policy if exists ws_update on public.workspaces;
create policy ws_update on public.workspaces
  for update to authenticated
  using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));

-- No delete policy: nothing in the app deletes a workspace, so nothing may.


-- ── WORKSPACE_MEMBERS ──────────────────────────────────────────────────────
-- This table is the one that decides who sees what, which makes write access
-- to it equivalent to write access to everything. Reads are open to the team;
-- writes are admin-only. Without this, any member could PATCH their own row
-- to role='admin'.
alter table public.workspace_members enable row level security;

drop policy if exists wm_select on public.workspace_members;
create policy wm_select on public.workspace_members
  for select to authenticated
  using (workspace_id in (select public.user_workspace_ids()));

-- Settings.jsx:60 (admin adds a teammate) and createWorkspace() (a brand-new
-- owner adds themselves — is_workspace_admin() returns true via the owner
-- branch, since the workspace row is inserted first).
drop policy if exists wm_insert on public.workspace_members;
create policy wm_insert on public.workspace_members
  for insert to authenticated
  with check (public.is_workspace_admin(workspace_id));

drop policy if exists wm_update on public.workspace_members;
create policy wm_update on public.workspace_members
  for update to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

-- Settings.jsx:189 removes access. Note that call filters on user_id ALONE,
-- with no workspace_id — harmless here because this database has one
-- workspace, but this policy is what stops it reaching into another one.
drop policy if exists wm_delete on public.workspace_members;
create policy wm_delete on public.workspace_members
  for delete to authenticated
  using (public.is_workspace_admin(workspace_id));


-- ── PROFILES ───────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists pr_select on public.profiles;
create policy pr_select on public.profiles
  for select to authenticated
  using (public.shares_workspace_with(id));

-- Landing.jsx:20 creates your own row on first sign-in. Settings.jsx:59
-- creates one for a teammate the admin just signed up. An INSERT can't
-- overwrite an existing profile — the primary key stops it — so allowing an
-- admin to insert is not a way to clobber somebody else's row.
drop policy if exists pr_insert on public.profiles;
create policy pr_insert on public.profiles
  for insert to authenticated
  with check (
    id = auth.uid()
    or exists (select 1 from workspace_members
               where user_id = auth.uid() and role = 'admin')
  );

-- Settings.jsx:220 (admin edits a teammate's display name) and :314 (you edit
-- your own). Updating a stranger's profile is not permitted.
drop policy if exists pr_update on public.profiles;
create policy pr_update on public.profiles
  for update to authenticated
  using (public.shares_workspace_with(id))
  with check (public.shares_workspace_with(id));


-- ── AGENCY DATA ────────────────────────────────────────────────────────────
-- All four tables carry workspace_id and are loaded filtered by it in
-- Agency.jsx:893-895. The policy says the same thing the query already says,
-- which is why turning it on changes nothing a legitimate user can see.

alter table public.agency_clients enable row level security;
drop policy if exists ac_all on public.agency_clients;
create policy ac_all on public.agency_clients
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

alter table public.agency_videos enable row level security;
drop policy if exists av_all on public.agency_videos;
create policy av_all on public.agency_videos
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

alter table public.agency_targets enable row level security;
drop policy if exists at_all on public.agency_targets;
create policy at_all on public.agency_targets
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

-- Review-room notes. getNotes()/addNote() in lib/supabase.jsx already scope
-- by workspace_id.
alter table public.agency_card_notes enable row level security;
drop policy if exists an_all on public.agency_card_notes;
create policy an_all on public.agency_card_notes
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));


-- ── CREATOR HUB ────────────────────────────────────────────────────────────
alter table public.creators enable row level security;
drop policy if exists cr_all on public.creators;
create policy cr_all on public.creators
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

alter table public.creator_lists enable row level security;
drop policy if exists cl_all on public.creator_lists;
create policy cl_all on public.creator_lists
  for all to authenticated
  using (workspace_id in (select public.user_workspace_ids()))
  with check (workspace_id in (select public.user_workspace_ids()));

-- creator_list_members is the only table here with no workspace_id of its
-- own — it's a join table of (list_id, creator_id, status, added_at). It
-- inherits its tenancy from the list it belongs to.
alter table public.creator_list_members enable row level security;
drop policy if exists clm_all on public.creator_list_members;
create policy clm_all on public.creator_list_members
  for all to authenticated
  using (exists (
    select 1 from creator_lists l
    where l.id = creator_list_members.list_id
      and l.workspace_id in (select public.user_workspace_ids())
  ))
  with check (exists (
    select 1 from creator_lists l
    where l.id = creator_list_members.list_id
      and l.workspace_id in (select public.user_workspace_ids())
  ));


-- ── LEGACY V1 TABLES ───────────────────────────────────────────────────────
-- clients / employees / videos / cards / targets are the original V1 schema
-- and the one setup.sql still describes. Nothing in src/ reads or writes them
-- any more — the app moved to the agency_* tables — but they still hold 182
-- rows of real client, staff and performance data, currently world-readable.
--
-- RLS on with no policy at all: the rows are preserved and become
-- unreachable through the API. If something turns out to need them, the fix
-- is to add a policy, not to turn this back off.
alter table public.clients   enable row level security;
alter table public.employees enable row level security;
alter table public.videos    enable row level security;
alter table public.cards     enable row level security;
alter table public.targets   enable row level security;


-- ── LOCK OUT THE ANONYMOUS ROLE ────────────────────────────────────────────
-- Belt and braces. RLS alone leaves a stranger's request returning an empty
-- list, which is correct but indistinguishable from a table that is simply
-- empty — and a table added later with no policy would be wide open again
-- without anyone noticing.
--
-- Revoking the grants makes an anonymous request fail outright instead, and
-- the DEFAULT PRIVILEGES line carries that forward to tables that don't
-- exist yet. Nothing in src/ touches the database before sign-in, so no
-- legitimate request is made as anon. Sign-in itself goes through
-- /auth/v1/, not PostgREST, and is unaffected.
revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables    from anon;
alter default privileges in schema public revoke all on sequences from anon;


-- ── VERIFY ─────────────────────────────────────────────────────────────────
-- Every row must read rls = true. Anything false is still exposed.
select c.relname as table_name,
       c.relrowsecurity as rls,
       count(p.polname) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public' and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relrowsecurity, c.relname;
