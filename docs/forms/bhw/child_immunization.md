# Child Immunization Encounter — Entry (Clinical)

**Role:** bhw
**Purpose:** Records a single immunization dose given to a child (or deworming round) during a BHW home visit or outreach session. Tracks EPI schedule completion progress toward FIC (Fully Immunized Child) status. When VALIDATED, feeds the Child Care TCL Part 1 (infants 0–11 months) and Part 2 (children 12–59 months) immunization columns and contributes to FHSIS EPI coverage indicators.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 4.3 — Child Care and Services / EPI Section (PDF pages 183–254, doc pages 169–240). DOH Form: ITR for Children and Other Adults (EPI section, doc page 187) + Deworming ITR (doc page 188).
**Who fills it:** BHW (vaccine dose administration and recording during home visits; deworming pre-screening and administration)
**Who reviews/approves it:** Midwife (validates via Validation Queue; VALIDATED doses update FIC status and Child Care TCL)
**Frequency:** Per immunization dose given; per deworming round (semi-annual for PSAC/SAC/Adolescents)
**Storage location:** `vaccine_doses` table (one row per dose event); `deworming_records` table (one row per deworming round); parent: `immunization_records` table (one row per child — the EPI card equivalent).

---

## Required Fields

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `patient_id` | UUID | FK to `patients`. Required. Child patient. | Must be an existing registered patient. |
| `immunization_record_id` | UUID | FK to `immunization_records`. Required. | The child's EPI card record. Auto-created at patient registration for eligible age groups. |
| `visit_date` | DATE | Required. Format: `YYYY-MM-DD`. Cannot be a future date. | Date vaccine was administered. |
| `antigen` | ENUM | See Antigen Codes table below. Required. | Vaccine/intervention name. |
| `dose_number` | INTEGER | Required. 1–3 depending on antigen. | Must match the expected next dose in the schedule. Validated against prior doses. |
| `health_station_id` | UUID | FK to `health_stations`. Set from BHW JWT. | |
| `provider_id` | UUID | FK to `user_profiles`. Set from BHW JWT. | |
| `record_status` | ENUM | `PENDING_SYNC` → `PENDING_VALIDATION` → `VALIDATED` / `RETURNED`. | Digital Validation Gate. |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `lot_number` | VARCHAR(50) | Shown for all vaccines. Optional but encouraged. | Batch/lot number from the vial. Important for cold chain traceability. |
| `site_of_injection` | ENUM | Shown for injectable vaccines: BCG, HepB-birth, DPT-HiB-HepB, PCV, IPV. | `Right Deltoid` / `Left Deltoid` / `Right Anterolateral Thigh` / `Left Anterolateral Thigh`. |
| `given_by` | TEXT | Optional. | Name or initials of the administering health worker. Used for BHW-administered doses (e.g., OPV). |
| `adverse_event_flag` | BOOLEAN | Shown for any dose. Default: false. | Yes / No. If Yes, `adverse_event_description` becomes required. |
| `adverse_event_description` | TEXT | When `adverse_event_flag = true`. Required if Yes. | Free text description of the adverse event. Triggers referral recommendation to BHS/RHU. |
| `next_due_date` | DATE (computed) | Displayed after dose is saved. Display only — not editable. | Auto-computed from EPI schedule interval. Shown to help the BHW remind the family of the next appointment. |

### Deworming Fields (sub-form — shown when `antigen = DEWORMING`)

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `deworming_drug` | ENUM | When `antigen = DEWORMING`. Required. | `Albendazole 200mg` (1–<2 years) / `Albendazole 400mg` (2–18 years) / `Mebendazole 500mg` (1–18 years). |
| `deworming_place` | ENUM | When `antigen = DEWORMING`. Required. | `Community/BHS` / `School`. |
| `deworming_dose_number` | INTEGER | When `antigen = DEWORMING`. Required. | 1 (first semi-annual dose) or 2 (second semi-annual dose). |
| `full_meal_last_2h` | BOOLEAN | Pre-screening gate. Required. | Must be `true` before deworming can proceed. Show: "Has the child had a full meal in the last 2 hours?" Block administration if false. |
| `is_seriously_ill` | BOOLEAN | Pre-screening gate. Required. | Defer deworming if true. Show: "Is the child seriously ill?" |
| `has_abdominal_pain` | BOOLEAN | Pre-screening gate. Required. | Defer if true. |
| `has_diarrhea` | BOOLEAN | Pre-screening gate. Required. | Defer if true. |
| `has_severe_malnutrition` | BOOLEAN | Pre-screening gate. Required. | Defer if true. |
| `drug_allergy_history` | BOOLEAN | Pre-screening gate. Required. | If true, show `allergy_drug TEXT` field. |
| `allergy_drug` | TEXT | When `drug_allergy_history = true`. | Specify drug causing allergy. |
| `deworming_adverse_reaction` | TEXT | Post-administration. Optional. | Free text. Any adverse reaction observed after administration. |

---

## Enums / Controlled Vocabularies

### Antigen Codes (DOH EPI Schedule, 2018)

| Antigen Code | Vaccine Name | Target Age | Minimum Interval / Rules |
|:-------------|:-------------|:-----------|:--------------------------|
| `BCG` | Bacillus Calmette–Guérin | At birth, within 0–28 days | Given before discharge from birthing facility. |
| `HEPB_BIRTH` | Hepatitis B Birth Dose | Within 24 hours of birth | High-priority indicator. Flag if >24 hours from recorded birth date. |
| `DPTHIB_1` | DPT-HiB-HepB Dose 1 | 6 weeks minimum age | Must be ≥6 weeks of age. |
| `DPTHIB_2` | DPT-HiB-HepB Dose 2 | ≥4 weeks after Dose 1 | Minimum 4-week interval from DPTHIB_1. |
| `DPTHIB_3` | DPT-HiB-HepB Dose 3 | ≥4 weeks after Dose 2 | Minimum 4-week interval from DPTHIB_2. |
| `PCV_1` | Pneumococcal Vaccine Dose 1 | 6 weeks minimum | Co-administered with DPT-1. |
| `PCV_2` | Pneumococcal Vaccine Dose 2 | ≥4 weeks after PCV-1 | |
| `PCV_3` | Pneumococcal Vaccine Dose 3 | ≥4 weeks after PCV-2 | |
| `OPV_1` | Oral Polio Vaccine Dose 1 | 6 weeks minimum | Co-administered with DPT-1. |
| `OPV_2` | Oral Polio Vaccine Dose 2 | ≥4 weeks after OPV-1 | |
| `OPV_3` | Oral Polio Vaccine Dose 3 | ≥4 weeks after OPV-2 | |
| `IPV` | Inactivated Polio Vaccine | 14 weeks (with DPT-3/OPV-3) | Single dose. |
| `MCV1` | Measles-Containing Vaccine 1 | 9 months of age | MCV at 9 months. |
| `MCV2` | Measles-Containing Vaccine 2 | 12–15 months | MCV booster. Completes FIC schedule. |
| `TD_GRADE1` | Tetanus-Diphtheria Grade 1 | School-based, Grade 1 | School health program — confirm if BHW-captured or Midwife-aggregated (see Open Questions). |
| `MR_GRADE1` | Measles-Rubella Grade 1 | School-based, Grade 1 | Same as above. |
| `TD_GRADE7` | Tetanus-Diphtheria Grade 7 | School-based, Grade 7 | Same as above. |
| `MR_GRADE7` | Measles-Rubella Grade 7 | School-based, Grade 7 | Same as above. |
| `DEWORMING` | Deworming | PSAC 1–4 y/o, SAC 5–9 y/o, Adolescents 10–19 y/o | Opens deworming sub-form. Semi-annual (2 doses, 6 months apart). |

### FIC-Required Antigens (for auto-computation)

FIC (Fully Immunized Child) is achieved when all 8 core antigens for the ≤12-month schedule are complete:
`BCG` + `HEPB_BIRTH` + `DPTHIB_3` + `PCV_3` + `OPV_3` + `IPV` + `MCV1`
> MCV2 (12 months) completes the schedule but FIC is first achieved at 9 months with MCV1.

### Site of Injection

`Right Deltoid` / `Left Deltoid` / `Right Anterolateral Thigh` / `Left Anterolateral Thigh`

---

## UX / Clinical Safety Concerns

- **Dose sequence validation (critical):** Before the BHW can select a dose, the system must check the EPI schedule: (a) Is the child old enough for this dose? (b) Has the prior dose been recorded? (c) Has the minimum interval since the prior dose elapsed? If not, show inline: "DPT-HiB-HepB Dose 2 requires at least 4 weeks since Dose 1. Next eligible date: [computed date]. Recording this dose is not yet permitted."
- **EPI schedule helper (not blank date fields):** The form must present a pre-calculated list of overdue and upcoming vaccines for this child based on their age and immunization history — not blank fields for the BHW to guess. Show: "Due now: DPT-2 (eligible as of [date])." This must work offline from locally cached `immunization_records`.
- **HepB birth dose timing flag:** If `antigen = HEPB_BIRTH` and the recorded `visit_date` is >24 hours after the patient's `date_of_birth`, show inline: "HepB birth dose should be given within 24 hours of birth. This dose is [N] hours/days late — record the actual date given."
- **FIC auto-compute on validation:** After each `VALIDATED` dose, recompute `immunization_records.fic BOOLEAN`. Set to `true` when all 8 FIC-required antigens are complete. This computation must run server-side on VALIDATED dose event. Display FIC status badge on the child's patient card.
- **Defaulter badge:** When any due vaccine is overdue by >4 weeks (next_due_date is >28 days ago), show a persistent "Defaulter" orange badge on the patient card and immunization tab. Triggers a BHW follow-up task notification.
- **Deworming pre-screening gate:** The deworming sub-form must block administration if any contraindication is active. Show: "Deworming should be deferred. Reason: [condition checked]. Schedule a follow-up visit when the child has recovered." Cannot proceed past this screen if a contraindication is Yes.
- **Adverse event escalation:** Any `adverse_event_flag = true` → immediate in-app alert: "Adverse event recorded. Please refer the child to the BHS/RHU for evaluation. Do not administer the next dose until cleared by the Midwife or Doctor."
- **Offline-first:** Full EPI form available offline. Dose sequence validation must run against locally cached `immunization_records` in Dexie.js — not require API call.
- **Touch targets:** 44×44px minimum. Antigen selector should use large, clearly labeled buttons (not a small dropdown) since this is the most important tap on the form.
- **Lot number capture:** Show the lot number field prominently and label it "Lot/Batch Number (from vial)." Encourage entry but allow submission without it — BHWs in the field may not have the vial at hand during home visits.

---

## Database Schema Notes

- **Tables:** `vaccine_doses` (one row per dose event) + `deworming_records` (one row per deworming round) + `immunization_records` (one row per child — the EPI card parent record).
- **FK:** `vaccine_doses.immunization_record_id` → `immunization_records`. `vaccine_doses.provider_id` → `user_profiles`. `immunization_records.patient_id` → `patients`.
- **Unique constraint on doses:** `UNIQUE(immunization_record_id, antigen, dose_number)` on `vaccine_doses` — prevents duplicate dose entries for the same antigen/dose pair per child.
- **record_status:** On `vaccine_doses.record_status`. Not on `immunization_records` (the parent record is administrative).
- **FIC computation:** `immunization_records.fic BOOLEAN NOT NULL DEFAULT FALSE`. Recomputed on each `VALIDATED` dose event. Never user-editable. Trigger: check if `HEPB_BIRTH`, `BCG`, `DPTHIB_3`, `PCV_3`, `OPV_3`, `IPV`, `MCV1` all have non-null validated dose dates.
- **Defaulter detection:** Background job (daily): query `immunization_records` where `fic = false` and computed `next_due_date < CURRENT_DATE - 28`. Create a BHW follow-up task for defaulter outreach.
- **Soft delete:** `vaccine_doses.deleted_at TIMESTAMPTZ`. `deworming_records.deleted_at TIMESTAMPTZ`. All reads: `WHERE deleted_at IS NULL`.
- **NHTS propagation:** `vaccine_doses.nhts_status` inherited from `patients.nhts_status`. Set on INSERT.
- **Indexes:** `vaccine_doses(immunization_record_id, antigen, dose_number)`, `immunization_records(patient_id)`, `immunization_records(fic)`, `vaccine_doses(record_status)`, `vaccine_doses(visit_date)`.

---

## Reports and Exports

This form feeds the following FHSIS indicators (aggregated via Child Care TCL → Summary Table → MCT → M1 Report):

| Indicator | Source Field | Target |
|:----------|:-------------|:-------|
| BCG vaccination coverage | `bcg_date IS NOT NULL` (validated) | 95% |
| HepB birth dose within 24 hours | `hepb_birth_date` within 24h of DOB | 95% |
| DPT-HiB-HepB 3 doses | `dpthib_3_date IS NOT NULL` (validated) | 95% |
| PCV 3 doses | `pcv_3_date IS NOT NULL` (validated) | 95% |
| OPV 3 doses | `opv_3_date IS NOT NULL` (validated) | 95% |
| IPV | `ipv_date IS NOT NULL` (validated) | 95% |
| MCV at 9 months | `mcv1_date IS NOT NULL` (validated) | 95% |
| MCV at 12–15 months | `mcv2_date IS NOT NULL` (validated) | 95% |
| FIC (Fully Immunized Child) | `immunization_records.fic = true` | 95% |
| PSAC deworming coverage | `deworming_records` where age 1–4, dose 1+2 | Coverage target |
| SAC deworming coverage | `deworming_records` where age 5–9, dose 1+2 | Coverage target |
