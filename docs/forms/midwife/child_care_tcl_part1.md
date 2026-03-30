# Child Care TCL Part 1 (Infants 0-11 months) — TCL / Registry

**Role:** Midwife (RHM)
**Purpose:** Target Client List for all infants aged 0-11 months in the BHS catchment area. Tracks immunization (EPI) schedule completion and nutrition services (breastfeeding, Vitamin A, iron for LBW). Primary data source for the child care section of the Summary Table covering infant indicators.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 4.3 — Child Care and Services (PDF pages 183-254, doc pages 169-240)
**Who fills it:** Auto-populated from validated EPI and nutrition ITR records. BHW captures field data; Midwife validates and administers vaccines.
**Who reviews/approves it:** Midwife manages the TCL; PHN reviews during MCT consolidation.
**Frequency:** Updated continuously as immunization/nutrition encounters are validated. Reviewed end-of-month for ST generation.
**Storage location:** `immunization_records` table, `nutrition_records` table, `patients` table; TCL is a computed view

---

## Required Fields

Each row represents one infant (0-11 months).

### Patient Identity Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `patient_id` | UUID | FK to `patients`. Required. | |
| `patient_last_name` | String | From `patients` | |
| `patient_first_name` | String | From `patients` | |
| `family_serial_number` | String | FK to `households` | |
| `date_of_birth` | Date | Required | For age computation and vaccine eligibility |
| `age_months` | Integer | Auto-computed from DOB | Display in months |
| `sex` | Enum | `Male` / `Female` | FHSIS sex disaggregation |
| `nhts_status` | Enum | `NHTS` / `Non-NHTS` | FHSIS disaggregation |
| `health_station_id` | UUID | FK to `health_stations` | RLS scope |
| `mothers_name` | String | From patient record or household link | |

### Immunization Schedule Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `bcg_date` | Date | At birth, within 0-28 days | |
| `hepb_birth_date` | Date | Within 24 hours of birth. High-priority. | Flag if >24h |
| `dpthib_1_date` | Date | Min 6 weeks of age | |
| `dpthib_2_date` | Date | >= 4 weeks after dose 1 | |
| `dpthib_3_date` | Date | >= 4 weeks after dose 2 | |
| `opv_1_date` | Date | Min 6 weeks. Co-administered with DPT-1. | |
| `opv_2_date` | Date | >= 4 weeks after OPV-1 | |
| `opv_3_date` | Date | >= 4 weeks after OPV-2 | |
| `ipv_date` | Date | At 14 weeks (with DPT-3/OPV-3) | |
| `pcv_1_date` | Date | Min 6 weeks. Co-administered with DPT-1. | |
| `pcv_2_date` | Date | >= 4 weeks after PCV-1 | |
| `pcv_3_date` | Date | >= 4 weeks after PCV-2 | |
| `mcv1_date` | Date | At 9 months of age | |
| `fic_status` | Boolean | Auto-computed: all 8 antigens complete | Fully Immunized Child |
| `cpab_status` | Boolean | Auto-computed from mother's FIM status | Completely Protected at Birth |

### Nutrition Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `breastfeeding_initiated` | Boolean | Within 90 minutes of birth | |
| `ebf_achieved` | Boolean | Exclusive breastfeeding 0-5 months (BM only) | FHSIS EBF indicator |
| `complementary_feeding_started` | Boolean | At 6 months while continuing BF | |
| `vita_6to11_date` | Date | Vitamin A 100,000 IU at 6 months | FHSIS indicator |
| `lbw_flag` | Boolean | Birth weight < 2500g | From birth record |
| `lbw_iron_started` | Date | Iron supplementation start date (if LBW) | At 1 month |
| `lbw_iron_completed` | Boolean | Iron given through 3 months | FHSIS indicator |

### Status Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `defaulter_flag` | Boolean | Auto-flagged: any vaccine overdue by >4 weeks | Triggers BHW follow-up |
| `next_vaccine_due` | String | Auto-computed: next antigen + target date | Display for proactive scheduling |
| `next_due_date` | Date | Auto-computed from last dose + schedule interval | |
| `is_high_risk` | Boolean | SAM, LBW, defaulter | Persistent badge |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `lbw_iron_started` | Date | Only if `lbw_flag = true` | |
| `lbw_iron_completed` | Boolean | Only if `lbw_flag = true` | |
| `vita_6to11_date` | Date | Only when infant reaches 6 months | |
| `complementary_feeding_started` | Boolean | Only at 6+ months | |

---

## Enums / Controlled Vocabularies

| Enum | Values |
|:-----|:-------|
| `sex` | `Male`, `Female` |
| `nhts_status` | `NHTS`, `Non-NHTS` |
| `breastfeeding_status` | `Exclusive`, `Mixed`, `Formula Only`, `Stopped` |

---

## UX / Clinical Safety Concerns

- **EPI schedule grid:** Display as a visual grid/timeline showing each antigen, target age, date given (green), overdue (red), upcoming (amber).
- **Defaulter highlighting:** Overdue vaccines must be visually prominent (red highlight). Defaulter flag persists in list view.
- **FIC progress indicator:** Show completion percentage (e.g., "8/11 antigens" or visual checklist). Green badge when FIC achieved.
- **Next vaccination due:** Always display the next due vaccine and its target date as a prominent column.
- **HepB birth dose timing:** Flag if HepB was given >24 hours after birth — this is a high-priority indicator.
- **Age-based visibility:** Only show antigens appropriate for the infant's current age. Don't show MCV-1 column until infant approaches 9 months.
- **LBW iron tracking:** For LBW infants, prominently show the iron supplementation timeline (1-3 months).
- **Growth tracking cross-reference:** Link to nutrition visit data showing weight-for-age and MUAC trends for infants 6-11 months.
- **Transition alert:** When an infant reaches 12 months, auto-flag for transfer to Child Care TCL Part 2.

---

## Database Schema Notes

- **Table:** `immunization_records` — one row per child. FK to `patient_id`.
- **Dose storage:** Individual date columns per antigen/dose, plus optional `vaccine_doses` child table for lot numbers.
- **FIC computation:** Boolean computed from 8-antigen checklist (BCG + HepB-birth + DPT×3 + OPV×3 + IPV + PCV×3 + MCV-1). Recomputed on every save.
- **Defaulter detection:** Background job: daily check `next_due_date < CURRENT_DATE - 28 days`. Creates follow-up task for BHW.
- **Nutrition data:** `nutrition_records` table — separate FK to `patient_id`. Joined in TCL view.
- **NHTS disaggregation:** From `patients.nhts_status`.
- **Record status:** `record_status` on each encounter that feeds the TCL.
- **Soft delete:** `deleted_at TIMESTAMPTZ`. RA 10173.
- **Indexes:** `immunization_records(health_station_id)`, `immunization_records(patient_id)`.
- **TCL view:** Database view joining `patients` + `immunization_records` + `nutrition_records` filtered by age 0-11 months and `health_station_id`.

---

## Reports and Exports

This TCL feeds the following ST indicators:

| Indicator | Numerator | Target |
|:----------|:----------|:-------|
| BCG vaccination | `bcg_date IS NOT NULL` | 95% |
| HepB birth dose (<24h) | `hepb_birth_date` within 24h of birth | 95% |
| DPT-HiB-HepB 3 doses | `dpthib_3_date IS NOT NULL` | 95% |
| OPV 3 doses | `opv_3_date IS NOT NULL` | 95% |
| IPV | `ipv_date IS NOT NULL` | 95% |
| PCV 3 doses | `pcv_3_date IS NOT NULL` | 95% |
| MCV at 9 months | `mcv1_date IS NOT NULL` | 95% |
| FIC | `fic_status = true` | 95% |
| CPAB | `cpab_status = true` | 95% |
| Breastfeeding initiation | `breastfeeding_initiated = true` | Target |
| Exclusive BF (0-5 months) | `ebf_achieved = true` | Target |
| Vitamin A (6-11 months) | `vita_6to11_date IS NOT NULL` | 95% |
| LBW infants given iron | `lbw_iron_completed = true` | 95% |

All disaggregated by sex and NHTS/Non-NHTS.
