# Project LINK

Project LINK (Local Information Network for Kalusugan) is the monorepo for the CHO II health station management system.

Start here after cloning:

- Setup and contribution guide: [docs/setup-and-contributing.md](docs/setup-and-contributing.md)
- Current implementation status: [docs/PLANS/project-status.md](docs/PLANS/project-status.md)
- Frontend architecture reference: [docs/PLANS/frontend-architecture-agent-reference.md](docs/PLANS/frontend-architecture-agent-reference.md)
- Product and system context: [../AGENTS.md](../AGENTS.md)

## Monorepo

```text
project-link/
  apps/
    web/        Next.js 16 internal dashboard + BHW PWA
    api/        FastAPI scaffold
  packages/
    supabase/   Supabase config and SQL migrations
```

## Core Commands

Run these from `project-link/`:

```bash
pnpm install
pnpm --filter web dev
pnpm lint
pnpm check-types
```
