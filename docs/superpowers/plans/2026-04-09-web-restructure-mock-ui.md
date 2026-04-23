# apps/web Restructure & Mock UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stock Next.js starter in `apps/web` with a proper internal-dashboard route structure and role-aware mock UIs built from shadcn/ui placeholders, ready to wire to real data in later phases.

**Architecture:** App Router with two route groups — `(auth)/` for unauthenticated flows and `(dashboard)/` for the main shell. All pages render mock data from an isolated `mock/` folder so every placeholder can be swapped without touching component logic. Shared clinical UX components (StatusBadge, HighRiskFlag, SyncIndicator) are built from the start so they exist at every page that needs them.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4 (CSS-first), shadcn/ui (style: radix-nova, base: mist, icons: lucide), Vitest + Testing Library

---

## Pre-flight: Read Next.js 16 Docs

> **REQUIRED before any Next.js code.** Next.js 16 has breaking changes from earlier versions (e.g. `middleware.ts` → `proxy.ts`, async params, new runtime APIs). The AGENTS.md in `apps/web` requires reading the bundled docs before writing code.

Run from repo root:
```bash
ls apps/web/node_modules/next/dist/docs/
```
Read any files relevant to: layouts, route groups, redirect, not-found, dynamic routes, page/layout conventions.

---

## File Map

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                   CREATE  Auth shell — centered, no sidebar
│   │   └── login/
│   │       └── page.tsx                 CREATE  Mock login page
│   ├── (dashboard)/
│   │   ├── layout.tsx                   CREATE  Shell: SidebarProvider + AppSidebar + Topbar
│   │   ├── dashboard/
│   │   │   └── page.tsx                 CREATE  Stat cards + recent activity skeleton
│   │   ├── patients/
│   │   │   ├── page.tsx                 CREATE  Mock patient table
│   │   │   └── [id]/
│   │   │       └── page.tsx             CREATE  Mock patient detail
│   │   ├── forms/
│   │   │   ├── page.tsx                 CREATE  Mock forms list
│   │   │   └── [formId]/
│   │   │       └── page.tsx             CREATE  Mock form view
│   │   ├── reports/
│   │   │   └── page.tsx                 CREATE  Mock reports list
│   │   ├── gis/
│   │   │   └── page.tsx                 CREATE  GIS map placeholder
│   │   └── admin/
│   │       └── page.tsx                 CREATE  Mock admin panel
│   ├── globals.css                      KEEP    Already correct — do not touch
│   ├── layout.tsx                       MODIFY  Replace stock; add LINK metadata + fonts
│   ├── page.tsx                         MODIFY  Replace stock; redirect → /dashboard
│   └── not-found.tsx                    CREATE  Global 404 page
├── components/
│   ├── ui/                              KEEP    shadcn primitives — never hand-edit
│   ├── layout/
│   │   ├── app-sidebar.tsx              CREATE  Sidebar nav + role badge + user footer
│   │   ├── topbar.tsx                   CREATE  Breadcrumb + user dropdown
│   │   └── mobile-nav.tsx               CREATE  Sheet-based mobile drawer nav
│   └── shared/
│       ├── status-badge.tsx             CREATE  Clinical record status badge
│       ├── high-risk-flag.tsx           CREATE  Persistent high-risk indicator
│       └── sync-indicator.tsx           CREATE  Online/offline + pending-sync count
├── mock/
│   ├── patients.ts                      CREATE  20 mock patient records
│   ├── forms.ts                         CREATE  Mock form type list + form instances
│   ├── reports.ts                       CREATE  Mock report stubs
│   └── index.ts                         CREATE  Barrel re-export
└── types/
    ├── roles.ts                         CREATE  UserRole union + display map
    └── clinical.ts                      CREATE  ClinicalStatus enum + core record types
```

---

## Task 1: Read Next.js 16 Docs (Prerequisites)

**Files:**
- Read: `apps/web/node_modules/next/dist/docs/` (no edits)

- [ ] **Step 1: List available docs**

```bash
cd apps/web
ls node_modules/next/dist/docs/
```

- [ ] **Step 2: Read routing and layout docs**

Read any files covering: `app-router`, `layouts`, `route-groups`, `dynamic-routes`, `not-found`, `redirect`. Note any API differences from Next.js 14/15.

- [ ] **Step 3: Note breaking changes relevant to this plan**

Key things to verify: how `redirect()` is imported, how `params` typing works in dynamic routes, any layout API changes. Document your findings as a comment in the task before proceeding.

---

## Task 2: Install shadcn Components

**Files:**
- Modify: `apps/web/components/ui/` (shadcn adds files here automatically)

- [ ] **Step 1: Confirm current shadcn config**

```bash
cd apps/web
npx shadcn@latest info --json
```

Expected output includes: `style: "radix-nova"`, `baseColor: "mist"`, `iconLibrary: "lucide"`.

- [ ] **Step 2: Install all needed components**

```bash
npx shadcn@latest add sidebar card table badge skeleton avatar separator input label select dialog sheet tabs breadcrumb dropdown-menu alert
```

Accept all prompts. This may take 30–60 seconds.

- [ ] **Step 3: Verify installations**

```bash
npx shadcn@latest info --json | grep -A 5 '"components"'
```

Confirm `sidebar`, `card`, `table`, `badge`, `skeleton` appear in the output.

- [ ] **Step 4: Commit**

```bash
cd ../..
git add apps/web/components/ui
git commit -m "feat(web): install shadcn components for dashboard shell"
```

---

## Task 3: Create Type Definitions

**Files:**
- Create: `apps/web/types/roles.ts`
- Create: `apps/web/types/clinical.ts`

- [ ] **Step 1: Create `types/roles.ts`**

```ts
// apps/web/types/roles.ts

export type UserRole =
  | 'system_admin'
  | 'cho'
  | 'rhm'
  | 'phn'
  | 'bhw'

export const ROLE_LABELS: Record<UserRole, string> = {
  system_admin: 'System Admin',
  cho: 'City Health Officer',
  phn: 'Public Health Nurse',
  rhm: 'Rural Health Midwife',
  bhw: 'Barangay Health Worker',
}

export const ROLE_SHORT: Record<UserRole, string> = {
  system_admin: 'Admin',
  cho: 'CHO',
  phn: 'PHN',
  rhm: 'RHM',
  bhw: 'BHW',
}
```

- [ ] **Step 2: Create `types/clinical.ts`**

```ts
// apps/web/types/clinical.ts

export type ClinicalStatus =
  | 'DRAFT'
  | 'PENDING_SYNC'
  | 'PENDING_VALIDATION'
  | 'VALIDATED'
  | 'RETURNED'

export const CLINICAL_STATUS_LABELS: Record<ClinicalStatus, string> = {
  DRAFT: 'Draft',
  PENDING_SYNC: 'Pending Sync',
  PENDING_VALIDATION: 'For Validation',
  VALIDATED: 'Validated',
  RETURNED: 'Returned',
}

export interface MockPatient {
  id: string
  name: string
  barangay: string
  age: number
  sex: 'M' | 'F'
  status: ClinicalStatus
  highRisk: boolean
  lastVisit: string // ISO date string
}

export interface MockFormInstance {
  id: string
  type: string
  patientName: string
  bhsName: string
  status: ClinicalStatus
  submittedAt: string // ISO date string
}

export interface MockReport {
  id: string
  title: string
  period: string
  bhsCount: number
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED'
  generatedAt: string
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd ../..
git add apps/web/types
git commit -m "feat(web): add UserRole and ClinicalStatus type definitions"
```

---

## Task 4: Create Mock Data

**Files:**
- Create: `apps/web/mock/patients.ts`
- Create: `apps/web/mock/forms.ts`
- Create: `apps/web/mock/reports.ts`
- Create: `apps/web/mock/index.ts`

- [ ] **Step 1: Create `mock/patients.ts`**

```ts
// apps/web/mock/patients.ts
import type { MockPatient } from '@/types/clinical'

export const MOCK_PATIENTS: MockPatient[] = [
  { id: 'p-001', name: 'Maria Santos', barangay: 'Burol I', age: 32, sex: 'F', status: 'VALIDATED', highRisk: false, lastVisit: '2026-04-01' },
  { id: 'p-002', name: 'Juan dela Cruz', barangay: 'Burol II', age: 58, sex: 'M', status: 'PENDING_VALIDATION', highRisk: true, lastVisit: '2026-03-28' },
  { id: 'p-003', name: 'Ana Reyes', barangay: 'Paliparan I', age: 45, sex: 'F', status: 'VALIDATED', highRisk: true, lastVisit: '2026-04-03' },
  { id: 'p-004', name: 'Pedro Bautista', barangay: 'Salitran I', age: 67, sex: 'M', status: 'RETURNED', highRisk: false, lastVisit: '2026-03-15' },
  { id: 'p-005', name: 'Rosa Garcia', barangay: 'Burol Main', age: 29, sex: 'F', status: 'PENDING_SYNC', highRisk: false, lastVisit: '2026-04-08' },
  { id: 'p-006', name: 'Carlo Mendoza', barangay: 'Sabang', age: 41, sex: 'M', status: 'VALIDATED', highRisk: false, lastVisit: '2026-04-02' },
  { id: 'p-007', name: 'Liza Aquino', barangay: 'Langkaan I', age: 36, sex: 'F', status: 'PENDING_VALIDATION', highRisk: true, lastVisit: '2026-04-05' },
  { id: 'p-008', name: 'Ben Torres', barangay: 'Burol III', age: 52, sex: 'M', status: 'DRAFT', highRisk: false, lastVisit: '2026-04-07' },
  { id: 'p-009', name: 'Cora Villanueva', barangay: 'Paliparan II', age: 61, sex: 'F', status: 'VALIDATED', highRisk: true, lastVisit: '2026-03-30' },
  { id: 'p-010', name: 'Felix Navarro', barangay: 'Salitran II', age: 44, sex: 'M', status: 'VALIDATED', highRisk: false, lastVisit: '2026-04-01' },
]
```

- [ ] **Step 2: Create `mock/forms.ts`**

```ts
// apps/web/mock/forms.ts
import type { MockFormInstance } from '@/types/clinical'

export const FORM_TYPES = [
  { id: 'maternal', label: 'Maternal Record (Prenatal)' },
  { id: 'family-planning', label: 'Family Planning' },
  { id: 'child-care', label: 'Child Care (Under 5)' },
  { id: 'ncd', label: 'NCD / Hypertension' },
  { id: 'tb-dots', label: 'TB-DOTS' },
]

export const MOCK_FORM_INSTANCES: MockFormInstance[] = [
  { id: 'f-001', type: 'Maternal Record', patientName: 'Maria Santos', bhsName: 'Burol I BHS', status: 'VALIDATED', submittedAt: '2026-04-01' },
  { id: 'f-002', type: 'NCD / Hypertension', patientName: 'Juan dela Cruz', bhsName: 'Burol II BHS', status: 'PENDING_VALIDATION', submittedAt: '2026-03-28' },
  { id: 'f-003', type: 'Family Planning', patientName: 'Ana Reyes', bhsName: 'Paliparan I BHS', status: 'RETURNED', submittedAt: '2026-04-03' },
  { id: 'f-004', type: 'Child Care', patientName: 'Rosa Garcia', bhsName: 'Burol Main BHS', status: 'PENDING_SYNC', submittedAt: '2026-04-08' },
  { id: 'f-005', type: 'TB-DOTS', patientName: 'Carlo Mendoza', bhsName: 'Sabang BHS', status: 'VALIDATED', submittedAt: '2026-04-02' },
]
```

- [ ] **Step 3: Create `mock/reports.ts`**

```ts
// apps/web/mock/reports.ts
import type { MockReport } from '@/types/clinical'

export const MOCK_REPORTS: MockReport[] = [
  { id: 'r-001', title: 'Monthly Consolidation Table — March 2026', period: 'March 2026', bhsCount: 32, status: 'APPROVED', generatedAt: '2026-04-05' },
  { id: 'r-002', title: 'Monthly Consolidation Table — February 2026', period: 'February 2026', bhsCount: 32, status: 'APPROVED', generatedAt: '2026-03-06' },
  { id: 'r-003', title: 'Summary Table — Burol I — March 2026', period: 'March 2026', bhsCount: 1, status: 'PENDING_APPROVAL', generatedAt: '2026-04-03' },
  { id: 'r-004', title: 'Summary Table — Paliparan II — March 2026', period: 'March 2026', bhsCount: 1, status: 'DRAFT', generatedAt: '2026-04-07' },
]
```

- [ ] **Step 4: Create `mock/index.ts`**

```ts
// apps/web/mock/index.ts
export * from './patients'
export * from './forms'
export * from './reports'
```

- [ ] **Step 5: Run TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
cd ../..
git add apps/web/mock
git commit -m "feat(web): add isolated mock data for Phase 1 UI"
```

---

## Task 5: Create Shared Clinical Components

**Files:**
- Create: `apps/web/components/shared/status-badge.tsx`
- Create: `apps/web/components/shared/high-risk-flag.tsx`
- Create: `apps/web/components/shared/sync-indicator.tsx`
- Create: `apps/web/components/shared/status-badge.test.tsx`

These components must exist at every clinical list and detail view per AGENTS.md.

- [ ] **Step 1: Write failing test for StatusBadge**

```tsx
// apps/web/components/shared/status-badge.test.tsx
import { render, screen } from '@testing-library/react'

// Import will fail until component exists
import StatusBadge from './status-badge'

describe('StatusBadge', () => {
  it('renders VALIDATED with correct label', () => {
    render(<StatusBadge status="VALIDATED" />)
    expect(screen.getByText('Validated')).toBeInTheDocument()
  })

  it('renders PENDING_VALIDATION with correct label', () => {
    render(<StatusBadge status="PENDING_VALIDATION" />)
    expect(screen.getByText('For Validation')).toBeInTheDocument()
  })

  it('renders RETURNED with correct label', () => {
    render(<StatusBadge status="RETURNED" />)
    expect(screen.getByText('Returned')).toBeInTheDocument()
  })

  it('renders PENDING_SYNC with correct label', () => {
    render(<StatusBadge status="PENDING_SYNC" />)
    expect(screen.getByText('Pending Sync')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd apps/web
pnpm test:run components/shared/status-badge.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `status-badge.tsx`**

```tsx
// apps/web/components/shared/status-badge.tsx
import { Badge } from '@/components/ui/badge'
import { CLINICAL_STATUS_LABELS, type ClinicalStatus } from '@/types/clinical'

const STATUS_VARIANT: Record<ClinicalStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  VALIDATED: 'default',
  PENDING_VALIDATION: 'secondary',
  RETURNED: 'destructive',
  PENDING_SYNC: 'outline',
  DRAFT: 'outline',
}

export default function StatusBadge({ status }: { status: ClinicalStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {CLINICAL_STATUS_LABELS[status]}
    </Badge>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd apps/web
pnpm test:run components/shared/status-badge.test.tsx
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Create `high-risk-flag.tsx`**

```tsx
// apps/web/components/shared/high-risk-flag.tsx
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

export default function HighRiskFlag({ highRisk }: { highRisk: boolean }) {
  if (!highRisk) return null
  return (
    <Badge variant="destructive" className="gap-1">
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      <span>High Risk</span>
    </Badge>
  )
}
```

- [ ] **Step 6: Create `sync-indicator.tsx`**

This is a client component (needs browser APIs for online detection).

```tsx
// apps/web/components/shared/sync-indicator.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff } from 'lucide-react'

// Phase 1: mock values. Replace with useOnlineStatus hook + Dexie queue count when wiring.
export default function SyncIndicator({
  pendingCount = 0,
  online = true,
}: {
  pendingCount?: number
  online?: boolean
}) {
  if (online && pendingCount === 0) return null

  return (
    <div className="flex items-center gap-2">
      {!online && (
        <Badge variant="outline" className="gap-1 text-muted-foreground">
          <WifiOff className="h-3 w-3" aria-hidden="true" />
          Offline
        </Badge>
      )}
      {pendingCount > 0 && (
        <Badge variant="secondary" className="gap-1">
          <Wifi className="h-3 w-3" aria-hidden="true" />
          {pendingCount} pending sync
        </Badge>
      )}
    </div>
  )
}
```

- [ ] **Step 7: Run TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Commit**

```bash
cd ../..
git add apps/web/components/shared
git commit -m "feat(web): add StatusBadge, HighRiskFlag, SyncIndicator shared components"
```

---

## Task 6: Create Layout Components (Sidebar, Topbar, Mobile Nav)

**Files:**
- Create: `apps/web/components/layout/app-sidebar.tsx`
- Create: `apps/web/components/layout/topbar.tsx`
- Create: `apps/web/components/layout/mobile-nav.tsx`

- [ ] **Step 1: Create `app-sidebar.tsx`**

```tsx
// apps/web/components/layout/app-sidebar.tsx
import Link from 'next/link'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Map,
  Settings,
} from 'lucide-react'
import { ROLE_SHORT } from '@/types/roles'
import type { UserRole } from '@/types/roles'

// Phase 1: mock user. Replace with Supabase Auth session when wiring.
const MOCK_USER = {
  name: 'Dr. Maria Santos',
  role: 'cho' as UserRole,
  initials: 'MS',
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/forms', label: 'Forms', icon: FileText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/gis', label: 'GIS', icon: Map },
  { href: '/admin', label: 'Admin', icon: Settings },
]

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold tracking-tight">Project LINK</span>
          <span className="text-xs text-muted-foreground">CHO II Dasmariñas</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{MOCK_USER.initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{MOCK_USER.name}</span>
            <Badge variant="secondary" className="w-fit text-xs">
              {ROLE_SHORT[MOCK_USER.role]}
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
```

- [ ] **Step 2: Create `topbar.tsx`**

```tsx
// apps/web/components/layout/topbar.tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User } from 'lucide-react'

interface TopbarProps {
  /** Breadcrumb segments shown after "Dashboard" */
  crumbs?: { label: string; href?: string }[]
}

export default function Topbar({ crumbs = [] }: TopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          {crumbs.map((crumb, i) => (
            <span key={crumb.label} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {i === crumbs.length - 1 || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* User menu — Phase 1: mock. Wire to Supabase Auth signOut later. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">MS</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Dr. Maria Santos</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
```

- [ ] **Step 3: Create `mobile-nav.tsx`**

```tsx
// apps/web/components/layout/mobile-nav.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu, LayoutDashboard, Users, FileText, BarChart3, Map, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Patients', icon: Users },
  { href: '/forms', label: 'Forms', icon: FileText },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/gis', label: 'GIS', icon: Map },
  { href: '/admin', label: 'Admin', icon: Settings },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-left text-sm font-semibold">Project LINK</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 4: Run TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd ../..
git add apps/web/components/layout
git commit -m "feat(web): add AppSidebar, Topbar, MobileNav layout components"
```

---

## Task 7: Update Root Layout and Root Page

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
// apps/web/app/layout.tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Project LINK',
  description: 'Local Information Network for Kalusugan — CHO II Dasmariñas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
// apps/web/app/page.tsx
import { redirect } from 'next/navigation'

// Phase 1: redirect root to dashboard unconditionally.
// Replace with auth check (redirect to /login if unauthenticated) when wiring Supabase Auth.
export default function RootPage() {
  redirect('/dashboard')
}
```

- [ ] **Step 3: Run dev server briefly to confirm no crash**

```bash
cd apps/web
pnpm dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Expected: 307 or 200 (redirect in flight). Kill the dev server after.

- [ ] **Step 4: Commit**

```bash
cd ../..
git add apps/web/app/layout.tsx apps/web/app/page.tsx
git commit -m "feat(web): replace stock root layout and page with LINK shell"
```

---

## Task 8: Create (auth) Route Group

**Files:**
- Create: `apps/web/app/(auth)/layout.tsx`
- Create: `apps/web/app/(auth)/login/page.tsx`

- [ ] **Step 1: Create `(auth)/layout.tsx`**

```tsx
// apps/web/app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create `(auth)/login/page.tsx`**

```tsx
// apps/web/app/(auth)/login/page.tsx
import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Sign In — Project LINK' }

// Phase 1: static mock. Wire to Supabase Auth (admin invite-only) when ready.
export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Project LINK</CardTitle>
        <CardDescription>CHO II Dasmariñas — Staff Access</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@cho2.gov.ph" autoComplete="email" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" />
        </div>
        <Button className="w-full" type="submit">
          Sign in
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Access is invite-only. Contact your system administrator.
        </p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd ../..
git add "apps/web/app/(auth)"
git commit -m "feat(web): add (auth) route group with mock login page"
```

---

## Task 9: Create (dashboard) Layout

**Files:**
- Create: `apps/web/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Create `(dashboard)/layout.tsx`**

```tsx
// apps/web/app/(dashboard)/layout.tsx
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/layout/app-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd ../..
git add "apps/web/app/(dashboard)/layout.tsx"
git commit -m "feat(web): add (dashboard) route group layout with sidebar shell"
```

---

## Task 10: Create Dashboard Page

**Files:**
- Create: `apps/web/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Create `dashboard/page.tsx`**

```tsx
// apps/web/app/(dashboard)/dashboard/page.tsx
import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import Topbar from '@/components/layout/topbar'
import { Users, FileText, AlertTriangle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard — Project LINK' }

// Phase 1: static mock values. Replace with Supabase queries when wiring.
const STAT_CARDS = [
  { label: 'Total Patients', value: '3,842', icon: Users, delta: '+12 this week' },
  { label: 'Forms Pending Validation', value: '47', icon: FileText, delta: '8 overdue' },
  { label: 'High-Risk Patients', value: '213', icon: AlertTriangle, delta: 'Across 14 BHS' },
  { label: 'Validated This Month', value: '1,204', icon: CheckCircle, delta: '94% approval rate' },
]

export default function DashboardPage() {
  return (
    <>
      <Topbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">CHO II Dasmariñas — April 2026</p>
        </div>

        {/* Stat cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CARDS.map((card) => (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.delta}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent activity — skeleton placeholder for data table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest form submissions and validations across BHS stations
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-1 flex-col gap-1">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd ../..
git add "apps/web/app/(dashboard)/dashboard"
git commit -m "feat(web): add mock dashboard page with stat cards"
```

---

## Task 11: Create Patients Pages

**Files:**
- Create: `apps/web/app/(dashboard)/patients/page.tsx`
- Create: `apps/web/app/(dashboard)/patients/[id]/page.tsx`

- [ ] **Step 1: Create `patients/page.tsx`**

```tsx
// apps/web/app/(dashboard)/patients/page.tsx
import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Topbar from '@/components/layout/topbar'
import StatusBadge from '@/components/shared/status-badge'
import HighRiskFlag from '@/components/shared/high-risk-flag'
import { MOCK_PATIENTS } from '@/mock'
import Link from 'next/link'
import { Search, UserPlus } from 'lucide-react'

export const metadata: Metadata = { title: 'Patients — Project LINK' }

export default function PatientsPage() {
  return (
    <>
      <Topbar crumbs={[{ label: 'Patients' }]} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
            <p className="text-sm text-muted-foreground">
              Unified patient registry — {MOCK_PATIENTS.length} records
            </p>
          </div>
          <Button className="gap-2 sm:w-auto">
            <UserPlus className="h-4 w-4" />
            New Patient
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input placeholder="Search by name or barangay…" className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Barangay</TableHead>
                  <TableHead className="hidden md:table-cell">Age / Sex</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Visit</TableHead>
                  <TableHead className="hidden sm:table-cell">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PATIENTS.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <Link
                        href={`/patients/${patient.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {patient.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {patient.barangay}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {patient.age} / {patient.sex}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={patient.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {patient.lastVisit}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <HighRiskFlag highRisk={patient.highRisk} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Create `patients/[id]/page.tsx`**

```tsx
// apps/web/app/(dashboard)/patients/[id]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Topbar from '@/components/layout/topbar'
import StatusBadge from '@/components/shared/status-badge'
import HighRiskFlag from '@/components/shared/high-risk-flag'
import { MOCK_PATIENTS } from '@/mock'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const patient = MOCK_PATIENTS.find((p) => p.id === id)
  return { title: patient ? `${patient.name} — Project LINK` : 'Patient Not Found' }
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params
  const patient = MOCK_PATIENTS.find((p) => p.id === id)

  if (!patient) notFound()

  return (
    <>
      <Topbar
        crumbs={[
          { label: 'Patients', href: '/patients' },
          { label: patient.name },
        ]}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4">
          <Button variant="ghost" size="sm" asChild className="w-fit gap-1 -ml-2">
            <Link href="/patients">
              <ArrowLeft className="h-4 w-4" />
              Back to Patients
            </Link>
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{patient.name}</h1>
              <p className="text-sm text-muted-foreground">{patient.barangay}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={patient.status} />
              <HighRiskFlag highRisk={patient.highRisk} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Full Name', value: patient.name },
                  { label: 'Age', value: `${patient.age} years old` },
                  { label: 'Sex', value: patient.sex === 'M' ? 'Male' : 'Female' },
                  { label: 'Barangay', value: patient.barangay },
                  { label: 'Last Visit', value: patient.lastVisit },
                ].map((field) => (
                  <div key={field.label}>
                    <p className="text-xs text-muted-foreground">{field.label}</p>
                    <p className="text-sm font-medium">{field.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="mt-4">
            <Card>
              <CardContent className="flex flex-col gap-3 pt-4">
                <p className="text-sm text-muted-foreground">
                  Longitudinal records — placeholder for Phase 2 wiring.
                </p>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardContent className="flex flex-col gap-3 pt-4">
                <p className="text-sm text-muted-foreground">
                  Visit history — placeholder for Phase 2 wiring.
                </p>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd ../..
git add "apps/web/app/(dashboard)/patients"
git commit -m "feat(web): add mock patients list and detail pages"
```

---

## Task 12: Create Forms Pages

**Files:**
- Create: `apps/web/app/(dashboard)/forms/page.tsx`
- Create: `apps/web/app/(dashboard)/forms/[formId]/page.tsx`

- [ ] **Step 1: Create `forms/page.tsx`**

```tsx
// apps/web/app/(dashboard)/forms/page.tsx
import type { Metadata } from 'next'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Topbar from '@/components/layout/topbar'
import StatusBadge from '@/components/shared/status-badge'
import { MOCK_FORM_INSTANCES, FORM_TYPES } from '@/mock'
import Link from 'next/link'
import { Search, Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Forms — Project LINK' }

export default function FormsPage() {
  return (
    <>
      <Topbar crumbs={[{ label: 'Forms' }]} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
            <p className="text-sm text-muted-foreground">
              Field submissions and validation queue
            </p>
          </div>
          <Button className="gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            New Form
          </Button>
        </div>

        {/* Form type quick links */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FORM_TYPES.map((ft) => (
            <Badge key={ft.id} variant="outline" className="cursor-pointer hover:bg-accent">
              {ft.label}
            </Badge>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input placeholder="Search forms…" className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden sm:table-cell">Form Type</TableHead>
                  <TableHead className="hidden md:table-cell">BHS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_FORM_INSTANCES.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell>
                      <Link
                        href={`/forms/${form.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {form.patientName}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {form.type}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {form.bhsName}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={form.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {form.submittedAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Create `forms/[formId]/page.tsx`**

```tsx
// apps/web/app/(dashboard)/forms/[formId]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import Topbar from '@/components/layout/topbar'
import StatusBadge from '@/components/shared/status-badge'
import { MOCK_FORM_INSTANCES } from '@/mock'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react'

interface Props {
  params: Promise<{ formId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { formId } = await params
  const form = MOCK_FORM_INSTANCES.find((f) => f.id === formId)
  return { title: form ? `${form.type} — Project LINK` : 'Form Not Found' }
}

export default async function FormDetailPage({ params }: Props) {
  const { formId } = await params
  const form = MOCK_FORM_INSTANCES.find((f) => f.id === formId)

  if (!form) notFound()

  return (
    <>
      <Topbar
        crumbs={[
          { label: 'Forms', href: '/forms' },
          { label: form.type },
        ]}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4">
          <Button variant="ghost" size="sm" asChild className="w-fit gap-1 -ml-2">
            <Link href="/forms">
              <ArrowLeft className="h-4 w-4" />
              Back to Forms
            </Link>
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{form.type}</h1>
              <p className="text-sm text-muted-foreground">{form.patientName} — {form.bhsName}</p>
            </div>
            <StatusBadge status={form.status} />
          </div>
        </div>

        {form.status === 'PENDING_VALIDATION' && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Pending Validation</AlertTitle>
            <AlertDescription>
              This form requires review before it can be validated. Check all field values carefully.
            </AlertDescription>
          </Alert>
        )}

        {/* Form fields — skeleton placeholder. Replace with actual form schema fields. */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Form Fields</CardTitle>
            <CardDescription>
              Placeholder — actual form fields load from schema in Phase 2.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Validation actions — separated per clinical UX safety requirement */}
        {form.status === 'PENDING_VALIDATION' && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Validation Actions</CardTitle>
              <CardDescription>
                Validate or return this form to the submitting BHW. These actions are irreversible.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Validate Record
              </Button>
              <Button variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Return to BHW
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
```

- [ ] **Step 3: Run TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd ../..
git add "apps/web/app/(dashboard)/forms"
git commit -m "feat(web): add mock forms list and detail pages with validation UI"
```

---

## Task 13: Create Reports, GIS, and Admin Pages

**Files:**
- Create: `apps/web/app/(dashboard)/reports/page.tsx`
- Create: `apps/web/app/(dashboard)/gis/page.tsx`
- Create: `apps/web/app/(dashboard)/admin/page.tsx`

- [ ] **Step 1: Create `reports/page.tsx`**

```tsx
// apps/web/app/(dashboard)/reports/page.tsx
import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Topbar from '@/components/layout/topbar'
import { MOCK_REPORTS } from '@/mock'
import { Download, FileBarChart } from 'lucide-react'

export const metadata: Metadata = { title: 'Reports — Project LINK' }

const REPORT_STATUS_VARIANT = {
  APPROVED: 'default',
  PENDING_APPROVAL: 'secondary',
  DRAFT: 'outline',
} as const

export default function ReportsPage() {
  return (
    <>
      <Topbar crumbs={[{ label: 'Reports' }]} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground">
              Summary Tables and Monthly Consolidation Tables
            </p>
          </div>
          <Button className="gap-2 sm:w-auto">
            <FileBarChart className="h-4 w-4" />
            Generate Report
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead className="hidden sm:table-cell">Period</TableHead>
                  <TableHead className="hidden md:table-cell">BHS Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Generated</TableHead>
                  <TableHead className="sr-only">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_REPORTS.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {report.period}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {report.bhsCount}
                    </TableCell>
                    <TableCell>
                      <Badge variant={REPORT_STATUS_VARIANT[report.status]}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {report.generatedAt}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" aria-label={`Download ${report.title}`}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
```

- [ ] **Step 2: Create `gis/page.tsx`**

```tsx
// apps/web/app/(dashboard)/gis/page.tsx
import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Topbar from '@/components/layout/topbar'
import { Map } from 'lucide-react'

export const metadata: Metadata = { title: 'GIS — Project LINK' }

export default function GisPage() {
  return (
    <>
      <Topbar crumbs={[{ label: 'GIS' }]} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">GIS</h1>
            <p className="text-sm text-muted-foreground">
              Barangay health map — Dasmariñas City
            </p>
          </div>
          <Badge variant="outline">Phase 2</Badge>
        </div>

        {/* Map placeholder — replace with MapLibre GL JS canvas when wiring */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Barangay Disease Heat Map</CardTitle>
            <CardDescription>
              MapLibre GL JS integration — barangay boundaries and disease alerts.
              Wired in Phase 2.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className="flex h-[480px] w-full items-center justify-center bg-muted"
              role="img"
              aria-label="Map placeholder — GIS not yet implemented"
            >
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Map className="h-12 w-12" aria-hidden="true" />
                <p className="text-sm font-medium">Map loads here (Phase 2)</p>
                <p className="text-xs">MapLibre GL JS · Barangay GeoJSON · Disease overlays</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
```

- [ ] **Step 3: Create `admin/page.tsx`**

```tsx
// apps/web/app/(dashboard)/admin/page.tsx
import type { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Topbar from '@/components/layout/topbar'
import { UserPlus, Shield, Settings2, Database } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin — Project LINK' }

const ADMIN_SECTIONS = [
  {
    icon: UserPlus,
    title: 'User Management',
    description: 'Invite staff, manage roles, deactivate accounts.',
    action: 'Manage Users',
  },
  {
    icon: Shield,
    title: 'Role & Permission Audit',
    description: 'Review role assignments across all BHS stations.',
    action: 'View Audit Log',
  },
  {
    icon: Database,
    title: 'Data Configuration',
    description: 'BHS station registry, barangay list, FHSIS code tables.',
    action: 'Configure',
  },
  {
    icon: Settings2,
    title: 'System Settings',
    description: 'Application configuration and feature flags.',
    action: 'Open Settings',
  },
]

export default function AdminPage() {
  return (
    <>
      <Topbar crumbs={[{ label: 'Admin' }]} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
          <p className="text-sm text-muted-foreground">
            System configuration — System Admin access only
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ADMIN_SECTIONS.map((section) => (
            <Card key={section.title}>
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <section.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">{section.title}</CardTitle>
                  <CardDescription className="mt-0.5 text-xs">
                    {section.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  {section.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User table placeholder */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Staff Accounts</CardTitle>
            <CardDescription>
              All active LINK users — placeholder for Supabase Auth users query.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-1 gap-4">
                  <Skeleton className="h-3 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
```

- [ ] **Step 4: Run TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd ../..
git add "apps/web/app/(dashboard)/reports" "apps/web/app/(dashboard)/gis" "apps/web/app/(dashboard)/admin"
git commit -m "feat(web): add mock reports, GIS placeholder, and admin pages"
```

---

## Task 14: Create 404 Page

**Files:**
- Create: `apps/web/app/not-found.tsx`

- [ ] **Step 1: Create `not-found.tsx`**

```tsx
// apps/web/app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-4xl font-bold tracking-tight">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you are looking for does not exist or you do not have access to it.
      </p>
      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd ../..
git add apps/web/app/not-found.tsx
git commit -m "feat(web): add global 404 not-found page"
```

---

## Task 15: Final Build Verification

**Files:** No new files. Verification only.

- [ ] **Step 1: Run full TypeScript check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run linter**

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 3: Run all unit tests**

```bash
pnpm test:run
```

Expected: all tests pass.

- [ ] **Step 4: Run production build**

```bash
pnpm build
```

Expected: build succeeds. Note and fix any `next build` errors before proceeding.

- [ ] **Step 5: Smoke-test key routes in dev**

```bash
pnpm dev
```

Manually verify (or use curl) that these routes respond without 500 errors:
- `http://localhost:3000/` → redirects to `/dashboard`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/patients`
- `http://localhost:3000/patients/p-001`
- `http://localhost:3000/forms`
- `http://localhost:3000/forms/f-001`
- `http://localhost:3000/reports`
- `http://localhost:3000/gis`
- `http://localhost:3000/admin`
- `http://localhost:3000/login`
- `http://localhost:3000/nonexistent` → 404 page

- [ ] **Step 6: Final commit**

```bash
cd ../..
git add -A
git commit -m "chore(web): verified build and all routes pass smoke test"
```

---

## Self-Review

### Spec Coverage

| Spec Requirement | Task |
|---|---|
| App Router with route groups | Tasks 8, 9 |
| Internal dashboard shell (sidebar, topbar) | Tasks 6, 9 |
| Role-aware nav structure | Task 6 (AppSidebar with role badge) |
| `/dashboard`, `/patients`, `/forms`, `/reports`, `/gis`, `/admin` routes | Tasks 10–13 |
| Mock data isolated for easy removal | Task 4 (mock/ folder) |
| StatusBadge persistent on every clinical list | Tasks 11, 12, 13 |
| HighRiskFlag persistent on patient rows | Task 11 |
| SyncIndicator for offline state | Task 5 (wired in Phase 2) |
| Validation actions separated (clinical safety) | Task 12 (forms/[formId]) |
| Login page (auth group) | Task 8 |
| 404 page | Task 14 |
| shadcn/ui only — no custom primitives | All tasks |
| Tailwind v4 CSS-first (no tailwind.config.js) | globals.css preserved |
| Mobile-first, touch targets ≥ 44px | Mobile nav (min-h-[44px]), layout shell |
| TypeScript throughout | types/ created in Task 3 |
| Vitest tests for components with logic | Task 5 (StatusBadge) |

### Replacement Guide for Future Wiring

When replacing mock data:
1. **patients** — delete `MOCK_PATIENTS` usages, import from TanStack Query hooks calling Supabase
2. **forms** — same pattern
3. **reports** — same pattern + wire FastAPI PDF/XLSX export buttons
4. **dashboard stat cards** — replace static values with Supabase aggregate queries
5. **GIS** — replace `<div>` placeholder with `<MapLibreMap>` component
6. **Login** — wire `<form>` to Supabase Auth `signInWithPassword`
7. **SyncIndicator** — replace props with `useOnlineStatus` + Dexie pending count
8. **MOCK_USER in AppSidebar** — replace with Supabase Auth session hook
