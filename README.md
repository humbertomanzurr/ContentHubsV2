# TheContentHub — REVO Labs

The agency portal REVO Labs uses daily. Vite + React, Supabase over plain
`fetch`, deployed on Vercel at thecontenthubs.com.

## Credentials

Never commit one. This file used to carry the admin email and password in
plain text, in a public repository, across 182 commits — so that password has
to be treated as public forever, no matter what this file says now. It has
been rotated; the replacement lives in the team's password manager.

Removing a secret from the current commit does not remove it from the
history. Rotating it is what actually ends the exposure.

## Security

`security/rls.sql` is the row-level security policy set for this database.
Every table is protected by it. If you add a table, add its policy in the
same commit — a table with no policy is a table anyone on the internet can
read and write, because the anon key that reaches it ships inside the
JavaScript bundle by design.

`security/rls-rollback.sql` reopens the database in an emergency. It is a way
to buy an hour, not a fix.

To check the current state at any time:

```sql
select c.relname, c.relrowsecurity as rls, count(p.polname) as policies
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy p on p.polrelid = c.oid
where n.nspname = 'public' and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relrowsecurity, c.relname;
```

## Schema

`setup.sql` describes the **original V1 schema** — `clients`, `employees`,
`videos`, `cards`, `targets`. The app no longer uses any of it. The live
schema is the `agency_*` and `workspace*` tables, which were created by hand
in the Supabase dashboard and are not described by any file in this repo.
`security/rls.sql` is currently the closest thing to an accurate record of
which tables exist.

## Local development

```bash
npm install
npm run dev
```

## Deploy

Auto-deploys from GitHub via Vercel on push to `main`. `OPTIMIZATION` is the
staging branch and builds to a Vercel preview — nine people use `main` daily,
so changes go there first.

Vercel needs `ANTHROPIC_API_KEY` set for the `api/chat.js` serverless
function.
