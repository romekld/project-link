# NCD Check-in — Entry (Clinical)

**Role:** bhw
**Purpose:** Records blood pressure (dual readings), anthropometrics, and PhilPEN lifestyle risk screening for adults ≥20 years old during BHW home visits or purok outreach. BHW captures vitals and lifestyle risk data; Midwife completes CVD risk stratification and clinical assessment on the same record. When VALIDATED, feeds the NCD TCL Part 1 (Adults 20+) and contributes to FHSIS NCD coverage indicators.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 6 — Non-Communicable Disease Prevention and Control Services (PDF pages 333–368, doc pages 319–354). DOH Form: PhilPEN CVD/NCD Risk Assessment Form (Sections 2 and 3 captured by BHW).
**Who fills it:** BHW (captures Sections 2–3: vitals, anthropometrics, PhilPEN lifestyle risk screening, and initial hypertension/diabetes history)
**Who reviews/approves it:** Midwife (validates via Validation Queue; completes CVD risk stratification, Section 6 — WHO/ISH risk charts, and cancer screening sections that are beyond BHW scope)
**Frequency:** Annual risk assessment for all adults ≥20; more frequent follow-up for newly identified hypertensives/diabetics per Midwife or Doctor orders.
**Storage location:** `ncd_assessments` table (one row per assessment visit); parent: `patients` table.

---

## Required Fields

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `patient_id` | UUID | FK to `patients`. Required. Patient must be ≥20 years old. Age computed from `patients.date_of_birth` — form unavailable if <20. | |
| `assessment_date` | DATE | Required. Format: `YYYY-MM-DD`. Cannot be a future date. | |
| `health_station_id` | UUID | FK to `health_stations`. Set from BHW JWT; never editable. | |
| `provider_id` | UUID | FK to `user_profiles`. Set from BHW JWT; never editable. | |
| `record_status` | ENUM | `PENDING_SYNC` → `PENDING_VALIDATION` → `VALIDATED` / `RETURNED`. | Digital Validation Gate. |
| `systolic_bp_1` | INTEGER | mmHg. Range: 60–250. Required. First BP reading. | Two separate readings taken for diagnostic accuracy. Inline validation: "Systolic BP must be 60–250 mmHg." Paper form: "BP" shown as "120/80" — normalized into four integer columns. |
| `diastolic_bp_1` | INTEGER | mmHg. Range: 40–150. Required. First BP reading. | Inline validation: "Diastolic BP must be 40–150 mmHg." |
| `systolic_bp_2` | INTEGER | mmHg. Range: 60–250. Required. Second reading (after 5-minute rest). | |
| `diastolic_bp_2` | INTEGER | mmHg. Range: 40–150. Required. Second reading. | |
| `systolic_bp_avg` | INTEGER (computed) | Auto-computed: `ROUND((systolic_bp_1 + systolic_bp_2) / 2)`. Display only. | High-risk flag threshold: ≥140 mmHg. |
| `diastolic_bp_avg` | INTEGER (computed) | Auto-computed: `ROUND((diastolic_bp_1 + diastolic_bp_2) / 2)`. Display only. | High-risk flag threshold: ≥90 mmHg. |
| `weight_kg` | DECIMAL(5,2) | kg. Range: 20–300. Required. | |
| `height_cm` | DECIMAL(5,1) | cm. Range: 100–250. Required. | |
| `bmi` | DECIMAL(4,1) (computed) | `weight_kg / (height_m)²`. Display only. Do NOT allow manual override. | Inline label: "BMI is auto-calculated — do not edit directly." |
| `risk_smoker` | BOOLEAN | Required. | PhilPEN lifestyle risk factor 1. "Is the patient a current smoker? (Smoked any tobacco in the last 30 days)." Yes / No. |
| `risk_alcohol` | BOOLEAN | Required. | PhilPEN lifestyle risk factor 2. "Does the patient use alcohol harmfully? (≥4 drinks/day for males, ≥2 drinks/day for females, or binge drinking)." Yes / No. |
| `risk_inactive` | BOOLEAN | Required. | PhilPEN lifestyle risk factor 3. "Is the patient physically inactive? (Less than 150 minutes/week of moderate-intensity activity)." Yes / No. |
| `risk_diet` | BOOLEAN | Required. | PhilPEN lifestyle risk factor 4. "Does the patient have an unhealthy diet? (Low fruit/vegetable intake, high salt/fat/sugar)." Yes / No. |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| `waist_circumference_cm` | DECIMAL(4,1) | Optional at BHW level; encouraged if measuring tape available. | Risk flag: ≥90 cm (Male), ≥80 cm (Female). Asia-Pacific standard. |
| `heart_rate` | INTEGER | Optional. Range: 40–200 bpm. | |
| `temperature_c` | DECIMAL(4,2) | Optional. Range: 35.0–42.0 °C. | |
| `previously_known_hypertensive` | BOOLEAN | Always shown. | "Has this patient been previously diagnosed with hypertension?" Yes / No. Self-reported. |
| `currently_on_antihypertensive` | BOOLEAN | Shown when `previously_known_hypertensive = true`. | Yes / No. |
| `current_antihypertensive_meds` | TEXT | Shown when `currently_on_antihypertensive = true`. | Drug name, dose, frequency. Free text. |
| `previously_known_diabetic` | BOOLEAN | Always shown. | "Has this patient been previously diagnosed with Type 2 Diabetes Mellitus?" Yes / No. |
| `currently_on_antidiabetic` | BOOLEAN | Shown when `previously_known_diabetic = true`. | Yes / No. |
| `current_antidiabetic_meds` | TEXT | Shown when `currently_on_antidiabetic = true`. | Drug name, dose, frequency. Free text. |
| `fbs_mg_dl` | DECIMAL(6,2) | Optional. Shown when BHW has FBS results (e.g., from a prior clinic visit or on-site glucometer). | mg/dL. Fasting ≥8 hours required. Diabetes threshold: ≥126 mg/dL. Pre-diabetes: 100–125 mg/dL. See Open Questions — confirm if BHW has glucometer training. |
| `rbs_mg_dl` | DECIMAL(6,2) | Shown when FBS unavailable and random blood sugar was done. | mg/dL. Diabetes: ≥200 mg/dL with symptoms. |
| `newly_identified_hypertensive` | BOOLEAN (computed) | Auto-set on save. | Trigger: `systolic_bp_avg ≥ 140` OR `diastolic_bp_avg ≥ 90` AND `previously_known_hypertensive = false`. FHSIS NCD indicator numerator. |
| `newly_identified_diabetic` | BOOLEAN (computed) | Auto-set on save when FBS is entered. | Trigger: `fbs_mg_dl ≥ 126` AND `previously_known_diabetic = false`. FHSIS NCD indicator numerator. |
| `is_high_risk` | BOOLEAN (computed) | Auto-set on save. | Trigger: `systolic_bp_avg ≥ 140` OR `diastolic_bp_avg ≥ 90` OR `fbs_mg_dl ≥ 126`. Persistent badge in patient list views. |
| `high_risk_reason` | TEXT[] (computed) | Auto-populated when `is_high_risk = true`. | Array. E.g., `['BP ≥ 140/90 — Hypertension risk', 'FBS ≥ 126 mg/dL — Diabetes risk']`. |
| `risk_factor_count` | INTEGER (computed) | Sum of the 4 lifestyle boolean flags. | Auto-computed: `risk_smoker + risk_alcohol + risk_inactive + risk_diet`. Range: 0–4. |
| `referral_required` | BOOLEAN | Any visit. Mandatory if `newly_identified_hypertensive = true` or `newly_identified_diabetic = true`. | Yes / No. |
| `referral_destination` | TEXT | When `referral_required = true`. | RHU/MHC/hospital name. |
| `clinical_notes` | TEXT | Any visit. | Additional observations or counseling topics covered. |
| `next_assessment_date` | DATE | Optional. | Scheduled follow-up date. Annual for low-risk; sooner for newly identified HTN/DM. |

---

## Enums / Controlled Vocabularies

- `record_status`: `PENDING_SYNC` / `PENDING_VALIDATION` / `VALIDATED` / `RETURNED`

> Note: All other fields in this form use BOOLEAN or numeric types. The PhilPEN lifestyle risk factors are four independent booleans, not a single enum — each is a separate Yes/No clinical question.

---

## UX / Clinical Safety Concerns

- **Dual-reading BP (clinical requirement):** The form must enforce two separate BP readings with a 5-minute rest between them. Implement as a two-step flow: "Reading 1" input → acknowledgment button "5-minute rest completed" → "Reading 2" input. Average is auto-computed and displayed immediately. Do not allow Reading 2 before Reading 1 is entered.
- **High-risk immediate visual alert:** When `systolic_bp_avg ≥ 140` OR `diastolic_bp_avg ≥ 90` is computed from the two readings, immediately display a persistent red high-risk badge: "Blood pressure elevated — Hypertension risk. Refer to BHS/RHU." Do not wait for Midwife validation to show this alert to the BHW.
- **Newly identified hypertensive/diabetic confirmation gate:** When `newly_identified_hypertensive = true` or `newly_identified_diabetic = true` is computed, show a confirmation dialog before submission: "This patient has been newly identified as [hypertensive / diabetic]. This record will be submitted for Midwife validation. Confirm?" The BHW must acknowledge before submission.
- **BMI read-only with inline note:** BMI is computed from weight and height. Display clearly labeled "Calculated BMI: [value]" with the note "BMI is auto-calculated — do not edit directly." Never render BMI as an editable input field.
- **Age gate:** If the patient is under 20 years old (computed from `patients.date_of_birth`), the NCD Check-in service must be unavailable. Show: "NCD assessment is for patients aged 20 and above. This patient is [age]."
- **BHW scope boundary — CVD risk classification:** The BHW NCD Check-in form captures Sections 2 (vitals), 3 (PhilPEN lifestyle), and the self-reported hypertension/diabetes history only. CVD risk stratification (WHO/ISH risk charts — requires age, sex, BP, smoking, diabetes inputs) and cancer screenings (VIA/Pap smear, CBE, visual acuity) are completed by the Midwife/Doctor on the same `ncd_assessments` record. The BHW form must NOT include a CVD risk level classification field — that field is only visible in the Midwife's view.
- **Progressive form save:** Auto-save to Dexie.js on every field change. NCD assessment forms are long and may be interrupted.
- **Offline-first:** Full BHW-scope section available offline. BP averages and BMI computed locally. PhilPEN lifestyle toggles bundled in PWA — no connectivity needed.
- **Touch targets:** 44×44px minimum. BP fields use numeric keyboard (integers). Weight and height fields use numeric keyboard with decimal. PhilPEN lifestyle risk toggles use large Yes/No button pairs — not small checkboxes.
- **Persistent high-risk badge:** `is_high_risk = true` records display a persistent badge in the patient list view AND NCD ITR tab. Badge must survive pagination.
- **Pre-population:** `patient_id`, `health_station_id`, `nhts_status`, patient age auto-populated from patient record context.

---

## Database Schema Notes

- **Table:** `ncd_assessments` — one row per NCD assessment visit. FK to `patient_id`.
- **FK:** `ncd_assessments.patient_id` → `patients`. `ncd_assessments.provider_id` → `user_profiles`.
- **record_status:** `ncd_assessments.record_status ENUM('PENDING_SYNC','PENDING_VALIDATION','VALIDATED','RETURNED')`.
- **Dual BP readings:** Store `systolic_bp_1`, `diastolic_bp_1`, `systolic_bp_2`, `diastolic_bp_2`, `systolic_bp_avg`, `diastolic_bp_avg` as separate INTEGER columns. Never store BP as a "120/80" string.
- **BMI:** Computed field. `bmi DECIMAL(4,1)` — recomputed from `weight_kg` and `height_cm` on every save. Never store from user input.
- **High-risk flags:** `is_high_risk BOOLEAN NOT NULL DEFAULT FALSE` + `high_risk_reason TEXT[]`. Computed server-side on every save. Never set by client directly.
- **FHSIS indicator columns:** `newly_identified_hypertensive BOOLEAN NOT NULL DEFAULT FALSE` + `newly_identified_diabetic BOOLEAN NOT NULL DEFAULT FALSE`. Computed on save. Used as numerators in FHSIS NCD coverage indicators for the Summary Table and MCT.
- **Risk factor count:** `risk_factor_count INTEGER` — `risk_smoker::int + risk_alcohol::int + risk_inactive::int + risk_diet::int`. Computed on save or via generated column.
- **Soft delete:** `ncd_assessments.deleted_at TIMESTAMPTZ`. All reads: `WHERE deleted_at IS NULL`. RA 10173 — no hard deletes.
- **NHTS propagation:** `ncd_assessments.nhts_status` inherited from `patients.nhts_status`. Set on INSERT.
- **Indexes:** `ncd_assessments(patient_id, assessment_date)`, `ncd_assessments(is_high_risk)`, `ncd_assessments(newly_identified_hypertensive)`, `ncd_assessments(newly_identified_diabetic)`, `ncd_assessments(record_status)`.
- **Multi-role record:** The same `ncd_assessments` row is partially filled by the BHW (vitals + lifestyle) and completed by the Midwife (CVD risk classification, cancer screening). The Midwife-only fields must be NULL when the record is first submitted by the BHW and filled in during the Midwife's validation/completion workflow.

---

## Reports and Exports

This form feeds the following FHSIS indicators (via NCD TCL Part 1 → Summary Table → MCT → M1 Report):

| Indicator | Source Field | Target |
|:----------|:-------------|:-------|
| Adults ≥20 risk-assessed (PhilPEN) | `assessment_date IS NOT NULL` (validated) | Coverage target |
| Newly identified hypertensives | `newly_identified_hypertensive = true` (validated) | N/A (count) |
| Newly identified diabetics | `newly_identified_diabetic = true` (validated) | N/A (count) |
| Current smokers identified | `risk_smoker = true` (validated) | N/A (count) |
| Harmful alcohol use identified | `risk_alcohol = true` (validated) | N/A (count) |
