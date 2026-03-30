# NCD TCL (Adults 20+) — TCL / Registry

**Role:** Midwife (RHM)
**Purpose:** Target Client List for all adults aged 20 and above in the BHS catchment area. Tracks PhilPEN CVD/NCD risk assessment, hypertension screening, Type 2 Diabetes screening, cervical and breast cancer screening (women), and senior citizen services (visual acuity, PPV/influenza vaccination). First inclusion in FHSIS 2018 revision.
**FHSIS Reference:** FHSIS MOP 2018, Chapter 6 — Non-Communicable Disease Prevention and Control Services (PDF pages 333-368, doc pages 319-354)
**Who fills it:** Auto-populated from validated NCD assessment ITR records. BHW captures vitals and lifestyle screening; Midwife completes PhilPEN assessment and cancer screening.
**Who reviews/approves it:** Midwife manages the TCL; PHN reviews during MCT consolidation.
**Frequency:** Annual risk assessment per client; more frequent follow-up for newly identified HPN/DM. TCL updated as encounters are validated.
**Storage location:** `ncd_assessments` table, `cervical_screenings` table; TCL is a computed view

---

## Required Fields

Each row represents one adult (20+ years) client.

### Patient Identity Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `patient_id` | UUID | FK to `patients`. Required. | |
| `patient_last_name` | String | From `patients` | |
| `patient_first_name` | String | From `patients` | |
| `family_serial_number` | String | FK to `households` | |
| `date_of_birth` | Date | Required. Must compute age >= 20. | |
| `age` | Integer | Auto-computed from DOB | |
| `sex` | Enum | `Male` / `Female` | Sex-specific indicators (cervical, breast) |
| `nhts_status` | Enum | `NHTS` / `Non-NHTS` | FHSIS disaggregation |
| `health_station_id` | UUID | FK to `health_stations` | RLS scope |

### PhilPEN Lifestyle Risk Assessment Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `assessment_date` | Date | Date of most recent PhilPEN assessment | |
| `risk_smoker` | Boolean | Current smoker (smoked in last 30 days) | |
| `risk_alcohol` | Boolean | Harmful alcohol use (>= 4 drinks/day M, >= 2 F) | |
| `risk_inactive` | Boolean | < 150 min/week moderate-intensity activity | |
| `risk_diet` | Boolean | Low fruit/veg, high salt/fat/sugar | |
| `risk_factor_count` | Integer | Auto-computed: sum of 4 lifestyle flags | 0-4 |

### Hypertension Screening Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `previously_known_hypertensive` | Boolean | Self-reported or from records | |
| `bp_reading1_systolic` | Integer (mmHg) | Range: 60-250 | First measurement |
| `bp_reading1_diastolic` | Integer (mmHg) | Range: 30-150 | |
| `bp_reading2_systolic` | Integer (mmHg) | After 5 minutes rest | Second measurement |
| `bp_reading2_diastolic` | Integer (mmHg) | | |
| `avg_bp_systolic` | Integer | Auto-computed: average of 2 readings | |
| `avg_bp_diastolic` | Integer | Auto-computed | |
| `newly_identified_hypertensive` | Boolean | Auto-computed: avg BP >= 140/90 AND NOT previously known | FHSIS indicator |
| `hypertensive_flag` | Boolean | Previously known OR newly identified | |

### Type 2 Diabetes Screening Columns

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `previously_known_diabetic` | Boolean | Self-reported or from records | |
| `fbs_mg_dl` | Decimal | Fasting blood sugar. Diabetes: >= 126 mg/dL | |
| `rbs_mg_dl` | Decimal | Random blood sugar. If FBS unavailable. Diabetes: >= 200 with symptoms. | |
| `newly_identified_diabetic` | Boolean | Auto-computed: FBS >= 126 AND NOT previously known | FHSIS indicator |
| `pre_diabetic_flag` | Boolean | FBS 100-125 mg/dL | |

### CVD Risk Stratification

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `cvd_risk_level` | Enum | `Low`, `Moderate`, `High`, `Very High` | WHO/ISH risk charts |

### Cervical Cancer Screening (Women 20+)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `cervical_screening_date` | Date | | FHSIS indicator |
| `cervical_screening_method` | Enum | `VIA` / `Pap Smear` | |
| `cervical_screening_result` | Enum | `Negative`, `Positive`, `Suspected Cancer` | |
| `cervical_referral` | Boolean | Mandatory if positive | |

### Breast Examination (Women 20+)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `cbe_done` | Boolean | Clinical Breast Examination performed | |
| `cbe_date` | Date | | |
| `breast_mass_found` | Boolean | High-risk flag if Yes | |
| `breast_referral` | Boolean | Mandatory if any positive finding | |

### Senior Citizen Services (60+)

| Field Name | Data Type | Constraints / Validation Rules | Notes |
|:-----------|:----------|:-------------------------------|:------|
| `va_screening_done` | Boolean | Visual acuity screening | FHSIS indicator |
| `va_right_eye` | String | Snellen fraction (e.g., `20/40`) | |
| `va_left_eye` | String | Snellen fraction | |
| `va_referral` | Boolean | Trigger: VA <= 20/40 | |
| `ppv_date` | Date | Pneumococcal vaccine | FHSIS indicator |
| `influenza_date` | Date | Annual influenza vaccine | FHSIS indicator |

---

## Optional / Conditional Fields

| Field Name | Data Type | Condition for Display | Notes |
|:-----------|:----------|:----------------------|:------|
| Cervical screening section | Multiple | Only for Female patients | Sex-specific |
| Breast examination section | Multiple | Only for Female patients | Sex-specific |
| Senior citizen section | Multiple | Only for patients age >= 60 | Age-specific |
| `rbs_mg_dl` | Decimal | Only if FBS not available | Alternative test |
| `cervical_referral` | Boolean | Only if screening result is Positive/Suspected Cancer | Auto-required |
| `breast_referral` | Boolean | Only if any positive finding | Auto-required |

---

## Enums / Controlled Vocabularies

| Enum | Values |
|:-----|:-------|
| `cvd_risk_level` | `Low`, `Moderate`, `High`, `Very High` |
| `cervical_screening_method` | `VIA`, `Pap Smear` |
| `cervical_screening_result` | `Negative`, `Positive`, `Suspected Cancer` |

---

## UX / Clinical Safety Concerns

- **Dual-role form:** BHW captures vitals and lifestyle screening sections; Midwife completes CVD risk classification and cancer screening. Implement as a multi-step form with role-based section visibility.
- **BP measured twice:** Enforce two separate BP readings with a prompt for 5-minute rest interval. Average is auto-computed.
- **Newly identified HPN/DM confirmation gate:** When the system auto-flags a newly identified hypertensive or diabetic, require explicit confirmation dialog before saving. This is a significant clinical classification.
- **High-risk badges:** Persistent for: newly identified HPN, newly identified DM, positive cervical screening, suspicious breast mass. Visible in list views.
- **Mandatory referral enforcement:** Positive VIA/Pap result OR suspicious breast mass → the referral field must be `true` before the form can be saved. System-enforced, not optional.
- **CVD risk chart:** The WHO/ISH risk chart data must be bundled for offline use if PhilPEN assessments are done in the field.
- **Senior citizen section:** Only displayed for patients >= 60 years. Auto-hidden for younger adults.
- **BP trend chart:** Display systolic/diastolic trend over time for clients with multiple assessments.
- **Annual assessment reminder:** Flag clients who haven't been assessed in >12 months.

---

## Database Schema Notes

- **Table:** `ncd_assessments` — one row per annual assessment. FK to `patient_id`, `health_station_id`.
- **Cervical screening:** Separate `cervical_screenings` table or JSONB column. FK to `patient_id`.
- **High-risk flags:** `is_high_risk BOOLEAN` on `ncd_assessments`. Trigger: BP >= 140/90, FBS >= 126, positive cancer screening.
- **NHTS disaggregation:** From `patients.nhts_status`.
- **Record status:** `record_status` on each assessment.
- **Soft delete:** `deleted_at TIMESTAMPTZ`. RA 10173.
- **TCL view:** Database view joining `patients` + latest `ncd_assessments` + `cervical_screenings` filtered by age >= 20 and `health_station_id`.
- **Indexes:** `ncd_assessments(health_station_id)`, `ncd_assessments(patient_id)`.

---

## Reports and Exports

This TCL feeds the following ST indicators:

| Indicator | Numerator | Target |
|:----------|:----------|:-------|
| Adults 20+ risk-assessed (PhilPEN) | `assessment_date IS NOT NULL` | Coverage |
| Newly identified hypertensives | `newly_identified_hypertensive = true` | Count |
| Newly identified diabetics | `newly_identified_diabetic = true` | Count |
| Women screened for cervical cancer | `cervical_screening_date IS NOT NULL` | Coverage |
| Women with suspicious breast mass referred | `breast_referral = true` (when positive) | 100% |
| SC screened for visual acuity | `va_screening_done = true` | Coverage |
| SC given PPV vaccine | `ppv_date IS NOT NULL` | Coverage |
| SC given influenza vaccine | `influenza_date IS NOT NULL` | Coverage |

All disaggregated by sex and NHTS/Non-NHTS.
