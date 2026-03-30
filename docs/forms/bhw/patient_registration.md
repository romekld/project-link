# Patient Registration Form — Entry (Administrative)

**Role:** bhw
**Purpose:** Registers a new patient into the system, creating their persistent demographic profile (ITR Section A — Patient Profile). Required before any clinical service encounter can be recorded. Establishes the unified patient ID and links the patient to their household (Family Serial Number).
**FHSIS Reference:** FHSIS MOP 2018, Chapter 2 (ITR overview, doc page 187) + Chapter 3 (HH Profile linking). DOH Form: Generic ITR — Section A (Patient Profile).
**Who fills it:** BHW (at first encounter with a patient not yet in the system during home visits or outreach)
**Who reviews/approves it:** Patient registration is not subject to the clinical validation gate. Demographic records are administrative. Clinical encounters created after registration use `PENDING_VALIDATION`.
**Frequency:** Once per patient (at first encounter). Demographic updates permitted by BHW within their BHS scope.
**Storage location:** `patients` table.

---

## Required Fields

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `last_name` | VARCHAR(100) | Required. Uppercase preferred. | Paper form shows "Name" as compound — normalized into separate columns per field normalization rules. |
| `first_name` | VARCHAR(100) | Required. | |
| `date_of_birth` | DATE | Required. Format: `YYYY-MM-DD`. If exact date unknown, estimate and set `dob_estimated = true`. | Age computed dynamically from DOB. Display in months if <2 years. Never store age as a DB column. |
| `sex_at_birth` | ENUM | `Male` / `Female`. Required. DOH/FHSIS standard. | |
| `civil_status` | ENUM | `Single` / `Married` / `Widow/er` / `Separated` / `Co-habiting`. Required. | |
| `purok` | VARCHAR(100) | Required. Critical for GIS accuracy and purok-level health mapping. | Paper form: part of "Complete Address" compound field — normalized. |
| `barangay_id` | UUID | FK to `barangays`. Required. Defaults to BHW's assigned barangay. | |
| `nhts_status` | ENUM | `NHTS` / `Non-NHTS`. Required. | Captured once at registration. Propagates automatically to all encounter records for this patient — do NOT re-prompt at each visit. FHSIS 2018 disaggregation requirement. |
| `health_station_id` | UUID | FK to `health_stations`. Required. Set from BHW JWT claim; never editable by user. | RLS: patients scoped to their BHS. |
| `consent_obtained` | BOOLEAN | Must be `true` before any PII is saved. Gate at form level — "Have you obtained the patient's consent under RA 10173?" | RA 10173 Data Privacy Act requirement. Non-negotiable. Form cannot proceed to data entry until consent is confirmed. |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `middle_name` | VARCHAR(100) | Optional. Enter "N/A" if none. | |
| `suffix` | VARCHAR(10) | Optional. | Jr., Sr., III, etc. |
| `dob_estimated` | BOOLEAN | Set when exact DOB is unknown. Default: false. | Flag shown in UI next to computed age when DOB is estimated. |
| `house_number` | VARCHAR(20) | Optional. | Normalized from "Complete Address" compound paper field. |
| `street` | VARCHAR(100) | Optional. | |
| `household_id` | UUID | Optional but strongly encouraged. FK to `households`. | Links patient to their HH Profile record. Establishes Family Serial Number linkage. Auto-populated if patient is being registered from an HH Profile context. |
| `guardian_last_name` | VARCHAR(100) | Required if patient is a minor (<18 years old) or PWD. | Paper form: "Parent/Guardian/Contact Person" — normalized. |
| `guardian_first_name` | VARCHAR(100) | Required if patient is a minor or PWD. | |
| `guardian_middle_name` | VARCHAR(100) | Optional. | |
| `guardian_relationship` | VARCHAR(50) | Shown when guardian fields are active. | Free text. E.g., "Mother," "Father," "Guardian." |
| `contact_number` | VARCHAR(20) | Optional but encouraged. Format: `+639XXXXXXXXX`. | |
| `philhealth_id` | VARCHAR(20) | Optional. Format: `XX-XXXXXXXXX-X`. Use `00-000000000-0` if non-member. | |
| `philhealth_category` | ENUM | Shown when `philhealth_id` is entered. | `Formal Economy` / `Informal Economy` / `Indigent/Sponsored` / `Senior Citizen` / `Other`. |
| `is_4ps_beneficiary` | BOOLEAN | Optional. Default: false. | 4Ps beneficiary flag. Part of socio-economic profile. |
| `is_indigenous_person` | BOOLEAN | Optional. Default: false. | Individual-level IP flag. |
| `religion` | VARCHAR(100) | Optional free text. | |
| `occupation` | VARCHAR(100) | Optional. | Relevant for infectious disease exposure tracking (TB occupational risk). |

---

## Enums / Controlled Vocabularies

- `sex_at_birth`: `Male` / `Female`
- `civil_status`: `Single` / `Married` / `Widow/er` / `Separated` / `Co-habiting`
- `nhts_status`: `NHTS` / `Non-NHTS`
- `philhealth_category`: `Formal Economy` / `Informal Economy` / `Indigent/Sponsored` / `Senior Citizen` / `Other`

---

## UX / Clinical Safety Concerns

- **DPA Consent Gate (non-negotiable):** The very first screen of patient registration must present a consent prompt referencing RA 10173 Data Privacy Act 2012. The form cannot proceed to data entry until the BHW confirms `consent_obtained = true`. Text suggestion: "Before registering this patient, confirm you have explained that their health data will be stored and used for public health services under RA 10173."
- **Search before register (duplicate prevention):** The BHW UI must enforce a patient search step before allowing new registration. The search must run against the local Dexie.js cache (offline) and the API (online). Prevent duplicate records — a patient already registered at another BHS visit would already exist. Prompt: "Is this patient already in the system? Search first."
- **Auto-generate Unified Patient ID:** The `unified_patient_id` is system-generated on the server at first sync. Never displayed as an editable field. Shown as a read-only badge on the patient card after registration is confirmed. Temporary local ID used offline until server assigns the permanent ID.
- **NHTS required — inline warning:** If BHW attempts to submit without selecting NHTS status, show inline: "NHTS status is required. This field is used for national health reporting." Do not silently default.
- **Auto-link to household context:** If registration is initiated from an HH Profile record, auto-populate `household_id`, `barangay_id`, `purok`, and address fields from the household record. Confirm with BHW before saving the link.
- **Age display format:** Computed age must display as "X months" if under 24 months, "X years X months" if 2–5 years old, and "X years" otherwise. Never display age in years only for infants.
- **Offline-first:** Patient registration must be fully available offline. New patients saved offline receive a temporary local UUID; the permanent `unified_patient_id` is assigned by the server on sync. The BHW sees "Registration saved locally — will sync when online."
- **Touch targets:** 44×44px minimum for all interactive elements.
- **NHTS propagation (engineering note):** On every clinical encounter INSERT for this patient, automatically set `encounter.nhts_status = patients.nhts_status`. Never require the BHW to re-enter NHTS status at each visit. If NHTS status is later updated on the patient record, create an audit log entry and update future (not past) encounters.
- **Guardian fields progressive disclosure:** Guardian fields appear automatically when computed age indicates patient is <18 years old. The system infers this from `date_of_birth` in real time — the BHW should not manually trigger this section.

---

## Database Schema Notes

- **Table:** `patients` — one row per registered patient. The canonical PII store.
- **FK:** `patients.health_station_id` → `health_stations`. `patients.household_id` → `households` (nullable). `patients.barangay_id` → `barangays`.
- **Unique constraint:** `patients.unified_patient_id UNIQUE NOT NULL` (assigned by server; NULL until first sync completes).
- **Indexes:** `patients(health_station_id)`, `patients(last_name, first_name)` (composite for search), `patients(unified_patient_id)`, `patients(household_id)` where not null, `patients(date_of_birth)` (for age-group queries).
- **Soft delete:** `patients.deleted_at TIMESTAMPTZ`. All reads filter `WHERE deleted_at IS NULL`. RA 10173 — no hard deletes.
- **No `record_status`:** Patient registration is administrative. Clinical encounters have `record_status`.
- **PII protection:** `patients` table is PII-classified. No PII fields (name, DOB, address, contact, PhilHealth ID) must appear in `audit_logs`. Audit log entries reference only `patient_id` (UUID), not names or demographic data.
- **DPA consent column:** `patients.consent_obtained BOOLEAN NOT NULL DEFAULT FALSE`. Application must enforce `consent_obtained = TRUE` before INSERT of any patient row with PII data. Check at both UI layer and API layer.
- **NHTS propagation mechanism:** Application layer (or PostgreSQL trigger on `patients`) must set `nhts_status` on all new encounter INSERT operations. Store `nhts_status` denormalized on each encounter table for efficient FHSIS indicator queries — avoids JOINs on every report generation.
- **Temporary local ID:** Dexie.js schema must support a `local_id` (UUID v4, generated client-side) separate from `unified_patient_id` (assigned by server). After sync, `unified_patient_id` replaces `local_id` as the primary reference.
