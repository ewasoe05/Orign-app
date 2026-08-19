<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single product: the **Two-Year Goal Dashboard**, a Next.js 16 (App Router) app that talks directly to a **Supabase** stack (Postgres + Auth). There is no separate backend and no automated test suite. Standard scripts live in `package.json` (`dev`, `build`, `lint`, `start`); local Supabase config is `supabase/config.toml` and schema is in `supabase/migrations/`.

The startup update script runs `npm install`, so dependencies are ready on boot. Docker and the Supabase CLI are preinstalled in the base image but their services are NOT auto-started. To run the app end to end:

1. Start the Docker daemon (needed by the local Supabase stack; it does not auto-start): `sudo dockerd` in a background/tmux session, then confirm with `sudo docker info`.
2. Start Supabase from the repo root: `sudo supabase start` (first boot after a fresh image re-pulls containers). Get local URL/keys with `sudo supabase status -o env`.
3. Create `.env.local` (gitignored) with `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` and `NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY from status>`.
4. `npm run dev` → http://localhost:3000.

Key gotchas:
- **Auth gate:** `src/middleware.ts` redirects every non-auth route to `/login`. Sign up at `/signup` to get in — email confirmation is disabled and `ALLOWED_EMAIL` is unset, so signup is open and immediately logs you in. Signup/sign-in seeds debt/fitness/plan data automatically.
- **Table permissions (important):** the migrations enable RLS and create policies but rely on Supabase's legacy auto-expose behaviour for role GRANTs. Newer Supabase CLI defaults to NOT exposing new tables, which yields Postgres error `42501` (insufficient_privilege) and a "The dashboard could not load" page. `supabase/config.toml` sets `auto_expose_new_tables = true` to fix this. If you edit migrations or need a clean DB, re-apply with `sudo supabase db reset` (this also wipes auth users).
- `npm run lint` has one pre-existing error in `src/components/fitness/workout-form.tsx` (`react-hooks/set-state-in-effect`) unrelated to setup; `npm run build` succeeds.
- `next dev`/`next build` warn that the `middleware` file convention is deprecated in favor of `proxy`; this is only a warning and the app runs fine.
