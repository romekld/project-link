# `apps/web` Recovery Map

Use this as the rebuild guide for recreating the missing `apps/web` structure before restoring file contents from VS Code Timeline.

## VS Code Explorer View

```text
apps/
└─ web/
   ├─ .env.local
   ├─ .gitignore
   ├─ AGENTS.md
   ├─ CLAUDE.md
   ├─ components.json
   ├─ eslint.config.mjs
   ├─ middleware.ts
   ├─ next-env.d.ts
   ├─ next.config.ts
   ├─ package.json
   ├─ postcss.config.mjs
   ├─ README.md
   ├─ tsconfig.json
   ├─ app/
   │  ├─ globals.css
   │  ├─ layout.tsx
   │  ├─ page.tsx
   │  ├─ (auth)/
   │  │  ├─ change-password/
   │  │  │  └─ page.tsx
   │  │  ├─ forgot-password/
   │  │  │  └─ page.tsx
   │  │  └─ login/
   │  │     └─ page.tsx
   │  ├─ (dashboard)/
   │  │  ├─ layout.tsx
   │  │  ├─ admin/
   │  │  │  ├─ dashboard/
   │  │  │  │  └─ page.tsx
   │  │  │  └─ users/
   │  │  │     ├─ page.tsx
   │  │  │     ├─ [id]/
   │  │  │     └─ new/
   │  │  ├─ bhw/
   │  │  │  └─ dashboard/
   │  │  │     └─ ... (other files/folders)
   │  │  ├─ cho/
   │  │  │  └─ dashboard/
   │  │  ├─ phn/
   │  │  │  └─ dashboard/
   │  │  └─ rhm/
   │  │     └─ dashboard/
   │  ├─ dashboard/
   │  │  └─ page.tsx
   │  └─ login/
   ├─ components/
   │  ├─ app-sidebar.tsx
   │  ├─ config-drawer.tsx
   │  ├─ dashboard-breadcrumbs.tsx
   │  ├─ dashboard-header-actions.tsx
   │  ├─ dashboard-header.tsx
   │  ├─ header-profile-menu.tsx
   │  ├─ login-form.tsx
   │  ├─ nav-main.tsx
   │  ├─ nav-projects.tsx
   │  ├─ nav-user.tsx
   │  ├─ page-header.tsx
   │  ├─ team-switcher.tsx
   │  ├─ theme-provider.tsx
   │  ├─ theme-switch.tsx
   │  ├─ data-table/
   │  │  ├─ bulk-actions.tsx
   │  │  ├─ column-header.tsx
   │  │  ├─ faceted-filter.tsx
   │  │  ├─ index.ts
   │  │  ├─ pagination.tsx
   │  │  ├─ toolbar.tsx
   │  │  └─ view-options.tsx
   │  └─ ui/
   │     ├─ alert-dialog.tsx
   │     ├─ alert.tsx
   │     ├─ avatar.tsx
   │     ├─ badge.tsx
   │     ├─ breadcrumb.tsx
   │     ├─ button.tsx
   │     ├─ calendar.tsx
   │     ├─ card.tsx
   │     ├─ checkbox.tsx
   │     ├─ collapsible.tsx
   │     ├─ combobox.tsx
   │     ├─ command.tsx
   │     ├─ dialog.tsx
   │     ├─ dropdown-menu.tsx
   │     ├─ field.tsx
   │     ├─ input-group.tsx
   │     ├─ input.tsx
   │     ├─ label.tsx
   │     ├─ popover.tsx
   │     ├─ scroll-area.tsx
   │     ├─ select.tsx
   │     ├─ separator.tsx
   │     ├─ sheet.tsx
   │     ├─ sidebar.tsx
   │     ├─ skeleton.tsx
   │     ├─ switch.tsx
   │     ├─ table.tsx
   │     ├─ textarea.tsx
   │     └─ tooltip.tsx
   ├─ features/
   │  ├─ admin/
   │  │  ├─ dashboard/
   │  │  │  ├─ index.tsx
   │  │  │  └─ components/
   │  │  └─ users/
   │  │     ├─ actions.ts
   │  │     ├─ index.tsx
   │  │     ├─ queries.ts
   │  │     ├─ components/
   │  │     ├─ data/
   │  │     └─ user-editor/
   │  └─ auth/
   │     ├─ change-password/
   │     │  ├─ actions.ts
   │     │  ├─ index.ts
   │     │  └─ must-change-password-dialog.tsx
   │     └─ login/
   │        ├─ actions.ts
   │        ├─ index.tsx
   │        ├─ components/
   │        └─ data/
   ├─ hooks/
   │  └─ use-mobile.ts
   ├─ lib/
   │  ├─ utils.ts
   │  ├─ location/
   │  │  ├─ constants.ts
   │  │  ├─ index.ts
   │  │  ├─ README.md
   │  │  ├─ selectors.ts
   │  │  ├─ types.ts
   │  │  └─ data/
   │  │     ├─ psgc-cities-municipalities.json
   │  │     └─ psgc-provinces.json
   │  └─ supabase/
   │     ├─ admin.ts
   │     ├─ client.ts
   │     ├─ database.types.ts
   │     ├─ middleware.ts
   │     └─ server.ts
   ├─ public/
   └─ scripts/
      └─ seed-admin.mjs
```

## Recovery Notes

- Recreate the folders and empty files at these exact paths first.
- After recreating a file, open it in VS Code and use `Timeline` to restore earlier content.
- Prioritize custom app files first: `app/`, `features/`, and top-level `components/`.
- Restore `components/ui/` later if needed, since many of those can often be regenerated.
