# Plan: BHW ITR Entry — Phase 1 Frontend

## Context

Project LINK is moving into the BHW ITR (Individual Treatment Record) entry phase. BHWs need a search-first workflow to locate existing patients or register new ones, then record clinical encounters offline. This is frontend-only — no Supabase wiring yet. All data lives in mock module-level arrays seeded with realistic Filipino patient data.

The current BHW section has only a dashboard placeholder. This plan builds the full patient and encounter workflow across 5 pages, updates the router, nav, and dashboard.

---

## Files to Create

| File | Purpose |
|:---|:---|
| `frontend/src/types/patients.ts` | `Patient`, `Encounter`, enum types |
| `frontend/src/lib/mock-patients.ts` | 5 mock patients + 10 mock encounters, mutable arrays |
| `frontend/src/pages/bhw/patients/search.tsx` | `PatientSearchPage` — search + results + Register CTA |
| `frontend/src/pages/bhw/patients/new.tsx` | `PatientRegistrationPage` — 3-section registration form |
| `frontend/src/pages/bhw/patients/$id.tsx` | `PatientDetailPage` — Tabs: Summary \| Visit History |
| `frontend/src/pages/bhw/patients/$id.encounters.new.tsx` | `NewEncounterPage` — full ITR entry form |
| `frontend/src/pages/bhw/patients/$id.encounters.$eid.tsx` | `EncounterDetailPage` — read-only encounter view |

## Files to Modify

| File | Change |
|:---|:---|
| `frontend/src/components/layout/nav-config.ts` | Collapse BHW "Patients" to direct link (no children) |
| `frontend/src/app/router.tsx` | Add 5 new BHW routes; update route tree |
| `frontend/src/pages/bhw/dashboard.tsx` | Replace placeholder cards with "Start a Visit" CTA + mock stats |

---

## Types (`frontend/src/types/patients.ts`)

```typescript
export interface Patient {
  id: string              // "KLD-2026-0001"
  philhealth_id: string | null
  last_name: string
  first_name: string
  middle_name: string | null
  suffix: string | null
  sex: 'Male' | 'Female'
  date_of_birth: string   // "YYYY-MM-DD"
  civil_status: 'Single' | 'Married' | 'Widow/er' | 'Separated' | 'Co-habiting'
  barangay: string
  purok: string
  street_house_no: string
  is_nhts: boolean
  is_4ps: boolean
  is_ip: boolean
  created_at: string
}

export type ProgramCategory = 'General' | 'Maternal' | 'EPI' | 'FP' | 'Nutrition' | 'NCD' | 'TB'
export type ConsultationType = 'New Consultation' | 'Follow-up'

export interface Encounter {
  id: string
  patient_id: string
  consultation_type: ConsultationType
  weight: number | null
  height: number | null
  bp_systolic: number | null
  bp_diastolic: number | null
  temperature: number | null
  bmi: number | null          // auto-calculated, stored on save
  program_category: ProgramCategory
  chief_complaint: string
  clinical_notes: string
  diagnosis: string
  consent_given: boolean
  status: 'PENDING_SYNC' | 'PENDING_VALIDATION'
  date_time: string
  provider_id: string
  facility_code: string
}
```

---

## Mock Data (`frontend/src/lib/mock-patients.ts`)

Mutable module-level arrays (pages push to these directly).

```typescript
export const mockPatients: Patient[] = [ /* 5 realistic Filipino patients */ ]
export const mockEncounters: Encounter[] = [ /* 2 encounters per patient = 10 total */ ]

// Utility: generate next patient ID
export function nextPatientId(): string {
  const n = mockPatients.length + 1
  return `KLD-2026-${String(n).padStart(4, '0')}`
}
```

---

## Router Changes (`frontend/src/app/router.tsx`)

### Add imports (after existing BHW imports)
```typescript
import { PatientSearchPage } from '@/pages/bhw/patients/search'
import { PatientRegistrationPage } from '@/pages/bhw/patients/new'
import { PatientDetailPage } from '@/pages/bhw/patients/$id'
import { NewEncounterPage } from '@/pages/bhw/patients/$id.encounters.new'
import { EncounterDetailPage } from '@/pages/bhw/patients/$id.encounters.$eid'
```

### Add route objects
```typescript
const bhwPatientsSearchRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/patients/search',
  component: PatientSearchPage,
})
const bhwPatientsNewRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/patients/new',
  component: PatientRegistrationPage,
})
const bhwPatientDetailRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/patients/$id',
  component: PatientDetailPage,
})
const bhwEncounterNewRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/patients/$id/encounters/new',
  component: NewEncounterPage,
})
const bhwEncounterDetailRoute = createRoute({
  getParentRoute: () => bhwLayoutRoute,
  path: '/patients/$id/encounters/$eid',
  component: EncounterDetailPage,
})
```

### Update route tree
```typescript
bhwLayoutRoute.addChildren([
  bhwDashboardRoute,
  bhwPatientsSearchRoute,
  bhwPatientsNewRoute,
  bhwPatientDetailRoute,
  bhwEncounterNewRoute,
  bhwEncounterDetailRoute,
  bhwCatchAllRoute,   // always last
]),
```

---

## Nav Change (`frontend/src/components/layout/nav-config.ts`)

```typescript
// BEFORE
{
  title: 'Patients', url: '/bhw/patients', icon: Users,
  children: [
    { title: 'Search / Register', url: '/bhw/patients/search' },
    { title: 'Patient ITR', url: '/bhw/patients/itr' },
  ],
},

// AFTER — direct link, no children (NavMain auto-renders as Link when no children)
{ title: 'Patients', url: '/bhw/patients/search', icon: Users },
```

---

## Page Designs

### 1. `PatientSearchPage` — `/bhw/patients/search`

```
useSetPageMeta({ title: 'Patients', breadcrumbs: [{ label: 'Patients' }] })

Layout (space-y-6):
  Row: h1 "Patients" | Button "Register New Patient" → /bhw/patients/new
  Input[search] with Search icon — debounced 300ms, filters mockPatients

  Results (useMemo filter by name, ID, purok — case insensitive):
    Each result → clickable div/Card row:
      Left: patient full name (bold), "KLD-2026-XXXX • Purok X, Barangay" (muted text)
      Right: ChevronRight icon
      onClick → navigate to /bhw/patients/${patient.id}

  Empty state (query present, no results):
    "No patients found for '{query}'"
    Button "Register as New Patient" → /bhw/patients/new?name={query}

  Empty state (no query):
    Hint text: "Search by name, patient ID, or purok"
```

### 2. `PatientRegistrationPage` — `/bhw/patients/new`

```
useSetPageMeta({ title: 'New Patient', breadcrumbs: [
  { label: 'Patients', href: '/bhw/patients/search' },
  { label: 'New Patient' }
]})

Layout:
  Back button (ChevronLeft) → /bhw/patients/search
  h1 "Register New Patient"

  Form (individual useState per field, follows user-form.tsx pattern: Label + Input in div.space-y-2):

  Section 1 — Personal Information (Separator + heading):
    grid 2-col:
      Last Name* (Input)
      First Name* (Input)
      Middle Name (Input, "N/A if not applicable" placeholder)
      Suffix (Input, "Jr., Sr., III" placeholder)
    grid 2-col:
      Sex at Birth* (Select: Male / Female)
      Date of Birth* (Input type="date")
    Civil Status* (Select: Single/Married/Widow/er/Separated/Co-habiting)

  Section 2 — Address (Separator + heading):
    Barangay* (Input)
    grid 2-col:
      Purok / Sub-Zone* (Input)
      Street / House No. (Input)

  Section 3 — Administrative (Separator + heading):
    PhilHealth ID (Input, optional, "00-000000000-0 if Non-Member" placeholder)
    Socio-Economic Classification:
      label "Socio-Economic Classification"
      3× Checkbox rows: NHTS-PR, 4Ps Beneficiary, Indigenous Person (IP)

  Error display (role="alert")
  Buttons: "Register Patient" (primary) | "Cancel" (outline) → navigate(-1)

  handleSubmit:
    validate required fields
    generate id = nextPatientId()
    push to mockPatients
    navigate to /bhw/patients/${id}
```

### 3. `PatientDetailPage` — `/bhw/patients/$id`

```
useParams → { id }
patient = mockPatients.find(p => p.id === id)
encounters = mockEncounters.filter(e => e.patient_id === id).sort(newest first)

useSetPageMeta({ title: `${patient.first_name} ${patient.last_name}`, breadcrumbs: [
  { label: 'Patients', href: '/bhw/patients/search' },
  { label: patient name }
]})

Layout:
  Back button → /bhw/patients/search

  Row: h1 patient full name | Badge patient.id (secondary variant)

  Tabs (defaultValue="summary"):
    TabsList:
      TabsTrigger "summary" → "Summary"
      TabsTrigger "visits" → "Visit History"

    TabsContent "summary":
      Button "New Visit" (Link → /bhw/patients/${id}/encounters/new) — right aligned
      Card grid 2-col (demographics):
        Date of Birth + computed age (e.g., "1985-03-10 (41 yrs)")
        Sex | Civil Status | Purok | Barangay | PhilHealth ID (or "Non-Member")
        Socioeconomic: badges for active flags (NHTS-PR, 4Ps, IP) or "—"

    TabsContent "visits":
      if no encounters → empty state: "No visits recorded yet." + Button "Start First Visit"
      else → list (newest first):
        each Encounter → Card row:
          Left col: date formatted (e.g., "Mar 10, 2026"), consultation type
          Middle: Program Badge (colored by type), diagnosis text (truncated)
          Vitals snippet: "BP: 120/80 mmHg • Weight: 65 kg" (muted text)
          Right: Status Badge (PENDING_SYNC / PENDING_VALIDATION), ChevronRight
          click → /bhw/patients/${id}/encounters/${encounter.id}
```

### 4. `NewEncounterPage` — `/bhw/patients/$id/encounters/new`

```
useParams → { id }
patient = mockPatients.find(p => p.id === id)

useSetPageMeta({ title: 'New Visit', breadcrumbs: [
  { label: 'Patients', href: '/bhw/patients/search' },
  { label: patient name, href: `/bhw/patients/${id}` },
  { label: 'New Visit' }
]})

State: individual useState for each field + consentGiven (boolean, default false)
bmi = useMemo(() => calculateBMI(weight, height), [weight, height])

Layout:
  Back button → /bhw/patients/${id}
  h1 "New Visit"
  p.muted "{patient.first_name} {patient.last_name} • {patient.id}"

  Form sections (space-y-8, each with Separator + small heading):

  Section 1 — Consultation Type:
    Tabs variant="line" (acts as segmented control):
      TabsTrigger: "New Consultation" | "Follow-up"
    (Controls consultationType state)

  Section 2 — Vitals:
    grid 2-col sm:
      Weight (kg) — Input type="number" step="0.1"
      Height (cm) — Input type="number" step="0.1"
    BMI display (read-only computed card): auto-updates as weight/height typed
      "BMI: 23.4 — Normal" (with color classification)
    grid 2-col sm:
      BP — two Inputs side by side with "/" divider:
        Input[systolic placeholder="120"] / Input[diastolic placeholder="80"]
        Label "Blood Pressure (mmHg)" above both
      Temperature (°C) — Input type="number" step="0.1"

  Section 3 — Program Classification:
    Select (Program Category): General / Maternal / EPI / FP / Nutrition / NCD / TB

  Section 4 — Clinical Notes:
    Chief Complaint — Textarea (placeholder: "e.g., Lagnat at ubo")
    Clinical Notes — Textarea (placeholder: "Physical exam observations...")
    Diagnosis / Impression — Textarea (placeholder: "Initial assessment...")

  Section 5 — Consent:
    Checkbox row: consentGiven
    Label: "I have obtained the patient's informed consent as required under the Data Privacy Act of 2012 (RA 10173)."

  Sticky bottom bar (border-t, bg-background):
    Button "Save" (disabled when !consentGiven)
    Button "Cancel" variant="ghost" → navigate back

  handleSave:
    build Encounter object with current timestamp, provider_id from session.user.id, facility_code from healthStationId (or "KLD-BHS-01" mock)
    push to mockEncounters
    navigate to /bhw/patients/${id}
```

### 5. `EncounterDetailPage` — `/bhw/patients/$id/encounters/$eid`

```
useParams → { id, eid }
encounter = mockEncounters.find(e => e.id === eid)
patient = mockPatients.find(p => p.id === id)

useSetPageMeta({ title: 'Visit Details', breadcrumbs: [
  { label: 'Patients', href: '/bhw/patients/search' },
  { label: patient name, href: `/bhw/patients/${id}` },
  { label: 'Visit Details' }
]})

Same layout as NewEncounterPage except:
  - h1 "Visit Details" + Badge encounter.status (top right)
  - Admin metadata card at top (below h1):
      Date & Time, Provider ID, Facility Code
  - All Inputs: readOnly + disabled styling
  - Tabs "line" shows selected but disabled
  - BMI display shown as stored value
  - Consent row shows checked + disabled
  - Bottom bar: only "Back" button
```

### 6. `BHWDashboardPage` update

```
Replace existing 4 placeholder cards with:

  Prominent CTA Card (border-primary/30 bg-primary/5):
    h2 "Start a Visit"
    p "Search for a patient or register someone new."
    Button "Go to Patients" → /bhw/patients/search (with ArrowRight icon)

  Stats row (grid 3-col):
    Card: "5" / "Patients Registered"
    Card: "2" / "Visits Today"
    Card: "0" / "Pending Sync" (with Wifi icon)

  (Remove the "Phase 2 features incoming" banner)
```

---

## Utilities

### BMI calculation (inline in new encounter page)
```typescript
function calculateBMI(weight: number | null, height: number | null): number | null {
  if (!weight || !height || height === 0) return null
  const heightM = height / 100
  return Math.round((weight / (heightM * heightM)) * 10) / 10
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-600' }
  if (bmi < 25) return { label: 'Normal', color: 'text-green-600' }
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-600' }
  return { label: 'Obese', color: 'text-destructive' }
}
```

### Age calculation (inline in patient detail)
```typescript
function calculateAge(dob: string): number {
  const today = new Date()
  const d = new Date(dob)
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age
}
```

---

## Shadcn Components Used

All already installed — no `npx shadcn add` needed.

| Component | Used In |
|:---|:---|
| `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent` | PatientDetailPage (Summary/History), NewEncounterPage (consultation type toggle) |
| `Textarea` | NewEncounterPage (clinical notes × 3) |
| `Checkbox` | PatientRegistrationPage (socioeconomic × 3), NewEncounterPage (consent) |
| `Select` + `SelectTrigger` + `SelectContent` + `SelectItem` + `SelectValue` | Registration (sex, civil status), New Encounter (program category) |
| `Badge` | PatientDetailPage (patient ID, encounter status, program type), EncounterDetailPage (status) |
| `Separator` | Form section dividers in Registration and Encounter pages |
| `Card` + `CardContent` | Search results, patient summary, vitals BMI display, dashboard stats |
| `Input` | All text/number/date fields |
| `Label` | All field labels |
| `Button` | All CTAs and actions |
| `Breadcrumb` (via useSetPageMeta) | All sub-pages |

---

## Implementation Order

1. `types/patients.ts` — types first (blocks all other files)
2. `lib/mock-patients.ts` — mock data (blocks pages)
3. `nav-config.ts` — nav change (independent)
4. `router.tsx` — add routes (needs page imports, add after pages are created)
5. `pages/bhw/patients/search.tsx`
6. `pages/bhw/patients/new.tsx`
7. `pages/bhw/patients/$id.tsx`
8. `pages/bhw/patients/$id.encounters.new.tsx`
9. `pages/bhw/patients/$id.encounters.$eid.tsx`
10. `pages/bhw/dashboard.tsx` — update last

---

## Verification

1. `npm run dev` in `frontend/` — no TypeScript or build errors
2. `npm run lint` — passes clean
3. Manual smoke test as BHW user:
   - Nav shows single "Patients" link (no collapsible children)
   - Search page loads, filtering works against mock data
   - Patient detail opens with Summary and Visit History tabs
   - New Visit form: BMI calculates reactively, Save disabled until consent checked
   - Submitting new encounter → redirects to patient detail, encounter appears in Visit History
   - Visit History → click encounter → read-only view, no Save button
   - Register New Patient → generates ID, redirects to new patient detail
