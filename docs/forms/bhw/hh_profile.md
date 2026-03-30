# HH Profile Form — Administrative / Profiling

**Role:** bhw
**Purpose:** Baseline demographic census of every household in the BHW's catchment area. Feeds the Midwife's Master Lists for all targeted client groups (pregnant women, infants, children 12–59 months, adults 20+). Provides population denominators for all FHSIS coverage indicators.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 3 — Profiling of Households (PDF pages 44–48, doc pages 30–34). DOH Form 1 — HH Profile.
**Who fills it:** BHW (primary recorder during quarterly house-to-house visits)
**Who reviews/approves it:** Midwife (reviews completeness; compiles into Master Lists). No clinical status gate — administrative intake flow only.
**Frequency:** Annual (January — full census) + quarterly updates at the start of Q2 (April), Q3 (July), Q4 (October).
**Storage location:** `households` table (household-level info) + `household_members` table (one row per member per household).

---

## Required Fields

### Part 1 — Household-Level Information

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `household_number` | VARCHAR(30) | Unique per BHS per year. Format: `{BHS_CODE}-{YYYY}-{NNNN}` (e.g., `BHS01-2026-0042`). System-generated on first save. Immutable once assigned. | FHSIS "Family Serial Number" — used as linking key across ITR, TCL, MCT. Prefix with BHS code for city-wide uniqueness. |
| `health_station_id` | UUID | FK to `health_stations`. Set from BHW JWT claim; never editable by user. | RLS enforcement: BHW can only create/view households in their assigned BHS. |
| `assigned_bhw_id` | UUID | FK to `user_profiles`. Defaults to current BHW user. Midwife can reassign. | Required for BHW-household assignment tracking. |
| `visit_date_q1` | DATE | January only. Format: `YYYY-MM-DD`. Required for the initial annual census. | Paper form field 1a. |
| `respondent_last_name` | VARCHAR(100) | Required. | Paper form shows "Name of Respondent" as a compound field — normalized into separate columns. |
| `respondent_first_name` | VARCHAR(100) | Required. | |
| `nhts_status` | ENUM | `NHTS-4Ps` / `Non-NHTS`. Required. | Paper form field 3. Used for all FHSIS disaggregation joins. |
| `is_indigenous_people` | BOOLEAN | Required. Default: false. | Paper form field 4. Household-level IP flag. |
| `hh_head_philhealth_member` | BOOLEAN | Required. | Paper form field 5. |

### Part 2 — Household Member Roster (one row per member in `household_members`)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `household_id` | UUID | FK to `households`. Required. | |
| `member_last_name` | VARCHAR(100) | Required. | Paper form: "Last Name, First Name, Mother's Maiden Name" — normalized. |
| `member_first_name` | VARCHAR(100) | Required. | |
| `relationship_to_hh_head` | ENUM | `1-Head` / `2-Spouse` / `3-Son` / `4-Daughter` / `5-Others`. Required. | Paper form field 7. |
| `sex` | ENUM | `M` / `F`. Required. | Paper form field 8. |
| `date_of_birth` | DATE | Format: `YYYY-MM-DD`. Estimate if unknown; set `dob_estimated = true`. | Paper form field 10. Age computed dynamically from DOB — never stored as a separate column. |
| `classification_q1` | ENUM | See Age/Health Risk Group Codes below. Required when Q1 visit is conducted. | Paper form field 11 — first quarter column. |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `respondent_middle_name` | VARCHAR(100) | Optional. | Normalized from "Name of Respondent" compound field. |
| `hh_head_philhealth_id` | VARCHAR(20) | Shown when `hh_head_philhealth_member = true`. Format: `XX-XXXXXXXXX-X`. | Paper form field 5. |
| `hh_head_philhealth_category` | ENUM | Shown when `hh_head_philhealth_member = true`. | `Formal Economy` / `Informal Economy` / `Indigent/Sponsored` / `Senior Citizen` / `Other`. |
| `visit_date_q2` | DATE | Shown at Q2 update mode (April). | Paper form field 1b. |
| `visit_date_q3` | DATE | Shown at Q3 update mode (July). | Paper form field 1c. |
| `visit_date_q4` | DATE | Shown at Q4 update mode (October). | Paper form field 1d. |
| `member_mothers_maiden_name` | VARCHAR(100) | Optional. | Part of the member name on paper form — normalized as separate field. |
| `dob_estimated` | BOOLEAN | Set when exact DOB is unknown. Default: false. | Flag shown in UI when DOB is estimated. Affects age-based auto-classification reliability. |
| `classification_q2` | ENUM | Set during Q2 update visit. | Reclassify as health status changes each quarter. |
| `classification_q3` | ENUM | Set during Q3 update visit. | |
| `classification_q4` | ENUM | Set during Q4 update visit. | |
| `member_remarks` | TEXT | Any member. | Paper form field 12. Use for: PhilHealth details for members ≥21, transferred household, new resident notes. |
| `member_philhealth_id` | VARCHAR(20) | Prompted when computed age of member is ≥21 years. Format: `XX-XXXXXXXXX-X`. | On paper: noted in Remarks column for adults ≥21. Normalized as explicit column in DB. |
| `patient_id` | UUID | FK to `patients`. Set when this HH member has been registered as a patient in the clinical system. | Links HH member to their patient ITR for clinical tracking and Master List population. Nullable until registered. |

---

## Enums / Controlled Vocabularies

### Age / Health Risk Group Classification Codes (Paper form field 11)

| Code | Classification | Age / Condition |
|:-----|:---------------|:----------------|
| `N` | Newborn | 0–28 days old |
| `I` | Infant | 29 days – 11 months old |
| `U` | Under-five Child | 1–4 years old (12–59 months) |
| `S` | School-Aged Child | 5–9 years old |
| `A` | Adolescent | 10–19 years old |
| `P` | Pregnant | Any pregnant woman (even if <15 or >49 y/o) |
| `AP` | Adolescent-Pregnant | Pregnant AND 10–19 years old simultaneously |
| `PP` | Post-Partum | Gave birth in the last 6 weeks (even if <15 or >49 y/o) |
| `WRA` | Women of Reproductive Age | Female, 15–49 years old, not currently pregnant or postpartum |
| `SC` | Senior Citizen | 60 years old and above |
| `PWD` | Person with Disability | Any age |
| `AB` | Adult | 20–59 years old (see Open Questions — lower bound discrepancy in FHSIS MOP text vs. form template) |

> A member may carry multiple codes if conditions overlap (e.g., `AP` = adolescent and pregnant simultaneously). Always use the most clinically specific code. Reclassify at each quarterly update.

### Relationship to HH Head

`1-Head` / `2-Spouse` / `3-Son` / `4-Daughter` / `5-Others (specify)`

### NHTS Status

`NHTS-4Ps` / `Non-NHTS`

### PhilHealth Category

`Formal Economy` / `Informal Economy` / `Indigent/Sponsored` / `Senior Citizen` / `Other`

---

## UX / Clinical Safety Concerns

- **Offline-first (critical):** HH Profile is the most common offline use case. The full form — household record + all member rows — must save to Dexie.js on every field change. Entire household batch syncs as a unit when connectivity is restored.
- **Quarterly update mode vs. full-entry mode:** On opening an existing household in a subsequent quarter, the form opens in "Update mode" — Q1 data visible but read-only; new quarter classification columns enabled. Do not force the BHW to re-enter all data from scratch each quarter.
- **Auto-classify from DOB:** System should auto-suggest classification codes from `date_of_birth` + any known pregnancy/postpartum flags from prior clinical records. Codes must be user-confirmable — not locked — because the BHW may have field knowledge the system doesn't (e.g., an unregistered pregnancy).
- **PhilHealth prompt for ≥21:** When a member's computed age (from DOB) is ≥21 years, auto-show the `member_philhealth_id` field and prompt: "Please enter PhilHealth ID if enrolled."
- **Member row management:** Adding household members uses a repeatable row pattern. Handle up to 20+ members gracefully on mobile. Row-level add/remove with large tap targets.
- **No clinical status gate:** HH Profiles are administrative — they do not go through `PENDING_VALIDATION`. The BHW submits → Midwife receives in the HH Profile inbox. No `record_status` enum on `households` or `household_members` tables.
- **Sync indicator:** Always show online/offline status and pending-sync count. Per-household sync status visible in the HH Profile list.
- **Touch targets:** 44×44px minimum for all interactive elements including classification enum selectors and checkboxes.
- **Household number display:** Show the assigned `household_number` (Family Serial Number) on the household card after first save. Used for all FHSIS cross-form linking.

---

## Database Schema Notes

- **Tables:** `households` (one row per household per annual cycle), `household_members` (one row per member per household).
- **FK:** `households.health_station_id` → `health_stations`. `households.assigned_bhw_id` → `user_profiles`. `household_members.household_id` → `households`. `household_members.patient_id` → `patients` (nullable).
- **No `record_status`:** HH Profiles are administrative. They do not use the clinical record status enum.
- **Soft delete:** `households.deleted_at TIMESTAMPTZ`, `household_members.deleted_at TIMESTAMPTZ`. All reads filter `WHERE deleted_at IS NULL`.
- **Household year:** Store `year INTEGER` on `households` to disambiguate annual cycles. Unique constraint: `UNIQUE(health_station_id, household_number, year)`.
- **Quarterly classification storage:** `classification_q1` through `classification_q4` as four ENUM columns on `household_members`. Alternative (more normalized): child table `hh_member_classifications(member_id, year, quarter, classification_code)` — use if quarterly history across multiple years is needed.
- **Household number immutability:** `household_number` must have a `NOT NULL` constraint and should not be updatable after creation. Prefix with BHS code to ensure city-wide uniqueness.
- **NHTS flag propagation:** `households.nhts_status` propagates to all `household_members` rows at insert. If household NHTS status changes, update member rows accordingly (trigger or application layer).
- **Indexes:** `households(health_station_id, year)`, `households(assigned_bhw_id)`, `household_members(household_id)`, `household_members(patient_id)` where not null, `household_members(classification_q1)` (for Master List population queries).
