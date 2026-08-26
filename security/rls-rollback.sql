-- ═══════════════════════════════════════════════════════════════════════════
-- THECONTENTHUB V2 — EMERGENCY ROLLBACK for security/rls.sql
--
-- Run this only if enabling RLS locked the team out of their own data and you
-- need them working again inside the next minute. It reopens the database to
-- anyone holding the anon key, so treat it as buying time, not as a fix —
-- find the wrong policy, correct rls.sql, and run that again.
--
-- Before reaching for this, check the cheaper explanation first: an expired
-- session sends a stale JWT, which reads as "no rows" rather than as an
-- error. Have the person sign out and back in.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.workspaces           disable row level security;
alter table public.workspace_members    disable row level security;
alter table public.profiles             disable row level security;
alter table public.agency_clients       disable row level security;
alter table public.agency_videos        disable row level security;
alter table public.agency_targets       disable row level security;
alter table public.agency_card_notes    disable row level security;
alter table public.creators             disable row level security;
alter table public.creator_lists        disable row level security;
alter table public.creator_list_members disable row level security;

-- The V1 leftovers are not reopened. Nothing in src/ reads them, so nothing
-- can be broken by their staying shut. Uncomment only if that changes.
-- alter table public.clients   disable row level security;
-- alter table public.employees disable row level security;
-- alter table public.videos    disable row level security;
-- alter table public.cards     disable row level security;
-- alter table public.targets   disable row level security;

select c.relname, c.relrowsecurity as rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relname;
