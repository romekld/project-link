# Project LINK Setup And Contributing Guide

This guide is for contributors setting up `project-link/` after cloning the repository and for existing contributors working on new changes.

## 1. Read This First

- Run commands from `project-link/`, not from the repo root.
- The primary project context lives in [../../AGENTS.md](../../AGENTS.md).
- Current implementation progress lives in [PLANS/project-status.md](PLANS/project-status.md).
- `apps/web` is the main active surface today. `apps/api` exists as a minimal FastAPI scaffold.

## 2. Recommended Prerequisites

- `git`
- Node.js 20 LTS or newer
- `pnpm` `9.15.9` or compatible with the root `packageManager` field
- Optional: Python 3.12+ if you need to run `apps/api`
- Optional: Docker Desktop + Supabase CLI if you are working on DB migrations or local Supabase services

## 3. Clone And Install

```bash
git clone <repo-url>
cd capstone/project-link
pnpm install
```

If `pnpm` is not installed:

```bash
npm install -g pnpm
```

## 4. Environment Setup

The repo includes a root sample env file: [.env.example](../.env.example).

1. Copy the root env template if you need Supabase CLI variables for database work.
2. Create `apps/web/.env.local` for the Next.js app.
3. Put the web app variables below into `apps/web/.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_api_key
```

Root-only variables from `.env.example`:

```env
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
SUPABASE_PROJECT_REF=your_supabase_project_ref
SUPABASE_DATABASE_PASSWORD=your_password
```

Notes:

- Never commit `.env`, `.env.local`, service-role keys, or production credentials.
- `SUPABASE_SERVICE_ROLE_KEY` is sensitive. Use it only for trusted local/admin workflows.
- The web app will not boot correctly without the Supabase URL and anon key.

## 5. Run The Project

### Web app

Recommended for most contributors:

```bash
pnpm --filter web dev
```

Open `http://localhost:3000`.

Common alternatives:

```bash
pnpm dev
pnpm --filter web build
```

### API scaffold

Only needed when working on `apps/api`:

```bash
cd apps/api
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Default API health route:

- `http://localhost:8000/`

## 6. Supabase Workflow

There are two realistic contributor paths right now:

### Standard contributor path

- Point `apps/web/.env.local` at the shared dev Supabase project.
- Use this for most UI, routing, auth, and dashboard work.

### Database contributor path

- Use `packages/supabase/` when editing SQL migrations or local DB config.
- Install Supabase CLI and Docker Desktop first.

Important current limitation:

- `packages/supabase/config.toml` references `./seed.sql`, but that file is not present in the repo today.
- Do not assume `supabase db reset` is turnkey until that seed path is fixed or documented by the team.

If you are doing migration work, validate the intended workflow with the current maintainer before relying on local reset/seed automation.

## 7. First Admin Account

There is a seed script for the first local admin account:

File:

- [../apps/web/scripts/seed-admin.mjs](../apps/web/scripts/seed-admin.mjs)

Run it from `apps/web/` after `apps/web/.env.local` is configured:

```bash
cd apps/web
node scripts/seed-admin.mjs
```

What it needs:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

What it does:

- Creates a `system_admin` auth user
- Inserts the matching `profiles` row
- Marks `must_change_password = true`

## 8. Before You Commit

Run the baseline checks from `project-link/`:

```bash
pnpm lint
pnpm check-types
```

If you changed the web app heavily, also run:

```bash
pnpm --filter web build
```

## 9. Contribution Rules For This Repo

- Keep changes scoped. Avoid mixing docs, refactors, and feature work unless they are directly related.
- Respect the locked stack in [../../AGENTS.md](../../AGENTS.md): Next.js 16 App Router, shadcn/ui, Tailwind v4, Supabase, FastAPI.
- Default to Server Components in `apps/web`; add `"use client"` only when necessary.
- Do not bypass RLS assumptions with ad hoc privileged patterns.
- Do not hard-delete clinical data.
- Do not log PII.
- Preserve exact DOH/FHSIS terminology in clinical fields and reports.

## 10. Recommended Docs To Check Before Editing

- [../../AGENTS.md](../../AGENTS.md)
- [PLANS/project-status.md](PLANS/project-status.md)
- [PLANS/frontend-architecture-agent-reference.md](PLANS/frontend-architecture-agent-reference.md)
- [PLANS/shadcn-admin-to-web-migration-checklist.md](PLANS/shadcn-admin-to-web-migration-checklist.md)

## 11. Current Reality Check

This repo is not fully normalized yet. A few bootstrapped files and partial scaffolds still exist.

That means contributors should prefer:

- the actual package scripts over old boilerplate readmes
- the docs in `docs/PLANS/` over assumptions
- small, verifiable changes over broad cleanup passes
