# NTP Registry (TB Cases) — Registry

**Role:** Midwife (RHM)
**Purpose:** Registry of all active and closed TB cases in the BHS. The midwife registers new TB cases, monitors treatment progress (daily DOTS via BHW, monthly check-ups), manages phase transitions, and records treatment outcomes. FHSIS extracts only CNR (Case Notification Rate) and TSR (Treatment Success Rate) from this registry. Full case management syncs with ITIS (Integrated TB Information System).
**FHSIS Reference:** FHSIS MOP 2018, Chapter 5 — Infectious Disease Prevention and Control (PDF pages 285-332, doc pages 271-318); NTP Protocol
**Who fills it:** Midwife registers cases and records outcomes; BHW records daily DOTS observations; MHO/Doctor confirms diagnosis.
**Who reviews/approves it:** Midwife manages the registry; PHN reviews TB indicators in MCT.
**Frequency:** Registration (once per case), daily DOTS observation, weekly DOTS review by midwife, monthly monitoring, end-of-treatment outcome.
**Storage location:** `tb_cases` table, `dots_observations` child table, `tb_monthly_monitoring` child table

---

## Required Fields

Each row represents one TB case episode.

### Patient Identity Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `patient_id` | UUID | FK to `patients`. Required. | |
| `patient_last_name` | String | From `patients` | |
| `patient_first_name` | String | From `patients` | |
| `date_of_birth` | Date | From `patients` | |
| `age` | Integer | Auto-computed | |
| `sex` | Enum | `Male` / `Female` | |
| `nhts_status` | Enum | `NHTS` / `Non-NHTS` | |
| `health_station_id` | UUID | FK to `health_stations` | RLS scope |

### Case Registration Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `date_of_registration` | Date | Required | Date case registered at BHS |
| `tb_classification` | Enum | `DS-TB` (Drug-Susceptible) / `DR-TB` (Drug-Resistant) | FHSIS classification |
| `anatomical_site` | Enum | `Pulmonary` / `Extrapulmonary` | Specify site if EP-TB |
| `patient_type` | Enum | `New`, `Relapse`, `Treatment After Failure`, `Treatment After Lost to Follow-up`, `Transfer In` | NTP standard |
| `bacteriological_status` | Enum | `Bacteriologically Confirmed` / `Clinically Diagnosed` | |
| `treatment_start_date` | Date | Required. Date first dose given. | |
| `treatment_regimen` | Enum | `2HRZE/4HR` (DS-TB standard) / DRTB regimen | NTP protocol |
| `treatment_phase` | Enum | `Intensive` (first 2 months) / `Continuation` (last 4 months) | |
| `assigned_dots_observer` | UUID | FK to `user_profiles`. BHW assigned. | |

### Sputum Results Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `initial_sputum_result` | Enum | `Positive` (scanty/1+/2+/3+), `Negative`, `Not Done` | At diagnosis |
| `initial_sputum_date` | Date | | |
| `xpert_result` | Enum | `MTB Detected`, `MTB Not Detected`, `Indeterminate`, `Not Done` | GeneXpert test |
| `xpert_date` | Date | | |
| `chest_xray_result` | Enum | `Compatible with TB`, `Other abnormality`, `Normal`, `Not Done` | |
| `chest_xray_date` | Date | | |

### Treatment Outcome Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `treatment_outcome` | Enum | See enum below | Recorded at end of treatment |
| `outcome_date` | Date | Date outcome determined | |
| `treatment_success` | Boolean | Auto-computed: `Cured` OR `Treatment Completed` | FHSIS TSR numerator |

### Case Status

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `case_status` | Enum | `Active` / `Closed` | Active during treatment; Closed after outcome recorded |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `treatment_outcome` | Enum | Only when case is being closed | |
| `outcome_date` | Date | Only when outcome is recorded | |
| `extrapulmonary_site` | String | Only if `anatomical_site = 'Extrapulmonary'` | Specify site |

---

## Enums / Controlled Vocabularies

| Enum | Values |
|:-----|:-------|
| `tb_classification` | `DS-TB`, `DR-TB` |
| `anatomical_site` | `Pulmonary`, `Extrapulmonary` |
| `patient_type` | `New`, `Relapse`, `Treatment After Failure`, `Treatment After Lost to Follow-up`, `Transfer In` |
| `bacteriological_status` | `Bacteriologically Confirmed`, `Clinically Diagnosed` |
| `treatment_regimen` | `2HRZE/4HR`, `DRTB regimen` |
| `treatment_phase` | `Intensive`, `Continuation` |
| `sputum_result` | `Positive (scanty)`, `Positive (1+)`, `Positive (2+)`, `Positive (3+)`, `Negative`, `Not Done` |
| `xpert_result` | `MTB Detected`, `MTB Not Detected`, `Indeterminate`, `Not Done` |
| `treatment_outcome` | `Cured`, `Treatment Completed`, `Treatment Failed`, `Lost to Follow-up`, `Died`, `Not Evaluated`, `Transferred Out` |

---

## UX / Clinical Safety Concerns

- **Phase transition confirmation:** Moving from Intensive to Continuation phase is irreversible and requires sputum conversion confirmation. Explicit confirmation dialog with sputum result verification.
- **Treatment outcome confirmation:** Recording "Lost to Follow-up" is irreversible and has healthcare safety implications. Require explicit confirmation dialog: "This action is irreversible. The patient will be classified as Lost to Follow-up."
- **DOTS calendar view:** Display daily DOTS attendance as a calendar grid (green = drugs taken, red = missed, grey = future). Missed dose alerts prominently displayed.
- **Defaulter alert:** 2 consecutive missed DOTS doses → auto-alert to assigned BHW for home visit. >= 2 months cumulative missed → flag as potential Lost to Follow-up.
- **Sputum schedule tracking:** Visual timeline showing when sputum exams are due (Month 2, Month 5, Month 6). Alert when approaching due date.
- **Monthly weight trend:** Display weight trend chart to track treatment response.
- **High-risk flags:** Hemoptysis → urgent referral badge. Lost to Follow-up status → persistent high-risk indicator.
- **Contact investigation prompt:** On new case registration, prompt midwife to initiate household contact investigation.

---

## Database Schema Notes

- **Table:** `tb_cases` — one row per TB episode. FK to `patient_id`, `health_station_id`.
- **DOTS log:** Child table `dots_observations(id, tb_case_id, obs_date, drugs_given, observer_id, missed, adr, adr_description)`.
- **Monthly monitoring:** Child table `tb_monthly_monitoring(id, tb_case_id, month_number, monitoring_date, weight_kg, sputum_result, sputum_date, adherence, side_effects, notes)`.
- **Contact tracing:** `tb_contacts(id, source_case_id, contact_patient_id, contact_name, age, sex, sputum_done, sputum_result, referred)`.
- **Treatment outcome:** Enum column on `tb_cases`. Determines TSR.
- **ITIS sync:** Project LINK stores minimum local data for BHW daily DOTS and CHO reporting. ITIS is the system of record for NTP.
- **Defaulter alert:** Background job: `missed = true` for 2 consecutive days → BHW notification.
- **Soft delete:** `deleted_at TIMESTAMPTZ`. RA 10173.
- **Indexes:** `tb_cases(health_station_id, case_status)`, `dots_observations(tb_case_id, obs_date)`.

---

## Reports and Exports

This registry feeds the following ST indicators:

| Indicator | Numerator | Target |
|:----------|:----------|:-------|
| DS-TB cases enrolled on treatment | `tb_classification = 'DS-TB'` AND `treatment_start_date IS NOT NULL` | Count |
| DS-TB Treatment Success Rate | `treatment_success = true` / all DS-TB enrolled | >= 88% (WHO) |
| DR-TB cases enrolled on treatment | `tb_classification = 'DR-TB'` | Count |
