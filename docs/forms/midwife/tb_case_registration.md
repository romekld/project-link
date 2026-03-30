# TB Case Registration — Entry

**Role:** Midwife (RHM)
**Purpose:** Registration form for enrolling a new TB case into the NTP Registry. Captures patient link, case classification, bacteriological status, treatment regimen, and assigns a DOTS observer (BHW). This is the entry point for the TB Case Lifecycle (Flow 9).
**FHSIS Reference:** FHSIS MOP 2018, Chapter 5 — Infectious Disease Prevention and Control; NTP Protocol
**Who fills it:** Midwife (primary); MHO/Doctor confirms diagnosis
**Who reviews/approves it:** Midwife self-manages NTP Registry entries. PHN reviews aggregate TB indicators.
**Frequency:** Once per new TB case
**Storage location:** `tb_cases` table

---

## Required Fields

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `patient_id` | UUID | FK to `patients`. Search by unified patient ID or name. | Link to existing patient record |
| `date_of_registration` | Date | Required. Auto-defaults to today. | |
| `patient_type` | Enum | Required. `New`, `Relapse`, `Treatment After Failure`, `Treatment After Lost to Follow-up`, `Transfer In` | NTP classification |
| `bacteriological_status` | Enum | Required. `Bacteriologically Confirmed` / `Clinically Diagnosed` | |
| `tb_classification` | Enum | Required. `DS-TB` / `DR-TB` | Drug susceptibility |
| `anatomical_site` | Enum | Required. `Pulmonary` / `Extrapulmonary` | |
| `treatment_start_date` | Date | Required. Date first dose given. | |
| `treatment_regimen` | Enum | Required. `2HRZE/4HR` (DS-TB standard) / `DRTB regimen` | NTP protocol |
| `assigned_dots_observer` | UUID | Required. FK to `user_profiles`. | BHW assigned to daily observation |
| `dots_location` | Enum | Required. `BHS` / `Home` / `Community` | Where DOTS will be conducted |

### Initial Diagnostic Results

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `initial_sputum_result` | Enum | `Positive` (with grading), `Negative`, `Not Done` | |
| `initial_sputum_date` | Date | Required if sputum done | |
| `xpert_result` | Enum | `MTB Detected`, `MTB Not Detected`, `Indeterminate`, `Not Done` | |
| `xpert_date` | Date | Required if Xpert done | |
| `chest_xray_result` | Enum | `Compatible with TB`, `Other abnormality`, `Normal`, `Not Done` | |
| `chest_xray_date` | Date | Required if CXR done | |

### Symptom History (from referral/screening)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `cough_duration_weeks` | Integer | >= 2 weeks = presumptive TB | |
| `fever` | Boolean | | |
| `night_sweats` | Boolean | | |
| `weight_loss` | Boolean | Unexplained, >= 5% over 3 months | |
| `hemoptysis` | Boolean | High-risk → urgent | |
| `contact_with_tb_patient` | Boolean | If Yes: source case details | |
| `previous_tb_treatment` | Boolean | If Yes: year, outcome, regimen | |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `extrapulmonary_site` | String | Only if `anatomical_site = 'Extrapulmonary'` | Specify site (e.g., lymph node, pleural) |
| `previous_treatment_year` | Integer | Only if `previous_tb_treatment = true` | |
| `previous_treatment_outcome` | String | Only if `previous_tb_treatment = true` | |
| `previous_treatment_regimen` | String | Only if `previous_tb_treatment = true` | |
| `contact_source_name` | String | Only if `contact_with_tb_patient = true` | Name of known source case |
| `contact_relationship` | String | Only if `contact_with_tb_patient = true` | |

---

## Enums / Controlled Vocabularies

See [ntp_registry.md](ntp_registry.md) for full enum definitions.

---

## UX / Clinical Safety Concerns

- **Patient search:** The form starts with a patient search (by unified ID or name). The midwife links to an existing patient record. If no patient record exists, prompt to create one first.
- **Diagnosis confirmation:** TB diagnosis is confirmed by MHO/Doctor. The form should capture who confirmed the diagnosis (a display/reference field, not necessarily a workflow gate in Phase 2).
- **Contact investigation prompt:** After saving a new TB case, prompt the midwife to initiate household contact investigation. Display a list of household members from the HH Profile.
- **Treatment phase auto-set:** Initial phase is always `INTENSIVE`. Do not allow manual override at registration.
- **DOTS observer assignment:** Dropdown of BHWs assigned to the patient's purok/household. Must be a valid BHW within the same `health_station_id`.
- **Hemoptysis flag:** If checked, display urgent alert: "Hemoptysis detected — ensure immediate referral if not already done."
- **Offline-first:** TB case registration should work offline with `PENDING_SYNC` status.

---

## Database Schema Notes

- **Table:** `tb_cases` — one row per TB episode. FK to `patient_id`, `health_station_id`.
- **Initial phase:** `treatment_phase` defaults to `INTENSIVE` on creation.
- **Case status:** `case_status` defaults to `ACTIVE` on creation.
- **Contact tracing:** On save, optionally trigger creation of `tb_contacts` records from household members.
- **ITIS sync:** Case data syncs to ITIS. Project LINK is the local capture point.
- **Soft delete:** `deleted_at TIMESTAMPTZ`. RA 10173.
- **Audit log:** INSERT into `audit_logs` on new case registration.
