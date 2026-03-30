# Child Nutrition Assessment — Entry (Clinical)

**Role:** bhw
**Purpose:** Records anthropometric measurements (weight, height/length, MUAC), Vitamin A supplementation, and MNP distribution for children 0–59 months. Auto-computes WHO Z-scores and nutritional status classifications. When VALIDATED, feeds the Child Care TCL Part 1 (infants 0–11 months) and Part 2 (12–59 months) nutritional status columns and contributes to FHSIS nutrition indicators.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 4.3 — Child Care and Services, Nutrition Section (PDF pages 183–254, doc pages 169–240). DOH Form: ITR for Children and Other Adults (anthropometric/nutrition section).
**Who fills it:** BHW (anthropometric measurement, Vitamin A distribution, MNP distribution, breastfeeding counseling during home visits and community nutrition sessions)
**Who reviews/approves it:** Midwife (validates via Validation Queue; VALIDATED records update TCL nutritional status columns and trigger SAM/MAM case management)
**Frequency:** Monthly for at-risk children (SAM/MAM); every 6 months for routine Vitamin A and deworming; per visit for all nutritional monitoring encounters.
**Storage location:** `nutrition_records` table (one row per nutrition visit); parent: `patients` table.

---

## Required Fields

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `patient_id` | UUID | FK to `patients`. Required. Child patient (must be 0–59 months for most indicators). | Age computed from `patients.date_of_birth`. |
| `visit_date` | DATE | Required. Format: `YYYY-MM-DD`. Cannot be a future date. | |
| `weight_kg` | DECIMAL(4,2) | kg. Range: 1.0–50.0. Precision: 0.1 kg. Required. | Measured using calibrated hanging scale or infant/platform scale. |
| `health_station_id` | UUID | FK to `health_stations`. Set from BHW JWT. | |
| `provider_id` | UUID | FK to `user_profiles`. Set from BHW JWT. | |
| `record_status` | ENUM | `PENDING_SYNC` → `PENDING_VALIDATION` → `VALIDATED` / `RETURNED`. | Digital Validation Gate. |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `height_cm` | DECIMAL(5,1) | Required for children ≥6 months; encouraged for younger. Range: 30.0–150.0 cm. Precision: 0.1 cm. | Must be measured — not estimated. |
| `measurement_method` | ENUM | Required when `height_cm` is entered. | `Length (lying)` for children <2 years / `Height (standing)` for ≥2 years. Affects z-score calculation. If a child <2 years has a standing height recorded, system adds 0.7 cm before lookup. If ≥2 years has lying length, system subtracts 0.7 cm. |
| `muac_cm` | DECIMAL(4,1) | Required for children 6–59 months and pregnant women. Range: 7.0–30.0 cm. | Mid-upper arm circumference. Measured using MUAC tape (color-coded). Classification computed server-side. |
| `bilateral_edema` | BOOLEAN | Shown for all ages. Default: false. | "Does the child have swelling of both feet (bilateral pitting edema)?" If Yes = SAM by definition regardless of z-score. High-risk flag. |
| `age_in_months` | INTEGER (computed) | Always computed from `patients.date_of_birth`. Display only. | Never entered manually. Drives z-score table lookups and age-appropriate range validations. |
| `wfa_zscore` | DECIMAL(4,2) (computed) | Auto-computed from `weight_kg`, `age_in_months`, `patients.sex_at_birth` using WHO 2006 growth standards. | Weight-for-Age Z-score. Never entered manually. |
| `wfa_classification` | ENUM (computed) | Derived from `wfa_zscore`. | `Normal (≥−2)` / `Underweight (<−2 to ≥−3)` / `Severely Underweight (<−3)`. |
| `wfh_zscore` | DECIMAL(4,2) (computed) | Auto-computed from `weight_kg`, `height_cm`, `measurement_method`, `patients.sex_at_birth`. | Weight-for-Height/Length Z-score. Primary wasting indicator per FHSIS. |
| `wfh_classification` | ENUM (computed) | Derived from `wfh_zscore` and `bilateral_edema`. | `Normal (≥−2)` / `MAM — Moderate Acute Malnutrition (<−2 to ≥−3)` / `SAM — Severe Acute Malnutrition (<−3 or bilateral edema)`. |
| `haz_zscore` | DECIMAL(4,2) (computed) | Auto-computed from `height_cm`, `age_in_months`, `measurement_method`, `patients.sex_at_birth`. | Height-for-Age Z-score. Stunting indicator. |
| `haz_classification` | ENUM (computed) | Derived from `haz_zscore`. | `Normal (≥−2)` / `Stunted (<−2 to ≥−3)` / `Severely Stunted (<−3)`. |
| `muac_classification` | ENUM (computed) | Computed from `muac_cm` for ages 6–59 months. | `Green — Normal (≥12.5 cm)` / `Yellow — MAM (11.5–<12.5 cm)` / `Red — SAM (<11.5 cm)`. |
| `is_high_risk` | BOOLEAN (computed) | Auto-set on save. Not editable by BHW. | Trigger: `wfh_zscore < −3` OR `bilateral_edema = true` OR `muac_cm < 11.5`. Persistent badge in patient list views. |
| `high_risk_reason` | TEXT[] (computed) | When `is_high_risk = true`. | Array of triggered reasons. E.g., `['SAM — severe wasting (WHZ < −3)', 'Bilateral pitting edema present']`. |
| `nutrition_status` | ENUM (computed) | Derived from `wfh_classification` and `bilateral_edema`. | `normal` / `mam` / `sam`. Summary column for fast TCL aggregation. |
| `vita_given` | BOOLEAN | Children 6–59 months. | Yes / No. |
| `vita_dose_iu` | ENUM | When `vita_given = true`. Required. | `50,000 IU` (<6 months, sick child only) / `100,000 IU` (6–11 months) / `200,000 IU` (12–59 months). |
| `vita_date_given` | DATE | When `vita_given = true`. Required. | System shows next Vitamin A due date for the child (6 months from prior dose). |
| `mnp_sachets_given` | INTEGER | Children 6–23 months. Range: 0–60. | Number of MNP (Micronutrient Powder) sachets distributed this visit. |
| `mnp_date_given` | DATE | When `mnp_sachets_given > 0`. Required. | |
| `breastfeeding_status` | ENUM | Children 0–23 months. | `Exclusive` / `Mixed` / `Formula Only` / `Stopped`. Required for EBF indicator (FHSIS). |
| `exclusive_bf_achieved` | BOOLEAN (computed) | For children 0–5 months with `breastfeeding_status = Exclusive`. | FHSIS EBF indicator. Computed; not directly entered. |
| `iycf_counseling_given` | BOOLEAN | Any visit. | Yes / No. BHW provided infant and young child feeding counseling. |
| `complementary_feeding_started` | BOOLEAN | Children ≥6 months. | Yes / No. |
| `complementary_feeding_start_date` | DATE | When `complementary_feeding_started = true`. | |
| `lbw_iron_supplementation_given` | BOOLEAN | Low birth weight infants, ages 1–3 months. Shown when `patients.birth_weight_grams < 2500`. | LBW iron supplementation. FHSIS indicator: LBW infants given iron at 1–3 months. |
| `lbw_iron_completed` | BOOLEAN | When LBW iron supplementation is tracked through 3 months. | FHSIS indicator numerator. |
| `referral_required` | BOOLEAN | Any visit. Required if `is_high_risk = true` (SAM detected). | If SAM, block submission without referral destination filled. |
| `referral_destination` | TEXT | When `referral_required = true`. | RHU/MHC/hospital name. |
| `clinical_notes` | TEXT | Any visit. | Additional observations. |

---

## Enums / Controlled Vocabularies

- `measurement_method`: `Length (lying)` / `Height (standing)`
- `wfa_classification`: `Normal (≥−2)` / `Underweight (<−2 to ≥−3)` / `Severely Underweight (<−3)`
- `wfh_classification`: `Normal (≥−2)` / `MAM — Moderate Acute Malnutrition (<−2 to ≥−3)` / `SAM — Severe Acute Malnutrition (<−3 or bilateral edema)`
- `haz_classification`: `Normal (≥−2)` / `Stunted (<−2 to ≥−3)` / `Severely Stunted (<−3)`
- `muac_classification`: `Green — Normal (≥12.5 cm)` / `Yellow — MAM (11.5–<12.5 cm)` / `Red — SAM (<11.5 cm)`
- `vita_dose_iu`: `50,000 IU` / `100,000 IU` / `200,000 IU`
- `breastfeeding_status`: `Exclusive` / `Mixed` / `Formula Only` / `Stopped`
- `nutrition_status` (summary): `normal` / `mam` / `sam`
- `record_status`: `PENDING_SYNC` / `PENDING_VALIDATION` / `VALIDATED` / `RETURNED`

---

## UX / Clinical Safety Concerns

- **Z-score computation offline (critical):** Z-scores (WAZ, HAZ, WHZ) must be computed client-side in the PWA using bundled WHO 2006 growth standard lookup tables. Do NOT require internet connectivity for z-score calculation. The WHO standards are a static dataset that can be bundled in the PWA service worker cache. Server recomputes on sync as authoritative values.
- **Measurement method toggle (affects z-scores):** The `measurement_method` ENUM must be selected before height entry. Show a prominent, labeled toggle. Apply the 0.7 cm correction automatically:
  - Child <2 years + standing height entered → add 0.7 cm before z-score lookup.
  - Child ≥2 years + lying length entered → subtract 0.7 cm before lookup.
  Show a note: "For children under 2 years, measure lying (length). For 2 years and older, measure standing (height)."
- **SAM = immediate in-field alert:** When `wfh_zscore < −3` OR `bilateral_edema = true` OR `muac_cm < 11.5` is detected, immediately display a bold red alert BEFORE form submission: "SEVERE ACUTE MALNUTRITION DETECTED. This child requires urgent referral. Please fill in the referral destination before submitting." Do not wait for Midwife validation to alert the BHW.
- **Referral mandatory for SAM:** If `is_high_risk = true` (SAM criteria met), block submission without `referral_required = true` AND `referral_destination` filled. Inline: "SAM detected — referral is required. Fill in the referral destination to continue."
- **MUAC required prompt:** If a child is 6–59 months and `muac_cm` is left empty, show inline: "MUAC is required for children 6–59 months."
- **Vitamin A distribution calendar:** After Vitamin A is recorded, show the child's next due date (6 months from today for 12–59 month group; February/August national schedule). Highlight as overdue if the child's last dose was >6 months ago.
- **Consecutive worsening trend alert:** If this visit's z-score is worse than the previous 2 recorded visits (consecutive worsening trend), show inline before submission: "Note: Nutritional status has worsened over 3 consecutive visits. Confirm referral if SAM criteria are approaching." This runs from locally cached records in Dexie.js.
- **Progressive form save:** Auto-save to Dexie.js on every field change. BHW may be interrupted mid-measurement session.
- **Offline-first:** Full form available offline. Z-score lookup tables bundled in PWA. MUAC classification thresholds (11.5 cm, 12.5 cm) hardcoded in PWA logic.
- **Touch targets:** 44×44px minimum. Weight and height fields use numeric keyboard. Bilateral edema toggle uses a large Yes/No button pair.
- **Pre-population:** `patient_id`, `age_in_months`, `patients.sex_at_birth`, `health_station_id`, `nhts_status` pre-populated from patient record context.
- **SAM/MAM badge persistence:** `is_high_risk = true` records display a persistent badge in the patient list view AND across all ITR tabs. Badge must survive list pagination.

---

## Database Schema Notes

- **Table:** `nutrition_records` — one row per nutrition visit. FK to `patient_id`.
- **FK:** `nutrition_records.patient_id` → `patients`. `nutrition_records.provider_id` → `user_profiles`.
- **record_status:** `nutrition_records.record_status ENUM('PENDING_SYNC','PENDING_VALIDATION','VALIDATED','RETURNED')`.
- **Z-score computation authority:** Z-scores are computed server-side on save/validation using WHO 2006 LMS parameters (L, M, S method). Client-side computation is for offline display only; server values are authoritative. Never store z-scores from raw user input.
- **`nutrition_status` summary:** `nutrition_records.nutrition_status ENUM('normal','mam','sam') NOT NULL` — computed from `wfh_classification` and `bilateral_edema`. Used for fast TCL queries and aggregation.
- **High-risk flags:** `nutrition_records.is_high_risk BOOLEAN NOT NULL DEFAULT FALSE` + `nutrition_records.high_risk_reason TEXT[]`. Computed server-side on every save. Never set by client directly.
- **Vitamin A tracking:** `vita_given`, `vita_dose_iu`, `vita_date_given` on `nutrition_records`. Application layer enforces bi-annual schedule for 12–59 months (February + August). System calculates next due date.
- **Soft delete:** `nutrition_records.deleted_at TIMESTAMPTZ`. All reads: `WHERE deleted_at IS NULL`. RA 10173 — no hard deletes.
- **NHTS propagation:** `nutrition_records.nhts_status` inherited from `patients.nhts_status`. Set on INSERT.
- **Indexes:** `nutrition_records(patient_id, visit_date)`, `nutrition_records(nutrition_status)`, `nutrition_records(is_high_risk)`, `nutrition_records(record_status)`.
- **WHO growth standard bundle:** A static PostgreSQL lookup table (or server-side library) must store the WHO 2006 LMS parameters for WAZ, HAZ, WHZ by age in months and sex. Client PWA bundle must include the same dataset for offline computation.

---

## Reports and Exports

This form feeds the following FHSIS indicators (via Child Care TCL → Summary Table → MCT → M1/A1 Reports):

| Indicator | Source Field | Target |
|:----------|:-------------|:-------|
| Vitamin A (6–11 months) | `vita_given = true` AND `vita_dose_iu = 100,000 IU` (validated) | 95% |
| Vitamin A (12–59 months, 2 doses) | 2nd dose `vita_date_given IS NOT NULL` (validated) | 95% |
| Exclusive breastfeeding (0–5 months) | `exclusive_bf_achieved = true` (validated) | Target |
| LBW infants given iron (1–3 months) | `lbw_iron_completed = true` (validated) | 95% |
| Nutritional status (Normal/MAM/SAM) | `nutrition_status` (validated) | Disaggregated count |
| MNP distribution (6–23 months) | `mnp_sachets_given > 0` (validated) | Coverage target |
