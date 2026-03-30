# HH Profile Review & Master List Management — Admin / Registry

**Role:** Midwife (RHM)
**Purpose:** Quarterly review of BHW-submitted Household Profile forms. The midwife verifies completeness, identifies new individuals per age/health group, and updates Master Lists that pre-populate TCL name columns.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 3 — Profiling of Households (doc pages 30-34)
**Who fills it:** BHW fills the HH Profile; Midwife reviews, approves, and builds Master Lists
**Who reviews/approves it:** Midwife is the reviewer
**Frequency:** Quarterly (January baseline, April/July/October updates). BHW submits by 3rd week of January (Q1) and 1st month of each subsequent quarter.
**Storage location:** `households` table, `household_members` table; Master List views derived from `patients` + `household_members`

---

## Required Fields

The midwife reviews these fields from the BHW's HH Profile submission (read-only review):

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `household_number` | String | System-generated. Format: `BHS_CODE-YYYY-NNNN` | Family Serial Number used across all FHSIS forms |
| `respondent_last_name` | String | Required | Paper form shows as 'Name of Respondent'; normalized |
| `respondent_first_name` | String | Required | |
| `respondent_middle_initial` | String | Optional | |
| `nhts_status` | Enum | Required. `NHTS-4Ps` / `Non-NHTS` | Used for FHSIS disaggregation |
| `ip_status` | Boolean | Required. `IP` / `Non-IP` | Indigenous People flag |
| `philhealth_member` | Boolean | Required | HH Head PhilHealth membership |
| `philhealth_id` | String | Required if `philhealth_member = true`. Format: `XX-XXXXXXXXX-X` | |
| `philhealth_category` | Enum | Required if `philhealth_member = true` | Formal, Informal, Indigent, Senior Citizen, etc. |
| `quarter` | Enum | `Q1`, `Q2`, `Q3`, `Q4` | Which quarterly update this submission covers |
| `date_of_visit` | Date | Required | Date BHW visited the household |

### Household Member Roster (per member)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `member_last_name` | String | Required | Paper form shows 'Name'; normalized |
| `member_first_name` | String | Required | |
| `member_mothers_maiden_name` | String | Optional | Used as middle name identifier per DOH convention |
| `relationship_to_head` | Enum | Required. `1`=Head, `2`=Spouse, `3`=Son, `4`=Daughter, `5`=Others | |
| `sex` | Enum | Required. `M` / `F` | |
| `date_of_birth` | Date | Required (estimate if unknown, flag as estimated) | |
| `age` | Integer | Auto-computed from DOB. Never stored. | Age at last birthday |
| `classification` | Enum | Required per quarter. Auto-suggested from DOB + health flags. | See classification codes below |
| `remarks` | Text | Required for members >= 21 y/o (PhilHealth info) | Also for transfer/new resident notes |

### Midwife Review Action Fields

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `review_status` | Enum | `APPROVED` / `NEEDS_CORRECTION` | Midwife's decision on the HH Profile submission |
| `review_notes` | Text | Optional. Required if `NEEDS_CORRECTION`. | Feedback to BHW |
| `reviewed_by` | UUID | System-populated | Midwife user ID |
| `reviewed_at` | Timestamp | System-generated | |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `review_notes` | Text | When `NEEDS_CORRECTION` selected | Feedback to BHW |
| `philhealth_id` | String | When `philhealth_member = true` | |
| `philhealth_category` | Enum | When `philhealth_member = true` | |

---

## Enums / Controlled Vocabularies

### Classification Codes (per FHSIS MOP Ch. 3)

| Code | Classification | Criteria |
|:-----|:---------------|:---------|
| `N` | Newborn | 0-28 days |
| `I` | Infant | 29 days - 11 months |
| `U` | Under-five Child | 1-4 years (12-59 months) |
| `S` | School-Aged Child | 5-9 years |
| `A` | Adolescent | 10-19 years |
| `P` | Pregnant | Any pregnant woman |
| `AP` | Adolescent-Pregnant | Pregnant and 10-19 years simultaneously |
| `PP` | Post-Partum | Gave birth in last 6 weeks |
| `WRA` | Women of Reproductive Age | Female, 15-49 years, not currently pregnant/PP |
| `SC` | Senior Citizen | 60+ years |
| `PWD` | Person with Disability | Any age |
| `AB` | Adult | 20-59 years |

---

## UX / Clinical Safety Concerns

- **Auto-classification suggestion:** System should auto-suggest the classification code from `date_of_birth` + pregnancy/postpartum flags. Midwife confirms or overrides.
- **Member count validation:** Flag if a household has an unusually high member count (>15) or zero members.
- **Quarterly diff view:** When reviewing Q2/Q3/Q4 updates, show what changed since the previous quarter (new members, removed members, reclassifications) as a diff.
- **Master List auto-generation:** On approval, the system should automatically:
  - Add new pregnancies → Maternal Care TCL name column
  - Add new infants → Child Care TCL Part 1 name column
  - Move children reaching 12 months → Child Care TCL Part 2
  - Add newly identified adults 20+ → NCD TCL Part 1
- **Duplicate detection:** Flag if a household member name + DOB matches an existing patient record (potential duplicate).

---

## Database Schema Notes

- **Tables:** `households` (parent), `household_members` (child rows). FK `households.health_station_id`.
- **Quarterly classification:** Store as `hh_member_classifications(member_id, year, quarter, classification_code)` child table — allows historical tracking.
- **Family Serial Number:** `households.household_number` is the linking key across ITR, TCL, and MCT. Must be stable and persistent.
- **BHW assignment:** `households.assigned_bhw_id` FK to `user_profiles`.
- **RLS:** Midwife sees only households where `health_station_id` matches her JWT claim.
- **Indexes:** `household_members(household_id)`, `households(health_station_id, assigned_bhw_id)`.
- **Soft delete:** `deleted_at` on both tables. Never hard-delete (RA 10173).
- **Patient linkage:** Each household member should link to a `patients` record via `patient_id` once they receive any clinical service.
