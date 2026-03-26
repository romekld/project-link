# Changelog

All notable changes to Project LINK are documented here.

---

## [Unreleased]

### Added — TG8: CI/CD Pipeline & Vercel Configuration (2026-03-27)
- `.github/workflows/frontend-ci.yml`: type-check (`tsc --noEmit`), ESLint, and Vitest unit tests on every push/PR that touches `frontend/`.
- `.github/workflows/backend-ci.yml`: `pytest` via `uv run` on every push/PR that touches `backend/`.
- `.github/workflows/playwright.yml`: Playwright E2E workflow updated — PRs run against local Vite dev server; pushes to `main` run against Vercel production (`https://project-link-cho2.vercel.app`).
- `vercel.json`: explicit Vercel build configuration (`rootDirectory: frontend`, framework: `vite`, `ignoreCommand` to skip unchanged frontend builds).
- `frontend/package.json`: added `vitest ^3.1.1` and `@vitest/coverage-v8 ^3.1.1` to devDependencies; added `"test": "vitest run"` script.
- `frontend/vite.config.ts`: added `test` block with `jsdom` environment, `v8` coverage provider, and `setupFiles` pointing to `src/test/setup.ts`.
- `frontend/src/test/setup.ts`: Vitest global test setup file.
- `e2e/playwright.config.ts`: updated with `baseURL` from `PLAYWRIGHT_BASE_URL` env var, `webServer` block for local Vite dev server, mobile viewport projects (Pixel 5, iPhone 12), `screenshot: 'only-on-failure'`, and `github` reporter.

### Changed
- `docs/project_status.md`: updated to reflect TG8 completion and Vercel connection status.

---

## [0.1.0] — Phase 0 Scaffold — 2026-03-26

### Added
- Monorepo scaffold: `frontend/`, `backend/`, `e2e/`, `docs/`.
- `CLAUDE.md` with full project conventions, architecture overview, and compliance rules.
- `project_spec.md` with complete product requirements, user flows, DB schema, and phased roadmap.
- `brainstorm.md` as original working context reference.
- React 19 + TypeScript + Vite 8 frontend initialized with Tailwind CSS v4 and shadcn/ui base-vega.
- FastAPI backend stub with `pyproject.toml` and `uv.lock`.
- `docker-compose.yml` for local full-stack orchestration.
- Playwright E2E project initialized under `e2e/`.
- Vercel project `project-link` connected to GitHub repo; auto-deploys `frontend/` on push to `main`. Production at `https://project-link-cho2.vercel.app`.
