# Child Care TCL Part 2 (Children 12-59 months) — TCL / Registry

**Role:** Midwife (RHM)
**Purpose:** Target Client List for all children aged 12-59 months in the BHS catchment area. Tracks EPI completion (MCV-2), nutrition status (anthropometry, Vitamin A, MNP), deworming, and sick child management (IMCI). Primary data source for the under-five section of the Summary Table.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 4.3 — Child Care and Services (PDF pages 183-254, doc pages 169-240)
**Who fills it:** Auto-populated from validated immunization, nutrition, and sick child ITR records. BHW captures measurements; Midwife validates and classifies.
**Who reviews/approves it:** Midwife manages the TCL; PHN reviews during MCT consolidation.
**Frequency:** Updated continuously as encounters are validated. Reviewed end-of-month for ST generation.
**Storage location:** `immunization_records`, `nutrition_records`, `sick_child_encounters` tables; TCL is a computed view

---

## Required Fields

Each row represents one child (12-59 months).

### Patient Identity Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `patient_id` | UUID | FK to `patients`. Required. | |
| `patient_last_name` | String | From `patients` | |
| `patient_first_name` | String | From `patients` | |
| `family_serial_number` | String | FK to `households` | |
| `date_of_birth` | Date | Required | For age and z-score computation |
| `age_months` | Integer | Auto-computed from DOB | Display in months |
| `sex` | Enum | `Male` / `Female` | For z-score table lookup and FHSIS sex disaggregation |
| `nhts_status` | Enum | `NHTS` / `Non-NHTS` | FHSIS disaggregation |
| `health_station_id` | UUID | FK to `health_stations` | RLS scope |

### Immunization Completion Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `mcv2_date` | Date | At 12-15 months | MCV-2 (second dose) |
| `fic_status` | Boolean | From Part 1 — carried forward | All infant antigens complete |
| `cic_status` | Boolean | Auto-computed: FIC + MCV-2 | Completely Immunized Child |

### Nutrition Status Columns (Latest Assessment)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `latest_weight_kg` | Decimal | From most recent nutrition visit | Precision: 0.1 kg |
| `latest_height_cm` | Decimal | Height (standing) for >= 2 years | Precision: 0.1 cm |
| `latest_muac_cm` | Decimal | Required for 6-59 months | |
| `wfa_zscore` | Decimal | Auto-computed from WHO 2006 growth standards | Weight-for-Age |
| `wfa_classification` | Enum | `Normal` (>=-2), `Underweight` (<-2 to >=-3), `Severely Underweight` (<-3) | |
| `wfh_zscore` | Decimal | Auto-computed. Primary wasting indicator. | Weight-for-Height |
| `wfh_classification` | Enum | `Normal`, `MAM`, `SAM` | |
| `muac_classification` | Enum | `Green (>=12.5cm)`, `Yellow (11.5-<12.5cm)`, `Red (<11.5cm)` | |
| `bilateral_edema` | Boolean | Edema = SAM regardless of z-score | |
| `nutrition_status` | Enum | `Normal`, `MAM`, `SAM`, `Overweight/Obese` | Composite assessment |
| `sam_flag` | Boolean | WFH z-score <-3 OR bilateral edema OR MUAC <11.5cm | High-risk |
| `mam_flag` | Boolean | WFH z-score <-2 to >=-3 OR MUAC 11.5-<12.5cm | |

### Vitamin A Supplementation Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `vita_dose1_date` | Date | February (200,000 IU) | National Vitamin A month |
| `vita_dose2_date` | Date | August (200,000 IU, 6 months after dose 1) | |
| `vita_2_doses_complete` | Boolean | Both doses given in current year | FHSIS indicator |

### MNP (Micronutrient Powder) Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `mnp_sachets_received` | Integer | Cumulative count for the period | |
| `mnp_complete` | Boolean | Completed MNP course | FHSIS indicator |

### Deworming Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `deworming_dose1_date` | Date | | |
| `deworming_dose2_date` | Date | >= 6 months after dose 1 | |
| `deworming_2_doses_complete` | Boolean | Both doses given | FHSIS indicator |

### Sick Child Management Columns (if applicable)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `diarrhea_ors_given` | Boolean | ORS given for diarrhea episode | FHSIS indicator |
| `diarrhea_zinc_given` | Boolean | Zinc co-administered with ORS | |
| `pneumonia_treatment_given` | Boolean | Antibiotic for pneumonia | FHSIS indicator |
| `vita_for_sick_child` | Boolean | Therapeutic Vitamin A dose | |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| Sick child columns | Multiple | Only when child has a sick visit recorded | Not all children get sick |
| `mcv2_date` | Date | Only when child reaches 12 months | |
| `deworming_dose1_date` | Date | Only for children >= 12 months (PSAC starts at 1 year) | |

---

## Enums / Controlled Vocabularies

| Enum | Values |
|:-----|:-------|
| `wfa_classification` | `Normal`, `Underweight`, `Severely Underweight` |
| `wfh_classification` | `Normal`, `MAM`, `SAM` |
| `muac_classification` | `Green`, `Yellow`, `Red` |
| `nutrition_status` | `Normal`, `Stunted`, `MAM`, `SAM`, `Overweight/Obese` |

---

## UX / Clinical Safety Concerns

- **SAM/MAM badges:** Persistent high-risk badges for SAM (red) and MAM (amber) in all list views. Must survive pagination.
- **Growth trend visualization:** Display weight-for-age and weight-for-height curves (WHO 2006 growth charts) for each child. Alert if consecutive worsening z-scores.
- **Z-scores are never user-entered** — always computed server-side (or offline from bundled WHO lookup tables). Display as read-only.
- **Vitamin A schedule:** Visual indicator showing dose status: February dose (done/pending), August dose (done/pending).
- **Deworming schedule:** Semi-annual reminders at BHS level.
- **IMCI danger signs:** If a sick child encounter records any danger sign (unable to feed, convulsions, lethargy), display urgent referral alert.
- **Transition alert:** When a child reaches 60 months (5 years), flag for graduation from this TCL. Children 5-9 years move to SAC group (tracked differently).
- **Edema override:** If bilateral edema is checked, nutrition status is automatically SAM regardless of z-score — make this logic visible to the midwife.

---

## Database Schema Notes

- **Tables:** `immunization_records` (vaccine data), `nutrition_records` (anthropometry, Vitamin A, MNP per visit), `deworming_records`, `sick_child_encounters`.
- **Z-score computation:** WHO 2006 growth standards lookup table bundled in PWA for offline. Server-side validation on sync.
- **Nutrition status:** `nutrition_status ENUM('Normal', 'MAM', 'SAM', 'Overweight/Obese')` computed on every save.
- **NHTS disaggregation:** From `patients.nhts_status`.
- **Record status:** On each underlying encounter record.
- **Soft delete:** `deleted_at TIMESTAMPTZ`. RA 10173.
- **TCL view:** Database view joining `patients` + latest `nutrition_records` + `immunization_records` + `deworming_records` filtered by age 12-59 months and `health_station_id`.
- **Indexes:** On `patient_id`, `health_station_id`, and age-range queries.

---

## Reports and Exports

This TCL feeds the following ST indicators:

| Indicator | Numerator | Target |
|:----------|:----------|:-------|
| MCV at 12 months | `mcv2_date IS NOT NULL` | 95% |
| CIC (Completely Immunized) | `cic_status = true` | 95% |
| Vitamin A (12-59 months, 2 doses) | `vita_2_doses_complete = true` | 95% |
| MNP supplementation | `mnp_complete = true` | Target |
| Nutritional status (0-59 months) | `nutrition_status` distribution | Reporting |
| Deworming (PSAC, 2 doses) | `deworming_2_doses_complete = true` | Target |
| Diarrhea given ORS/zinc | `diarrhea_ors_given = true` | 100% |
| Pneumonia given treatment | `pneumonia_treatment_given = true` | 100% |

All disaggregated by sex and NHTS/Non-NHTS.
