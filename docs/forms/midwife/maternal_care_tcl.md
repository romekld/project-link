# Maternal Care TCL — TCL / Registry

**Role:** Midwife (RHM)
**Purpose:** Target Client List for all active pregnancy records and postpartum cases in the BHS. Serves as the live registry for tracking prenatal, intrapartum, and postpartum services for every pregnant woman in the catchment area. The TCL is the primary data source for the maternal section of the Summary Table.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 4.2 — Maternal Care and Services (PDF pages 115-182). TCL layout defined in the recording and consolidation sections.
**Who fills it:** Auto-populated from validated maternal ITR records. Midwife enters maternal encounters directly; BHW-submitted records feed in after validation.
**Who reviews/approves it:** Midwife manages the TCL; PHN reviews during MCT consolidation.
**Frequency:** Updated continuously as encounters are validated. Reviewed end-of-month for ST generation.
**Storage location:** `maternal_records` table (one row per pregnancy), `anc_visits` child table, plus computed TCL view

---

## Required Fields

Each row in the Maternal Care TCL represents one pregnancy episode.

### Patient Identity Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `patient_id` | UUID | FK to `patients`. Required. | Unified patient identifier |
| `patient_last_name` | String | From `patients` table | Display only |
| `patient_first_name` | String | From `patients` table | Display only |
| `family_serial_number` | String | FK to `households` | Links to HH Profile |
| `date_of_birth` | Date | From `patients` table | For age group computation |
| `age_group` | Enum | Auto-computed from DOB. `10-14`, `15-19`, `20-49` | FHSIS age-disaggregated reporting |
| `nhts_status` | Enum | `NHTS` / `Non-NHTS`. From `patients` table. | FHSIS disaggregation |
| `health_station_id` | UUID | FK to `health_stations` | RLS scope |

### Prenatal Care Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `date_of_registration` | Date | First ANC visit date | |
| `lmp_date` | Date | Last Menstrual Period. Required. | Basis for AOG and EDC |
| `edc` | Date | Auto-calculated: LMP + 280 days (Naegele's rule). Read-only. | Expected Date of Confinement |
| `gravida` | Integer | Total pregnancies including current | |
| `parity` | Integer | Total previous deliveries | |
| `aog_at_first_visit` | Integer (weeks) | Auto-computed from LMP and first visit date | Risk flag if >12 weeks |
| `anc_visit_count` | Integer | Auto-counted from `anc_visits` child records | |
| `anc_4_plus_achieved` | Boolean | Computed: `anc_visit_count >= 4` | FHSIS indicator |
| `trimester_1_visit` | Boolean | At least 1 visit at AOG <= 12w6d | |
| `trimester_2_visit` | Boolean | At least 1 visit at AOG 13-27w6d | |
| `trimester_3_visits` | Integer | Count of visits at AOG >= 28w. Need >= 2. | |

### Immunization (Td) Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `td1_date` | Date | First dose | |
| `td2_date` | Date | >= 4 weeks after Td1 | |
| `td3_date` | Date | >= 6 months after Td2 | For 2nd+ pregnancy |
| `td4_date` | Date | >= 1 year after Td3 | |
| `td5_date` | Date | >= 1 year after Td4 | |
| `fim_status` | Boolean | Auto-computed: Td schedule complete for current pregnancy | Fully Immunized Mother |

### Micronutrient Supplementation Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `ifa_given` | Boolean | Iron with Folic Acid given | FHSIS indicator |
| `ifa_date` | Date | Date of provision | |
| `calcium_given` | Boolean | Calcium Carbonate given | FHSIS indicator |
| `calcium_date` | Date | | |
| `iodine_given` | Boolean | Iodine capsule given | FHSIS indicator |
| `iodine_date` | Date | | |

### Nutritional Assessment Columns (1st Trimester)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `bmi_1st_trimester` | Decimal | Auto-calculated from weight and height at 1st trimester visit | |
| `bmi_classification` | Enum | `Low` (<18.5), `Normal` (18.5-22.9), `High` (>=23.0) | Asia-Pacific standard |
| `nutritionally_at_risk` | Boolean | BMI <18.5 or >=23.0 | High-risk flag |

### Deworming Column

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `deworming_date` | Date | Preferably 2nd or 3rd trimester | FHSIS indicator |

### Infectious Disease Screening Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `syphilis_screened` | Boolean | | FHSIS indicator |
| `syphilis_result` | Enum | `Positive`, `Negative`, `Pending` | |
| `hepb_screened` | Boolean | | FHSIS indicator |
| `hepb_result` | Enum | `Positive`, `Negative`, `Pending` | |
| `hiv_screened` | Boolean | Date tracked; result is confidential | FHSIS indicator (date only) |
| `cbc_screened` | Boolean | | FHSIS indicator |
| `anemia_result` | Enum | `Positive`, `Negative`, `Pending` | |
| `gd_screened` | Boolean | Gestational Diabetes | FHSIS indicator |
| `gd_result` | Enum | `Positive`, `Negative`, `Pending` | |

### Intrapartum Columns (filled after delivery)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `date_terminated` | Date | Date of delivery or pregnancy end | |
| `pregnancy_outcome` | Enum | `FT` (Full Term), `PT` (Pre-Term), `FD` (Fetal Death), `AM` (Abortion/Miscarriage) | |
| `birth_sex` | Enum | `Male` / `Female` (livebirths only) | |
| `birth_weight_grams` | Integer | LBW flag: <2500g | |
| `lbw_flag` | Boolean | Auto-computed: birth_weight < 2500 | High-risk indicator |
| `birth_attendant` | Enum | `SBA` / `Non-SBA` | FHSIS indicator |
| `place_of_delivery` | Enum | `Health Facility` / `Home` / `Other` | FHSIS indicator |
| `type_of_delivery` | Enum | `Vaginal` / `Cesarean Section` | |

### Postpartum Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `pp_checkup_1_date` | Date | Within 7 days postpartum | |
| `pp_checkup_2_date` | Date | Within 7 days postpartum | |
| `pp_2_achieved` | Boolean | Computed: both PP checkups done | FHSIS indicator |
| `pp_vitamin_a_date` | Date | Within 1 month after delivery. 200,000 IU. | FHSIS indicator |
| `pp_ifa_3months` | Boolean | Iron with folic acid given for 3 months PP | FHSIS indicator |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| Intrapartum section | Multiple | Only after delivery is recorded | Hidden until pregnancy terminates |
| Postpartum section | Multiple | Only after delivery with livebirth outcome | Hidden for FD/AM outcomes |
| `td3_date` through `td5_date` | Date | Only for 2nd+ pregnancy (parity >= 1) | 1st pregnancy requires only Td1+Td2 |

---

## Enums / Controlled Vocabularies

| Enum | Values |
|:-----|:-------|
| `age_group` | `10-14`, `15-19`, `20-49` |
| `nhts_status` | `NHTS`, `Non-NHTS` |
| `bmi_classification` | `Low`, `Normal`, `High` |
| `pregnancy_outcome` | `FT`, `PT`, `FD`, `AM` |
| `birth_attendant` | `SBA`, `Non-SBA` |
| `place_of_delivery` | `Health Facility`, `Home`, `Other` |
| `type_of_delivery` | `Vaginal`, `Cesarean Section` |
| `screening_result` | `Positive`, `Negative`, `Pending` |

---

## UX / Clinical Safety Concerns

- **EDC is auto-calculated** — display only, never editable. Formula: LMP + 280 days. If LMP is corrected, EDC auto-updates.
- **AOG risk flag:** If first visit AOG >12 weeks, display warning: "Late first prenatal visit — outside 1st trimester."
- **High-risk flags:** Persistent badges for: BMI at-risk, adolescent pregnancy (age 10-19), high parity (>=4), LBW delivery. Must survive list pagination.
- **ANC count tracker:** Visual progress indicator showing ANC visits completed vs target (>=4). Color-coded: green (on track), amber (behind schedule), red (near EDC with <4 visits).
- **Confirmation gate on delivery recording:** Recording a pregnancy outcome (especially FD or AM) is a significant clinical event. Require explicit confirmation.
- **Status visibility:** Each TCL row shows current status: `Active Pregnancy`, `Delivered`, `Postpartum`, `Completed`.
- **Next expected service date:** Auto-calculated from the ANC schedule or PP checkup timeline. Displayed as a column for proactive follow-up.
- **Pre-population:** Patient identity columns auto-filled from `patients` table. Midwife only enters clinical data.
- **Newborn linkage:** On livebirth recording, prompt to create a linked newborn patient record that feeds into Child Care TCL Part 1.

---

## Database Schema Notes

- **Table:** `maternal_records` — one row per pregnancy. FK to `patient_id`, `health_station_id`.
- **Child table:** `anc_visits(id, maternal_record_id, visit_date, trimester, aog_weeks, vitals_json, services_json)`.
- **EDC column:** Stored as computed column derived from `lmp_date`. Re-derive if LMP corrected.
- **High-risk flags:** `is_high_risk BOOLEAN`, `high_risk_reasons TEXT[]`. Auto-populated from triggers.
- **NHTS disaggregation:** Inherited from `patients.nhts_status`.
- **Record status:** `record_status ENUM('PENDING_SYNC', 'PENDING_VALIDATION', 'VALIDATED', 'RETURNED')` on each record.
- **Soft delete:** `deleted_at TIMESTAMPTZ`. All reads: `WHERE deleted_at IS NULL`. RA 10173.
- **Indexes:** `maternal_records(health_station_id, record_status)`, `maternal_records(patient_id)`, `anc_visits(maternal_record_id)`.
- **TCL view:** Implemented as a database view or API query joining `maternal_records` + `patients` + latest `anc_visits`, filtered by `health_station_id` and active pregnancies.

---

## Reports and Exports

This TCL feeds the following Summary Table (ST) indicators:

| Indicator | Numerator | Denominator | Target |
|:----------|:----------|:------------|:-------|
| >= 4 ANC Check-ups | `anc_4_plus_achieved = true` | Total Pop x 2.056% | 95% |
| Nutritional Status (Normal BMI 1st Tri) | `bmi_classification = 'Normal'` | Total Pop x 2.056% | <30% at-risk |
| Td Immunization (1st pregnancy) | `td2_date IS NOT NULL` (parity=0) | Total Pop x 2.056% | 95% |
| Td2 Plus (2nd+ pregnancy) | `td3_date IS NOT NULL` (parity>=1) | Total Pop x 2.056% | 95% |
| Iron with Folic Acid | `ifa_given = true` | Total Pop x 2.056% | 95% |
| Calcium Carbonate | `calcium_given = true` | Total Pop x 2.056% | 95% |
| Iodine Capsule | `iodine_given = true` | Total Pop x 2.056% | 95% |
| Deworming | `deworming_date IS NOT NULL` | Total Pop x 2.056% | 95% |
| Syphilis Screening | `syphilis_screened = true` | Total Pop x 2.056% | 95% |
| HepB Screening | `hepb_screened = true` | Total Pop x 2.056% | 95% |
| HIV Screening | `hiv_screened = true` | Total Pop x 2.056% | 95% |
| CBC/Hgb Screening | `cbc_screened = true` | Total Pop x 2.056% | 95% |
| GD Screening | `gd_screened = true` | Total Pop x 2.056% | 95% |
| Facility-Based Delivery | `place_of_delivery = 'Health Facility'` | Total deliveries | 95% |
| SBA-Attended Delivery | `birth_attendant = 'SBA'` | Total deliveries | 95% |
| >= 2 PP Check-ups | `pp_2_achieved = true` | Total deliveries (livebirth) | 95% |
| PP Vitamin A | `pp_vitamin_a_date IS NOT NULL` | Total deliveries (livebirth) | 95% |
| PP Iron with Folic Acid | `pp_ifa_3months = true` | Total deliveries (livebirth) | 95% |

All indicators disaggregated by NHTS/Non-NHTS and age group (10-14, 15-19, 20-49).
