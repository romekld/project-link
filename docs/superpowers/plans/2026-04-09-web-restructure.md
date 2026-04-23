# apps/web Restructure — Role-Namespace Routing

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the complete Next.js folder structure for the role-namespaced internal dashboard — all routes, layouts, shell wrappers, and feature scaffolds. No auth, no Supabase, no UI. Layouts are passthrough. Pages are stubs. This gives a clean, buildable skeleton that auth and UI plans can layer into.

**Architecture:** Four URL-namespaced route tiers (`/bhw/*`, `/clinical/*`, `/oversight/*`, `/admin/*`), each with its own `layout.tsx` and a dedicated shell component in `components/shells/`. Feature directories under `features/` hold domain type contracts and mock data only.

**Tech Stack:** Next.js 16 (App Router), TypeScript 5 strict, Vitest (type tests only), pnpm

**What is deferred (separate plans):**
- Supabase clients + auth wiring — `2026-04-09-auth.md`
- Login page UI and shell navigation UI — UI phase plan

---

## ⚠️ Before You Start

**Read the Next.js 16 docs before touching any route files.**

```bash
cat apps/web/node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
```

**Critical breaking change confirmed:** `params` in Server Component pages is `Promise<{...}>` — always `await params`.

**Working directory for all commands:** `apps/web/`

---

## File Map

```
apps/web/
  vitest.config.ts                          NEW
  vitest.setup.ts                           NEW
  app/
    manifest.ts                             NEW  ← PWA, Next.js-native
    layout.tsx                              MODIFY metadata only
    page.tsx                                REPLACE → redirect to /login
    (auth)/
      layout.tsx                            NEW  ← passthrough
      login/page.tsx                        NEW  ← stub only
    bhw/
      layout.tsx                            NEW  ← renders BHWShell
      dashboard/page.tsx                    NEW  ← stub
      patients/page.tsx                     NEW
      patients/[id]/page.tsx                NEW
      forms/page.tsx                        NEW
      forms/[program]/page.tsx              NEW
      alerts/page.tsx                       NEW
    clinical/
      layout.tsx                            NEW
      dashboard/page.tsx                    NEW
      patients/page.tsx                     NEW
      patients/[id]/page.tsx                NEW
      forms/page.tsx                        NEW
      forms/[program]/page.tsx              NEW
      reports/page.tsx                      NEW
      inventory/page.tsx                    NEW
    oversight/
      layout.tsx                            NEW
      dashboard/page.tsx                    NEW
      reports/page.tsx                      NEW
      gis/page.tsx                          NEW
      alerts/page.tsx                       NEW
    admin/
      layout.tsx                            NEW
      users/page.tsx                        NEW
      settings/page.tsx                     NEW
  components/
    ui/                                     KEEP (shadcn, untouched)
    shells/
      bhw-shell.tsx                         NEW  ← passthrough div
      clinical-shell.tsx                    NEW
      oversight-shell.tsx                   NEW
      admin-shell.tsx                       NEW
  features/
    patients/types/index.ts                 NEW
    patients/mock/data.ts                   NEW
    forms/types/index.ts                    NEW
    forms/mock/data.ts                      NEW
    reports/types/index.ts                  NEW
    reports/mock/data.ts                    NEW
    gis/types/index.ts                      NEW
    gis/mock/data.ts                        NEW
    alerts/types/index.ts                   NEW
    alerts/mock/data.ts                     NEW
    inventory/types/index.ts                NEW
    inventory/mock/data.ts                  NEW
    dashboard/types/index.ts                NEW
    dashboard/mock/data.ts                  NEW
  lib/
    utils.ts                                KEEP
  types/
    roles.ts                                NEW
    roles.test.ts                           NEW
    index.ts                                NEW
  package.json                              MODIFY scripts + devDeps
```

**Not created in this plan** (deferred to auth plan):
`middleware.ts`, `lib/supabase/`, `lib/auth.ts`, `hooks/use-session.ts`

---

## Task 1: Vitest Setup

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/vitest.setup.ts`

- [ ] **Step 1: Install Vitest dev deps**

```bash
cd apps/web && pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Expected: packages added to `devDependencies`.

- [ ] **Step 2: Add test scripts to `apps/web/package.json`**

Add to `"scripts"`:
```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 3: Create `apps/web/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 4: Create `apps/web/vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Verify Vitest runs**

```bash
cd apps/web && pnpm test:run
```

Expected: `No test files found` — zero failures.

- [ ] **Step 6: Commit**

```bash
cd apps/web && git add vitest.config.ts vitest.setup.ts package.json pnpm-lock.yaml
git commit -m "chore: add Vitest"
```

---

## Task 2: Role Types + Tests

**Files:**
- Create: `apps/web/types/roles.ts`
- Create: `apps/web/types/roles.test.ts`
- Create: `apps/web/types/index.ts`

- [ ] **Step 1: Write the failing tests — `apps/web/types/roles.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { isRole, ROLE_HOME, ROLE_TIER, TIER_PATHS, ROLES } from './roles'

describe('isRole', () => {
  it('returns true for every valid role', () => {
    for (const role of ROLES) {
      expect(isRole(role)).toBe(true)
    }
  })
  it('returns false for unknown string', () => {
    expect(isRole('superuser')).toBe(false)
  })
  it('returns false for null / undefined / number', () => {
    expect(isRole(null)).toBe(false)
    expect(isRole(undefined)).toBe(false)
    expect(isRole(42)).toBe(false)
  })
})

describe('ROLE_HOME', () => {
  it('maps every role to a path starting with /', () => {
    for (const role of ROLES) {
      expect(ROLE_HOME[role]).toMatch(/^\//)
    }
  })
  it('bhw home is /bhw/dashboard', () => {
    expect(ROLE_HOME.bhw).toBe('/bhw/dashboard')
  })
  it('cho home is /oversight/dashboard', () => {
    expect(ROLE_HOME.cho).toBe('/oversight/dashboard')
  })
  it('rhm and phn share the same clinical home', () => {
    expect(ROLE_HOME.rhm).toBe(ROLE_HOME.phn)
  })
})

describe('ROLE_TIER', () => {
  it('bhw → bhw tier', () => expect(ROLE_TIER.bhw).toBe('bhw'))
  it('phn and rhm → clinical tier', () => {
    expect(ROLE_TIER.phn).toBe('clinical')
    expect(ROLE_TIER.rhm).toBe('clinical')
  })
  it('cho → oversight tier', () => {
    expect(ROLE_TIER.cho).toBe('oversight')
  })
  it('system_admin → admin tier', () => {
    expect(ROLE_TIER.system_admin).toBe('admin')
  })
})

describe('TIER_PATHS', () => {
  it('each tier maps to the correct prefix', () => {
    expect(TIER_PATHS.bhw).toBe('/bhw')
    expect(TIER_PATHS.clinical).toBe('/clinical')
    expect(TIER_PATHS.oversight).toBe('/oversight')
    expect(TIER_PATHS.admin).toBe('/admin')
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd apps/web && pnpm test:run
```

Expected: FAIL — `Cannot find module './roles'`

- [ ] **Step 3: Implement `apps/web/types/roles.ts`**

```typescript
export const ROLES = [
  'system_admin',
  'cho',
  'rhm',
  'phn',
  'bhw',
] as const

export type Role = (typeof ROLES)[number]

export type RoleTier = 'admin' | 'oversight' | 'clinical' | 'bhw'

export const ROLE_TIER = {
  system_admin: 'admin',
  cho:          'oversight',
  rhm:          'clinical',
  phn:          'clinical',
  bhw:          'bhw',
} as const satisfies Record<Role, RoleTier>

export const ROLE_HOME: Record<Role, string> = {
  system_admin: '/admin/users',
  cho:          '/oversight/dashboard',
  rhm:          '/clinical/dashboard',
  phn:          '/clinical/dashboard',
  bhw:          '/bhw/dashboard',
}

export const TIER_PATHS: Record<RoleTier, string> = {
  admin:     '/admin',
  oversight: '/oversight',
  clinical:  '/clinical',
  bhw:       '/bhw',
}

export function isRole(value: unknown): value is Role {
  return ROLES.includes(value as Role)
}
```

- [ ] **Step 4: Create `apps/web/types/index.ts`**

```typescript
export * from './roles'
```

- [ ] **Step 5: Run tests — confirm they pass**

```bash
cd apps/web && pnpm test:run
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
cd apps/web && git add types/
git commit -m "feat: add role types, tier map, and home path map with tests"
```

---

## Task 3: Root Layout + Redirect + PWA Manifest

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Replace: `apps/web/app/page.tsx`
- Create: `apps/web/app/manifest.ts`

- [ ] **Step 1: Update `apps/web/app/layout.tsx` — metadata only, keep body structure**

```typescript
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Project LINK',
    template: '%s · Project LINK',
  },
  description:
    'Local Information Network for Kalusugan — CHO II Health Station Management Platform',
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Replace `apps/web/app/page.tsx`**

No auth check — plain redirect to `/login` as a placeholder until the auth plan runs.

```typescript
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/login')
}
```

- [ ] **Step 3: Create `apps/web/app/manifest.ts`**

```typescript
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Project LINK',
    short_name: 'LINK',
    description: 'Local Information Network for Kalusugan',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
```

> `public/icon-192.png` and `public/icon-512.png` are referenced but not created — add real icons in the UI phase.

- [ ] **Step 4: Commit**

```bash
cd apps/web && git add app/layout.tsx app/page.tsx app/manifest.ts
git commit -m "feat: update root layout metadata, add PWA manifest, redirect root to /login"
```

---

## Task 4: BHW Tier — Shell + Layout + Route Stubs

**Files:**
- Create: `apps/web/components/shells/bhw-shell.tsx`
- Create: `apps/web/app/bhw/layout.tsx`
- Create: `apps/web/app/bhw/dashboard/page.tsx`
- Create: `apps/web/app/bhw/patients/page.tsx`
- Create: `apps/web/app/bhw/patients/[id]/page.tsx`
- Create: `apps/web/app/bhw/forms/page.tsx`
- Create: `apps/web/app/bhw/forms/[program]/page.tsx`
- Create: `apps/web/app/bhw/alerts/page.tsx`

- [ ] **Step 1: Create `apps/web/components/shells/bhw-shell.tsx`**

Structural wrapper only. Navigation UI added in the UI phase plan.

```typescript
interface BHWShellProps {
  children: React.ReactNode
}

export function BHWShell({ children }: BHWShellProps) {
  return <div data-shell="bhw">{children}</div>
}
```

- [ ] **Step 2: Create `apps/web/app/bhw/layout.tsx`**

No auth check yet — that is wired in the auth plan. Layout exists to establish the shell boundary.

```typescript
import { BHWShell } from '@/components/shells/bhw-shell'

export default function BHWLayout({ children }: { children: React.ReactNode }) {
  return <BHWShell>{children}</BHWShell>
}
```

- [ ] **Step 3: Create BHW route stubs**

`apps/web/app/bhw/dashboard/page.tsx`:
```typescript
export default function BHWDashboardPage() {
  return <p>bhw/dashboard</p>
}
```

`apps/web/app/bhw/patients/page.tsx`:
```typescript
export default function BHWPatientsPage() {
  return <p>bhw/patients</p>
}
```

`apps/web/app/bhw/patients/[id]/page.tsx`:
```typescript
interface Props { params: Promise<{ id: string }> }

export default async function BHWPatientDetailPage({ params }: Props) {
  const { id } = await params
  return <p>bhw/patients/{id}</p>
}
```

`apps/web/app/bhw/forms/page.tsx`:
```typescript
export default function BHWFormsPage() {
  return <p>bhw/forms</p>
}
```

`apps/web/app/bhw/forms/[program]/page.tsx`:
```typescript
interface Props { params: Promise<{ program: string }> }

export default async function BHWFormPage({ params }: Props) {
  const { program } = await params
  return <p>bhw/forms/{program}</p>
}
```

`apps/web/app/bhw/alerts/page.tsx`:
```typescript
export default function BHWAlertsPage() {
  return <p>bhw/alerts</p>
}
```

- [ ] **Step 4: Commit**

```bash
cd apps/web && git add components/shells/bhw-shell.tsx app/bhw/
git commit -m "feat: scaffold BHW tier — shell and route stubs (/bhw/*)"
```

---

## Task 5: Clinical Tier — Shell + Layout + Route Stubs

**Files:**
- Create: `apps/web/components/shells/clinical-shell.tsx`
- Create: `apps/web/app/clinical/layout.tsx`
- Create: `apps/web/app/clinical/dashboard/page.tsx`
- Create: `apps/web/app/clinical/patients/page.tsx`
- Create: `apps/web/app/clinical/patients/[id]/page.tsx`
- Create: `apps/web/app/clinical/forms/page.tsx`
- Create: `apps/web/app/clinical/forms/[program]/page.tsx`
- Create: `apps/web/app/clinical/reports/page.tsx`
- Create: `apps/web/app/clinical/inventory/page.tsx`

- [ ] **Step 1: Create `apps/web/components/shells/clinical-shell.tsx`**

```typescript
interface ClinicalShellProps {
  children: React.ReactNode
}

export function ClinicalShell({ children }: ClinicalShellProps) {
  return <div data-shell="clinical">{children}</div>
}
```

- [ ] **Step 2: Create `apps/web/app/clinical/layout.tsx`**

```typescript
import { ClinicalShell } from '@/components/shells/clinical-shell'

export default function ClinicalLayout({ children }: { children: React.ReactNode }) {
  return <ClinicalShell>{children}</ClinicalShell>
}
```

- [ ] **Step 3: Create clinical route stubs**

`apps/web/app/clinical/dashboard/page.tsx`:
```typescript
export default function ClinicalDashboardPage() {
  return <p>clinical/dashboard</p>
}
```

`apps/web/app/clinical/patients/page.tsx`:
```typescript
export default function ClinicalPatientsPage() {
  return <p>clinical/patients</p>
}
```

`apps/web/app/clinical/patients/[id]/page.tsx`:
```typescript
interface Props { params: Promise<{ id: string }> }

export default async function ClinicalPatientDetailPage({ params }: Props) {
  const { id } = await params
  return <p>clinical/patients/{id}</p>
}
```

`apps/web/app/clinical/forms/page.tsx`:
```typescript
export default function ClinicalFormsPage() {
  return <p>clinical/forms</p>
}
```

`apps/web/app/clinical/forms/[program]/page.tsx`:
```typescript
interface Props { params: Promise<{ program: string }> }

export default async function ClinicalFormPage({ params }: Props) {
  const { program } = await params
  return <p>clinical/forms/{program}</p>
}
```

`apps/web/app/clinical/reports/page.tsx`:
```typescript
export default function ClinicalReportsPage() {
  return <p>clinical/reports</p>
}
```

`apps/web/app/clinical/inventory/page.tsx`:
```typescript
export default function ClinicalInventoryPage() {
  return <p>clinical/inventory</p>
}
```

- [ ] **Step 4: Commit**

```bash
cd apps/web && git add components/shells/clinical-shell.tsx app/clinical/
git commit -m "feat: scaffold Clinical tier — shell and route stubs (/clinical/*)"
```

---

## Task 6: Oversight Tier — Shell + Layout + Route Stubs

**Files:**
- Create: `apps/web/components/shells/oversight-shell.tsx`
- Create: `apps/web/app/oversight/layout.tsx`
- Create: `apps/web/app/oversight/dashboard/page.tsx`
- Create: `apps/web/app/oversight/reports/page.tsx`
- Create: `apps/web/app/oversight/gis/page.tsx`
- Create: `apps/web/app/oversight/alerts/page.tsx`

- [ ] **Step 1: Create `apps/web/components/shells/oversight-shell.tsx`**

```typescript
interface OversightShellProps {
  children: React.ReactNode
}

export function OversightShell({ children }: OversightShellProps) {
  return <div data-shell="oversight">{children}</div>
}
```

- [ ] **Step 2: Create `apps/web/app/oversight/layout.tsx`**

```typescript
import { OversightShell } from '@/components/shells/oversight-shell'

export default function OversightLayout({ children }: { children: React.ReactNode }) {
  return <OversightShell>{children}</OversightShell>
}
```

- [ ] **Step 3: Create oversight route stubs**

`apps/web/app/oversight/dashboard/page.tsx`:
```typescript
export default function OversightDashboardPage() {
  return <p>oversight/dashboard</p>
}
```

`apps/web/app/oversight/reports/page.tsx`:
```typescript
export default function OversightReportsPage() {
  return <p>oversight/reports</p>
}
```

`apps/web/app/oversight/gis/page.tsx`:
```typescript
export default function OversightGISPage() {
  return <p>oversight/gis</p>
}
```

`apps/web/app/oversight/alerts/page.tsx`:
```typescript
export default function OversightAlertsPage() {
  return <p>oversight/alerts</p>
}
```

- [ ] **Step 4: Commit**

```bash
cd apps/web && git add components/shells/oversight-shell.tsx app/oversight/
git commit -m "feat: scaffold Oversight tier — shell and route stubs (/oversight/*)"
```

---

## Task 7: Admin Tier — Shell + Layout + Route Stubs

**Files:**
- Create: `apps/web/components/shells/admin-shell.tsx`
- Create: `apps/web/app/admin/layout.tsx`
- Create: `apps/web/app/admin/users/page.tsx`
- Create: `apps/web/app/admin/settings/page.tsx`

- [ ] **Step 1: Create `apps/web/components/shells/admin-shell.tsx`**

```typescript
interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  return <div data-shell="admin">{children}</div>
}
```

- [ ] **Step 2: Create `apps/web/app/admin/layout.tsx`**

```typescript
import { AdminShell } from '@/components/shells/admin-shell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
```

- [ ] **Step 3: Create admin route stubs**

`apps/web/app/admin/users/page.tsx`:
```typescript
export default function AdminUsersPage() {
  return <p>admin/users</p>
}
```

`apps/web/app/admin/settings/page.tsx`:
```typescript
export default function AdminSettingsPage() {
  return <p>admin/settings</p>
}
```

- [ ] **Step 4: Commit**

```bash
cd apps/web && git add components/shells/admin-shell.tsx app/admin/
git commit -m "feat: scaffold Admin tier — shell and route stubs (/admin/*)"
```

---

## Task 8: Auth Route Stubs

**Files:**
- Create: `apps/web/app/(auth)/layout.tsx`
- Create: `apps/web/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create `apps/web/app/(auth)/layout.tsx`**

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
```

- [ ] **Step 2: Create `apps/web/app/(auth)/login/page.tsx`**

Stub only. The real login form is wired in the auth plan.

```typescript
export default function LoginPage() {
  return <p>login</p>
}
```

- [ ] **Step 3: Commit**

```bash
cd apps/web && git add app/'(auth)'/
git commit -m "feat: add auth route group with login stub"
```

---

## Task 9: Feature Scaffolds

**Files:** `features/[name]/types/index.ts` and `features/[name]/mock/data.ts` for 7 domains.

These files establish domain type contracts and seed mock data for future UI and auth implementation plans.

- [ ] **Step 1: Patients**

`apps/web/features/patients/types/index.ts`:
```typescript
export interface Patient {
  id: string
  name: string
  age: number
  purok: string
  bhs: string
  status: 'active' | 'pending' | 'transferred'
}
```

`apps/web/features/patients/mock/data.ts`:
```typescript
import type { Patient } from '../types'

export const MOCK_PATIENTS: Patient[] = [
  { id: 'P-001', name: 'Maria Santos',   age: 34, purok: 'Purok 1', bhs: 'BHS Salawag', status: 'active' },
  { id: 'P-002', name: 'Juan dela Cruz', age: 56, purok: 'Purok 3', bhs: 'BHS Salawag', status: 'active' },
  { id: 'P-003', name: 'Ana Reyes',      age: 28, purok: 'Purok 2', bhs: 'BHS Salawag', status: 'pending' },
  { id: 'P-004', name: 'Pedro Bautista', age: 45, purok: 'Purok 4', bhs: 'BHS Salawag', status: 'active' },
  { id: 'P-005', name: 'Luz Garcia',     age: 72, purok: 'Purok 1', bhs: 'BHS Salawag', status: 'transferred' },
]
```

- [ ] **Step 2: Forms**

`apps/web/features/forms/types/index.ts`:
```typescript
export type ProgramSlug = 'maternal' | 'immunization' | 'tbdots' | 'ncd'

export interface FormEntry {
  id: string
  patientId: string
  program: ProgramSlug
  date: string
  status: 'draft' | 'submitted' | 'validated'
}
```

`apps/web/features/forms/mock/data.ts`:
```typescript
import type { FormEntry } from '../types'

export const MOCK_FORM_ENTRIES: FormEntry[] = [
  { id: 'FE-001', patientId: 'P-001', program: 'maternal',     date: '2026-04-08', status: 'submitted' },
  { id: 'FE-002', patientId: 'P-002', program: 'ncd',          date: '2026-04-08', status: 'validated' },
  { id: 'FE-003', patientId: 'P-003', program: 'immunization', date: '2026-04-07', status: 'draft' },
  { id: 'FE-004', patientId: 'P-004', program: 'tbdots',       date: '2026-04-06', status: 'submitted' },
]
```

- [ ] **Step 3: Reports**

`apps/web/features/reports/types/index.ts`:
```typescript
export type ReportType = 'ST' | 'MCT' | 'M1' | 'M2'

export interface Report {
  id: string
  type: ReportType
  period: string
  bhs: string
  status: 'draft' | 'submitted' | 'approved'
}
```

`apps/web/features/reports/mock/data.ts`:
```typescript
import type { Report } from '../types'

export const MOCK_REPORTS: Report[] = [
  { id: 'R-001', type: 'ST',  period: '2026-03', bhs: 'BHS Salawag',    status: 'approved' },
  { id: 'R-002', type: 'ST',  period: '2026-03', bhs: 'BHS Burol Main', status: 'submitted' },
  { id: 'R-003', type: 'MCT', period: '2026-03', bhs: 'All BHS',        status: 'draft' },
]
```

- [ ] **Step 4: GIS**

`apps/web/features/gis/types/index.ts`:
```typescript
export interface GISAlert {
  id: string
  barangay: string
  disease: string
  caseCount: number
  severity: 'low' | 'medium' | 'high'
  reportedAt: string
}
```

`apps/web/features/gis/mock/data.ts`:
```typescript
import type { GISAlert } from '../types'

export const MOCK_GIS_ALERTS: GISAlert[] = [
  { id: 'G-001', barangay: 'Salawag',    disease: 'Dengue', caseCount: 4,  severity: 'medium', reportedAt: '2026-04-07' },
  { id: 'G-002', barangay: 'Burol Main', disease: 'TB',     caseCount: 2,  severity: 'low',    reportedAt: '2026-04-06' },
  { id: 'G-003', barangay: 'Zone I',     disease: 'Dengue', caseCount: 11, severity: 'high',   reportedAt: '2026-04-08' },
]
```

- [ ] **Step 5: Alerts**

`apps/web/features/alerts/types/index.ts`:
```typescript
export type AlertType = 'disease' | 'defaulter' | 'lowstock'
export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface Alert {
  id: string
  type: AlertType
  title: string
  description: string
  severity: AlertSeverity
  createdAt: string
  read: boolean
}
```

`apps/web/features/alerts/mock/data.ts`:
```typescript
import type { Alert } from '../types'

export const MOCK_ALERTS: Alert[] = [
  { id: 'A-001', type: 'defaulter', title: 'Missed Measles Vaccine', description: 'Patient P-003 (Ana Reyes) is 3 days overdue for Measles at 10 months.', severity: 'warning',  createdAt: '2026-04-09', read: false },
  { id: 'A-002', type: 'disease',   title: 'Dengue Case Confirmed',  description: 'Zone I reports 11 dengue cases this week — threshold exceeded.',       severity: 'critical', createdAt: '2026-04-08', read: false },
  { id: 'A-003', type: 'lowstock',  title: 'BCG Vaccine Low',        description: 'BHS Salawag BCG stock at 3 vials (threshold: 10).',                    severity: 'warning',  createdAt: '2026-04-07', read: true },
]
```

- [ ] **Step 6: Inventory**

`apps/web/features/inventory/types/index.ts`:
```typescript
export type ItemCategory = 'vaccine' | 'medicine' | 'supply'

export interface InventoryItem {
  id: string
  name: string
  category: ItemCategory
  stock: number
  unit: string
  threshold: number
}
```

`apps/web/features/inventory/mock/data.ts`:
```typescript
import type { InventoryItem } from '../types'

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'I-001', name: 'BCG Vaccine',     category: 'vaccine',  stock: 3,   unit: 'vial',   threshold: 10 },
  { id: 'I-002', name: 'OPV Vaccine',     category: 'vaccine',  stock: 24,  unit: 'dose',   threshold: 20 },
  { id: 'I-003', name: 'Amlodipine 5mg',  category: 'medicine', stock: 150, unit: 'tablet', threshold: 50 },
  { id: 'I-004', name: 'Metformin 500mg', category: 'medicine', stock: 200, unit: 'tablet', threshold: 50 },
  { id: 'I-005', name: 'Alcohol 70%',     category: 'supply',   stock: 6,   unit: 'bottle', threshold: 10 },
]
```

- [ ] **Step 7: Dashboard**

`apps/web/features/dashboard/types/index.ts`:
```typescript
export interface BHWStats {
  visitedToday: number
  pendingForms: number
  alertsCount: number
}

export interface ClinicalStats {
  activePatients: number
  pendingReview: number
  formsToday: number
  lowStockItems: number
}

export interface OversightStats {
  totalPatients: number
  bhsActive: number
  openAlerts: number
  reportsThisMonth: number
}
```

`apps/web/features/dashboard/mock/data.ts`:
```typescript
import type { BHWStats, ClinicalStats, OversightStats } from '../types'

export const MOCK_BHW_STATS: BHWStats = {
  visitedToday: 5,
  pendingForms: 2,
  alertsCount: 1,
}

export const MOCK_CLINICAL_STATS: ClinicalStats = {
  activePatients: 142,
  pendingReview: 8,
  formsToday: 23,
  lowStockItems: 2,
}

export const MOCK_OVERSIGHT_STATS: OversightStats = {
  totalPatients: 4821,
  bhsActive: 32,
  openAlerts: 3,
  reportsThisMonth: 12,
}
```

- [ ] **Step 8: Commit**

```bash
cd apps/web && git add features/
git commit -m "feat: scaffold feature domain types and mock data for all 7 domains"
```

---

## Task 10: Final Build Verification

- [ ] **Step 1: Run all tests**

```bash
cd apps/web && pnpm test:run
```

Expected: All role type tests PASS.

- [ ] **Step 2: TypeScript check**

```bash
cd apps/web && npx tsc --noEmit
```

Expected: Zero errors.

- [ ] **Step 3: Production build**

```bash
cd apps/web && pnpm build
```

Expected: Build completes. All 17 routes visible in build output.

- [ ] **Step 4: Fix and commit if needed**

```bash
cd apps/web && git add -p
git commit -m "fix: resolve TypeScript errors from restructure"
```

---

## Final Directory Tree (Expected After Completion)

```
apps/web/
  app/
    (auth)/login/page.tsx        → /login            stub
    bhw/layout.tsx               renders BHWShell (passthrough)
    bhw/dashboard/page.tsx       → /bhw/dashboard
    bhw/patients/page.tsx        → /bhw/patients
    bhw/patients/[id]/page.tsx   → /bhw/patients/:id
    bhw/forms/page.tsx           → /bhw/forms
    bhw/forms/[program]/page.tsx → /bhw/forms/:program
    bhw/alerts/page.tsx          → /bhw/alerts
    clinical/...                 → /clinical/*        6 routes
    oversight/...                → /oversight/*       4 routes
    admin/...                    → /admin/*           2 routes
    manifest.ts                  → /manifest.webmanifest
  components/
    ui/                          shadcn (untouched)
    shells/                      4 passthrough wrappers
  features/                      7 domain scaffolds (types + mock)
  types/roles.ts                 Role enum, tier map, home map (+tests)
```

## Success Criteria

- [ ] `pnpm test:run` — all role type tests pass
- [ ] `npx tsc --noEmit` — zero type errors
- [ ] `pnpm build` — successful production build, 17 routes in output
- [ ] `GET /` → redirects to `/login`
- [ ] `GET /bhw/dashboard` → renders `<p>bhw/dashboard</p>`
- [ ] `GET /clinical/patients/P-001` → renders `<p>clinical/patients/P-001</p>`

## What the Next Plans Layer In

| Plan | What it adds |
|---|---|
| `2026-04-09-auth.md` | Supabase clients, middleware, auth guards in layouts, working login form |
| UI phase plan | Shell navigation, page content, shadcn components |
