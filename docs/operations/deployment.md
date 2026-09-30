# Yogapedia Deployment

## Environments

Use separate Supabase projects for development and production. Never copy production participant data into development. Keep `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in local `.env.local` and Vercel environment settings, never Git.

## Supabase

1. Create the project in the Seoul or nearest available region.
2. Keep Data API enabled, disable automatic exposure of new tables, and enable automatic RLS.
3. Link with `pnpm exec supabase link --project-ref <ref>`.
4. Review and apply migrations with `pnpm exec supabase db push`.
5. Run `pnpm exec supabase test db` and verify every application table has RLS.
6. Add Vercel production and preview callback URLs to Auth redirect URLs.

Confirm the database backup before a migration. Roll back by restoring the backup or adding a forward corrective migration; never edit an applied migration.

## GitHub and Vercel

1. Create a private GitHub repository and add it as `origin`.
2. Push this branch, review CI, and merge to protected `main`.
3. Import the GitHub repository in Vercel with the Next.js preset.
4. Add production Supabase variables to Production and development variables to Preview/Development.
5. Deploy `main`, check `/api/health`, and rehearse the public application flow.

Production approval requires a passing RLS test, no tracked `.env` files, a successful backup check, and role-by-role access rehearsal.
