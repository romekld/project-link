# Global Rule: Shadcn-First UI Policy (All Agents)

Applies to every agent working in this repository.

## 1) Default To shadcn/ui First

- Always prioritize shadcn components over custom UI primitives.
- Do not hand-build primitive replacements when a shadcn component exists (`Button`, `Input`, `Select`, `Dialog`, `Sheet`, `Drawer`, `Table`, `Tabs`, `Alert`, `Badge`, `Skeleton`, etc.).
- Compose existing shadcn components before creating custom markup.
- Prefer semantic variants and design tokens over hardcoded visual styles.

## 2) Required shadcn Workflow

For any UI task in `frontend/`, follow this order:

1. `npx shadcn@latest info --json` to confirm project config and installed components.
2. `npx shadcn@latest search` to discover existing components first.
3. `npx shadcn@latest docs <component>` before implementation.
4. `npx shadcn@latest add <component>` for installation or updates.

Additional enforcement:

- Never paste third-party UI primitives directly without adapting them to the local shadcn setup.
- Never bypass shadcn by building a custom primitive first.
- If a dedicated shadcn MCP endpoint is unavailable, use the shadcn CLI workflow above as the required fallback.

## 3) Mandatory Skill Stack For UI Work

When an agent handles frontend, design system, or PWA UI tasks, it must use these skills:

- `D:\project-link\.agents\skills\shadcn\SKILL.md`
- `D:\project-link\.agents\skills\tailwindcss-mobile-first\SKILL.md`
- `D:\project-link\.agents\skills\frontend-design\SKILL.md`
- `D:\project-link\.agents\skills\ui-ux-pro-max\SKILL.md`
- `D:\project-link\.agents\skills\vercel-react-best-practices\SKILL.md`

Execution priority:

1. `shadcn` (component choice and composition)
2. `tailwindcss-mobile-first` (responsive implementation)
3. `frontend-design` + `ui-ux-pro-max` (visual quality and UX clarity)
4. `vercel-react-best-practices` (React performance and rendering quality)

## 4) BHW PWA Mobile-First Requirements (Non-Negotiable)

- Start with unprefixed mobile utilities, then enhance upward with `sm:`, `md:`, `lg:`.
- Minimum interactive touch target: `44x44px`; keep adequate spacing between actions.
- No hover-only critical interactions.
- No horizontal scrolling on mobile.
- Prefer `min-h-dvh` for full-height mobile layouts.
- Keep forms field-friendly for one-handed use and field conditions.
- Always expose sync/offline state clearly for BHW workflows.
- Maintain clear, persistent status badges for clinical record states where applicable.

## 5) Accessibility And Clinical UX Safety

- Overlay components must include proper titles (`DialogTitle`, `SheetTitle`, `DrawerTitle`) even when visually hidden.
- Keep focus states visible and keyboard navigation intact.
- Separate high-risk/destructive actions from primary actions and require explicit confirmation for irreversible changes.
- Use precise, clinically clear labels and validation messages.

## 6) Project-Specific Frontend Constraints

- Respect current shadcn setup: `style: base-nova`, `base: base`, `iconLibrary: lucide`.
- Use Tailwind v4 CSS-first approach; keep tokens in `frontend/src/index.css`.
- Do not introduce `tailwind.config.js`.
- Use `@/` alias for internal imports.

## 7) Escalation Rule

- If a needed UI pattern is not found, search registries and compose from available shadcn components first.
- Only create custom UI as a last resort, and it must still match shadcn semantics, accessibility, and token usage.
