# Global Rule: Shadcn-Admin Modular Feature Development

Applies to every agent building or editing React / Next.js feature screens in this repository, especially under `project-link/apps/web/`.

## 1) Copy The `shadcn-admin` Feature Pattern

Use `project-link/apps/shadcn-admin/src/features/` as the canonical implementation style for new feature work.

Reference example:

- `project-link/apps/shadcn-admin/src/features/users/index.tsx`
- `project-link/apps/shadcn-admin/src/features/users/components/`
- `project-link/apps/shadcn-admin/src/features/users/data/`

Agents must mirror this style instead of building large route files or page files with all logic inline.

## 2) `index.tsx` Is A Scaffold, Not A Dumping Ground

The feature `index.tsx` file must stay thin and focused on composition.

Allowed responsibilities in `index.tsx`:

- import the feature-local building blocks
- wire page-level scaffolding and layout structure
- connect route/search/navigation hooks
- pass props into extracted child components
- render top-level providers and dialog groups

Do not keep these in `index.tsx` unless there is a very small and clear reason:

- large table definitions
- dialog implementations
- form implementations
- column definitions
- action menus
- heavy state logic
- domain helpers
- mock or seed data
- long inline JSX sections that should be their own component

If `index.tsx` starts becoming crowded, agents must stop and extract modules before continuing.

## 3) Required Feature Folder Shape

When building a feature, prefer a structure like this:

```text
feature-name/
  index.tsx
  components/
  data/
```

Expand only when needed, but preserve the same modular mindset:

- `components/` for UI parts, dialogs, tables, toolbars, providers, and action blocks
- `data/` for schemas, column configs, static data, feature-local types, and data shaping helpers
- feature-local hooks or utilities should live beside the feature, not be stuffed into `index.tsx`

## 4) Extraction Rule

Agents must extract code into feature-local modules when any of the following appear:

- repeated UI blocks
- more than one dialog or overlay in a screen
- table configuration or column definitions
- provider or context setup
- form logic or validation schemas
- route-driven filtering, sorting, or pagination helpers
- screen sections that can be named cleanly as standalone components

Default bias: extract sooner, not later.

## 5) Modularity Expectations

- Keep components small and single-purpose
- Prefer named exports
- Keep state close to where it is used
- Extract reusable feature logic into custom hooks or focused helper modules when it is shared
- Favor feature-local composition over oversized shared abstractions
- Do not create a bloated page just because the screen still "works"

## 6) Mandatory Skill Requirement

For any React / Next.js screen, feature, or component work that follows this rule, agents must use:

- `C:\Users\jerom\.codex\plugins\cache\openai-curated\vercel\fb0a18376bcd9f2604047fbe7459ec5aed70c64b\skills\react-best-practices\SKILL.md`

This skill is required to review:

- component structure
- hooks usage
- state placement
- accessibility
- performance
- TypeScript patterns

## 7) Enforcement For `apps/web`

For `project-link/apps/web/`, agents must prefer:

- feature-level composition that matches `shadcn-admin`
- thin route/page entry files
- extracted components for major screen regions
- extracted dialog groups instead of inline modal trees
- extracted table modules instead of large in-file table setups

Agents must not deliver a bloated `index.tsx`, `page.tsx`, or route component when the `shadcn-admin` modular pattern can be followed.
