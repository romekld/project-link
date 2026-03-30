# TB DOTS Daily Check-in — Entry (Clinical)

**Role:** bhw
**Purpose:** Records daily medication observation during active TB treatment. The BHW (as the assigned DOTS observer) confirms that the patient swallowed all prescribed TB drugs under direct observation. Feeds the NTP Registry DOTS attendance calendar and drives defaulter detection logic.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 5 — Infectious Disease Prevention and Control Services / TB (Group B) (PDF pages 285–332, doc pages 271–318). TB is a Group B program — full case management is in ITIS (NTP MIS); Project LINK stores minimum local BHW-captured data. DOH Form: TB DOTS Observation Log / Treatment Card (daily section).
**Who fills it:** BHW (daily, as the assigned DOTS observer during both Intensive and Continuation phases of TB treatment)
**Who reviews/approves it:** Midwife (monitors DOTS attendance via NTP Registry; receives defaulter alerts; the NTP Registry itself is maintained by the Midwife)
**Frequency:** Every calendar day during active TB treatment. DS-TB standard regimen: 6 months total (2-month Intensive + 4-month Continuation). DR-TB regimens are longer.
**Storage location:** `dots_observations` table (one row per calendar day per TB case); parent: `tb_cases` table (one row per TB episode, maintained by Midwife).

---

## Required Fields

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `tb_case_id` | UUID | FK to `tb_cases`. Required. Must be an active TB case with `assigned_dots_observer_id = current BHW user_id`. | BHW sees only TB cases assigned to them. Assignment is done by the Midwife at case registration. |
| `patient_id` | UUID | FK to `patients`. Required. | Can be derived from `tb_cases.patient_id`. Denormalized for query efficiency. |
| `observation_date` | DATE | Required. Format: `YYYY-MM-DD`. Cannot be a future date. Unique per `(tb_case_id, observation_date)` — no duplicate daily entries. | System defaults to today. BHW can enter a past date if recording a missed backlog (within the current treatment month). |
| `drugs_taken` | BOOLEAN | Required. | `true` = patient took ALL prescribed drugs under direct observation. `false` = patient did not take drugs (missed dose). This is the primary clinical data point of this form. |
| `observer_id` | UUID | FK to `user_profiles`. Set from BHW JWT; never editable. | BHW performing the observation. |
| `health_station_id` | UUID | FK to `health_stations`. Set from BHW JWT. | |
| `record_status` | ENUM | `PENDING_SYNC` → `PENDING_VALIDATION` → `VALIDATED` / `RETURNED`. | Digital Validation Gate. |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `adverse_drug_reaction` | BOOLEAN | Always shown. Default: false. | "Did the patient experience any adverse drug reaction?" Yes / No. |
| `adr_description` | TEXT | Required when `adverse_drug_reaction = true`. | Free text description of the adverse event. Triggers an immediate Midwife notification and in-app referral recommendation. |
| `side_effects_noted` | TEXT | Optional. Shown for any observation. | Less severe than ADR — general side effects the patient reported (nausea, dizziness, etc.). Free text. |
| `observer_initials` | VARCHAR(10) | Optional. | BHW initials. For paper-equivalent traceability when printed records are required. |
| `missed_dose` | BOOLEAN (computed) | Computed: `NOT drugs_taken`. | Stored redundantly for fast query on defaulter detection. Auto-set on save. |
| `home_visit_conducted` | BOOLEAN | Shown when `drugs_taken = false` (missed dose follow-up context). | Yes / No. Did the BHW conduct a home visit to follow up on this missed dose? |
| `home_visit_notes` | TEXT | When `home_visit_conducted = true`. | Notes from the follow-up home visit. |

---

## Enums / Controlled Vocabularies

- `record_status`: `PENDING_SYNC` / `PENDING_VALIDATION` / `VALIDATED` / `RETURNED`

> Note: This form is intentionally minimal. The only clinical enum is `record_status`. All other fields are BOOLEAN or text. `drugs_taken` and `adverse_drug_reaction` are the two most important fields.

---

## UX / Clinical Safety Concerns

- **Fast-entry optimized (critical):** This is the highest-frequency form in the system — entered every day, often for multiple patients, in the field. The design must minimize taps to the common-case path (drugs taken, no ADR):
  1. Patient auto-selected from BHW's active DOTS patient list.
  2. `observation_date` defaults to today.
  3. One prominent, full-width green **"DRUGS TAKEN ✓"** button = primary action.
  4. A separate, smaller **"MISSED / OTHER"** button opens the ADR and side-effects fields.
  Sub-3-tap entry for the common case is the target.
- **DOTS calendar view (offline):** The full DOTS attendance calendar for each patient (green = taken, red = missed, grey = not yet due / no entry) must render from locally cached Dexie.js data — not require an API call. BHWs need to see attendance history in the field to determine if a home visit is already overdue.
- **Missed dose immediate escalation:**
  - 1 missed dose → show: "Missed dose recorded for [date]. Please follow up with the patient and encourage them to resume treatment."
  - 2 consecutive missed doses → show: "⚠ 2 consecutive missed doses. A home visit is required. This patient is at risk of becoming a defaulter." Notify the Midwife in the validation queue.
  - ≥2 months missed (cumulative, non-consecutive) → Lost to Follow-up candidate. Midwife must confirm status change via confirmation gate.
- **Duplicate prevention:** Before allowing submission of a new observation for today, check locally cached `dots_observations` for the same `(tb_case_id, observation_date)`. If an entry already exists, show the existing record: "A DOTS entry for today already exists. Do you want to update it?" Never silently create a duplicate.
- **ADR escalation — immediate:** When `adverse_drug_reaction = true` is submitted, trigger an in-app alert: "⚠ Adverse drug reaction reported. This patient must be evaluated at the BHS/RHU before continuing treatment. The Midwife has been notified." Do not let the BHW mark the next day's drugs as taken without clearing the ADR alert.
- **Offline-first (most critical form):** The daily DOTS log is the most operationally critical offline use case. BHWs observe TB patients in remote puroks with no connectivity. The form must save to Dexie.js immediately. Sync must be reliable and use idempotent upsert by `(tb_case_id, observation_date)` — never create duplicates on retry.
- **Treatment phase display:** Show the patient's current treatment phase (Intensive / Continuation), treatment start date, and days remaining prominently in the form header. This provides context for the BHW without requiring them to navigate to the full NTP Registry.
- **Touch targets:** 44×44px minimum. The "Drugs Taken" YES button should be large and high-contrast (full-width green). The "MISSED / OTHER" path should be visually secondary to reduce accidental taps.
- **Patient list for DOTS:** The BHW home screen must show an active DOTS patient list with today's observation status: green checkmark (recorded), red dot (not yet recorded), or amber (missed — requires follow-up). This is the daily operational dashboard for TB DOTS work.
- **Pre-population:** `observation_date` = today. `tb_case_id` and `patient_id` selected from BHW's DOTS patient list. `observer_id` and `health_station_id` from JWT. No manual linking required by BHW.

---

## Database Schema Notes

- **Table:** `dots_observations` — one row per calendar day per TB case.
- **FK:** `dots_observations.tb_case_id` → `tb_cases`. `dots_observations.observer_id` → `user_profiles`. `dots_observations.patient_id` → `patients` (denormalized).
- **Unique constraint (critical):** `UNIQUE(tb_case_id, observation_date)` — enforced at database level. Prevents duplicate daily entries regardless of client behavior. Enables idempotent upsert on sync retry.
- **record_status:** `dots_observations.record_status ENUM('PENDING_SYNC','PENDING_VALIDATION','VALIDATED','RETURNED')`.
- **`missed_dose` computed column:** `missed_dose BOOLEAN GENERATED ALWAYS AS (NOT drugs_taken) STORED` — or set by application on save. Enables fast `WHERE missed_dose = true` queries for defaulter detection.
- **Defaulter detection job (background):** Daily scheduled job:
  - Query: active `tb_cases` → join `dots_observations` → find cases with 2 consecutive `drugs_taken = false` entries → create BHW follow-up task.
  - Query: active `tb_cases` → count cumulative missed days ≥60 → flag as Lost to Follow-up candidate → notify Midwife for confirmation.
- **Soft delete:** `dots_observations.deleted_at TIMESTAMPTZ`. All reads: `WHERE deleted_at IS NULL`. RA 10173 — no hard deletes.
- **ITIS sync:** `dots_observations` must sync to ITIS (NTP national system) as part of the ITIS integration layer. Sync payload: `(tb_case_id, observation_date, drugs_taken, adr_flag)`. Project LINK is the local capture system; ITIS is the system of record. Use ITIS patient/case identifiers as FK in the sync mapping table.
- **Offline sync batching:** Multiple offline observations (e.g., 7 days accumulated between connectivity windows) sync as a batch. Idempotency guaranteed by the `UNIQUE(tb_case_id, observation_date)` constraint and upsert semantics (`ON CONFLICT DO UPDATE`).
- **NHTS propagation:** `dots_observations.nhts_status` inherited from `patients.nhts_status` (via `tb_cases.patient_id`). Set on INSERT.
- **Indexes:** `dots_observations(tb_case_id, observation_date)` (primary lookup), `dots_observations(missed_dose)` (defaulter detection), `dots_observations(record_status)`, `dots_observations(observation_date)` (calendar queries).
- **High-risk flag on `tb_cases`:** When Lost to Follow-up is confirmed by Midwife: `tb_cases.is_high_risk = true`. Persistent red badge on patient card across all ITR tabs.

---

## Reports and Exports

This form feeds the following FHSIS minimum TB indicators (via NTP Registry → MCT → M1 Report, aligned with ITIS):

| Indicator | Source | Target |
|:----------|:-------|:-------|
| DS-TB cases enrolled on treatment | `tb_cases.treatment_start_date IS NOT NULL` AND `tb_classification = 'DS-TB'` | N/A (count) |
| DS-TB Treatment Success Rate | `tb_cases.treatment_outcome IN ('Cured','Treatment Completed')` / total enrolled | ≥88% (WHO target) |
| DR-TB cases enrolled on treatment | `tb_cases.tb_classification = 'DR-TB'` | N/A (count) |
| DOTS attendance rate | `COUNT(drugs_taken = true)` / `COUNT(total observations in treatment period)` | Tracked per case |
| Lost to Follow-up cases | `tb_cases.treatment_outcome = 'Lost to Follow-up'` | Minimize |
